import { SERVICES, PROS } from "@/lib/data";
import { UserModel } from "@/lib/models/User";
import { WorkerModel } from "@/lib/models/Worker";
import { ServiceModel } from "@/lib/models/Service";
import { BookingModel } from "@/lib/models/Booking";

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export async function seedInitialDataIfEmpty() {
  const [serviceCount, workerCount, userCount, bookingCount] = await Promise.all([
    ServiceModel.countDocuments(),
    WorkerModel.countDocuments(),
    UserModel.countDocuments(),
    BookingModel.countDocuments(),
  ]);

  if (serviceCount === 0) {
    await ServiceModel.insertMany(
      SERVICES.map((service) => ({
        name: service.name,
        slug: toSlug(service.name),
        category: service.cat,
        description: service.desc,
        basePrice: service.subs[0]?.p ?? 299,
        estimatedDurationMinutes: 60,
        isActive: true,
      })),
      { ordered: false },
    );
  }

  if (workerCount === 0) {
    await WorkerModel.insertMany(
      PROS.map((worker) => ({
        fullName: worker.name,
        email: `${toSlug(worker.name)}@servicehub.local`,
        phone: `9${Math.floor(Math.random() * 1000000000).toString().padStart(9, "0")}`,
        category: worker.spec,
        experienceYears: 3,
        rating: Number(worker.rating),
        totalJobs: Number(String(worker.jobs).replace(/,/g, "")) || 0,
        isAvailable: true,
        city: "Ranchi",
      })),
      { ordered: false },
    );
  }

  if (userCount === 0) {
    const users = await UserModel.insertMany([
      {
        fullName: "Anjali Gupta",
        email: "anjali@example.com",
        phone: "9876543210",
        isVerified: true,
        address: { city: "Ranchi", state: "Jharkhand", pincode: "834001" },
      },
      {
        fullName: "Vikram Singh",
        email: "vikram@example.com",
        phone: "9876543211",
        isVerified: true,
        address: { city: "Patna", state: "Bihar", pincode: "800001" },
      },
      {
        fullName: "Meera Nair",
        email: "meera@example.com",
        phone: "9876543212",
        isVerified: true,
        address: { city: "Jamshedpur", state: "Jharkhand", pincode: "831001" },
      },
    ]);

    if (bookingCount === 0) {
      const services = await ServiceModel.find({}, { _id: 1, basePrice: 1 }).limit(4).lean();
      const workers = await WorkerModel.find({}, { _id: 1 }).limit(4).lean();

      if (services.length > 0 && workers.length > 0) {
        const today = new Date();

        await BookingModel.insertMany(
          Array.from({ length: 20 }).map((_, index) => {
            const user = users[index % users.length];
            const service = services[index % services.length];
            const worker = workers[index % workers.length];
            const bookingDate = new Date(today);
            bookingDate.setDate(today.getDate() - (index % 12));
            bookingDate.setHours(10 + (index % 8), 0, 0, 0);

            const isCompleted = index % 4 !== 0;

            return {
              userId: user._id,
              serviceId: service._id,
              workerId: worker._id,
              bookingDate,
              completedAt: isCompleted ? new Date(bookingDate.getTime() + 2 * 60 * 60 * 1000) : null,
              amount: service.basePrice + (index % 5) * 120,
              status: isCompleted ? "completed" : "pending",
              paymentStatus: isCompleted ? "paid" : "pending",
              address: {
                city: "Ranchi",
                state: "Jharkhand",
                pincode: "834001",
              },
              notes: "Auto seeded booking",
            };
          }),
        );
      }
    }
  }
}

