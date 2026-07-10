import { getStatus, getPriorityScore } from '../utils/dateUtils';

const STORAGE_KEY = 'greenbite_inventory';
const ACTIVITY_KEY = 'greenbite_activity';
const SETTINGS_KEY = 'greenbite_settings';

// ── Inventory ──────────────────────────────────────────────────────────────

export function loadInventory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const items = raw ? JSON.parse(raw) : [];
    // Recalculate status and priority on every load
    return items.map(item => ({
      ...item,
      status: getStatus(item.expiryDate),
      priorityScore: getPriorityScore(item),
    })).sort((a, b) => b.priorityScore - a.priorityScore);
  } catch {
    return [];
  }
}

export function saveInventory(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function addItem(item) {
  const items = loadInventory();
  const newItem = {
    ...item,
    id: generateId(),
    status: getStatus(item.expiryDate),
    priorityScore: getPriorityScore(item),
    isUsed: false,
    isWasted: false,
    usedDate: null,
    createdAt: new Date().toISOString(),
  };
  items.push(newItem);
  saveInventory(items);
  logActivity('added', newItem);
  return newItem;
}

export function addItems(itemsArray) {
  const items = loadInventory();
  const newItems = itemsArray.map(item => ({
    ...item,
    id: generateId(),
    status: getStatus(item.expiryDate),
    priorityScore: getPriorityScore(item),
    isUsed: false,
    isWasted: false,
    usedDate: null,
    createdAt: new Date().toISOString(),
  }));
  const merged = [...items, ...newItems];
  saveInventory(merged);
  newItems.forEach(i => logActivity('added', i));
  return newItems;
}

export function updateItem(id, updates) {
  const items = loadInventory();
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) return null;
  const updated = {
    ...items[idx],
    ...updates,
    status: getStatus(updates.expiryDate || items[idx].expiryDate),
    priorityScore: getPriorityScore({ ...items[idx], ...updates }),
  };
  items[idx] = updated;
  saveInventory(items);
  return updated;
}

export function markItemUsed(id) {
  const items = loadInventory();
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) return;
  items[idx] = { ...items[idx], isUsed: true, usedDate: new Date().toISOString() };
  saveInventory(items);
  logActivity('used', items[idx]);
}

export function markItemWasted(id) {
  const items = loadInventory();
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) return;
  items[idx] = { ...items[idx], isWasted: true, usedDate: new Date().toISOString() };
  saveInventory(items);
  logActivity('wasted', items[idx]);
}

export function deleteItem(id) {
  const items = loadInventory();
  const filtered = items.filter(i => i.id !== id);
  saveInventory(filtered);
}

// ── Activity Log ───────────────────────────────────────────────────────────

export function logActivity(action, item) {
  try {
    const logs = getActivityLog();
    logs.push({
      id: generateId(),
      action, // 'added' | 'used' | 'wasted'
      itemName: item.name,
      itemCategory: item.category,
      timestamp: new Date().toISOString(),
    });
    // Keep last 500 entries
    const trimmed = logs.slice(-500);
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(trimmed));
  } catch {}
}

export function getActivityLog() {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ── Settings ───────────────────────────────────────────────────────────────

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : getDefaultSettings();
  } catch {
    return getDefaultSettings();
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function getDefaultSettings() {
  return {
    geminiApiKey: '',
    householdName: 'My Kitchen',
    notificationsEnabled: true,
    alertDaysBefore: 2,
    healthProfile: '',
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function clearAll() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(ACTIVITY_KEY);
}
