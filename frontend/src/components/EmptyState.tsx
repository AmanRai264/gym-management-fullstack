import { LucideIcon } from "lucide-react";

export default function EmptyState({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-ink-900/5 flex items-center justify-center mb-3">
        <Icon size={20} className="text-ink-900/40" />
      </div>
      <p className="font-medium text-ink-900/70">{title}</p>
      {description && <p className="text-sm text-ink-900/45 mt-1 max-w-xs">{description}</p>}
    </div>
  );
}
