"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HardHat, LockKeyhole, Eye, EyeOff } from "lucide-react";

export default function WorkerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/worker/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Login failed");
      router.push("/worker/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-4">
      {/* Background decorations */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-amber-200/40 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="rounded-3xl border border-orange-100 bg-white/90 p-8 shadow-2xl shadow-orange-100/60 backdrop-blur">
          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 p-3.5 text-white shadow-lg shadow-orange-300/40">
              <HardHat className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">
                ServiceHub
              </p>
              <h1 className="font-display text-3xl font-black text-slate-900">
                Worker Portal
              </h1>
            </div>
          </div>

          <p className="mb-6 text-sm text-slate-500">
            Sign in to manage your bookings and track your jobs.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-orange-400 focus-within:bg-white">
              <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="worker@servicehub.com"
                className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                required
              />
            </div>

            {/* Password */}
            <div className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-orange-400 focus-within:bg-white">
              <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                Password
              </label>
              <div className="flex items-center gap-2">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:from-orange-600 hover:to-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LockKeyhole className="h-4 w-4" />
              {loading ? "Signing in..." : "Sign In as Worker"}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm">
            <Link href="/" className="text-slate-500 hover:text-slate-800 transition">
              ← Back to Home
            </Link>
            <Link
              href="/worker/signup"
              className="font-bold text-orange-600 hover:text-orange-700 transition"
            >
              Register as Worker
            </Link>
          </div>
        </div>

        {/* Admin link */}
        <p className="mt-4 text-center text-xs text-slate-400">
          Are you an admin?{" "}
          <Link href="/admin/login" className="font-semibold text-indigo-600 hover:underline">
            Admin Login
          </Link>
        </p>
      </div>
    </main>
  );
}
