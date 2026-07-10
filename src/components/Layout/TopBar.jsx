import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Bell, Camera } from 'lucide-react';

export default function TopBar({ urgentCount }) {
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);

  return (
    <div className="topbar">
      <div className="topbar-inner">
        <div className="topbar-logo">
          <div className="topbar-logo-mark">🌿</div>
          <span className="topbar-title">GreenBite</span>
        </div>

        <div className="topbar-actions">
          {/* Camera / Scanner shortcut */}
          <button
            className="topbar-btn"
            onClick={() => navigate('/scan')}
            title="Scan Fridge / Check Freshness"
          >
            <Camera size={17} />
          </button>

          {/* Notifications / Alerts */}
          <div style={{ position: 'relative' }}>
            <button
              className="topbar-btn"
              onClick={() => setShowNotifs(!showNotifs)}
              title="Alerts"
            >
              <Bell size={17} />
              {urgentCount > 0 && <span className="topbar-badge" />}
            </button>
            
            {showNotifs && (
              <div className="notification-dropdown glass-card">
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--glass-border)', fontWeight: 700, fontSize: 14 }}>
                  Notifications
                </div>
                <div style={{ padding: 16 }}>
                  {urgentCount > 0 ? (
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 16 }}>🔴</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--urgent)' }}>Items Expiring Soon!</div>
                        <div style={{ fontSize: 12, color: 'var(--text-400)' }}>You have {urgentCount} items that need your attention. Check the Pantry!</div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-500)', fontSize: 12 }}>
                      No new notifications! You're doing great. 🌍
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--glass-border)' }}>
                    <span style={{ fontSize: 16 }}>💡</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fresh)' }}>Green Tip</div>
                      <div style={{ fontSize: 12, color: 'var(--text-400)' }}>Did you know? Freezing overripe bananas makes perfect smoothies!</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <button
            className="topbar-btn"
            onClick={() => navigate('/settings')}
            title="Settings"
          >
            <Settings size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
