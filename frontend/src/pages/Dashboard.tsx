import { useEffect, useState } from "react";
import {
  Users, UserCheck, UserX, UserPlus, CalendarCheck, IndianRupee, Clock, Dumbbell,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import api from "../services/api";
import StatCard from "../components/StatCard";
import Loading from "../components/Loading";
import Badge from "../components/Badge";
import { formatCurrency, formatDate, monthLabel, daysUntil } from "../utils/format";
import type { DashboardStats } from "../types";

const PIE_COLORS = ["#FF5A36", "#16A34A", "#0B1220", "#F5A623", "#3B82F6", "#A855F7"];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [charts, setCharts] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<"today" | "week" | "month" | "year">("month");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [statsRes, chartsRes] = await Promise.all([
        api.get("/dashboard/stats", { params: { range } }),
        api.get("/dashboard/charts"),
      ]);
      setStats(statsRes.data.data);
      setCharts(chartsRes.data.data);
      setLoading(false);
    };
    load();
  }, [range]);

  if (loading || !stats) return <Loading label="Loading dashboard..." />;

  const revenueData = (charts?.revenueByMonth || []).map((r: any) => ({
    name: monthLabel(r._id.year, r._id.month),
    revenue: r.total,
  }));
  const membersData = (charts?.newMembersByMonth || []).map((r: any) => ({
    name: monthLabel(r._id.year, r._id.month),
    members: r.count,
  }));
  const distributionData = (charts?.membershipDistribution || []).map((d: any) => ({
    name: d._id || "Unassigned",
    value: d.count,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-ink-900/50">Here's what's happening at your gym today.</p>
        </div>
        <div className="flex bg-white border border-ink-900/10 rounded-xl p-1 self-start">
          {(["today", "week", "month", "year"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition ${
                range === r ? "bg-ink-900 text-white" : "text-ink-900/50 hover:text-ink-900"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total Members" value={stats.totalMembers} icon={Users} />
        <StatCard label="Active Members" value={stats.activeMembers} icon={UserCheck} tone="mint" />
        <StatCard label="Expired Memberships" value={stats.expiredMembers} icon={UserX} tone="amber" />
        <StatCard label="New This Month" value={stats.newMembersThisMonth} icon={UserPlus} tone="accent" />
        <StatCard label="Today's Check-ins" value={stats.todaysCheckins} icon={CalendarCheck} />
        <StatCard label="Monthly Revenue" value={formatCurrency(stats.monthlyRevenue)} icon={IndianRupee} tone="mint" />
        <StatCard label="Pending Payments" value={formatCurrency(stats.pendingPayments)} hint={`${stats.pendingPaymentsCount} invoices`} icon={Clock} tone="amber" />
        <StatCard label="Active Trainers" value={stats.activeTrainers} icon={Dumbbell} tone="accent" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-ink-900/8 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold">Revenue by month</h3>
              <p className="text-xs text-ink-900/45">Last 12 months</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF5A36" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#FF5A36" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#0B122010" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#0B122070" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#0B122070" }} axisLine={false} tickLine={false} width={50} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: 12, border: "1px solid #0B12201A", fontSize: 13 }} />
              <Area type="monotone" dataKey="revenue" stroke="#FF5A36" strokeWidth={2.5} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-ink-900/8 p-5">
          <h3 className="font-display font-semibold mb-4">Membership distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={distributionData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {distributionData.map((_: any, i: number) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #0B12201A", fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {distributionData.map((d: any, i: number) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-ink-900/60">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="truncate">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-ink-900/8 p-5">
          <h3 className="font-display font-semibold mb-4">New members by month</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={membersData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#0B122010" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#0B122070" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#0B122070" }} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #0B12201A", fontSize: 13 }} />
              <Bar dataKey="members" fill="#0B1220" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-ink-900/8 p-5 lg:col-span-2">
          <h3 className="font-display font-semibold mb-4">Upcoming membership expirations</h3>
          <div className="space-y-2">
            {stats.upcomingExpirations.length === 0 && (
              <p className="text-sm text-ink-900/40 py-6 text-center">No memberships expiring in the next 30 days.</p>
            )}
            {stats.upcomingExpirations.map((m) => {
              const days = daysUntil(m.membershipExpiryDate);
              return (
                <div key={m._id} className="flex items-center justify-between py-2 border-b border-ink-900/5 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{m.fullName}</p>
                    <p className="text-xs text-ink-900/45">{m.memberId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-ink-900/50">{formatDate(m.membershipExpiryDate)}</p>
                    <p className={`text-xs font-medium ${days !== null && days <= 7 ? "text-red-600" : "text-amber-600"}`}>
                      {days} days left
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-ink-900/8 p-5">
        <h3 className="font-display font-semibold mb-4">Recent transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-ink-900/45 border-b border-ink-900/8">
                <th className="pb-2 font-medium">Invoice</th>
                <th className="pb-2 font-medium">Member</th>
                <th className="pb-2 font-medium">Amount</th>
                <th className="pb-2 font-medium">Method</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentTransactions.map((p: any) => (
                <tr key={p._id} className="border-b border-ink-900/5 last:border-0">
                  <td className="py-2.5 font-mono text-xs">{p.invoiceNumber}</td>
                  <td className="py-2.5">{p.member?.fullName || "—"}</td>
                  <td className="py-2.5 font-medium">{formatCurrency(p.finalAmount)}</td>
                  <td className="py-2.5 text-ink-900/60">{p.method}</td>
                  <td className="py-2.5"><Badge status={p.status} /></td>
                  <td className="py-2.5 text-ink-900/45">{formatDate(p.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
