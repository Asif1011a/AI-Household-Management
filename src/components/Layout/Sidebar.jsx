import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Package, PlusCircle, ChefHat,
  BarChart3, Settings, Leaf, AlertTriangle
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pantry', icon: Package, label: 'My Pantry' },
  { to: '/add', icon: PlusCircle, label: 'Add Items' },
  { to: '/recipes', icon: ChefHat, label: 'Recipes' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ urgentCount }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🌿</div>
        <span className="sidebar-logo-text">GreenBite</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} className="nav-icon" />
            {label}
            {label === 'My Pantry' && urgentCount > 0 && (
              <span className="nav-badge">{urgentCount}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px',
          background: 'rgba(34, 197, 94, 0.06)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(34, 197, 94, 0.15)',
        }}>
          <Leaf size={16} style={{ color: 'var(--green-400)', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--green-400)' }}>Eco Impact</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Saving food daily 🌍</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
