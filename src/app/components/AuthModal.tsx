import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Mail, Shield, User, ChefHat } from 'lucide-react';
import { mockDb, UserProfile } from '../utils/mockDb';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    const user = mockDb.login(email);
    if (user) {
      onLoginSuccess(user);
      onClose();
    } else {
      setError('Something went wrong during login.');
    }
  };

  const handleQuickLogin = (quickEmail: string) => {
    setEmail(quickEmail);
    const user = mockDb.login(quickEmail);
    if (user) {
      onLoginSuccess(user);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="bg-card border border-border/30 rounded-2xl w-full max-w-[420px] shadow-2xl overflow-hidden relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-accent/10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 md:p-8">
          <div className="text-center mb-6">
            <h3 className="font-display text-2xl font-bold mb-1 text-foreground">Welcome to Flavoré</h3>
            <p className="text-xs text-muted-foreground">Sign in to manage reservations, order food, and access dashboards.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground/80 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary border border-border/30 text-sm focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/40 text-foreground transition-all"
                />
              </div>
              {error && <p className="text-[11px] text-destructive mt-1.5 font-medium">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:shadow-md hover:bg-accent/90 transition-all cursor-pointer"
            >
              Continue with Email
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground text-[10px] tracking-wider font-semibold">Demo Role Logins</span>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => handleQuickLogin('admin@flavore.com')}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-secondary/60 hover:bg-secondary border border-border/10 text-left transition-all text-xs font-medium text-foreground hover:border-accent/20 cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-accent group-hover:scale-105 transition-transform" />
                <div>
                  <div className="font-semibold text-foreground">Admin Portal</div>
                  <div className="text-[10px] text-muted-foreground">Manage menu, reservations & sales</div>
                </div>
              </div>
              <span className="text-[10px] text-accent/80 font-bold bg-accent/10 px-2 py-0.5 rounded-full">admin@flavore.com</span>
            </button>

            <button
              onClick={() => handleQuickLogin('staff@flavore.com')}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-secondary/60 hover:bg-secondary border border-border/10 text-left transition-all text-xs font-medium text-foreground hover:border-accent/20 cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <ChefHat className="w-4 h-4 text-accent group-hover:scale-105 transition-transform" />
                <div>
                  <div className="font-semibold text-foreground">Kitchen / Staff Portal</div>
                  <div className="text-[10px] text-muted-foreground">Update order statuses in real-time</div>
                </div>
              </div>
              <span className="text-[10px] text-accent/80 font-bold bg-accent/10 px-2 py-0.5 rounded-full">staff@flavore.com</span>
            </button>

            <button
              onClick={() => handleQuickLogin('customer@flavore.com')}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-secondary/60 hover:bg-secondary border border-border/10 text-left transition-all text-xs font-medium text-foreground hover:border-accent/20 cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-accent group-hover:scale-105 transition-transform" />
                <div>
                  <div className="font-semibold text-foreground">Customer Account</div>
                  <div className="text-[10px] text-muted-foreground">Book tables and order gourmet meals</div>
                </div>
              </div>
              <span className="text-[10px] text-accent/80 font-bold bg-accent/10 px-2 py-0.5 rounded-full">customer@flavore.com</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
