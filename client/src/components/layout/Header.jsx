/* eslint-disable no-unused-vars */
// client/src/components/layout/Header.jsx — PREMIUM REDESIGN
import { useState, useEffect } from 'react';
import { Menu, Bell, LogOut, User, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useNavigate, useLocation } from 'react-router-dom';

const PAGE_META = {
  '/dashboard': { title: 'Dashboard',  sub: 'Portfolio overview' },
  '/customers': { title: 'Customers',  sub: 'Client registry' },
  '/loans':     { title: 'Loans',      sub: 'Loan portfolio' },
  '/payments':  { title: 'Payments',   sub: 'Payment history' },
  '/reports':   { title: 'Reports',    sub: 'Analytics & insights' },
  '/settings':  { title: 'Settings',   sub: 'Account preferences' },
};

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'payment', icon: '💰', title: 'Payment Received',  message: 'John Doe paid KES 5,000 on LN2506001', time: '5m ago',  read: false },
  { id: 2, type: 'overdue', icon: '⚠️', title: 'Loan Overdue',      message: 'Loan LN2506002 is 3 days past due',   time: '1h ago',  read: false },
  { id: 3, type: 'system',  icon: '✅', title: 'Loan Approved',     message: 'LN2506003 approved by admin',         time: '2h ago',  read: true  },
  { id: 4, type: 'system',  icon: '🔔', title: 'System Update',     message: 'New features in Reports',            time: '1d ago',  read: true  },
];

const formatDate = () => {
  return new Date().toLocaleDateString('en-KE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
};

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const meta = (() => {
    const key = Object.keys(PAGE_META).find((k) => location.pathname.startsWith(k));
    return key ? PAGE_META[key] : { title: 'DebtMS', sub: formatDate() };
  })();

  const markAsRead = (id) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const dismiss = (id) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border bg-background/95 backdrop-blur-sm px-4 md:px-6">
      {/* Mobile menu */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden h-8 w-8"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <h1 className="text-[15px] font-semibold tracking-tight text-foreground leading-none">
            {meta.title}
          </h1>
          <span className="hidden md:block text-[12px] text-muted-foreground">
            {meta.sub}
          </span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1.5">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <p className="text-sm font-semibold">Notifications</p>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[11px] font-medium text-primary hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">All caught up</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`relative flex items-start gap-3 px-4 py-3 border-b border-border/50 cursor-pointer transition-colors last:border-0 ${
                      n.read ? 'hover:bg-muted/40' : 'bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/30'
                    }`}
                    onClick={() => markAsRead(n.id)}
                  >
                    {!n.read && (
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500" />
                    )}
                    <span className="text-base flex-shrink-0 mt-0.5">{n.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-foreground leading-tight">{n.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">{n.time}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                      className="flex-shrink-0 text-muted-foreground/40 hover:text-muted-foreground mt-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Divider */}
        <div className="w-px h-5 bg-border mx-1" />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 px-2 gap-2 text-muted-foreground hover:text-foreground">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[10px] font-semibold bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:block text-[13px] font-medium text-foreground max-w-[120px] truncate">
                {user?.fullName?.split(' ')[0]}
              </span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="pb-1">
              <p className="text-sm font-semibold truncate">{user?.fullName}</p>
              <p className="text-[11px] text-muted-foreground font-normal truncate">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings')} className="text-sm gap-2">
              <User className="h-3.5 w-3.5" />
              Profile settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="text-sm gap-2 text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;