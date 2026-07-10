import { useState } from 'react';

const ToastContext = {};
let toastSetter = null;

export function useToast() {
  const [toasts, setToasts] = useState([]);
  toastSetter = setToasts;

  const addToast = (message, type = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  return { toasts, addToast };
}

export function ToastContainer({ toasts }) {
  const icons = { success: '✅', error: '❌', info: '✨', warning: '⚠️' };
  const colors = {
    success: 'var(--fresh)',
    error: 'var(--urgent)',
    info: 'var(--violet-400)',
    warning: 'var(--warning)',
  };

  return (
    <div className="toast-stack">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`toast-v2 ${t.type}`}
          style={{ borderLeft: `3px solid ${colors[t.type] || colors.success}` }}
        >
          <span style={{ fontSize: 18 }}>{icons[t.type] || '✅'}</span>
          <span style={{ fontSize: 14, fontWeight: 500 }}>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
