import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Dumbbell, CalendarCheck, CreditCard, ClipboardList,
  Salad, TrendingUp, CalendarDays, Wrench, Receipt, FileBarChart, Settings,
  Bell, Search, LogOut, Menu, X, UserCog, Megaphone,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const navSections = [
  {
    label: "Overview",
    items: [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: null }],
  },
  {
    label: "Gym Operations",
    items: [
      { to: "/members", label: "Members", icon: Users, roles: null },
      { to: "/trainers", label: "Trainers", icon: Dumbbell, roles: ["super_admin", "gym_owner", "manager", "trainer", "receptionist"] },
      { to: "/membership-plans", label: "Membership Plans", icon: ClipboardList, roles: ["super_admin", "gym_owner", "manager"] },
      { to: "/attendance", label: "Attendance", icon: CalendarCheck, roles: null },
      { to: "/classes", label: "Classes", icon: CalendarDays, roles: null },
    ],
  },
  {
    label: "Training",
    items: [
      { to: "/workout-plans", label: "Workout Plans", icon: TrendingUp, roles: null },
      { to: "/diet-plans", label: "Diet Plans", icon: Salad, roles: null },
    ],
  },
  {
    label: "Finance",
    items: [
      { to: "/payments", label: "Payments & Billing", icon: CreditCard, roles: ["super_admin", "gym_owner", "manager", "receptionist"] },
      { to: "/expenses", label: "Expenses", icon: Receipt, roles: ["super_admin", "gym_owner", "manager"] },
      { to: "/reports", label: "Reports", icon: FileBarChart, roles: ["super_admin", "gym_owner", "manager"] },
    ],
  },
  {
    label: "Administration",
    items: [
      { to: "/equipment", label: "Equipment", icon: Wrench, roles: ["super_admin", "gym_owner", "manager"] },
      { to: "/staff", label: "Staff", icon: UserCog, roles: ["super_admin", "gym_owner"] },
      { to: "/announcements", label: "Announcements", icon: Megaphone, roles: null },
      { to: "/settings", label: "Settings", icon: Settings, roles: ["super_admin", "gym_owner"] },
    ],
  },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const canSee = (roles: string[] | null) => !roles || (user && roles.includes(user.role));

  return (
    <div className="min-h-screen bg-paper flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 h-screen w-64 bg-ink-900 text-white flex flex-col z-40 transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Dumbbell size={16} strokeWidth={2.5} />
            </div>
            <span className="font-display font-semibold tracking-tight">PowerFit</span>
          </div>
          <button className="lg:hidden text-white/60" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {navSections.map((section) => {
            const visibleItems = section.items.filter((i) => canSee(i.roles));
            if (visibleItems.length === 0) return null;
            return (
              <div key={section.label}>
                <p className="px-3 text-[11px] font-medium text-white/35 mb-1.5">{section.label}</p>
                <div className="space-y-0.5">
                  {visibleItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${
                          isActive ? "bg-accent text-white font-medium" : "text-white/70 hover:bg-white/5 hover:text-white"
                        }`
                      }
                    >
                      <item.icon size={16} />
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/5 hover:text-white transition"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 bg-white border-b border-ink-900/10 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button className="lg:hidden text-ink-900/70" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-ink-900/5 rounded-lg px-3 py-1.5 w-full max-w-xs">
              <Search size={15} className="text-ink-900/40" />
              <input
                placeholder="Search members, trainers..."
                className="bg-transparent text-sm outline-none w-full placeholder:text-ink-900/35"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <button className="relative text-ink-900/60 hover:text-ink-900">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full" />
            </button>
            <div className="flex items-center gap-2.5 pl-3 border-l border-ink-900/10">
              <div className="w-8 h-8 rounded-full bg-ink-900 text-white flex items-center justify-center text-xs font-medium shrink-0">
                {user?.name?.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:block leading-tight">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-ink-900/45 capitalize">{user?.role?.replace("_", " ")}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
