import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, ShoppingCart, Plus, Minus, Trash2, CheckCircle2,
  Truck, UtensilsCrossed, PackageOpen, MapPin, Phone, MessageSquare, Clock,
  CreditCard, Banknote, Wallet, Receipt, Star, Search, X
} from 'lucide-react';
import { db } from '../lib/supabaseDb';
import { MenuItem, Order, UserProfile } from '../lib/types';
import { ReceiptModal } from '../components/ReceiptModal';
import { ReviewModal } from '../components/ReviewModal';
import { useLocation } from 'react-router-dom';

interface MenuPageProps {
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
}

const DELIVERY_FEE = 4.99;

export function MenuPage({ currentUser, onOpenAuth }: MenuPageProps) {
  const location = useLocation();
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<{ menuItem: MenuItem; quantity: number }[]>(db.getCart());
  const [ratings, setRatings] = useState<Record<string, { avg: number; count: number }>>({});
  const [reviewItem, setReviewItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    db.setCart(cart);
  }, [cart]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Initialize with URL param if it exists
  const initialTable = new URLSearchParams(location.search).get('table') || '';
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway' | 'delivery'>(initialTable ? 'dine-in' : 'dine-in');
  const [tableNumber, setTableNumber] = useState(initialTable);
  const [orderSuccess, setOrderSuccess] = useState<Order | null>(null);

  // Delivery form fields
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'digital-wallet'>('cash');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  // Discounts & Loyalty
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; type: 'percent' | 'flat'; value: number } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [pointsToRedeem, setPointsToRedeem] = useState(0);

  const fetchMenuAndRatings = async () => {
    setMenuLoading(true);
    try {
      const [menuData, reviewsData] = await Promise.all([
        db.getMenu(),
        db.getAllReviews()
      ]);
      setMenu(menuData);
      
      const ratingMap: Record<string, { avg: number; count: number; total: number }> = {};
      reviewsData.forEach(r => {
        if (!ratingMap[r.menu_item_id]) {
          ratingMap[r.menu_item_id] = { avg: 0, count: 0, total: 0 };
        }
        ratingMap[r.menu_item_id].count += 1;
        ratingMap[r.menu_item_id].total += r.rating;
      });

      const finalRatings: Record<string, { avg: number; count: number }> = {};
      Object.keys(ratingMap).forEach(id => {
        finalRatings[id] = {
          avg: ratingMap[id].total / ratingMap[id].count,
          count: ratingMap[id].count
        };
      });
      setRatings(finalRatings);
    } catch (e) {
      console.error('Error fetching menu items:', e);
    } finally {
      setMenuLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuAndRatings();
  }, []);

  const categories = ['All', 'Starters', 'Mains', 'Desserts', 'Beverages'];

  const filteredMenu = menu.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query ||
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const addToCart = (item: MenuItem) => {
    if (!item.is_available) return;
    setCart(prev => {
      const existing = prev.find(i => i.menuItem.id === item.id);
      if (existing) {
        return prev.map(i => i.menuItem.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const addCategoryToCart = () => {
    const availableItems = filteredMenu.filter(item => item.is_available);
    if (availableItems.length === 0) return;
    
    setCart(prev => {
      let updated = [...prev];
      availableItems.forEach(item => {
        const existingIdx = updated.findIndex(i => i.menuItem.id === item.id);
        if (existingIdx >= 0) {
          updated[existingIdx] = { ...updated[existingIdx], quantity: updated[existingIdx].quantity + 1 };
        } else {
          updated.push({ menuItem: item, quantity: 1 });
        }
      });
      return updated;
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

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
  const deliveryFee = orderType === 'delivery' && cartSubtotal < 30 ? DELIVERY_FEE : 0;
  
  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === 'percent') {
      discountAmount = cartSubtotal * (appliedPromo.value / 100);
    } else {
      discountAmount = appliedPromo.value;
    }
  }
  // 100 points = Rs. 1
  const loyaltyDiscount = pointsToRedeem / 100;
  discountAmount += loyaltyDiscount;
  discountAmount = Math.min(discountAmount, cartSubtotal); // Cannot discount more than subtotal
  
  const cartTotal = cartSubtotal + deliveryFee - discountAmount;

  const handleApplyPromo = async () => {
    setPromoError('');
    if (!promoCodeInput.trim()) return;
    const promo = await db.validatePromoCode(promoCodeInput.trim());
    if (promo) {
      setAppliedPromo(promo);
      setPromoCodeInput('');
    } else {
      setPromoError('Invalid or expired promo code');
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
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
    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      alert('Please enter a delivery address.');
      return;
    }
    if (orderType === 'delivery' && !deliveryPhone.trim()) {
      alert('Please enter a contact phone number for delivery.');
      return;
    }

    try {
      const order = await db.placeOrder({
        customerName: currentUser.fullName,
        customerEmail: currentUser.email,
        items: cart,
        total: cartTotal,
        type: orderType,
        tableNumber: orderType === 'dine-in' ? tableNumber : undefined,
        deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined,
        deliveryPhone: orderType === 'delivery' ? deliveryPhone : undefined,
        deliveryNotes: orderType === 'delivery' ? deliveryNotes : undefined,
        paymentMethod: paymentMethod,
        discountAmount: discountAmount,
        promoCode: appliedPromo?.code,
        pointsRedeemed: pointsToRedeem
      });

      if (order) {
        setOrderSuccess(order);
        setCart([]);
        setIsCartOpen(false);
        setDeliveryAddress('');
        setDeliveryPhone('');
        setDeliveryNotes('');
        setTableNumber('');
        setAppliedPromo(null);
        setPointsToRedeem(0);
      } else {
        alert('Failed to place order. Please try again.');
      }
    } catch (e) {
      console.error('Error placing order:', e);
      alert('Error placing order. Please try again.');
    }
  };

  const orderTypeOptions: { key: typeof orderType; label: string; icon: React.ElementType; desc: string }[] = [
    { key: 'dine-in', label: 'Dine-In', icon: UtensilsCrossed, desc: 'Eat at restaurant' },
    { key: 'takeaway', label: 'Takeaway', icon: PackageOpen, desc: 'Pick up yourself' },
    { key: 'delivery', label: 'Delivery', icon: Truck, desc: 'Delivered to you' },
  ];

  return (
    <div className="pt-[72px] min-h-screen pb-12">
      
      {/* ── Menu Section ── */}
      <section id="menu-section" className="py-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-accent text-xs font-bold uppercase tracking-[0.2em] mb-2 block">Our Curated Selection</span>
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground">Explore Gourmet Delicacies</h1>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Order for dine-in, takeaway, or get it delivered fresh to your doorstep
            </p>
            <div className="w-12 h-0.5 bg-accent/40 mx-auto mt-4" />
          </div>

          {/* Search Input Bar */}
          <div className="max-w-md mx-auto mb-6 relative">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-muted-foreground absolute left-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Search dishes, ingredients, or starters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-10 py-3 rounded-2xl bg-card border border-border/30 text-xs font-medium text-foreground placeholder:text-muted-foreground/60 shadow-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {searchQuery && (
              <div className="text-[10px] text-muted-foreground font-semibold mt-2 text-center">
                Found {filteredMenu.length} dish{filteredMenu.length === 1 ? '' : 'es'} matching "{searchQuery}"
              </div>
            )}
          </div>

          {/* Category Filter Tabs & Bulk Add */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-accent text-white shadow-md shadow-accent/20'
                    : 'bg-white hover:bg-secondary border border-border/30 text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            ))}

            <button
              onClick={addCategoryToCart}
              className="px-4 py-2 rounded-full text-xs font-bold bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition-all cursor-pointer flex items-center gap-1.5"
              title="Add all available dishes in this category to your order"
            >
              <Plus className="w-3.5 h-3.5" /> Add All {activeCategory} Items
            </button>
          </div>

          {/* Menu Items Grid */}
          {menuLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <span className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
                <span className="text-xs text-muted-foreground font-medium">Loading dishes...</span>
              </div>
            </div>
          ) : filteredMenu.length === 0 && (searchQuery.trim() !== '' || activeCategory !== 'All') ? (
            <div className="bg-card border border-border/20 rounded-2xl p-12 text-center max-w-md mx-auto my-8">
              <Search className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
              <h3 className="font-display text-lg font-bold text-foreground mb-1">No dishes found</h3>
              <p className="text-xs text-muted-foreground mb-4">
                {searchQuery.trim() !== '' 
                  ? `We couldn't find any dishes matching "${searchQuery}"${activeCategory !== 'All' ? ` in ${activeCategory}` : ''}.`
                  : `No dishes in ${activeCategory} yet.`
                }
              </p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                className="px-5 py-2 bg-accent text-white text-xs font-bold rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                Reset Search & Filters
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
              {filteredMenu.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{
                    y: -10,
                    rotateX: 5,
                    rotateY: -5,
                    transition: { duration: 0.3 }
                  }}
                  transition={{ duration: 0.4 }}
                  className="bg-card border border-border/20 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-xl hover:border-accent/20 transition-all duration-300 group"
                  style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
                >
                  <div>
                    {/* Item Image */}
                    <div className="h-44 w-full overflow-hidden relative bg-secondary" style={{ transform: 'translateZ(20px)' }}>
                      <img 
                        src={item.image_url} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
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
                        Rs. {item.price.toFixed(2)}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-4" style={{ transform: 'translateZ(30px)' }}>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-foreground text-sm group-hover:text-accent transition-colors">{item.name}</h4>
                        {ratings[item.id] && (
                          <div className="flex items-center gap-0.5 text-yellow-500 shrink-0 bg-yellow-500/10 px-1.5 py-0.5 rounded text-[10px] font-bold">
                            <Star className="w-3 h-3 fill-current" />
                            {ratings[item.id].avg.toFixed(1)} <span className="text-muted-foreground ml-0.5 font-normal">({ratings[item.id].count})</span>
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 mb-2">{item.description}</p>
                      <button 
                        onClick={() => setReviewItem(item)}
                        className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground hover:text-accent transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3" /> Leave Review
                      </button>
                    </div>
                  </div>

                  <div className="p-4 pt-0" style={{ transform: 'translateZ(40px)' }}>
                    {(() => {
                      const cartItem = cart.find(c => c.menuItem.id === item.id);
                      if (cartItem) {
                        return (
                          <div className="flex items-center justify-between bg-accent/10 border border-accent/30 rounded-xl p-1 text-xs font-bold text-accent">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-7 h-7 rounded-lg bg-card hover:bg-accent hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-border/20 text-foreground"
                            >
                              -
                            </button>
                            <span className="font-display font-bold text-sm px-2 text-foreground">{cartItem.quantity} in Order</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-7 h-7 rounded-lg bg-card hover:bg-accent hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-border/20 text-foreground"
                            >
                              +
                            </button>
                          </div>
                        );
                      }
                      return (
                        <button
                          onClick={() => addToCart(item)}
                          disabled={!item.is_available}
                          className="w-full py-2 bg-secondary group-hover:bg-accent group-hover:text-white rounded-xl text-[11px] font-semibold text-foreground flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add to Order
                        </button>
                      );
                    })()}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>

      {/* Multi-Item Order Floating Action Bar */}
      {cart.length > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-lg"
        >
          <div className="bg-card/95 backdrop-blur-md border border-accent/30 rounded-2xl p-3.5 shadow-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center font-bold text-sm shadow-md">
                {cart.reduce((sum, i) => sum + i.quantity, 0)}
              </div>
              <div>
                <div className="text-xs font-bold text-foreground">
                  {cart.length} Unique Dish{cart.length > 1 ? 'es' : ''} Selected
                </div>
                <div className="text-[10px] text-accent font-bold">
                  Subtotal: Rs. {cartSubtotal.toFixed(2)}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="px-5 py-2.5 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-bold tracking-wider shadow-lg transition-all cursor-pointer flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" /> Order All Items ({cart.reduce((sum, i) => sum + i.quantity, 0)}) →
            </button>
          </div>
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
              className="fixed top-0 right-0 bottom-0 w-full max-w-[440px] bg-card border-l border-border/20 shadow-2xl z-[95] overflow-y-auto flex flex-col"
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
                        <div className="text-[10px] text-accent font-bold">Rs. {item.menuItem.price.toFixed(2)} each</div>
                        
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
                        <span className="text-xs font-bold text-foreground">Rs. {(item.menuItem.price * item.quantity).toFixed(2)}</span>
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
                  {/* Order Type Selector — 3-column card style */}
                  <div>
                    <label className="block text-[10px] font-bold text-foreground/80 mb-2 uppercase tracking-wider">How would you like your order?</label>
                    <div className="grid grid-cols-3 gap-2">
                      {orderTypeOptions.map(opt => (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => setOrderType(opt.key)}
                          className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                            orderType === opt.key 
                              ? 'bg-accent/10 border-accent/50 text-accent shadow-sm' 
                              : 'bg-card border-border/25 text-muted-foreground hover:border-border/50 hover:text-foreground'
                          }`}
                        >
                          <opt.icon className={`w-4.5 h-4.5 ${orderType === opt.key ? 'text-accent' : ''}`} />
                          <span className="text-[10px] font-bold tracking-wider uppercase">{opt.label}</span>
                          <span className="text-[8px] font-medium opacity-70">{opt.desc}</span>
                        </button>
                      ))}
                    </div>
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
                      {/* Dine-In: Table Number */}
                      <AnimatePresence mode="wait">
                        {orderType === 'dine-in' && (
                          <motion.div
                            key="dine-in-fields"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <label className="block text-[10px] font-bold text-foreground/80 mb-1 uppercase tracking-wider">Table Number</label>
                            <input 
                              type="text" 
                              required
                              placeholder="e.g. 5"
                              value={tableNumber} 
                              onChange={e => setTableNumber(e.target.value)} 
                              className="w-full px-3 py-1.5 rounded-lg bg-card border border-border/35 text-xs focus:outline-none focus:border-accent"
                            />
                          </motion.div>
                        )}

                        {/* Delivery: Address Form */}
                        {orderType === 'delivery' && (
                          <motion.div
                            key="delivery-fields"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-3"
                          >
                            {/* Delivery info banner */}
                            <div className="flex items-center gap-2 p-2.5 bg-accent/6 border border-accent/15 rounded-xl">
                              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                                <Truck className="w-4 h-4 text-accent" />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-foreground">Free delivery on orders over Rs. 30!</p>
                                <p className="text-[9px] text-muted-foreground">Estimated delivery: 30-45 minutes</p>
                              </div>
                            </div>

                            {/* Address */}
                            <div>
                              <label className="flex items-center gap-1 text-[10px] font-bold text-foreground/80 mb-1 uppercase tracking-wider">
                                <MapPin className="w-3 h-3" /> Delivery Address
                              </label>
                              <input 
                                type="text" 
                                required
                                placeholder="Street address, apartment, building..."
                                value={deliveryAddress} 
                                onChange={e => setDeliveryAddress(e.target.value)} 
                                className="w-full px-3 py-2 rounded-lg bg-card border border-border/35 text-xs focus:outline-none focus:border-accent transition-colors"
                              />
                            </div>

                            {/* Phone */}
                            <div>
                              <label className="flex items-center gap-1 text-[10px] font-bold text-foreground/80 mb-1 uppercase tracking-wider">
                                <Phone className="w-3 h-3" /> Contact Phone
                              </label>
                              <input 
                                type="tel" 
                                required
                                placeholder="+1 (555) 123-4567"
                                value={deliveryPhone} 
                                onChange={e => setDeliveryPhone(e.target.value)} 
                                className="w-full px-3 py-2 rounded-lg bg-card border border-border/35 text-xs focus:outline-none focus:border-accent transition-colors"
                              />
                            </div>

                            {/* Special Instructions */}
                            <div>
                              <label className="flex items-center gap-1 text-[10px] font-bold text-foreground/80 mb-1 uppercase tracking-wider">
                                <MessageSquare className="w-3 h-3" /> Special Instructions
                                <span className="text-muted-foreground font-normal ml-1">(optional)</span>
                              </label>
                              <textarea
                                placeholder="Ring the doorbell, leave at door, extra napkins..."
                                value={deliveryNotes}
                                onChange={e => setDeliveryNotes(e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 rounded-lg bg-card border border-border/35 text-xs focus:outline-none focus:border-accent transition-colors resize-none"
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Payment Method Selector */}
                      <div>
                        <label className="block text-[10px] font-bold text-foreground/80 mb-2 uppercase tracking-wider">Payment Method</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { key: 'cash' as const, label: 'Cash', icon: Banknote, desc: 'Pay on arrival' },
                            { key: 'card' as const, label: 'Card', icon: CreditCard, desc: 'Credit / Debit' },
                            { key: 'digital-wallet' as const, label: 'Wallet', icon: Wallet, desc: 'Digital pay' },
                          ].map(opt => (
                            <button
                              key={opt.key}
                              type="button"
                              onClick={() => setPaymentMethod(opt.key)}
                              className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                                paymentMethod === opt.key 
                                  ? 'bg-accent/10 border-accent/50 text-accent shadow-sm' 
                                  : 'bg-card border-border/25 text-muted-foreground hover:border-border/50 hover:text-foreground'
                              }`}
                            >
                              <opt.icon className={`w-4.5 h-4.5 ${paymentMethod === opt.key ? 'text-accent' : ''}`} />
                              <span className="text-[10px] font-bold tracking-wider uppercase">{opt.label}</span>
                              <span className="text-[8px] font-medium opacity-70">{opt.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Simulated Card Form */}
                      <AnimatePresence mode="wait">
                        {paymentMethod === 'card' && (
                          <motion.div
                            key="card-fields"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-3"
                          >
                            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 text-white space-y-3 shadow-lg">
                              <div className="flex justify-between items-center">
                                <CreditCard className="w-6 h-6 opacity-80" />
                                <span className="text-[9px] font-bold tracking-widest opacity-60">SIMULATED</span>
                              </div>
                              <div>
                                <input
                                  type="text"
                                  placeholder="4242 4242 4242 4242"
                                  value={cardNumber}
                                  onChange={e => {
                                    const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                                    setCardNumber(v.replace(/(\d{4})(?=\d)/g, '$1 '));
                                  }}
                                  className="w-full bg-transparent border-b border-white/20 text-sm font-mono tracking-[0.2em] pb-1 focus:outline-none focus:border-white/50 placeholder:text-white/30"
                                />
                              </div>
                              <div className="flex gap-4">
                                <div className="flex-1">
                                  <label className="text-[8px] uppercase tracking-wider opacity-50">Expiry</label>
                                  <input
                                    type="text"
                                    placeholder="MM/YY"
                                    value={cardExpiry}
                                    onChange={e => {
                                      let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                                      if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
                                      setCardExpiry(v);
                                    }}
                                    className="w-full bg-transparent border-b border-white/20 text-xs font-mono tracking-wider pb-1 focus:outline-none focus:border-white/50 placeholder:text-white/30"
                                  />
                                </div>
                                <div className="w-16">
                                  <label className="text-[8px] uppercase tracking-wider opacity-50">CVV</label>
                                  <input
                                    type="password"
                                    placeholder="•••"
                                    value={cardCvv}
                                    onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    className="w-full bg-transparent border-b border-white/20 text-xs font-mono tracking-wider pb-1 focus:outline-none focus:border-white/50 placeholder:text-white/30"
                                  />
                                </div>
                              </div>
                            </div>
                            <p className="text-[9px] text-muted-foreground text-center italic">Demo mode — no real charges will be made</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Promo Codes & Loyalty */}
                      <div className="space-y-3 pt-2 border-t border-border/20">
                        <div>
                          <label className="block text-[10px] font-bold text-foreground/80 mb-1.5 uppercase tracking-wider">Promo Code</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={promoCodeInput}
                              onChange={e => setPromoCodeInput(e.target.value.toUpperCase())}
                              placeholder="e.g. SAVE20"
                              className="flex-1 px-3 py-2 rounded-lg bg-card border border-border/35 text-xs focus:outline-none focus:border-accent transition-colors"
                            />
                            <button
                              type="button"
                              onClick={handleApplyPromo}
                              className="px-3 py-2 bg-secondary text-foreground hover:bg-accent hover:text-white rounded-lg text-xs font-semibold transition-colors"
                            >
                              Apply
                            </button>
                          </div>
                          {promoError && <p className="text-red-500 text-[10px] mt-1">{promoError}</p>}
                          {appliedPromo && (
                            <div className="flex justify-between items-center bg-emerald-500/10 text-emerald-600 px-3 py-1.5 rounded-lg mt-2 text-[10px] font-semibold">
                              <span>Code applied: {appliedPromo.code}</span>
                              <button type="button" onClick={() => setAppliedPromo(null)} className="hover:text-emerald-700">Remove</button>
                            </div>
                          )}
                        </div>

                        {currentUser && (currentUser.loyalty_points || 0) > 0 && (
                          <div>
                            <label className="block text-[10px] font-bold text-foreground/80 mb-1.5 uppercase tracking-wider">Loyalty Points (100 = Rs. 1)</label>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-muted-foreground">Available: {currentUser.loyalty_points} pts</span>
                              {pointsToRedeem === 0 ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const maxPointsUsable = Math.floor(cartSubtotal * 100);
                                    const pointsAvailable = currentUser.loyalty_points || 0;
                                    setPointsToRedeem(Math.min(pointsAvailable, maxPointsUsable));
                                  }}
                                  className="text-accent font-semibold hover:underline"
                                >
                                  Redeem Points
                                </button>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="text-emerald-600 font-semibold">-{pointsToRedeem} pts</span>
                                  <button type="button" onClick={() => setPointsToRedeem(0)} className="text-red-500 hover:underline">Cancel</button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Order Summary */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between items-center text-xs text-foreground/80">
                          <span>Subtotal</span>
                          <span className="font-semibold">Rs. {cartSubtotal.toFixed(2)}</span>
                        </div>
                        {orderType === 'delivery' && (
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-foreground/80 flex items-center gap-1">
                              <Truck className="w-3 h-3" /> Delivery Fee
                            </span>
                            {cartSubtotal >= 30 ? (
                              <span className="font-semibold text-emerald-600">
                                <span className="line-through text-muted-foreground mr-1">Rs. {DELIVERY_FEE.toFixed(2)}</span>
                                FREE
                              </span>
                            ) : (
                              <span className="font-semibold text-foreground/80">Rs. {DELIVERY_FEE.toFixed(2)}</span>
                            )}
                          </div>
                        )}
                        {discountAmount > 0 && (
                          <div className="flex justify-between items-center text-xs text-emerald-600">
                            <span>Discount</span>
                            <span className="font-semibold">-Rs. {discountAmount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-sm font-bold text-foreground border-t border-border/20 pt-2">
                          <span>Total</span>
                          <span className="text-lg text-accent">
                            Rs. {(orderType === 'delivery' && cartSubtotal >= 30 ? cartSubtotal : cartTotal).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-accent text-white text-xs font-bold uppercase tracking-wider hover:shadow-lg hover:bg-accent/90 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        {orderType === 'delivery' && <Truck className="w-3.5 h-3.5" />}
                        {orderType === 'delivery' ? 'Place Delivery Order' : `Place Order`}
                        {' '}(Rs. {cartTotal.toFixed(2)})
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
              className="bg-card border border-border/30 rounded-2xl w-full max-w-[400px] p-6 text-center shadow-2xl space-y-4"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto border ${
                orderSuccess.type === 'delivery' 
                  ? 'bg-accent/10 text-accent border-accent/20'
                  : 'bg-green-500/10 text-green-500 border-green-500/20'
              }`}>
                {orderSuccess.type === 'delivery' 
                  ? <Truck className="w-7 h-7" />
                  : <CheckCircle2 className="w-7 h-7" />
                }
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  {orderSuccess.type === 'delivery' ? 'Delivery Order Placed!' : 'Order Successfully Placed'}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {orderSuccess.type === 'delivery'
                    ? 'Your food is being prepared and will be delivered to your address.'
                    : 'Thank you! Your order has been sent to the kitchen.'}
                </p>
              </div>
              <div className="bg-secondary/70 rounded-xl p-4 text-left text-xs space-y-1.5 border border-border/20">
                <div className="flex justify-between"><span className="text-muted-foreground">Order ID:</span> <span className="font-mono font-bold text-foreground">{orderSuccess.id}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Type:</span> <span className="font-semibold text-foreground uppercase">{orderSuccess.type}</span></div>
                {orderSuccess.tableNumber && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Table:</span> <span className="font-semibold text-foreground">Table {orderSuccess.tableNumber}</span></div>
                )}
                {orderSuccess.deliveryAddress && (
                  <>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground shrink-0">Deliver to:</span>
                      <span className="font-semibold text-foreground text-right">{orderSuccess.deliveryAddress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-semibold text-foreground">{orderSuccess.deliveryPhone}</span>
                    </div>
                  </>
                )}
                {orderSuccess.estimatedDelivery && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> Est. Delivery:</span>
                    <span className="font-bold text-accent">
                      {new Date(orderSuccess.estimatedDelivery).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between"><span className="text-muted-foreground">Amount:</span> <span className="font-bold text-accent">Rs. {orderSuccess.total.toFixed(2)}</span></div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setReceiptOrder(orderSuccess);
                    setOrderSuccess(null);
                  }}
                  className="flex-1 py-2 bg-secondary text-foreground text-xs font-semibold rounded-xl hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-border/30"
                >
                  <Receipt className="w-3.5 h-3.5" /> View Bill
                </button>
                <button
                  onClick={() => setOrderSuccess(null)}
                  className="flex-1 py-2 bg-accent text-white text-xs font-semibold rounded-xl hover:shadow-md transition-all cursor-pointer"
                >
                  Keep Browsing
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Receipt / Bill Modal */}
      <ReceiptModal order={receiptOrder} onClose={() => setReceiptOrder(null)} />
      
      <ReviewModal 
        isOpen={!!reviewItem} 
        onClose={() => setReviewItem(null)} 
        menuItem={reviewItem} 
        onReviewSubmitted={fetchMenuAndRatings}
      />
    </div>
  );
}
