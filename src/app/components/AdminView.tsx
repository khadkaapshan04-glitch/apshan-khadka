import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  Trophy, DollarSign, Calendar, ShoppingBag, Star, Plus, Edit3, Trash2, Check, X,
  Search, Eye, ShieldAlert, CheckCircle2, ChevronRight, Sliders
} from 'lucide-react';
import { mockDb, MenuItem, Order, Reservation, RestaurantTable } from '../utils/mockDb';

export const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'menu' | 'reservations' | 'tables'>('analytics');
  
  // States
  const [orders, setOrders] = useState<Order[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  
  // CRUD states
  const [isEditing, setIsEditing] = useState<MenuItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Table CRUD states
  const [isEditingTable, setIsEditingTable] = useState<RestaurantTable | null>(null);
  const [isCreatingTable, setIsCreatingTable] = useState(false);
  const [tableNum, setTableNum] = useState('');
  const [tableCapacity, setTableCapacity] = useState(2);
  const [tableType, setTableType] = useState<'booth' | 'standard' | 'outdoor'>('standard');
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

  const refreshData = () => {
    setOrders(mockDb.getOrders());
    setMenu(mockDb.getMenu());
    setReservations(mockDb.getReservations());
    setTables(mockDb.getTables());
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 4000); // Poll database
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

  const handleSaveTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNum || tableCapacity <= 0) {
      alert('Please fill out all required fields.');
      return;
    }

    const savedTable: RestaurantTable = {
      id: isEditingTable ? isEditingTable.id : 't_' + Math.random().toString(36).substr(2, 9),
      number: tableNum,
      capacity: Number(tableCapacity),
      type: tableType,
      position: { x: Number(tablePosX), y: Number(tablePosY) }
    };

    mockDb.saveTable(savedTable);
    setIsEditingTable(null);
    setIsCreatingTable(false);
    refreshData();
  };

  const handleDeleteTable = (id: string) => {
    if (window.confirm('Are you sure you want to delete this table?')) {
      mockDb.deleteTable(id);
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

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!crudName || crudPrice <= 0 || !crudImg) {
      alert('Please fill out all required fields.');
      return;
    }

    const savedItem: MenuItem = {
      id: isEditing ? isEditing.id : 'm_' + Math.random().toString(36).substr(2, 9),
      name: crudName,
      description: crudDesc,
      price: Number(crudPrice),
      category: crudCategory,
      image_url: crudImg,
      is_available: crudAvailable
    };

    mockDb.saveMenuItem(savedItem);
    setIsEditing(null);
    setIsCreating(false);
    refreshData();
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      mockDb.deleteMenuItem(id);
      refreshData();
    }
  };

  // Reservation actions
  const handleConfirmReservation = (id: string) => {
    const reservation = reservations.find(r => r.id === id);
    let tableId = tableAssignment[id];

    // If tableId from assignment input is actually a table number or ID
    if (tableId) {
      const table = tables.find(t => t.id === tableId || t.number === tableId);
      if (table) tableId = table.id;
    } else if (reservation?.tableId) {
      tableId = reservation.tableId;
    }

    mockDb.updateReservationStatus(id, 'confirmed', tableId);
    refreshData();
  };

  const handleCancelReservation = (id: string) => {
    mockDb.updateReservationStatus(id, 'cancelled');
    refreshData();
  };

  // --- ANALYTICS CALCULATIONS ---
  const totalSales = orders.reduce((sum, o) => o.status === 'delivered' ? sum + o.total : sum, 0);
  const totalOrdersCount = orders.length;
  const activeReservationsCount = reservations.filter(r => r.status === 'pending').length;
  
  // Sales Trend chart data (Hourly mock calculation based on real times)
  const salesByHour = (() => {
    const hourlyData: { [key: string]: number } = {};
    orders.forEach(o => {
      if (o.status !== 'delivered') return;
      const hour = new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).split(':')[0];
      hourlyData[hour] = (hourlyData[hour] || 0) + o.total;
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
      o.items.forEach(it => {
        const cat = it.menuItem.category;
        stats[cat] = (stats[cat] || 0) + it.quantity;
      });
    });

    return Object.keys(stats).map(cat => ({
      name: cat,
      Orders: stats[cat]
    }));
  })();

  return (
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
            { id: 'menu', label: 'Menu List' },
            { id: 'reservations', label: 'Reservations' },
            { id: 'tables', label: 'Tables' }
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
                <div className="text-xl font-bold text-foreground">${totalSales.toFixed(2)}</div>
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
                        <label className="block text-[10px] font-bold text-foreground/80 mb-1 uppercase tracking-wider">Price ($) *</label>
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
                      <td className="p-4 font-bold text-accent">${item.price.toFixed(2)}</td>
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
                        <option value="standard">Standard</option>
                        <option value="booth">Booth</option>
                        <option value="outdoor">Outdoor</option>
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

    </div>
  );
};
