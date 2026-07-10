import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, Leaf, IndianRupee, Droplets } from 'lucide-react';
import { getDaysRemaining } from '../../utils/dateUtils';
import Header from '../Layout/Header';

export default function AnalyticsPage({ inventory }) {
  const stats = useMemo(() => {
    let saved = 0;
    let wasted = 0;
    let co2 = 0;
    let water = 0;
    let money = 0;

    inventory.forEach(item => {
      const weightKg = item.unit === 'kg' ? item.quantity : item.unit === 'grams' ? item.quantity / 1000 : item.quantity * 0.2;
      
      if (item.isUsed) {
        saved++;
        co2 += weightKg * 2.5; 
        water += weightKg * 250; 
        money += weightKg * 45;
      } else if (item.isWasted) {
        wasted++;
      }
    });

    const active = inventory.filter(i => !i.isUsed && !i.isWasted);
    const fresh = active.filter(i => i.status === 'fresh').length;
    const warning = active.filter(i => i.status === 'warning').length;
    const urgent = active.filter(i => i.status === 'urgent').length;
    
    return {
      saved, wasted, totalActive: active.length, fresh, warning, urgent,
      co2: co2.toFixed(1), water: Math.round(water), money: Math.round(money),
      totalHistory: saved + wasted
    };
  }, [inventory]);

  const score = stats.totalHistory === 0 ? 100 : Math.round((stats.saved / stats.totalHistory) * 100);
  
  const chartData = [
    { name: 'Fresh', value: stats.fresh, color: 'var(--fresh)' },
    { name: 'Warning', value: stats.warning, color: 'var(--warning)' },
    { name: 'Urgent', value: stats.urgent, color: 'var(--urgent)' }
  ].filter(d => d.value > 0);

  return (
    <div className="page-enter">
      <Header title="Analytics & Impact" subtitle="Track your eco-friendly footprint" />

      <div className="page-content">
        
        {/* Main Eco Score Card */}
        <div className="glass-card" style={{ padding: 24, marginBottom: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--text-400)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 24 }}>
            GreenBite Efficiency Score
          </div>
          
          <div style={{ position: 'relative', width: 180, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <circle cx="50" cy="50" r="45" fill="none" stroke="var(--green-400)" strokeWidth="8" 
                strokeDasharray="283" strokeDashoffset={283 - (283 * score) / 100} 
                strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.5s ease-in-out' }} />
            </svg>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--text-100)', lineHeight: 1 }}>{score}%</div>
              <div style={{ fontSize: 12, color: 'var(--green-400)', fontWeight: 700, marginTop: 4 }}>Saved Items</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 24, marginTop: 32, width: '100%' }}>
            <div style={{ flex: 1, textAlign: 'center', background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 'var(--r-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--fresh)' }}>{stats.saved}</div>
              <div style={{ fontSize: 11, color: 'var(--text-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Items Saved</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center', background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 'var(--r-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--urgent)' }}>{stats.wasted}</div>
              <div style={{ fontSize: 11, color: 'var(--text-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Items Wasted</div>
            </div>
          </div>
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Leaf size={18} color="var(--green-400)" /> Positive Impact
        </h3>
        
        {/* Environmental Impact Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginBottom: 32 }}>
          
          {/* CO2 */}
          <div className="glass-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Leaf size={24} color="#22d3ee" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: 'var(--text-400)', fontWeight: 600 }}>CO₂ Emissions Prevented</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-100)', fontFamily: "'Space Grotesk', sans-serif" }}>
                {stats.co2} <span style={{ fontSize: 14, color: 'var(--text-500)', fontWeight: 500 }}>kg</span>
              </div>
            </div>
          </div>

          {/* Water */}
          <div className="glass-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Droplets size={24} color="#3b82f6" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: 'var(--text-400)', fontWeight: 600 }}>Water Saved</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-100)', fontFamily: "'Space Grotesk', sans-serif" }}>
                {stats.water} <span style={{ fontSize: 14, color: 'var(--text-500)', fontWeight: 500 }}>Liters</span>
              </div>
            </div>
          </div>

          {/* Money */}
          <div className="glass-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IndianRupee size={24} color="var(--green-400)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: 'var(--text-400)', fontWeight: 600 }}>Money Saved</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--green-400)', fontFamily: "'Space Grotesk', sans-serif" }}>
                ₹{stats.money}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
