import { LogOut, Bell, Shield, Smartphone } from 'lucide-react';
import { logoutUser } from '../../services/storage';
import Header from '../Layout/Header';

export default function SettingsPage() {
  const handleLogout = () => {
    logoutUser();
    window.location.reload();
  };

  return (
    <div className="page-enter">
      <Header title="Settings" subtitle="App preferences & account" />
      
      <div className="page-content">
        <div className="glass-card" style={{ padding: 0, marginBottom: 24 }}>
          <div style={{ padding: 20, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-400)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Preferences</h3>
          </div>
          
          <div style={{ padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--r-md)', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={20} color="var(--text-200)" />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-100)' }}>Push Notifications</div>
                <div style={{ fontSize: 13, color: 'var(--text-400)' }}>Expiry alerts & tips</div>
              </div>
            </div>
            <div style={{ width: 44, height: 24, background: 'var(--green-400)', borderRadius: 12, position: 'relative', cursor: 'pointer' }}>
              <div style={{ position: 'absolute', top: 2, right: 2, width: 20, height: 20, background: '#fff', borderRadius: 10 }} />
            </div>
          </div>

          <div style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--r-md)', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Smartphone size={20} color="var(--text-200)" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-100)' }}>Dark Theme</div>
              <div style={{ fontSize: 13, color: 'var(--green-400)', fontWeight: 700 }}>Enabled (Bioluminescent)</div>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: 0, marginBottom: 24 }}>
          <div style={{ padding: 20, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-400)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Security & Data</h3>
          </div>
          
          <div style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--r-md)', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={20} color="var(--text-200)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-100)' }}>Privacy Policy</div>
            </div>
          </div>
        </div>

        <button 
          className="btn" 
          onClick={handleLogout}
          style={{ width: '100%', height: 56, background: 'rgba(244,63,94,0.1)', color: 'var(--urgent)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 'var(--r-lg)', fontSize: 16, fontWeight: 700 }}
        >
          <LogOut size={20} style={{ marginRight: 8 }} /> Sign Out
        </button>

        <div style={{ textAlign: 'center', marginTop: 32, color: 'var(--text-500)', fontSize: 12 }}>
          GreenBite Version 2.0.0<br/>Powered by Google Gemini
        </div>
      </div>
    </div>
  );
}
