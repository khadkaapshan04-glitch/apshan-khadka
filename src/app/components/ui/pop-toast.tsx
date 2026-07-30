import React from 'react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { LogOut, UserCheck, Shield, ChefHat } from 'lucide-react';

interface LoginNotifyProps {
  name: string;
  role?: string;
  email?: string;
}

export const showLoginNotification = ({ name, role = 'customer', email }: LoginNotifyProps) => {
  toast.custom(
    (id) => (
      <motion.div
        initial={{ scale: 0.5, opacity: 0, y: -30 }}
        animate={{ scale: [0.5, 1.1, 1], opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: -20 }}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        className="relative overflow-hidden flex items-center gap-3.5 p-4 pr-5 rounded-2xl bg-zinc-950/95 backdrop-blur-2xl border border-amber-500/40 text-zinc-100 shadow-[0_12px_40px_rgba(0,0,0,0.65),0_0_25px_rgba(217,119,6,0.25)] min-w-[310px] pointer-events-auto"
      >
        {/* Top ambient glow bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-90 animate-pulse" />

        {/* Icon Circle */}
        <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-700/30 border border-amber-500/40 text-amber-400 shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.35)]">
          {role === 'admin' ? (
            <Shield className="w-5 h-5 text-amber-400" />
          ) : role === 'staff' ? (
            <ChefHat className="w-5 h-5 text-amber-400" />
          ) : (
            <UserCheck className="w-5 h-5 text-amber-400" />
          )}
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </span>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-sm text-amber-200 tracking-wide">
              Welcome Back! 🎉
            </span>
            <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {role}
            </span>
          </div>
          <p className="text-xs font-semibold text-zinc-100 truncate mt-0.5">
            {name || 'Valued Guest'}
          </p>
          {email && (
            <p className="text-[11px] text-zinc-400 truncate mt-0.5">
              {email}
            </p>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={() => toast.dismiss(id)}
          className="text-zinc-400 hover:text-zinc-100 transition-colors p-1 rounded-lg hover:bg-zinc-800/60 text-xs font-semibold cursor-pointer shrink-0"
        >
          ✕
        </button>
      </motion.div>
    ),
    { duration: 4500 }
  );
};

export const showLogoutNotification = ({ name }: { name?: string }) => {
  toast.custom(
    (id) => (
      <motion.div
        initial={{ scale: 0.5, opacity: 0, y: -30 }}
        animate={{ scale: [0.5, 1.1, 1], opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: -20 }}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        className="relative overflow-hidden flex items-center gap-3.5 p-4 pr-5 rounded-2xl bg-zinc-950/95 backdrop-blur-2xl border border-rose-500/40 text-zinc-100 shadow-[0_12px_40px_rgba(0,0,0,0.65),0_0_25px_rgba(244,63,94,0.25)] min-w-[310px] pointer-events-auto"
      >
        {/* Top ambient glow bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-rose-400 to-transparent opacity-90" />

        {/* Icon Circle */}
        <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500/20 to-rose-700/30 border border-rose-500/40 text-rose-400 shrink-0 shadow-[0_0_15px_rgba(244,63,94,0.35)]">
          <LogOut className="w-5 h-5 text-rose-400" />
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="font-display font-bold text-sm text-rose-200 tracking-wide flex items-center gap-1.5">
            Logged Out 👋
          </div>
          <p className="text-xs font-medium text-zinc-300 truncate mt-0.5">
            {name ? `See you next time, ${name}!` : 'You have been safely logged out.'}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={() => toast.dismiss(id)}
          className="text-zinc-400 hover:text-zinc-100 transition-colors p-1 rounded-lg hover:bg-zinc-800/60 text-xs font-semibold cursor-pointer shrink-0"
        >
          ✕
        </button>
      </motion.div>
    ),
    { duration: 4000 }
  );
};
