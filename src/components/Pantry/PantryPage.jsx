import { useState, useMemo } from 'react';
import { Trash2, CheckCircle, XCircle, Edit2, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getDaysRemaining, formatDaysRemaining, formatDate } from '../../utils/dateUtils';
import { CATEGORIES, STORAGE_LOCATIONS } from '../../data/categories';
import { markItemUsed, markItemWasted, deleteItem, updateItem } from '../../services/storage';
import { todayISO, addDaysToToday } from '../../utils/dateUtils';

const STATUS_CHIPS = [
  { id: 'all', label: '🗂 All' },
  { id: 'urgent', label: '🔴 Urgent' },
  { id: 'warning', label: '🟡 Soon' },
  { id: 'fresh', label: '🟢 Fresh' },
  { id: 'expired', label: '⚫ Expired' },
];

const LOCATION_CHIPS = [
  { id: 'all', label: '📦 All' },
  { id: 'fridge', label: '🧊 Fridge' },
  { id: 'freezer', label: '❄️ Freezer' },
  { id: 'pantry', label: '🗄️ Pantry' },
  { id: 'counter', label: '🍽️ Counter' },
];

const UNITS = ['piece', 'kg', 'grams', 'litre', 'ml', 'bunch', 'packet', 'bottle', 'bowl', 'cup', 'dozen'];

export default function PantryPage({ inventory, onRefresh, addToast }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
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
    if (locationFilter !== 'all') r = r.filter(i => i.storageLocation === locationFilter);
    if (search) r = r.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
    return [...r].sort((a, b) => b.priorityScore - a.priorityScore);
  }, [activeItems, statusFilter, locationFilter, search]);

  const getCounts = (statusId) => {
    if (statusId === 'all') return activeItems.length;
    return activeItems.filter(i => i.status === statusId).length;
  };

  const handleUsed = (id, name) => {
    markItemUsed(id);
    onRefresh();
    // Dopamine hit: Confetti explosion!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4ade80', '#22d3ee', '#fbbf24']
    });
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
      <div className="page-header">
        <div>
          <h1 className="page-title">My Pantry</h1>
          <p className="page-subtitle">{activeItems.length} {showHistory ? 'history' : 'active'} items</p>
        </div>
        <button
          className="btn btn-glass btn-sm"
          onClick={() => setShowHistory(!showHistory)}
          style={{ flexShrink: 0 }}
        >
          {showHistory ? '📦 Active' : '📋 History'}
        </button>
      </div>

      {/* Search */}
      <input
        className="form-input"
        style={{ marginBottom: 14 }}
        placeholder="🔍 Search items..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* Status chips */}
      <div className="chip-bar">
        {STATUS_CHIPS.map(f => (
          <button key={f.id} className={`chip ${statusFilter === f.id ? 'active' : ''}`}
            onClick={() => setStatusFilter(f.id)}>
            {f.label}
            {f.id !== 'all' && <span style={{ opacity: 0.7 }}>({getCounts(f.id)})</span>}
          </button>
        ))}
      </div>

      {/* Location chips */}
      <div className="chip-bar">
        {LOCATION_CHIPS.map(f => (
          <button key={f.id} className={`chip ${locationFilter === f.id ? 'active' : ''}`}
            onClick={() => setLocationFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Items */}
      {filtered.length === 0 ? (
        <div className="empty-v2">
          <div className="empty-icon">{inventory.length === 0 ? '🌿' : '🔍'}</div>
          <div className="empty-title">{inventory.length === 0 ? 'Pantry is empty' : 'No matches'}</div>
          <div className="empty-desc">
            {inventory.length === 0 ? 'Scan your fridge or add items to get started!' : 'Try different filters'}
          </div>
        </div>
      ) : (
        <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div className="food-emoji-blob">{emoji}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
            <div className="food-card-title truncate">{item.name}</div>
            {!isHistory && (
              <button className="btn-icon" style={{ flexShrink: 0, width: 30, height: 30 }} onClick={onEdit}>
                <Edit2 size={13} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            <span className={`status-pill ${item.status}`}>
              {item.status === 'fresh' ? '🟢' : item.status === 'warning' ? '🟡' : item.status === 'urgent' ? '🔴' : '⚫'}
              {' '}{formatDaysRemaining(days)}
            </span>
            <span style={{
              fontSize: 11, color: 'var(--text-500)', padding: '3px 8px',
              background: 'var(--glass-2)', borderRadius: 'var(--r-full)',
              border: '1px solid var(--glass-border)',
            }}>
              {locEmoji} {item.quantity} {item.unit}
            </span>
          </div>

          {/* Priority Bar */}
          {!isHistory && (
            <div style={{ marginBottom: 10 }}>
              <div className="progress-track">
                <div className="progress-fill-animated" style={{
                  width: `${item.priorityScore}%`,
                  background: item.priorityScore >= 70 ? 'var(--urgent)' :
                    item.priorityScore >= 40 ? 'var(--warning)' : 'var(--fresh)',
                }} />
              </div>
            </div>
          )}

          {isHistory ? (
            <span style={{
              fontSize: 13, fontWeight: 700,
              color: item.isUsed ? 'var(--fresh)' : 'var(--expired)',
            }}>
              {item.isUsed ? '✅ Saved' : '❌ Wasted'}
            </span>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={onUsed} className="btn btn-sm" style={{
                flex: 1, background: 'var(--fresh-bg)', color: 'var(--fresh)',
                border: '1px solid var(--fresh-border)', borderRadius: 'var(--r-sm)',
                gap: 5,
              }}>
                <CheckCircle size={13} /> Used
              </button>
              <button onClick={onWasted} className="btn btn-sm" style={{
                flex: 1, background: 'var(--expired-bg)', color: 'var(--expired)',
                border: '1px solid var(--expired-border)', borderRadius: 'var(--r-sm)',
                gap: 5,
              }}>
                <XCircle size={13} /> Wasted
              </button>
              <button onClick={onDelete} className="btn-icon" style={{ padding: '6px 8px', flexShrink: 0 }}>
                <Trash2 size={13} style={{ color: 'var(--urgent)' }} />
              </button>
            </div>
          )}
        </div>
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
      <div className="modal-sheet">
        <div className="modal-handle" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 className="modal-title">Edit Item</h2>
          <button className="btn-icon" onClick={onClose}><X size={17} /></button>
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

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button className="btn btn-glass" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 2 }}
            onClick={() => { updateItem(item.id, form); onSave(); }}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
