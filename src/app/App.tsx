import { useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import {
  User, UserPlus, ChefHat, Calendar, Truck, LogOut,
  Headphones, Users, Award, Trophy, Star, Heart, Shield, ShoppingCart, ArrowLeft
} from "lucide-react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import uploadedFoodImg from "../imports/Minimalistic_simple_food_design_202605251743-1.jpeg";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
import { mockDb, UserProfile } from "./utils/mockDb";
import { AuthModal } from "./components/AuthModal";
import { HomePage } from "./pages/HomePage";
import { MenuPage } from "./pages/MenuPage";
import { KitchenPage } from "./pages/KitchenPage";
import { AdminPage } from "./pages/AdminPage";
import { BookTablePage } from "./pages/BookTablePage";
import { DashboardPage } from "./pages/DashboardPage";
import { GoldenEmbersBackground } from "./components/GoldenEmbersBackground";

const foodImages = [
  "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb3VybWV0JTIwc2FsbW9uJTIwZGlzaCUyMHBsYXRlZHxlbnwxfHx8fDE3Nzk2NzM1NTl8MA&ixlib=rb-4.1.0&q=80&w=1080",
  uploadedFoodImg,
  "https://images.unsplash.com/photo-1663530761401-15eefb544889?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb3VybWV0JTIwcGxhdGVkJTIwZGlzaHxlbnwxfHx8fDE3Nzk3MTA1NDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1673912402587-57ac40f1b4a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGF0ZWQlMjBkZXNzZXJ0fGVufDF8fHx8MTc3OTcxMDU2MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
];

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale  = useTransform(scrollY, [0, 300], [1, 0.96]);

  // App Navigation & Role States
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const userOrdersTrackable = () => {
    if (!currentUser) return false;
    return mockDb.getOrders().some(o => o.customerEmail.toLowerCase() === currentUser.email.toLowerCase());
  };

  useEffect(() => {
    // Check for logged in user session
    setCurrentUser(mockDb.getCurrentUser());
  }, []);

  useEffect(() => {
    const fn = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % foodImages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    // Auto-redirect staff/admin to their dashboard for a smooth UX
    if (user.role === 'admin') {
      navigate('/admin');
    } else if (user.role === 'staff') {
      navigate('/kitchen');
    } else {
      navigate('/');
    }
  };

  const handleLogout = () => {
    mockDb.logout();
    setCurrentUser(null);
    navigate('/');
  };

  const stagger = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
  };
  
  const fadeUp = {
    hidden:  { opacity: 0, y: 22 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
  };

  const features = [
    { icon: ChefHat,    title: "Quality Food",  desc: "Fresh ingredients, perfectly cooked." },
    { icon: Calendar,   title: "Easy Booking",  desc: "Reserve your table in just a few clicks." },
    { icon: Truck,      title: "Fast Delivery", desc: "Delicious food delivered to you." },
    { icon: Headphones, title: "24/7 Support",  desc: "We're here to help you anytime." },
  ];

  const stats = [
    { icon: Users,  value: "10K+", label: "Happy Customers" },
    { icon: Award,  value: "50+",  label: "Delicious Dishes" },
    { icon: Trophy, value: "5+",   label: "Years of Service" },
    { icon: Star,   value: "4.8",  label: "Customer Rating"  },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden pb-12 relative">
      <GoldenEmbersBackground />

      {/* ── Navbar ── */}
      <motion.header
        initial={{ y: -72, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled || location.pathname !== '/'
            ? "bg-background/90 backdrop-blur-xl shadow-sm border-b border-border/30"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-[72px]">

            {/* Left side - Hamburger Menu + Logo */}
            <div className="flex items-center gap-4">
              {/* Hamburger Menu Button (only for Storefront views) */}
              {(location.pathname === '/' || location.pathname === '/menu' || location.pathname === '/book-table' || location.pathname === '/dashboard') && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  onClick={() => setIsSidebarOpen(true)}
                  className="flex flex-col items-center justify-center gap-1.5 w-10 h-10 rounded-lg hover:bg-accent/10 transition-colors duration-200 group cursor-pointer"
                  aria-label="Open menu"
                >
                  <span className="w-6 h-0.5 bg-foreground rounded-full transition-all duration-200 group-hover:bg-accent" />
                  <span className="w-6 h-0.5 bg-foreground rounded-full transition-all duration-200 group-hover:bg-accent" />
                  <span className="w-6 h-0.5 bg-foreground rounded-full transition-all duration-200 group-hover:bg-accent" />
                </motion.button>
              )}

              {/* Back to storefront button when in other portals */}
              {(location.pathname !== '/' && location.pathname !== '/menu' && location.pathname !== '/book-table' && location.pathname !== '/dashboard') && (
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/70 text-xs font-semibold text-foreground/80 hover:text-foreground hover:border-accent/40 hover:bg-accent/5 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Return to Store
                </button>
              )}

              {/* Logo */}
              <motion.div 
                whileHover={{ scale: 1.02 }} 
                onClick={() => navigate('/')}
                className="flex items-center gap-2.5 cursor-pointer select-none"
              >
                <svg width="26" height="30" viewBox="0 0 26 30" fill="none">
                  <motion.path
                    d="M13 2 C13 2, 22 7, 22 16 C22 22, 18 27, 13 27 C8 27, 4 22, 4 16 C4 7, 13 2, 13 2Z"
                    fill="#d4a574" opacity="0.2"
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <path d="M13 3 C9 8, 6 13, 8 19 M13 3 C17 8, 20 13, 18 19 M13 3 L13 27"
                    stroke="#d4a574" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                  <path d="M8 19 C10 22, 12 25, 13 27 C14 25, 16 22, 18 19"
                    stroke="#d4a574" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                </svg>
                <div className="leading-none">
                  <div className="text-[1.22rem] font-display font-semibold text-foreground tracking-wide">Flavoré</div>
                  <div className="text-[8px] tracking-[0.22em] uppercase text-muted-foreground mt-0.5">Restaurant</div>
                </div>
              </motion.div>
            </div>

            {/* Middle navigation (Portal Switcher tabs when logged in) */}
            {currentUser && (currentUser.role === 'admin' || currentUser.role === 'staff') && (
              <div className="hidden md:flex bg-secondary p-1 rounded-xl">
                <button
                  onClick={() => navigate('/')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    (location.pathname === '/' || location.pathname === '/menu' || location.pathname === '/book-table' || location.pathname === '/dashboard') ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
                  }`}
                >
                  HOME
                </button>
                {currentUser.role === 'staff' && (
                  <button
                    onClick={() => navigate('/kitchen')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      location.pathname === '/kitchen' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
                    }`}
                  >
                    Kitchen Dashboard
                  </button>
                )}
                {currentUser.role === 'admin' && (
                  <>
                    <button
                      onClick={() => navigate('/kitchen')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        location.pathname === '/kitchen' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
                      }`}
                    >
                      Kitchen View
                    </button>
                    <button
                      onClick={() => navigate('/admin')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        location.pathname === '/admin' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
                      }`}
                    >
                      Admin Panel
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Auth */}
            <div className="flex items-center gap-2.5">
              {!currentUser ? (
                <>
                  <motion.button
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    onClick={() => setIsAuthOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-border/70 text-sm font-medium text-foreground/75 hover:text-foreground hover:border-accent/40 transition-all cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5" /> Login
                  </motion.button>
                  <motion.button
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
                    whileHover={{ scale: 1.04, boxShadow: "0 6px 22px rgba(212,165,116,0.4)" }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setIsAuthOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent text-white text-sm font-medium shadow-md transition-all cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Sign Up
                  </motion.button>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="hidden lg:block text-right leading-none">
                    <div className="text-xs font-bold text-foreground">{currentUser.fullName}</div>
                    <div className="text-[9px] text-accent uppercase tracking-wider font-extrabold mt-0.5 flex items-center justify-end gap-1">
                      {currentUser.role === 'admin' ? <Shield className="w-2.5 h-2.5" /> : null}
                      {currentUser.role === 'staff' ? <ChefHat className="w-2.5 h-2.5" /> : null}
                      {currentUser.role}
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-border hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all cursor-pointer text-xs font-semibold text-muted-foreground"
                    title="Log Out"
                  >
                    <LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* ── Sidebar ── */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-[60]"
            />

            {/* Sidebar */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-background border-r border-border/40 shadow-2xl z-[70] overflow-y-auto"
            >
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-6 border-b border-border/30">
                <div className="flex items-center gap-2.5">
                  <svg width="24" height="28" viewBox="0 0 26 30" fill="none">
                    <path d="M13 3 C9 8, 6 13, 8 19 M13 3 C17 8, 20 13, 18 19 M13 3 L13 27"
                      stroke="#d4a574" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                    <path d="M8 19 C10 22, 12 25, 13 27 C14 25, 16 22, 18 19"
                      stroke="#d4a574" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                  </svg>
                  <div className="leading-none">
                    <div className="text-lg font-display font-semibold text-foreground tracking-wide">Flavoré</div>
                    <div className="text-[7px] tracking-[0.22em] uppercase text-muted-foreground mt-0.5">Restaurant</div>
                  </div>
                </div>

                {/* Close Button */}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsSidebarOpen(false)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-accent/10 transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <span className="text-lg">✕</span>
                </motion.button>
              </div>

              {/* Navigation Links */}
              <nav className="p-6 space-y-2">
                {[
                  { label: "Home", path: "/" },
                  { label: "Menu", path: "/menu" },
                  { label: "Reservations", path: "/book-table" },
                  ...(currentUser ? [{ label: "My Dashboard", path: "/dashboard" }] : []),
                  ...(currentUser && (currentUser.role === 'admin' || currentUser.role === 'staff') ? [
                    { label: "Kitchen Monitor", path: "/kitchen" }
                  ] : []),
                  ...(currentUser && currentUser.role === 'admin' ? [
                    { label: "Admin Controller", path: "/admin" }
                  ] : [])
                ].map((item, i) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setIsSidebarOpen(false);
                      if (item.path) {
                        navigate(item.path);
                      } else if (item.selector) {
                        if (location.pathname !== '/') {
                          navigate('/');
                          setTimeout(() => {
                            document.querySelector(item.selector!)?.scrollIntoView({ behavior: 'smooth' });
                          }, 300);
                        } else {
                          document.querySelector(item.selector!)?.scrollIntoView({ behavior: 'smooth' });
                        }
                      }
                    }}
                    className="w-full text-left block px-4 py-3 rounded-xl hover:bg-accent/5 hover:text-foreground font-semibold text-xs text-foreground/70 transition-all duration-200 cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              {/* Auth Buttons in Sidebar */}
              {!currentUser ? (
                <div className="p-6 border-t border-border/30 space-y-3">
                  <button
                    onClick={() => { setIsSidebarOpen(false); setIsAuthOpen(true); }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border/70 text-sm font-medium text-foreground/75 hover:text-foreground hover:border-accent/40 transition-all cursor-pointer"
                  >
                    <User className="w-4 h-4" /> Login
                  </button>
                  <button
                    onClick={() => { setIsSidebarOpen(false); setIsAuthOpen(true); }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium shadow-md transition-all cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" /> Sign Up
                  </button>
                </div>
              ) : (
                <div className="p-6 border-t border-border/30 text-center space-y-2">
                  <div className="text-xs font-bold text-foreground">{currentUser.fullName}</div>
                  <div className="text-[9px] text-accent uppercase tracking-wider font-extrabold">{currentUser.role} role</div>
                  <button
                    onClick={() => { setIsSidebarOpen(false); handleLogout(); }}
                    className="w-full mt-2 py-2 rounded-xl bg-secondary hover:bg-red-50 hover:text-red-600 text-xs font-semibold transition-all cursor-pointer border border-border/40"
                  >
                    Log Out Session
                  </button>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main View Manager ── */}
      <div className="relative z-10">
        <Routes>
          <Route path="/" element={<HomePage currentUser={currentUser} onOpenAuth={() => setIsAuthOpen(true)} />} />
          <Route path="/menu" element={<MenuPage currentUser={currentUser} onOpenAuth={() => setIsAuthOpen(true)} />} />
          <Route path="/book-table" element={<BookTablePage currentUser={currentUser} onOpenAuth={() => setIsAuthOpen(true)} />} />
          <Route path="/dashboard" element={<DashboardPage currentUser={currentUser} />} />
          <Route 
            path="/kitchen" 
            element={
              currentUser && (currentUser.role === 'staff' || currentUser.role === 'admin') ? (
                <KitchenPage />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route 
            path="/admin" 
            element={
              currentUser && currentUser.role === 'admin' ? (
                <AdminPage />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Authentication Modal Popup */}
      <AnimatePresence>
        {isAuthOpen && (
          <AuthModal 
            isOpen={isAuthOpen} 
            onClose={() => setIsAuthOpen(false)} 
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </AnimatePresence>

      {/* Floating Easy-Demo Quick Role Switcher for Developer Testing */}
      <div className="fixed bottom-4 left-4 z-40 bg-card/90 backdrop-blur-md border border-border/30 rounded-2xl shadow-xl p-3 flex items-center gap-3">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest hidden sm:inline">Role Switcher:</span>
        <div className="flex gap-1 bg-secondary p-1 rounded-xl">
          {[
            { role: 'Customer', onClick: () => {
              const u = mockDb.login('customer@flavore.com');
              if (u) handleLoginSuccess(u);
            }},
            { role: 'Kitchen Staff', onClick: () => {
              const u = mockDb.login('staff@flavore.com');
              if (u) handleLoginSuccess(u);
            }},
            { role: 'Admin', onClick: () => {
              const u = mockDb.login('admin@flavore.com');
              if (u) handleLoginSuccess(u);
            }}
          ].map(opt => (
            <button
              key={opt.role}
              onClick={opt.onClick}
              className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                currentUser?.role.toLowerCase() === opt.role.split(' ')[opt.role.split(' ').length - 1].toLowerCase()
                  ? 'bg-accent text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {opt.role}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
