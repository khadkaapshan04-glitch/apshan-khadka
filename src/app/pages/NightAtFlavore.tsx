import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

/* ═══════════════════════════════════════════════════════════
   THE 5-SCENE STORY: "A NIGHT AT FLAVORÉ"
   Told from the guest's perspective
   ═══════════════════════════════════════════════════════════ */
const SCENES = [
  {
    id: 'arrival',
    duration: 4000,
    act: 'SCENE I',
    title: 'The city\ngrows quiet.',
    sub: 'You arrive.',
    color: '#d4a574',
    bg: 'from-zinc-950 via-zinc-900/40 to-zinc-950',
    particleColor: '#d4a574',
    icon: '🌙',
  },
  {
    id: 'ambiance',
    duration: 4000,
    act: 'SCENE II',
    title: 'Candlelight.',
    sub: 'Crystal. Linen.',
    color: '#f59e0b',
    bg: 'from-zinc-950 via-amber-950/30 to-zinc-950',
    particleColor: '#fbbf24',
    icon: '🕯️',
  },
  {
    id: 'chef',
    duration: 4000,
    act: 'SCENE III',
    title: 'Behind the pass,',
    sub: 'a story takes shape.',
    color: '#ef4444',
    bg: 'from-zinc-950 via-red-950/20 to-zinc-950',
    particleColor: '#f97316',
    icon: '👨‍🍳',
  },
  {
    id: 'moment',
    duration: 4200,
    act: 'SCENE IV',
    title: 'The dish lands.',
    sub: 'Time stops.',
    color: '#fbbf24',
    bg: 'from-zinc-950 via-amber-900/25 to-zinc-950',
    particleColor: '#fef08a',
    icon: '🍽️',
  },
  {
    id: 'memory',
    duration: 99999,
    act: 'SCENE V',
    title: 'A meal worth',
    sub: 'remembering.',
    color: '#d4a574',
    bg: 'from-zinc-950 via-zinc-900/50 to-zinc-950',
    particleColor: '#d4a574',
    icon: '✨',
  },
];

/* ─────────────────────────────────────────────────────
   SCENE I: Arrival — Drifting city light bokeh
   ───────────────────────────────────────────────────── */
function useBokehCanvas(ref: React.RefObject<HTMLCanvasElement | null>, active: boolean, color: string) {
  useEffect(() => {
    if (!active) return;
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    let raf: number;
    const W = canvas.width, H = canvas.height;
    type Orb = { x: number; y: number; r: number; vx: number; vy: number; alpha: number; };
    const orbs: Orb[] = Array.from({ length: 60 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 38 + 10,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.18,
      alpha: Math.random() * 0.12 + 0.04,
    }));
    const [r, g, b] = color === '#d4a574'
      ? [212, 165, 116] : color === '#fbbf24'
      ? [251, 191, 36] : [249, 115, 22];
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      orbs.forEach(o => {
        o.x += o.vx; o.y += o.vy;
        if (o.x < -60) o.x = W + 60;
        if (o.x > W + 60) o.x = -60;
        if (o.y < -60) o.y = H + 60;
        if (o.y > H + 60) o.y = -60;
        const g2 = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g2.addColorStop(0, `rgba(${r},${g},${b},${o.alpha})`);
        g2.addColorStop(1, 'transparent');
        ctx.fillStyle = g2;
        ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2); ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [active, ref, color]);
}

/* ─────────────────────────────────────────────────
   SCENE II: Ambiance — Candlelight flicker particles
   ───────────────────────────────────────────────── */
function useCandleCanvas(ref: React.RefObject<HTMLCanvasElement | null>, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    let raf: number;
    const W = canvas.width, H = canvas.height;
    type Spark = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; };
    const sparks: Spark[] = [];
    // 3 candles
    const candles = [W * 0.3, W * 0.5, W * 0.7];
    const draw = () => {
      ctx.fillStyle = 'rgba(9,9,11,0.18)';
      ctx.fillRect(0, 0, W, H);
      candles.forEach(cx => {
        // Candle flame glow
        const fg = ctx.createRadialGradient(cx, H * 0.62, 5, cx, H * 0.65, 80 + Math.sin(Date.now() * 0.003 + cx) * 15);
        fg.addColorStop(0, 'rgba(251,191,36,0.28)');
        fg.addColorStop(0.5, 'rgba(217,119,6,0.1)');
        fg.addColorStop(1, 'transparent');
        ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(cx, H * 0.65, 90, 0, Math.PI * 2); ctx.fill();
        // Spawn sparks
        if (Math.random() < 0.35) {
          sparks.push({ x: cx + (Math.random() - 0.5) * 10, y: H * 0.62, vx: (Math.random() - 0.5) * 0.8, vy: -(Math.random() * 1.2 + 0.5), life: 0, maxLife: 60 + Math.random() * 40, size: Math.random() * 2.5 + 0.5 });
        }
      });
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life++; s.x += s.vx + Math.sin(s.life * 0.12) * 0.4; s.y += s.vy;
        const a = 1 - s.life / s.maxLife;
        if (a <= 0) { sparks.splice(i, 1); continue; }
        ctx.save(); ctx.globalAlpha = a * 0.75;
        ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 8;
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [active, ref]);
}

/* ─────────────────────────────────────────────────
   SCENE III: The Chef — Steam & Sizzle particles
   ───────────────────────────────────────────────── */
function useSteamCanvas(ref: React.RefObject<HTMLCanvasElement | null>, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    let raf: number;
    const W = canvas.width, H = canvas.height;
    type Wisp = { x: number; y: number; vx: number; vy: number; size: number; alpha: number; spin: number; };
    const wisps: Wisp[] = [];
    const draw = () => {
      ctx.fillStyle = 'rgba(9,9,11,0.15)';
      ctx.fillRect(0, 0, W, H);
      // Sizzle glow at pan position
      const px = W / 2, py = H * 0.72;
      const sg = ctx.createRadialGradient(px, py, 0, px, py, 160 + Math.sin(Date.now() * 0.004) * 30);
      sg.addColorStop(0, 'rgba(239,68,68,0.22)');
      sg.addColorStop(0.4, 'rgba(249,115,22,0.1)');
      sg.addColorStop(1, 'transparent');
      ctx.fillStyle = sg; ctx.fillRect(px - 200, py - 200, 400, 300);
      // Spawn steam wisps
      if (Math.random() < 0.3) {
        wisps.push({ x: px + (Math.random() - 0.5) * 100, y: py - 20, vx: (Math.random() - 0.5) * 0.5, vy: -(Math.random() * 0.8 + 0.3), size: Math.random() * 35 + 18, alpha: 0.07 + Math.random() * 0.08, spin: (Math.random() - 0.5) * 0.02 });
      }
      for (let i = wisps.length - 1; i >= 0; i--) {
        const w = wisps[i];
        w.x += w.vx + Math.sin(Date.now() * 0.001 + i) * 0.3;
        w.y += w.vy; w.size += 0.6; w.alpha -= 0.001;
        if (w.alpha <= 0 || w.y < -80) { wisps.splice(i, 1); continue; }
        ctx.save(); ctx.globalAlpha = w.alpha;
        const wg = ctx.createRadialGradient(w.x, w.y, 0, w.x, w.y, w.size);
        wg.addColorStop(0, 'rgba(212,165,116,0.4)'); wg.addColorStop(1, 'transparent');
        ctx.fillStyle = wg; ctx.beginPath(); ctx.arc(w.x, w.y, w.size, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [active, ref]);
}

/* ─────────────────────────────────────────────────
   SCENE V CANVAS — Memory: Golden dust & star field
   ───────────────────────────────────────────────── */
function useMemoryCanvas(ref: React.RefObject<HTMLCanvasElement | null>, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    let raf: number;
    const W = canvas.width, H = canvas.height;
    type Star = { x: number; y: number; r: number; alpha: number; phase: number; speed: number; };
    const stars: Star[] = Array.from({ length: 120 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.5 + 0.4,
      alpha: Math.random() * 0.7 + 0.1,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.015 + 0.005,
    }));
    let t = 0;
    const draw = () => {
      t++;
      ctx.clearRect(0, 0, W, H);
      stars.forEach(s => {
        const a = s.alpha * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
        ctx.save(); ctx.globalAlpha = a;
        ctx.shadowColor = '#f59e0b'; ctx.shadowBlur = 6;
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [active, ref]);
}

/* ─────────────────────────────────────────────────
   ROTATING DISH (Scene IV)
   ───────────────────────────────────────────────── */
function SceneDish({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 60 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: -30 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex items-center justify-center"
          style={{ perspective: 1200 }}
        >
          {/* Ambient glow */}
          <motion.div
            className="absolute -inset-20 rounded-full pointer-events-none"
            animate={{ opacity: [0.3, 0.65, 0.3], scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.22) 0%, transparent 70%)' }}
          />
          {/* Shadow */}
          <motion.div
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[60%] h-[14px] bg-black/50 rounded-[100%] blur-xl"
            animate={{ scaleX: [1, 1.1, 1], opacity: [0.35, 0.55, 0.35] }}
            transition={{ duration: 2.8, repeat: Infinity }}
          />
          {/* Smoke wisps */}
          {[0, 1, 2].map(i => (
            <motion.div key={i} className="absolute bottom-[55%] pointer-events-none"
              style={{ left: `${36 + i * 13}%` }}
              animate={{ y: [-5, -65], opacity: [0, 0.15, 0], scaleX: [1, 1.9] }}
              transition={{ duration: 3.2, delay: i * 0.8, repeat: Infinity, ease: 'easeOut' }}
            >
              <div className="w-3 h-8 rounded-full bg-gradient-to-t from-zinc-400/15 to-transparent blur-md" />
            </motion.div>
          ))}
          {/* Plate */}
          <motion.div
            className="relative w-[260px] h-[260px] sm:w-[340px] sm:h-[340px] rounded-full border-[7px] border-zinc-800/90 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black shadow-[0_20px_70px_rgba(0,0,0,0.9),inset_0_2px_15px_rgba(255,255,255,0.05)] overflow-hidden"
            animate={{ rotateZ: [0, 360] }}
            transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
          >
            <div className="absolute inset-[8%] rounded-full overflow-hidden border border-amber-500/20">
              <img src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&q=80&w=800"
                alt="Fine dining dish"
                className="w-full h-full object-cover scale-110" />
              {/* Shine */}
              <motion.div className="absolute inset-0"
                animate={{ x: ['-120%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}>
                <div className="w-[35%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12" />
              </motion.div>
            </div>
            {/* Heat glow */}
            <motion.div className="absolute inset-0"
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{ background: 'radial-gradient(circle at 45% 45%, rgba(245,158,11,0.18) 0%, transparent 65%)' }} />
          </motion.div>
          {/* Orbit ring */}
          <motion.div
            className="absolute -inset-8 rounded-full border border-amber-400/20 pointer-events-none"
            style={{ transform: 'rotateX(72deg)' }}
            animate={{ rotateZ: [0, 360] }}
            transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────────
   FINAL SCENE: The Memory — Flavoré logo + CTA
   ───────────────────────────────────────────────── */
function SceneMemory({ active, onEnter }: { active: boolean; onEnter: () => void }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4 }}
          className="flex flex-col items-center gap-5 pointer-events-auto"
          onClick={onEnter}
        >
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.4, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="h-px w-24 bg-gradient-to-r from-transparent via-amber-400 to-transparent"
          />
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-400/40 flex items-center justify-center shadow-[0_0_45px_rgba(245,158,11,0.35)]"
          >
            <svg width="36" height="42" viewBox="0 0 26 30" fill="none">
              <motion.path d="M13 2 C13 2, 22 7, 22 16 C22 22, 18 27, 13 27 C8 27, 4 22, 4 16 C4 7, 13 2, 13 2Z"
                fill="#d4a574" opacity="0.22"
                animate={{ scale: [1, 1.07, 1] }}
                transition={{ duration: 3, repeat: Infinity }} />
              <path d="M13 3 C9 8, 6 13, 8 19 M13 3 C17 8, 20 13, 18 19 M13 3 L13 27"
                stroke="#d4a574" strokeWidth="1.6" strokeLinecap="round" fill="none" />
              <path d="M8 19 C10 22, 12 25, 13 27 C14 25, 16 22, 18 19"
                stroke="#d4a574" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            </svg>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 1 }}
            className="font-display font-black text-6xl sm:text-8xl text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-amber-600 tracking-[0.12em]"
          >
            Flavoré
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.8 }}
            className="flex items-center gap-3"
          >
            <div className="h-px w-10 bg-amber-500/35" />
            <p className="text-amber-400/55 text-[10px] tracking-[0.4em] uppercase font-semibold">Fine Dining · Est. 2018</p>
            <div className="h-px w-10 bg-amber-500/35" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.55, 0.3, 0.55] }}
            transition={{ delay: 2, duration: 2.5, repeat: Infinity }}
            className="text-zinc-500 text-[10px] tracking-[0.35em] uppercase font-medium mt-1"
          >
            tap anywhere to enter
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN EXPORT: NightAtFlavore Story Page
   ═══════════════════════════════════════════════════════════ */
export const NightAtFlavore: React.FC = () => {
  const navigate = useNavigate();
  const [sceneIndex, setSceneIndex] = useState(0);
  const [isWarping, setIsWarping] = useState(false);

  const bokehRef = useRef<HTMLCanvasElement | null>(null);
  const candleRef = useRef<HTMLCanvasElement | null>(null);
  const steamRef = useRef<HTMLCanvasElement | null>(null);
  const memoryRef = useRef<HTMLCanvasElement | null>(null);

  const scene = SCENES[sceneIndex];

  useBokehCanvas(bokehRef, sceneIndex === 0, scene.particleColor);
  useCandleCanvas(candleRef, sceneIndex === 1);
  useSteamCanvas(steamRef, sceneIndex === 2);
  useMemoryCanvas(memoryRef, sceneIndex === 4);

  // Auto-advance
  useEffect(() => {
    if (scene.duration === 99999) return;
    const t = setTimeout(() => setSceneIndex(i => Math.min(i + 1, SCENES.length - 1)), scene.duration);
    return () => clearTimeout(t);
  }, [sceneIndex, scene.duration]);

  const handleEnter = useCallback(() => {
    if (isWarping) return;
    setIsWarping(true);
    setTimeout(() => navigate('/home'), 1100);
  }, [isWarping, navigate]);

  return (
    <div
      className="fixed inset-0 overflow-hidden select-none bg-zinc-950"
      onClick={sceneIndex !== 4 ? handleEnter : undefined}
    >
      {/* Dynamic bg gradient */}
      <AnimatePresence mode="sync">
        <motion.div
          key={scene.id + '-bg'}
          className={`absolute inset-0 bg-gradient-to-b ${scene.bg}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.6 }}
        />
      </AnimatePresence>

      {/* Canvas Layers */}
      <canvas ref={bokehRef} className={`absolute inset-0 pointer-events-none z-10 transition-opacity duration-700 ${sceneIndex === 0 ? 'opacity-100' : 'opacity-0'}`} />
      <canvas ref={candleRef} className={`absolute inset-0 pointer-events-none z-10 transition-opacity duration-700 ${sceneIndex === 1 ? 'opacity-100' : 'opacity-0'}`} />
      <canvas ref={steamRef} className={`absolute inset-0 pointer-events-none z-10 transition-opacity duration-700 ${sceneIndex === 2 ? 'opacity-100' : 'opacity-0'}`} />
      <canvas ref={memoryRef} className={`absolute inset-0 pointer-events-none z-10 transition-opacity duration-700 ${sceneIndex === 4 ? 'opacity-100' : 'opacity-0'}`} />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(9,9,11,0.92)_100%)] pointer-events-none z-20" />

      {/* ── STAGE ── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-30 gap-0">

        {/* Scene IV: Dish */}
        <div className="absolute inset-0 flex items-center justify-center">
          <SceneDish active={sceneIndex === 3} />
        </div>

        {/* Scene V: Memory */}
        <div className="absolute inset-0 flex items-center justify-center">
          <SceneMemory active={sceneIndex === 4} onEnter={handleEnter} />
        </div>

        {/* Scenes I–III + IV headline: Typography storytelling */}
        <AnimatePresence mode="wait">
          {sceneIndex < 4 && (
            <motion.div
              key={scene.id + '-copy'}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
              className="text-center px-6 max-w-xl pointer-events-none"
              style={{ marginTop: sceneIndex === 3 ? '-420px' : 0 }}
            >
              {/* Scene badge */}
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.18, duration: 0.7 }}
                className="inline-block text-[10px] font-extrabold uppercase tracking-[0.4em] mb-5 px-4 py-1.5 rounded-full border"
                style={{ color: scene.color, borderColor: scene.color + '50', background: scene.color + '18' }}
              >
                {scene.act}
              </motion.span>

              {/* Icon */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.28, duration: 0.7, type: 'spring', stiffness: 220 }}
                className="text-5xl mb-4"
                style={{ filter: `drop-shadow(0 0 18px ${scene.color}90)` }}
              >
                {scene.icon}
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="font-display font-black text-4xl sm:text-6xl lg:text-7xl text-white/95 leading-tight tracking-tight whitespace-pre-line"
              >
                {scene.title}
              </motion.h2>

              {/* Sub */}
              <motion.h3
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.52, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="font-display font-black text-4xl sm:text-6xl lg:text-7xl leading-tight tracking-tight mt-1"
                style={{ color: scene.color }}
              >
                {scene.sub}
              </motion.h3>

              {/* Scene-specific extras */}
              {sceneIndex === 0 && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                  className="text-zinc-400 text-sm mt-6 font-medium tracking-wide italic">
                  "Welcome to Flavoré."
                </motion.p>
              )}
              {sceneIndex === 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                  className="flex items-center justify-center gap-3 mt-6">
                  {['🥂', '🕯️', '🌹'].map((e, i) => (
                    <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ delay: 0.85 + i * 0.12, type: 'spring', stiffness: 260 }}
                      className="text-3xl" style={{ filter: 'drop-shadow(0 0 10px rgba(251,191,36,0.5))' }}>
                      {e}
                    </motion.span>
                  ))}
                </motion.div>
              )}
              {sceneIndex === 2 && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                  className="text-zinc-400 text-sm mt-6 font-medium tracking-wide italic">
                  "Passion in every cut, every flame, every moment."
                </motion.p>
              )}
              {sceneIndex === 3 && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                  className="text-zinc-400 text-sm mt-5 font-medium tracking-wide italic">
                  "The room holds its breath."
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress dots */}
        {sceneIndex < 4 && (
          <div className="absolute bottom-12 flex items-center gap-2.5">
            {SCENES.map((_, i) => (
              <motion.div key={i} className="rounded-full"
                animate={{
                  width: i === sceneIndex ? 30 : 6,
                  opacity: i === sceneIndex ? 1 : 0.28,
                  backgroundColor: i === sceneIndex ? scene.color : '#52525b',
                }}
                style={{ height: 6 }}
                transition={{ duration: 0.4 }}
              />
            ))}
          </div>
        )}

        {/* Skip tap hint */}
        {sceneIndex < 4 && (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: [0, 0.38, 0.22, 0.38] }}
            transition={{ delay: 1.8, duration: 2.5, repeat: Infinity }}
            className="absolute bottom-5 text-[9px] tracking-[0.3em] uppercase text-zinc-600 font-medium pointer-events-none">
            tap to skip
          </motion.p>
        )}
      </div>

      {/* ── WARP PORTAL ── */}
      <AnimatePresence>
        {isWarping && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0, 0.85, 0] }} transition={{ duration: 0.28 }}
              className="fixed inset-0 bg-white z-[9998] pointer-events-none" />
            <motion.div
              initial={{ opacity: 0, scale: 0.01, borderRadius: '50%' }}
              animate={{ opacity: [0, 1, 1], scale: [0.01, 1, 22] }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-[9999] bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center pointer-events-none"
            >
              <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.28, duration: 0.4 }}
                className="text-zinc-950 font-display font-black text-3xl sm:text-4xl tracking-[0.25em] uppercase">
                FLAVORÉ
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
