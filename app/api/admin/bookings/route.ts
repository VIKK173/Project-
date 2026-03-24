import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { BookingModel } from "@/lib/models/Booking";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { ensureDatabaseCollections } from "@/lib/models/init";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    await ensureDatabaseCollections();

    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const bookings = await BookingModel.find({})
      .populate("serviceId", "name category")
      .populate("workerId", "fullName phone category")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const serialized = bookings.map((b: any) => ({
      _id: b._id.toString(),
      status: b.status,
      paymentStatus: b.paymentStatus,
      amount: b.amount,
      bookingDate: b.bookingDate?.toISOString() ?? null,
      createdAt: b.createdAt?.toISOString() ?? null,
      notes: b.notes ?? "",
      address: b.address ?? {},
      service: b.serviceId
        ? { name: b.serviceId.name, category: b.serviceId.category }
        : { name: "Service", category: "" },
      worker: b.workerId
        ? { _id: b.workerId._id.toString(), fullName: b.workerId.fullName, phone: b.workerId.phone }
        : null,
    }));

    return NextResponse.json({ bookings: serialized });
  } catch (err) {
    console.error("[admin-bookings-get]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
