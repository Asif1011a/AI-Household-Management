import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, ArrowRight, Camera, Mic, Zap, TrendingUp, Leaf } from 'lucide-react';
import { getDaysRemaining, formatDaysRemaining } from '../../utils/dateUtils';
import { CATEGORIES } from '../../data/categories';

export default function DashboardPage({ inventory, onRefresh }) {
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const active = inventory.filter(i => !i.isUsed && !i.isWasted);
    return {
      total: active.length,
      urgent: active.filter(i => i.status === 'urgent'),
      warning: active.filter(i => i.status === 'warning'),
      fresh: active.filter(i => i.status === 'fresh'),
      expired: active.filter(i => i.status === 'expired'),
      saved: inventory.filter(i => i.isUsed).length,
      wasted: inventory.filter(i => i.isWasted).length,
    };
  }, [inventory]);

  const getCatEmoji = (cat) => CATEGORIES.find(c => c.id === cat)?.emoji || '🍽️';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const savedPct = stats.saved + stats.wasted > 0
    ? Math.round((stats.saved / (stats.saved + stats.wasted)) * 100) : 100;

  return (
    <div className="page-enter">
      {/* AI Assistant Greeting Hero */}
      <div className="glass-card" style={{ marginBottom: 24, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ 
            width: 48, height: 48, borderRadius: 24, 
            background: 'var(--bg-deep)',
            border: '1px solid var(--green-glow)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            boxShadow: 'var(--shadow-green)'
          }}>
            <Leaf size={24} color="var(--green-400)" />
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--green-400)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4, fontWeight: 700 }}>
              {greeting}
            </div>
            <h1 style={{
              fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800,
              lineHeight: 1.2, color: 'var(--text-100)',
            }}>
              {stats.urgent.length > 0 
                ? `You have ${stats.urgent.length} items needing attention today.`
                : stats.warning.length > 0
                ? `Your fridge looks great, but let's use the ${stats.warning[0]?.name.toLowerCase()} soon.`
                : `Your kitchen is perfectly stocked and fresh.`
              }
            </h1>
          </div>
        </div>
      </div>

      {/* Urgent Alert */}
      {stats.urgent.length > 0 && (
        <div
          className="glass-card glass-card-hover"
          style={{ padding: '16px 20px', marginBottom: 24, cursor: 'pointer', borderLeft: '4px solid var(--urgent)' }}
          onClick={() => navigate('/pantry')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 12, height: 12, borderRadius: 6,
              background: 'var(--urgent)',
              boxShadow: '0 0 0 4px var(--urgent-bg)',
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-100)', marginBottom: 2 }}>
                Use Today
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-400)' }}>
                {stats.urgent.slice(0, 3).map(i => i.name).join(', ')}
                {stats.urgent.length > 3 ? ` +${stats.urgent.length - 3} more` : ''}
              </div>
            </div>
            <ArrowRight size={18} color="var(--text-300)" />
          </div>
        </div>
      )}

      {/* Hero Stats */}
      <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { value: stats.total, label: 'Items', accent: 'var(--violet-400)' },
          { value: stats.urgent.length, label: 'Urgent', accent: 'var(--urgent)' },
          { value: stats.warning.length, label: 'Soon', accent: 'var(--warning)' },
          { value: stats.saved, label: 'Saved', accent: 'var(--fresh)' },
        ].map((s, i) => (
          <div key={i} className="hero-stat" style={{ '--accent': s.accent }}>
            <div className="hero-stat-value">{s.value}</div>
            <div className="hero-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* AI Features */}
      <div className="section-label" style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: 'var(--green-400)', marginBottom: 16 }}>
        Intelligent Tools
      </div>

      <div className="stagger" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
        <div className="glass-card glass-card-hover" style={{ padding: 16 }} onClick={() => navigate('/scan')}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--cyan-glow)', border: '1px solid var(--cyan-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, boxShadow: '0 0 15px var(--cyan-glow)' }}>
            <Camera size={20} color="var(--cyan-400)" />
          </div>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-100)', marginBottom: 4 }}>Fridge Scanner</div>
          <div style={{ fontSize: 12, color: 'var(--text-400)', lineHeight: 1.4 }}>Auto-identify items with Gemini Vision</div>
        </div>

        <div className="glass-card glass-card-hover" style={{ padding: 16 }} onClick={() => navigate('/add')}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--violet-glow)', border: '1px solid var(--violet-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, boxShadow: '0 0 15px var(--violet-glow)' }}>
            <Mic size={20} color="var(--violet-400)" />
          </div>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-100)', marginBottom: 4 }}>Voice Entry</div>
          <div style={{ fontSize: 12, color: 'var(--text-400)', lineHeight: 1.4 }}>Speak in 10+ Indian languages</div>
        </div>

        <div className="glass-card glass-card-hover" style={{ padding: 16 }} onClick={() => navigate('/recipes')}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--warning-bg)', border: '1px solid var(--warning-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, boxShadow: 'var(--warning-glow)' }}>
            <ChefHat size={20} color="var(--warning)" />
          </div>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-100)', marginBottom: 4 }}>AI Recipes</div>
          <div style={{ fontSize: 12, color: 'var(--text-400)', lineHeight: 1.4 }}>Meals based on what expires next</div>
        </div>
        
        <div className="glass-card glass-card-hover" style={{ padding: 16 }} onClick={() => navigate('/health')}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--fresh-bg)', border: '1px solid var(--fresh-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, boxShadow: 'var(--fresh-glow)' }}>
            <Leaf size={20} color="var(--fresh)" />
          </div>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-100)', marginBottom: 4 }}>Diet & Health</div>
          <div style={{ fontSize: 12, color: 'var(--text-400)', lineHeight: 1.4 }}>Personalized dietary analysis</div>
        </div>
      </div>

      {/* Use First List */}
      {(stats.urgent.length > 0 || stats.warning.length > 0) && (
        <>
          <div className="section-label" style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: 'var(--text-100)', marginBottom: 16 }}>
            Use First
          </div>
          <div className="glass-card" style={{ padding: '8px 0', marginBottom: 32 }}>
            {[...stats.urgent, ...stats.warning].slice(0, 6).map((item, idx) => {
              const days = getDaysRemaining(item.expiryDate);
              const isUrgent = item.status === 'urgent';
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '16px 20px',
                    borderBottom: idx < Math.min(5, stats.urgent.length + stats.warning.length - 1)
                      ? '1px solid var(--glass-border)' : 'none',
                  }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    {getCatEmoji(item.category)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-100)' }}
                      className="truncate">{item.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-400)' }}>
                      {item.quantity} {item.unit} · {item.storageLocation}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 12, fontWeight: 700, padding: '4px 10px',
                    borderRadius: 'var(--r-md)',
                    background: isUrgent ? 'var(--urgent-bg)' : 'var(--warning-bg)',
                    color: isUrgent ? 'var(--urgent)' : 'var(--warning)',
                    border: `1px solid ${isUrgent ? 'var(--urgent-border)' : 'var(--warning-border)'}`,
                    whiteSpace: 'nowrap', flexShrink: 0,
                  }}>
                    {formatDaysRemaining(days)}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Gamification / Eco-Impact */}
      <div className="section-label" style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: 'var(--text-100)', marginBottom: 16 }}>
        Environmental Impact
      </div>
      <div className="glass-card" style={{ padding: 24, marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'var(--green-glow-soft)',
            border: '1px solid var(--green-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            fontSize: 28,
            boxShadow: 'var(--shadow-green)'
          }}>
            {savedPct >= 80 ? '🌱' : savedPct >= 60 ? '🌿' : '🪴'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: 'var(--text-100)', marginBottom: 4 }}>
              {savedPct >= 80 ? 'Earth Guardian' : savedPct >= 60 ? 'Eco Warrior' : 'Seedling'}
            </div>
            <div className="progress-track" style={{ height: 6, background: 'rgba(255,255,255,0.1)' }}>
              <div className="progress-fill-animated" style={{
                width: `${savedPct}%`,
                background: 'var(--green-400)',
                borderRadius: 3,
                boxShadow: '0 0 10px var(--green-400)'
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, fontWeight: 700 }}>
              <span style={{ color: 'var(--green-400)' }}>{stats.saved} saved</span>
              <span style={{ color: 'var(--urgent)' }}>{stats.wasted} wasted</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, borderTop: '1px solid var(--glass-border)', paddingTop: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--cyan-400)', fontFamily: "'Syne', sans-serif", textShadow: '0 0 10px var(--cyan-glow)' }}>
              {Math.round(stats.saved * 2.5)} kg
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-400)' }}>CO₂ Prevented</div>
          </div>
          <div style={{ width: 1, background: 'var(--glass-border)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--green-400)', fontFamily: "'Syne', sans-serif", textShadow: '0 0 10px var(--green-glow)' }}>
              ₹{stats.saved * 45}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-400)' }}>Money Saved</div>
          </div>
        </div>
      </div>

      {/* Storage Overview */}
      <div className="section-label">Storage Overview</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
        {[
          { id: 'fridge', emoji: '🧊', label: 'Fridge' },
          { id: 'freezer', emoji: '❄️', label: 'Freezer' },
          { id: 'pantry', emoji: '🗄️', label: 'Pantry' },
          { id: 'counter', emoji: '🍽️', label: 'Counter' },
        ].map(loc => {
          const locItems = inventory.filter(i => !i.isUsed && !i.isWasted && i.storageLocation === loc.id);
          const urgentHere = locItems.filter(i => i.status === 'urgent').length;
          return (
            <div
              key={loc.id}
              className="glass-card glass-card-hover"
              style={{ padding: '14px 10px', textAlign: 'center', borderRadius: 'var(--r-lg)', cursor: 'pointer' }}
              onClick={() => navigate('/pantry')}
            >
              <div style={{ fontSize: 24, marginBottom: 6 }}>{loc.emoji}</div>
              <div style={{ fontFamily: "'Space Grotesk'", fontWeight: 800, fontSize: 20, color: 'var(--green-400)' }}>
                {locItems.length}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {loc.label}
              </div>
              {urgentHere > 0 && (
                <div style={{
                  marginTop: 6, fontSize: 10, fontWeight: 700,
                  color: 'var(--urgent)', background: 'var(--urgent-bg)',
                  borderRadius: 'var(--r-full)', padding: '2px 6px',
                }}>
                  {urgentHere} urgent
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {stats.total === 0 && (
        <div className="empty-v2">
          <div className="empty-icon">🌿</div>
          <div className="empty-title">Your pantry is empty</div>
          <div className="empty-desc">Scan your fridge or add items to get started!</div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="btn btn-glass" onClick={() => navigate('/scan')}>
              <Camera size={15} /> Scan Fridge
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/add')}>
              <Mic size={15} /> Add Items
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
