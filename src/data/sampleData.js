// Generate ID without external library
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

const today = new Date();

const addDays = (days) => {
  const date = new Date(today);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

const purchaseDate = today.toISOString().split('T')[0];

export const SAMPLE_DATA = [
  {
    id: generateId(), name: 'Palak (Spinach)', category: 'vegetables',
    quantity: 1, unit: 'bunch', storageLocation: 'fridge',
    purchaseDate: addDays(-2), expiryDate: addDays(1),
    notes: 'Bought from market', isUsed: false, isWasted: false, usedDate: null,
  },
  {
    id: generateId(), name: 'Dahi (Curd)', category: 'dairy',
    quantity: 500, unit: 'grams', storageLocation: 'fridge',
    purchaseDate: addDays(-5), expiryDate: addDays(2),
    notes: '', isUsed: false, isWasted: false, usedDate: null,
  },
  {
    id: generateId(), name: 'Tomatoes', category: 'vegetables',
    quantity: 6, unit: 'piece', storageLocation: 'fridge',
    purchaseDate: addDays(-3), expiryDate: addDays(4),
    notes: '', isUsed: false, isWasted: false, usedDate: null,
  },
  {
    id: generateId(), name: 'Milk (Amul)', category: 'dairy',
    quantity: 1, unit: 'litre', storageLocation: 'fridge',
    purchaseDate: addDays(-1), expiryDate: addDays(3),
    notes: '', isUsed: false, isWasted: false, usedDate: null,
  },
  {
    id: generateId(), name: 'Bread (Brown)', category: 'grains',
    quantity: 1, unit: 'packet', storageLocation: 'counter',
    purchaseDate: addDays(-2), expiryDate: addDays(2),
    notes: '', isUsed: false, isWasted: false, usedDate: null,
  },
  {
    id: generateId(), name: 'Paneer', category: 'dairy',
    quantity: 200, unit: 'grams', storageLocation: 'fridge',
    purchaseDate: addDays(-3), expiryDate: addDays(0),
    notes: 'Use urgently!', isUsed: false, isWasted: false, usedDate: null,
  },
  {
    id: generateId(), name: 'Onions', category: 'vegetables',
    quantity: 1, unit: 'kg', storageLocation: 'pantry',
    purchaseDate: addDays(-10), expiryDate: addDays(20),
    notes: '', isUsed: false, isWasted: false, usedDate: null,
  },
  {
    id: generateId(), name: 'Toor Dal', category: 'grains',
    quantity: 500, unit: 'grams', storageLocation: 'pantry',
    purchaseDate: addDays(-30), expiryDate: addDays(180),
    notes: '', isUsed: false, isWasted: false, usedDate: null,
  },
  {
    id: generateId(), name: 'Eggs', category: 'protein',
    quantity: 6, unit: 'piece', storageLocation: 'fridge',
    purchaseDate: addDays(-5), expiryDate: addDays(20),
    notes: '', isUsed: false, isWasted: false, usedDate: null,
  },
  {
    id: generateId(), name: 'Atta (Wheat Flour)', category: 'grains',
    quantity: 2, unit: 'kg', storageLocation: 'pantry',
    purchaseDate: addDays(-15), expiryDate: addDays(75),
    notes: '', isUsed: false, isWasted: false, usedDate: null,
  },
  {
    id: generateId(), name: 'Leftover Sabzi', category: 'leftovers',
    quantity: 1, unit: 'bowl', storageLocation: 'fridge',
    purchaseDate: addDays(-1), expiryDate: addDays(1),
    notes: 'Aloo gobi from yesterday', isUsed: false, isWasted: false, usedDate: null,
  },
  {
    id: generateId(), name: 'Bananas', category: 'fruits',
    quantity: 4, unit: 'piece', storageLocation: 'counter',
    purchaseDate: addDays(-4), expiryDate: addDays(1),
    notes: '', isUsed: false, isWasted: false, usedDate: null,
  },
  {
    id: generateId(), name: 'Rice (Basmati)', category: 'grains',
    quantity: 5, unit: 'kg', storageLocation: 'pantry',
    purchaseDate: addDays(-20), expiryDate: addDays(340),
    notes: '', isUsed: false, isWasted: false, usedDate: null,
  },
  {
    id: generateId(), name: 'Ghee', category: 'dairy',
    quantity: 500, unit: 'grams', storageLocation: 'pantry',
    purchaseDate: addDays(-10), expiryDate: addDays(350),
    notes: '', isUsed: false, isWasted: false, usedDate: null,
  },
  {
    id: generateId(), name: 'Green Chillies', category: 'vegetables',
    quantity: 100, unit: 'grams', storageLocation: 'fridge',
    purchaseDate: addDays(-7), expiryDate: addDays(7),
    notes: '', isUsed: false, isWasted: false, usedDate: null,
  },
];
