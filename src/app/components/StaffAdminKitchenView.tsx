import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChefHat,
  Clock,
  AlertCircle,
  CheckCircle,
  Package,
  ArrowRight,
  XCircle,
} from 'lucide-react';
import { mockDb, Order, OrderStatus } from '../utils/mockDb';

type KitchenCardMode = 'staff' | 'admin';

const STATUS_PILL: Record<OrderStatus, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  preparing: 'bg-blue-50 text-blue-700 border border-blue-200',
  ready: 'bg-purple-50 text-purple-700 border border-purple-200',
  'out-for-delivery': 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  delivered: 'bg-green-50 text-green-700 border border-green-200',
  cancelled: 'bg-red-50 text-red-700 border border-red-200',
};

function StatusPill({ status }: { status: OrderStatus }) {
  return (
    <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${STATUS_PILL[status]}`}>
      {status.replace(/-/g, ' ')}
    </span>
  );
}

const stepsForProgress: OrderStatus[] = ['pending', 'preparing', 'ready', 'out-for-delivery'];

function getProgressWidth(status: OrderStatus) {
  const idx = stepsForProgress.indexOf(status);
  if (idx === -1) return '25%';
  const pct = (idx + 1) * 25;
  return `${pct}%`;
}

function getDisplayType(order: Order) {
  if (order.type === 'dine-in') return `Table ${order.tableNumber}`;
  if (order.type === 'delivery') return 'Delivery';
  return 'Takeaway';
}

function getStaffNext(order: Order): OrderStatus | null {
  if (order.status === 'delivered' || order.status === 'cancelled') return null;
  if (order.status === 'pending') return 'preparing';
  if (order.status === 'preparing') return 'ready';
  if (order.status === 'ready') return order.type === 'delivery' ? 'out-for-delivery' : 'delivered';
  if (order.status === 'out-for-delivery') return 'delivered';
  return null;
}

function KitchenOrderCard({
  order,
  mode,
  onAdvance,
  onDecline,
}: {
  order: Order;
  mode: KitchenCardMode;
  onAdvance: (next: OrderStatus) => void;
  onDecline: () => void;
}) {
  const displayType = getDisplayType(order);
  const nextStaff = getStaffNext(order);

  const canAdvance = mode === 'staff' ? !!nextStaff : false;

  const primaryLabel = (() => {
    if (mode === 'staff') {
      if (!nextStaff) return 'Done';
      if (order.status === 'pending') return 'Start Cooking';
      if (order.status === 'preparing') return 'Mark Ready';
      if (order.status === 'ready' && order.type === 'delivery') return 'Dispatch';
      if (order.status === 'ready') return 'Serve';
      if (order.status === 'out-for-delivery') return 'Delivered';
      return 'Next';
    }
    return '—';
  })();

  const primaryStyle = (() => {
    if (!canAdvance) return 'bg-secondary';
    const next = nextStaff as OrderStatus | null;
    switch (next) {
      case 'preparing':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      case 'ready':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'out-for-delivery':
        return 'bg-indigo-600 hover:bg-indigo-700 text-white';
      case 'delivered':
        return 'bg-green-600 hover:bg-green-700 text-white';
      default:
        return 'bg-secondary';
    }
  })();

  const canDecline = mode === 'admin' && order.status !== 'delivered' && order.status !== 'cancelled';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="bg-card border border-border/20 rounded-2xl p-4 shadow-sm hover:border-accent/20 transition-all space-y-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono font-bold text-muted-foreground text-[11px]">{order.id}</span>
            <StatusPill status={order.status} />
          </div>
          <div className="text-[11px] text-muted-foreground mt-1 font-semibold">{displayType}</div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      <div className="text-[11px] font-semibold text-foreground/95 space-y-1">
        {order.items.map((it, idx) => (
          <div key={idx} className="flex justify-between">
            <span className="text-muted-foreground">{it.menuItem.name}</span>
            <span className="text-accent font-bold">x{it.quantity}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <ChefHat className="w-3 h-3 text-accent/90" />
          <span className="font-bold">{mode === 'admin' ? 'Admin Queue' : 'Kitchen Queue'}</span>
        </div>

        <div className="flex items-center gap-2">
          {mode === 'admin' && canDecline && (
            <button
              onClick={onDecline}
              className="px-3 py-1.5 rounded-xl text-[10px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer bg-secondary hover:bg-red-50 hover:text-red-600 border border-red-200/60"
              title="Decline / Cancel order"
            >
              Decline <XCircle className="w-3 h-3" />
            </button>
          )}

          <button
            onClick={() => {
              if (!canAdvance) return;
              if (mode === 'staff' && nextStaff) onAdvance(nextStaff);
            }}
            disabled={!canAdvance}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer ${primaryStyle} disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {primaryLabel} <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="pt-1">
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{ width: getProgressWidth(order.status) }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export function StaffAdminKitchenView({ mode }: { mode: KitchenCardMode }) {
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = () => setOrders(mockDb.getOrders());

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = (orderId: string, nextStatus: OrderStatus) => {
    mockDb.updateOrderStatus(orderId, nextStatus);
    fetchOrders();
  };

  const activeOrders = useMemo(
    () => orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled'),
    [orders]
  );

  const pastOrders = useMemo(
    () => orders.filter((o) => o.status === 'delivered' || o.status === 'cancelled').slice(0, 10),
    [orders]
  );

  const columns: { key: OrderStatus | 'ready-or-dispatch'; title: string; bg: string; count: number }[] = [
    {
      key: 'pending',
      title: 'New Orders',
      bg: 'bg-yellow-50/40 dark:bg-yellow-950/10 border-yellow-100/70 dark:border-yellow-950/30',
      count: activeOrders.filter((o) => o.status === 'pending').length,
    },
    {
      key: 'preparing',
      title: 'Cooking',
      bg: 'bg-blue-50/40 dark:bg-blue-950/10 border-blue-100/70 dark:border-blue-950/30',
      count: activeOrders.filter((o) => o.status === 'preparing').length,
    },
    {
      key: 'ready-or-dispatch',
      title: 'Ready / Dispatch',
      bg: 'bg-purple-50/40 dark:bg-purple-950/10 border-purple-100/70 dark:border-purple-950/30',
      count: activeOrders.filter((o) => o.status === 'ready' || o.status === 'out-for-delivery').length,
    },
  ];

  const getColumnOrders = (colKey: typeof columns[number]['key']) => {
    if (colKey === 'pending') return activeOrders.filter((o) => o.status === 'pending');
    if (colKey === 'preparing') return activeOrders.filter((o) => o.status === 'preparing');
    return activeOrders.filter((o) => o.status === 'ready' || o.status === 'out-for-delivery');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-6 lg:px-10 py-6">
      <div className="flex items-start justify-between gap-4 border-b border-border/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              {mode === 'admin' ? 'Admin Kitchen Control' : 'Staff Kitchen Monitor'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {mode === 'admin'
                ? 'View order status and decline when needed.'
                : 'Advance orders through the kitchen workflow.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Live</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {columns.map((col) => {
          const list = getColumnOrders(col.key);
          return (
            <div key={col.key} className="space-y-4">
              <div className={`flex items-center justify-between px-4 py-3 rounded-2xl border ${col.bg}`}>
                <div className="flex items-center gap-2">
                  {col.key === 'pending' ? (
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                  ) : col.key === 'preparing' ? (
                    <ChefHat className="w-4 h-4 text-blue-600" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                  )}
                  <span className="text-xs font-bold uppercase tracking-wide text-foreground/90">{col.title}</span>
                </div>
                <span className="text-xs font-bold bg-card/60 text-foreground px-2 py-0.5 rounded-full border border-border/20">
                  {col.count}
                </span>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                <AnimatePresence mode="popLayout">
                  {list.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-10 bg-secondary/20 rounded-xl border border-dashed border-border/40">
                      No orders
                    </p>
                  ) : (
                    list.map((order) => (
                      <KitchenOrderCard
                        key={order.id}
                        order={order}
                        mode={mode}
                        onAdvance={(next) => handleStatusChange(order.id, next)}
                        onDecline={() => handleStatusChange(order.id, 'cancelled')}
                      />
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

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
              {pastOrders.map((order) => (
                <tr key={order.id} className="text-foreground hover:bg-secondary/20 transition-colors">
                  <td className="py-2.5 font-mono text-muted-foreground">{order.id}</td>
                  <td className="py-2.5 font-semibold">{order.customerName}</td>
                  <td className="py-2.5">
                    {order.items.map((i) => `${i.menuItem.name} x${i.quantity}`).join(', ')}
                  </td>
                  <td className="py-2.5 font-medium">
                    {order.type === 'dine-in'
                      ? `Dine-In (T-${order.tableNumber})`
                      : order.type === 'delivery'
                        ? 'Delivery'
                        : 'Takeaway'}
                  </td>
                  <td className="py-2.5 text-accent font-bold">${order.total.toFixed(2)}</td>
                  <td className="py-2.5">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                        order.status === 'delivered'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
              {pastOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-muted-foreground">
                    No completed orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

