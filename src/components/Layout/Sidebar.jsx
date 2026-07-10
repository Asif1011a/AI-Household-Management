import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Plus, ChefHat, BarChart3, HeartPulse, LogOut } from 'lucide-react';
import { logoutUser } from '../../services/storage';

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pantry', icon: Package, label: 'Pantry' },
  { to: '/add', icon: Plus, label: 'Add Items', isPrimary: true },
  { to: '/recipes', icon: ChefHat, label: 'Recipes' },
  { to: '/health', icon: HeartPulse, label: 'Health Insights' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
];

export default function Sidebar({ urgentCount }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logoutUser();
    window.location.reload();
  };

  return (
    <nav className="desktop-sidebar">
      <div className="sidebar-header">
        <div className="topbar-logo-mark">🌿</div>
        <span className="topbar-title">GreenBite</span>
      </div>

      <div className="sidebar-nav">
        {NAV.map(({ to, icon: Icon, label, isPrimary }) => {
          const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
          const showBadge = to === '/pantry' && urgentCount > 0;

          if (isPrimary) {
            return (
              <button
                key={to}
                className="sidebar-btn-primary"
                onClick={() => navigate(to)}
              >
                <Icon size={20} strokeWidth={2.5} />
                <span>{label}</span>
              </button>
            );
          }

          return (
            <button
              key={to}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(to)}
            >
              <div style={{ position: 'relative' }}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                {showBadge && <span className="sidebar-badge" />}
              </div>
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <button className="sidebar-nav-item text-danger" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Log Out</span>
        </button>
      </div>
    </nav>
  );
}
