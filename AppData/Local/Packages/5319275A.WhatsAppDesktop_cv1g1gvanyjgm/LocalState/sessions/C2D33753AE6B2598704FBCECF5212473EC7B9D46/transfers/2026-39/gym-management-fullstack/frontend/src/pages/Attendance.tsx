import { useEffect, useState } from "react";
import { QrCode, Radio, UserCheck, LogIn, LogOut, Users2, UserX2, Clock3 } from "lucide-react";
import api from "../services/api";
import Loading from "../components/Loading";
import StatCard from "../components/StatCard";
import { formatDateTime } from "../utils/format";
import type { Member } from "../types";

export default function Attendance() {
  const [today, setToday] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState("");
  const [method, setMethod] = useState<"QR" | "RFID" | "Manual">("Manual");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = async () => {
    const [t, s] = await Promise.all([api.get("/attendance/today"), api.get("/attendance/stats")]);
    setToday(t.data.data);
    setStats(s.data.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    api.get("/members", { params: { status: "active", limit: 200 } }).then((res) => setMembers(res.data.data));
  }, []);

  const handleCheckIn = async () => {
    if (!selectedMember) return;
    setMessage("");
    try {
      await api.post("/attendance/checkin", { memberId: selectedMember, method });
      setMessage("Checked in successfully.");
      setSelectedMember("");
      load();
    } catch (err: any) {
      setMessage(err?.response?.data?.message || "Check-in failed.");
    }
  };

  const handleCheckOut = async (id: string) => {
    await api.put(`/attendance/${id}/checkout`);
    load();
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-semibold">Attendance</h1>
        <p className="text-sm text-ink-900/50">Check members in and track today's activity.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Present Today" value={stats?.presentToday ?? 0} icon={Users2} tone="mint" />
        <StatCard label="Absent Today" value={stats?.absentToday ?? 0} icon={UserX2} tone="amber" />
        <StatCard label="Total Check-ins" value={stats?.totalCheckins ?? 0} icon={UserCheck} />
        <StatCard label="Peak Hour" value={stats?.peakHour ?? "N/A"} icon={Clock3} tone="accent" />
      </div>

      <div className="bg-white rounded-2xl border border-ink-900/8 p-5">
        <h3 className="font-display font-semibold mb-4">Check in a member</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <select value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)} className="input sm:max-w-sm">
            <option value="">Select member...</option>
            {members.map((m) => <option key={m._id} value={m._id}>{m.fullName} ({m.memberId})</option>)}
          </select>
          <div className="flex gap-1.5 bg-ink-900/5 rounded-xl p-1">
            {(["Manual", "QR", "RFID"] as const).map((m) => (
              <button key={m} onClick={() => setMethod(m)} className={`px-3 py-1.5 text-xs rounded-lg flex items-center gap-1.5 ${method === m ? "bg-white shadow-sm font-medium" : "text-ink-900/50"}`}>
                {m === "QR" && <QrCode size={13} />}
                {m === "RFID" && <Radio size={13} />}
                {m === "Manual" && <UserCheck size={13} />}
                {m}
              </button>
            ))}
          </div>
          <button onClick={handleCheckIn} className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl bg-accent text-white hover:bg-accent-600">
            <LogIn size={15} /> Check In
          </button>
        </div>
        {method !== "Manual" && (
          <p className="text-xs text-ink-900/40 mt-2">{method} check-in is simulated for this demo — no real hardware is required.</p>
        )}
        {message && <p className="text-sm mt-3 text-ink-900/70">{message}</p>}
      </div>

      <div className="bg-white rounded-2xl border border-ink-900/8 overflow-hidden">
        <div className="px-5 py-4 border-b border-ink-900/8">
          <h3 className="font-display font-semibold">Today's attendance</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-ink-900/45 bg-ink-900/[0.02] border-b border-ink-900/8">
              <th className="px-4 py-3 font-medium">Member</th>
              <th className="px-4 py-3 font-medium">Check-in</th>
              <th className="px-4 py-3 font-medium">Check-out</th>
              <th className="px-4 py-3 font-medium">Method</th>
              <th className="px-4 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {today.map((a) => (
              <tr key={a._id} className="border-b border-ink-900/5 last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium">{a.member?.fullName}</p>
                  <p className="text-xs text-ink-900/45 font-mono">{a.member?.memberId}</p>
                </td>
                <td className="px-4 py-3">{formatDateTime(a.checkInTime)}</td>
                <td className="px-4 py-3">{a.checkOutTime ? formatDateTime(a.checkOutTime) : "—"}</td>
                <td className="px-4 py-3">{a.method}</td>
                <td className="px-4 py-3 text-right">
                  {!a.checkOutTime && (
                    <button onClick={() => handleCheckOut(a._id)} className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
                      <LogOut size={13} /> Check out
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {today.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-ink-900/40">No check-ins yet today.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
