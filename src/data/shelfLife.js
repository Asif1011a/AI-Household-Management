// Default shelf life in days for common Indian household items
export const SHELF_LIFE_DB = {
  // Vegetables - Fridge
  spinach: { fridge: 3, freezer: 180, counter: 1, category: 'vegetables' },
  palak: { fridge: 3, freezer: 180, counter: 1, category: 'vegetables' },
  tomato: { fridge: 7, freezer: 365, counter: 5, category: 'vegetables' },
  tamatar: { fridge: 7, freezer: 365, counter: 5, category: 'vegetables' },
  onion: { fridge: 60, freezer: 365, counter: 30, category: 'vegetables' },
  pyaz: { fridge: 60, freezer: 365, counter: 30, category: 'vegetables' },
  potato: { fridge: 30, freezer: 365, counter: 14, category: 'vegetables' },
  aloo: { fridge: 30, freezer: 365, counter: 14, category: 'vegetables' },
  carrot: { fridge: 21, freezer: 365, counter: 5, category: 'vegetables' },
  gajar: { fridge: 21, freezer: 365, counter: 5, category: 'vegetables' },
  cucumber: { fridge: 7, freezer: null, counter: 3, category: 'vegetables' },
  kheera: { fridge: 7, freezer: null, counter: 3, category: 'vegetables' },
  capsicum: { fridge: 10, freezer: 180, counter: 4, category: 'vegetables' },
  shimla: { fridge: 10, freezer: 180, counter: 4, category: 'vegetables' },
  peas: { fridge: 5, freezer: 365, counter: 2, category: 'vegetables' },
  matar: { fridge: 5, freezer: 365, counter: 2, category: 'vegetables' },
  brinjal: { fridge: 5, freezer: null, counter: 3, category: 'vegetables' },
  baingan: { fridge: 5, freezer: null, counter: 3, category: 'vegetables' },
  cauliflower: { fridge: 7, freezer: 365, counter: 3, category: 'vegetables' },
  gobi: { fridge: 7, freezer: 365, counter: 3, category: 'vegetables' },
  cabbage: { fridge: 14, freezer: 365, counter: 3, category: 'vegetables' },
  'bitter gourd': { fridge: 5, freezer: null, counter: 2, category: 'vegetables' },
  karela: { fridge: 5, freezer: null, counter: 2, category: 'vegetables' },
  ladyfinger: { fridge: 4, freezer: 365, counter: 2, category: 'vegetables' },
  bhindi: { fridge: 4, freezer: 365, counter: 2, category: 'vegetables' },
  'green chili': { fridge: 14, freezer: 365, counter: 5, category: 'vegetables' },
  'hari mirch': { fridge: 14, freezer: 365, counter: 5, category: 'vegetables' },
  garlic: { fridge: 120, freezer: 365, counter: 30, category: 'vegetables' },
  lahsun: { fridge: 120, freezer: 365, counter: 30, category: 'vegetables' },
  ginger: { fridge: 30, freezer: 180, counter: 7, category: 'vegetables' },
  adrak: { fridge: 30, freezer: 180, counter: 7, category: 'vegetables' },
  // Fruits
  banana: { fridge: 7, freezer: 90, counter: 4, category: 'fruits' },
  kela: { fridge: 7, freezer: 90, counter: 4, category: 'fruits' },
  apple: { fridge: 45, freezer: 365, counter: 7, category: 'fruits' },
  seb: { fridge: 45, freezer: 365, counter: 7, category: 'fruits' },
  mango: { fridge: 5, freezer: 90, counter: 3, category: 'fruits' },
  aam: { fridge: 5, freezer: 90, counter: 3, category: 'fruits' },
  orange: { fridge: 21, freezer: 365, counter: 7, category: 'fruits' },
  santra: { fridge: 21, freezer: 365, counter: 7, category: 'fruits' },
  grapes: { fridge: 7, freezer: 90, counter: 2, category: 'fruits' },
  angoor: { fridge: 7, freezer: 90, counter: 2, category: 'fruits' },
  watermelon: { fridge: 7, freezer: null, counter: 3, category: 'fruits' },
  tarbooz: { fridge: 7, freezer: null, counter: 3, category: 'fruits' },
  papaya: { fridge: 5, freezer: null, counter: 2, category: 'fruits' },
  papita: { fridge: 5, freezer: null, counter: 2, category: 'fruits' },
  // Dairy
  milk: { fridge: 5, freezer: 90, counter: 0.5, category: 'dairy' },
  doodh: { fridge: 5, freezer: 90, counter: 0.5, category: 'dairy' },
  curd: { fridge: 7, freezer: null, counter: 0.5, category: 'dairy' },
  dahi: { fridge: 7, freezer: null, counter: 0.5, category: 'dairy' },
  paneer: { fridge: 5, freezer: 60, counter: 0.5, category: 'dairy' },
  butter: { fridge: 30, freezer: 180, counter: 3, category: 'dairy' },
  makkhan: { fridge: 30, freezer: 180, counter: 3, category: 'dairy' },
  cheese: { fridge: 21, freezer: 180, counter: 1, category: 'dairy' },
  ghee: { fridge: 365, freezer: 730, counter: 90, category: 'dairy' },
  cream: { fridge: 7, freezer: 90, counter: 0.5, category: 'dairy' },
  khoa: { fridge: 7, freezer: 60, counter: 1, category: 'dairy' },
  // Grains & Pulses
  rice: { fridge: 730, freezer: 730, counter: 365, category: 'grains' },
  chawal: { fridge: 730, freezer: 730, counter: 365, category: 'grains' },
  'cooked rice': { fridge: 4, freezer: 60, counter: 0.5, category: 'leftovers' },
  wheat: { fridge: 365, freezer: 730, counter: 180, category: 'grains' },
  atta: { fridge: 180, freezer: 365, counter: 90, category: 'grains' },
  dal: { fridge: 365, freezer: 730, counter: 180, category: 'grains' },
  'cooked dal': { fridge: 3, freezer: 60, counter: 0.5, category: 'leftovers' },
  'toor dal': { fridge: 365, freezer: 730, counter: 180, category: 'grains' },
  'moong dal': { fridge: 365, freezer: 730, counter: 180, category: 'grains' },
  'chana dal': { fridge: 365, freezer: 730, counter: 180, category: 'grains' },
  rajma: { fridge: 365, freezer: 730, counter: 180, category: 'grains' },
  chickpeas: { fridge: 365, freezer: 730, counter: 180, category: 'grains' },
  chana: { fridge: 365, freezer: 730, counter: 180, category: 'grains' },
  bread: { fridge: 7, freezer: 90, counter: 4, category: 'grains' },
  // Protein
  eggs: { fridge: 35, freezer: null, counter: 7, category: 'protein' },
  anda: { fridge: 35, freezer: null, counter: 7, category: 'protein' },
  chicken: { fridge: 2, freezer: 90, counter: 0.2, category: 'protein' },
  'mutton': { fridge: 2, freezer: 90, counter: 0.2, category: 'protein' },
  fish: { fridge: 1, freezer: 90, counter: 0.2, category: 'protein' },
  // Leftovers
  sabzi: { fridge: 2, freezer: 30, counter: 0.2, category: 'leftovers' },
  curry: { fridge: 3, freezer: 30, counter: 0.2, category: 'leftovers' },
  roti: { fridge: 2, freezer: 30, counter: 0.2, category: 'leftovers' },
  chapati: { fridge: 2, freezer: 30, counter: 0.2, category: 'leftovers' },
};

export function getShelfLife(itemName, storageLocation = 'fridge') {
  const key = itemName.toLowerCase().trim();
  const entry = SHELF_LIFE_DB[key];
  if (entry) {
    return entry[storageLocation] || entry.fridge || 7;
  }
  // Default by category heuristic
  return getDefaultShelfLife(storageLocation);
}

export function getDefaultShelfLife(storageLocation) {
  const defaults = { fridge: 7, freezer: 180, counter: 3, pantry: 30 };
  return defaults[storageLocation] || 7;
}
