import { useEffect, useState, FormEvent } from "react";
import { Plus, Dumbbell, Trash2 } from "lucide-react";
import api from "../services/api";
import Modal from "../components/Modal";
import Loading from "../components/Loading";
import ConfirmDialog from "../components/ConfirmDialog";

const categories = ["Weight Loss", "Muscle Gain", "Strength", "Beginner", "Intermediate", "Advanced", "Cardio", "Functional Training"];

export default function WorkoutPlans() {
  const [plans, setPlans] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");

  const emptyExercise = { name: "", muscleGroup: "", sets: "3", reps: "10", weight: "", restTime: "60s" };
  const emptyForm = { title: "", category: "Beginner", member: "", trainer: "", exercises: [{ ...emptyExercise }] };
  const [form, setForm] = useState<any>(emptyForm);

  const load = async () => {
    setLoading(true);
    const res = await api.get("/workout-plans", { params: { category: categoryFilter } });
    setPlans(res.data.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    api.get("/members", { params: { limit: 200 } }).then((res) => setMembers(res.data.data));
    api.get("/trainers").then((res) => setTrainers(res.data.data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter]);

  const updateExercise = (i: number, field: string, value: string) => {
    const exercises = [...form.exercises];
    exercises[i] = { ...exercises[i], [field]: value };
    setForm({ ...form, exercises });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, exercises: form.exercises.map((ex: any) => ({ ...ex, sets: Number(ex.sets) })) };
      if (!payload.member) delete payload.member;
      if (!payload.trainer) delete payload.trainer;
      await api.post("/workout-plans", payload);
      setModalOpen(false);
      setForm(emptyForm);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await api.delete(`/workout-plans/${deleteTarget._id}`);
    load();
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Workout Plans</h1>
          <p className="text-sm text-ink-900/50">Assign structured training plans to members</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 px-3.5 py-2 text-sm rounded-xl bg-accent text-white hover:bg-accent-600 self-start">
          <Plus size={15} /> Create Plan
        </button>
      </div>

      <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-white border border-ink-900/10 rounded-xl px-3 py-2 text-sm max-w-xs">
        <option value="">All categories</option>
        {categories.map((c) => <option key={c}>{c}</option>)}
      </select>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((p) => (
          <div key={p._id} className="bg-white rounded-2xl border border-ink-900/8 p-5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-display font-semibold flex items-center gap-1.5"><Dumbbell size={15} className="text-accent" />{p.title}</h3>
                <p className="text-xs text-ink-900/45">{p.member?.fullName || "Template"} · {p.trainer?.name || "—"}</p>
              </div>
              <span className="text-xs bg-accent/10 text-accent-600 px-2 py-0.5 rounded-full shrink-0">{p.category}</span>
            </div>
            <ul className="text-sm text-ink-900/60 space-y-1 mb-3">
              {p.exercises?.slice(0, 5).map((ex: any, i: number) => (
                <li key={i}>• {ex.name} — {ex.sets}×{ex.reps} {ex.weight && `@ ${ex.weight}`}</li>
              ))}
            </ul>
            <div className="flex justify-end pt-2 border-t border-ink-900/5">
              <button onClick={() => setDeleteTarget(p)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
        {plans.length === 0 && <p className="text-sm text-ink-900/40 py-8 text-center sm:col-span-3">No workout plans yet.</p>}
      </div>

      <Modal title="Create Workout Plan" open={modalOpen} onClose={() => setModalOpen(false)} width="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1.5">Title</label><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-sm font-medium mb-1.5">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input">
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium mb-1.5">Member</label>
              <select value={form.member} onChange={(e) => setForm({ ...form, member: e.target.value })} className="input">
                <option value="">Template only</option>
                {members.map((m: any) => <option key={m._id} value={m._id}>{m.fullName}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium mb-1.5">Trainer</label>
              <select value={form.trainer} onChange={(e) => setForm({ ...form, trainer: e.target.value })} className="input">
                <option value="">—</option>
                {trainers.map((t: any) => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium">Exercises</label>
              <button type="button" onClick={() => setForm({ ...form, exercises: [...form.exercises, { ...emptyExercise }] })} className="text-xs text-accent hover:underline">+ Add exercise</button>
            </div>
            <div className="space-y-2">
              {form.exercises.map((ex: any, i: number) => (
                <div key={i} className="grid grid-cols-5 gap-1.5">
                  <input placeholder="Exercise" value={ex.name} onChange={(e) => updateExercise(i, "name", e.target.value)} className="input col-span-2 !py-1.5 text-xs" />
                  <input placeholder="Sets" type="number" value={ex.sets} onChange={(e) => updateExercise(i, "sets", e.target.value)} className="input !py-1.5 text-xs" />
                  <input placeholder="Reps" value={ex.reps} onChange={(e) => updateExercise(i, "reps", e.target.value)} className="input !py-1.5 text-xs" />
                  <input placeholder="Weight" value={ex.weight} onChange={(e) => updateExercise(i, "weight", e.target.value)} className="input !py-1.5 text-xs" />
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

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete plan" message={`Delete "${deleteTarget?.title}"?`} confirmLabel="Delete" />
    </div>
  );
}
