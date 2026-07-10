import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { CATEGORIES, STORAGE_LOCATIONS } from '../../data/categories';
import { updateItem } from '../../services/storage';
import { todayISO, addDaysToToday } from '../../utils/dateUtils';

export default function EditItemModal({ item, onClose, onSave }) {
  const [form, setForm] = useState({
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    unit: item.unit,
    storageLocation: item.storageLocation,
    expiryDate: item.expiryDate,
    notes: item.notes || '',
  });

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = () => {
    updateItem(item.id, form);
    onSave();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">Edit Item</h3>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Item Name</label>
            <input className="form-input" value={form.name} onChange={e => handleChange('name', e.target.value)} />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={e => handleChange('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Storage Location</label>
              <select className="form-select" value={form.storageLocation} onChange={e => handleChange('storageLocation', e.target.value)}>
                {STORAGE_LOCATIONS.map(l => <option key={l.id} value={l.id}>{l.emoji} {l.label}</option>)}
              </select>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input className="form-input" type="number" min="0" step="0.1"
                value={form.quantity} onChange={e => handleChange('quantity', parseFloat(e.target.value) || 0)} />
            </div>
            <div className="form-group">
              <label className="form-label">Unit</label>
              <select className="form-select" value={form.unit} onChange={e => handleChange('unit', e.target.value)}>
                {['piece', 'kg', 'grams', 'litre', 'ml', 'bunch', 'packet', 'bottle', 'bowl', 'cup', 'dozen'].map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Expiry Date</label>
            <input className="form-input" type="date" value={form.expiryDate}
              min={todayISO()} onChange={e => handleChange('expiryDate', e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Notes (optional)</label>
            <input className="form-input" value={form.notes}
              placeholder="Any notes about this item..."
              onChange={e => handleChange('notes', e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave}>
            <Save size={15} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
