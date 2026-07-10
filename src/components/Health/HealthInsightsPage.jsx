import { useState } from 'react';
import { Leaf, Activity, ChevronRight, Apple, Zap, User } from 'lucide-react';
import { loadSettings, saveSettings } from '../../services/storage';
import { analyzeHealthImpact } from '../../services/geminiAI';
import Header from '../Layout/Header';

export default function HealthInsightsPage({ inventory, onRefresh }) {
  const [settings, setSettings] = useState(loadSettings());
  const [isEditing, setIsEditing] = useState(false);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSaveProfile = () => {
    saveSettings(settings);
    setIsEditing(false);
    onRefresh();
  };

  const handleGetInsights = async () => {
    const active = inventory.filter(i => !i.isUsed && !i.isWasted);
    if (active.length === 0) {
      setError('Add some items to your pantry first to get insights!');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await analyzeHealthImpact(settings.geminiApiKey, active, settings.healthProfile);
      setInsights(result);
    } catch (err) {
      setError('Failed to generate insights: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="page-enter">
      <Header title="Health Insights" subtitle="Personalized nutrition & diet analysis" />

      <div className="page-content">
        
        {/* Profile Card */}
        <div className="glass-card" style={{ marginBottom: 24 }}>
          <div style={{ padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: isEditing ? '1px solid var(--glass-border)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={24} color="#3b82f6" />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-100)', marginBottom: 2 }}>Dietary Profile</h3>
                <p style={{ fontSize: 13, color: 'var(--text-400)' }}>Tailor AI suggestions to your body</p>
              </div>
            </div>
            <button className="btn btn-glass btn-sm" onClick={() => setIsEditing(!isEditing)} style={{ borderRadius: 'var(--r-full)' }}>
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {isEditing ? (
            <div className="slide-up" style={{ padding: 20 }}>
              <div className="form-group">
                <label className="form-label">Health Conditions or Allergies</label>
                <textarea
                  className="form-textarea"
                  placeholder="e.g. Peanut allergy, Type 2 Diabetes, Lactose Intolerant"
                  value={settings.healthProfile.conditions}
                  onChange={e => setSettings({
                    ...settings,
                    healthProfile: { ...settings.healthProfile, conditions: e.target.value }
                  })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Dietary Preference</label>
                <select
                  className="form-select"
                  value={settings.healthProfile.dietType}
                  onChange={e => setSettings({
                    ...settings,
                    healthProfile: { ...settings.healthProfile, dietType: e.target.value }
                  })}
                >
                  <option value="none">No specific diet</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="keto">Keto</option>
                  <option value="paleo">Paleo</option>
                </select>
              </div>
              <button className="btn btn-primary btn-full" style={{ marginTop: 8 }} onClick={handleSaveProfile}>
                Save Profile
              </button>
            </div>
          ) : (
            <div style={{ padding: '0 20px 20px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: 'var(--r-full)', fontSize: 13, color: 'var(--text-200)', border: '1px solid rgba(255,255,255,0.05)' }}>
                Diet: <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>{settings.healthProfile.dietType}</span>
              </span>
              {settings.healthProfile.conditions && (
                <span style={{ background: 'rgba(244,63,94,0.1)', color: 'var(--urgent)', border: '1px solid rgba(244,63,94,0.2)', padding: '6px 12px', borderRadius: 'var(--r-full)', fontSize: 13, fontWeight: 600 }}>
                  ⚠️ {settings.healthProfile.conditions}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          className="btn btn-primary btn-full"
          style={{ height: 56, fontSize: 16, borderRadius: 'var(--r-lg)', background: 'linear-gradient(135deg, var(--green-500), var(--green-400))', marginBottom: 24 }}
          onClick={handleGetInsights}
          disabled={loading}
        >
          {loading ? (
            <><div className="spinner" /> Analyzing your pantry...</>
          ) : (
            <><Activity size={20} style={{ marginRight: 8 }} /> Generate Health Insights</>
          )}
        </button>

        {error && (
          <div style={{ background: 'var(--urgent-bg)', color: 'var(--urgent)', border: '1px solid var(--urgent-border)', padding: 16, borderRadius: 'var(--r-md)', marginBottom: 24, fontSize: 14 }}>
            {error}
          </div>
        )}

        {/* Insights Results */}
        {insights && (
          <div className="slide-up">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text-100)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={18} color="var(--green-400)" /> AI Analysis Results
            </h3>
            
            <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <Apple size={24} color="var(--green-400)" />
                <h4 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-100)', margin: 0 }}>General Advice</h4>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-300)', lineHeight: 1.6 }}>{insights.generalAdvice}</p>
            </div>

            <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-100)', marginBottom: 16 }}>Shopping Recommendations</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {insights.shoppingRecommendations?.map((rec, i) => (
                  <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--green-400)', fontSize: 12, fontWeight: 700 }}>
                      {i + 1}
                    </div>
                    <div style={{ paddingTop: 2 }}>
                      <span style={{ fontSize: 14, color: 'var(--text-100)', fontWeight: 700, display: 'block' }}>{rec.itemName}</span>
                      <span style={{ fontSize: 13, color: 'var(--text-400)' }}>{rec.benefit}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card" style={{ padding: 24 }}>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-100)', marginBottom: 16 }}>Pantry Evaluation</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {insights.pantryFlags?.map((flag, i) => (
                  <div key={i} style={{ 
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                    background: flag.status === 'AVOID' ? 'rgba(244,63,94,0.05)' : 'rgba(16,185,129,0.05)',
                    border: `1px solid ${flag.status === 'AVOID' ? 'rgba(244,63,94,0.2)' : 'rgba(16,185,129,0.2)'}`,
                    padding: 16, borderRadius: 'var(--r-md)'
                  }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{flag.status === 'AVOID' ? '⚠️' : '✅'}</span>
                    <div>
                      <span style={{ fontSize: 14, color: flag.status === 'AVOID' ? 'var(--urgent)' : 'var(--green-400)', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                        {flag.itemName}
                      </span>
                      <span style={{ fontSize: 13, color: 'var(--text-300)', lineHeight: 1.5 }}>{flag.reason}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
