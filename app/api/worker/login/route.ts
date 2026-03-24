import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { WorkerModel } from "@/lib/models/Worker";
import { signWorkerToken } from "@/lib/worker-auth";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const worker = await WorkerModel.findOne({ email, isActive: true });
    if (!worker) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, worker.password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = signWorkerToken({
      workerId: worker._id.toString(),
      email: worker.email,
      fullName: worker.fullName,
      category: worker.category,
    });

    const cookieStore = await cookies();
    cookieStore.set("servicehub_worker_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      worker: {
        id: worker._id,
        fullName: worker.fullName,
        email: worker.email,
        category: worker.category,
        rating: worker.rating,
        totalJobs: worker.totalJobs,
      },
    });
  } catch (err) {
    console.error("[worker-login]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
