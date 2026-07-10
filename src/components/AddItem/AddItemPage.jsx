import { useState } from 'react';
import { Plus, Sparkles, Mic, X, Type } from 'lucide-react';
import { CATEGORIES, STORAGE_LOCATIONS } from '../../data/categories';
import { addItem, addItems, loadSettings } from '../../services/storage';
import { parseFoodInput } from '../../services/geminiAI';
import { todayISO, addDaysToToday } from '../../utils/dateUtils';
import { getShelfLife } from '../../data/shelfLife';
import VoiceInput from '../Voice/VoiceInput';

const UNITS = ['piece', 'kg', 'grams', 'litre', 'ml', 'bunch', 'packet', 'bottle', 'bowl', 'cup', 'dozen'];

const emptyForm = () => ({
  name: '', category: 'vegetables', quantity: 1, unit: 'piece',
  storageLocation: 'fridge', purchaseDate: todayISO(),
  expiryDate: addDaysToToday(7), notes: '',
});

export default function AddItemPage({ onRefresh, addToast }) {
  const [tab, setTab] = useState('manual');
  const [form, setForm] = useState(emptyForm());
  const [bulkText, setBulkText] = useState('');
  const [parsedItems, setParsedItems] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [showVoice, setShowVoice] = useState(false);
  const settings = loadSettings();

  const handleFormChange = (field, value) => {
    const updates = { [field]: value };
    if (field === 'name' || field === 'storageLocation') {
      const sl = getShelfLife(
        field === 'name' ? value : form.name,
        field === 'storageLocation' ? value : form.storageLocation
      );
      updates.expiryDate = addDaysToToday(sl);
    }
    setForm(prev => ({ ...prev, ...updates }));
  };

  const handleManualAdd = () => {
    if (!form.name.trim()) return;
    addItem({ ...form, purchaseDate: todayISO() });
    onRefresh();
    addToast(`✅ ${form.name} added!`, 'success');
    setForm(emptyForm());
  };

  const handleAIParse = async (text) => {
    const inputText = text || bulkText;
    if (!inputText.trim()) return;
    setAiLoading(true);
    setAiError('');
    setParsedItems([]);
    try {
      const items = await parseFoodInput(settings.geminiApiKey, inputText, todayISO());
      setParsedItems(items);
      if (text) {
        setBulkText(text);
        setShowVoice(false);
        setTab('bulk');
      }
    } catch (e) {
      setAiError('AI parsing failed: ' + e.message);
    }
    setAiLoading(false);
  };

  const handleAddParsed = () => {
    if (!parsedItems.length) return;
    addItems(parsedItems.map(i => ({ ...i, purchaseDate: todayISO() })));
    onRefresh();
    addToast(`✅ ${parsedItems.length} items added!`, 'success');
    setParsedItems([]);
    setBulkText('');
  };

  const updateParsed = (idx, field, value) => {
    setParsedItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  return (
    <div className="page-enter">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Add Items</h1>
          <p className="page-subtitle">Type, speak, or bulk add your groceries</p>
        </div>
      </div>

      {/* Voice Modal */}
      {showVoice && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowVoice(false)}>
          <div className="modal-sheet glass-card" style={{ background: 'var(--bg-deep)' }}>
            <div className="modal-handle" />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 className="modal-title" style={{ margin: 0 }}>🎤 Voice Assistant</h2>
              <button className="btn-icon" onClick={() => setShowVoice(false)}><X size={20} /></button>
            </div>
            <VoiceInput
              onTranscript={(text) => { setBulkText(text); handleAIParse(text); }}
              onClose={() => setShowVoice(false)}
            />
          </div>
        </div>
      )}

      {/* Premium Tab Bar */}
      <div className="glass-card" style={{ display: 'flex', padding: 6, gap: 6, marginBottom: 24, borderRadius: 'var(--r-full)' }}>
        <button
          className="btn"
          style={{
            flex: 1, height: 44, borderRadius: 'var(--r-full)',
            background: tab === 'manual' ? 'rgba(255,255,255,0.1)' : 'transparent',
            color: tab === 'manual' ? 'var(--text-100)' : 'var(--text-400)',
            fontWeight: tab === 'manual' ? 700 : 500,
            transition: 'all var(--t-fast)'
          }}
          onClick={() => setTab('manual')}
        >
          <Type size={16} style={{ marginRight: 8 }} /> Manual Entry
        </button>
        <button
          className="btn"
          style={{
            flex: 1, height: 44, borderRadius: 'var(--r-full)',
            background: tab === 'bulk' ? 'rgba(167,139,250,0.15)' : 'transparent',
            color: tab === 'bulk' ? 'var(--violet-400)' : 'var(--text-400)',
            fontWeight: tab === 'bulk' ? 700 : 500,
            transition: 'all var(--t-fast)'
          }}
          onClick={() => setTab('bulk')}
        >
          <Sparkles size={16} style={{ marginRight: 8 }} /> AI Bulk Add
        </button>
      </div>

      {/* Manual Entry */}
      {tab === 'manual' && (
        <div className="glass-card page-enter" style={{ padding: 24 }}>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">Item Name</label>
            <input
              className="form-input"
              style={{ fontSize: 18, padding: 16 }}
              placeholder="e.g. Milk, Apples, Bread..."
              value={form.name}
              onChange={e => handleFormChange('name', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleManualAdd()}
              autoFocus
            />
          </div>

          <div className="form-row" style={{ marginBottom: 20 }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={e => handleFormChange('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Stored In</label>
              <select className="form-select" value={form.storageLocation} onChange={e => handleFormChange('storageLocation', e.target.value)}>
                {STORAGE_LOCATIONS.map(l => <option key={l.id} value={l.id}>{l.emoji} {l.label}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row" style={{ marginBottom: 24 }}>
            <div className="form-group">
              <label className="form-label">Quantity</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="form-input" type="number" min="0.1" step="0.1"
                  style={{ flex: 1 }}
                  value={form.quantity} onChange={e => handleFormChange('quantity', parseFloat(e.target.value) || 1)} />
                <select className="form-select" style={{ flex: 1.5 }} value={form.unit} onChange={e => handleFormChange('unit', e.target.value)}>
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Estimated Expiry</label>
              <input className="form-input" type="date" value={form.expiryDate} min={todayISO()}
                onChange={e => handleFormChange('expiryDate', e.target.value)} />
            </div>
          </div>

          <button
            className="btn btn-primary btn-full"
            style={{ height: 56, fontSize: 16, borderRadius: 'var(--r-lg)' }}
            onClick={handleManualAdd}
            disabled={!form.name.trim()}
          >
            <Plus size={20} style={{ marginRight: 8 }} /> Add Item to Pantry
          </button>
        </div>
      )}

      {/* AI Bulk Add */}
      {tab === 'bulk' && (
        <div className="glass-card page-enter" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Sparkles size={20} color="var(--violet-400)" />
                <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 18, color: 'var(--text-100)' }}>Gemini Vision</span>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-400)', margin: 0 }}>
                Type or dictate your grocery list directly.
              </p>
            </div>
            <button
              className="btn btn-glass"
              style={{
                borderRadius: 'var(--r-full)', width: 48, height: 48, padding: 0,
                background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)'
              }}
              onClick={() => setShowVoice(true)}
            >
              <Mic size={20} color="var(--violet-400)" />
            </button>
          </div>

          <textarea
            className="form-textarea"
            style={{ minHeight: 120, fontSize: 16, padding: 16, marginBottom: 20 }}
            placeholder="e.g. 2kg potatoes, half dozen eggs, 1 bottle of milk..."
            value={bulkText}
            onChange={e => setBulkText(e.target.value)}
          />

          {aiError && (
            <div style={{
              padding: 16, borderRadius: 'var(--r-md)',
              background: 'var(--urgent-bg)', border: '1px solid var(--urgent-border)',
              color: 'var(--urgent)', fontSize: 14, marginBottom: 20,
            }}>
              {aiError}
            </div>
          )}

          <button
            className="btn btn-primary btn-full"
            style={{
              height: 56, fontSize: 16, borderRadius: 'var(--r-lg)',
              background: 'linear-gradient(135deg, var(--violet-400), #818cf8)'
            }}
            onClick={() => handleAIParse()}
            disabled={aiLoading || !bulkText.trim()}
          >
            {aiLoading ? (
              <><div className="spinner" /> Analyzing...</>
            ) : (
              <><Sparkles size={20} style={{ marginRight: 8 }} /> Extract Ingredients</>
            )}
          </button>
        </div>
      )}

      {/* Parsed Items Results */}
      {tab === 'bulk' && parsedItems.length > 0 && (
        <div className="glass-card slide-up" style={{ padding: 24, marginTop: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--green-400)' }}>✓</span>
            Found {parsedItems.length} items
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {parsedItems.map((item, idx) => (
              <div key={idx} style={{
                background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)',
                borderRadius: 'var(--r-md)', padding: 12,
                display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: 12, alignItems: 'center'
              }}>
                <span style={{ fontSize: 24 }}>{CATEGORIES.find(c => c.id === item.category)?.emoji || '🍽️'}</span>
                
                <input className="form-input" style={{ padding: '8px 12px', fontSize: 14, border: 'none', background: 'transparent' }}
                  value={item.name} onChange={e => updateParsed(idx, 'name', e.target.value)} />
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input className="form-input" type="number" style={{ width: 64, padding: '8px 10px', fontSize: 14 }}
                    value={item.quantity} onChange={e => updateParsed(idx, 'quantity', parseFloat(e.target.value) || 1)} />
                  <span style={{ color: 'var(--text-400)', fontSize: 12 }}>{item.unit}</span>
                </div>

                <button className="btn-icon" onClick={() => setParsedItems(p => p.filter((_, i) => i !== idx))}>
                  <X size={16} color="var(--urgent)" />
                </button>
              </div>
            ))}
          </div>

          <button className="btn btn-primary btn-full" style={{ height: 56, fontSize: 16 }} onClick={handleAddParsed}>
            <Plus size={20} style={{ marginRight: 8 }} /> Confirm & Add All
          </button>
        </div>
      )}
    </div>
  );
}
