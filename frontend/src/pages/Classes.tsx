import { useEffect, useState, FormEvent } from "react";
import { Plus, CalendarDays, Users, Trash2 } from "lucide-react";
import api from "../services/api";
import Modal from "../components/Modal";
import Loading from "../components/Loading";
import ConfirmDialog from "../components/ConfirmDialog";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../utils/format";

const classTypes = ["Yoga", "Zumba", "CrossFit", "HIIT", "Strength Training", "Cardio", "Personal Training"];

export default function Classes() {
  const { user } = useAuth();
  const canManage = user && ["super_admin", "gym_owner", "manager"].includes(user.role);
  const [classes, setClasses] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const emptyForm = { name: "", type: "Yoga", trainer: "", capacity: "20", date: "", startTime: "", endTime: "" };
  const [form, setForm] = useState<any>(emptyForm);

  const load = async () => {
    setLoading(true);
    const res = await api.get("/classes");
    setClasses(res.data.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    api.get("/trainers").then((res) => setTrainers(res.data.data));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/classes", { ...form, capacity: Number(form.capacity) });
      setModalOpen(false);
      setForm(emptyForm);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await api.delete(`/classes/${deleteTarget._id}`);
    load();
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Classes</h1>
          <p className="text-sm text-ink-900/50">Group classes and scheduled sessions</p>
        </div>
        {canManage && (
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 px-3.5 py-2 text-sm rounded-xl bg-accent text-white hover:bg-accent-600 self-start">
            <Plus size={15} /> Schedule Class
          </button>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((c) => (
          <div key={c._id} className="bg-white rounded-2xl border border-ink-900/8 p-5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-display font-semibold">{c.name}</h3>
                <p className="text-xs text-ink-900/45">{c.trainer?.name || "Unassigned"}</p>
              </div>
              <span className="text-xs bg-accent/10 text-accent-600 px-2 py-0.5 rounded-full">{c.type}</span>
            </div>
            <div className="text-sm text-ink-900/60 space-y-1 mb-3">
              <p className="flex items-center gap-1.5"><CalendarDays size={13} />{formatDate(c.date)} · {c.startTime}–{c.endTime}</p>
              <p className="flex items-center gap-1.5"><Users size={13} />{c.bookedCount}/{c.capacity} booked</p>
            </div>
            <div className="w-full bg-ink-900/5 rounded-full h-1.5 mb-3">
              <div className="bg-accent h-1.5 rounded-full" style={{ width: `${Math.min((c.bookedCount / c.capacity) * 100, 100)}%` }} />
            </div>
            {canManage && (
              <div className="flex justify-end pt-2 border-t border-ink-900/5">
                <button onClick={() => setDeleteTarget(c)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={15} /></button>
              </div>
            )}
          </div>
        ))}
        {classes.length === 0 && <p className="text-sm text-ink-900/40 py-8 text-center sm:col-span-3">No classes scheduled yet.</p>}
      </div>

      <Modal title="Schedule Class" open={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1.5">Class Name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" /></div>
          <div><label className="block text-sm font-medium mb-1.5">Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input">
              {classTypes.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div><label className="block text-sm font-medium mb-1.5">Trainer</label>
            <select required value={form.trainer} onChange={(e) => setForm({ ...form, trainer: e.target.value })} className="input">
              <option value="">Select trainer</option>
              {trainers.map((t: any) => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-sm font-medium mb-1.5">Date</label><input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input" /></div>
            <div><label className="block text-sm font-medium mb-1.5">Start</label><input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="input" /></div>
            <div><label className="block text-sm font-medium mb-1.5">End</label><input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="input" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1.5">Capacity</label><input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} className="input" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm rounded-lg border border-ink-900/10">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-accent text-white hover:bg-accent-600 disabled:opacity-60">{saving ? "Saving..." : "Schedule"}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Cancel class" message={`Cancel ${deleteTarget?.name}?`} confirmLabel="Cancel Class" />
    </div>
  );
}
