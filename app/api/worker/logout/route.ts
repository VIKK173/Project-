import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set("servicehub_worker_token", "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });
  return NextResponse.json({ success: true });
}
