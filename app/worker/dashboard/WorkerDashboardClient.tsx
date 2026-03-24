"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  HardHat, Star, MapPin, Phone, Briefcase, CheckCircle2,
  Clock, Truck, XCircle, LogOut, ChevronDown, TrendingUp,
  IndianRupee, CalendarCheck2, Loader2, AlertCircle, Filter,
} from "lucide-react";

type Booking = {
  _id: string;
  status: string;
  paymentStatus: string;
  amount: number;
  bookingDate: string | null;
  completedAt: string | null;
  createdAt: string | null;
  notes: string;
  address: Record<string, string>;
  service: { name: string; category: string };
};

type Worker = {
  _id: string;
  fullName: string;
  email: string;
  category: string;
  phone: string;
  rating: number;
  totalJobs: number;
  city: string;
  isAvailable: boolean;
};

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Pending",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  accepted: {
    label: "Accepted",
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  on_the_way: {
    label: "On the Way",
    color: "text-purple-700",
    bg: "bg-purple-50 border-purple-200",
    icon: <Truck className="h-3.5 w-3.5" />,
  },
  completed: {
    label: "Completed",
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-rose-700",
    bg: "bg-rose-50 border-rose-200",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
};

const NEXT_ACTIONS: Record<string, { status: string; label: string; cls: string }[]> = {
  pending: [
    { status: "accepted", label: "✓ Accept Job", cls: "bg-blue-600 hover:bg-blue-700 text-white" },
    { status: "rejected", label: "✗ Reject", cls: "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200" },
  ],
  accepted: [
    { status: "on_the_way", label: "🚗 Mark On the Way", cls: "bg-purple-600 hover:bg-purple-700 text-white" },
  ],
  on_the_way: [
    { status: "completed", label: "✓ Mark Completed", cls: "bg-emerald-600 hover:bg-emerald-700 text-white" },
  ],
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${cfg.color} ${cfg.bg}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function BookingCard({
  booking,
  onAction,
  updating,
}: {
  booking: Booking;
  onAction: (id: string, status: string) => void;
  updating: string | null;
}) {
  const actions = NEXT_ACTIONS[booking.status] ?? [];
  const addr = booking.address;
  const addrStr = [addr.houseNo, addr.street, addr.city, addr.pincode]
    .filter(Boolean)
    .join(", ");
  const dateStr = booking.bookingDate
    ? new Date(booking.bookingDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-bold text-slate-900">{booking.service.name}</p>
          <p className="text-xs text-slate-500">{booking.service.category}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {/* Details */}
      <div className="mb-4 space-y-2 rounded-2xl bg-slate-50 p-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <CalendarCheck2 className="h-4 w-4 text-slate-400" />
          <span>Scheduled: <strong className="text-slate-800">{dateStr}</strong></span>
        </div>
        {addrStr && (
          <div className="flex items-start gap-2 text-sm text-slate-600">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <span>{addrStr}</span>
          </div>
        )}
        {booking.notes && (
          <div className="flex items-start gap-2 text-sm text-slate-600">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <span>{booking.notes}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <IndianRupee className="h-4 w-4 text-emerald-500" />
          <span className="font-bold text-emerald-700">₹{booking.amount.toLocaleString("en-IN")}</span>
          <span
            className={`ml-auto rounded-full px-2 py-0.5 text-xs font-bold ${
              booking.paymentStatus === "paid"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {booking.paymentStatus}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      {actions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <button
              key={action.status}
              onClick={() => onAction(booking._id, action.status)}
              disabled={updating === booking._id}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition disabled:opacity-60 ${action.cls}`}
            >
              {updating === booking._id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              {action.label}
            </button>
          ))}
        </div>
      )}
      {booking.status === "completed" && (
        <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
          <CheckCircle2 className="h-4 w-4" /> Job Completed
          {booking.completedAt && (
            <span className="ml-1 font-normal text-slate-500">
              on {new Date(booking.completedAt).toLocaleDateString("en-IN")}
            </span>
          )}
        </p>
      )}
    </article>
  );
}

const FILTERS = ["all", "pending", "accepted", "on_the_way", "completed"];

export default function WorkerDashboardClient({
  worker,
  bookings: initialBookings,
  stats,
}: {
  worker: Worker;
  bookings: Booking[];
  stats: Record<string, number>;
}) {
  const router = useRouter();
  const [bookings, setBookings] = useState(initialBookings);
  const [filter, setFilter] = useState("all");
  const [updating, setUpdating] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  async function handleAction(bookingId: string, status: string) {
    setUpdating(bookingId);
    try {
      const res = await fetch("/api/worker/bookings/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (status === "rejected") {
        setBookings((prev) => prev.filter((b) => b._id !== bookingId));
        showToast("Booking rejected and returned to pool.");
      } else {
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, status: data.newStatus } : b))
        );
        showToast(`Status updated to "${data.newStatus.replace("_", " ")}"`);
      }
      startTransition(() => router.refresh());
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Update failed");
    } finally {
      setUpdating(null);
    }
  }

  async function handleLogout() {
    await fetch("/api/worker/logout", { method: "POST" });
    router.push("/worker/login");
  }

  const filtered =
    filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  const initials = worker.fullName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-xl">
          {toast}
        </div>
      )}

      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        {/* Sidebar */}
        <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white px-6 py-8 lg:flex lg:flex-col">
          {/* Logo */}
          <div className="mb-10 flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 p-3 text-white shadow-lg shadow-orange-300/30">
              <HardHat className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-black leading-none text-slate-900">ServiceHub</p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Worker Portal</p>
            </div>
          </div>

          {/* Worker Profile Card */}
          <div className="mb-6 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-500 p-5 text-white shadow-xl shadow-orange-200">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-xl font-black backdrop-blur">
              {initials}
            </div>
            <p className="font-bold leading-tight">{worker.fullName}</p>
            <p className="text-sm text-white/80">{worker.category}</p>
            <div className="mt-3 flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-white" />
                {worker.rating.toFixed(1)}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" />
                {worker.totalJobs} jobs
              </span>
            </div>
          </div>

          {/* Worker Info */}
          <div className="mb-6 space-y-2 rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Phone className="h-4 w-4 text-slate-400" />
              {worker.phone}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="h-4 w-4 text-slate-400" />
              {worker.city}
            </div>
          </div>

          {/* Nav */}
          <nav className="space-y-2">
            <button className="flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200">
              <Briefcase className="h-5 w-5" /> My Bookings
            </button>
            <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800">
              <TrendingUp className="h-5 w-5" /> Earnings
            </button>
          </nav>

          <div className="mt-auto">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-50"
            >
              <LogOut className="h-5 w-5" /> Sign Out
            </button>
          </div>
        </aside>

        {/* Main */}
        <section className="flex-1 overflow-hidden">
          {/* Topbar */}
          <header className="border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur sm:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900">
                  Welcome back, {worker.fullName.split(" ")[0]} 👋
                </h1>
                <p className="text-sm text-slate-500">Manage your bookings and track jobs</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-rose-300 hover:text-rose-600 lg:hidden"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div className="space-y-6 p-5 sm:p-8">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {[
                { label: "Total Jobs", value: stats.total, color: "from-indigo-600 to-blue-600" },
                { label: "Pending", value: stats.pending, color: "from-amber-500 to-orange-500" },
                { label: "Accepted", value: stats.accepted, color: "from-blue-500 to-cyan-500" },
                { label: "On the Way", value: stats.on_the_way, color: "from-purple-500 to-violet-500" },
                { label: "Completed", value: stats.completed, color: "from-emerald-500 to-teal-500" },
              ].map((s) => (
                <div
                  key={s.label}
                  className={`rounded-3xl bg-gradient-to-br ${s.color} p-5 text-white shadow-md`}
                >
                  <p className="text-3xl font-black">{s.value}</p>
                  <p className="mt-1 text-xs font-bold text-white/80">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Earnings Banner */}
            <div className="flex items-center gap-4 rounded-3xl border border-emerald-100 bg-emerald-50 px-6 py-4">
              <div className="rounded-2xl bg-emerald-500 p-3 text-white shadow-md shadow-emerald-200">
                <IndianRupee className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.15em] text-emerald-600">
                  Total Earnings
                </p>
                <p className="text-3xl font-black text-emerald-800">
                  ₹{stats.earnings.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs text-slate-500">From {stats.completed} completed job{stats.completed !== 1 ? "s" : ""}</p>
                <p className="text-sm font-bold text-slate-700">
                  Rating: ⭐ {worker.rating.toFixed(1)} / 5.0
                </p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                    filter === f
                      ? "bg-orange-500 text-white shadow-md"
                      : "bg-white text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {f === "all" ? "All" : STATUS_CONFIG[f]?.label ?? f}
                  <span className="ml-1.5 opacity-70">
                    ({f === "all" ? bookings.length : bookings.filter((b) => b.status === f).length})
                  </span>
                </button>
              ))}
            </div>

            {/* Booking Cards */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white py-20">
                <Briefcase className="mb-4 h-12 w-12 text-slate-300" />
                <p className="text-lg font-bold text-slate-400">No bookings found</p>
                <p className="mt-1 text-sm text-slate-400">
                  {filter === "all"
                    ? "Your assigned jobs will appear here."
                    : `No ${STATUS_CONFIG[filter]?.label ?? filter} bookings.`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((booking) => (
                  <BookingCard
                    key={booking._id}
                    booking={booking}
                    onAction={handleAction}
                    updating={updating}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
