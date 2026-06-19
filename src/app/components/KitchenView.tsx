import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChefHat, Clock, AlertCircle, CheckCircle, Package, XCircle, ArrowRight } from 'lucide-react';
import { mockDb, Order, OrderStatus } from '../utils/mockDb';

export const KitchenView: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = () => {
    setOrders(mockDb.getOrders());
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000); // refresh every 3 seconds for real-time emulation
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = (orderId: string, nextStatus: OrderStatus) => {
    mockDb.updateOrderStatus(orderId, nextStatus);
    fetchOrders();
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 text-yellow-600 border border-yellow-200';
      case 'preparing': return 'bg-blue-50 text-blue-600 border border-blue-200';
      case 'ready': return 'bg-purple-50 text-purple-600 border border-purple-200';
      case 'out-for-delivery': return 'bg-indigo-50 text-indigo-600 border border-indigo-200';
      case 'delivered': return 'bg-green-50 text-green-600 border border-green-200';
      default: return 'bg-red-50 text-red-600 border border-red-200';
    }
  };

  // Group active orders
  const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
  const pastOrders = orders.filter(o => o.status === 'delivered' || o.status === 'cancelled').slice(0, 10); // show last 10 completed

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-6 lg:px-10 py-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Kitchen & Service Queue</h2>
            <p className="text-xs text-muted-foreground">Manage active restaurant orders and track preparation times.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Live Monitoring</span>
        </div>
      </div>

      {/* Main Board */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Column 1: Pending Acceptance */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-yellow-50/50 dark:bg-yellow-950/10 border border-yellow-100 dark:border-yellow-950/20 px-4 py-3 rounded-2xl">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-xs font-bold text-yellow-700 uppercase tracking-wide">Pending Orders</span>
            </div>
            <span className="text-xs font-bold bg-yellow-100 dark:bg-yellow-950/40 text-yellow-800 px-2 py-0.5 rounded-full">
              {activeOrders.filter(o => o.status === 'pending').length}
            </span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            <AnimatePresence mode="popLayout">
              {activeOrders.filter(o => o.status === 'pending').length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-10 bg-secondary/20 rounded-xl border border-dashed border-border/40">No pending orders</p>
              ) : (
                activeOrders.filter(o => o.status === 'pending').map(order => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="bg-card border border-border/20 rounded-xl p-4 shadow-sm hover:border-yellow-200 transition-all space-y-3"
                  >
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-mono font-bold text-muted-foreground">{order.id}</span>
                      <span className="font-semibold text-accent/80 bg-accent/5 px-2 py-0.5 rounded">
                        {order.type === 'dine-in' 
                          ? `Table ${order.tableNumber}` 
                          : order.type === 'delivery' 
                          ? 'Delivery' 
                          : 'Takeaway'}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-foreground space-y-1 pb-2 border-b border-border/10">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{it.menuItem.name}</span>
                          <span className="text-accent font-bold">x{it.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleStatusChange(order.id, 'cancelled')}
                          className="px-2.5 py-1 rounded bg-secondary text-[10px] text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleStatusChange(order.id, 'preparing')}
                          className="px-3 py-1 rounded bg-yellow-500 hover:bg-yellow-600 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          Start Cooking <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Column 2: In Preparation */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-950/20 px-4 py-3 rounded-2xl">
            <div className="flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Cooking / Preparing</span>
            </div>
            <span className="text-xs font-bold bg-blue-100 dark:bg-blue-950/40 text-blue-800 px-2 py-0.5 rounded-full">
              {activeOrders.filter(o => o.status === 'preparing').length}
            </span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            <AnimatePresence mode="popLayout">
              {activeOrders.filter(o => o.status === 'preparing').length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-10 bg-secondary/20 rounded-xl border border-dashed border-border/40">No orders in kitchen</p>
              ) : (
                activeOrders.filter(o => o.status === 'preparing').map(order => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-card border border-border/20 rounded-xl p-4 shadow-sm hover:border-blue-200 transition-all space-y-3"
                  >
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-mono font-bold text-muted-foreground">{order.id}</span>
                      <span className="font-semibold text-accent/80 bg-accent/5 px-2 py-0.5 rounded">
                        {order.type === 'dine-in' 
                          ? `Table ${order.tableNumber}` 
                          : order.type === 'delivery' 
                          ? 'Delivery' 
                          : 'Takeaway'}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-foreground space-y-1 pb-2 border-b border-border/10">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{it.menuItem.name}</span>
                          <span className="text-accent font-bold">x{it.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button
                        onClick={() => handleStatusChange(order.id, 'ready')}
                        className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        Mark Ready <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Column 3: Ready for Service & Delivery */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-purple-50/50 dark:bg-purple-950/10 border border-purple-100 dark:border-purple-950/20 px-4 py-3 rounded-2xl">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">Ready & Out for Delivery</span>
            </div>
            <span className="text-xs font-bold bg-purple-100 dark:bg-purple-950/40 text-purple-800 px-2 py-0.5 rounded-full">
              {activeOrders.filter(o => o.status === 'ready' || o.status === 'out-for-delivery').length}
            </span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            <AnimatePresence mode="popLayout">
              {activeOrders.filter(o => o.status === 'ready' || o.status === 'out-for-delivery').length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-10 bg-secondary/20 rounded-xl border border-dashed border-border/40">No orders ready</p>
              ) : (
                activeOrders.filter(o => o.status === 'ready' || o.status === 'out-for-delivery').map(order => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className={`bg-card border rounded-xl p-4 shadow-sm transition-all space-y-3 ${
                      order.status === 'out-for-delivery'
                        ? 'border-indigo-300 hover:border-indigo-400 bg-indigo-50/5 dark:bg-indigo-950/5'
                        : 'border-border/20 hover:border-purple-200'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-mono font-bold text-muted-foreground">{order.id}</span>
                      <span className="font-semibold text-accent/80 bg-accent/5 px-2 py-0.5 rounded">
                        {order.type === 'dine-in'
                          ? `Table ${order.tableNumber}`
                          : order.type === 'delivery'
                          ? 'Delivery'
                          : 'Takeaway'}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-foreground space-y-1 pb-2 border-b border-border/10">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{it.menuItem.name}</span>
                          <span className="text-accent font-bold">x{it.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {order.type === 'delivery' && (order.deliveryAddress || order.deliveryPhone) && (
                      <div className="text-[10px] text-muted-foreground bg-secondary/30 p-2 rounded-lg space-y-1 border border-border/10">
                        {order.deliveryAddress && (
                          <div className="flex items-start gap-1">
                            <span className="font-semibold shrink-0 text-foreground">Addr:</span>
                            <span className="line-clamp-2">{order.deliveryAddress}</span>
                          </div>
                        )}
                        {order.deliveryPhone && (
                          <div>
                            <span className="font-semibold text-foreground">Phone:</span> {order.deliveryPhone}
                          </div>
                        )}
                        {order.deliveryNotes && (
                          <div className="italic text-[9px] text-muted-foreground/80 mt-0.5">
                            "{order.deliveryNotes}"
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-1">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {order.type === 'delivery' ? (
                        order.status === 'ready' ? (
                          <button
                            onClick={() => handleStatusChange(order.id, 'out-for-delivery')}
                            className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            Dispatch <CheckCircle className="w-3 h-3" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(order.id, 'delivered')}
                            className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            Delivered <CheckCircle className="w-3 h-3" />
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() => handleStatusChange(order.id, 'delivered')}
                          className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          Serve / Deliver <CheckCircle className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* History List */}
      <div className="bg-card border border-border/20 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Package className="w-4 h-4" /> Served Order History (Recent Completed)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] text-left">
            <thead>
              <tr className="border-b border-border/20 text-muted-foreground uppercase font-bold tracking-wider">
                <th className="pb-3 pr-4">Order ID</th>
                <th className="pb-3 pr-4">Customer</th>
                <th className="pb-3 pr-4">Items</th>
                <th className="pb-3 pr-4">Type</th>
                <th className="pb-3 pr-4">Total</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {pastOrders.map(order => (
                <tr key={order.id} className="text-foreground hover:bg-secondary/20 transition-colors">
                  <td className="py-2.5 font-mono text-muted-foreground">{order.id}</td>
                  <td className="py-2.5 font-semibold">{order.customerName}</td>
                  <td className="py-2.5">{order.items.map(i => `${i.menuItem.name} x${i.quantity}`).join(', ')}</td>
                  <td className="py-2.5 font-medium">
                    {order.type === 'dine-in' 
                      ? `Dine-In (T-${order.tableNumber})` 
                      : order.type === 'delivery' 
                      ? 'Delivery' 
                      : 'Takeaway'}
                  </td>
                  <td className="py-2.5 text-accent font-bold">${order.total.toFixed(2)}</td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                      order.status === 'delivered' 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
              {pastOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-muted-foreground">No completed orders yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
