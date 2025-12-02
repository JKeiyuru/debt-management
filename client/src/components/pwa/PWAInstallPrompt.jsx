// client/src/components/pwa/PWAInstallPrompt.jsx
import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Download, X } from 'lucide-react';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Check if user has previously dismissed the prompt
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 3000); // Show after 3 seconds
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`User ${outcome === 'accepted' ? 'accepted' : 'dismissed'} the install prompt`);

    if (outcome === 'accepted') {
      setShowPrompt(false);
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
    
    // Clear after 7 days
    setTimeout(() => {
      localStorage.removeItem('pwa-install-dismissed');
    }, 7 * 24 * 60 * 60 * 1000);
  };

  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-5">
      <Card className="shadow-2xl border-2 border-blue-500">
        <CardContent className="p-4">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>

          <div className="flex items-start gap-3 mb-3">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
              <Download className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Install DebtMS</h3>
              <p className="text-sm text-gray-600">
                Install our app for faster access, offline support, and a better experience! 📱
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleInstallClick}
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              size="sm"
            >
              <Download className="mr-2 h-4 w-4" />
              Install Now
            </Button>
            <Button
              onClick={handleDismiss}
              variant="outline"
              size="sm"
            >
              Later
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-2">
            ✨ Works offline • 🚀 Faster loading • 📲 Add to home screen
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAInstallPrompt;