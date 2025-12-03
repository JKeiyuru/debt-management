// client/src/hooks/usePWA.js - Simplified
import { useState, useEffect } from 'react';

export const usePWA = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    // Monitor online/offline
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);

        // Check for updates every 60 seconds
        const checkForUpdates = () => {
          reg.update().catch(() => {});
        };
        
        const interval = setInterval(checkForUpdates, 60000);

        // Listen for controller change (new SW activated)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          setNeedsUpdate(true);
        });

        return () => clearInterval(interval);
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateApp = () => {
    window.location.reload();
  };

  return {
    isOnline,
    needsUpdate,
    updateApp
  };
};

export default usePWA;