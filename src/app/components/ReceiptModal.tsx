import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CreditCard, Banknote, Wallet, UtensilsCrossed, ArrowLeft, Download } from 'lucide-react';
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

  // Prices already include all taxes — no extra VAT calculation
  const grandTotal =
    Number(order.total) || items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const deliveryFee =
    order.type === 'delivery' ? Number((order as any).delivery_fee) || 0 : 0;

  const paymentLabel =
    order.payment_method === 'card'
      ? 'Credit / Debit Card'
      : order.payment_method === 'digital-wallet'
      ? 'Digital Wallet'
      : 'Cash';

  const PaymentIcon =
    order.payment_method === 'card'
      ? CreditCard
      : order.payment_method === 'digital-wallet'
      ? Wallet
      : Banknote;

  const handleDownload = () => {
    const itemRows = items
      .map(
        (item) => `
      <tr>
        <td style="padding:5px 0;font-weight:500">${item.name}</td>
        <td style="padding:5px 0;text-align:center;color:#888">${item.quantity}</td>
        <td style="padding:5px 0;text-align:right;color:#888">Rs. ${item.price.toFixed(2)}</td>
        <td style="padding:5px 0;text-align:right;font-weight:600">Rs. ${(item.price * item.quantity).toFixed(2)}</td>
      </tr>`
      )
      .join('');

    const printHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Receipt – Order #${order.id.slice(0, 8).toUpperCase()}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Courier New', monospace; padding: 24px; font-size: 12px; color: #1a1a1a; max-width: 360px; margin: 0 auto; background: #fff; }
    .action-bar { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 20px; padding: 10px 14px; background: #f5f5f5; border-radius: 10px; }
    .btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 16px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; border: none; letter-spacing: 0.03em; }
    .btn-back { background: #e0e0e0; color: #333; }
    .btn-print { background: #c8923a; color: #fff; }
    .logo { text-align: center; margin-bottom: 16px; border-bottom: 2px dashed #ddd; padding-bottom: 14px; }
    .logo h1 { font-size: 24px; letter-spacing: 4px; font-family: Georgia, serif; }
    .logo p { font-size: 9px; color: #999; margin-top: 4px; letter-spacing: 1.5px; text-transform: uppercase; }
    .info-row { display: flex; justify-content: space-between; margin: 4px 0; font-size: 11px; }
    .info-row .label { color: #888; }
    .info-row .value { font-weight: 600; }
    .divider { border-top: 1px dashed #ccc; margin: 12px 0; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; font-size: 10px; color: #999; padding-bottom: 6px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    th:nth-child(2) { text-align: center; }
    th:nth-child(3), th:nth-child(4) { text-align: right; }
    .grand-total { display: flex; justify-content: space-between; align-items: center; margin-top: 14px; padding-top: 10px; border-top: 2px dashed #ccc; }
    .grand-total .label { font-size: 14px; font-weight: 700; }
    .grand-total .value { font-size: 18px; font-weight: 700; color: #c8923a; }
    .note { font-size: 9px; color: #aaa; text-align: right; margin-top: 4px; }
    .footer { text-align: center; margin-top: 18px; font-size: 9px; color: #aaa; border-top: 2px dashed #ddd; padding-top: 12px; }
    @media print { .action-bar { display: none !important; } }
  </style>
</head>
<body>
  <div class="action-bar">
    <button class="btn btn-back" onclick="window.close()">&#8592; Back to Page</button>
    <button class="btn btn-print" onclick="window.print()">&#11015; Download / Print PDF</button>
  </div>

  <div class="logo">
    <h1>FLAVORÉ</h1>
    <p>Fine Dining &amp; Restaurant</p>
    <p style="margin-top:2px">123 Culinary Ave · Kathmandu, Nepal</p>
  </div>

  <div class="info-row"><span class="label">Order ID</span><span class="value" style="font-family:monospace">#${order.id.slice(0, 8).toUpperCase()}</span></div>
  <div class="info-row"><span class="label">Date</span><span class="value">${new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span></div>
  <div class="info-row"><span class="label">Time</span><span class="value">${new Date(order.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span></div>
  <div class="info-row"><span class="label">Type</span><span class="value">${order.type}</span></div>
  ${order.table_number ? `<div class="info-row"><span class="label">Table</span><span class="value">Table ${order.table_number}</span></div>` : ''}
  <div class="info-row"><span class="label">Payment</span><span class="value">${paymentLabel}</span></div>

  <div class="divider"></div>

  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th style="text-align:center">Qty</th>
        <th style="text-align:right">Price</th>
        <th style="text-align:right">Total</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

  ${deliveryFee > 0 ? `<div class="info-row" style="margin-top:10px"><span class="label">Delivery Fee</span><span class="value">Rs. ${deliveryFee.toFixed(2)}</span></div>` : ''}

  <div class="grand-total">
    <span class="label">Grand Total</span>
    <span class="value">Rs. ${grandTotal.toFixed(2)}</span>
  </div>
  <p class="note">All prices inclusive of applicable taxes</p>

  <div class="footer">
    <p>Thank you for dining with us!</p>
    <p style="margin-top:4px">www.flavore.com · +977-01-1234567</p>
  </div>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=440,height=720,scrollbars=yes');
    if (!win) {
      alert('Please allow pop-ups to view the bill.');
      return;
    }
    win.document.open();
    win.document.write(printHtml);
    win.document.close();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="bg-card border border-border/30 rounded-2xl w-full max-w-[420px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border/20 bg-secondary/30 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="flex items-center gap-1 px-2.5 py-1 bg-secondary hover:bg-border/30 text-foreground text-xs font-semibold rounded-lg transition-all cursor-pointer border border-border/30"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <span className="text-xs font-bold uppercase tracking-wider text-foreground hidden sm:inline">
                Invoice / Receipt
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-accent/90 transition-all cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5" /> Download Bill
              </button>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-secondary rounded-lg transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* ── Receipt Body ── */}
          <div ref={receiptRef} className="p-5 space-y-4 overflow-y-auto">
            {/* Restaurant Header */}
            <div className="text-center border-b-2 border-dashed border-border/30 pb-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <UtensilsCrossed className="w-5 h-5 text-accent" />
                <h1 className="font-display text-xl font-bold tracking-[0.15em] text-foreground">
                  FLAVORÉ
                </h1>
              </div>
              <p className="text-[9px] text-muted-foreground tracking-widest uppercase">
                Fine Dining &amp; Restaurant
              </p>
              <p className="text-[9px] text-muted-foreground mt-0.5">
                123 Culinary Ave · Kathmandu, Nepal
              </p>
            </div>

            {/* Order Info */}
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-mono font-bold text-foreground">
                  #{order.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium text-foreground">
                  {new Date(order.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium text-foreground">
                  {new Date(order.created_at).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-semibold text-foreground uppercase text-[10px] bg-secondary px-2 py-0.5 rounded-md">
                  {order.type}
                </span>
              </div>
              {order.table_number && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Table</span>
                  <span className="font-medium text-foreground">
                    Table {order.table_number}
                  </span>
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

            <div className="border-t border-dashed border-border/40" />

            {/* Items Table */}
            <table className="w-full text-[11px]">
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
                    <td className="py-1.5 text-right text-muted-foreground">
                      Rs. {item.price.toFixed(2)}
                    </td>
                    <td className="py-1.5 text-right font-medium text-foreground">
                      Rs. {(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Grand Total */}
            <div className="space-y-1.5 text-[11px]">
              {deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="font-medium text-foreground">
                    Rs. {deliveryFee.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t-2 border-dashed border-border/40">
                <span className="font-bold text-foreground text-sm">Grand Total</span>
                <span className="font-bold text-accent text-lg">
                  Rs. {grandTotal.toFixed(2)}
                </span>
              </div>
              <p className="text-[9px] text-muted-foreground text-right">
                All prices inclusive of applicable taxes
              </p>
            </div>

            {/* Payment Status */}
            <div className="text-center pt-1">
              <span
                className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                  order.payment_status === 'paid'
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    : 'bg-amber-50 text-amber-600 border-amber-200'
                }`}
              >
                {order.payment_status === 'paid' ? '✓ Paid' : '⏳ Payment Pending'}
              </span>
            </div>

            {/* Footer with action buttons */}
            <div className="text-center border-t-2 border-dashed border-border/30 pt-3 mt-2 space-y-3">
              <p className="text-[9px] text-muted-foreground tracking-wide">
                Thank you for dining with us!
              </p>
              <p className="text-[8px] text-muted-foreground">
                www.flavore.com · +977-01-1234567
              </p>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-2 bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold rounded-xl border border-border/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
                </button>
                <button
                  onClick={handleDownload}
                  className="flex-1 py-2 bg-accent hover:bg-accent/90 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download Bill
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
