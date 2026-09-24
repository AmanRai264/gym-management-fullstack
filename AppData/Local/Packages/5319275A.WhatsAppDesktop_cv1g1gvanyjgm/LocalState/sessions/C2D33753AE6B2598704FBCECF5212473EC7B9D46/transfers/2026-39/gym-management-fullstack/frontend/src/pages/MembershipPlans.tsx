import { useEffect, useState, FormEvent } from "react";
import { Plus, Pencil, Trash2, Check, X as XIcon } from "lucide-react";
import api from "../services/api";
import Modal from "../components/Modal";
import Loading from "../components/Loading";
import ConfirmDialog from "../components/ConfirmDialog";
import { formatCurrency } from "../utils/format";
import type { MembershipPlan } from "../types";

export default function MembershipPlans() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MembershipPlan | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MembershipPlan | null>(null);
  const [saving, setSaving] = useState(false);

  const emptyForm = { name: "", durationInMonths: "1", price: "", description: "", features: "", accessType: "Basic", personalTrainerIncluded: false };
  const [form, setForm] = useState<any>(emptyForm);

  const load = async () => {
    setLoading(true);
    const res = await api.get("/membership-plans");
    setPlans(res.data.data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (p: MembershipPlan) => {
    setEditing(p);
    setForm({
      name: p.name, durationInMonths: p.durationInMonths, price: p.price, description: p.description || "",
      features: p.features?.join(", ") || "", accessType: p.accessType, personalTrainerIncluded: p.personalTrainerIncluded,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        durationInMonths: Number(form.durationInMonths),
        price: Number(form.price),
        features: form.features.split(",").map((s: string) => s.trim()).filter(Boolean),
      };
      if (editing) await api.put(`/membership-plans/${editing._id}`, payload);
      else await api.post("/membership-plans", payload);
      setModalOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (p: MembershipPlan) => {
    await api.patch(`/membership-plans/${p._id}/toggle`);
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await api.delete(`/membership-plans/${deleteTarget._id}`);
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Membership Plans</h1>
          <p className="text-sm text-ink-900/50">Manage the plans members can subscribe to</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-1.5 px-3.5 py-2 text-sm rounded-xl bg-accent text-white hover:bg-accent-600 self-start">
          <Plus size={15} /> Create Plan
        </button>
      </div>

      {loading ? <Loading /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((p) => (
            <div key={p._id} className={`bg-white rounded-2xl border p-5 relative ${p.status === "active" ? "border-ink-900/8" : "border-ink-900/8 opacity-60"}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-display font-semibold text-lg">{p.name}</h3>
                  <p className="text-xs text-ink-900/45">{p.durationInMonths} month{p.durationInMonths > 1 ? "s" : ""} · {p.accessType}</p>
                </div>
                <button onClick={() => toggleStatus(p)} className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 ${p.status === "active" ? "bg-mint-50 text-mint-500" : "bg-gray-100 text-gray-500"}`}>
                  {p.status === "active" ? <Check size={12} /> : <XIcon size={12} />}
                  {p.status}
                </button>
              </div>
              <p className="font-display text-2xl font-semibold mb-2">{formatCurrency(p.price)}</p>
              <p className="text-sm text-ink-900/55 mb-3">{p.description}</p>
              <ul className="space-y-1 mb-4">
                {p.features?.map((f) => (
                  <li key={f} className="text-sm flex items-center gap-1.5 text-ink-900/65"><Check size={13} className="text-mint-500 shrink-0" />{f}</li>
                ))}
              </ul>
              {p.personalTrainerIncluded && <span className="inline-block text-xs bg-accent/10 text-accent-600 px-2 py-0.5 rounded-full mb-3">Includes Personal Trainer</span>}
              <div className="flex justify-end gap-1 pt-2 border-t border-ink-900/5">
                <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-ink-900/5 text-ink-900/50"><Pencil size={15} /></button>
                <button onClick={() => setDeleteTarget(p)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal title={editing ? "Edit Plan" : "Create Plan"} open={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1.5">Plan Name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1.5">Duration (months)</label><input type="number" required value={form.durationInMonths} onChange={(e) => setForm({ ...form, durationInMonths: e.target.value })} className="input" /></div>
            <div><label className="block text-sm font-medium mb-1.5">Price (₹)</label><input type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1.5">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" rows={2} /></div>
          <div><label className="block text-sm font-medium mb-1.5">Features (comma separated)</label><input value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} className="input" placeholder="Gym access, Locker" /></div>
          <div><label className="block text-sm font-medium mb-1.5">Access Type</label>
            <select value={form.accessType} onChange={(e) => setForm({ ...form, accessType: e.target.value })} className="input">
              <option>Basic</option><option>Full</option><option>Premium</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.personalTrainerIncluded} onChange={(e) => setForm({ ...form, personalTrainerIncluded: e.target.checked })} className="rounded border-ink-900/20" />
            Includes personal trainer
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm rounded-lg border border-ink-900/10">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-accent text-white hover:bg-accent-600 disabled:opacity-60">{saving ? "Saving..." : "Save"}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete plan" message={`Delete the ${deleteTarget?.name} plan?`} confirmLabel="Delete" />
    </div>
  );
}
