import { useState, useMemo } from 'react';
import { Trash2, CheckCircle, XCircle, Edit2, X, Search, Filter } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getDaysRemaining, formatDaysRemaining } from '../../utils/dateUtils';
import { CATEGORIES, STORAGE_LOCATIONS } from '../../data/categories';
import { markItemUsed, markItemWasted, deleteItem, updateItem } from '../../services/storage';
import { todayISO, addDaysToToday } from '../../utils/dateUtils';

const STATUS_CHIPS = [
  { id: 'all', label: 'All' },
  { id: 'urgent', label: 'Urgent', color: 'var(--urgent)' },
  { id: 'warning', label: 'Soon', color: 'var(--warning)' },
  { id: 'fresh', label: 'Fresh', color: 'var(--fresh)' },
  { id: 'expired', label: 'Expired', color: 'var(--expired)' },
];

const UNITS = ['piece', 'kg', 'grams', 'litre', 'ml', 'bunch', 'packet', 'bottle', 'bowl', 'cup', 'dozen'];

export default function PantryPage({ inventory, onRefresh, addToast }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const activeItems = useMemo(
    () => inventory.filter(i => showHistory ? (i.isUsed || i.isWasted) : (!i.isUsed && !i.isWasted)),
    [inventory, showHistory]
  );

  const filtered = useMemo(() => {
    let r = activeItems;
    if (statusFilter !== 'all') r = r.filter(i => i.status === statusFilter);
    if (search) r = r.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
    return [...r].sort((a, b) => b.priorityScore - a.priorityScore);
  }, [activeItems, statusFilter, search]);

  const handleUsed = (id, name) => {
    markItemUsed(id);
    onRefresh();
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#10b981', '#22d3ee', '#a78bfa'] });
    addToast?.(`✅ "${name}" marked as used!`, 'success');
  };

  const handleWasted = (id, name) => {
    markItemWasted(id);
    onRefresh();
    addToast?.(`"${name}" marked as wasted`, 'info');
  };

  const handleDelete = (id) => { deleteItem(id); onRefresh(); };

  return (
    <div className="page-enter">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">My Pantry</h1>
          <p className="page-subtitle">{activeItems.length} {showHistory ? 'history' : 'active'} items total</p>
        </div>
        <button className="btn btn-glass btn-sm" onClick={() => setShowHistory(!showHistory)} style={{ borderRadius: 'var(--r-full)' }}>
          {showHistory ? '📦 Active' : '📋 History'}
        </button>
      </div>

      {/* Advanced Search & Filter Bar */}
      <div className="glass-card" style={{ padding: 12, marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-400)' }} />
          <input
            className="form-input"
            style={{ paddingLeft: 44, background: 'rgba(255,255,255,0.02)', border: 'none' }}
            placeholder="Search ingredients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="chip-bar" style={{ paddingBottom: 0, paddingLeft: 4 }}>
          {STATUS_CHIPS.map(f => (
            <button key={f.id} 
              className={`chip ${statusFilter === f.id ? 'active' : ''}`}
              style={{
                borderColor: statusFilter === f.id ? f.color : 'transparent',
                color: statusFilter === f.id ? f.color : 'var(--text-400)',
              }}
              onClick={() => setStatusFilter(f.id)}>
              {f.id !== 'all' && <span style={{ width: 8, height: 8, borderRadius: 4, background: f.color, marginRight: 6, display: 'inline-block' }}/>}
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Items List */}
      {filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: 40, textAlign: 'center', background: 'transparent' }}>
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>{inventory.length === 0 ? '🌿' : '🔍'}</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-200)', marginBottom: 8 }}>
            {inventory.length === 0 ? 'Pantry is empty' : 'No matches found'}
          </div>
          <div style={{ color: 'var(--text-500)', fontSize: 14 }}>
            {inventory.length === 0 ? 'Scan your fridge or add items manually to get started!' : 'Try adjusting your search filters'}
          </div>
        </div>
      ) : (
        <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(item => (
            <FoodCardV2
              key={item.id}
              item={item}
              isHistory={showHistory}
              onUsed={() => handleUsed(item.id, item.name)}
              onWasted={() => handleWasted(item.id, item.name)}
              onDelete={() => handleDelete(item.id)}
              onEdit={() => setEditItem(item)}
            />
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editItem && (
        <EditModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onSave={() => { setEditItem(null); onRefresh(); addToast?.('✅ Item updated!', 'success'); }}
        />
      )}
    </div>
  );
}

function FoodCardV2({ item, isHistory, onUsed, onWasted, onDelete, onEdit }) {
  const days = getDaysRemaining(item.expiryDate);
  const emoji = CATEGORIES.find(c => c.id === item.category)?.emoji || '🍽️';
  const locEmoji = STORAGE_LOCATIONS.find(l => l.id === item.storageLocation)?.emoji || '📦';

  const statusColor = {
    fresh: 'var(--fresh)', warning: 'var(--warning)',
    urgent: 'var(--urgent)', expired: 'var(--expired)',
  }[item.status] || 'var(--fresh)';

  return (
    <div className={`food-card-v2 status-${item.status}`} style={{ '--status-color': statusColor }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{
          width: 56, height: 56, borderRadius: 'var(--r-lg)',
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0
        }}>
          {emoji}
        </div>
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-100)' }} className="truncate">
              {item.name}
            </div>
            {!isHistory && (
              <button className="btn-icon" style={{ flexShrink: 0, width: 32, height: 32 }} onClick={onEdit}>
                <Edit2 size={14} color="var(--text-400)" />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 12, fontWeight: 700, padding: '4px 10px',
              background: `color-mix(in srgb, ${statusColor} 15%, transparent)`,
              color: statusColor, borderRadius: 'var(--r-sm)',
              border: `1px solid color-mix(in srgb, ${statusColor} 30%, transparent)`
            }}>
              {item.status === 'fresh' ? '🟢' : item.status === 'warning' ? '🟡' : item.status === 'urgent' ? '🔴' : '⚫'}
              {' '}{formatDaysRemaining(days)}
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-400)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ opacity: 0.5 }}>{locEmoji}</span> {item.quantity} {item.unit}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons for History / Active */}
      <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 8 }}>
        {isHistory ? (
          <div style={{ fontSize: 14, fontWeight: 700, color: item.isUsed ? 'var(--fresh)' : 'var(--expired)', display: 'flex', alignItems: 'center', gap: 8 }}>
            {item.isUsed ? <CheckCircle size={16} /> : <XCircle size={16} />}
            {item.isUsed ? 'Successfully Used' : 'Wasted / Expired'}
          </div>
        ) : (
          <>
            <button onClick={onUsed} className="btn" style={{
              flex: 1, background: 'color-mix(in srgb, var(--fresh) 10%, transparent)',
              color: 'var(--fresh)', border: '1px solid color-mix(in srgb, var(--fresh) 20%, transparent)',
              borderRadius: 'var(--r-md)', gap: 8, height: 40,
            }}>
              <CheckCircle size={16} /> Used
            </button>
            <button onClick={onWasted} className="btn" style={{
              flex: 1, background: 'color-mix(in srgb, var(--expired) 10%, transparent)',
              color: 'var(--expired)', border: '1px solid color-mix(in srgb, var(--expired) 20%, transparent)',
              borderRadius: 'var(--r-md)', gap: 8, height: 40,
            }}>
              <XCircle size={16} /> Wasted
            </button>
            <button onClick={onDelete} className="btn-icon" style={{ width: 40, height: 40, flexShrink: 0, background: 'rgba(255,255,255,0.02)' }}>
              <Trash2 size={16} style={{ color: 'var(--urgent)' }} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function EditModal({ item, onClose, onSave }) {
  const [form, setForm] = useState({
    name: item.name, category: item.category, quantity: item.quantity,
    unit: item.unit, storageLocation: item.storageLocation,
    expiryDate: item.expiryDate, notes: item.notes || '',
  });

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet glass-card" style={{ background: 'var(--bg-deep)', padding: 24, borderRadius: '24px 24px 0 0' }}>
        <div className="modal-handle" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 className="modal-title" style={{ margin: 0 }}>Edit Item</h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="form-group">
          <label className="form-label">Name</label>
          <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Location</label>
            <select className="form-select" value={form.storageLocation} onChange={e => setForm(p => ({ ...p, storageLocation: e.target.value }))}>
              {STORAGE_LOCATIONS.map(l => <option key={l.id} value={l.id}>{l.emoji} {l.label}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Quantity</label>
            <input className="form-input" type="number" min="0.1" step="0.1"
              value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: parseFloat(e.target.value) || 1 }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Unit</label>
            <select className="form-select" value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}>
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Expiry Date</label>
          <input className="form-input" type="date" value={form.expiryDate} min={todayISO()}
            onChange={e => setForm(p => ({ ...p, expiryDate: e.target.value }))} />
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button className="btn btn-glass" style={{ flex: 1, padding: 16 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 2, padding: 16 }}
            onClick={() => { updateItem(item.id, form); onSave(); }}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
