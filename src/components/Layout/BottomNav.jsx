import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Plus, ChefHat, BarChart3, HeartPulse } from 'lucide-react';

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/pantry', icon: Package, label: 'Pantry' },
  { to: '/add', icon: Plus, label: 'Add', isPrimary: true },
  { to: '/recipes', icon: ChefHat, label: 'Recipes' },
  { to: '/health', icon: HeartPulse, label: 'Health' },
];

export default function BottomNav({ urgentCount }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {NAV.map(({ to, icon: Icon, label, isPrimary }) => {
          const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
          const showBadge = to === '/pantry' && urgentCount > 0;

          if (isPrimary) {
            return (
              <button
                key={to}
                onClick={() => navigate(to)}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, #22c55e, #4ade80)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 24px rgba(74,222,128,0.45), 0 4px 12px rgba(0,0,0,0.4)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
                  flexShrink: 0,
                  position: 'relative',
                  top: -4,
                }}
                onPointerDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
                onPointerUp={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Icon size={22} color="#021a0c" strokeWidth={2.5} />
              </button>
            );
          }

          return (
            <button
              key={to}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(to)}
            >
              {showBadge && <span className="nav-badge">{urgentCount > 9 ? '9+' : urgentCount}</span>}
              <span className="nav-item-icon">
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
