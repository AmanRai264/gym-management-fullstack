import { Loader2 } from "lucide-react";

export default function Loading({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-ink-900/40 text-sm">
      <Loader2 size={16} className="animate-spin" />
      {label}
    </div>
  );
}
