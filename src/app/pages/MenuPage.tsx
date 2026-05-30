import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, ShoppingCart, Plus, Minus, Trash2, CheckCircle2 
} from 'lucide-react';
import { mockDb, MenuItem, Order, UserProfile } from '../utils/mockDb';

interface MenuPageProps {
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
}

export function MenuPage({ currentUser, onOpenAuth }: MenuPageProps) {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [cart, setCart] = useState<{ menuItem: MenuItem; quantity: number }[]>(mockDb.getCart());

  useEffect(() => {
    mockDb.setCart(cart);
  }, [cart]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway'>('dine-in');
  const [tableNumber, setTableNumber] = useState('');
  const [orderSuccess, setOrderSuccess] = useState<Order | null>(null);

  useEffect(() => {
    setMenu(mockDb.getMenu());
  }, []);

  const categories = ['All', 'Starters', 'Mains', 'Desserts', 'Beverages'];

  const filteredMenu = activeCategory === 'All' 
    ? menu 
    : menu.filter(item => item.category === activeCategory);

  const addToCart = (item: MenuItem) => {
    if (!item.is_available) return;
    setCart(prev => {
      const existing = prev.find(i => i.menuItem.id === item.id);
      if (existing) {
        return prev.map(i => i.menuItem.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => {
      return prev.map(i => {
        if (i.menuItem.id === itemId) {
          const nextQty = i.quantity + delta;
          return nextQty > 0 ? { ...i, quantity: nextQty } : null;
        }
        return i;
      }).filter((i): i is { menuItem: MenuItem; quantity: number } => i !== null);
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (cart.length === 0) return;
    if (orderType === 'dine-in' && !tableNumber) {
      alert('Please enter a table number for Dine-In orders.');
      return;
    }

    const order = mockDb.placeOrder({
      customerName: currentUser.fullName,
      customerEmail: currentUser.email,
      items: cart,
      total: cartTotal,
      type: orderType,
      tableNumber: orderType === 'dine-in' ? tableNumber : undefined
    });

    setOrderSuccess(order);
    setCart([]);
    setIsCartOpen(false);
  };

  return (
    <div className="pt-[72px] min-h-screen pb-12">
      
      {/* ── Menu Section ── */}
      <section id="menu-section" className="py-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-accent text-xs font-bold uppercase tracking-[0.2em] mb-2 block">Our Curated Selection</span>
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground">Explore Gourmet Delicacies</h1>
            <div className="w-12 h-0.5 bg-accent/40 mx-auto mt-4" />
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-accent text-white shadow-md shadow-accent/20'
                    : 'bg-white hover:bg-secondary border border-border/30 text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Menu Items Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredMenu.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  className="bg-card border border-border/20 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md hover:border-accent/20 transition-all duration-300 group"
                >
                  <div>
                    {/* Item Image */}
                    <div className="h-44 w-full overflow-hidden relative bg-secondary">
                      <img 
                        src={item.image_url} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      {!item.is_available && (
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="text-[10px] uppercase font-bold tracking-widest bg-destructive/10 text-destructive px-3 py-1 rounded-full border border-destructive/20">
                            Sold Out
                          </span>
                        </div>
                      )}
                      <span className="absolute top-3 right-3 text-xs font-bold text-accent bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h4 className="font-semibold text-foreground text-sm group-hover:text-accent transition-colors mb-1">{item.name}</h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3">{item.description}</p>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <button
                      onClick={() => addToCart(item)}
                      disabled={!item.is_available}
                      className="w-full py-2 bg-secondary group-hover:bg-accent group-hover:text-white rounded-xl text-[11px] font-semibold text-foreground flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add to Order
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="fixed bottom-8 right-8 z-40"
        >
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setIsCartOpen(true)}
            className="bg-accent text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold shadow-lg cursor-pointer hover:shadow-xl transition-all relative"
          >
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 bg-foreground text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cart.reduce((sum, i) => sum + i.quantity, 0)}
            </span>
          </motion.button>
        </motion.div>
      )}

      {/* ── Cart Drawer / Overlay ── */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-foreground/30 backdrop-blur-[2px] z-[90]"
            />

            {/* Cart Drawer */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-[420px] bg-card border-l border-border/20 shadow-2xl z-[95] overflow-y-auto flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-border/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-accent" />
                  <h3 className="font-display text-lg font-bold text-foreground">Your Order Summary</h3>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)} 
                  className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground space-y-3">
                    <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto text-muted-foreground/60">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Your cart is empty</p>
                      <p className="text-[10px] mt-1 text-muted-foreground/80">Add delicious gourmet meals from our menu.</p>
                    </div>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.menuItem.id} className="flex gap-4 border-b border-border/10 pb-4 justify-between items-start">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-secondary shrink-0">
                        <img src={item.menuItem.image_url} alt={item.menuItem.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="text-xs font-semibold text-foreground line-clamp-1">{item.menuItem.name}</h4>
                        <div className="text-[10px] text-accent font-bold">${item.menuItem.price.toFixed(2)} each</div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 pt-1">
                          <button 
                            onClick={() => updateQuantity(item.menuItem.id, -1)}
                            className="w-5 h-5 flex items-center justify-center border border-border/40 hover:border-accent hover:text-accent rounded transition-colors text-[10px] cursor-pointer"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold text-foreground w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.menuItem.id, 1)}
                            className="w-5 h-5 flex items-center justify-center border border-border/40 hover:border-accent hover:text-accent rounded transition-colors text-[10px] cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="text-right flex flex-col justify-between items-end h-16">
                        <span className="text-xs font-bold text-foreground">${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                        <button 
                          onClick={() => updateQuantity(item.menuItem.id, -item.quantity)}
                          className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Checkout Panel */}
              {cart.length > 0 && (
                <div className="p-6 border-t border-border/20 bg-secondary/20 space-y-4">
                  <div className="flex justify-between items-center text-sm font-bold text-foreground">
                    <span>Total Amount</span>
                    <span className="text-lg text-accent">${cartTotal.toFixed(2)}</span>
                  </div>

                  {!currentUser ? (
                    <button
                      onClick={onOpenAuth}
                      className="w-full py-2.5 rounded-xl bg-accent text-white text-xs font-bold uppercase tracking-wider hover:shadow-lg transition-all cursor-pointer"
                    >
                      Login to Place Order
                    </button>
                  ) : (
                    <form onSubmit={handlePlaceOrder} className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-foreground/80 mb-1 uppercase tracking-wider">Order Type</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setOrderType('dine-in')}
                            className={`py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase border transition-all ${
                              orderType === 'dine-in' 
                                ? 'bg-accent/10 border-accent/40 text-accent' 
                                : 'bg-card border-border/30 text-muted-foreground'
                            }`}
                          >
                            Dine-In
                          </button>
                          <button
                            type="button"
                            onClick={() => setOrderType('takeaway')}
                            className={`py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase border transition-all ${
                              orderType === 'takeaway' 
                                ? 'bg-accent/10 border-accent/40 text-accent' 
                                : 'bg-card border-border/30 text-muted-foreground'
                            }`}
                          >
                            Takeaway
                          </button>
                        </div>
                      </div>

                      {orderType === 'dine-in' && (
                        <div>
                          <label className="block text-[10px] font-bold text-foreground/80 mb-1 uppercase tracking-wider">Table Number</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. 5"
                            value={tableNumber} 
                            onChange={e => setTableNumber(e.target.value)} 
                            className="w-full px-3 py-1.5 rounded-lg bg-card border border-border/35 text-xs focus:outline-none focus:border-accent"
                          />
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-accent text-white text-xs font-bold uppercase tracking-wider hover:shadow-lg hover:bg-accent/90 transition-all cursor-pointer"
                      >
                        Place Order (${cartTotal.toFixed(2)})
                      </button>
                    </form>
                  )}
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Success Notification Modal for Orders */}
      <AnimatePresence>
        {orderSuccess && (
          <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-card border border-border/30 rounded-2xl w-full max-w-[380px] p-6 text-center shadow-2xl space-y-4"
            >
              <div className="w-14 h-14 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">Order Successfully Placed</h3>
                <p className="text-xs text-muted-foreground mt-1">Thank you! Your order has been sent to the kitchen.</p>
              </div>
              <div className="bg-secondary/70 rounded-xl p-4 text-left text-xs space-y-1.5 border border-border/20">
                <div className="flex justify-between"><span className="text-muted-foreground">Order ID:</span> <span className="font-mono font-bold text-foreground">{orderSuccess.id}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Type:</span> <span className="font-semibold text-foreground uppercase">{orderSuccess.type}</span></div>
                {orderSuccess.tableNumber && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Table:</span> <span className="font-semibold text-foreground">Table {orderSuccess.tableNumber}</span></div>
                )}
                <div className="flex justify-between"><span className="text-muted-foreground">Amount:</span> <span className="font-bold text-accent">${orderSuccess.total.toFixed(2)}</span></div>
              </div>
              <button
                onClick={() => setOrderSuccess(null)}
                className="w-full py-2 bg-accent text-white text-xs font-semibold rounded-xl hover:shadow-md transition-all cursor-pointer"
              >
                Close / Keep Browsing
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
