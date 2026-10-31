import React from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-item ${toast.type} animate-fade-in`}>
          {toast.type === 'success' ? (
            <CheckCircle2 size={18} className="toast-icon success-icon" />
          ) : (
            <AlertTriangle size={18} className="toast-icon error-icon" />
          )}
          <span className="toast-text">{toast.message}</span>
          <button onClick={() => onDismiss(toast.id)} className="toast-dismiss">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
