// client/src/components/layout/Sidebar.jsx — PREMIUM REDESIGN
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import {
  LayoutDashboard,
  Users,
  Wallet,
  CreditCard,
  BarChart3,
  Settings,
  Briefcase,
  Plus,
  ChevronRight,
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, show: true },
      { name: 'Customers',  href: '/customers',  icon: Users,          show: true },
    ],
  },
  {
    label: 'Portfolio',
    items: [
      { name: 'Loans',    href: '/loans',    icon: Briefcase, show: true },
      { name: 'Payments', href: '/payments', icon: Wallet,    show: (u) => u?.permissions?.canProcessPayments },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { name: 'Reports',  href: '/reports',  icon: BarChart3, show: (u) => u?.permissions?.canViewReports },
      { name: 'Settings', href: '/settings', icon: Settings,  show: true },
    ],
  },
];

const Sidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isVisible = (show) =>
    typeof show === 'function' ? show(user) : show;

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-60 lg:flex-col">
      <div
        className="flex flex-col flex-grow overflow-y-auto border-r border-white/[0.06]"
        style={{ background: 'hsl(var(--sidebar-bg, 222 47% 9%))' }}
      >
        {/* ── Brand ── */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.06]">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm">
            <CreditCard className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-white/90 leading-none tracking-tight">DebtMS</p>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.8px] mt-0.5">Management Suite</p>
          </div>
        </div>

        {/* ── Quick Action ── */}
        {user?.permissions?.canProcessPayments && (
          <div className="px-3 pt-4 pb-2">
            <Button
              onClick={() => navigate('/payments/new')}
              className="w-full h-8 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium gap-1.5 shadow-none border-0 rounded-lg"
            >
              <Plus className="w-3.5 h-3.5" />
              Record Payment
            </Button>
          </div>
        )}

        {/* ── Navigation ── */}
        <nav className="flex-1 px-3 pb-4 pt-2 space-y-0">
          {NAV_SECTIONS.map((section) => {
            const visibleItems = section.items.filter((item) => isVisible(item.show));
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.label} className="mb-1">
                <p className="px-2.5 pt-4 pb-1.5 text-[9px] font-semibold uppercase tracking-[1.1px] text-white/25">
                  {section.label}
                </p>
                {visibleItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-normal transition-all duration-150 cursor-pointer select-none ${
                        isActive
                          ? 'text-blue-300 bg-blue-500/[0.12]'
                          : 'text-white/45 hover:text-white/75 hover:bg-white/[0.05]'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-0 top-[7px] bottom-[7px] w-[2.5px] rounded-r-full bg-blue-400" />
                        )}
                        <item.icon
                          className={`w-[15px] h-[15px] flex-shrink-0 transition-colors ${
                            isActive ? 'text-blue-400' : 'text-white/30 group-hover:text-white/60'
                          }`}
                        />
                        <span className="flex-1">{item.name}</span>
                        {isActive && (
                          <ChevronRight className="w-3 h-3 text-blue-400/50 flex-shrink-0" />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>

        {/* ── User Card ── */}
        {user && (
          <div className="m-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-[11px] font-semibold text-white">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-white/75 truncate leading-tight">
                  {user.fullName}
                </p>
                <p className="text-[10px] text-white/30 capitalize truncate leading-tight mt-0.5">
                  {user.role?.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;