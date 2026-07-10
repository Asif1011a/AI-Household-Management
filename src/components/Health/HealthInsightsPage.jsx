import { useState, useEffect } from 'react';
import { HeartPulse, AlertCircle, CheckCircle, Apple, ShoppingBag } from 'lucide-react';
import { loadSettings, loadInventory } from '../../services/storage';
import { analyzeHealthImpact } from '../../services/geminiAI';

export default function HealthInsightsPage({ inventory, onRefresh }) {
  const settings = loadSettings();
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState('');

  const hasProfile = !!settings.healthProfile && settings.healthProfile.trim().length > 0;

  const fetchInsights = async () => {
    if (!settings.geminiApiKey) {
      setError('Add your Gemini API key in Settings first.');
      return;
    }
    if (!hasProfile) {
      setError('Add your medical conditions or allergies in Settings first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const activeItems = inventory.filter(i => !i.isUsed && !i.isWasted);
      const data = await analyzeHealthImpact(settings.geminiApiKey, activeItems, settings.healthProfile);
      setInsights(data);
    } catch (err) {
      setError('Failed to fetch health insights: ' + err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (hasProfile && settings.geminiApiKey) {
      fetchInsights();
    }
  }, [hasProfile, inventory.length]); // refetch when inventory changes size

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title gradient-text-aurora" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <HeartPulse size={26} color="var(--cyan-400)" /> Health Insights
          </h1>
          <p className="page-subtitle">Personalized dietary analysis & smart shopping</p>
        </div>
      </div>

      {!hasProfile ? (
        <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚕️</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>No Health Profile Found</h3>
          <p style={{ fontSize: 13, color: 'var(--text-500)', marginBottom: 20 }}>
            Add your medical conditions or allergies in the Settings to get personalized AI dietary advice.
          </p>
          <a href="/settings" className="btn btn-primary" style={{ display: 'inline-flex' }}>
            Go to Settings
          </a>
        </div>
      ) : (
        <>
          <div className="glass-card mb-20" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                Active Profile
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, fontStyle: 'italic', color: 'var(--text-300)' }}>
                "{settings.healthProfile}"
              </div>
            </div>
            <button className="btn-icon" onClick={fetchInsights} disabled={loading} style={{ background: 'var(--glass-2)' }}>
              <RefreshCw className={loading ? 'spin' : ''} size={16} />
            </button>
          </div>

          {error && (
            <div style={{ padding: '12px 16px', background: 'var(--urgent-bg)', color: 'var(--urgent)', borderRadius: 'var(--r-md)', marginBottom: 20 }}>
              {error}
            </div>
          )}

          {loading && !insights && (
            <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
              <div className="dot-loader" style={{ justifyContent: 'center', marginBottom: 16 }}><span/><span/><span/></div>
              <div style={{ fontWeight: 600 }}>Analyzing your pantry...</div>
              <div style={{ fontSize: 13, color: 'var(--text-500)' }}>Gemini is cross-referencing your medical profile</div>
            </div>
          )}

          {insights && (
            <div className="stagger">
              {/* Pantry Flags */}
              <div className="section-label">Pantry Flags</div>
              
              <div className="glass-card mb-24" style={{ padding: '4px 0' }}>
                {insights.pantryFlags?.length === 0 && (
                  <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-500)', fontSize: 13 }}>
                    No items in your pantry pose a direct threat.
                  </div>
                )}
                {insights.pantryFlags?.map((flag, idx) => {
                  const isGood = flag.status === 'GOOD';
                  return (
                    <div key={idx} style={{
                      padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'flex-start',
                      borderBottom: idx < insights.pantryFlags.length - 1 ? '1px solid var(--glass-border)' : 'none'
                    }}>
                      <div style={{ fontSize: 18, marginTop: 2 }}>{isGood ? '✅' : '⚠️'}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: isGood ? 'var(--fresh)' : 'var(--urgent)' }}>
                          {flag.itemName}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-400)', marginTop: 2 }}>{flag.reason}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Shopping Recommendations */}
              <div className="section-label">Smart Shopping List</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginBottom: 24 }}>
                {insights.shoppingRecommendations?.map((rec, idx) => (
                  <div key={idx} className="glass-card" style={{ padding: '16px', borderLeft: `3px solid var(--cyan-400)` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <ShoppingBag size={16} color="var(--cyan-400)" />
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{rec.itemName}</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-400)' }}>{rec.benefit}</div>
                  </div>
                ))}
              </div>

              {/* General Dietary Advice */}
              <div className="glass-card" style={{ padding: 20, background: 'linear-gradient(135deg, rgba(34,211,238,0.1), rgba(167,139,250,0.1))' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Apple size={16} /> AI Dietician Summary
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-200)', lineHeight: 1.6 }}>
                  {insights.generalAdvice}
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

import { RefreshCw } from 'lucide-react';
