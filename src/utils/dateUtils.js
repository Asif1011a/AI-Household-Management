// Date utility helpers

export function getDaysRemaining(expiryDate) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  const diff = expiry - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getStatus(expiryDate) {
  const days = getDaysRemaining(expiryDate);
  if (days < 0) return 'expired';
  if (days === 0) return 'urgent';
  if (days <= 2) return 'urgent';
  if (days <= 5) return 'warning';
  return 'fresh';
}

export function getPriorityScore(item) {
  const days = getDaysRemaining(item.expiryDate);
  const status = getStatus(item.expiryDate);

  // Base score from days remaining (inverted: fewer days = higher score)
  let score = 100;
  if (days < 0) score = 0;
  else if (days === 0) score = 95;
  else if (days === 1) score = 85;
  else if (days === 2) score = 75;
  else if (days <= 5) score = 60;
  else if (days <= 10) score = 40;
  else if (days <= 30) score = 20;
  else score = 5;

  // Boost for high-perishability categories
  const perishabilityBoost = {
    leftovers: 15,
    dairy: 10,
    vegetables: 8,
    fruits: 8,
    protein: 12,
    grains: 0,
    packaged: 0,
    spices: 0,
    beverages: 2,
    snacks: 0,
  };
  score += (perishabilityBoost[item.category] || 0);

  // Boost for counter storage (fastest spoilage)
  if (item.storageLocation === 'counter') score += 5;

  return Math.min(100, Math.max(0, score));
}

export function formatDaysRemaining(days) {
  if (days < 0) return `Expired ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} ago`;
  if (days === 0) return 'Expires today!';
  if (days === 1) return 'Expires tomorrow';
  if (days <= 7) return `${days} days left`;
  if (days <= 30) return `${Math.ceil(days / 7)} weeks left`;
  return `${Math.ceil(days / 30)} months left`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export function addDaysToToday(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}
