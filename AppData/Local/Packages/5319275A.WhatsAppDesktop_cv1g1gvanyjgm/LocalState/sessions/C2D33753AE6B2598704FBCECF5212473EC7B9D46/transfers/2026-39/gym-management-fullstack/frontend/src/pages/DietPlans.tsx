import { useEffect, useState, FormEvent } from "react";
import { Plus, Salad, Trash2 } from "lucide-react";
import api from "../services/api";
import Modal from "../components/Modal";
import Loading from "../components/Loading";
import ConfirmDialog from "../components/ConfirmDialog";

const mealTypes = ["Breakfast", "Mid-Morning", "Lunch", "Evening", "Dinner"];

export default function DietPlans() {
  const [plans, setPlans] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const emptyForm = {
    planName: "", member: "", calories: "2000", protein: "120", carbs: "220", fat: "60",
    meals: mealTypes.map((t) => ({ type: t, time: "", items: "" })),
  };
  const [form, setForm] = useState<any>(emptyForm);

  const load = async () => {
    setLoading(true);
    const res = await api.get("/diet-plans");
    setPlans(res.data.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    api.get("/members", { params: { limit: 200 } }).then((res) => setMembers(res.data.data));
  }, []);

  const updateMeal = (i: number, field: string, value: string) => {
    const meals = [...form.meals];
    meals[i] = { ...meals[i], [field]: value };
    setForm({ ...form, meals });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        calories: Number(form.calories), protein: Number(form.protein), carbs: Number(form.carbs), fat: Number(form.fat),
        meals: form.meals.filter((m: any) => m.items).map((m: any) => ({ ...m, items: m.items.split(",").map((s: string) => s.trim()) })),
      };
      if (!payload.member) delete payload.member;
      await api.post("/diet-plans", payload);
      setModalOpen(false);
      setForm(emptyForm);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await api.delete(`/diet-plans/${deleteTarget._id}`);
    load();
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Diet Plans</h1>
          <p className="text-sm text-ink-900/50">Nutrition plans for members</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 px-3.5 py-2 text-sm rounded-xl bg-accent text-white hover:bg-accent-600 self-start">
          <Plus size={15} /> Create Plan
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((p) => (
          <div key={p._id} className="bg-white rounded-2xl border border-ink-900/8 p-5">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-display font-semibold flex items-center gap-1.5"><Salad size={15} className="text-mint-500" />{p.planName}</h3>
            </div>
            <p className="text-xs text-ink-900/45 mb-2">{p.member?.fullName || "Template"}</p>
            <p className="text-xs text-ink-900/50 mb-3">{p.calories} kcal · {p.protein}g P · {p.carbs}g C · {p.fat}g F</p>
            <ul className="text-sm text-ink-900/60 space-y-1 mb-3">
              {p.meals?.map((m: any, i: number) => (
                <li key={i}>• {m.type} ({m.time}) — {m.items?.join(", ")}</li>
              ))}
            </ul>
            <div className="flex justify-end pt-2 border-t border-ink-900/5">
              <button onClick={() => setDeleteTarget(p)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
        {plans.length === 0 && <p className="text-sm text-ink-900/40 py-8 text-center sm:col-span-3">No diet plans yet.</p>}
      </div>

      <Modal title="Create Diet Plan" open={modalOpen} onClose={() => setModalOpen(false)} width="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1.5">Plan Name</label><input required value={form.planName} onChange={(e) => setForm({ ...form, planName: e.target.value })} className="input" /></div>
          <div><label className="block text-sm font-medium mb-1.5">Member</label>
            <select value={form.member} onChange={(e) => setForm({ ...form, member: e.target.value })} className="input">
              <option value="">Template only</option>
              {members.map((m: any) => <option key={m._id} value={m._id}>{m.fullName}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div><label className="block text-xs font-medium mb-1.5">Calories</label><input type="number" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} className="input" /></div>
            <div><label className="block text-xs font-medium mb-1.5">Protein (g)</label><input type="number" value={form.protein} onChange={(e) => setForm({ ...form, protein: e.target.value })} className="input" /></div>
            <div><label className="block text-xs font-medium mb-1.5">Carbs (g)</label><input type="number" value={form.carbs} onChange={(e) => setForm({ ...form, carbs: e.target.value })} className="input" /></div>
            <div><label className="block text-xs font-medium mb-1.5">Fat (g)</label><input type="number" value={form.fat} onChange={(e) => setForm({ ...form, fat: e.target.value })} className="input" /></div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Meals</label>
            <div className="space-y-2">
              {form.meals.map((m: any, i: number) => (
                <div key={m.type} className="grid grid-cols-4 gap-1.5 items-center">
                  <span className="text-xs text-ink-900/50">{m.type}</span>
                  <input placeholder="Time" value={m.time} onChange={(e) => updateMeal(i, "time", e.target.value)} className="input !py-1.5 text-xs" />
                  <input placeholder="Items (comma separated)" value={m.items} onChange={(e) => updateMeal(i, "items", e.target.value)} className="input col-span-2 !py-1.5 text-xs" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm rounded-lg border border-ink-900/10">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-accent text-white hover:bg-accent-600 disabled:opacity-60">{saving ? "Saving..." : "Create Plan"}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete plan" message={`Delete "${deleteTarget?.planName}"?`} confirmLabel="Delete" />
    </div>
  );
}
