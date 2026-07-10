import { useState, useRef, useCallback } from 'react';
import { Camera, Upload, Sparkles, Check, Plus, X, RefreshCw, Leaf, Zap } from 'lucide-react';
import { scanFridgeImage, analyzeFoodFreshness } from '../../services/geminiAI';
import { addItems, loadSettings } from '../../services/storage';
import { CATEGORIES } from '../../data/categories';
import { todayISO } from '../../utils/dateUtils';

export default function FridgeScannerPage({ onRefresh, addToast }) {
  const [mode, setMode] = useState('choose'); // choose | scan | freshness
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scannedItems, setScannedItems] = useState([]);
  const [freshnessResult, setFreshnessResult] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const settings = loadSettings();

  const handleFileSelect = useCallback((file) => {
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setScannedItems([]);
    setFreshnessResult(null);
    setError('');
  }, []);

  const handleScanFridge = async () => {
    if (!imageFile) return;
    if (!settings.geminiApiKey) {
      setError('Add your Gemini API key in Settings first!');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const items = await scanFridgeImage(settings.geminiApiKey, imageFile, todayISO());
      setScannedItems(Array.isArray(items) ? items : []);
    } catch (e) {
      setError('Scan failed: ' + e.message);
    }
    setLoading(false);
  };

  const handleCheckFreshness = async () => {
    if (!imageFile) return;
    if (!settings.geminiApiKey) {
      setError('Add your Gemini API key in Settings first!');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await analyzeFoodFreshness(settings.geminiApiKey, imageFile);
      setFreshnessResult(result);
    } catch (e) {
      setError('Freshness check failed: ' + e.message);
    }
    setLoading(false);
  };

  const handleAddAll = () => {
    const confirmed = scannedItems.filter(i => !i._skip);
    addItems(confirmed.map(i => ({ ...i, purchaseDate: todayISO() })));
    onRefresh();
    addToast(`✅ ${confirmed.length} items added from scan!`, 'success');
    setScannedItems([]);
    setImagePreview(null);
    setImageFile(null);
    setMode('choose');
  };

  const toggleSkip = (idx) => {
    setScannedItems(prev => prev.map((item, i) => i === idx ? { ...item, _skip: !item._skip } : item));
  };

  const getCatEmoji = (cat) => CATEGORIES.find(c => c.id === cat)?.emoji || '🍽️';

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title gradient-text-aurora">AI Scanner</h1>
          <p className="page-subtitle">Scan your fridge • Check food freshness</p>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="tab-bar mb-20">
        <button className={`tab-btn ${mode === 'scan' || mode === 'choose' ? 'active' : ''}`}
          onClick={() => { setMode('scan'); setFreshnessResult(null); }}>
          📸 Fridge Scanner
        </button>
        <button className={`tab-btn ${mode === 'freshness' ? 'active' : ''}`}
          onClick={() => { setMode('freshness'); setScannedItems([]); }}>
          🔬 Freshness Check
        </button>
      </div>

      {/* Image Upload Area */}
      <div className="glass-card mb-16" style={{ padding: 0, overflow: 'hidden' }}>
        {imagePreview ? (
          <div style={{ position: 'relative' }}>
            <img
              src={imagePreview}
              alt="Uploaded food"
              style={{ width: '100%', maxHeight: 300, objectFit: 'cover' }}
            />
            {/* Scanner overlay when scanning fridge */}
            {mode === 'scan' && (
              <div className="scanner-overlay">
                <div className="scanner-frame" />
                <div className="scanner-line" />
                <div className="scanner-corner tl" />
                <div className="scanner-corner tr" />
                <div className="scanner-corner bl" />
                <div className="scanner-corner br" />
              </div>
            )}
            <button
              className="btn-icon"
              style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)', border: 'none' }}
              onClick={() => { setImagePreview(null); setImageFile(null); setScannedItems([]); setFreshnessResult(null); }}
            >
              <X size={16} color="white" />
            </button>
          </div>
        ) : (
          <div
            style={{
              padding: '40px 24px',
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(34,211,238,0.04), rgba(74,222,128,0.04))',
              cursor: 'pointer',
              borderRadius: 'var(--r-xl)',
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <div style={{
              width: 72, height: 72, borderRadius: 'var(--r-lg)',
              background: 'rgba(34,211,238,0.1)',
              border: '1px solid rgba(34,211,238,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Camera size={30} color="var(--cyan-400)" />
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 17, marginBottom: 6 }}>
              {mode === 'freshness' ? 'Take a photo of food item' : 'Scan your fridge or pantry'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-500)', marginBottom: 20 }}>
              {mode === 'freshness'
                ? 'AI will analyze if it\'s fresh, semi-fresh, or spoiled'
                : 'AI identifies ALL items automatically — like magic!'}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-glass btn-sm" onClick={e => { e.stopPropagation(); cameraInputRef.current?.click(); }}>
                <Camera size={14} /> Camera
              </button>
              <button className="btn btn-glass btn-sm">
                <Upload size={14} /> Upload Photo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden inputs */}
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => handleFileSelect(e.target.files?.[0])} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
        onChange={e => handleFileSelect(e.target.files?.[0])} />

      {error && (
        <div style={{
          padding: '12px 16px', borderRadius: 'var(--r-md)',
          background: 'var(--urgent-bg)', border: '1px solid var(--urgent-border)',
          color: 'var(--urgent)', fontSize: 13, marginBottom: 16,
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Fridge Scanner Mode */}
      {(mode === 'scan' || mode === 'choose') && (
        <>
          {imageFile && scannedItems.length === 0 && (
            <button
              className="btn btn-primary btn-full btn-lg"
              onClick={handleScanFridge}
              disabled={loading}
              style={{ marginBottom: 20 }}
            >
              {loading ? (
                <><div className="spinner" /> Scanning with Gemini Vision...</>
              ) : (
                <><Sparkles size={18} /> Identify All Items</>
              )}
            </button>
          )}

          {loading && (
            <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
              <div className="dot-loader" style={{ justifyContent: 'center', marginBottom: 12 }}>
                <span /><span /><span />
              </div>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Gemini Vision is analyzing...</div>
              <div style={{ fontSize: 13, color: 'var(--text-500)' }}>Identifying items, estimating quantities and expiry dates</div>
            </div>
          )}

          {/* Scanned Items */}
          {scannedItems.length > 0 && (
            <div>
              <div className="section-label">
                <Sparkles size={12} style={{ color: 'var(--green-400)' }} />
                AI Found {scannedItems.length} Items — Review Before Adding
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {scannedItems.map((item, idx) => (
                  <ScannedItemRow
                    key={idx}
                    item={item}
                    emoji={getCatEmoji(item.category)}
                    onToggle={() => toggleSkip(idx)}
                  />
                ))}
              </div>

              <button
                className="btn btn-primary btn-full btn-lg"
                onClick={handleAddAll}
                style={{ marginBottom: 12 }}
              >
                <Plus size={18} />
                Add {scannedItems.filter(i => !i._skip).length} Items to Pantry
              </button>

              <button
                className="btn btn-glass btn-full"
                onClick={() => { setScannedItems([]); handleScanFridge(); }}
              >
                <RefreshCw size={14} /> Rescan
              </button>
            </div>
          )}
        </>
      )}

      {/* Freshness Check Mode */}
      {mode === 'freshness' && (
        <>
          {imageFile && !freshnessResult && (
            <button
              className="btn btn-full btn-lg"
              style={{
                marginBottom: 20,
                background: 'linear-gradient(135deg, rgba(74,222,128,0.2), rgba(74,222,128,0.1))',
                border: '1px solid var(--fresh-border)',
                color: 'var(--fresh)',
                fontWeight: 700,
              }}
              onClick={handleCheckFreshness}
              disabled={loading}
            >
              {loading ? (
                <><div className="spinner" /> Analyzing freshness...</>
              ) : (
                <><Zap size={18} /> Check Freshness</>
              )}
            </button>
          )}

          {loading && (
            <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
              <div className="dot-loader" style={{ justifyContent: 'center', marginBottom: 12 }}>
                <span /><span /><span />
              </div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>AI is examining your food...</div>
            </div>
          )}

          {freshnessResult && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {Array.isArray(freshnessResult) 
                ? freshnessResult.map((res, i) => <FreshnessResult key={i} result={res} />) 
                : <FreshnessResult result={freshnessResult} />
              }
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ScannedItemRow({ item, emoji, onToggle }) {
  return (
    <div
      className="glass-card glass-card-hover"
      style={{
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        opacity: item._skip ? 0.4 : 1,
        transition: 'opacity 0.2s',
        borderRadius: 'var(--r-lg)',
      }}
      onClick={onToggle}
    >
      <span style={{ fontSize: 22 }}>{emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-200)' }}>{item.name}</div>
        <div style={{ fontSize: 12, color: 'var(--text-500)' }}>
          {item.quantity} {item.unit} · {item.storageLocation} · expires {item.expiryDate}
        </div>
      </div>
      <div style={{
        width: 24, height: 24, borderRadius: 6,
        background: item._skip ? 'var(--glass-2)' : 'var(--fresh-bg)',
        border: `1px solid ${item._skip ? 'var(--glass-border)' : 'var(--fresh-border)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {!item._skip && <Check size={14} color="var(--fresh)" />}
      </div>
    </div>
  );
}

function FreshnessResult({ result }) {
  const levelConfig = {
    FRESH: { color: 'var(--fresh)', glow: 'var(--fresh-glow)', emoji: '✅', label: 'Fresh', ringColor: '#4ade80' },
    SEMI_FRESH: { color: 'var(--warning)', glow: 'var(--warning-glow)', emoji: '⚠️', label: 'Semi-Fresh', ringColor: '#fbbf24' },
    SPOILED: { color: 'var(--urgent)', glow: 'var(--urgent-glow)', emoji: '❌', label: 'Spoiled', ringColor: '#f87171' },
  };

  const cfg = levelConfig[result.freshnessLevel] || levelConfig.FRESH;
  const score = result.freshnessScore || 0;
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  const actionConfig = {
    SAFE: { label: 'Safe to eat!', color: 'var(--fresh)' },
    USE_NOW: { label: 'Use today!', color: 'var(--warning)' },
    USE_TODAY: { label: 'Use immediately!', color: 'var(--urgent)' },
    DISCARD: { label: '⛔ Discard this item', color: 'var(--urgent)' },
    REPURPOSE: { label: '♻️ Compost / Repurpose', color: 'var(--cyan-400)' },
  };
  const actionCfg = actionConfig[result.action] || actionConfig.SAFE;

  return (
    <div className="glass-card" style={{ padding: 24, borderColor: cfg.color + '40' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 800, marginBottom: 4, color: 'var(--text-100)' }}>
          {result.foodName}
        </div>

        {/* Freshness Ring */}
        <div className="freshness-ring-wrap" style={{ marginBottom: 16 }}>
          <svg className="freshness-ring-svg" width="140" height="140" viewBox="0 0 120 120">
            <circle className="freshness-ring-bg" cx="60" cy="60" r={radius} />
            <circle
              className="freshness-ring-fill"
              cx="60" cy="60" r={radius}
              stroke={cfg.ringColor}
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ filter: `drop-shadow(0 0 6px ${cfg.ringColor})` }}
            />
          </svg>
          <div className="freshness-ring-label">
            <span className="freshness-score" style={{ color: cfg.color }}>{score}</span>
            <span className="freshness-level" style={{ color: cfg.color }}>{cfg.label}</span>
          </div>
        </div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '10px 20px', borderRadius: 'var(--r-full)',
          background: cfg.color + '15',
          border: `1px solid ${cfg.color}40`,
          fontWeight: 700, fontSize: 14, color: actionCfg.color,
        }}>
          {cfg.emoji} {actionCfg.label}
        </div>
      </div>

      {/* Indicators */}
      {result.indicators?.length > 0 && (
        <>
          <div className="section-label">Analysis</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {result.indicators.map((ind, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 'var(--r-md)',
                background: 'var(--glass-2)',
                border: '1px solid var(--glass-border)',
              }}>
                <span style={{ fontSize: 16 }}>{ind.positive ? '✅' : '⚠️'}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{ind.factor}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-300)' }}>{ind.observation}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {result.tips && (
        <div style={{
          padding: '12px 14px', borderRadius: 'var(--r-md)',
          background: 'rgba(74,222,128,0.06)', border: '1px solid var(--fresh-border)',
          fontSize: 13, color: 'var(--text-300)', lineHeight: 1.5,
        }}>
          <span style={{ fontWeight: 700, color: 'var(--fresh)' }}>💡 Tip: </span>
          {result.tips}
        </div>
      )}
    </div>
  );
}
