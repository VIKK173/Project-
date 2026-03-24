import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { WorkerModel } from "@/lib/models/Worker";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();

    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const workers = await WorkerModel.find({ isActive: true })
      .select("fullName email phone category city rating totalJobs isAvailable")
      .sort({ fullName: 1 })
      .lean();

    const serialized = workers.map((w: any) => ({
      _id: w._id.toString(),
      fullName: w.fullName,
      email: w.email,
      phone: w.phone,
      category: w.category,
      city: w.city,
      rating: w.rating,
      totalJobs: w.totalJobs,
      isAvailable: w.isAvailable,
    }));

    return NextResponse.json({ workers: serialized });
  } catch (err) {
    console.error("[admin-workers-get]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
