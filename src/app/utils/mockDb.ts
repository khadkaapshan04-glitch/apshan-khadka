// Mock Database and Auth Service for Flavoré Restaurant Management System

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Starters' | 'Mains' | 'Desserts' | 'Beverages';
  image_url: string;
  is_available: boolean;
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'out-for-delivery' | 'delivered' | 'cancelled';
export type OrderType = 'dine-in' | 'takeaway' | 'delivery';

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  type: OrderType;
  tableNumber?: string;
  deliveryAddress?: string;
  deliveryPhone?: string;
  deliveryNotes?: string;
  estimatedDelivery?: string;
  created_at: string;
}

export interface RestaurantTable {
  id: string;
  number: string;
  capacity: number;
  type: 'corner' | 'middle' | 'bar';
  position: { x: number; y: number }; // Percentage based for layout
}

export interface Reservation {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  tableId?: string;
  tableNumber?: string;
  created_at: string;
}

export interface UserProfile {
  email: string;
  fullName: string;
  role: 'customer' | 'staff' | 'admin';
}

const inMemoryStorage: Record<string, string> = {};
const StorageWrapper = {
  getItem: (key: string): string | null => {
    try { return window.localStorage.getItem(key); } catch { return inMemoryStorage[key] || null; }
  },
  setItem: (key: string, value: string): void => {
    try { window.localStorage.setItem(key, value); } catch { inMemoryStorage[key] = value; }
  },
  removeItem: (key: string): void => {
    try { window.localStorage.removeItem(key); } catch { delete inMemoryStorage[key]; }
  }
};

// Initial Table Data
const INITIAL_TABLES: RestaurantTable[] = [
  { id: 't1', number: '1', capacity: 2, type: 'middle', position: { x: 20, y: 20 } },
  { id: 't2', number: '2', capacity: 2, type: 'middle', position: { x: 40, y: 20 } },
  { id: 't3', number: '3', capacity: 4, type: 'corner', position: { x: 60, y: 20 } },
  { id: 't4', number: '4', capacity: 4, type: 'corner', position: { x: 80, y: 20 } },
  { id: 't5', number: '5', capacity: 6, type: 'middle', position: { x: 20, y: 50 } },
  { id: 't6', number: '6', capacity: 4, type: 'middle', position: { x: 40, y: 50 } },
  { id: 't7', number: '7', capacity: 2, type: 'middle', position: { x: 60, y: 50 } },
  { id: 't8', number: '8', capacity: 2, type: 'middle', position: { x: 80, y: 50 } },
  { id: 't9', number: '9', capacity: 8, type: 'corner', position: { x: 20, y: 80 } },
  { id: 't10', number: '10', capacity: 4, type: 'middle', position: { x: 50, y: 80 } },
  { id: 't11', number: '11', capacity: 2, type: 'bar', position: { x: 80, y: 80 } },
  { id: 't12', number: '12', capacity: 2, type: 'bar', position: { x: 90, y: 80 } },
];

// Initial Menu Data
const INITIAL_MENU: MenuItem[] = [
  {
    id: 'm1',
    name: 'Steamed Chicken Momo',
    description: 'Freshly hand-wrapped dumplings filled with juicy minced chicken and aromatic Nepali spices, served with spicy tomato-sesame golbheda chutney.',
    price: 280.00,
    category: 'Starters',
    image_url: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&q=80&w=600',
    is_available: true
  },
  {
    id: 'm2',
    name: 'Jhol Momo',
    description: 'Steamed chicken dumplings served in a bowl of warm, savory, and spicy sesame-peanut soup broth.',
    price: 300.00,
    category: 'Starters',
    image_url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=600',
    is_available: true
  },
  {
    id: 'm3',
    name: 'Buff Choila',
    description: 'Traditional Newari spiced charcoal-grilled buffalo meat marinated with mustard oil, roasted garlic, ginger, and crispy fenugreek seeds.',
    price: 320.00,
    category: 'Starters',
    image_url: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=600',
    is_available: true
  },
  {
    id: 'm4',
    name: 'Mutton Sekuwa',
    description: 'Tender skewered mutton pieces charcoal-grilled over wood fire with traditional Himalayan herbs and chili marinade.',
    price: 450.00,
    category: 'Starters',
    image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=600',
    is_available: true
  },
  {
    id: 'm5',
    name: 'Thakali Khana Set (Chicken)',
    description: 'Authentic Mustang Thakali thali with steamed basmati rice, local chicken curry, black lentil dal, gundruk, gheu, and spicy radish pickle.',
    price: 550.00,
    category: 'Mains',
    image_url: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&q=80&w=600',
    is_available: true
  },
  {
    id: 'm6',
    name: 'Paneer Butter Masala & Naan',
    description: 'Soft cottage cheese cubes cooked in a rich, velvety butter-tomato gravy, served with warm garlic butter naan bread.',
    price: 420.00,
    category: 'Mains',
    image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600',
    is_available: true
  },
  {
    id: 'm7',
    name: 'Nepali Veg Chowmein',
    description: 'Wok-tossed stir-fried noodles with crunchy fresh vegetables, soy sauce, garlic, and home-style Nepali chili spices.',
    price: 220.00,
    category: 'Mains',
    image_url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=600',
    is_available: true
  },
  {
    id: 'm8',
    name: 'Sel Roti with Aloo Dum',
    description: 'Traditional ring-shaped sweet rice bread fried golden crisp, served with Darjeeling-style spicy potato curry.',
    price: 180.00,
    category: 'Starters',
    image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=600',
    is_available: true
  },
  {
    id: 'm9',
    name: 'Yomari (Chaku)',
    description: 'Traditional Newari steamed rice flour dumpling stuffed with sweet molten jaggery (chaku) and roasted sesame seeds.',
    price: 220.00,
    category: 'Desserts',
    image_url: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&q=80&w=600',
    is_available: true
  },
  {
    id: 'm10',
    name: 'Special Masala Chia (Tea)',
    description: 'Authentic Nepali brewed milk tea boiled with green cardamom, cloves, cinnamon stick, black pepper, and fresh ginger.',
    price: 80.00,
    category: 'Beverages',
    image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=600',
    is_available: true
  },
  {
    id: 'm11',
    name: 'Sweet Mango Lassi',
    description: 'Creamy churned yogurt blend with fresh Alphonso mango pulp, topped with chopped almonds and crushed pistachios.',
    price: 150.00,
    category: 'Beverages',
    image_url: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&q=80&w=600',
    is_available: true
  },
  {
    id: 'm12',
    name: 'Truffle Parmesan Fries',
    description: 'Crispy hand-cut fries tossed in white truffle oil, grated parmesan cheese, and fresh parsley, served with garlic aioli.',
    price: 350.00,
    category: 'Starters',
    image_url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=600',
    is_available: true
  }
];

// Initial Accounts
const INITIAL_PROFILES: UserProfile[] = [
  { email: 'admin@flavore.com', fullName: 'General Manager (Admin)', role: 'admin' },
  { email: 'staff@flavore.com', fullName: 'Chef de Cuisine (Staff)', role: 'staff' },
  { email: 'customer@flavore.com', fullName: 'John Doe', role: 'customer' }
];

// Setup localStorage with defaults
const initDb = () => {
  const safeGet = (key: string) => {
    try {
      const data = StorageWrapper.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error(`Error parsing localStorage key "${key}":`, e);
      return null;
    }
  };

  const menu = safeGet('flavore_menu');
  if (!menu || !Array.isArray(menu)) {
    StorageWrapper.setItem('flavore_menu', JSON.stringify(INITIAL_MENU));
  }

  const profiles = safeGet('flavore_profiles');
  if (!profiles || !Array.isArray(profiles)) {
    StorageWrapper.setItem('flavore_profiles', JSON.stringify(INITIAL_PROFILES));
  }

  const orders = safeGet('flavore_orders');
  if (!orders || !Array.isArray(orders)) {
    StorageWrapper.setItem('flavore_orders', JSON.stringify([]));
  }

  const reservations = safeGet('flavore_reservations');
  if (!reservations || !Array.isArray(reservations)) {
    StorageWrapper.setItem('flavore_reservations', JSON.stringify([]));
  }

  const tables = safeGet('flavore_tables');
  if (!tables || !Array.isArray(tables) || tables.length === 0) {
    StorageWrapper.setItem('flavore_tables', JSON.stringify(INITIAL_TABLES));
  }

  const cart = safeGet('flavore_cart');
  if (!cart || !Array.isArray(cart)) {
    StorageWrapper.setItem('flavore_cart', JSON.stringify([]));
  }
};

// Initialize
initDb();

export const mockDb = {
  // --- Auth Service ---
  getCurrentUser: (): UserProfile | null => {
    const userStr = StorageWrapper.getItem('flavore_current_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  login: (email: string): UserProfile | null => {
    const profiles: UserProfile[] = JSON.parse(StorageWrapper.getItem('flavore_profiles') || '[]');
    const user = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
    if (user) {
      StorageWrapper.setItem('flavore_current_user', JSON.stringify(user));
      return user;
    }
    // Fallback automatic sign up as customer for unknown emails for easy testing
    const newUser: UserProfile = {
      email,
      fullName: email.split('@')[0].replace(/[^a-zA-Z]/g, ' '),
      role: 'customer'
    };
    profiles.push(newUser);
    StorageWrapper.setItem('flavore_profiles', JSON.stringify(profiles));
    StorageWrapper.setItem('flavore_current_user', JSON.stringify(newUser));
    return newUser;
  },

  logout: () => {
    StorageWrapper.removeItem('flavore_current_user');
  },

  // --- Menu CRUD ---
  getMenu: (): MenuItem[] => {
    return JSON.parse(StorageWrapper.getItem('flavore_menu') || '[]');
  },

  saveMenuItem: (item: MenuItem) => {
    const menu = mockDb.getMenu();
    const index = menu.findIndex(m => m.id === item.id);
    if (index > -1) {
      menu[index] = item;
    } else {
      menu.push(item);
    }
    StorageWrapper.setItem('flavore_menu', JSON.stringify(menu));
  },

  deleteMenuItem: (id: string) => {
    const menu = mockDb.getMenu();
    const updated = menu.filter(m => m.id !== id);
    StorageWrapper.setItem('flavore_menu', JSON.stringify(updated));
  },

  // --- Order Services ---
  getOrders: (): Order[] => {
    return JSON.parse(StorageWrapper.getItem('flavore_orders') || '[]');
  },

  placeOrder: (orderData: Omit<Order, 'id' | 'status' | 'created_at' | 'estimatedDelivery'>): Order => {
    const orders = mockDb.getOrders();
    const now = new Date();
    const newOrder: Order = {
      ...orderData,
      id: 'ord_' + Math.random().toString(36).substr(2, 9),
      status: 'pending',
      created_at: now.toISOString(),
      ...(orderData.type === 'delivery' ? {
        estimatedDelivery: new Date(now.getTime() + (30 + Math.floor(Math.random() * 15)) * 60000).toISOString()
      } : {})
    };
    orders.unshift(newOrder); // Add to beginning of array
    StorageWrapper.setItem('flavore_orders', JSON.stringify(orders));
    return newOrder;
  },

  updateOrderStatus: (id: string, status: OrderStatus): Order | null => {
    const orders = mockDb.getOrders();
    const index = orders.findIndex(o => o.id === id);
    if (index > -1) {
      orders[index].status = status;
      StorageWrapper.setItem('flavore_orders', JSON.stringify(orders));
      return orders[index];
    }
    return null;
  },

  updateReservation: (id: string, updates: Partial<Reservation>): Reservation | null => {
    const reservations = mockDb.getReservations();
    const index = reservations.findIndex(r => r.id === id);
    if (index > -1) {
      reservations[index] = { ...reservations[index], ...updates };
      if (updates.tableId) {
        const table = mockDb.getTables().find(t => t.id === updates.tableId);
        if (table) reservations[index].tableNumber = table.number;
      }
      StorageWrapper.setItem('flavore_reservations', JSON.stringify(reservations));
      return reservations[index];
    }
    return null;
  },

  // --- Reservation Services ---
  getReservations: (): Reservation[] => {
    return JSON.parse(StorageWrapper.getItem('flavore_reservations') || '[]');
  },

  createReservation: (resData: Omit<Reservation, 'id' | 'status' | 'created_at'>): Reservation => {
    const reservations = mockDb.getReservations();
    let tableNumber = resData.tableNumber;

    if (resData.tableId && !tableNumber) {
      const table = mockDb.getTables().find(t => t.id === resData.tableId);
      if (table) tableNumber = table.number;
    }

    const newRes: Reservation = {
      ...resData,
      tableNumber,
      id: 'res_' + Math.random().toString(36).substr(2, 9),
      status: 'pending',
      created_at: new Date().toISOString()
    };
    reservations.unshift(newRes);
    StorageWrapper.setItem('flavore_reservations', JSON.stringify(reservations));
    return newRes;
  },

  updateReservationStatus: (id: string, status: 'pending' | 'confirmed' | 'cancelled', tableId?: string): Reservation | null => {
    const reservations = mockDb.getReservations();
    const tables = mockDb.getTables();
    const index = reservations.findIndex(r => r.id === id);
    if (index > -1) {
      reservations[index].status = status;
      if (tableId) {
        reservations[index].tableId = tableId;
        const table = tables.find(t => t.id === tableId);
        if (table) reservations[index].tableNumber = table.number;
      }
      StorageWrapper.setItem('flavore_reservations', JSON.stringify(reservations));
      return reservations[index];
    }
    return null;
  },

  // --- Table Services ---
  getTables: (): RestaurantTable[] => {
    const data = StorageWrapper.getItem('flavore_tables');
    if (!data) return INITIAL_TABLES;
    const parsed = JSON.parse(data);
    return parsed.length > 0 ? parsed : INITIAL_TABLES;
  },

  saveTable: (table: RestaurantTable) => {
    const tables = mockDb.getTables();
    const index = tables.findIndex(t => t.id === table.id);
    if (index > -1) {
      tables[index] = table;
    } else {
      tables.push(table);
    }
    StorageWrapper.setItem('flavore_tables', JSON.stringify(tables));
  },

  deleteTable: (id: string) => {
    const tables = mockDb.getTables();
    const updated = tables.filter(t => t.id !== id);
    StorageWrapper.setItem('flavore_tables', JSON.stringify(updated));
  },

  getAvailableTables: (date: string, time: string, guests: number): RestaurantTable[] => {
    const tables = mockDb.getTables();
    const reservations = mockDb.getReservations();

    // Filter tables by capacity
    const suitableTables = tables.filter(t => t.capacity >= guests);

    // Filter out reserved tables for the given date
    const availableTables = suitableTables.filter(table => {
      const isReserved = reservations.some(res => {
        return res.status !== 'cancelled' && res.tableId === table.id && res.date === date;
      });
      return !isReserved;
    });

    return availableTables;
  },

  // --- Cart Services ---
  getCart: (): { menuItem: MenuItem; quantity: number }[] => {
    return JSON.parse(StorageWrapper.getItem('flavore_cart') || '[]');
  },

  setCart: (cart: { menuItem: MenuItem; quantity: number }[]) => {
    StorageWrapper.setItem('flavore_cart', JSON.stringify(cart));
  }
};

