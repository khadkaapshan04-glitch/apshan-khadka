import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Sparkles, Utensils, Zap, Shield, CheckCircle2, RotateCw } from 'lucide-react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  spin: number;
  type: 'ember' | 'flame' | 'spice' | 'smoke';
}

interface Culinary3DCookingStationProps {
  stage: 'ignite' | 'sear' | 'spice' | 'plated';
  onAdvanceStage: (nextStage?: 'ignite' | 'sear' | 'spice' | 'plated') => void;
  heatLevel: number;
  setHeatLevel: React.Dispatch<React.SetStateAction<number>>;
  spiceCount: number;
  setSpiceCount: React.Dispatch<React.SetStateAction<number>>;
  searProgress: number;
  setSearProgress: React.Dispatch<React.SetStateAction<number>>;
}

export const Culinary3DCookingStation: React.FC<Culinary3DCookingStationProps> = ({
  stage,
  onAdvanceStage,
  heatLevel,
  setHeatLevel,
  spiceCount,
  setSpiceCount,
  searProgress,
  setSearProgress,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Mouse Parallax 3D State
  const [rotateX, setRotateX] = useState(15);
  const [rotateY, setRotateY] = useState(-10);
  const [isFlipping, setIsFlipping] = useState(false);
  const [sizzleEffect, setSizzleEffect] = useState(false);

  // Handle Mouse Move 3D Parallax
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || isFlipping) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rX = -(y / (rect.height / 2)) * 18 + 12; // tilt X
    const rY = (x / (rect.width / 2)) * 22;      // tilt Y

    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseLeave = () => {
    if (isFlipping) return;
    setRotateX(15);
    setRotateY(-10);
  };

  // Canvas Ember & Flame Particle System
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: Particle[] = [];

    const spawnParticles = () => {
      const centerX = width / 2;
      const centerY = height / 2 + 30;

      // Number of sparks depends on heat level & stage
      const count = heatLevel > 50 ? 4 : 2;

      for (let i = 0; i < count; i++) {
        const isSpice = stage === 'spice' && Math.random() > 0.4;
        const color = isSpice
          ? ['#f59e0b', '#fbbf24', '#d97706', '#fef08a'][Math.floor(Math.random() * 4)]
          : ['#ef4444', '#f97316', '#f59e0b', '#dc2626'][Math.floor(Math.random() * 4)];

        particles.push({
          x: centerX + (Math.random() - 0.5) * 160,
          y: centerY + (Math.random() - 0.5) * 60,
          vx: (Math.random() - 0.5) * (heatLevel / 20 + 1.5),
          vy: -Math.random() * (heatLevel / 15 + 2) - 1,
          size: Math.random() * (isSpice ? 4 : 5) + 2,
          color,
          alpha: 1,
          decay: Math.random() * 0.02 + 0.01,
          spin: (Math.random() - 0.5) * 0.1,
          type: isSpice ? 'spice' : 'flame',
        });
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Spawn new sparks
      if (heatLevel > 10 || stage !== 'ignite') {
        spawnParticles();
      }

      // Update & Draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0 || p.y < 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.fillStyle = p.color;

        ctx.beginPath();
        if (p.type === 'spice') {
          // Draw diamond/star spice dust
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        } else {
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [heatLevel, stage]);

  // Click Skillet Flip / Sear Action
  const triggerSkilletFlip = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setSizzleEffect(true);

    if (stage === 'ignite') {
      setHeatLevel((prev) => Math.min(prev + 30, 100));
      if (heatLevel + 30 >= 90) {
        onAdvanceStage('sear');
      }
    } else if (stage === 'sear') {
      setSearProgress((prev) => {
        const next = Math.min(prev + 34, 100);
        if (next >= 100) onAdvanceStage('spice');
        return next;
      });
    } else if (stage === 'spice') {
      setSpiceCount((prev) => {
        const next = Math.min(prev + 1, 5);
        if (next >= 5) onAdvanceStage('plated');
        return next;
      });
    }

    setTimeout(() => {
      setIsFlipping(false);
      setSizzleEffect(false);
    }, 900);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-[520px] md:h-[600px] flex items-center justify-center select-none cursor-pointer overflow-visible"
    >
      {/* Dynamic Background Ember Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-10"
      />

      {/* Radial Heat Aura */}
      <div
        className="absolute w-[450px] h-[450px] rounded-full pointer-events-none transition-all duration-700 blur-3xl opacity-50"
        style={{
          background:
            stage === 'plated'
              ? 'radial-gradient(circle, rgba(245,158,11,0.4) 0%, rgba(217,119,6,0.15) 50%, transparent 80%)'
              : `radial-gradient(circle, rgba(239,68,68,${heatLevel / 180 + 0.2}) 0%, rgba(249,115,22,${heatLevel / 250 + 0.1}) 50%, transparent 80%)`,
        }}
      />

      {/* Sizzle Wave Ring */}
      <AnimatePresence>
        {sizzleEffect && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0.9 }}
            animate={{ scale: 2.2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute w-[320px] h-[320px] rounded-full border-2 border-amber-400/80 shadow-[0_0_30px_rgba(245,158,11,0.6)] pointer-events-none z-20"
          />
        )}
      </AnimatePresence>

      {/* 3D PERSPECTIVE STAGE */}
      <div
        className="relative w-full max-w-[500px] h-[400px] flex items-center justify-center transition-transform duration-300 ease-out"
        style={{
          perspective: 1200,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* 3D SKILLET & FOOD CONTAINER */}
        <motion.div
          onClick={triggerSkilletFlip}
          animate={{
            rotateX: isFlipping ? [rotateX, rotateX - 45, rotateX + 360] : rotateX,
            rotateY: isFlipping ? [rotateY, rotateY + 180, rotateY] : rotateY,
            y: isFlipping ? [-20, -120, 0] : [0, -10, 0],
            scale: isFlipping ? [1, 1.15, 1] : 1,
          }}
          transition={{
            duration: isFlipping ? 0.9 : 4,
            ease: isFlipping ? [0.22, 1, 0.36, 1] : 'easeInOut',
            repeat: isFlipping ? 0 : Infinity,
            repeatType: 'reverse',
          }}
          className="relative w-[340px] h-[340px] md:w-[400px] md:h-[400px] flex items-center justify-center group cursor-pointer"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Cast Shadow beneath Skillet */}
          <div
            className="absolute -bottom-10 w-[80%] h-[30px] bg-black/60 rounded-[100%] blur-2xl transition-all duration-300 group-hover:bg-black/80"
            style={{ transform: 'translateZ(-100px)' }}
          />

          {/* Glowing Heat Coil Ring */}
          <div
            className="absolute w-[330px] h-[330px] rounded-full border-4 border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.4)] animate-pulse"
            style={{ transform: 'translateZ(-40px) rotateX(70deg)' }}
          />

          {/* Skillet Handle */}
          <div
            className="absolute top-1/2 left-[-110px] -translate-y-1/2 w-[150px] h-[28px] bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-950 rounded-l-full border border-zinc-700/50 shadow-2xl origin-right flex items-center pl-3"
            style={{ transform: 'translateZ(10px) rotateY(-15deg)' }}
          >
            <div className="w-4 h-4 rounded-full bg-zinc-950 border border-zinc-600 shadow-inner" />
          </div>

          {/* Outer Skillet Rim */}
          <div
            className="relative w-full h-full rounded-full border-[10px] border-zinc-800/90 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black shadow-[0_25px_60px_rgba(0,0,0,0.8),inset_0_4px_25px_rgba(255,255,255,0.1)] flex items-center justify-center overflow-hidden"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Inner Pan Surface */}
            <div className="relative w-[90%] h-[90%] rounded-full bg-gradient-to-br from-zinc-950 via-black to-zinc-900 border border-zinc-800 shadow-inner flex items-center justify-center overflow-hidden">
              {/* Flame Grid Glow inside pan */}
              <div
                className="absolute inset-0 opacity-40 mix-blend-screen bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.6)_0%,transparent_70%)] animate-pulse"
              />

              {/* Searing Dish Image */}
              <motion.div
                animate={{
                  rotate: stage === 'plated' ? [0, 360] : 0,
                  scale: sizzleEffect ? [1, 1.06, 1] : 1,
                }}
                transition={{
                  rotate: { duration: 25, repeat: Infinity, ease: 'linear' },
                  scale: { duration: 0.3 },
                }}
                className="relative w-[78%] h-[78%] rounded-full overflow-hidden shadow-2xl border-2 border-amber-500/30"
              >
                <img
                  src={
                    stage === 'plated'
                      ? 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800' // Gourmet Prime Wagyu
                      : stage === 'spice'
                      ? 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&q=80&w=800' // Salmon Searing
                      : 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=800' // Gourmet Dish
                  }
                  alt="3D Culinary Dish"
                  className="w-full h-full object-cover transform scale-110"
                />

                {/* Sizzle Steam Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-amber-500/10 to-transparent pointer-events-none" />

                {/* Heat Sear Gloss Effect */}
                <div className="absolute -top-full left-0 w-full h-full bg-gradient-to-b from-transparent via-white/20 to-transparent transform -skew-y-12 animate-shimmer" />
              </motion.div>
            </div>
          </div>

          {/* Interactive Action Prompt Badge on Pan */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -bottom-6 px-5 py-2.5 rounded-full bg-zinc-950/90 backdrop-blur-md border border-amber-500/50 shadow-[0_10px_25px_rgba(0,0,0,0.6)] flex items-center gap-2 text-amber-300 text-xs font-bold tracking-wide pointer-events-none z-30"
          >
            <RotateCw className="w-4 h-4 animate-spin text-amber-400" />
            <span>
              {stage === 'ignite' && 'CLICK SKILLET TO IGNITE FLAME 🔥'}
              {stage === 'sear' && 'CLICK TO FLIP & SEAR WAGYU 🥩'}
              {stage === 'spice' && 'CLICK TO SPRINKLE GOLD SPICE ✨'}
              {stage === 'plated' && 'CUISINE PERFECTED! READY TO ENTER 👑'}
            </span>
          </motion.div>
        </motion.div>

        {/* 3D ORBITING FLOATING INGREDIENTS */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* 3D Floating Item 1: Chili Flame */}
          <motion.div
            animate={{
              y: [-15, 15, -15],
              rotateZ: [-10, 15, -10],
              rotateY: [0, 360],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-4 left-0 w-16 h-16 rounded-2xl bg-zinc-900/80 border border-red-500/40 p-2 shadow-[0_0_20px_rgba(239,68,68,0.3)] backdrop-blur-md flex items-center justify-center text-red-400"
            style={{ transform: 'translateZ(80px)' }}
          >
            <Flame className="w-8 h-8 text-red-500" />
          </motion.div>

          {/* 3D Floating Item 2: Gold Spice Orb */}
          <motion.div
            animate={{
              y: [15, -15, 15],
              rotateZ: [10, -15, 10],
              rotateY: [360, 0],
            }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-10 right-2 w-16 h-16 rounded-2xl bg-zinc-900/80 border border-amber-500/40 p-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] backdrop-blur-md flex items-center justify-center text-amber-400"
            style={{ transform: 'translateZ(100px)' }}
          >
            <Sparkles className="w-8 h-8 text-amber-400" />
          </motion.div>

          {/* 3D Floating Item 3: Gourmet Fork & Knife */}
          <motion.div
            animate={{
              y: [-20, 20, -20],
              rotateZ: [5, -10, 5],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-6 right-8 w-16 h-16 rounded-2xl bg-zinc-900/80 border border-emerald-500/40 p-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] backdrop-blur-md flex items-center justify-center text-emerald-400"
            style={{ transform: 'translateZ(90px)' }}
          >
            <Utensils className="w-8 h-8 text-emerald-400" />
          </motion.div>

          {/* 3D Floating Item 4: Master Chef Emblem */}
          <motion.div
            animate={{
              y: [20, -20, 20],
              rotateZ: [-5, 10, -5],
            }}
            transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-10 left-6 w-16 h-16 rounded-2xl bg-zinc-900/80 border border-amber-400/40 p-2 shadow-[0_0_20px_rgba(251,191,36,0.3)] backdrop-blur-md flex items-center justify-center text-amber-300"
            style={{ transform: 'translateZ(110px)' }}
          >
            <Shield className="w-8 h-8 text-amber-300" />
          </motion.div>
        </div>
      </div>
    </div>
  );
};
