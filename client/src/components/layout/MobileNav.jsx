// client/src/components/layout/MobileNav.jsx - WITH OPTIONAL QUICK ACTION
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { 
  X, 
  LayoutDashboard, 
  Users, 
  Wallet, 
  Briefcase, 
  BarChart3, 
  Settings, 
  CreditCard,
  Plus
} from 'lucide-react';

const MobileNav = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, show: true },
    { name: 'Customers', href: '/customers', icon: Users, show: true },
    { name: 'Loans', href: '/loans', icon: Briefcase, show: true },
    { name: 'Payments', href: '/payments', icon: Wallet, show: user?.permissions?.canProcessPayments },
    { name: 'Reports', href: '/reports', icon: BarChart3, show: user?.permissions?.canViewReports },
    { name: 'Settings', href: '/settings', icon: Settings, show: true }
  ].filter(item => item.show);

  const handleQuickPayment = () => {
    navigate('/payments/new');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 lg:hidden transform transition-transform duration-300">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">DebtMS</h1>
                <p className="text-xs text-slate-400">Debt Management</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Quick Action - OPTIONAL */}
          {user?.permissions?.canProcessPayments && (
            <div className="px-3 py-4 border-b border-slate-700">
              <Button 
                onClick={handleQuickPayment}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Record Payment
              </Button>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  }`
                }
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* User info */}
          {user && (
            <div className="p-4 bg-slate-900/50 border-t border-slate-700">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                  {user.fullName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user.fullName}
                  </p>
                  <p className="text-xs text-slate-400 truncate capitalize">
                    {user.role.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default MobileNav;