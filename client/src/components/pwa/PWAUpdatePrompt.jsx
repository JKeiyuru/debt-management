// client/src/components/pwa/PWAUpdatePrompt.jsx
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';

const PWAUpdatePrompt = ({ onUpdate }) => {
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-in slide-in-from-bottom-5">
      <Alert className="shadow-2xl border-2 border-blue-500 bg-white">
        <AlertCircle className="h-5 w-5 text-blue-500" />
        <AlertDescription className="ml-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-gray-900 mb-1">
                🎉 New Version Available!
              </p>
              <p className="text-sm text-gray-600">
                Update now to get the latest features and improvements.
              </p>
            </div>
            <Button
              onClick={onUpdate}
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 flex-shrink-0"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Update
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default PWAUpdatePrompt;


// client/src/components/pwa/OfflineIndicator.jsx
export const OfflineIndicator = ({ isOnline }) => {
  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white py-2 px-4 text-center text-sm font-medium animate-in slide-in-from-top-2">
      <div className="flex items-center justify-center gap-2">
        <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
        <span>You're offline. Some features may be limited.</span>
      </div>
    </div>
  );
};