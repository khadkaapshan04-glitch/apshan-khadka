import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

/* ═══════════════════════════════════════════════════════
   STORY: "FOR SOMEONE SPECIAL"
   A dining story told through the lens of connection.
   ═══════════════════════════════════════════════════════ */
const SPECIAL_SCENES = [
  { id: 'reservation', duration: 3800, act: 'SCENE I',   icon: '📞', title: 'A call made.',          sub: 'A night planned.',       color: '#c084fc', note: '"Table for two. 8 o\'clock."' },
  { id: 'petals',      duration: 3800, act: 'SCENE II',  icon: '🌹', title: 'The air',               sub: 'fills with warmth.',     color: '#f43f5e', note: '"You notice the roses first."' },
  { id: 'champagne',   duration: 3800, act: 'SCENE III', icon: '🥂', title: 'A toast.',              sub: 'To this moment.',        color: '#fbbf24', note: '"To us. To tonight."' },
  { id: 'together',    duration: 4000, act: 'SCENE IV',  icon: '🕯️', title: 'Across the table,',    sub: 'you are seen.',          color: '#f97316', note: '"No phone. Just eyes."' },
  { id: 'memory',      duration: 99999,act: 'FLAVORÉ',   icon: '✦',  title: 'Because some moments', sub: 'deserve perfection.',    color: '#d4a574', note: '' },
];

/* — Canvas I: Two glowing orbs slowly drawing together — */
function useOrbCanvas(ref: React.RefObject<HTMLCanvasElement | null>, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    let raf: number; let t = 0;
    const W = canvas.width, H = canvas.height;
    const draw = () => {
      t++;
      ctx.clearRect(0, 0, W, H);
      const convergence = Math.min(t / 220, 1); // 0 → 1 over ~3.7s
      const spread = (1 - convergence) * W * 0.22;
      const cx = W / 2, cy = H / 2;
      // Left orb (warm purple)
      const lg = ctx.createRadialGradient(cx - spread, cy, 0, cx - spread, cy, 130 + spread * 0.3);
      lg.addColorStop(0, `rgba(192,132,252,${0.22 + convergence * 0.1})`);
      lg.addColorStop(1, 'transparent');
      ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(cx - spread, cy, 180, 0, Math.PI * 2); ctx.fill();
      // Right orb (warm rose)
      const rg = ctx.createRadialGradient(cx + spread, cy, 0, cx + spread, cy, 130 + spread * 0.3);
      rg.addColorStop(0, `rgba(244,63,94,${0.2 + convergence * 0.1})`);
      rg.addColorStop(1, 'transparent');
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(cx + spread, cy, 180, 0, Math.PI * 2); ctx.fill();
      // Merged center glow when together
      if (convergence > 0.6) {
        const mg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 120 * (convergence - 0.6) * 2.5);
        mg.addColorStop(0, `rgba(251,191,36,${(convergence - 0.6) * 0.35})`);
        mg.addColorStop(1, 'transparent');
        ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(cx, cy, 200, 0, Math.PI * 2); ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [active, ref]);
}

/* — Canvas II: Rose petal rain — */
function PetalRain({ active }: { active: boolean }) {
  const petals = ['🌹', '🌸', '🌺', '🌷', '🫶'];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 20 }, (_, i) => (
        <motion.div key={i}
          className="absolute"
          initial={{ y: '-5vh', x: `${5 + i * 4.8}vw`, opacity: 0, rotate: Math.random() * 30 - 15 }}
          animate={active ? { y: '108vh', opacity: [0, 0.85, 0.85, 0], rotate: Math.random() * 60 - 30 } : {}}
          transition={{ duration: 5 + Math.random() * 4, delay: Math.random() * 3, ease: 'linear', repeat: Infinity, repeatDelay: Math.random() * 2 }}
          style={{ fontSize: 22 + Math.random() * 16, filter: 'drop-shadow(0 3px 8px rgba(244,63,94,0.4))' }}
        >
          {petals[Math.floor(Math.random() * petals.length)]}
        </motion.div>
      ))}
    </div>
  );
}

/* — Canvas III: Champagne bubbles rising — */
function useBubbleCanvas(ref: React.RefObject<HTMLCanvasElement | null>, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    let raf: number; const W = canvas.width, H = canvas.height;
    type Bubble = { x: number; y: number; r: number; vy: number; alpha: number; wobble: number; wPhase: number; };
    const bubbles: Bubble[] = Array.from({ length: 60 }, () => ({
      x: W * 0.35 + Math.random() * W * 0.3, y: H + Math.random() * H * 0.5,
      r: Math.random() * 6 + 2, vy: -(Math.random() * 1.2 + 0.4),
      alpha: Math.random() * 0.5 + 0.2, wobble: Math.random() * 1.5 + 0.5,
      wPhase: Math.random() * Math.PI * 2,
    }));
    let t = 0;
    const draw = () => {
      t++;
      ctx.fillStyle = 'rgba(9,9,11,0.18)'; ctx.fillRect(0, 0, W, H);
      // Champagne glass glow
      const gg = ctx.createRadialGradient(W / 2, H * 0.85, 0, W / 2, H * 0.85, 160);
      gg.addColorStop(0, 'rgba(251,191,36,0.18)'); gg.addColorStop(1, 'transparent');
      ctx.fillStyle = gg; ctx.fillRect(W / 2 - 180, H * 0.6, 360, H * 0.5);
      bubbles.forEach(b => {
        b.y += b.vy; b.x += Math.sin(t * 0.03 + b.wPhase) * b.wobble;
        if (b.y < -20) { b.y = H + 10; b.x = W * 0.35 + Math.random() * W * 0.3; }
        const distFromCenter = Math.abs(b.x - W / 2) / (W * 0.15);
        const fade = Math.max(0, 1 - distFromCenter);
        ctx.save(); ctx.globalAlpha = b.alpha * fade;
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1;
        ctx.shadowColor = '#f59e0b'; ctx.shadowBlur = 6;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.stroke();
        // Bubble highlight
        ctx.globalAlpha = b.alpha * fade * 0.6; ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath(); ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.3, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [active, ref]);
}

/* — Canvas IV: Warm candlelight heartbeat pulse — */
function usePulseCanvas(ref: React.RefObject<HTMLCanvasElement | null>, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    let raf: number; let t = 0;
    const W = canvas.width, H = canvas.height;
    const draw = () => {
      t++;
      ctx.clearRect(0, 0, W, H);
      // Dual heartbeat rhythm
      const beat = Math.pow(Math.max(0, Math.sin(t * 0.045)), 6);
      const softGlow = 0.12 + 0.08 * Math.sin(t * 0.02);
      // Table candlelight glow
      for (let i = 0; i < 2; i++) {
        const cx = W * (i === 0 ? 0.35 : 0.65), cy = H * 0.68;
        const r = 80 + beat * 55;
        const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        cg.addColorStop(0, `rgba(251,191,36,${0.25 + beat * 0.18})`);
        cg.addColorStop(0.4, `rgba(217,119,6,${0.1 + beat * 0.08})`);
        cg.addColorStop(1, 'transparent');
        ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cx, cy, r + 40, 0, Math.PI * 2); ctx.fill();
      }
      // Center connection glow between them
      const mg = ctx.createRadialGradient(W / 2, H * 0.6, 0, W / 2, H * 0.6, 100 + beat * 60);
      mg.addColorStop(0, `rgba(212,165,116,${softGlow + beat * 0.08})`);
      mg.addColorStop(1, 'transparent');
      ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(W / 2, H * 0.6, 200, 0, Math.PI * 2); ctx.fill();
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [active, ref]);
}

/* — Memory Canvas: Soft golden particles — */
function useSpecialMemoryCanvas(ref: React.RefObject<HTMLCanvasElement | null>, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    let raf: number; let t = 0;
    const W = canvas.width, H = canvas.height;
    type Mote = { x: number; y: number; vx: number; vy: number; r: number; alpha: number; phase: number; };
    const motes: Mote[] = Array.from({ length: 90 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.2 - 0.08,
      r: Math.random() * 2.2 + 0.5, alpha: Math.random() * 0.5 + 0.15,
      phase: Math.random() * Math.PI * 2,
    }));
    const draw = () => {
      t++;
      ctx.clearRect(0, 0, W, H);
      motes.forEach(m => {
        m.x += m.vx; m.y += m.vy;
        if (m.x < 0) m.x = W; if (m.x > W) m.x = 0;
        if (m.y < 0) m.y = H; if (m.y > H) m.y = 0;
        const a = m.alpha * (0.4 + 0.6 * Math.sin(t * 0.01 + m.phase));
        ctx.save(); ctx.globalAlpha = a; ctx.shadowColor = '#d4a574'; ctx.shadowBlur = 7;
        ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [active, ref]);
}

function SpecialLogoScene({ active, onEnter }: { active: boolean; onEnter: () => void }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.4 }}
          className="flex flex-col items-center gap-5 pointer-events-auto cursor-pointer" onClick={onEnter}>
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.4, duration: 1 }}
            className="h-px w-24 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 1 }}
            className="font-display font-black text-6xl sm:text-8xl text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-amber-600 tracking-[0.12em]">
            Flavoré
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
            className="text-zinc-400 text-sm italic font-medium tracking-wide">"Because some moments deserve perfection."</motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: [0, 0.55, 0.3, 0.55] }}
            transition={{ delay: 2, duration: 2.5, repeat: Infinity }}
            className="text-zinc-500 text-[10px] tracking-[0.35em] uppercase font-medium mt-2">tap anywhere to enter</motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const ForSomeoneSpecial: React.FC = () => {
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);
  const [isWarping, setIsWarping] = useState(false);
  const orbRef = useRef<HTMLCanvasElement | null>(null);
  const bubbleRef = useRef<HTMLCanvasElement | null>(null);
  const pulseRef = useRef<HTMLCanvasElement | null>(null);
  const memRef = useRef<HTMLCanvasElement | null>(null);

  useOrbCanvas(orbRef, idx === 0);
  useBubbleCanvas(bubbleRef, idx === 2);
  usePulseCanvas(pulseRef, idx === 3);
  useSpecialMemoryCanvas(memRef, idx === 4);

  const scene = SPECIAL_SCENES[idx];
  useEffect(() => {
    if (scene.duration === 99999) return;
    const t = setTimeout(() => setIdx(i => Math.min(i + 1, SPECIAL_SCENES.length - 1)), scene.duration);
    return () => clearTimeout(t);
  }, [idx, scene.duration]);

  const handleEnter = useCallback(() => {
    if (isWarping) return;
    setIsWarping(true);
    setTimeout(() => navigate('/home'), 1100);
  }, [isWarping, navigate]);

  return (
    <div className="fixed inset-0 overflow-hidden select-none bg-zinc-950 cursor-pointer" onClick={handleEnter}>
      <AnimatePresence mode="sync">
        <motion.div key={scene.id + '-bg'} className="absolute inset-0"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
          style={{ background: `radial-gradient(ellipse at 50% 55%, ${scene.color}1a 0%, transparent 65%)` }} />
      </AnimatePresence>
      <canvas ref={orbRef}    className={`absolute inset-0 pointer-events-none z-10 transition-opacity duration-700 ${idx === 0 ? 'opacity-100' : 'opacity-0'}`} />
      <canvas ref={bubbleRef} className={`absolute inset-0 pointer-events-none z-10 transition-opacity duration-700 ${idx === 2 ? 'opacity-100' : 'opacity-0'}`} />
      <canvas ref={pulseRef}  className={`absolute inset-0 pointer-events-none z-10 transition-opacity duration-700 ${idx === 3 ? 'opacity-100' : 'opacity-0'}`} />
      <canvas ref={memRef}    className={`absolute inset-0 pointer-events-none z-10 transition-opacity duration-700 ${idx === 4 ? 'opacity-100' : 'opacity-0'}`} />
      {/* Petal rain for scene 1 */}
      <div className="absolute inset-0 z-10"><PetalRain active={idx === 1} /></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(9,9,11,0.92)_100%)] pointer-events-none z-20" />
      <div className="absolute inset-0 flex flex-col items-center justify-center z-30">
        <div className="absolute inset-0 flex items-center justify-center">
          <SpecialLogoScene active={idx === 4} onEnter={handleEnter} />
        </div>
        <AnimatePresence mode="wait">
          {idx < 4 && (
            <motion.div key={scene.id + '-copy'} initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }} transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
              className="text-center px-6 max-w-xl pointer-events-none">
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }}
                className="inline-block text-[10px] font-extrabold uppercase tracking-[0.4em] mb-4 px-4 py-1.5 rounded-full border"
                style={{ color: scene.color, borderColor: scene.color + '50', background: scene.color + '18' }}>
                {scene.act}
              </motion.span>
              <motion.div className="text-5xl mb-4" initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 0.28, type: 'spring', stiffness: 220 }}
                style={{ filter: `drop-shadow(0 0 18px ${scene.color}88)` }}>{scene.icon}</motion.div>
              <motion.h2 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="font-display font-black text-4xl sm:text-6xl lg:text-7xl text-white/95 leading-tight tracking-tight">
                {scene.title}
              </motion.h2>
              <motion.h3 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.52, duration: 0.9 }}
                className="font-display font-black text-4xl sm:text-6xl lg:text-7xl leading-tight tracking-tight"
                style={{ color: scene.color }}>{scene.sub}</motion.h3>
              {scene.note && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}
                  className="text-zinc-400 text-sm mt-5 font-medium tracking-wide italic">{scene.note}</motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        {idx < 4 && (
          <div className="absolute bottom-12 flex items-center gap-2.5">
            {SPECIAL_SCENES.map((_, i) => (
              <motion.div key={i} className="rounded-full" style={{ height: 6 }}
                animate={{ width: i === idx ? 30 : 6, opacity: i === idx ? 1 : 0.28, backgroundColor: i === idx ? scene.color : '#52525b' }}
                transition={{ duration: 0.4 }} />
            ))}
          </div>
        )}
        {idx < 4 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: [0, 0.38, 0.22, 0.38] }}
            transition={{ delay: 1.8, duration: 2.5, repeat: Infinity }}
            className="absolute bottom-5 text-[9px] tracking-[0.3em] uppercase text-zinc-600 font-medium pointer-events-none">tap to skip</motion.p>
        )}
      </div>
      <AnimatePresence>
        {isWarping && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0, 0.85, 0] }} transition={{ duration: 0.28 }}
              className="fixed inset-0 bg-white z-[9998] pointer-events-none" />
            <motion.div initial={{ opacity: 0, scale: 0.01, borderRadius: '50%' }}
              animate={{ opacity: [0, 1, 1], scale: [0.01, 1, 22] }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-[9999] bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center pointer-events-none">
              <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.28, duration: 0.4 }}
                className="text-zinc-950 font-display font-black text-3xl sm:text-4xl tracking-[0.25em] uppercase">FLAVORÉ</motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
