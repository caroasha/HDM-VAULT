import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';
import { clsx } from 'clsx';

const ToastContext = createContext(null);

const icons = { success: CheckCircle, error: XCircle, warning: AlertTriangle };
const colors = { success: 'border-green-500', error: 'border-red-500', warning: 'border-yellow-500' };
const iconColors = { success: 'text-green-500', error: 'text-red-500', warning: 'text-yellow-500' };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => {
          const Icon = icons[toast.type];
          return (
            <div key={toast.id} className={clsx('flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border-l-4', colors[toast.type])}>
              <Icon size={18} className={iconColors[toast.type]} />
              <p className="text-sm text-gray-800 dark:text-gray-200">{toast.message}</p>
              <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="ml-2 text-gray-400 hover:text-gray-600"><X size={14} /></button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};