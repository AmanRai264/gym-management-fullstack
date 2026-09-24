import { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "default" | "accent" | "mint" | "amber";
  hint?: string;
}

const toneMap = {
  default: "bg-ink-900/5 text-ink-900",
  accent: "bg-accent/10 text-accent-600",
  mint: "bg-mint-50 text-mint-500",
  amber: "bg-amber-50 text-amber-600",
};

export default function StatCard({ label, value, icon: Icon, tone = "default", hint }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-ink-900/8 p-4 sm:p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-ink-900/50 mb-1.5">{label}</p>
          <p className="font-display text-2xl font-semibold tracking-tight">{value}</p>
          {hint && <p className="text-xs text-ink-900/40 mt-1">{hint}</p>}
        </div>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${toneMap[tone]}`}>
          <Icon size={17} />
        </div>
      </div>
    </div>
  );
}
