import { useState } from 'react';
import { Plus, Sparkles, Mic, X } from 'lucide-react';
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
    if (!settings.geminiApiKey) {
      setAiError('Add your Gemini API key in Settings first.');
      return;
    }
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
      <div className="page-header">
        <div>
          <h1 className="page-title">Add Items</h1>
          <p className="page-subtitle">Manual, AI bulk, or voice — your choice</p>
        </div>
      </div>

      {/* Voice Modal */}
      {showVoice && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowVoice(false)}>
          <div className="modal-sheet">
            <div className="modal-handle" />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <h2 className="modal-title">🎤 Voice Input</h2>
              <button className="btn-icon" onClick={() => setShowVoice(false)}><X size={17} /></button>
            </div>
            <VoiceInput
              onTranscript={(text) => { setBulkText(text); handleAIParse(text); }}
              onClose={() => setShowVoice(false)}
            />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tab-bar">
        <button className={`tab-btn ${tab === 'manual' ? 'active' : ''}`} onClick={() => setTab('manual')}>
          ✏️ Manual
        </button>
        <button className={`tab-btn ${tab === 'bulk' ? 'active' : ''}`} onClick={() => setTab('bulk')}>
          ✨ AI Bulk
        </button>
      </div>

      {/* Manual Entry */}
      {tab === 'manual' && (
        <div className="glass-card page-enter" style={{ padding: 20 }}>
          <div className="form-group">
            <label className="form-label">Item Name *</label>
            <input
              className="form-input"
              placeholder="e.g. Palak, Dahi, Atta, Bread..."
              value={form.name}
              onChange={e => handleFormChange('name', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleManualAdd()}
            />
            <div style={{ fontSize: 12, color: 'var(--text-600)' }}>
              💡 Expiry auto-estimated from name
            </div>
          </div>

          <div className="form-row">
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

          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Qty</label>
              <input className="form-input" type="number" min="0.1" step="0.1"
                value={form.quantity} onChange={e => handleFormChange('quantity', parseFloat(e.target.value) || 1)} />
            </div>
            <div className="form-group">
              <label className="form-label">Unit</label>
              <select className="form-select" value={form.unit} onChange={e => handleFormChange('unit', e.target.value)}>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Expires</label>
              <input className="form-input" type="date" value={form.expiryDate} min={todayISO()}
                onChange={e => handleFormChange('expiryDate', e.target.value)} />
            </div>
          </div>

          {/* Quick expiry */}
          <div style={{ marginBottom: 20 }}>
            <div className="form-label" style={{ marginBottom: 8 }}>Quick Expiry</div>
            <div className="chip-bar" style={{ paddingBottom: 0 }}>
              {[1, 2, 3, 5, 7, 14, 30, 90].map(d => (
                <button key={d} className={`chip ${form.expiryDate === addDaysToToday(d) ? 'active' : ''}`}
                  onClick={() => handleFormChange('expiryDate', addDaysToToday(d))}>
                  {d}d
                </button>
              ))}
            </div>
          </div>

          <button className="btn btn-primary btn-full btn-lg" onClick={handleManualAdd} disabled={!form.name.trim()}>
            <Plus size={18} /> Add to Pantry
          </button>
        </div>
      )}

      {/* AI Bulk Add */}
      {tab === 'bulk' && (
        <div className="glass-card page-enter" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 16 }}>AI Bulk Add</span>
                <span style={{
                  background: 'rgba(99,102,241,0.15)', color: 'var(--violet-400)',
                  border: '1px solid rgba(99,102,241,0.3)',
                  borderRadius: 'var(--r-full)', padding: '2px 8px', fontSize: 10, fontWeight: 700,
                }}>✨ GEMINI</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-500)', lineHeight: 1.5 }}>
                Type or speak what you bought. AI parses everything.
              </p>
            </div>
            {/* Voice Button */}
            <button
              className="btn"
              style={{
                background: 'linear-gradient(135deg, rgba(167,139,250,0.2), rgba(167,139,250,0.1))',
                border: '1px solid rgba(167,139,250,0.3)',
                color: 'var(--violet-400)',
                borderRadius: 'var(--r-md)',
                padding: '10px 14px',
                flexShrink: 0,
                gap: 6,
              }}
              onClick={() => setShowVoice(true)}
            >
              <Mic size={16} /> Voice
            </button>
          </div>

          <div style={{
            background: 'rgba(167,139,250,0.05)',
            border: '1px solid rgba(167,139,250,0.15)',
            borderRadius: 'var(--r-md)',
            padding: '10px 14px',
            marginBottom: 14,
            fontSize: 13, color: 'var(--text-500)',
          }}>
            💡 <em>"2kg aloo, 500g palak, 1L doodh, 6 anda, bread, atta 2kg"</em>
          </div>

          <textarea
            className="form-textarea"
            style={{ marginBottom: 14 }}
            placeholder="Type your grocery list here... (Hindi or English both work!)"
            value={bulkText}
            onChange={e => setBulkText(e.target.value)}
          />

          {aiError && (
            <div style={{
              padding: '10px 14px', borderRadius: 'var(--r-md)',
              background: 'var(--urgent-bg)', border: '1px solid var(--urgent-border)',
              color: 'var(--urgent)', fontSize: 13, marginBottom: 14,
            }}>
              {aiError}
            </div>
          )}

          <button
            className="btn btn-primary btn-full btn-lg"
            onClick={() => handleAIParse()}
            disabled={aiLoading || !bulkText.trim()}
            style={{ marginBottom: parsedItems.length ? 20 : 0 }}
          >
            {aiLoading ? (
              <><div className="spinner" /> Parsing with Gemini...</>
            ) : (
              <><Sparkles size={18} /> Parse with AI</>
            )}
          </button>

          {/* Parsed Items */}
          {parsedItems.length > 0 && (
            <>
              <div className="section-label">
                <Sparkles size={12} style={{ color: 'var(--green-400)' }} />
                AI found {parsedItems.length} items
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                {parsedItems.map((item, idx) => (
                  <ParsedRow
                    key={idx}
                    item={item}
                    onUpdate={(f, v) => updateParsed(idx, f, v)}
                    onRemove={() => setParsedItems(p => p.filter((_, i) => i !== idx))}
                  />
                ))}
              </div>
              <button className="btn btn-primary btn-full" onClick={handleAddParsed}>
                <Plus size={16} /> Add All {parsedItems.length} Items
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ParsedRow({ item, onUpdate, onRemove }) {
  const emoji = CATEGORIES.find(c => c.id === item.category)?.emoji || '🍽️';
  return (
    <div style={{
      background: 'var(--glass-2)', border: '1px solid var(--glass-border)',
      borderRadius: 'var(--r-md)', padding: '12px 14px',
      display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap',
    }}>
      <span style={{ fontSize: 20, flexShrink: 0 }}>{emoji}</span>
      <input className="form-input" style={{ flex: '2 1 100px', padding: '8px 12px', fontSize: 13 }}
        value={item.name} onChange={e => onUpdate('name', e.target.value)} />
      <input className="form-input" type="number" style={{ width: 64, padding: '8px 10px', fontSize: 13 }}
        value={item.quantity} onChange={e => onUpdate('quantity', parseFloat(e.target.value) || 1)} />
      <select className="form-select" style={{ width: 88, padding: '8px 10px', fontSize: 12 }}
        value={item.unit} onChange={e => onUpdate('unit', e.target.value)}>
        {['piece','kg','grams','litre','ml','bunch','packet','bottle'].map(u => <option key={u} value={u}>{u}</option>)}
      </select>
      <input className="form-input" type="date" style={{ width: 136, padding: '8px 10px', fontSize: 12 }}
        value={item.expiryDate} onChange={e => onUpdate('expiryDate', e.target.value)} />
      <button className="btn-icon" onClick={onRemove}>
        <X size={14} style={{ color: 'var(--urgent)' }} />
      </button>
    </div>
  );
}
