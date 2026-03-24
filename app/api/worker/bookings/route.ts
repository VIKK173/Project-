import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { BookingModel } from "@/lib/models/Booking";
import { getAuthenticatedWorker } from "@/lib/worker-auth";
import { ensureDatabaseCollections } from "@/lib/models/init";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    await ensureDatabaseCollections();

    const worker = await getAuthenticatedWorker();
    if (!worker) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookings = await BookingModel.find({ workerId: worker._id })
      .populate("serviceId", "name category")
      .populate("userId", "")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ bookings });
  } catch (err) {
    console.error("[worker-bookings-get]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
