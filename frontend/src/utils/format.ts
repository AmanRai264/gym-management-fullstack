export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount || 0);

export const formatDate = (date?: string) =>
  date ? new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export const formatDateTime = (date?: string) =>
  date ? new Date(date).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

export const daysUntil = (date?: string) => {
  if (!date) return null;
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const monthLabel = (year: number, month: number) =>
  new Date(year, month - 1, 1).toLocaleDateString("en-IN", { month: "short" });

export const statusColor: Record<string, string> = {
  active: "bg-mint-50 text-mint-500 border-mint-500/20",
  expired: "bg-red-50 text-red-600 border-red-200",
  frozen: "bg-blue-50 text-blue-600 border-blue-200",
  cancelled: "bg-gray-100 text-gray-600 border-gray-200",
  paid: "bg-mint-50 text-mint-500 border-mint-500/20",
  pending: "bg-amber-50 text-amber-600 border-amber-200",
  refunded: "bg-gray-100 text-gray-600 border-gray-200",
  on_leave: "bg-amber-50 text-amber-600 border-amber-200",
  inactive: "bg-gray-100 text-gray-600 border-gray-200",
};
