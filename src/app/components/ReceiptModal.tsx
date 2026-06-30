import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Printer, Receipt, CreditCard, Banknote, Wallet, UtensilsCrossed } from 'lucide-react';
import { Order } from '../lib/types';

interface ReceiptModalProps {
  order: Order | null;
  onClose: () => void;
}

export function ReceiptModal({ order, onClose }: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!order) return null;

  const items = (order.items || []).map((it: any) => ({
    name: it.name ?? it.menuItem?.name ?? 'Item',
    price: Number(it.price ?? it.menuItem?.price ?? 0),
    quantity: it.quantity ?? 1,
  }));

  const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const tax = subtotal * 0.13; // 13% VAT
  const deliveryFee = order.type === 'delivery' && subtotal < 30 ? 4.99 : 0;
  const total = subtotal + tax + deliveryFee;

  const paymentLabel =
    order.payment_method === 'card' ? 'Credit / Debit Card' :
    order.payment_method === 'digital-wallet' ? 'Digital Wallet' : 'Cash';

  const PaymentIcon =
    order.payment_method === 'card' ? CreditCard :
    order.payment_method === 'digital-wallet' ? Wallet : Banknote;

  const handlePrint = () => {
    if (!receiptRef.current) return;
    const printWindow = window.open('', '_blank', 'width=400,height=700');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
      <head>
        <title>Receipt - Order #${order.id.slice(0, 8)}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Courier New', monospace; padding: 20px; font-size: 12px; color: #1a1a1a; max-width: 320px; margin: 0 auto; }
          .logo { text-align: center; margin-bottom: 16px; border-bottom: 2px dashed #ccc; padding-bottom: 12px; }
          .logo h1 { font-size: 22px; letter-spacing: 3px; }
          .logo p { font-size: 9px; color: #888; margin-top: 4px; letter-spacing: 1px; }
          .info { margin: 12px 0; font-size: 11px; }
          .info div { display: flex; justify-content: space-between; margin: 3px 0; }
          .divider { border-top: 1px dashed #ccc; margin: 10px 0; }
          .items th, .items td { text-align: left; padding: 3px 0; font-size: 11px; }
          .items th:last-child, .items td:last-child { text-align: right; }
          .items { width: 100%; border-collapse: collapse; }
          .total-row { font-weight: bold; font-size: 14px; }
          .footer { text-align: center; margin-top: 16px; font-size: 9px; color: #999; border-top: 2px dashed #ccc; padding-top: 10px; }
          .badge { display: inline-block; background: #f0f0f0; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; }
          @media print { body { padding: 8px; } }
        </style>
      </head>
      <body>
        ${receiptRef.current.innerHTML}
        <script>window.onload = function() { window.print(); window.close(); }</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="bg-card border border-border/30 rounded-2xl w-full max-w-[420px] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border/20 bg-secondary/30">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-accent" />
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">Invoice / Receipt</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-accent/90 transition-all cursor-pointer"
              >
                <Printer className="w-3 h-3" /> Print
              </button>
              <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded-lg transition-colors cursor-pointer">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Receipt Body (used for printing) */}
          <div ref={receiptRef} className="p-5 space-y-4">
            {/* Restaurant Logo / Header */}
            <div className="logo text-center border-b-2 border-dashed border-border/30 pb-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <UtensilsCrossed className="w-5 h-5 text-accent" />
                <h1 className="font-display text-xl font-bold tracking-[0.15em] text-foreground">FLAVORÉ</h1>
              </div>
              <p className="text-[9px] text-muted-foreground tracking-widest uppercase">Fine Dining & Restaurant</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">123 Culinary Ave · Kathmandu, Nepal</p>
            </div>

            {/* Order Info */}
            <div className="info space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-mono font-bold text-foreground">#{order.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium text-foreground">{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium text-foreground">{new Date(order.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-semibold text-foreground uppercase text-[10px] bg-secondary px-2 py-0.5 rounded-md">{order.type}</span>
              </div>
              {order.table_number && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Table</span>
                  <span className="font-medium text-foreground">Table {order.table_number}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Payment</span>
                <span className="flex items-center gap-1 font-medium text-foreground">
                  <PaymentIcon className="w-3 h-3 text-accent" />
                  {paymentLabel}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="divider border-t border-dashed border-border/40" />

            {/* Items Table */}
            <table className="items w-full text-[11px]">
              <thead>
                <tr className="text-muted-foreground border-b border-border/20">
                  <th className="text-left py-1.5 font-semibold">Item</th>
                  <th className="text-center py-1.5 font-semibold w-10">Qty</th>
                  <th className="text-right py-1.5 font-semibold">Price</th>
                  <th className="text-right py-1.5 font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="border-b border-border/10">
                    <td className="py-1.5 font-medium text-foreground">{item.name}</td>
                    <td className="py-1.5 text-center text-muted-foreground">{item.quantity}</td>
                    <td className="py-1.5 text-right text-muted-foreground">${item.price.toFixed(2)}</td>
                    <td className="py-1.5 text-right font-medium text-foreground">${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Divider */}
            <div className="divider border-t border-dashed border-border/40" />

            {/* Totals */}
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-foreground">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (13% VAT)</span>
                <span className="font-medium text-foreground">${tax.toFixed(2)}</span>
              </div>
              {deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="font-medium text-foreground">${deliveryFee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-dashed border-border/40">
                <span className="font-bold text-foreground text-sm">Grand Total</span>
                <span className="font-bold text-accent text-lg">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Status */}
            <div className="text-center pt-2">
              <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                order.payment_status === 'paid'
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                  : 'bg-amber-50 text-amber-600 border-amber-200'
              }`}>
                {order.payment_status === 'paid' ? '✓ Paid' : '⏳ Payment Pending'}
              </span>
            </div>

            {/* Footer */}
            <div className="footer text-center border-t-2 border-dashed border-border/30 pt-3 mt-2">
              <p className="text-[9px] text-muted-foreground tracking-wide">Thank you for dining with us!</p>
              <p className="text-[8px] text-muted-foreground mt-1">www.flavore.com · +977-01-1234567</p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
