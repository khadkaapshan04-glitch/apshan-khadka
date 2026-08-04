import { useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import {
  User, UserPlus, ChefHat, LogOut, Shield, ArrowLeft, Sparkles
} from "lucide-react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";

import { db } from "./lib/supabaseDb";
import { supabase } from "./lib/supabaseClient";
import { useAuth } from "./context/AuthContext";
import { AuthModal } from "./components/AuthModal";
import { HomePage } from "./pages/HomePage";
import { MenuPage } from "./pages/MenuPage";
import { AboutPage } from "./pages/AboutPage";
import { CulinaryLandingPage } from "./pages/CulinaryLandingPage";
import { NightAtFlavore } from "./pages/NightAtFlavore";
import { TheRitual } from "./pages/TheRitual";
import { ForSomeoneSpecial } from "./pages/ForSomeoneSpecial";

const STORY_COMPONENTS = [CulinaryLandingPage, NightAtFlavore, TheRitual, ForSomeoneSpecial];
const RandomStory = STORY_COMPONENTS[Math.floor(Math.random() * STORY_COMPONENTS.length)];

import { AdminPage } from "./pages/AdminPage";
import { BookTablePage } from "./pages/BookTablePage";
import { DashboardPage } from "./pages/DashboardPage";
import { StaffAdminKitchenPage } from "./pages/StaffAdminKitchenPage";
import { GoldenEmbersBackground } from "./components/GoldenEmbersBackground";
import { Toaster } from "./components/ui/sonner";
import { showLoginNotification } from "./components/ui/pop-toast";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { scrollY } = useScroll();

  // App Navigation & Role States
  const { profile, loading: authLoading, logout } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialView, setAuthInitialView] = useState<'signin' | 'signup' | 'forgot' | 'reset_password'>('signin');
  const [authInitialEmail, setAuthInitialEmail] = useState('');
  const [pendingLoginRedirect, setPendingLoginRedirect] = useState(false);

  const currentUser = profile ? {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role
  } : null;

  useEffect(() => {
    const fn = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const openResetPasswordModal = (email = '') => {
    setAuthInitialView('reset_password');
    setAuthInitialEmail(email);
    setIsAuthOpen(true);
  };

  useEffect(() => {
    const isRecoveryUrl =
      location.pathname === '/reset-password' ||
      window.location.hash.includes('type=recovery') ||
      window.location.search.includes('type=recovery');

    if (isRecoveryUrl) {
      openResetPasswordModal();

      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          openResetPasswordModal(session.user.email ?? '');
        }
      });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        openResetPasswordModal(session?.user?.email ?? '');

        if (window.location.hash || window.location.search) {
          window.history.replaceState({}, document.title, '/reset-password');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [location.pathname]);

  const handleLoginSuccess = (_role: string) => {
    // Don't navigate immediately — wait for AuthContext to confirm the role
    setIsAuthOpen(false);
    setAuthInitialView('signin');
    setAuthInitialEmail('');
    setPendingLoginRedirect(true);
  };

  // Navigate based on AuthContext profile AFTER it finishes loading
  useEffect(() => {
    if (pendingLoginRedirect && !authLoading && profile) {
      setPendingLoginRedirect(false);
      showLoginNotification({
        name: profile.full_name,
        role: profile.role,
        email: profile.email,
      });
      if (profile.role === 'admin') {
        navigate('/admin');
      } else if (profile.role === 'staff') {
        navigate('/kitchen');
      } else {
        navigate('/dashboard');
      }
    }
  }, [pendingLoginRedirect, authLoading, profile]);

  const handleAuthClose = () => {
    setIsAuthOpen(false);
    setAuthInitialView('signin');
    setAuthInitialEmail('');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/home');
  };

  const handleDemoLogin = async (email: string) => {
    try {
      const u = await db.login(email, 'Flavore123!');
      if (u) handleLoginSuccess(u.role);
    } catch (err) {
      console.error('Demo login failed:', err);
      setAuthInitialView('signin');
      setAuthInitialEmail(email);
      setIsAuthOpen(true);
    }
  };




  return (
    <div className="min-h-screen bg-background overflow-x-hidden pb-12 relative">
      <GoldenEmbersBackground />

      {/* ── Navbar (Hidden on first animation route '/') ── */}
      {location.pathname !== '/' && (
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
              {(location.pathname === '/home' || location.pathname === '/menu' || location.pathname === '/book-table' || location.pathname === '/dashboard' || location.pathname === '/about') && (
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
              {(location.pathname !== '/home' && location.pathname !== '/' && location.pathname !== '/menu' && location.pathname !== '/book-table' && location.pathname !== '/dashboard' && location.pathname !== '/about') && (
                <button
                  onClick={() => navigate('/home')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/70 text-xs font-semibold text-foreground/80 hover:text-foreground hover:border-accent/40 hover:bg-accent/5 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Return to Store
                </button>
              )}

              {/* Logo */}
              <motion.div 
                whileHover={{ scale: 1.02 }} 
                onClick={() => navigate('/home')}
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
                  onClick={() => navigate('/home')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    (location.pathname === '/home' || location.pathname === '/menu' || location.pathname === '/book-table' || location.pathname === '/dashboard' || location.pathname === '/about') ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
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

            {/* Auth Links */}
            <div className="flex items-center gap-2.5">

              {!currentUser ? (
                <>
                  <motion.button
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    onClick={() => { setAuthInitialView('signin'); setIsAuthOpen(true); }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-border/70 text-sm font-medium text-foreground/75 hover:text-foreground hover:border-accent/40 transition-all cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5" /> Login
                  </motion.button>
                  <motion.button
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
                    whileHover={{ scale: 1.04, boxShadow: "0 6px 22px rgba(212,165,116,0.4)" }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => { setAuthInitialView('signup'); setIsAuthOpen(true); }}
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
      )}

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
                  { label: "Home", path: "/home" },
                  { label: "✨ 3D Luxury Gallery", scrollTo: "gallery-3d" },
                  { label: "Menu", path: "/menu" },
                  { label: "Reservations", path: "/book-table" },
                  { label: "About & Contact", path: "/about" },
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
                      if (item.scrollTo) {
                        if (location.pathname !== '/home') {
                          navigate('/home');
                          setTimeout(() => {
                            document.getElementById(item.scrollTo!)?.scrollIntoView({ behavior: 'smooth' });
                          }, 200);
                        } else {
                          document.getElementById(item.scrollTo)?.scrollIntoView({ behavior: 'smooth' });
                        }
                      } else if (item.path) {
                        navigate(item.path);
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
                    onClick={() => { setIsSidebarOpen(false); setAuthInitialView('signin'); setIsAuthOpen(true); }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border/70 text-sm font-medium text-foreground/75 hover:text-foreground hover:border-accent/40 transition-all cursor-pointer"
                  >
                    <User className="w-4 h-4" /> Login
                  </button>
                  <button
                    onClick={() => { setIsSidebarOpen(false); setAuthInitialView('signup'); setIsAuthOpen(true); }}
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
          <Route path="/" element={<RandomStory />} />
          <Route path="/home" element={<HomePage currentUser={currentUser} onOpenAuth={() => setIsAuthOpen(true)} />} />
          <Route path="/menu" element={<MenuPage currentUser={currentUser} onOpenAuth={() => setIsAuthOpen(true)} />} />
          <Route path="/book-table" element={<BookTablePage currentUser={currentUser} onOpenAuth={() => setIsAuthOpen(true)} />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/reset-password" element={<HomePage currentUser={currentUser} onOpenAuth={() => setIsAuthOpen(true)} />} />
          <Route path="/experience" element={<CulinaryLandingPage />} />
          <Route path="/night" element={<NightAtFlavore />} />
          <Route path="/ritual" element={<TheRitual />} />
          <Route path="/special" element={<ForSomeoneSpecial />} />
          <Route 
            path="/dashboard" 
            element={
              authLoading ? (
                <div className="min-h-screen flex items-center justify-center bg-background"><span className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
              ) : currentUser ? (
                <DashboardPage currentUser={currentUser} />
              ) : (
                <Navigate to="/home" replace />
              )
            } 
          />
          <Route
            path="/kitchen"
            element={
              authLoading ? (
                <div className="min-h-screen flex items-center justify-center bg-background"><span className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
              ) : currentUser && (currentUser.role === 'staff' || currentUser.role === 'admin') ? (
                <StaffAdminKitchenPage mode={currentUser.role === 'admin' ? 'admin' : 'staff'} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/admin"
            element={
              authLoading ? (
                <div className="min-h-screen flex items-center justify-center bg-background"><span className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
              ) : currentUser && currentUser.role === 'admin' ? (
                <AdminPage />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </div>

      {/* Authentication Modal Popup */}
      <AnimatePresence>
        {isAuthOpen && (
          <AuthModal 
            isOpen={isAuthOpen} 
            onClose={handleAuthClose}
            onLoginSuccess={handleLoginSuccess}
            initialView={authInitialView}
            initialEmail={authInitialEmail}
          />
        )}
      </AnimatePresence>

      {/* Popping Toast Notifications */}
      <Toaster position="top-right" expand={true} />

    </div>
  );
}
