import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { WorkerModel } from "@/lib/models/Worker";
import { signWorkerToken } from "@/lib/worker-auth";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { fullName, email, password, phone, category, city, experienceYears } = body;

    if (!fullName || !email || !password || !phone || !category) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const existing = await WorkerModel.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const worker = await WorkerModel.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
      category,
      city: city || "Ranchi",
      experienceYears: experienceYears || 0,
    });

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
      worker: { id: worker._id, fullName: worker.fullName, email: worker.email, category: worker.category },
    });
  } catch (err) {
    console.error("[worker-signup]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
