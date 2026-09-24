import { useEffect, useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Download, Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../services/api";
import Modal from "../components/Modal";
import Badge from "../components/Badge";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../components/ConfirmDialog";
import { formatDate } from "../utils/format";
import type { Member, MembershipPlan, Trainer } from "../types";

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [saving, setSaving] = useState(false);

  const emptyForm = {
    fullName: "", dob: "", gender: "Male", phone: "", email: "", address: "", emergencyContact: "",
    membershipPlan: "", bloodGroup: "", height: "", weight: "", medicalNotes: "", assignedTrainer: "",
  };
  const [form, setForm] = useState<any>(emptyForm);

  const loadMembers = async () => {
    setLoading(true);
    const res = await api.get("/members", { params: { search, status: statusFilter, page, limit: 10 } });
    setMembers(res.data.data);
    setPages(res.data.pages);
    setTotal(res.data.total);
    setLoading(false);
  };

  useEffect(() => {
    api.get("/membership-plans").then((res) => setPlans(res.data.data));
    api.get("/trainers").then((res) => setTrainers(res.data.data));
  }, []);

  useEffect(() => {
    const t = setTimeout(loadMembers, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, page]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (m: Member) => {
    setEditing(m);
    setForm({
      fullName: m.fullName, dob: m.dob?.slice(0, 10) || "", gender: m.gender || "Male",
      phone: m.phone || "", email: m.email || "", address: m.address || "", emergencyContact: m.emergencyContact || "",
      membershipPlan: typeof m.membershipPlan === "object" ? m.membershipPlan?._id : m.membershipPlan || "",
      bloodGroup: m.bloodGroup || "", height: m.height || "", weight: m.weight || "", medicalNotes: m.medicalNotes || "",
      assignedTrainer: typeof m.assignedTrainer === "object" ? m.assignedTrainer?._id : m.assignedTrainer || "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, height: form.height ? Number(form.height) : undefined, weight: form.weight ? Number(form.weight) : undefined };
      if (!payload.membershipPlan) delete payload.membershipPlan;
      if (!payload.assignedTrainer) delete payload.assignedTrainer;
      if (editing) {
        if (payload.membershipPlan) payload.membershipStartDate = editing.membershipStartDate || new Date().toISOString();
        await api.put(`/members/${editing._id}`, payload);
      } else {
        await api.post("/members", payload);
      }
      setModalOpen(false);
      loadMembers();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await api.delete(`/members/${deleteTarget._id}`);
    loadMembers();
  };

  const exportCsv = () => {
    const rows = members.map((m) => [m.memberId, m.fullName, m.phone, m.email, m.status, formatDate(m.membershipExpiryDate)]);
    const csv = ["Member ID,Name,Phone,Email,Status,Expiry", ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "members.csv";
    a.click();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Members</h1>
          <p className="text-sm text-ink-900/50">{total} total members</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCsv} className="flex items-center gap-1.5 px-3.5 py-2 text-sm rounded-xl border border-ink-900/10 bg-white hover:bg-ink-900/5">
            <Download size={15} /> Export
          </button>
          <button onClick={openCreate} className="flex items-center gap-1.5 px-3.5 py-2 text-sm rounded-xl bg-accent text-white hover:bg-accent-600">
            <Plus size={15} /> Add Member
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex items-center gap-2 bg-white border border-ink-900/10 rounded-xl px-3 py-2 flex-1">
          <Search size={15} className="text-ink-900/40" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, ID, phone or email..."
            className="bg-transparent text-sm outline-none w-full"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-white border border-ink-900/10 rounded-xl px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="frozen">Frozen</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-ink-900/8 overflow-hidden">
        {loading ? (
          <Loading />
        ) : members.length === 0 ? (
          <EmptyState icon={Search} title="No members found" description="Try adjusting your search or filters, or add a new member." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-ink-900/45 bg-ink-900/[0.02] border-b border-ink-900/8">
                    <th className="px-4 py-3 font-medium">Member</th>
                    <th className="px-4 py-3 font-medium">Contact</th>
                    <th className="px-4 py-3 font-medium">Plan</th>
                    <th className="px-4 py-3 font-medium">Expiry</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m._id} className="border-b border-ink-900/5 last:border-0 hover:bg-ink-900/[0.015]">
                      <td className="px-4 py-3">
                        <p className="font-medium">{m.fullName}</p>
                        <p className="text-xs text-ink-900/45 font-mono">{m.memberId}</p>
                      </td>
                      <td className="px-4 py-3 text-ink-900/60">
                        <p>{m.phone}</p>
                        <p className="text-xs text-ink-900/40">{m.email}</p>
                      </td>
                      <td className="px-4 py-3 text-ink-900/60">
                        {typeof m.membershipPlan === "object" ? m.membershipPlan?.name : "—"}
                      </td>
                      <td className="px-4 py-3 text-ink-900/60">{formatDate(m.membershipExpiryDate)}</td>
                      <td className="px-4 py-3"><Badge status={m.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/members/${m._id}`} className="p-1.5 rounded-lg hover:bg-ink-900/5 text-ink-900/50"><Eye size={15} /></Link>
                          <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg hover:bg-ink-900/5 text-ink-900/50"><Pencil size={15} /></button>
                          <button onClick={() => setDeleteTarget(m)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-ink-900/8">
              <p className="text-xs text-ink-900/45">Page {page} of {pages || 1}</p>
              <div className="flex gap-1.5">
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="p-1.5 rounded-lg border border-ink-900/10 disabled:opacity-30"><ChevronLeft size={15} /></button>
                <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="p-1.5 rounded-lg border border-ink-900/10 disabled:opacity-30"><ChevronRight size={15} /></button>
              </div>
            </div>
          </>
        )}
      </div>

      <Modal title={editing ? "Edit Member" : "Add Member"} open={modalOpen} onClose={() => setModalOpen(false)} width="max-w-2xl">
        <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
          <Field label="Full Name" required>
            <input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="input" />
          </Field>
          <Field label="Date of Birth">
            <input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} className="input" />
          </Field>
          <Field label="Gender">
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="input">
              <option>Male</option><option>Female</option><option>Other</option>
            </select>
          </Field>
          <Field label="Phone">
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" />
          </Field>
          <Field label="Email">
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
          </Field>
          <Field label="Emergency Contact">
            <input value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} className="input" />
          </Field>
          <Field label="Address" full>
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input" />
          </Field>
          <Field label="Membership Plan">
            <select value={form.membershipPlan} onChange={(e) => setForm({ ...form, membershipPlan: e.target.value })} className="input">
              <option value="">Select plan</option>
              {plans.map((p) => <option key={p._id} value={p._id}>{p.name} — ₹{p.price}</option>)}
            </select>
          </Field>
          <Field label="Assigned Trainer">
            <select value={form.assignedTrainer} onChange={(e) => setForm({ ...form, assignedTrainer: e.target.value })} className="input">
              <option value="">Unassigned</option>
              {trainers.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
          </Field>
          <Field label="Blood Group">
            <input value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} className="input" placeholder="O+" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Height (cm)">
              <input type="number" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} className="input" />
            </Field>
            <Field label="Weight (kg)">
              <input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="input" />
            </Field>
          </div>
          <Field label="Medical Notes" full>
            <textarea value={form.medicalNotes} onChange={(e) => setForm({ ...form, medicalNotes: e.target.value })} className="input" rows={2} />
          </Field>
          <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm rounded-lg border border-ink-900/10">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-accent text-white hover:bg-accent-600 disabled:opacity-60">
              {saving ? "Saving..." : editing ? "Save Changes" : "Add Member"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete member"
        message={`Are you sure you want to delete ${deleteTarget?.fullName}? This cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}

function Field({ label, children, full, required }: { label: string; children: React.ReactNode; full?: boolean; required?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="block text-sm font-medium mb-1.5">{label}{required && <span className="text-accent"> *</span>}</label>
      {children}
    </div>
  );
}
