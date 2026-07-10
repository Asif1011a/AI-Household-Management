export const CATEGORIES = [
  { id: 'vegetables', label: 'Vegetables', emoji: '🥦', color: '#10b981' },
  { id: 'fruits', label: 'Fruits', emoji: '🍎', color: '#f59e0b' },
  { id: 'dairy', label: 'Dairy', emoji: '🥛', color: '#60a5fa' },
  { id: 'grains', label: 'Grains & Pulses', emoji: '🌾', color: '#d97706' },
  { id: 'protein', label: 'Protein', emoji: '🥚', color: '#8b5cf6' },
  { id: 'spices', label: 'Spices & Condiments', emoji: '🌶️', color: '#ef4444' },
  { id: 'beverages', label: 'Beverages', emoji: '🧃', color: '#06b6d4' },
  { id: 'packaged', label: 'Packaged Food', emoji: '📦', color: '#94a3b8' },
  { id: 'leftovers', label: 'Leftovers', emoji: '🍱', color: '#a78bfa' },
  { id: 'snacks', label: 'Snacks', emoji: '🍪', color: '#fb923c' },
];

export const STORAGE_LOCATIONS = [
  { id: 'fridge', label: 'Fridge', emoji: '🧊' },
  { id: 'freezer', label: 'Freezer', emoji: '❄️' },
  { id: 'pantry', label: 'Pantry', emoji: '🗄️' },
  { id: 'counter', label: 'Counter', emoji: '🍽️' },
];

export const STATUS_CONFIG = {
  fresh: { label: 'Fresh', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', emoji: '🟢' },
  warning: { label: 'Use Soon', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', emoji: '🟡' },
  urgent: { label: 'Use Today', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', emoji: '🔴' },
  expired: { label: 'Expired', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.15)', emoji: '⚫' },
};
