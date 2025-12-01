// client/src/components/ui/use-toast.js
import { useState } from 'react';

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 5000;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const toast = ({ title, description, variant = 'default' }) => {
    const id = Date.now();
    const newToast = { id, title, description, variant };
    
    setToasts((prev) => [...prev.slice(-TOAST_LIMIT + 1), newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_REMOVE_DELAY);

    return id;
  };

  const dismiss = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toast, toasts, dismiss };
}