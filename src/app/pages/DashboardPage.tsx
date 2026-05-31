import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { mockDb, Order, UserProfile } from '../utils/mockDb';
import { FloatingFood3D } from '../components/FloatingFood3D';

interface DashboardPageProps {
  currentUser: UserProfile | null;
}

export function DashboardPage({ currentUser }: DashboardPageProps) {
  const [userOrders, setUserOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (currentUser) {
      // Fetch user's orders
      const allOrders = mockDb.getOrders();
      const filtered = allOrders.filter(o => o.customerEmail.toLowerCase() === currentUser.email.toLowerCase());
      setUserOrders(filtered);
    } else {
      setUserOrders([]);
    }
  }, [currentUser]);

  // Poll orders database to show real time updates on the frontend status
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
      const allOrders = mockDb.getOrders();
      const filtered = allOrders.filter(o => o.customerEmail.toLowerCase() === currentUser.email.toLowerCase());
      setUserOrders(filtered);
    }, 3000);
    return () => clearInterval(interval);
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background pb-12 pt-[72px] flex items-center justify-center">
        <div className="text-center p-8 bg-card border border-border/20 rounded-2xl shadow-sm max-w-md w-full">
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">User Dashboard</h2>
          <p className="text-xs text-muted-foreground">Please sign in to view your orders and dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12 pt-[72px] relative overflow-hidden">
      {/* Background 3D Elements */}
      <FloatingFood3D
        src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600"
        size={200}
        className="absolute -right-16 top-40 opacity-30 hidden lg:block"
        initialRotation={{ x: 10, y: 30, z: -5 }}
      />
      <FloatingFood3D
        src="https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=600"
        size={160}
        className="absolute -left-10 bottom-40 opacity-30 hidden lg:block"
        initialRotation={{ x: 30, y: -10, z: 15 }}
      />

      {/* ── Order Status Tracker ── */}
      <section id="order-tracking-section" className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <span className="text-accent text-xs font-bold uppercase tracking-[0.2em] mb-2 block">Track Progress</span>
          <h2 className="font-display text-3xl font-bold text-foreground">Your Orders</h2>
          <div className="w-12 h-0.5 bg-accent/40 mx-auto mt-4" />
        </div>

        {userOrders.length === 0 ? (
          <div className="text-center p-8 bg-card border border-border/20 rounded-2xl shadow-sm">
            <p className="text-sm text-muted-foreground">You don't have any active or past orders yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userOrders.map((order) => (
              <div 
                key={order.id} 
                className="bg-card border border-border/20 rounded-2xl overflow-hidden p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-accent/15 transition-all duration-300"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground font-mono">ID: {order.id}</span>
                    <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full ${
                      order.status === 'pending' ? 'bg-yellow-50 text-yellow-600 border border-yellow-200' :
                      order.status === 'preparing' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                      order.status === 'ready' ? 'bg-purple-50 text-purple-600 border border-purple-200' :
                      order.status === 'delivered' ? 'bg-green-50 text-green-600 border border-green-200' :
                      'bg-red-50 text-red-600 border border-red-200'
                    }`}>
                      {order.status}
                    </span>
                    <span className="text-[10px] font-semibold text-accent/80 bg-accent/5 px-2 rounded">
                      {order.type === 'dine-in' ? `Table ${order.tableNumber}` : 'Takeaway'}
                    </span>
                  </div>

                  <div className="text-xs text-foreground">
                    <span className="font-bold">Ordered: </span>
                    {order.items.map(item => `${item.menuItem.name} x${item.quantity}`).join(', ')}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Total: ${order.total.toFixed(2)}
                  </div>
                </div>

                {/* Progress bar visual */}
                <div className="flex flex-col items-end justify-center w-full md:w-60 space-y-1">
                  <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-700 ${
                        order.status === 'pending' ? 'w-1/4 bg-yellow-400' :
                        order.status === 'preparing' ? 'w-2/4 bg-blue-400' :
                        order.status === 'ready' ? 'w-3/4 bg-purple-400' :
                        order.status === 'delivered' ? 'w-full bg-green-500' :
                        'w-full bg-destructive'
                      }`}
                    />
                  </div>
                  <div className="text-[9px] text-muted-foreground font-semibold flex justify-between w-full">
                    <span>Placed</span>
                    <span>Preparing</span>
                    <span>Ready</span>
                    <span>Done</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
