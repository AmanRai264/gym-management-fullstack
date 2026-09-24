import { ReactNode } from "react";
import { X } from "lucide-react";

export default function Modal({
  title, open, onClose, children, width = "max-w-lg",
}: { title: string; open: boolean; onClose: () => void; children: ReactNode; width?: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative bg-white w-full ${width} sm:rounded-2xl shadow-xl max-h-screen sm:max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-900/8 sticky top-0 bg-white z-10">
          <h3 className="font-display font-semibold text-lg">{title}</h3>
          <button onClick={onClose} className="text-ink-900/40 hover:text-ink-900">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
