// client/src/components/pwa/PWAInstallPrompt.jsx - UPDATED
import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Download, X, Smartphone, Monitor } from 'lucide-react';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for install prompt event
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      console.log('💾 Install prompt captured');
      setDeferredPrompt(e);
      
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    const handleAppInstalled = () => {
      console.log('✅ App installed!');
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      localStorage.removeItem('pwa-install-dismissed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Show manual instructions for browsers that don't support beforeinstallprompt
      showManualInstructions();
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`Install prompt: ${outcome}`);
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
      localStorage.removeItem('pwa-install-dismissed');
    }
    
    setDeferredPrompt(null);
  };

  const showManualInstructions = () => {
    const isChrome = /Chrome/.test(navigator.userAgent);
    const isEdge = /Edg/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    
    let message = 'To install this app:\n\n';
    
    if (isChrome || isEdge) {
      message += '1. Click the ⋮ menu (top right)\n';
      message += '2. Select "Install DebtMS" or "Install app"\n';
      message += '3. Click "Install" in the popup';
    } else if (isSafari && isMobile) {
      message += '1. Tap the Share button (square with arrow)\n';
      message += '2. Scroll and tap "Add to Home Screen"\n';
      message += '3. Tap "Add"';
    } else {
      message += 'Look for an install icon in your browser\'s address bar or menu.';
    }
    
    alert(message);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
    setTimeout(() => {
      localStorage.removeItem('pwa-install-dismissed');
    }, 7 * 24 * 60 * 60 * 1000);
  };

  // Don't show if already installed
  if (isInstalled) {
    return null;
  }

  // Always show a small button for manual install (even without prompt event)
  if (!showPrompt && !deferredPrompt) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <Button
          onClick={handleInstallClick}
          size="sm"
          variant="outline"
          className="shadow-lg border-2 border-blue-500 bg-white hover:bg-blue-50"
          title="Install App"
        >
          <Download className="h-4 w-4 text-blue-600" />
        </Button>
      </div>
    );
  }

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-5">
      <div className="bg-white rounded-lg shadow-2xl border-2 border-blue-500 p-4">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>

        <div className="flex items-start gap-3 mb-3">
          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
            {isMobile ? (
              <Smartphone className="h-6 w-6 text-white" />
            ) : (
              <Monitor className="h-6 w-6 text-white" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-1">Install DebtMS</h3>
            <p className="text-sm text-gray-600">
              {isMobile 
                ? 'Add to your home screen for quick access! 📱'
                : 'Install for faster access and offline support! 💻'
              }
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
          ✨ Works offline • 🚀 Faster loading • 📲 Quick access
        </p>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;