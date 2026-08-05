import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ArrowLeft, UtensilsCrossed, Search, Sparkles } from 'lucide-react';

const FLOATING_ITEMS = ['🍜', '🥟', '🍛', '🫕', '🍲', '☕', '🥘', '🍷'];

function FloatingEmoji({ emoji, delay }: { emoji: string; delay: number }) {
  return (
    <motion.div
      className="absolute text-3xl select-none pointer-events-none opacity-20"
      initial={{ 
        x: Math.random() * 100 - 50, 
        y: Math.random() * 100 - 50,
        scale: 0,
        rotate: 0 
      }}
      animate={{ 
        x: [Math.random() * 300 - 150, Math.random() * 300 - 150, Math.random() * 300 - 150],
        y: [Math.random() * 300 - 150, Math.random() * 300 - 150, Math.random() * 300 - 150],
        scale: [0, 1, 0.6, 1, 0],
        rotate: [0, 180, 360],
      }}
      transition={{ 
        duration: 12 + Math.random() * 8,
        delay,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      style={{ 
        left: `${20 + Math.random() * 60}%`, 
        top: `${20 + Math.random() * 60}%` 
      }}
    >
      {emoji}
    </motion.div>
  );
}

export function NotFoundPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [glitchText, setGlitchText] = useState('404');

  useEffect(() => {
    const glitchChars = '!@#$%^&*()_+{}|:<>?';
    const interval = setInterval(() => {
      const shouldGlitch = Math.random() > 0.7;
      if (shouldGlitch) {
        const glitched = '404'.split('').map(c => 
          Math.random() > 0.5 ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : c
        ).join('');
        setGlitchText(glitched);
        setTimeout(() => setGlitchText('404'), 150);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
      {/* Ambient Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/3 rounded-full blur-[100px]" />
      </div>

      {/* Floating Food Emojis */}
      {FLOATING_ITEMS.map((emoji, i) => (
        <FloatingEmoji key={i} emoji={emoji} delay={i * 1.5} />
      ))}

      {/* Main Content */}
      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        {/* Glitchy 404 Number */}
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-6"
        >
          <span className="font-display text-[10rem] md:text-[14rem] font-black leading-none tracking-tighter bg-gradient-to-b from-accent/40 via-accent/15 to-transparent bg-clip-text text-transparent select-none">
            {glitchText}
          </span>
          
          {/* Decorative plate under the number */}
          <motion.div 
            className="absolute bottom-2 left-1/2 -translate-x-1/2 w-48 h-1.5 bg-gradient-to-r from-transparent via-accent/30 to-transparent rounded-full"
            animate={{ scaleX: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        {/* Icon & Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-5">
            <UtensilsCrossed className="w-3.5 h-3.5 text-accent" />
            <span className="text-[11px] text-accent font-bold uppercase tracking-widest">Page Not Found</span>
          </div>
          
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            This dish isn't on the menu
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            The page <code className="px-1.5 py-0.5 rounded bg-secondary text-accent text-xs font-mono">{location.pathname}</code> doesn't 
            exist. Perhaps it was moved, or you've wandered into the wrong kitchen.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8"
        >
          <button
            onClick={() => navigate('/home')}
            className="group flex items-center gap-2.5 px-6 py-3 bg-accent text-white rounded-xl font-semibold text-sm shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Go Home
            <Sparkles className="w-3.5 h-3.5 opacity-60" />
          </button>

          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2.5 px-6 py-3 bg-card border border-border/30 text-foreground rounded-xl font-semibold text-sm hover:border-accent/30 hover:bg-accent/5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Go Back
          </button>

          <button
            onClick={() => navigate('/menu')}
            className="group flex items-center gap-2.5 px-6 py-3 bg-card border border-border/30 text-foreground rounded-xl font-semibold text-sm hover:border-accent/30 hover:bg-accent/5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Browse Menu
          </button>
        </motion.div>

        {/* Subtle Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-16 text-[10px] text-muted-foreground/40 uppercase tracking-[0.3em] font-medium"
        >
          Flavoré • Fine Dining Experience
        </motion.p>
      </div>
    </div>
  );
}
