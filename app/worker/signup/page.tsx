"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HardHat, UserPlus, Eye, EyeOff, Zap, Droplet, Paintbrush, Bug, Wind, Snowflake, Wrench, SprayCan } from "lucide-react";

const CATEGORIES = [
  { name: "Electrician", icon: <Zap className="w-5 h-5" /> },
  { name: "Plumber", icon: <Droplet className="w-5 h-5" /> },
  { name: "Carpenter", icon: <Wrench className="w-5 h-5" /> },
  { name: "Painter", icon: <Paintbrush className="w-5 h-5" /> },
  { name: "Cleaning", icon: <SprayCan className="w-5 h-5" /> },
  { name: "AC Repair", icon: <Snowflake className="w-5 h-5" /> },
  { name: "Pest Control", icon: <Bug className="w-5 h-5" /> },
  { name: "Appliance Repair", icon: <Wind className="w-5 h-5" /> },
];

export default function WorkerSignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    category: "",
    city: "Ranchi",
    experienceYears: "0",
  });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/worker/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, experienceYears: Number(form.experienceYears) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Signup failed");
      router.push("/worker/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400";

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-10 px-4">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-amber-200/40 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="rounded-3xl border border-orange-100 bg-white/90 p-8 shadow-2xl shadow-orange-100/60 backdrop-blur">
          <div className="mb-8 flex items-center gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 p-3.5 text-white shadow-lg shadow-orange-300/40">
              <HardHat className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">
                ServiceHub
              </p>
              <h1 className="font-display text-3xl font-black text-slate-900">
                Join as Worker
              </h1>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-orange-400 focus-within:bg-white">
              <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                Full Name
              </label>
              <input
                type="text"
                value={form.fullName}
                onChange={set("fullName")}
                placeholder="Rajesh Kumar"
                className={inputCls}
                autoComplete="name"
                required
              />
            </div>

            {/* Email */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-orange-400 focus-within:bg-white">
              <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="worker@email.com"
                className={inputCls}
                autoComplete="email"
                required
              />
            </div>

            {/* Password */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-orange-400 focus-within:bg-white">
              <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                Password
              </label>
              <div className="flex items-center gap-2">
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Min 6 characters"
                  className={inputCls}
                  autoComplete="new-password"
                  minLength={6}
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

            {/* Phone */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-orange-400 focus-within:bg-white">
              <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                Phone Number
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={set("phone")}
                placeholder="+91 98765 43210"
                className={inputCls}
                autoComplete="tel"
                required
              />
            </div>

            {/* Category Pills */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                Service Category
              </label>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, category: cat.name }))}
                    className={`rounded-xl border-2 p-3 text-left transition-all ${
                      form.category === cat.name
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-orange-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={form.category === cat.name ? "text-orange-600" : "text-slate-400"}>
                        {cat.icon}
                      </span>
                      <span className="text-sm font-medium">{cat.name}</span>
                      {form.category === cat.name && (
                        <span className="ml-auto text-orange-600 font-bold">✓</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              {form.category && (
                <p className="text-xs text-orange-600 font-medium">
                  ✓ Selected: {form.category}
                </p>
              )}
            </div>

            {/* Experience */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-orange-400 focus-within:bg-white">
              <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                Experience (years)
              </label>
              <input
                type="number"
                value={form.experienceYears}
                onChange={set("experienceYears")}
                min={0}
                max={40}
                className={inputCls}
                autoComplete="off"
              />
            </div>

            {/* City */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-orange-400 focus-within:bg-white">
              <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                City
              </label>
              <input
                type="text"
                value={form.city}
                onChange={set("city")}
                placeholder="Ranchi"
                className={inputCls}
                autoComplete="address-level2"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:from-orange-600 hover:to-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <UserPlus className="h-4 w-4" />
              {loading ? "Creating Account..." : "Create Worker Account"}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm">
            <Link href="/" className="text-slate-500 hover:text-slate-800 transition">
              ← Back to Home
            </Link>
            <Link
              href="/worker/login"
              className="font-bold text-orange-600 hover:text-orange-700 transition"
            >
              Already registered? Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
