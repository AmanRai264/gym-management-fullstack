import { useEffect, useState, FormEvent } from "react";
import { Plus, Printer, Search } from "lucide-react";
import api from "../services/api";
import Modal from "../components/Modal";
import Badge from "../components/Badge";
import Loading from "../components/Loading";
import { formatCurrency, formatDate } from "../utils/format";
import type { Member, MembershipPlan, Payment } from "../types";

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [invoiceTarget, setInvoiceTarget] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const emptyForm = { member: "", membershipPlan: "", amount: "", discount: "0", tax: "0", method: "Cash", status: "paid", notes: "" };
  const [form, setForm] = useState<any>(emptyForm);

  const load = async () => {
    setLoading(true);
    const res = await api.get("/payments", { params: { search, status: statusFilter, limit: 30 } });
    setPayments(res.data.data);
    setLoading(false);
  };

  useEffect(() => {
    api.get("/members", { params: { limit: 200 } }).then((res) => setMembers(res.data.data));
    api.get("/membership-plans").then((res) => setPlans(res.data.data));
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  const onPlanChange = (planId: string) => {
    const plan = plans.find((p) => p._id === planId);
    setForm((f: any) => ({ ...f, membershipPlan: planId, amount: plan ? String(plan.price) : f.amount, tax: plan ? String(Math.round(plan.price * 0.18)) : f.tax }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/payments", { ...form, amount: Number(form.amount), discount: Number(form.discount), tax: Number(form.tax) });
      setModalOpen(false);
      setForm(emptyForm);
      load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Payments & Billing</h1>
          <p className="text-sm text-ink-900/50">Record payments and generate invoices</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 px-3.5 py-2 text-sm rounded-xl bg-accent text-white hover:bg-accent-600 self-start">
          <Plus size={15} /> Record Payment
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex items-center gap-2 bg-white border border-ink-900/10 rounded-xl px-3 py-2 flex-1">
          <Search size={15} className="text-ink-900/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by member name or ID..." className="bg-transparent text-sm outline-none w-full" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-white border border-ink-900/10 rounded-xl px-3 py-2 text-sm">
          <option value="">All statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-ink-900/8 overflow-hidden">
        {loading ? <Loading /> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-ink-900/45 bg-ink-900/[0.02] border-b border-ink-900/8">
                <th className="px-4 py-3 font-medium">Invoice</th>
                <th className="px-4 py-3 font-medium">Member</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Method</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium text-right">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p: any) => (
                <tr key={p._id} className="border-b border-ink-900/5 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs">{p.invoiceNumber}</td>
                  <td className="px-4 py-3">{p.member?.fullName}</td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(p.finalAmount)}</td>
                  <td className="px-4 py-3">{p.method}</td>
                  <td className="px-4 py-3"><Badge status={p.status} /></td>
                  <td className="px-4 py-3 text-ink-900/50">{formatDate(p.date)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setInvoiceTarget(p)} className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
                      <Printer size={13} /> View
                    </button>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-ink-900/40">No payments found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      <Modal title="Record Payment" open={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1.5">Member</label>
            <select required value={form.member} onChange={(e) => setForm({ ...form, member: e.target.value })} className="input">
              <option value="">Select member</option>
              {members.map((m) => <option key={m._id} value={m._id}>{m.fullName} ({m.memberId})</option>)}
            </select>
          </div>
          <div><label className="block text-sm font-medium mb-1.5">Membership Plan</label>
            <select value={form.membershipPlan} onChange={(e) => onPlanChange(e.target.value)} className="input">
              <option value="">None</option>
              {plans.map((p) => <option key={p._id} value={p._id}>{p.name} — {formatCurrency(p.price)}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-sm font-medium mb-1.5">Amount (₹)</label><input type="number" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="input" /></div>
            <div><label className="block text-sm font-medium mb-1.5">Discount (₹)</label><input type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} className="input" /></div>
            <div><label className="block text-sm font-medium mb-1.5">Tax (₹)</label><input type="number" value={form.tax} onChange={(e) => setForm({ ...form, tax: e.target.value })} className="input" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1.5">Payment Method</label>
              <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} className="input">
                <option>Cash</option><option>UPI</option><option>Credit Card</option><option>Debit Card</option><option>Bank Transfer</option>
              </select>
            </div>
            <div><label className="block text-sm font-medium mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input">
                <option value="paid">Paid</option><option value="pending">Pending</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm rounded-lg border border-ink-900/10">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-accent text-white hover:bg-accent-600 disabled:opacity-60">{saving ? "Saving..." : "Record Payment"}</button>
          </div>
        </form>
      </Modal>

      <Modal title="Invoice" open={!!invoiceTarget} onClose={() => setInvoiceTarget(null)} width="max-w-md">
        {invoiceTarget && (
          <div id="invoice-print">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="font-display font-semibold text-lg">PowerFit Gym</p>
                <p className="text-xs text-ink-900/45">204 Marine Drive, Mumbai</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-ink-900/45">Invoice</p>
                <p className="font-mono text-sm font-medium">{invoiceTarget.invoiceNumber}</p>
              </div>
            </div>
            <div className="space-y-1.5 text-sm mb-4">
              <div className="flex justify-between"><span className="text-ink-900/50">Member</span><span className="font-medium">{invoiceTarget.member?.fullName}</span></div>
              <div className="flex justify-between"><span className="text-ink-900/50">Plan</span><span>{invoiceTarget.membershipPlan?.name || "—"}</span></div>
              <div className="flex justify-between"><span className="text-ink-900/50">Date</span><span>{formatDate(invoiceTarget.date)}</span></div>
              <div className="flex justify-between"><span className="text-ink-900/50">Payment Method</span><span>{invoiceTarget.method}</span></div>
              <div className="flex justify-between"><span className="text-ink-900/50">Status</span><Badge status={invoiceTarget.status} /></div>
            </div>
            <div className="border-t border-ink-900/10 pt-3 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-ink-900/50">Amount</span><span>{formatCurrency(invoiceTarget.amount)}</span></div>
              <div className="flex justify-between"><span className="text-ink-900/50">Discount</span><span>- {formatCurrency(invoiceTarget.discount)}</span></div>
              <div className="flex justify-between"><span className="text-ink-900/50">Tax</span><span>+ {formatCurrency(invoiceTarget.tax)}</span></div>
              <div className="flex justify-between font-display font-semibold text-base pt-2 border-t border-ink-900/10 mt-2"><span>Total</span><span>{formatCurrency(invoiceTarget.finalAmount)}</span></div>
            </div>
            <button onClick={() => window.print()} className="mt-6 w-full flex items-center justify-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-ink-900 text-white hover:bg-ink-800">
              <Printer size={15} /> Print Invoice
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
