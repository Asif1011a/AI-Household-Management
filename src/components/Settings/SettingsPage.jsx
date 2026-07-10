import { useState } from 'react';
import { Save, Eye, EyeOff, Database, Trash2 } from 'lucide-react';
import { loadSettings, saveSettings, clearAll } from '../../services/storage';
import { addItems } from '../../services/storage';
import { SAMPLE_DATA } from '../../data/sampleData';
import Header from '../Layout/Header';

import { logoutUser } from '../../services/storage';

export default function SettingsPage({ onRefresh }) {
  const [settings, setSettings] = useState(loadSettings());
  const [saved, setSaved] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);

  const handleChange = (field, value) => setSettings(prev => ({ ...prev, [field]: value }));

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleLoadSample = () => {
    addItems(SAMPLE_DATA);
    onRefresh();
  };

  const handleClearAll = () => {
    clearAll();
    setClearConfirm(false);
    onRefresh();
  };

  const handleLogout = () => {
    logoutUser();
    window.location.href = '/'; // hard reload to reset state
  };

  return (
    <div className="fade-in">
      <Header title="Settings" subtitle="Configure GreenBite" />

      <div className="page-content">
        <div style={{ maxWidth: 600 }}>

          {/* Household Settings */}
          <div className="card mb-24">
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>
              🏠 Household Settings
            </h2>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Kitchen / Household Name</label>
              <input
                className="form-input"
                placeholder="e.g. My Kitchen, Sharma House..."
                value={settings.householdName}
                onChange={e => handleChange('householdName', e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Alert Days Before Expiry</label>
              <select className="form-select" value={settings.alertDaysBefore}
                onChange={e => handleChange('alertDaysBefore', parseInt(e.target.value))}>
                <option value={1}>1 day before</option>
                <option value={2}>2 days before</option>
                <option value={3}>3 days before</option>
                <option value={5}>5 days before</option>
              </select>
            </div>
          </div>

          {/* Save Button */}
          <button className="btn btn-primary btn-lg w-full mb-24" onClick={handleSave}>
            <Save size={18} />
            {saved ? '✅ Settings Saved!' : 'Save Settings'}
          </button>

          {/* Demo Data */}
          <div className="card mb-24" style={{
            border: '1px solid rgba(99, 102, 241, 0.2)',
            background: 'rgba(99, 102, 241, 0.04)',
          }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>
              🧪 Demo Data
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Load sample Indian household groceries for demonstration purposes.
              Great for hackathon presentations!
            </p>
            <button className="btn btn-secondary w-full" onClick={handleLoadSample}>
              <Database size={16} /> Load Sample Indian Kitchen Data
            </button>
          </div>



          {/* Danger Zone */}
          <div className="glass-card mb-24" style={{ border: '1px solid var(--urgent-border)' }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, color: 'var(--urgent)' }}>
              ⚠️ Danger Zone
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-400)', marginBottom: 16 }}>
              This will permanently delete all inventory and activity data for this profile.
            </p>
            {clearConfirm ? (
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-glass" style={{ flex: 1 }} onClick={() => setClearConfirm(false)}>
                  Cancel
                </button>
                <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleClearAll}>
                  <Trash2 size={14} /> Yes, Delete Everything
                </button>
              </div>
            ) : (
              <button className="btn btn-danger w-full" onClick={() => setClearConfirm(true)}>
                <Trash2 size={16} /> Clear All Data
              </button>
            )}
          </div>

          <button className="btn btn-glass btn-full" onClick={handleLogout} style={{ borderStyle: 'dashed' }}>
            <span style={{ fontSize: 16, marginRight: 8 }}>🚪</span> Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
