import { useState } from 'react';
import { Save, Eye, EyeOff, Database, Trash2 } from 'lucide-react';
import { loadSettings, saveSettings, clearAll } from '../../services/storage';
import { addItems } from '../../services/storage';
import { SAMPLE_DATA } from '../../data/sampleData';
import Header from '../Layout/Header';

export default function SettingsPage({ onRefresh }) {
  const [settings, setSettings] = useState(loadSettings());
  const [showKey, setShowKey] = useState(false);
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

  return (
    <div className="fade-in">
      <Header title="Settings" subtitle="Configure GreenBite" />

      <div className="page-content">
        <div style={{ maxWidth: 600 }}>
          {/* API Key */}
          <div className="card mb-24">
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>
              ✨ Gemini AI Configuration
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
              Required for AI recipe suggestions, bulk food parsing, and smart image scanning.
              Get your key free at <a href="https://aistudio.google.com" target="_blank" rel="noreferrer"
                style={{ color: 'var(--green-400)' }}>aistudio.google.com</a>
            </p>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Gemini API Key</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showKey ? 'text' : 'password'}
                  placeholder="AQ... or AI..."
                  value={settings.geminiApiKey}
                  onChange={e => handleChange('geminiApiKey', e.target.value)}
                  style={{ paddingRight: 48 }}
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer',
                  }}
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {settings.geminiApiKey && (
                <div style={{ fontSize: 12, color: 'var(--status-fresh)', marginTop: 6 }}>
                  ✅ API key configured
                </div>
              )}
            </div>
          </div>

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

          {/* Health Profile Card */}
          <div className="glass-card mb-24">
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--cyan-400)' }}>⚕️</span> Health & Dietary Profile
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
            Describe your medical conditions, allergies, or dietary goals in plain English (or use voice). Our AI handles the rest!
          </p>
          
          <div className="form-group mb-16" style={{ position: 'relative' }}>
            <textarea
              className="form-input"
              rows={4}
              placeholder="e.g., I have Type 2 Diabetes and my son is allergic to peanuts. We are trying to eat less sugar."
              value={settings.healthProfile || ''}
              onChange={e => handleChange('healthProfile', e.target.value)}
              style={{ resize: 'vertical' }}
            />
            <button
              className="btn-icon"
              style={{ position: 'absolute', bottom: 12, right: 12, background: 'var(--glass-2)' }}
              onClick={() => {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                if (!SpeechRecognition) {
                  alert('Voice input is not supported in this browser.');
                  return;
                }
                const recognition = new SpeechRecognition();
                recognition.lang = 'en-IN'; // Multi-language can be set here or auto-detected
                recognition.interimResults = false;
                
                recognition.onstart = () => {
                  // visual cue could go here
                };
                
                recognition.onresult = (event) => {
                  const transcript = event.results[0][0].transcript;
                  const currentText = settings.healthProfile ? settings.healthProfile + ' ' : '';
                  handleChange('healthProfile', currentText + transcript);
                };
                
                recognition.start();
              }}
              title="Click to dictate"
            >
              🎤
            </button>
            <div style={{ fontSize: 12, color: 'var(--text-500)', marginTop: 8 }}>
              Used to recommend foods, generate smart shopping lists, and filter recipes.
            </div>
          </div>
          
          <button className="btn btn-primary" onClick={handleSave}>
            <Save size={18} /> Save Health Profile
          </button>
        </div>

        {/* Danger Zone */}
          <div className="card" style={{ border: '1px solid var(--status-urgent-border)' }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, color: 'var(--status-urgent)' }}>
              ⚠️ Danger Zone
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              This will permanently delete all inventory and activity data.
            </p>
            {clearConfirm ? (
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setClearConfirm(false)}>
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
        </div>
      </div>
    </div>
  );
}
