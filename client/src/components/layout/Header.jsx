import { useState, useEffect } from 'react';
import { Menu, Bell, LogOut, User, Check, X } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../ui/badge';
import api from '../../lib/api';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      // Simulated notifications - in production, this would come from your API
      const mockNotifications = [
        {
          id: 1,
          type: 'payment',
          title: 'Payment Received',
          message: 'John Doe paid KES 5,000 for loan LN2512001',
          time: '5 minutes ago',
          read: false,
          icon: '💰'
        },
        {
          id: 2,
          type: 'overdue',
          title: 'Loan Overdue',
          message: 'Loan LN2512002 is 3 days overdue',
          time: '1 hour ago',
          read: false,
          icon: '⚠️'
        },
        {
          id: 3,
          type: 'approval',
          title: 'Loan Approved',
          message: 'Loan LN2512003 has been approved',
          time: '2 hours ago',
          read: true,
          icon: '✅'
        },
        {
          id: 4,
          type: 'system',
          title: 'System Update',
          message: 'New features available in Reports section',
          time: '1 day ago',
          read: true,
          icon: '🔔'
        }
      ];

      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleLogout = () => {
    logout();
  };

  const getNotificationColor = (type) => {
    switch(type) {
      case 'payment': return 'bg-green-50 border-green-200';
      case 'overdue': return 'bg-red-50 border-red-200';
      case 'approval': return 'bg-blue-50 border-blue-200';
      case 'system': return 'bg-purple-50 border-purple-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-white px-4 md:px-6 shadow-sm">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-6 w-6" />
      </Button>

      <div className="flex-1" />

      {/* Notifications */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between px-2 py-2">
            <DropdownMenuLabel className="text-base">Notifications</DropdownMenuLabel>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-xs h-7"
              >
                Mark all read
              </Button>
            )}
          </div>
          <DropdownMenuSeparator />
          
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
              <p className="text-xs">You're all caught up! 🎉</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id}>
                <div 
                  className={`px-3 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 ${
                    notification.read ? 'border-transparent' : 'border-blue-500'
                  } ${!notification.read ? 'bg-blue-50/30' : ''}`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{notification.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                        {notification.title}
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearNotification(notification.id);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <DropdownMenuSeparator />
              </div>
            ))
          )}

          {notifications.length > 0 && (
            <div className="p-2">
              <Button 
                variant="ghost" 
                className="w-full text-sm text-blue-600 hover:text-blue-700"
                onClick={() => navigate('/notifications')}
              >
                View all notifications
              </Button>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.profileImage} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                {user?.fullName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{user?.fullName}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/settings')}>
            <User className="mr-2 h-4 w-4" />
            Profile Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default Header;