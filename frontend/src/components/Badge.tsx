import { statusColor } from "../utils/format";

export default function Badge({ status, label }: { status: string; label?: string }) {
  const cls = statusColor[status] || "bg-gray-100 text-gray-600 border-gray-200";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${cls}`}>
      {(label || status).replace("_", " ")}
    </span>
  );
}
