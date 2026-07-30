import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useNavigate } from 'react-router-dom';

/* ═══════════════════════════════════════════════════════════
   CANVAS: Layered Particle System
   Renders embers, golden dust motes, and soft smoke wisps
   ═══════════════════════════════════════════════════════════ */
interface Particle {
  x: number; y: number; vx: number; vy: number;
  size: number; alpha: number; maxAlpha: number;
  decay: number; color: string; glow: number;
  type: 'ember' | 'dust' | 'smoke';
  wobblePhase: number; wobbleSpeed: number;
}

function useParticleCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  active: boolean,
  mouseRef: React.MutableRefObject<{ x: number; y: number }>
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    const particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const emberColors = ['#f59e0b', '#ef4444', '#f97316', '#fbbf24', '#dc2626'];
    const dustColors = ['#fbbf24', '#f59e0b', '#fef08a', '#d4a574'];

    const spawn = () => {
      if (!active) return;

      // Embers from bottom center
      if (Math.random() < 0.4) {
        const cx = canvas.width / 2 + (Math.random() - 0.5) * canvas.width * 0.4;
        particles.push({
          x: cx, y: canvas.height + 5,
          vx: (Math.random() - 0.5) * 1.2,
          vy: -Math.random() * 1.8 - 0.8,
          size: Math.random() * 3.5 + 1,
          alpha: 0, maxAlpha: Math.random() * 0.8 + 0.2,
          decay: Math.random() * 0.003 + 0.002,
          color: emberColors[Math.floor(Math.random() * emberColors.length)],
          glow: Math.random() * 18 + 6,
          type: 'ember',
          wobblePhase: Math.random() * Math.PI * 2,
          wobbleSpeed: Math.random() * 0.03 + 0.01,
        });
      }

      // Golden dust motes everywhere
      if (Math.random() < 0.15) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3 - 0.1,
          size: Math.random() * 2 + 0.5,
          alpha: 0, maxAlpha: Math.random() * 0.5 + 0.1,
          decay: Math.random() * 0.002 + 0.001,
          color: dustColors[Math.floor(Math.random() * dustColors.length)],
          glow: Math.random() * 8 + 2,
          type: 'dust',
          wobblePhase: Math.random() * Math.PI * 2,
          wobbleSpeed: Math.random() * 0.02 + 0.005,
        });
      }

      // Soft smoke wisps from center dish area
      if (Math.random() < 0.08) {
        const cx = canvas.width / 2 + (Math.random() - 0.5) * 120;
        const cy = canvas.height / 2 - 40;
        particles.push({
          x: cx, y: cy,
          vx: (Math.random() - 0.5) * 0.4,
          vy: -Math.random() * 0.6 - 0.2,
          size: Math.random() * 30 + 15,
          alpha: 0, maxAlpha: Math.random() * 0.06 + 0.02,
          decay: Math.random() * 0.0008 + 0.0003,
          color: 'rgba(200,180,150,1)',
          glow: 0,
          type: 'smoke',
          wobblePhase: Math.random() * Math.PI * 2,
          wobbleSpeed: Math.random() * 0.008 + 0.003,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      spawn();

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Fade in then fade out
        if (p.alpha < p.maxAlpha && p.decay > 0) {
          p.alpha = Math.min(p.alpha + p.decay * 3, p.maxAlpha);
        }

        // Wobble motion
        p.wobblePhase += p.wobbleSpeed;
        const wobbleX = Math.sin(p.wobblePhase) * (p.type === 'smoke' ? 0.3 : 0.8);

        p.x += p.vx + wobbleX;
        p.y += p.vy;

        // Mouse repulsion for embers & dust
        if (p.type !== 'smoke') {
          const mx = mouseRef.current.x * canvas.width;
          const my = mouseRef.current.y * canvas.height;
          const dx = p.x - mx;
          const dy = p.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120 && dist > 0) {
            const force = (120 - dist) / 120 * 0.3;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        // Decay after reaching max
        if (p.alpha >= p.maxAlpha) {
          p.alpha -= p.decay;
        }

        if (p.alpha <= 0 || p.y < -50) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;

        if (p.type === 'smoke') {
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          grad.addColorStop(0, 'rgba(200,180,150,0.15)');
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = p.glow;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [canvasRef, active, mouseRef]);
}

/* ═══════════════════════════════════════════════════════════
   3D HERO DISH — The centerpiece
   Multi-layered rotating plate with parallax depth, glow
   rings, steam aura, and dramatic lighting
   ═══════════════════════════════════════════════════════════ */
const HeroDish: React.FC<{ tiltX: number; tiltY: number }> = ({ tiltX, tiltY }) => {
  return (
    <motion.div
      className="relative"
      style={{ perspective: 1400, transformStyle: 'preserve-3d' }}
    >
      {/* Outermost ambient glow */}
      <motion.div
        className="absolute -inset-32 rounded-full pointer-events-none"
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, rgba(217,119,6,0.05) 40%, transparent 70%)',
        }}
      />

      {/* Rotating light ray ring — far orbit */}
      <motion.div
        className="absolute -inset-24 pointer-events-none"
        animate={{ rotateZ: [0, 360] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        style={{ transformStyle: 'preserve-3d', transform: `rotateX(${tiltX * 0.3}deg) rotateY(${tiltY * 0.3}deg)` }}
      >
        <div className="absolute inset-0 rounded-full border border-amber-500/[0.07]" />
        {/* Light dot orbiting */}
        <div className="absolute w-2 h-2 rounded-full bg-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.6)] top-0 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </motion.div>

      {/* Rotating light ray ring — mid orbit */}
      <motion.div
        className="absolute -inset-14 pointer-events-none"
        animate={{ rotateZ: [360, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        style={{ transformStyle: 'preserve-3d', transform: `rotateX(${tiltX * 0.4}deg) rotateY(${tiltY * 0.4}deg)` }}
      >
        <div className="absolute inset-0 rounded-full border border-amber-400/[0.1]" />
        <div className="absolute w-1.5 h-1.5 rounded-full bg-amber-300/70 shadow-[0_0_12px_rgba(251,191,36,0.7)] bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2" />
        <div className="absolute w-1 h-1 rounded-full bg-amber-400/50 shadow-[0_0_8px_rgba(245,158,11,0.5)] top-1/2 right-0 translate-x-1/2 -translate-y-1/2" />
      </motion.div>

      {/* THE 3D PLATE */}
      <motion.div
        className="relative w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] md:w-[440px] md:h-[440px]"
        animate={{ rotateX: tiltX, rotateY: tiltY }}
        transition={{ type: 'spring', stiffness: 50, damping: 18 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Shadow beneath plate */}
        <motion.div
          className="absolute -bottom-10 left-1/2 w-[70%] h-[20px] bg-black/60 rounded-[100%] blur-2xl"
          style={{ transform: 'translateX(-50%) translateZ(-100px)' }}
          animate={{ scaleX: [1, 1.15, 1], opacity: [0.4, 0.65, 0.4] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Plate back face (gives 3D thickness illusion) */}
        <div
          className="absolute inset-0 rounded-full bg-zinc-900 border border-zinc-800/50"
          style={{ transform: 'translateZ(-12px)' }}
        />

        {/* Plate rim — outer ring */}
        <div className="absolute inset-0 rounded-full border-[7px] border-zinc-800/90 bg-gradient-to-b from-zinc-800 via-zinc-900 to-zinc-950 shadow-[0_20px_80px_rgba(0,0,0,0.9),inset_0_2px_15px_rgba(255,255,255,0.06)] overflow-hidden">
          {/* Rim engraving detail */}
          <div className="absolute inset-[3px] rounded-full border border-zinc-700/20" />

          {/* Inner cooking surface */}
          <div className="absolute inset-[7%] rounded-full bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-zinc-800/40 shadow-[inset_0_4px_30px_rgba(0,0,0,0.7)] overflow-hidden">
            {/* Pulsing heat core glow */}
            <motion.div
              className="absolute inset-0"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                background: 'radial-gradient(circle at 45% 45%, rgba(245,158,11,0.2) 0%, rgba(217,119,6,0.08) 40%, transparent 70%)',
              }}
            />

            {/* FOOD IMAGE */}
            <motion.div
              className="absolute inset-[8%] rounded-full overflow-hidden border-2 border-amber-500/15 shadow-[0_0_40px_rgba(245,158,11,0.15)]"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
            >
              <img
                src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=900"
                alt="Gourmet cuisine"
                className="w-full h-full object-cover scale-[1.15]"
                loading="eager"
              />
              {/* Warm color grade overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-900/15 via-transparent to-amber-500/10 mix-blend-overlay pointer-events-none" />
            </motion.div>

            {/* Shine sweep across food */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{ x: ['-120%', '220%'] }}
              transition={{ duration: 4, repeat: Infinity, repeatDelay: 5, ease: 'easeInOut' }}
            >
              <div className="w-[40%] h-full bg-gradient-to-r from-transparent via-white/12 to-transparent -skew-x-12" />
            </motion.div>

            {/* Steam / heat distortion overlay */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{ opacity: [0.02, 0.06, 0.02], y: [-2, -8, -2] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                background: 'linear-gradient(to top, transparent 50%, rgba(255,255,255,0.04) 100%)',
              }}
            />
          </div>
        </div>

        {/* Elliptical glow ring at base (heat coil) */}
        <motion.div
          className="absolute -inset-1 rounded-full pointer-events-none"
          style={{ transform: 'rotateX(80deg) translateZ(-30px)' }}
          animate={{ opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-full h-full rounded-full border-2 border-amber-500/30 shadow-[0_0_25px_rgba(245,158,11,0.25)]" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════
   FLOATING CULINARY ELEMENT
   Gorgeous 3D floating items around the dish
   ═══════════════════════════════════════════════════════════ */
const FloatingItem: React.FC<{
  children: React.ReactNode;
  x: string; y: string; z: number;
  duration: number; delay: number;
  orbitRadius?: number;
}> = ({ children, x, y, z, duration, delay, orbitRadius = 0 }) => (
  <motion.div
    className="absolute pointer-events-none select-none"
    style={{
      left: x, top: y,
      transform: `translateZ(${z}px)`,
      filter: `drop-shadow(0 0 ${8 + z / 12}px rgba(245,158,11,0.25))`,
    }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 0.85, 0.85, 0.6, 0.85],
      scale: [0, 1, 1.05, 0.95, 1],
      y: [0, -15, 5, -20, 0],
      x: orbitRadius ? [0, orbitRadius, 0, -orbitRadius, 0] : undefined,
      rotateZ: [0, 8, -5, 10, 0],
    }}
    transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
  >
    {children}
  </motion.div>
);

/* ═══════════════════════════════════════════════════════════
   CULINARY LANDING PAGE — Main Export
   ═══════════════════════════════════════════════════════════ */
export const CulinaryLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseNorm = useRef({ x: 0.5, y: 0.5 });

  const [isWarping, setIsWarping] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Smooth mouse tracking via spring physics
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 40, damping: 25 });
  const springY = useSpring(rawY, { stiffness: 40, damping: 25 });
  const tiltX = useTransform(springY, (v) => -v * 18 + 10);
  const tiltY = useTransform(springX, (v) => v * 22);

  // State mirrors for passing into component props
  const [tiltState, setTiltState] = useState({ x: 10, y: 0 });

  useEffect(() => {
    const unsubX = tiltX.on('change', (x) => setTiltState((s) => ({ ...s, x })));
    const unsubY = tiltY.on('change', (y) => setTiltState((s) => ({ ...s, y })));
    return () => { unsubX(); unsubY(); };
  }, [tiltX, tiltY]);

  useParticleCanvas(canvasRef, !isWarping, mouseNorm);

  // Intro reveal
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 300);
    return () => clearTimeout(t);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const nx = e.clientX / window.innerWidth;
    const ny = e.clientY / window.innerHeight;
    mouseNorm.current = { x: nx, y: ny };
    rawX.set(nx - 0.5);
    rawY.set(ny - 0.5);
  }, [rawX, rawY]);

  const handleEnter = useCallback(() => {
    if (isWarping) return;
    setIsWarping(true);
    setTimeout(() => navigate('/'), 1100);
  }, [isWarping, navigate]);

  return (
    <div
      onClick={handleEnter}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 bg-zinc-950 cursor-pointer overflow-hidden select-none"
    >
      {/* ── DEEP AMBIENT LAYERS ── */}
      <div className="absolute inset-0">
        {/* Warm spotlight from top-left */}
        <motion.div
          className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full"
          animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.08, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 65%)', filter: 'blur(60px)' }}
        />
        {/* Cool accent from bottom-right */}
        <motion.div
          className="absolute -bottom-[15%] -right-[10%] w-[60vw] h-[60vw] rounded-full"
          animate={{ opacity: [0.3, 0.5, 0.3], scale: [1.05, 0.95, 1.05] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.04) 0%, transparent 60%)', filter: 'blur(80px)' }}
        />
        {/* Center dish warm wash */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] rounded-full"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ background: 'radial-gradient(circle, rgba(217,119,6,0.08) 0%, transparent 55%)', filter: 'blur(40px)' }}
        />
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(9,9,11,0.92)_100%)]" />
      </div>

      {/* ── PARTICLE CANVAS ── */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />

      {/* ── FLOATING CULINARY ELEMENTS ── */}
      <div className="absolute inset-0 z-20 pointer-events-none" style={{ perspective: 1000, transformStyle: 'preserve-3d' }}>
        <FloatingItem x="6%" y="18%" z={90} duration={7} delay={0}>
          <span className="text-4xl">🔥</span>
        </FloatingItem>
        <FloatingItem x="85%" y="12%" z={70} duration={8.5} delay={1}>
          <span className="text-3xl">🌿</span>
        </FloatingItem>
        <FloatingItem x="3%" y="68%" z={100} duration={6} delay={0.5} orbitRadius={10}>
          <span className="text-4xl">🍳</span>
        </FloatingItem>
        <FloatingItem x="90%" y="62%" z={80} duration={7.5} delay={2}>
          <span className="text-3xl">🌶️</span>
        </FloatingItem>
        <FloatingItem x="18%" y="82%" z={60} duration={9} delay={1.5}>
          <span className="text-2xl">✨</span>
        </FloatingItem>
        <FloatingItem x="78%" y="80%" z={85} duration={6.5} delay={0.8}>
          <span className="text-3xl">🧂</span>
        </FloatingItem>
        <FloatingItem x="12%" y="42%" z={110} duration={8} delay={3} orbitRadius={8}>
          <span className="text-3xl">🥩</span>
        </FloatingItem>
        <FloatingItem x="88%" y="35%" z={75} duration={7} delay={2.2}>
          <span className="text-3xl">🍷</span>
        </FloatingItem>
        <FloatingItem x="50%" y="5%" z={65} duration={10} delay={4}>
          <span className="text-2xl">🫒</span>
        </FloatingItem>
        <FloatingItem x="35%" y="88%" z={95} duration={7} delay={1.8}>
          <span className="text-2xl">🧄</span>
        </FloatingItem>
      </div>

      {/* ── CENTER STAGE ── */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center z-30 pointer-events-none"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={loaded ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* 3D Hero Dish */}
        <HeroDish tiltX={tiltState.x} tiltY={tiltState.y} />

        {/* Brand Title */}
        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={loaded ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="font-display font-black text-5xl sm:text-7xl md:text-8xl text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-amber-600 tracking-[0.15em] leading-none">
            Flavoré
          </h1>
          <motion.div
            className="flex items-center justify-center gap-3 mt-4"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={loaded ? { opacity: 1, scaleX: 1 } : {}}
            transition={{ delay: 1.4, duration: 0.8 }}
          >
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-amber-500/50" />
            <p className="text-amber-400/60 text-[10px] sm:text-xs tracking-[0.4em] uppercase font-semibold">
              Fine Dining
            </p>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-amber-500/50" />
          </motion.div>
        </motion.div>

        {/* Tap hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={loaded ? { opacity: [0, 0.5, 0.3, 0.5] } : {}}
          transition={{ delay: 2.5, duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="mt-10 text-zinc-600 text-[10px] tracking-[0.35em] uppercase font-medium"
        >
          tap anywhere to enter
        </motion.p>
      </motion.div>

      {/* ── HYPER-WARP PORTAL ── */}
      <AnimatePresence>
        {isWarping && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.9, 0] }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-white z-[9998] pointer-events-none"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.01, borderRadius: '50%' }}
              animate={{ opacity: [0, 1, 1], scale: [0.01, 1, 25] }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-[9999] bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center pointer-events-none"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25, duration: 0.4 }}
                className="text-zinc-950 font-display font-black text-3xl sm:text-4xl tracking-[0.25em] uppercase"
              >
                FLAVORÉ
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
