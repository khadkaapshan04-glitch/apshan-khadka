import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  Trophy, DollarSign, Calendar, ShoppingBag, Star, Plus, Edit3, Trash2, Check, X,
  Search, Eye, ShieldAlert, CheckCircle2, ChevronRight, Sliders, Printer, Users
} from 'lucide-react';
import { db } from '../lib/supabaseDb';
import { MenuItem, Order, Reservation, RestaurantTable, toRestaurantTableWithPosition, UserProfile } from '../lib/types';
import { ReceiptModal } from './ReceiptModal';
import { QRCodeSVG } from 'qrcode.react';

export const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'menu' | 'reservations' | 'waitlist' | 'tables' | 'orders' | 'users' | 'qrcodes'>('analytics');
  
  // States
  const [orders, setOrders] = useState<Order[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  
  // CRUD states
  const [isEditing, setIsEditing] = useState<MenuItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Table CRUD states
  const [isEditingTable, setIsEditingTable] = useState<any | null>(null);
  const [isCreatingTable, setIsCreatingTable] = useState(false);
  const [tableNum, setTableNum] = useState('');
  const [tableCapacity, setTableCapacity] = useState(2);
  const [tableType, setTableType] = useState<'front table' | 'window' | 'corner' | 'middle' | 'bar'>('middle');
  const [tablePosX, setTablePosX] = useState(50);
  const [tablePosY, setTablePosY] = useState(50);
  const [crudName, setCrudName] = useState('');
  const [crudDesc, setCrudDesc] = useState('');
  const [crudPrice, setCrudPrice] = useState(0);
  const [crudCategory, setCrudCategory] = useState<'Starters' | 'Mains' | 'Desserts' | 'Beverages'>('Starters');
  const [crudImg, setCrudImg] = useState('');
  const [crudAvailable, setCrudAvailable] = useState(true);

  // Reservation assignment state
  const [tableAssignment, setTableAssignment] = useState<{ [resId: string]: string }>({});

  // Direct role assignment state
  const [assignEmail, setAssignEmail] = useState('');
  const [assignRole, setAssignRole] = useState<'customer' | 'staff' | 'admin'>('staff');
  const [assignStatus, setAssignStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [assignLoading, setAssignLoading] = useState(false);

  const handleRoleChange = async (userId: string, newRole: string) => {
    const result = await db.updateProfileRole(userId, newRole);
    if (result.success) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } else {
      alert(result.error || 'Failed to update user role.');
    }
  };

  const handleAssignRoleByEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignEmail.trim()) return;

    setAssignLoading(true);
    setAssignStatus(null);

    const result = await db.updateProfileRoleByEmail(assignEmail, assignRole);

    if (result.success) {
      setAssignStatus({ type: 'success', message: `Successfully assigned "${assignRole}" role to ${assignEmail.trim().toLowerCase()}` });
      setAssignEmail('');
      refreshData(); // Refresh the table
    } else {
      setAssignStatus({ type: 'error', message: result.error || 'Failed to assign role' });
    }
    setAssignLoading(false);
  };

  const refreshData = async () => {
    try {
      const results = await Promise.allSettled([
        db.getOrders(),
        db.getMenu(),
        db.getReservations(),
        db.getTables(),
        db.getAllProfiles(),
        db.getWaitlist()
      ]);

      const getValue = <T,>(result: PromiseSettledResult<T>, fallback: T): T =>
        result.status === 'fulfilled' ? result.value : fallback;

      setOrders(getValue(results[0], []));
      setMenu(getValue(results[1], []));
      setReservations(getValue(results[2], []));
      setTables(getValue(results[3], []).map(toRestaurantTableWithPosition));
      setUsers(getValue(results[4], []));
      setWaitlist(getValue(results[5], []));

      // Log any failures for debugging
      results.forEach((r, i) => {
        if (r.status === 'rejected') {
          const labels = ['orders', 'menu', 'reservations', 'tables', 'profiles', 'waitlist'];
          console.warn(`Failed to fetch ${labels[i]}:`, r.reason);
        }
      });
    } catch (e) {
      console.error('Error refreshing data from Supabase:', e);
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000); // Poll database less frequently for performance
    return () => clearInterval(interval);
  }, []);

  // Table CRUD Operations
  const handleOpenEditTable = (table: RestaurantTable) => {
    setIsEditingTable(table);
    setTableNum(table.number);
    setTableCapacity(table.capacity);
    setTableType(table.type);
    setTablePosX(table.position.x);
    setTablePosY(table.position.y);
  };

  const handleOpenCreateTable = () => {
    setIsCreatingTable(true);
    setTableNum((tables.length + 1).toString());
    setTableCapacity(2);
    setTableType('standard');
    setTablePosX(50);
    setTablePosY(50);
  };

  const handleSaveTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNum || tableCapacity <= 0) {
      alert('Please fill out all required fields.');
      return;
    }

    const savedTable: any = {
      id: isEditingTable ? isEditingTable.id : undefined, // let Supabase auto-generate UUID for new table
      number: tableNum,
      capacity: Number(tableCapacity),
      type: tableType,
      position: { x: Number(tablePosX), y: Number(tablePosY) }
    };

    await db.saveTable(savedTable);
    setIsEditingTable(null);
    setIsCreatingTable(false);
    refreshData();
  };

  const handleDeleteTable = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this table?')) {
      await db.deleteTable(id);
      refreshData();
    }
  };

  // CRUD Operations
  const handleOpenEdit = (item: MenuItem) => {
    setIsEditing(item);
    setCrudName(item.name);
    setCrudDesc(item.description);
    setCrudPrice(item.price);
    setCrudCategory(item.category);
    setCrudImg(item.image_url);
    setCrudAvailable(item.is_available);
  };

  const handleOpenCreate = () => {
    setIsCreating(true);
    setCrudName('');
    setCrudDesc('');
    setCrudPrice(0);
    setCrudCategory('Starters');
    setCrudImg('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600');
    setCrudAvailable(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!crudName || crudPrice <= 0 || !crudImg) {
      alert('Please fill out all required fields.');
      return;
    }

    const savedItem: MenuItem = {
      id: isEditing ? isEditing.id : undefined as any, // let Supabase generate UUID
      name: crudName,
      description: crudDesc,
      price: Number(crudPrice),
      category: crudCategory,
      image_url: crudImg,
      is_available: crudAvailable
    };

    await db.saveMenuItem(savedItem);
    setIsEditing(null);
    setIsCreating(false);
    refreshData();
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      await db.deleteMenuItem(id);
      refreshData();
    }
  };

  // Reservation actions
  const handleConfirmReservation = async (id: string) => {
    const reservation = reservations.find(r => r.id === id);
    let tableId = tableAssignment[id];

    // If tableId from assignment input is actually a table number or ID
    if (tableId) {
      const table = tables.find(t => t.id === tableId || t.number === tableId);
      if (table) tableId = table.id;
    } else if (reservation?.table_id) {
      tableId = reservation.table_id;
    }

    await db.updateReservationStatus(id, 'confirmed', tableId);
    refreshData();
  };

  const handleCancelReservation = async (id: string) => {
    await db.updateReservationStatus(id, 'cancelled');
    refreshData();
  };

  // Helper for formatting currency with proper comma grouping (e.g. Rs. 2,50,000.00)
  const formatRs = (val: number) => {
    return (Number(val) || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // --- ANALYTICS CALCULATIONS ---
  const totalSales = orders.reduce((sum, o) => o.status !== 'cancelled' ? sum + (Number(o.total) || 0) : sum, 0);
  const totalOrdersCount = orders.length;
  const activeReservationsCount = reservations.filter(r => r.status === 'pending').length;
  
  // Sales Trend chart data (Hourly calculation based on real times)
  const salesByHour = (() => {
    const hourlyData: { [key: string]: number } = {};
    orders.forEach(o => {
      if (o.status === 'cancelled') return;
      const hour = new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).split(':')[0];
      hourlyData[hour] = (hourlyData[hour] || 0) + (Number(o.total) || 0);
    });

    // Sort or map into array
    const hrs = Object.keys(hourlyData).sort();
    if (hrs.length === 0) {
      return [
        { hour: '12 PM', Sales: 120 },
        { hour: '02 PM', Sales: 250 },
        { hour: '04 PM', Sales: 180 },
        { hour: '06 PM', Sales: 520 },
        { hour: '08 PM', Sales: 740 },
        { hour: '10 PM', Sales: 410 }
      ];
    }

    return hrs.map(h => ({
      hour: h + ':00',
      Sales: Number(hourlyData[h].toFixed(2))
    }));
  })();

  // Menu Category Popularity chart data
  const categoryStats = (() => {
    const stats: { [key: string]: number } = { Starters: 0, Mains: 0, Desserts: 0, Beverages: 0 };
    orders.forEach(o => {
      (o.items || []).forEach((it: any) => {
        const cat = it.category ?? it.menuItem?.category ?? 'Mains';
        stats[cat] = (stats[cat] || 0) + (it.quantity || 1);
      });
    });

    return Object.keys(stats).map(cat => ({
      name: cat,
      Orders: stats[cat]
    }));
  })();

  return (
    <>
      <div className="space-y-8 max-w-7xl mx-auto px-6 lg:px-10 py-6">
      {/* Tab Switcher Headers */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border/20 pb-4 gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Management Dashboard</h2>
          <p className="text-xs text-muted-foreground">Admin panel to track menu creations, user orders, and reservations.</p>
        </div>

        <div className="flex bg-secondary p-1 rounded-xl">
          {[
            { id: 'analytics', label: 'Overview' },
            { id: 'orders', label: 'Orders' },
            { id: 'menu', label: 'Menu List' },
            { id: 'reservations', label: 'Reservations' },
            { id: 'waitlist', label: 'Waitlist' },
            { id: 'tables', label: 'Tables' },
            { id: 'users', label: 'Staff' },
            { id: 'qrcodes', label: 'QR Codes' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Overview & Charts */}
      {activeTab === 'analytics' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Metrics summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-card border border-border/20 p-5 rounded-2xl flex items-center gap-4 hover:border-accent/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Sales</div>
                <div className="text-xl font-bold text-foreground">Rs. {formatRs(totalSales)}</div>
              </div>
            </div>

            <div className="bg-card border border-border/20 p-5 rounded-2xl flex items-center gap-4 hover:border-accent/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Orders</div>
                <div className="text-xl font-bold text-foreground">{totalOrdersCount} Orders</div>
              </div>
            </div>

            <div className="bg-card border border-border/20 p-5 rounded-2xl flex items-center gap-4 hover:border-accent/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Bookings Queue</div>
                <div className="text-xl font-bold text-foreground">{activeReservationsCount} Requests</div>
              </div>
            </div>

            <div className="bg-card border border-border/20 p-5 rounded-2xl flex items-center gap-4 hover:border-accent/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Avg Rating</div>
                <div className="text-xl font-bold text-foreground">4.8 / 5.0</div>
              </div>
            </div>

          </div>

          {/* Charts grid */}
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Sales Trends Chart */}
            <div className="bg-card border border-border/20 p-5 rounded-2xl shadow-sm space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Today's Hourly Revenue</h3>
                <p className="text-xs text-foreground/80 mt-0.5">Real-time orders processed today.</p>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesByHour} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d4a574" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#d4a574" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(26, 24, 22, 0.05)" />
                    <XAxis dataKey="hour" tick={{ fontSize: 9 }} stroke="rgba(26,24,22,0.4)" />
                    <YAxis tick={{ fontSize: 9 }} stroke="rgba(26,24,22,0.4)" />
                    <Tooltip contentStyle={{ fontSize: 11, background: '#fff', borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                    <Area type="monotone" dataKey="Sales" stroke="#d4a574" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Stats Chart */}
            <div className="bg-card border border-border/20 p-5 rounded-2xl shadow-sm space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Product Sales Density</h3>
                <p className="text-xs text-foreground/80 mt-0.5">Quantity ordered per menu category.</p>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(26, 24, 22, 0.05)" />
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="rgba(26,24,22,0.4)" />
                    <YAxis tick={{ fontSize: 9 }} stroke="rgba(26,24,22,0.4)" />
                    <Tooltip contentStyle={{ fontSize: 11, background: '#fff', borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                    <Bar dataKey="Orders" fill="#d4a574" radius={[6, 6, 0, 0]} maxBarSize={38} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </motion.div>
      )}

      {/* Tab 2: Menu CRUD Panel */}
      {activeTab === 'menu' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center bg-secondary/30 p-4 rounded-2xl border border-border/10">
            <div className="text-xs text-muted-foreground font-semibold">Total: {menu.length} Dishes</div>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:shadow-md cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" /> Add New Dish
            </button>
          </div>

          {/* Form Modal for Creating/Editing */}
          <AnimatePresence>
            {(isEditing || isCreating) && (
              <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-card border border-border/30 rounded-2xl w-full max-w-[500px] p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto"
                >
                  <button
                    onClick={() => { setIsEditing(null); setIsCreating(false); }}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground hover:bg-secondary p-1.5 rounded-lg transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <h3 className="font-display text-xl font-bold text-foreground">
                    {isEditing ? `Edit: ${isEditing.name}` : 'Create Menu Item'}
                  </h3>

                  <form onSubmit={handleSaveItem} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-foreground/80 mb-1 uppercase tracking-wider">Name *</label>
                        <input 
                          type="text" required value={crudName} onChange={e => setCrudName(e.target.value)} 
                          placeholder="Dish Name" className="w-full px-3.5 py-2 rounded-xl bg-secondary border border-border/30 text-xs focus:outline-none focus:border-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-foreground/80 mb-1 uppercase tracking-wider">Price (Rs.) *</label>
                        <input 
                          type="number" step="0.01" required value={crudPrice} onChange={e => setCrudPrice(Number(e.target.value))} 
                          placeholder="Price" className="w-full px-3.5 py-2 rounded-xl bg-secondary border border-border/30 text-xs focus:outline-none focus:border-accent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-foreground/80 mb-1 uppercase tracking-wider">Description</label>
                      <textarea 
                        value={crudDesc} onChange={e => setCrudDesc(e.target.value)} rows={3}
                        placeholder="Dish ingredients, flavor description..." className="w-full px-3.5 py-2 rounded-xl bg-secondary border border-border/30 text-xs focus:outline-none focus:border-accent"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-foreground/80 mb-1 uppercase tracking-wider">Category *</label>
                        <select
                          value={crudCategory} onChange={e => setCrudCategory(e.target.value as any)}
                          className="w-full px-3.5 py-2 rounded-xl bg-secondary border border-border/30 text-xs focus:outline-none focus:border-accent"
                        >
                          <option value="Starters">Starters</option>
                          <option value="Mains">Mains</option>
                          <option value="Desserts">Desserts</option>
                          <option value="Beverages">Beverages</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-foreground/80 mb-1 uppercase tracking-wider">Availability</label>
                        <select
                          value={crudAvailable ? 'true' : 'false'} onChange={e => setCrudAvailable(e.target.value === 'true')}
                          className="w-full px-3.5 py-2 rounded-xl bg-secondary border border-border/30 text-xs focus:outline-none focus:border-accent"
                        >
                          <option value="true">In Stock / Available</option>
                          <option value="false">Sold Out / Unavailable</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-foreground/80 mb-1 uppercase tracking-wider">Image URL *</label>
                      <input 
                        type="url" required value={crudImg} onChange={e => setCrudImg(e.target.value)} 
                        placeholder="https://images.unsplash.com/..." className="w-full px-3.5 py-2 rounded-xl bg-secondary border border-border/30 text-xs focus:outline-none focus:border-accent"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => { setIsEditing(null); setIsCreating(false); }}
                        className="flex-1 py-2.5 rounded-xl border border-border/30 hover:bg-secondary text-xs font-semibold transition-all cursor-pointer text-center"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2.5 rounded-xl bg-accent text-white text-xs font-semibold hover:shadow-md cursor-pointer hover:bg-accent/90 transition-all text-center"
                      >
                        Save Dish
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Menu Items Table */}
          <div className="bg-card border border-border/20 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] text-left">
                <thead>
                  <tr className="border-b border-border/20 bg-secondary/30 text-muted-foreground uppercase font-bold tracking-wider">
                    <th className="p-4">Dish</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10">
                  {menu.map(item => (
                    <tr key={item.id} className="text-foreground hover:bg-secondary/10 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-secondary">
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{item.name}</div>
                          <div className="text-[10px] text-muted-foreground line-clamp-1 max-w-sm">{item.description}</div>
                        </div>
                      </td>
                      <td className="p-4 font-medium">{item.category}</td>
                      <td className="p-4 font-bold text-accent">Rs. {formatRs(item.price)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                          item.is_available 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {item.is_available ? 'Available' : 'Sold Out'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 hover:bg-accent/15 hover:text-accent rounded-lg transition-colors cursor-pointer text-muted-foreground"
                          title="Edit dish"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors cursor-pointer text-muted-foreground"
                          title="Delete dish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab 3: Reservations Coordinator */}
      {activeTab === 'reservations' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-card border border-border/20 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] text-left">
                <thead>
                  <tr className="border-b border-border/20 bg-secondary/30 text-muted-foreground uppercase font-bold tracking-wider">
                    <th className="p-4">Guest Details</th>
                    <th className="p-4">Date & Time</th>
                    <th className="p-4">Guests</th>
                    <th className="p-4">Assign Table</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10">
                  {reservations.map(res => (
                    <tr key={res.id} className="text-foreground hover:bg-secondary/10 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-sm">{res.name}</div>
                        <div className="text-[10px] text-muted-foreground">{res.email} • {res.phone}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{res.date}</div>
                        <div className="text-[10px] text-muted-foreground font-semibold uppercase">{res.time}</div>
                      </td>
                      <td className="p-4 font-bold">{res.guests} People</td>
                      <td className="p-4">
                        {res.status === 'confirmed' ? (
                          <span className="font-bold text-accent bg-accent/5 px-2 py-0.5 rounded border border-accent/20">
                            Table {res.tableNumber}
                          </span>
                        ) : res.status === 'pending' ? (
                          <div className="flex flex-col gap-1">
                            {res.tableNumber ? (
                              <span className="font-medium text-foreground">Table {res.tableNumber} (Selected)</span>
                            ) : (
                              <input
                                type="text"
                                placeholder="Assign Table"
                                value={tableAssignment[res.id] || ''}
                                onChange={e => setTableAssignment({...tableAssignment, [res.id]: e.target.value})}
                                className="w-24 px-2 py-1 rounded bg-secondary border border-border/30 text-[10px] focus:outline-none focus:border-accent"
                              />
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground font-mono">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                          res.status === 'confirmed' ? 'bg-green-50 text-green-700 border border-green-200' :
                          res.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                          'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {res.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1">
                        {res.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleConfirmReservation(res.id)}
                              className="px-2.5 py-1 bg-green-500 hover:bg-green-600 text-white rounded font-semibold transition-all cursor-pointer inline-flex items-center gap-0.5"
                            >
                              <Check className="w-3 h-3" /> Confirm
                            </button>
                            <button
                              onClick={() => handleCancelReservation(res.id)}
                              className="px-2.5 py-1 bg-secondary text-muted-foreground hover:bg-red-50 hover:text-red-600 rounded font-semibold transition-all cursor-pointer inline-flex items-center gap-0.5"
                            >
                              <X className="w-3 h-3" /> Cancel
                            </button>
                          </>
                        )}
                        {res.status !== 'pending' && (
                          <span className="text-[10px] text-muted-foreground italic">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {reservations.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-muted-foreground font-semibold">No bookings placed yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab 4: Table Management */}
      {activeTab === 'tables' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center bg-secondary/30 p-4 rounded-2xl border border-border/10">
            <div className="text-xs text-muted-foreground font-semibold">Total: {tables.length} Tables</div>
            <button
              onClick={handleOpenCreateTable}
              className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:shadow-md cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" /> Add New Table
            </button>
          </div>

          {/* Form Modal for Table Creating/Editing */}
          <AnimatePresence>
            {(isEditingTable || isCreatingTable) && (
              <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-card border border-border/30 rounded-2xl w-full max-w-[500px] p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto"
                >
                  <button
                    onClick={() => { setIsEditingTable(null); setIsCreatingTable(false); }}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground hover:bg-secondary p-1.5 rounded-lg transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <h3 className="font-display text-xl font-bold text-foreground">
                    {isEditingTable ? `Edit Table: ${isEditingTable.number}` : 'Add New Table'}
                  </h3>

                  <form onSubmit={handleSaveTable} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-foreground/80 mb-1 uppercase tracking-wider">Table Number *</label>
                        <input
                          type="text" required value={tableNum} onChange={e => setTableNum(e.target.value)}
                          placeholder="e.g. 1" className="w-full px-3.5 py-2 rounded-xl bg-secondary border border-border/30 text-xs focus:outline-none focus:border-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-foreground/80 mb-1 uppercase tracking-wider">Capacity *</label>
                        <input
                          type="number" required value={tableCapacity} onChange={e => setTableCapacity(Number(e.target.value))}
                          placeholder="2" className="w-full px-3.5 py-2 rounded-xl bg-secondary border border-border/30 text-xs focus:outline-none focus:border-accent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-foreground/80 mb-1 uppercase tracking-wider">Table Type</label>
                      <select
                        value={tableType} onChange={e => setTableType(e.target.value as any)}
                        className="w-full px-3.5 py-2 rounded-xl bg-secondary border border-border/30 text-xs focus:outline-none focus:border-accent"
                      >
                        <option value="front table">Front Table</option>
                        <option value="window">Window</option>
                        <option value="corner">Corner</option>
                        <option value="middle">Middle</option>
                        <option value="bar">Bar</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-foreground/80 mb-1 uppercase tracking-wider">X Position (%)</label>
                        <input
                          type="range" min="0" max="100" value={tablePosX} onChange={e => setTablePosX(Number(e.target.value))}
                          className="w-full accent-accent"
                        />
                        <div className="text-[10px] text-center mt-1 font-mono">{tablePosX}%</div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-foreground/80 mb-1 uppercase tracking-wider">Y Position (%)</label>
                        <input
                          type="range" min="0" max="100" value={tablePosY} onChange={e => setTablePosY(Number(e.target.value))}
                          className="w-full accent-accent"
                        />
                        <div className="text-[10px] text-center mt-1 font-mono">{tablePosY}%</div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => { setIsEditingTable(null); setIsCreatingTable(false); }}
                        className="flex-1 py-2.5 rounded-xl border border-border/30 hover:bg-secondary text-xs font-semibold transition-all cursor-pointer text-center"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2.5 rounded-xl bg-accent text-white text-xs font-semibold hover:shadow-md cursor-pointer hover:bg-accent/90 transition-all text-center"
                      >
                        Save Table
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Tables List */}
          <div className="bg-card border border-border/20 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] text-left">
                <thead>
                  <tr className="border-b border-border/20 bg-secondary/30 text-muted-foreground uppercase font-bold tracking-wider">
                    <th className="p-4">Table #</th>
                    <th className="p-4">Capacity</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Position (X, Y)</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10">
                  {tables.sort((a, b) => Number(a.number) - Number(b.number)).map(table => (
                    <tr key={table.id} className="text-foreground hover:bg-secondary/10 transition-colors">
                      <td className="p-4 font-bold text-sm">Table {table.number}</td>
                      <td className="p-4 font-medium">{table.capacity} People</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-bold uppercase text-[9px]">
                          {table.type}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-muted-foreground">
                        {table.position.x}%, {table.position.y}%
                      </td>
                      <td className="p-4 text-right space-x-1.5">
                        <button
                          onClick={() => handleOpenEditTable(table)}
                          className="p-1.5 hover:bg-accent/15 hover:text-accent rounded-lg transition-colors cursor-pointer text-muted-foreground"
                          title="Edit table"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTable(table.id)}
                          className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors cursor-pointer text-muted-foreground"
                          title="Delete table"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Waitlist Management Tab ── */}
      {activeTab === 'waitlist' && (
        <motion.div
          key="waitlist"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="bg-card border border-border/20 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-accent" />
                Waitlist Management
              </h3>
              <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-3 py-1 rounded-lg">
                {waitlist.length} Total Entries
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-border/20 bg-secondary/30 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    <th className="p-4">Name</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Party Size</th>
                    <th className="p-4">Date Joined</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10">
                  {waitlist.map((entry) => (
                    <tr key={entry.id} className="text-foreground hover:bg-secondary/10 transition-colors">
                      <td className="p-4 font-semibold">{entry.name}</td>
                      <td className="p-4 font-mono text-muted-foreground text-xs">{entry.phone}</td>
                      <td className="p-4">{entry.party_size} Guests</td>
                      <td className="p-4 text-xs text-muted-foreground">
                        {new Date(entry.created_at).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                          entry.status === 'seated' ? 'bg-emerald-500/10 text-emerald-600' :
                          entry.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                          'bg-yellow-500/10 text-yellow-600'
                        }`}>
                          {entry.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {entry.status === 'waiting' && (
                          <>
                            <button
                              onClick={() => {
                                db.updateWaitlistStatus(entry.id, 'seated').then(refreshData);
                              }}
                              className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-colors"
                            >
                              Seat
                            </button>
                            <button
                              onClick={() => {
                                db.updateWaitlistStatus(entry.id, 'cancelled').then(refreshData);
                              }}
                              className="px-3 py-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg text-xs font-semibold transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                  {waitlist.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground text-xs">
                        No waitlist entries found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Orders Management Tab ── */}
      {activeTab === 'orders' && (
        <motion.div
          key="orders"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="bg-card border border-border/20 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-accent" />
                Order Management
              </h3>
              <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-3 py-1 rounded-lg">
                {orders.length} Total Orders
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-secondary/50 text-muted-foreground font-semibold">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Order ID</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Items</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 rounded-r-lg">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-foreground">
                        #{(order.id).slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-xs font-medium text-foreground">{order.customerName || order.customer_name}</p>
                          <p className="text-[10px] text-muted-foreground">{order.customerEmail || order.customer_email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-semibold uppercase bg-accent/8 text-accent px-2 py-0.5 rounded-md border border-accent/15">
                          {order.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">
                        {order.items.map((it: any) => `${it.menuItem?.name || it.name} ×${it.quantity}`).join(', ')}
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-foreground">
                        Rs. {formatRs(order.total)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${
                          (order as any).payment_status === 'paid' || (order as any).paymentStatus === 'paid'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            : 'bg-amber-50 text-amber-600 border-amber-200'
                        }`}>
                          {(order as any).payment_status || (order as any).paymentStatus || 'pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          className="bg-secondary text-foreground border border-border rounded-lg px-2 py-1 text-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent"
                          value={order.status}
                          onChange={async (e) => {
                            const newStatus = e.target.value as any;
                            const result = await db.updateOrderStatus(order.id, newStatus);
                            if (result) {
                              setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: newStatus } : o));
                            } else {
                              alert('Failed to update order status.');
                            }
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="preparing">Preparing</option>
                          <option value="ready">Ready</option>
                          <option value="out-for-delivery">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setReceiptOrder(order)}
                          className="p-1.5 hover:bg-accent/10 hover:text-accent rounded-lg transition-colors cursor-pointer text-muted-foreground"
                          title="View Bill"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                        No orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Users / Staff Management Tab ── */}
      {activeTab === 'users' && (
        <motion.div
          key="users"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Quick Assign Role Card */}
          <div className="bg-card border border-border/20 rounded-2xl p-6 shadow-sm">
            <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2 mb-4">
              <ShieldAlert className="w-5 h-5 text-accent" />
              Quick Assign Role
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Directly assign a role to any registered user by entering their email address.
            </p>
            <form onSubmit={handleAssignRoleByEmail} className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
              <div className="flex-1 w-full">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={assignEmail}
                  onChange={(e) => { setAssignEmail(e.target.value); setAssignStatus(null); }}
                  className="w-full bg-secondary text-foreground border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-muted-foreground/50"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Role</label>
                <select
                  value={assignRole}
                  onChange={(e) => setAssignRole(e.target.value as 'customer' | 'staff' | 'admin')}
                  className="bg-secondary text-foreground border border-border rounded-lg px-3 py-2 text-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="customer">Customer</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={assignLoading}
                className="px-5 py-2 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
              >
                {assignLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Assign Role
              </button>
            </form>
            {assignStatus && (
              <div className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium ${
                assignStatus.type === 'success'
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {assignStatus.message}
              </div>
            )}
          </div>

          {/* Users Table */}
          <div className="bg-card border border-border/20 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" />
                Staff & User Management
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-secondary/50 text-muted-foreground font-semibold">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">User Name</th>
                    <th className="px-4 py-3">Email Address</th>
                    <th className="px-4 py-3">Joined Date</th>
                    <th className="px-4 py-3 rounded-r-lg">Account Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{user.full_name || 'Unknown'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          className="bg-secondary text-foreground border border-border rounded-lg px-2 py-1 text-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent"
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        >
                          <option value="customer">Customer</option>
                          <option value="staff">Staff</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
      {/* Tab 8: QR Codes */}
      {activeTab === 'qrcodes' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-lg font-bold text-foreground">Table QR Codes</h3>
              <p className="text-xs text-muted-foreground mt-1">Print these codes and place them on tables for self-service ordering.</p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-accent text-white rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer print:hidden"
            >
              <Printer className="w-4 h-4" /> Print QR Codes
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 print:grid-cols-3 print:gap-8">
            {tables.map(table => {
              const qrUrl = `https://flavouree.vercel.app/menu?table=${table.number}`;
              return (
                <div key={table.id} className="bg-card border border-border/20 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm">
                  <div className="mb-4 p-2 bg-white rounded-xl shadow-sm border border-border/10">
                    <QRCodeSVG value={qrUrl} size={120} level="H" includeMargin={true} />
                  </div>
                  <h4 className="font-display font-bold text-foreground text-lg mb-1">Table {table.number}</h4>
                  <p className="text-[10px] text-muted-foreground break-all">{qrUrl}</p>
                </div>
              );
            })}
            {tables.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                No tables created yet. Go to the Tables tab to add some.
              </div>
            )}
          </div>
        </motion.div>
      )}

    </div>

      {/* Receipt Modal */}
      <ReceiptModal order={receiptOrder} onClose={() => setReceiptOrder(null)} />
    </>
  );
};
