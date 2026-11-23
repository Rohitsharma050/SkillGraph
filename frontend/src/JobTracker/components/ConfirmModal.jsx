import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ message, onConfirm, onCancel }) {
  // Close on Escape
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onCancel]);

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onCancel();
  };

  return (
    <div
      onClick={handleBackdrop}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.32)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        className="sg-modal"
        style={{
          background: 'var(--c-surface)',
          border: '1px solid var(--c-border)',
          borderRadius: 12,
          width: '100%', maxWidth: 380,
          margin: '0 16px',
          padding: '24px 24px 20px',
          boxShadow: '0 16px 48px rgba(0,0,0,0.14)',
          display: 'flex', flexDirection: 'column', gap: 20,
        }}
      >
        {/* Icon + message */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--c-rejected-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={20} color="var(--c-rejected)" />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-txt)', marginBottom: 4 }}>
              Delete job?
            </p>
            <p style={{ fontSize: 12, color: 'var(--c-txt-2)', lineHeight: 1.6 }}>
              {message || 'Are you sure you want to delete this job? This action cannot be undone.'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button onClick={onCancel} className="sg-btn-ghost" style={{ flex: 1 }}>
            Cancel
          </button>
          <button onClick={onConfirm} className="sg-btn-danger" style={{ flex: 1, justifyContent: 'center' }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
