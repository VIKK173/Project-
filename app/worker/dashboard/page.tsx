import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import { ensureDatabaseCollections } from "@/lib/models/init";
import { getAuthenticatedWorker } from "@/lib/worker-auth";
import { BookingModel } from "@/lib/models/Booking";
import WorkerDashboardClient from "./WorkerDashboardClient";

export const dynamic = "force-dynamic";

export default async function WorkerDashboardPage() {
  await connectToDatabase();
  await ensureDatabaseCollections();

  const worker = await getAuthenticatedWorker();
  if (!worker) redirect("/worker/login");

  const rawBookings = await BookingModel.find({ workerId: worker._id })
    .populate("serviceId", "name category")
    .sort({ createdAt: -1 })
    .lean();

  // Serialize for client
  const bookings = rawBookings.map((b: any) => ({
    _id: b._id.toString(),
    status: b.status,
    paymentStatus: b.paymentStatus,
    amount: b.amount,
    bookingDate: b.bookingDate?.toISOString() ?? null,
    completedAt: b.completedAt?.toISOString() ?? null,
    createdAt: b.createdAt?.toISOString() ?? null,
    notes: b.notes ?? "",
    address: b.address ?? {},
    service: b.serviceId
      ? { name: (b.serviceId as any).name, category: (b.serviceId as any).category }
      : { name: "Service", category: "" },
  }));

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    accepted: bookings.filter((b) => b.status === "accepted").length,
    on_the_way: bookings.filter((b) => b.status === "on_the_way").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    earnings: bookings
      .filter((b) => b.status === "completed")
      .reduce((s, b) => s + (b.amount || 0), 0),
  };

  return (
    <WorkerDashboardClient
      worker={{
        _id: (worker as any)._id?.toString() ?? "",
        fullName: worker.fullName,
        email: worker.email,
        category: worker.category,
        phone: worker.phone,
        rating: worker.rating,
        totalJobs: worker.totalJobs,
        city: worker.city,
        isAvailable: worker.isAvailable,
      }}
      bookings={bookings}
      stats={stats}
    />
  );
}
