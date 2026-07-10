import { Bell, Search, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header({ title, subtitle, urgentItems = [] }) {
  const navigate = useNavigate();

  return (
    <header className="header">
      <div>
        <h1 className="header-title">{title}</h1>
        {subtitle && (
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{subtitle}</p>
        )}
      </div>
      <div className="header-actions">
        {urgentItems.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--status-urgent-bg)',
            border: '1px solid var(--status-urgent-border)',
            borderRadius: 'var(--radius-full)',
            padding: '6px 14px',
            fontSize: 13,
            color: 'var(--status-urgent)',
            fontWeight: 600,
            cursor: 'pointer',
          }} onClick={() => navigate('/pantry')}>
            🔴 {urgentItems.length} item{urgentItems.length !== 1 ? 's' : ''} need attention
          </div>
        )}
        <button
          className="btn btn-primary btn-sm"
          onClick={() => navigate('/add')}
          style={{ gap: 6 }}
        >
          <Plus size={15} /> Add Items
        </button>
      </div>
    </header>
  );
}
