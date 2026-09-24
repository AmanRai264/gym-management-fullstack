import Modal from "./Modal";

export default function ConfirmDialog({
  open, onClose, onConfirm, title, message, confirmLabel = "Confirm", danger = true,
}: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; confirmLabel?: string; danger?: boolean }) {
  return (
    <Modal title={title} open={open} onClose={onClose} width="max-w-sm">
      <p className="text-sm text-ink-900/60 mb-5">{message}</p>
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-ink-900/10 hover:bg-ink-900/5">
          Cancel
        </button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          className={`px-4 py-2 text-sm rounded-lg text-white ${danger ? "bg-red-600 hover:bg-red-700" : "bg-ink-900 hover:bg-ink-800"}`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
