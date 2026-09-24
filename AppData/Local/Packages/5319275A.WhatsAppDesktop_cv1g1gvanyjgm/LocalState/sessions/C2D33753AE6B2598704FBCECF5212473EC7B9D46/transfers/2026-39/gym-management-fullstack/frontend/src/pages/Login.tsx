import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dumbbell, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const demoAccounts = [
  { role: "Super Admin", email: "admin@gymdemo.com", password: "Admin@123" },
  { role: "Manager", email: "manager@gymdemo.com", password: "Manager@123" },
  { role: "Trainer", email: "trainer@gymdemo.com", password: "Trainer@123" },
  { role: "Receptionist", email: "reception@gymdemo.com", password: "Reception@123" },
  { role: "Member", email: "member@gymdemo.com", password: "Member@123" },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to sign in. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-paper">
      <div className="hidden lg:flex flex-col justify-between bg-ink-900 text-white p-12 relative overflow-hidden">
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -left-20 bottom-0 w-72 h-72 rounded-full bg-mint/10 blur-3xl" />
        <div className="relative z-10 flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
            <Dumbbell size={18} strokeWidth={2.5} />
          </div>
          <span className="font-display font-semibold text-lg tracking-tight">PowerFit Gym</span>
        </div>
        <div className="relative z-10 max-w-md">
          <h1 className="font-display text-4xl font-semibold leading-tight mb-4">
            Run every part of your gym from one dashboard.
          </h1>
          <p className="text-white/60 leading-relaxed">
            Members, attendance, trainers, billing and reporting — built for gym owners who want
            real numbers, not spreadsheets.
          </p>
        </div>
        <p className="relative z-10 text-xs text-white/40">Demo build · PowerFit Gym Management System</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
              <Dumbbell size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display font-semibold text-lg">PowerFit Gym</span>
          </div>

          <h2 className="font-display text-2xl font-semibold mb-1">Welcome back</h2>
          <p className="text-sm text-ink-900/50 mb-8">Sign in to manage your gym.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@gymdemo.com"
                className="w-full rounded-xl border border-ink-900/10 bg-white px-3.5 py-2.5 text-sm focus-ring focus:border-accent transition"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium">Password</label>
                <button type="button" className="text-xs text-accent hover:underline">Forgot password?</button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-ink-900/10 bg-white px-3.5 py-2.5 text-sm focus-ring focus:border-accent transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-900/40 hover:text-ink-900"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-ink-900/60">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded border-ink-900/20" />
              Remember me
            </label>

            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ink-900 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-ink-800 transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Sign in
            </button>
          </form>

          <div className="mt-8 rounded-xl border border-ink-900/10 bg-white/60 p-4">
            <p className="text-xs font-medium text-ink-900/60 mb-2">DEMO credentials — click to autofill</p>
            <div className="grid grid-cols-1 gap-1.5">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => {
                    setEmail(acc.email);
                    setPassword(acc.password);
                  }}
                  className="flex items-center justify-between text-xs rounded-lg px-2.5 py-1.5 hover:bg-ink-900/5 transition text-left"
                >
                  <span className="font-medium text-ink-900/70">{acc.role}</span>
                  <span className="text-ink-900/40 font-mono">{acc.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
