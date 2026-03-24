import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { BookingModel } from "@/lib/models/Booking";
import { WorkerModel } from "@/lib/models/Worker";
import { getAuthenticatedWorker } from "@/lib/worker-auth";

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ["accepted", "rejected"],
  accepted: ["on_the_way"],
  on_the_way: ["completed"],
};

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const worker = await getAuthenticatedWorker();
    if (!worker) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId, status } = await req.json();
    if (!bookingId || !status) {
      return NextResponse.json({ error: "bookingId and status are required" }, { status: 400 });
    }

    const booking = await BookingModel.findOne({ _id: bookingId, workerId: worker._id });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const allowed = VALID_TRANSITIONS[booking.status] || [];
    if (!allowed.includes(status)) {
      return NextResponse.json(
        { error: `Cannot transition from '${booking.status}' to '${status}'` },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = { status };
    if (status === "completed") {
      updateData.completedAt = new Date();
      // Increment worker's totalJobs
      await WorkerModel.findByIdAndUpdate(worker._id, { $inc: { totalJobs: 1 } });
    }
    if (status === "rejected") {
      // Remove worker assignment so admin can reassign
      updateData.workerId = null;
      updateData.status = "pending";
    }

    await BookingModel.findByIdAndUpdate(bookingId, updateData);

    return NextResponse.json({ success: true, newStatus: status === "rejected" ? "pending" : status });
  } catch (err) {
    console.error("[worker-booking-update]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
