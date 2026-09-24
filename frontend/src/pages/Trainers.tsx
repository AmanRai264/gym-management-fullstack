import { useEffect, useState, FormEvent } from "react";
import { Plus, Search, Pencil, Trash2, Mail, Phone, Award } from "lucide-react";
import api from "../services/api";
import Modal from "../components/Modal";
import Badge from "../components/Badge";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../components/ConfirmDialog";
import { useAuth } from "../context/AuthContext";
import type { Trainer } from "../types";

export default function Trainers() {
  const { user } = useAuth();
  const canManage = user && ["super_admin", "gym_owner", "manager"].includes(user.role);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Trainer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Trainer | null>(null);
  const [saving, setSaving] = useState(false);

  const emptyForm = { name: "", phone: "", email: "", specialization: "", experience: "", salary: "", availability: "" };
  const [form, setForm] = useState<any>(emptyForm);

  const load = async () => {
    setLoading(true);
    const res = await api.get("/trainers", { params: { search } });
    setTrainers(res.data.data);
    setLoading(false);
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (t: Trainer) => {
    setEditing(t);
    setForm({
      name: t.name, phone: t.phone || "", email: t.email || "",
      specialization: t.specialization?.join(", ") || "", experience: t.experience, salary: t.salary,
      availability: t.availability || "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        specialization: form.specialization.split(",").map((s: string) => s.trim()).filter(Boolean),
        experience: Number(form.experience) || 0,
        salary: Number(form.salary) || 0,
      };
      if (editing) await api.put(`/trainers/${editing._id}`, payload);
      else await api.post("/trainers", payload);
      setModalOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await api.delete(`/trainers/${deleteTarget._id}`);
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Trainers</h1>
          <p className="text-sm text-ink-900/50">{trainers.length} trainers on staff</p>
        </div>
        {canManage && (
          <button onClick={openCreate} className="flex items-center gap-1.5 px-3.5 py-2 text-sm rounded-xl bg-accent text-white hover:bg-accent-600 self-start">
            <Plus size={15} /> Add Trainer
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 bg-white border border-ink-900/10 rounded-xl px-3 py-2 max-w-sm">
        <Search size={15} className="text-ink-900/40" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search trainers..." className="bg-transparent text-sm outline-none w-full" />
      </div>

      {loading ? <Loading /> : trainers.length === 0 ? (
        <EmptyState icon={Search} title="No trainers found" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trainers.map((t) => (
            <div key={t._id} className="bg-white rounded-2xl border border-ink-900/8 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-ink-900 text-white flex items-center justify-center font-display font-semibold shrink-0">
                    {t.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{t.name}</p>
                    <p className="text-xs text-ink-900/45 font-mono">{t.trainerId}</p>
                  </div>
                </div>
                <Badge status={t.status} />
              </div>
              <div className="space-y-1.5 text-sm text-ink-900/60 mb-3">
                {t.phone && <p className="flex items-center gap-1.5"><Phone size={13} />{t.phone}</p>}
                {t.email && <p className="flex items-center gap-1.5"><Mail size={13} />{t.email}</p>}
                <p className="flex items-center gap-1.5"><Award size={13} />{t.experience} yrs experience</p>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {t.specialization?.map((s) => (
                  <span key={s} className="text-xs bg-accent/10 text-accent-600 px-2 py-0.5 rounded-full">{s}</span>
                ))}
              </div>
              {canManage && (
                <div className="flex justify-end gap-1 pt-2 border-t border-ink-900/5">
                  <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg hover:bg-ink-900/5 text-ink-900/50"><Pencil size={15} /></button>
                  <button onClick={() => setDeleteTarget(t)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={15} /></button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal title={editing ? "Edit Trainer" : "Add Trainer"} open={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1.5">Name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1.5">Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" /></div>
            <div><label className="block text-sm font-medium mb-1.5">Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1.5">Specialization (comma separated)</label><input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} className="input" placeholder="Strength Training, Yoga" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1.5">Experience (years)</label><input type="number" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} className="input" /></div>
            <div><label className="block text-sm font-medium mb-1.5">Salary (₹)</label><input type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} className="input" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1.5">Availability</label><input value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} className="input" placeholder="Mon-Sat, 6AM-9PM" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm rounded-lg border border-ink-900/10">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-accent text-white hover:bg-accent-600 disabled:opacity-60">{saving ? "Saving..." : "Save"}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete trainer" message={`Remove ${deleteTarget?.name} from staff?`} confirmLabel="Delete" />
    </div>
  );
}
