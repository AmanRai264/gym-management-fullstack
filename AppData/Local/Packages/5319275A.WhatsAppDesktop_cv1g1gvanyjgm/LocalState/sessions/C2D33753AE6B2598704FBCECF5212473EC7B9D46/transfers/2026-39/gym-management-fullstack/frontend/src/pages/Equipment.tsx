import { useEffect, useState, FormEvent } from "react";
import { Plus, Wrench, Trash2, Search } from "lucide-react";
import api from "../services/api";
import Modal from "../components/Modal";
import Loading from "../components/Loading";
import ConfirmDialog from "../components/ConfirmDialog";
import { formatDate } from "../utils/format";

const statusStyle: Record<string, string> = {
  Working: "bg-mint-50 text-mint-500 border-mint-500/20",
  "Maintenance Required": "bg-amber-50 text-amber-600 border-amber-200",
  "Under Repair": "bg-red-50 text-red-600 border-red-200",
  Retired: "bg-gray-100 text-gray-600 border-gray-200",
};

export default function Equipment() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const emptyForm = { name: "", category: "", brand: "", purchaseDate: "", purchasePrice: "", location: "", condition: "Good", status: "Working" };
  const [form, setForm] = useState<any>(emptyForm);

  const load = async () => {
    setLoading(true);
    const res = await api.get("/equipment", { params: { search, status: statusFilter } });
    setItems(res.data.data);
    setLoading(false);
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/equipment", { ...form, purchasePrice: Number(form.purchasePrice) || 0 });
      setModalOpen(false);
      setForm(emptyForm);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await api.delete(`/equipment/${deleteTarget._id}`);
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Equipment</h1>
          <p className="text-sm text-ink-900/50">Track gym equipment and maintenance</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 px-3.5 py-2 text-sm rounded-xl bg-accent text-white hover:bg-accent-600 self-start">
          <Plus size={15} /> Add Equipment
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex items-center gap-2 bg-white border border-ink-900/10 rounded-xl px-3 py-2 flex-1">
          <Search size={15} className="text-ink-900/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search equipment..." className="bg-transparent text-sm outline-none w-full" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-white border border-ink-900/10 rounded-xl px-3 py-2 text-sm">
          <option value="">All statuses</option>
          <option>Working</option><option>Maintenance Required</option><option>Under Repair</option><option>Retired</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-ink-900/8 overflow-hidden">
        {loading ? <Loading /> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-ink-900/45 bg-ink-900/[0.02] border-b border-ink-900/8">
                <th className="px-4 py-3 font-medium">Equipment</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Condition</th>
                <th className="px-4 py-3 font-medium">Next Maintenance</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it._id} className="border-b border-ink-900/5 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium flex items-center gap-1.5"><Wrench size={13} className="text-ink-900/40" />{it.name}</p>
                    <p className="text-xs text-ink-900/45">{it.brand} · {it.category}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-900/60">{it.location}</td>
                  <td className="px-4 py-3 text-ink-900/60">{it.condition}</td>
                  <td className="px-4 py-3 text-ink-900/60">{formatDate(it.nextMaintenanceDate)}</td>
                  <td className="px-4 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${statusStyle[it.status]}`}>{it.status}</span></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setDeleteTarget(it)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-ink-900/40">No equipment found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      <Modal title="Add Equipment" open={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1.5">Name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1.5">Category</label><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input" /></div>
            <div><label className="block text-sm font-medium mb-1.5">Brand</label><input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="input" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1.5">Purchase Date</label><input type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} className="input" /></div>
            <div><label className="block text-sm font-medium mb-1.5">Purchase Price (₹)</label><input type="number" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} className="input" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1.5">Location</label><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1.5">Condition</label>
              <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className="input">
                <option>Excellent</option><option>Good</option><option>Fair</option><option>Poor</option>
              </select>
            </div>
            <div><label className="block text-sm font-medium mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input">
                <option>Working</option><option>Maintenance Required</option><option>Under Repair</option><option>Retired</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm rounded-lg border border-ink-900/10">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-accent text-white hover:bg-accent-600 disabled:opacity-60">{saving ? "Saving..." : "Save"}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete equipment" message={`Remove ${deleteTarget?.name}?`} confirmLabel="Delete" />
    </div>
  );
}
