import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag, DollarSign, CalendarDays, UtensilsCrossed,
  TrendingUp, Clock, ChevronDown, ChevronUp, Star, Receipt,
  Calendar, Users, MapPin, ArrowUpRight, Sparkles, Printer, XCircle
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { db } from '../lib/supabaseDb';
import { Order, Reservation, UserProfile } from '../lib/types';
import { FloatingFood3D } from '../components/FloatingFood3D';
import { ReceiptModal } from '../components/ReceiptModal';

interface DashboardPageProps {
  currentUser: UserProfile | null;
}

/* ─── Tab Type ─── */
type DashboardTab = 'overview' | 'orders' | 'reservations';

/* ─── Stat Card ─── */
function StatCard({
  icon: Icon, label, value, subtitle, color, delay
}: {
  icon: React.ElementType; label: string; value: string; subtitle?: string;
  color: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="bg-card border border-border/20 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-accent/15 transition-all duration-300 group relative overflow-hidden"
    >
      {/* Subtle gradient glow */}
      <div
        className="absolute -top-12 -right-12 w-28 h-28 rounded-full opacity-[0.07] group-hover:opacity-[0.12] transition-opacity duration-500"
        style={{ background: `radial-gradient(circle, ${color}, transparent)` }}
      />

      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
          <p className="text-2xl font-display font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="text-[10px] text-muted-foreground font-medium">{subtitle}</p>
          )}
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center border transition-colors duration-300"
          style={{
            backgroundColor: `${color}10`,
            borderColor: `${color}25`,
            color
          }}
        >
          <Icon className="w-4.5 h-4.5" />
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Status Badge ─── */
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; border: string }> = {
    pending:            { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
    preparing:          { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    ready:              { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
    'out-for-delivery': { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
    delivered:          { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
    cancelled:          { bg: 'bg-red-50', text: 'text-red-500', border: 'border-red-200' },
    confirmed:          { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
  };
  const c = config[status] || config.pending;
  return (
    <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full ${c.bg} ${c.text} border ${c.border}`}>
      {status.replace(/-/g, ' ')}
    </span>
  );
}

/* ─── Custom Recharts Tooltip ─── */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card/95 backdrop-blur-lg border border-border/30 rounded-xl shadow-xl p-3 min-w-[140px]">
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className="text-base font-display font-bold text-foreground">Rs. {payload[0].value.toFixed(2)}</p>
    </div>
  );
}

/* ─── Order Progress Bar ─── */
function OrderProgressBar({ status, type }: { status: string; type?: string }) {
  const isDelivery = type === 'delivery';
  const steps = isDelivery 
    ? ['Placed', 'Preparing', 'Ready', 'Dispatch', 'Delivered'] 
    : ['Placed', 'Preparing', 'Ready', 'Done'];

  let width = 'w-0';
  let color = 'bg-amber-400';

  if (isDelivery) {
    switch (status) {
      case 'pending': width = 'w-1/5'; color = 'bg-amber-400'; break;
      case 'preparing': width = 'w-2/5'; color = 'bg-blue-400'; break;
      case 'ready': width = 'w-3/5'; color = 'bg-purple-400'; break;
      case 'out-for-delivery': width = 'w-4/5'; color = 'bg-indigo-400'; break;
      case 'delivered': width = 'w-full'; color = 'bg-emerald-500'; break;
      default: width = 'w-full'; color = 'bg-red-400';
    }
  } else {
    switch (status) {
      case 'pending': width = 'w-1/4'; color = 'bg-amber-400'; break;
      case 'preparing': width = 'w-2/4'; color = 'bg-blue-400'; break;
      case 'ready': width = 'w-3/4'; color = 'bg-purple-400'; break;
      case 'delivered': width = 'w-full'; color = 'bg-emerald-500'; break;
      default: width = 'w-full'; color = 'bg-red-400';
    }
  }

  return (
    <div className="space-y-1">
      <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
        <div className={`h-full transition-all duration-700 ${width} ${color}`} />
      </div>
      <div className="text-[8px] text-muted-foreground font-semibold flex justify-between">
        {steps.map((step, idx) => (
          <span key={idx}>{step}</span>
        ))}
      </div>
    </div>
  );
}

/* ─── MAIN DASHBOARD ─── */
export function DashboardPage({ currentUser }: DashboardPageProps) {
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [userReservations, setUserReservations] = useState<Reservation[]>([]);
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancellingResId, setCancellingResId] = useState<string | null>(null);

  /* Cancel an order (only if pending or preparing) */
  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancellingOrderId(orderId);
    try {
      await db.updateOrderStatus(orderId, 'cancelled');
      setUserOrders(prev =>
        prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o)
      );
    } catch (e) {
      console.error('Failed to cancel order:', e);
      alert('Could not cancel the order. Please try again.');
    } finally {
      setCancellingOrderId(null);
    }
  };

  /* Cancel a reservation (only if pending) */
  const handleCancelReservation = async (resId: string) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    setCancellingResId(resId);
    try {
      await db.updateReservationStatus(resId, 'cancelled');
      setUserReservations(prev =>
        prev.map(r => r.id === resId ? { ...r, status: 'cancelled' } : r)
      );
    } catch (e) {
      console.error('Failed to cancel reservation:', e);
      alert('Could not cancel the reservation. Please try again.');
    } finally {
      setCancellingResId(null);
    }
  };

  /* Fetch data */
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        setUserOrders([]);
        setUserReservations([]);
        return;
      }

      try {
        const userEmail = currentUser.email.trim().toLowerCase();
        const userId = currentUser.id;

        // Fetch remote + local orders
        const remoteOrders = await db.getOrders();
        const localOrders = (JSON.parse(localStorage.getItem('flavore_orders') || '[]') as any[]).map((o: any) => ({
          id: o.id,
          customer_name: o.customerName ?? o.customer_name,
          customerName: o.customerName ?? o.customer_name,
          customer_email: o.customerEmail ?? o.customer_email,
          customerEmail: o.customerEmail ?? o.customer_email,
          items: o.items,
          status: o.status,
          total: Number(o.total || 0),
          type: o.type,
          table_number: o.tableNumber ?? o.table_number,
          tableNumber: o.tableNumber ?? o.table_number,
          user_id: o.user_id ?? o.userId,
          created_at: o.created_at
        }));

        const ordersMap = new Map();
        [...remoteOrders, ...localOrders].forEach(o => {
          if (o && o.id && !ordersMap.has(o.id)) {
            ordersMap.set(o.id, o);
          }
        });
        const combinedOrders = Array.from(ordersMap.values());

        const filteredOrders = combinedOrders.filter(o => {
          const email = (o.customer_email ?? o.customerEmail ?? '').trim().toLowerCase();
          const uid = o.user_id ?? o.userId;
          return (email && email === userEmail) || (userId && uid === userId);
        });
        setUserOrders(filteredOrders);

        // Fetch remote + local reservations
        const remoteRes = await db.getReservations();
        const localRes = (JSON.parse(localStorage.getItem('flavore_reservations') || '[]') as any[]).map((r: any) => ({
          id: r.id,
          name: r.name,
          email: r.email,
          phone: r.phone,
          date: r.date,
          time: r.time,
          guests: r.guests,
          status: r.status,
          table_number: r.tableNumber ?? r.table_number,
          tableNumber: r.tableNumber ?? r.table_number,
          user_id: r.user_id ?? r.userId,
          created_at: r.created_at
        }));

        const resMap = new Map();
        [...remoteRes, ...localRes].forEach(r => {
          if (r && r.id && !resMap.has(r.id)) {
            resMap.set(r.id, r);
          }
        });
        const combinedRes = Array.from(resMap.values());

        const filteredRes = combinedRes.filter(r => {
          const email = (r.email ?? '').trim().toLowerCase();
          const uid = r.user_id ?? r.userId;
          return (email && email === userEmail) || (userId && uid === userId);
        });
        setUserReservations(filteredRes);
      } catch (e) {
        console.error('Error fetching dashboard data:', e);
      }
    };

    fetchUserData();
    const interval = setInterval(fetchUserData, 4000);
    return () => clearInterval(interval);
  }, [currentUser]);

  /* ─── Computed Analytics ─── */
  const analytics = useMemo(() => {
    const totalSpent = userOrders.reduce((sum, o) => {
      if (o.status === 'cancelled') return sum;
      return sum + (Number(o.total) || 0);
    }, 0);

    const totalOrders = userOrders.length;
    const totalReservations = userReservations.length;
    const activeOrders = userOrders.filter(o =>
      o.status === 'pending' || o.status === 'preparing' || o.status === 'ready' || o.status === 'out-for-delivery'
    ).length;

    // Favorite item calculation
    const itemCounts: Record<string, { name: string; count: number }> = {};
    userOrders.forEach(o => {
      (o.items || []).forEach((item: any) => {
        const key = item.menuItem?.id ?? item.menu_item_id ?? item.name;
        const name = item.menuItem?.name ?? item.name ?? 'Item';
        if (!itemCounts[key]) itemCounts[key] = { name, count: 0 };
        itemCounts[key].count += (item.quantity || 1);
      });
    });
    const favoriteItem = Object.values(itemCounts).sort((a, b) => b.count - a.count)[0];

    // Spending by date for chart
    const spendingByDate: Record<string, number> = {};
    userOrders.forEach(o => {
      if (o.status === 'cancelled') return;
      const d = new Date(o.created_at);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      spendingByDate[key] = (spendingByDate[key] || 0) + (Number(o.total) || 0);
    });
    const chartData = Object.entries(spendingByDate)
      .map(([date, amount]) => ({ date, amount }))
      .reverse();

    // Spending by category for pie chart
    const categorySpending: Record<string, number> = {};
    userOrders.forEach(o => {
      if (o.status === 'cancelled') return;
      (o.items || []).forEach((item: any) => {
        const cat = item.menuItem?.category ?? item.category ?? 'Mains';
        const price = Number(item.menuItem?.price ?? item.price ?? 0);
        categorySpending[cat] = (categorySpending[cat] || 0) + (price * (item.quantity || 1));
      });
    });
    const categoryData = Object.entries(categorySpending).map(([name, value]) => ({ name, value }));

    // Average order value
    const validOrdersCount = userOrders.filter(o => o.status !== 'cancelled').length;
    const avgOrderValue = validOrdersCount > 0 ? totalSpent / validOrdersCount : 0;

    return {
      totalSpent, totalOrders, totalReservations, activeOrders,
      favoriteItem, chartData, categoryData, avgOrderValue
    };
  }, [userOrders, userReservations]);

  const categoryColors = ['#d4a574', '#8b7355', '#c9b299', '#a68968'];

  const tabs: { key: DashboardTab; label: string; icon: React.ElementType }[] = [
    { key: 'overview', label: 'Overview', icon: TrendingUp },
    { key: 'orders', label: 'Order History', icon: ShoppingBag },
    { key: 'reservations', label: 'Reservations', icon: CalendarDays },
  ];

  /* ─── Not logged in ─── */
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background pb-12 pt-[72px] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-10 bg-card border border-border/20 rounded-3xl shadow-sm max-w-md w-full"
        >
          <div className="w-14 h-14 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-accent" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Your Dashboard</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Sign in to view your order analytics, spending insights, and reservation history — all in one place.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-[72px] relative overflow-hidden">
      {/* Background 3D Elements */}
      <FloatingFood3D
        src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600"
        size={200}
        className="absolute -right-16 top-40 opacity-20 hidden xl:block"
        initialRotation={{ x: 10, y: 30, z: -5 }}
      />
      <FloatingFood3D
        src="https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=600"
        size={160}
        className="absolute -left-10 bottom-60 opacity-20 hidden xl:block"
        initialRotation={{ x: 30, y: -10, z: 15 }}
      />

      <div className="max-w-6xl mx-auto px-6 py-10 relative z-10">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <span className="text-accent text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5 block">
                Welcome back
              </span>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                {(currentUser.full_name ?? (currentUser as any).fullName ?? currentUser.email).split(' ')[0]}'s Dashboard
              </h1>
              <p className="text-xs text-muted-foreground mt-1.5">
                Your personal dining analytics and activity at Flavoré
              </p>
            </div>
            {analytics.activeOrders > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-4 py-2 bg-accent/8 border border-accent/20 rounded-full"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
                </span>
                <span className="text-[10px] font-bold text-accent">
                  {analytics.activeOrders} Active Order{analytics.activeOrders > 1 ? 's' : ''}
                </span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={DollarSign}
            label="Total Spent"
            value={`Rs. ${analytics.totalSpent.toFixed(2)}`}
            subtitle={analytics.totalOrders > 0 ? `Avg Rs. ${analytics.avgOrderValue.toFixed(2)} per order` : undefined}
            color="#d4a574"
            delay={0.1}
          />
          <StatCard
            icon={ShoppingBag}
            label="Total Orders"
            value={analytics.totalOrders.toString()}
            subtitle={analytics.activeOrders > 0 ? `${analytics.activeOrders} currently active` : 'All orders delivered'}
            color="#8b7355"
            delay={0.2}
          />
          <StatCard
            icon={CalendarDays}
            label="Reservations"
            value={analytics.totalReservations.toString()}
            subtitle={userReservations.filter(r => r.status === 'confirmed').length > 0
              ? `${userReservations.filter(r => r.status === 'confirmed').length} confirmed`
              : 'No upcoming bookings'}
            color="#c9b299"
            delay={0.3}
          />
          <StatCard
            icon={Star}
            label="Favorite Dish"
            value={analytics.favoriteItem?.name || '—'}
            subtitle={analytics.favoriteItem ? `Ordered ${analytics.favoriteItem.count} times` : 'Place your first order'}
            color="#a68968"
            delay={0.4}
          />
        </div>

        {/* ── Tab Navigation ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex gap-1 bg-secondary/80 p-1.5 rounded-2xl mb-8 w-fit border border-border/20"
        >
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-card text-foreground shadow-sm border border-border/20'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">
          {/* ─── OVERVIEW TAB ─── */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              {/* Spending Chart + Category Breakdown */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Spending Over Time */}
                <div className="lg:col-span-2 bg-card border border-border/20 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="font-display text-lg font-bold text-foreground">Spending Over Time</h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Your order spending pattern</p>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-accent bg-accent/8 px-2.5 py-1 rounded-full">
                      <TrendingUp className="w-3 h-3" />
                      <span>Rs. {analytics.totalSpent.toFixed(2)} total</span>
                    </div>
                  </div>

                  {analytics.chartData.length > 0 ? (
                    <div className="h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analytics.chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                          <defs>
                            <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#d4a574" stopOpacity={0.3} />
                              <stop offset="100%" stopColor="#d4a574" stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                          <XAxis
                            dataKey="date"
                            tick={{ fontSize: 10, fill: '#6b6662' }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            tick={{ fontSize: 10, fill: '#6b6662' }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(v: number) => `Rs. ${v}`}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Area
                            type="monotone"
                            dataKey="amount"
                            stroke="#d4a574"
                            strokeWidth={2.5}
                            fill="url(#spendGradient)"
                            dot={{ fill: '#d4a574', strokeWidth: 2, r: 4, stroke: '#fff' }}
                            activeDot={{ r: 6, fill: '#d4a574', stroke: '#fff', strokeWidth: 3 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[220px] flex items-center justify-center">
                      <p className="text-xs text-muted-foreground">No spending data yet. Place an order to see your analytics!</p>
                    </div>
                  )}
                </div>

                {/* Category Breakdown */}
                <div className="bg-card border border-border/20 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-display text-lg font-bold text-foreground mb-1">By Category</h3>
                  <p className="text-[10px] text-muted-foreground mb-5">Where you spend the most</p>

                  {analytics.categoryData.length > 0 ? (
                    <>
                      <div className="h-[140px] mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={analytics.categoryData}
                              cx="50%"
                              cy="50%"
                              innerRadius={38}
                              outerRadius={60}
                              paddingAngle={4}
                              dataKey="value"
                              stroke="none"
                            >
                              {analytics.categoryData.map((_entry, index) => (
                                <Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value: number) => [`Rs. ${value.toFixed(2)}`, 'Spent']}
                              contentStyle={{
                                background: 'var(--card)',
                                border: '1px solid var(--border)',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: 600
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-2.5">
                        {analytics.categoryData.map((cat, i) => (
                          <div key={cat.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: categoryColors[i % categoryColors.length] }}
                              />
                              <span className="text-[11px] font-semibold text-foreground/80">{cat.name}</span>
                            </div>
                            <span className="text-[11px] font-bold text-foreground">Rs. {cat.value.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center">
                      <p className="text-xs text-muted-foreground text-center">No category data yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Active Orders Tracker */}
              {userOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length > 0 && (
                <div className="bg-card border border-border/20 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                    <h3 className="font-display text-lg font-bold text-foreground">Active Orders</h3>
                  </div>
                  <div className="space-y-4">
                    {userOrders
                      .filter(o => o.status !== 'delivered' && o.status !== 'cancelled')
                      .map(order => (
                        <div
                          key={order.id}
                          className="bg-secondary/50 border border-border/15 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-muted-foreground font-mono">{order.id}</span>
                              <StatusBadge status={order.status} />
                              <span className="text-[10px] font-semibold text-accent/80 bg-accent/5 px-2 rounded">
                                {order.type === 'dine-in' 
                                  ? `Table ${order.tableNumber}` 
                                  : order.type === 'delivery' 
                                  ? 'Delivery' 
                                  : 'Takeaway'}
                              </span>
                            </div>
                             <div className="text-xs text-foreground">
                              <span className="font-bold">Items: </span>
                              {(order.items || []).map((item: any) => `${item.menuItem?.name ?? item.name} ×${item.quantity}`).join(', ')}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Total: Rs. {order.total.toFixed(2)}
                            </div>
                          </div>
                          <div className="w-full md:w-56">
                            <OrderProgressBar status={order.status} type={order.type} />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Recent Orders Quick View */}
              {userOrders.length > 0 && (
                <div className="bg-card border border-border/20 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-display text-lg font-bold text-foreground">Recent Orders</h3>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-[10px] font-bold text-accent hover:text-accent/80 flex items-center gap-0.5 transition-colors cursor-pointer"
                    >
                      View All <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/20">
                          <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider pb-3 pr-4">Order</th>
                          <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider pb-3 pr-4">Items</th>
                          <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider pb-3 pr-4">Type</th>
                          <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider pb-3 pr-4">Date</th>
                          <th className="text-right text-[10px] font-bold text-muted-foreground uppercase tracking-wider pb-3 pr-4">Total</th>
                          <th className="text-right text-[10px] font-bold text-muted-foreground uppercase tracking-wider pb-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userOrders.slice(0, 5).map((order, i) => (
                          <tr key={order.id} className="border-b border-border/10 last:border-0 hover:bg-secondary/30 transition-colors">
                            <td className="py-3 pr-4">
                              <span className="text-[11px] font-bold text-foreground font-mono">{order.id.slice(0, 12)}</span>
                            </td>
                            <td className="py-3 pr-4">
                              <span className="text-[11px] text-foreground/80 line-clamp-1">
                                {(order.items || []).map((item: any) => `${item.menuItem?.name ?? item.name} ×${item.quantity}`).join(', ')}
                              </span>
                            </td>
                            <td className="py-3 pr-4">
                              <span className="text-[10px] font-semibold text-accent/80 bg-accent/5 px-2 py-0.5 rounded">
                                {order.type === 'dine-in' 
                                  ? `Table ${order.tableNumber}` 
                                  : order.type === 'delivery' 
                                  ? 'Delivery' 
                                  : 'Takeaway'}
                              </span>
                            </td>
                            <td className="py-3 pr-4">
                              <span className="text-[11px] text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </td>
                            <td className="py-3 pr-4 text-right">
                              <span className="text-[11px] font-bold text-foreground">Rs. {order.total.toFixed(2)}</span>
                            </td>
                            <td className="py-3 text-right">
                              <StatusBadge status={order.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Empty state when nothing exists */}
              {userOrders.length === 0 && userReservations.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border/20 rounded-2xl p-12 shadow-sm text-center"
                >
                  <div className="w-16 h-16 bg-accent/8 border border-accent/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <UtensilsCrossed className="w-7 h-7 text-accent/60" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">
                    Your culinary journey starts here
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    Browse our menu and place your first order, or book a table to begin seeing your personalized dining analytics.
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ─── ORDERS TAB ─── */}
          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
              className="space-y-4"
            >
              {userOrders.length === 0 ? (
                <div className="bg-card border border-border/20 rounded-2xl p-12 shadow-sm text-center">
                  <Receipt className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                  <h3 className="font-display text-lg font-bold text-foreground mb-1">No orders yet</h3>
                  <p className="text-xs text-muted-foreground">Your order history will appear here after your first purchase.</p>
                </div>
              ) : (
                userOrders.map((order, i) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card border border-border/20 rounded-2xl overflow-hidden shadow-sm hover:border-accent/15 transition-all duration-300"
                  >
                    {/* Order Header */}
                    <button
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      className="w-full text-left p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-secondary/20 transition-colors"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-accent/8 border border-accent/15 flex items-center justify-center flex-shrink-0">
                          <Receipt className="w-4 h-4 text-accent" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-foreground font-mono">{order.id}</span>
                            <StatusBadge status={order.status} />
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            {new Date(order.created_at).toLocaleDateString('en-US', {
                              weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                            {' • '}
                            {order.type === 'dine-in' 
                              ? `Dine-in · Table ${order.tableNumber}` 
                              : order.type === 'delivery' 
                              ? 'Delivery' 
                              : 'Takeaway'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-base font-display font-bold text-foreground">Rs. {order.total.toFixed(2)}</span>
                        {expandedOrder === order.id
                          ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        }
                      </div>
                    </button>

                    {/* Expanded Item Details */}
                    <AnimatePresence>
                      {expandedOrder === order.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 border-t border-border/15">
                            {order.status !== 'delivered' && order.status !== 'cancelled' && (
                              <div className="mt-4 mb-4 max-w-md">
                                <OrderProgressBar status={order.status} type={order.type} />
                              </div>
                            )}

                            <table className="w-full mt-3">
                              <thead>
                                <tr className="border-b border-border/15">
                                  <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider pb-2">Item</th>
                                  <th className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider pb-2">Qty</th>
                                  <th className="text-right text-[10px] font-bold text-muted-foreground uppercase tracking-wider pb-2">Price</th>
                                  <th className="text-right text-[10px] font-bold text-muted-foreground uppercase tracking-wider pb-2">Subtotal</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(order.items || []).map((item: any, j: number) => {
                                  const name = item.menuItem?.name ?? item.name ?? 'Item';
                                  const category = item.menuItem?.category ?? item.category ?? 'Mains';
                                  const imgUrl = item.menuItem?.image_url ?? item.image_url ?? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600';
                                  const price = Number(item.menuItem?.price ?? item.price ?? 0);
                                  const qty = item.quantity || 1;
                                  return (
                                    <tr key={j} className="border-b border-border/8 last:border-0">
                                      <td className="py-2.5">
                                        <div className="flex items-center gap-2.5">
                                          <img
                                            src={imgUrl}
                                            alt={name}
                                            className="w-8 h-8 rounded-lg object-cover border border-border/20"
                                          />
                                          <div>
                                            <span className="text-[11px] font-semibold text-foreground block">{name}</span>
                                            <span className="text-[9px] text-muted-foreground">{category}</span>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="py-2.5 text-center">
                                        <span className="text-[11px] font-bold text-foreground/70 bg-secondary px-2 py-0.5 rounded-md">×{qty}</span>
                                      </td>
                                      <td className="py-2.5 text-right">
                                        <span className="text-[11px] text-muted-foreground">Rs. {price.toFixed(2)}</span>
                                      </td>
                                      <td className="py-2.5 text-right">
                                        <span className="text-[11px] font-bold text-foreground">Rs. {(price * qty).toFixed(2)}</span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>

                            {order.type === 'delivery' && (order.deliveryAddress || order.deliveryPhone || order.estimatedDelivery) && (
                              <div className="mt-5 p-4 bg-secondary/35 rounded-xl border border-border/10 grid md:grid-cols-2 gap-4 text-xs">
                                <div className="space-y-2">
                                  <h4 className="font-bold text-foreground uppercase tracking-wider text-[9px] text-accent">Delivery Details</h4>
                                  {order.deliveryAddress && (
                                    <p className="text-muted-foreground">
                                      <span className="font-semibold text-foreground">Address:</span> {order.deliveryAddress}
                                    </p>
                                  )}
                                  {order.deliveryPhone && (
                                    <p className="text-muted-foreground">
                                      <span className="font-semibold text-foreground">Phone:</span> {order.deliveryPhone}
                                    </p>
                                  )}
                                  {order.deliveryNotes && (
                                    <p className="text-muted-foreground italic bg-card/45 p-2 rounded border border-border/5">
                                      "{order.deliveryNotes}"
                                    </p>
                                  )}
                                </div>
                                {order.estimatedDelivery && order.status !== 'delivered' && order.status !== 'cancelled' && (
                                  <div className="flex flex-col justify-center items-start md:items-end">
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Estimated Delivery Time</span>
                                    <span className="text-lg font-display font-bold text-accent mt-0.5">
                                      {new Date(order.estimatedDelivery).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground mt-0.5">Arriving fresh and warm</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Order Actions Row */}
                            <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
                              {(order.status === 'pending' || order.status === 'preparing') && (
                                <button
                                  onClick={() => handleCancelOrder(order.id)}
                                  disabled={cancellingOrderId === order.id}
                                  className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-red-100 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {cancellingOrderId === order.id ? (
                                    <span className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <XCircle className="w-3.5 h-3.5" />
                                  )}
                                  Cancel Order
                                </button>
                              )}
                              <button
                                onClick={() => setReceiptOrder(order)}
                                className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-secondary text-foreground text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-accent hover:text-white transition-all cursor-pointer border border-border/30"
                              >
                                <Printer className="w-3.5 h-3.5" /> View Bill
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {/* ─── RESERVATIONS TAB ─── */}
          {activeTab === 'reservations' && (
            <motion.div
              key="reservations"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
              className="space-y-4"
            >
              {userReservations.length === 0 ? (
                <div className="bg-card border border-border/20 rounded-2xl p-12 shadow-sm text-center">
                  <Calendar className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                  <h3 className="font-display text-lg font-bold text-foreground mb-1">No reservations yet</h3>
                  <p className="text-xs text-muted-foreground">Your table booking history will appear here.</p>
                </div>
              ) : (
                userReservations.map((res, i) => (
                  <motion.div
                    key={res.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card border border-border/20 rounded-2xl p-5 shadow-sm hover:border-accent/15 transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {/* Date visual card */}
                        <div className="w-14 h-14 rounded-xl bg-accent/8 border border-accent/15 flex flex-col items-center justify-center flex-shrink-0">
                          <span className="text-[9px] font-bold text-accent uppercase">
                            {new Date(res.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="text-lg font-display font-bold text-foreground leading-none">
                            {new Date(res.date + 'T00:00:00').getDate()}
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-foreground font-mono">{res.id}</span>
                            <StatusBadge status={res.status} />
                          </div>

                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {res.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {res.guests} Guest{res.guests > 1 ? 's' : ''}
                            </span>
                            {res.tableNumber && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                Table {res.tableNumber}
                              </span>
                            )}
                          </div>

                          <div className="text-[10px] text-muted-foreground/70">
                            Booked on {new Date(res.created_at).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Reservation date + cancel button */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-[10px] text-muted-foreground font-medium">Reservation Date</p>
                          <p className="text-sm font-display font-bold text-foreground">
                            {new Date(res.date + 'T00:00:00').toLocaleDateString('en-US', {
                              weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                            })}
                          </p>
                        </div>
                        {(res.status === 'pending' || res.status === 'confirmed') && (
                          <button
                            onClick={() => handleCancelReservation(res.id)}
                            disabled={cancellingResId === res.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-red-100 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {cancellingResId === res.id ? (
                              <span className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            Cancel Reservation
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Receipt Modal */}
      <ReceiptModal order={receiptOrder} onClose={() => setReceiptOrder(null)} />
    </div>
  );
}
