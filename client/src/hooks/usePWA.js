// client/src/hooks/usePWA.js
import { useState, useEffect } from 'react';

export const usePWA = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstalled, setIsInstalled] = useState(false);
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    // Check if app is installed
    const checkInstalled = () => {
      const installed = window.matchMedia('(display-mode: standalone)').matches ||
                       window.navigator.standalone === true;
      setIsInstalled(installed);
    };

    checkInstalled();

    // Monitor online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((reg) => {
          console.log('✅ Service Worker registered:', reg);
          setRegistration(reg);

          // Check for updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🆕 New version available!');
                setNeedsUpdate(true);
              }
            });
          });
        })
        .catch((err) => console.error('❌ Service Worker registration failed:', err));
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateApp = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  };

  const showNotification = (title, options = {}) => {
    if (Notification.permission === 'granted' && registration) {
      registration.showNotification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png',
        ...options
      });
    }
  };

  return {
    isOnline,
    isInstalled,
    needsUpdate,
    updateApp,
    requestNotificationPermission,
    showNotification
  };
};

export default usePWA;