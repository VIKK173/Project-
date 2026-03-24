import { redirect } from "next/navigation";

import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { AdminModel } from "@/lib/models/Admin";
import { ensureDatabaseCollections } from "@/lib/models/init";

import { AdminSignupForm } from "./AdminSignupForm";

export const dynamic = "force-dynamic";

export default async function AdminSignupPage() {
  await connectToDatabase();
  await ensureDatabaseCollections();

  const adminCount = await AdminModel.countDocuments();
  const admin = await getAuthenticatedAdmin();

  if (adminCount > 0 && !admin) {
    redirect("/admin/login");
  }

  return <AdminSignupForm />;
}

