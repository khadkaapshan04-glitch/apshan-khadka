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

export interface Reservation {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  tableNumber?: string;
  created_at: string;
}

export interface UserProfile {
  email: string;
  fullName: string;
  role: 'customer' | 'staff' | 'admin';
}

// Initial Menu Data
const INITIAL_MENU: MenuItem[] = [
  {
    id: 'm1',
    name: 'Truffle Parmesan Fries',
    description: 'Crispy hand-cut fries tossed in white truffle oil, grated parmesan cheese, and fresh parsley, served with garlic aioli.',
    price: 12.00,
    category: 'Starters',
    image_url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=600',
    is_available: true
  },
  {
    id: 'm2',
    name: 'Heirloom Tomato Bruschetta',
    description: 'Grilled sourdough rubbed with garlic, topped with diced heirloom tomatoes, fresh basil, balsamic glaze, and extra virgin olive oil.',
    price: 14.00,
    category: 'Starters',
    image_url: 'https://images.unsplash.com/photo-1572656631137-7935297eff55?auto=format&fit=crop&q=80&w=600',
    is_available: true
  },
  {
    id: 'm3',
    name: 'Pan-Seared Atlantic Salmon',
    description: 'Crispy skin salmon served over creamy saffron risotto, roasted asparagus, and finished with a lemon-herb butter sauce.',
    price: 32.00,
    category: 'Mains',
    image_url: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&q=80&w=600',
    is_available: true
  },
  {
    id: 'm4',
    name: 'Prime Grilled Ribeye Steak',
    description: '12oz prime ribeye steak grilled to perfection, served with garlic mashed potatoes, roasted broccolini, and red wine reduction.',
    price: 38.00,
    category: 'Mains',
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600',
    is_available: true
  },
  {
    id: 'm5',
    name: 'Classic Espresso Tiramisu',
    description: 'Layers of espresso-soaked ladyfingers, velvety mascarpone cream, and dark cocoa powder dusting.',
    price: 10.00,
    category: 'Desserts',
    image_url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&q=80&w=600',
    is_available: true
  },
  {
    id: 'm6',
    name: 'Warm Chocolate Lava Cake',
    description: 'Rich chocolate cake with a molten liquid center, served with vanilla bean gelato and fresh raspberry compote.',
    price: 11.00,
    category: 'Desserts',
    image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=600',
    is_available: true
  },
  {
    id: 'm7',
    name: 'Artisanal Blackberry Lemonade',
    description: 'Freshly squeezed lemon juice, muddled wild blackberries, organic simple syrup, and sparkling water.',
    price: 6.50,
    category: 'Beverages',
    image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=600',
    is_available: true
  },
  {
    id: 'm8',
    name: 'Hibiscus Peach Iced Tea',
    description: 'Cold-brewed organic hibiscus tea infused with fresh peach puree and mint leaves.',
    price: 6.00,
    category: 'Beverages',
    image_url: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=600',
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
  if (!localStorage.getItem('flavore_menu')) {
    localStorage.setItem('flavore_menu', JSON.stringify(INITIAL_MENU));
  }
  if (!localStorage.getItem('flavore_profiles')) {
    localStorage.setItem('flavore_profiles', JSON.stringify(INITIAL_PROFILES));
  }
  if (!localStorage.getItem('flavore_orders')) {
    localStorage.setItem('flavore_orders', JSON.stringify([]));
  }
  if (!localStorage.getItem('flavore_reservations')) {
    localStorage.setItem('flavore_reservations', JSON.stringify([]));
  }
  if (!localStorage.getItem('flavore_cart')) {
    localStorage.setItem('flavore_cart', JSON.stringify([]));
  }
};

// Initialize
initDb();

export const mockDb = {
  // --- Auth Service ---
  getCurrentUser: (): UserProfile | null => {
    const userStr = localStorage.getItem('flavore_current_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  login: (email: string): UserProfile | null => {
    const profiles: UserProfile[] = JSON.parse(localStorage.getItem('flavore_profiles') || '[]');
    const user = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
    if (user) {
      localStorage.setItem('flavore_current_user', JSON.stringify(user));
      return user;
    }
    // Fallback automatic sign up as customer for unknown emails for easy testing
    const newUser: UserProfile = {
      email,
      fullName: email.split('@')[0].replace(/[^a-zA-Z]/g, ' '),
      role: 'customer'
    };
    profiles.push(newUser);
    localStorage.setItem('flavore_profiles', JSON.stringify(profiles));
    localStorage.setItem('flavore_current_user', JSON.stringify(newUser));
    return newUser;
  },

  logout: () => {
    localStorage.removeItem('flavore_current_user');
  },

  // --- Menu CRUD ---
  getMenu: (): MenuItem[] => {
    return JSON.parse(localStorage.getItem('flavore_menu') || '[]');
  },

  saveMenuItem: (item: MenuItem) => {
    const menu = mockDb.getMenu();
    const index = menu.findIndex(m => m.id === item.id);
    if (index > -1) {
      menu[index] = item;
    } else {
      menu.push(item);
    }
    localStorage.setItem('flavore_menu', JSON.stringify(menu));
  },

  deleteMenuItem: (id: string) => {
    const menu = mockDb.getMenu();
    const updated = menu.filter(m => m.id !== id);
    localStorage.setItem('flavore_menu', JSON.stringify(updated));
  },

  // --- Order Services ---
  getOrders: (): Order[] => {
    return JSON.parse(localStorage.getItem('flavore_orders') || '[]');
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
    localStorage.setItem('flavore_orders', JSON.stringify(orders));
    return newOrder;
  },

  updateOrderStatus: (id: string, status: OrderStatus): Order | null => {
    const orders = mockDb.getOrders();
    const index = orders.findIndex(o => o.id === id);
    if (index > -1) {
      orders[index].status = status;
      localStorage.setItem('flavore_orders', JSON.stringify(orders));
      return orders[index];
    }
    return null;
  },

  // --- Reservation Services ---
  getReservations: (): Reservation[] => {
    return JSON.parse(localStorage.getItem('flavore_reservations') || '[]');
  },

  createReservation: (resData: Omit<Reservation, 'id' | 'status' | 'created_at'>): Reservation => {
    const reservations = mockDb.getReservations();
    const newRes: Reservation = {
      ...resData,
      id: 'res_' + Math.random().toString(36).substr(2, 9),
      status: 'pending',
      created_at: new Date().toISOString()
    };
    reservations.unshift(newRes);
    localStorage.setItem('flavore_reservations', JSON.stringify(reservations));
    return newRes;
  },

  updateReservationStatus: (id: string, status: 'pending' | 'confirmed' | 'cancelled', tableNumber?: string): Reservation | null => {
    const reservations = mockDb.getReservations();
    const index = reservations.findIndex(r => r.id === id);
    if (index > -1) {
      reservations[index].status = status;
      if (tableNumber) reservations[index].tableNumber = tableNumber;
      localStorage.setItem('flavore_reservations', JSON.stringify(reservations));
      return reservations[index];
    }
    return null;
  },

  // --- Cart Services ---
  getCart: (): { menuItem: MenuItem; quantity: number }[] => {
    return JSON.parse(localStorage.getItem('flavore_cart') || '[]');
  },

  setCart: (cart: { menuItem: MenuItem; quantity: number }[]) => {
    localStorage.setItem('flavore_cart', JSON.stringify(cart));
  }
};

