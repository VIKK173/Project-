import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { WorkerModel } from "@/lib/models/Worker";

const WORKER_AUTH_COOKIE = "servicehub_worker_token";
const JWT_EXPIRES_IN = "7d";

function getJwtSecret() {
  const secret = process.env.WORKER_JWT_SECRET || process.env.ADMIN_JWT_SECRET;
  if (!secret) throw new Error("Missing WORKER_JWT_SECRET in .env.local");
  return secret;
}

type WorkerTokenPayload = {
  workerId: string;
  email: string;
  fullName: string;
  category: string;
};

export type AuthenticatedWorker = {
  _id: string;
  fullName: string;
  email: string;
  category: string;
  phone: string;
  isAvailable: boolean;
  rating: number;
  totalJobs: number;
  city: string;
};

export function signWorkerToken(payload: WorkerTokenPayload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
}

export function verifyWorkerToken(token: string) {
  return jwt.verify(token, getJwtSecret()) as WorkerTokenPayload;
}

export async function getAuthenticatedWorker(): Promise<AuthenticatedWorker | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(WORKER_AUTH_COOKIE)?.value;
  if (!token) return null;

  try {
    const decoded = verifyWorkerToken(token);
    const worker = await WorkerModel.findOne({ _id: decoded.workerId, isActive: true })
      .select("fullName email category phone isAvailable rating totalJobs city")
      .lean<AuthenticatedWorker>();
    return worker;
  } catch {
    return null;
  }
}

export function getWorkerAuthCookieName() {
  return WORKER_AUTH_COOKIE;
}
