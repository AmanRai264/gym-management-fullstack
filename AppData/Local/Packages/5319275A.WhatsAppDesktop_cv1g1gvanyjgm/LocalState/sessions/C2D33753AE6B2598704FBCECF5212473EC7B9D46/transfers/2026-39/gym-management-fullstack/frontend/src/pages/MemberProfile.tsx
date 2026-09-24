import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Phone, Mail, MapPin, Droplet, Ruler, Weight, Activity } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import api from "../services/api";
import Badge from "../components/Badge";
import Loading from "../components/Loading";
import { formatDate, formatDateTime, formatCurrency } from "../utils/format";
import type { Member } from "../types";

const tabs = ["Overview", "Membership", "Attendance", "Payments", "Workout Plans", "Diet Plans", "Progress"];

export default function MemberProfile() {
  const { id } = useParams();
  const [member, setMember] = useState<Member | null>(null);
  const [tab, setTab] = useState("Overview");
  const [attendance, setAttendance] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [diets, setDiets] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.get(`/members/${id}`).then((res) => setMember(res.data.data)).finally(() => setLoading(false));
    api.get("/attendance/history", { params: { member: id, limit: 20 } }).then((res) => setAttendance(res.data.data));
    api.get("/payments", { params: { member: id } }).then((res) => setPayments(res.data.data));
    api.get("/workout-plans", { params: { member: id } }).then((res) => setWorkouts(res.data.data));
    api.get("/diet-plans", { params: { member: id } }).then((res) => setDiets(res.data.data));
    api.get("/progress", { params: { member: id } }).then((res) => setProgress(res.data.data));
  }, [id]);

  if (loading || !member) return <Loading label="Loading member..." />;

  const plan = typeof member.membershipPlan === "object" ? member.membershipPlan : null;
  const trainer = typeof member.assignedTrainer === "object" ? member.assignedTrainer : null;

  return (
    <div className="space-y-5">
      <Link to="/members" className="inline-flex items-center gap-1.5 text-sm text-ink-900/50 hover:text-ink-900">
        <ArrowLeft size={15} /> Back to members
      </Link>

      <div className="bg-white rounded-2xl border border-ink-900/8 p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-ink-900 text-white flex items-center justify-center font-display font-semibold text-lg shrink-0">
            {member.fullName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold">{member.fullName}</h1>
            <p className="text-sm text-ink-900/45 font-mono">{member.memberId}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge status={member.status} />
          {plan && <span className="text-xs bg-ink-900/5 px-2.5 py-1 rounded-full">{plan.name}</span>}
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-ink-900/8">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3.5 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition ${
              tab === t ? "border-accent text-ink-900" : "border-transparent text-ink-900/45 hover:text-ink-900"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-ink-900/8 p-5 space-y-3">
            <h3 className="font-display font-semibold mb-2">Personal Information</h3>
            <InfoRow icon={Phone} label="Phone" value={member.phone} />
            <InfoRow icon={Mail} label="Email" value={member.email} />
            <InfoRow icon={MapPin} label="Address" value={member.address} />
            <InfoRow icon={Droplet} label="Blood Group" value={member.bloodGroup} />
            <InfoRow label="Gender" value={member.gender} />
            <InfoRow label="Date of Birth" value={formatDate(member.dob)} />
            <InfoRow label="Emergency Contact" value={member.emergencyContact} />
            <InfoRow label="Joining Date" value={formatDate(member.joiningDate)} />
            <InfoRow label="Assigned Trainer" value={trainer?.name || "Unassigned"} />
            {member.medicalNotes && <InfoRow label="Medical Notes" value={member.medicalNotes} />}
          </div>
          <div className="bg-white rounded-2xl border border-ink-900/8 p-5">
            <h3 className="font-display font-semibold mb-3">Body Stats</h3>
            <div className="grid grid-cols-3 gap-3">
              <StatMini icon={Ruler} label="Height" value={member.height ? `${member.height} cm` : "—"} />
              <StatMini icon={Weight} label="Weight" value={member.weight ? `${member.weight} kg` : "—"} />
              <StatMini icon={Activity} label="BMI" value={member.bmi ?? "—"} />
            </div>
          </div>
        </div>
      )}

      {tab === "Membership" && (
        <div className="bg-white rounded-2xl border border-ink-900/8 p-5 space-y-3 max-w-lg">
          <InfoRow label="Plan" value={plan?.name || "—"} />
          <InfoRow label="Price" value={plan ? formatCurrency(plan.price) : "—"} />
          <InfoRow label="Start Date" value={formatDate(member.membershipStartDate)} />
          <InfoRow label="Expiry Date" value={formatDate(member.membershipExpiryDate)} />
          <InfoRow label="Status" value={<Badge status={member.status} />} />
        </div>
      )}

      {tab === "Attendance" && (
        <div className="bg-white rounded-2xl border border-ink-900/8 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-ink-900/45 bg-ink-900/[0.02] border-b border-ink-900/8">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Check-in</th>
                <th className="px-4 py-3 font-medium">Check-out</th>
                <th className="px-4 py-3 font-medium">Method</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((a) => (
                <tr key={a._id} className="border-b border-ink-900/5 last:border-0">
                  <td className="px-4 py-2.5">{formatDate(a.date)}</td>
                  <td className="px-4 py-2.5">{formatDateTime(a.checkInTime)}</td>
                  <td className="px-4 py-2.5">{a.checkOutTime ? formatDateTime(a.checkOutTime) : "—"}</td>
                  <td className="px-4 py-2.5">{a.method}</td>
                </tr>
              ))}
              {attendance.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-ink-900/40">No attendance records yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === "Payments" && (
        <div className="bg-white rounded-2xl border border-ink-900/8 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-ink-900/45 bg-ink-900/[0.02] border-b border-ink-900/8">
                <th className="px-4 py-3 font-medium">Invoice</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Method</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id} className="border-b border-ink-900/5 last:border-0">
                  <td className="px-4 py-2.5 font-mono text-xs">{p.invoiceNumber}</td>
                  <td className="px-4 py-2.5 font-medium">{formatCurrency(p.finalAmount)}</td>
                  <td className="px-4 py-2.5">{p.method}</td>
                  <td className="px-4 py-2.5"><Badge status={p.status} /></td>
                  <td className="px-4 py-2.5">{formatDate(p.date)}</td>
                </tr>
              ))}
              {payments.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-ink-900/40">No payments recorded yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === "Workout Plans" && (
        <div className="grid sm:grid-cols-2 gap-4">
          {workouts.map((w) => (
            <div key={w._id} className="bg-white rounded-2xl border border-ink-900/8 p-5">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-display font-semibold">{w.title}</h4>
                <span className="text-xs bg-ink-900/5 px-2 py-0.5 rounded-full">{w.category}</span>
              </div>
              <ul className="text-sm text-ink-900/60 space-y-1">
                {w.exercises?.slice(0, 4).map((ex: any, i: number) => (
                  <li key={i}>• {ex.name} — {ex.sets}×{ex.reps} {ex.weight && `@ ${ex.weight}`}</li>
                ))}
              </ul>
            </div>
          ))}
          {workouts.length === 0 && <p className="text-sm text-ink-900/40 py-8 text-center sm:col-span-2">No workout plans assigned yet.</p>}
        </div>
      )}

      {tab === "Diet Plans" && (
        <div className="grid sm:grid-cols-2 gap-4">
          {diets.map((d) => (
            <div key={d._id} className="bg-white rounded-2xl border border-ink-900/8 p-5">
              <h4 className="font-display font-semibold mb-2">{d.planName}</h4>
              <p className="text-xs text-ink-900/50 mb-2">{d.calories} kcal · {d.protein}g protein · {d.carbs}g carbs · {d.fat}g fat</p>
              <ul className="text-sm text-ink-900/60 space-y-1">
                {d.meals?.map((m: any, i: number) => (
                  <li key={i}>• {m.type} ({m.time}) — {m.items?.join(", ")}</li>
                ))}
              </ul>
            </div>
          ))}
          {diets.length === 0 && <p className="text-sm text-ink-900/40 py-8 text-center sm:col-span-2">No diet plans assigned yet.</p>}
        </div>
      )}

      {tab === "Progress" && (
        <div className="bg-white rounded-2xl border border-ink-900/8 p-5">
          <h3 className="font-display font-semibold mb-4">Weight over time</h3>
          {progress.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={progress.map((p) => ({ date: formatDate(p.date), weight: p.weight, bmi: p.bmi }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#0B122010" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#0B122070" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#0B122070" }} axisLine={false} tickLine={false} width={35} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #0B12201A", fontSize: 13 }} />
                <Line type="monotone" dataKey="weight" stroke="#FF5A36" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-ink-900/40 py-8 text-center">No progress records yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon?: any; label: string; value: any }) {
  return (
    <div className="flex items-center justify-between text-sm py-1">
      <span className="text-ink-900/45 flex items-center gap-1.5">{Icon && <Icon size={13} />}{label}</span>
      <span className="font-medium text-right">{value || "—"}</span>
    </div>
  );
}

function StatMini({ icon: Icon, label, value }: { icon: any; label: string; value: any }) {
  return (
    <div className="text-center bg-ink-900/[0.03] rounded-xl py-3">
      <Icon size={16} className="mx-auto mb-1 text-ink-900/40" />
      <p className="font-display font-semibold">{value}</p>
      <p className="text-xs text-ink-900/45">{label}</p>
    </div>
  );
}
