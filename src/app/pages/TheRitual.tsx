import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

/* ═══════════════════════════════════════════════════════
   STORY: "THE RITUAL"
   The sacred daily preparation before service begins.
   ═══════════════════════════════════════════════════════ */
const RITUAL_SCENES = [
  { id: 'dawn',       duration: 3800, act: 'SCENE I',   icon: '🌅', title: 'Before the guests,',   sub: 'there is silence.',       color: '#d97706', note: '"5:47am. The kitchen breathes."' },
  { id: 'prep',       duration: 3800, act: 'SCENE II',  icon: '🔪', title: 'Every cut.',            sub: 'Intentional.',            color: '#d4a574', note: '"Precision is a form of love."' },
  { id: 'mise',       duration: 3800, act: 'SCENE III', icon: '🫙', title: 'Everything',            sub: 'in its place.',           color: '#f59e0b', note: '"Mise en place. A way of life."' },
  { id: 'alive',      duration: 4000, act: 'SCENE IV',  icon: '⚡', title: 'The kitchen',          sub: 'comes alive.',            color: '#ef4444', note: '"Controlled chaos. Pure grace."' },
  { id: 'invitation', duration: 99999,act: 'FLAVORÉ',   icon: '✦',  title: 'The ritual',           sub: 'begins again.',           color: '#fbbf24', note: '' },
];

/* — Canvas I: Dawn light rays sweeping in — */
function useDawnCanvas(ref: React.RefObject<HTMLCanvasElement | null>, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    let raf: number; let t = 0;
    const W = canvas.width, H = canvas.height;
    const rays = Array.from({ length: 8 }, (_, i) => ({
      angle: -0.3 + i * 0.12,
      width: 40 + Math.random() * 80,
      alpha: 0.04 + Math.random() * 0.05,
      speed: 0.0003 + Math.random() * 0.0002,
      phase: Math.random() * Math.PI * 2,
    }));
    const draw = () => {
      t++;
      ctx.clearRect(0, 0, W, H);
      const horizonY = H * 0.62;
      // Warm horizon glow
      const hg = ctx.createLinearGradient(0, horizonY - 120, 0, H);
      hg.addColorStop(0, 'rgba(217,119,6,0.22)'); hg.addColorStop(0.5, 'rgba(161,98,7,0.1)'); hg.addColorStop(1, 'transparent');
      ctx.fillStyle = hg; ctx.fillRect(0, horizonY - 120, W, H);
      // Animated light rays from horizon center
      const cx = W * 0.5, cy = horizonY;
      rays.forEach(r => {
        const pulse = r.alpha + Math.sin(t * r.speed * 60 + r.phase) * 0.02;
        ctx.save(); ctx.globalAlpha = pulse;
        ctx.translate(cx, cy);
        const rayLen = H * 1.6;
        const rg = ctx.createLinearGradient(0, 0, Math.cos(r.angle) * rayLen, Math.sin(r.angle - Math.PI / 2) * rayLen);
        rg.addColorStop(0, 'rgba(251,191,36,0.6)'); rg.addColorStop(1, 'transparent');
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(r.angle - r.width * 0.003) * rayLen, -rayLen);
        ctx.lineTo(Math.cos(r.angle + r.width * 0.003) * rayLen, -rayLen);
        ctx.closePath(); ctx.fill(); ctx.restore();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [active, ref]);
}

/* — Canvas II: Knife-edge precision slicing sparks — */
function useKnifeCanvas(ref: React.RefObject<HTMLCanvasElement | null>, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    let raf: number; const W = canvas.width, H = canvas.height;
    type Spark = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; };
    const sparks: Spark[] = [];
    let sliceT = 0;
    const draw = () => {
      sliceT++;
      ctx.fillStyle = 'rgba(9,9,11,0.2)'; ctx.fillRect(0, 0, W, H);
      // Knife blade glint line
      if (sliceT % 55 < 12) {
        const progress = (sliceT % 55) / 12;
        const x1 = W * 0.25 + progress * W * 0.5, y1 = H * 0.45 + progress * H * 0.12;
        const x2 = x1 + 8, y2 = y1 - 3;
        ctx.save(); ctx.globalAlpha = 0.7 * (1 - progress);
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2.5;
        ctx.shadowColor = '#f59e0b'; ctx.shadowBlur = 14;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore();
        // Sparks on cut
        if (sliceT % 55 < 5) {
          for (let i = 0; i < 4; i++) {
            sparks.push({ x: x1, y: y1, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 3 - 1, life: 0, maxLife: 30 + Math.random() * 20, size: Math.random() * 2 + 0.5 });
          }
        }
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]; s.life++; s.x += s.vx; s.y += s.vy; s.vy += 0.08;
        const a = 1 - s.life / s.maxLife;
        if (a <= 0) { sparks.splice(i, 1); continue; }
        ctx.save(); ctx.globalAlpha = a; ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 8;
        ctx.fillStyle = '#fef08a'; ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [active, ref]);
}

/* — Canvas III: Mise en place — glowing grid dots — */
function useMiseCanvas(ref: React.RefObject<HTMLCanvasElement | null>, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    let raf: number; let t = 0;
    const W = canvas.width, H = canvas.height;
    const cols = 14, rows = 8;
    const dots = Array.from({ length: cols * rows }, (_, i) => ({
      col: i % cols, row: Math.floor(i / cols),
      lit: false, litAt: Math.random() * 180,
      color: ['#f59e0b','#fbbf24','#d4a574','#d97706'][Math.floor(Math.random() * 4)],
    }));
    const draw = () => {
      t++;
      ctx.clearRect(0, 0, W, H);
      const startX = W * 0.12, startY = H * 0.25;
      const spacingX = (W * 0.76) / (cols - 1), spacingY = (H * 0.5) / (rows - 1);
      dots.forEach(d => {
        if (t > d.litAt && !d.lit) d.lit = true;
        if (!d.lit) return;
        const px = startX + d.col * spacingX, py = startY + d.row * spacingY;
        const pulse = 0.35 + 0.25 * Math.sin(t * 0.04 + d.col * 0.5 + d.row * 0.7);
        ctx.save(); ctx.globalAlpha = pulse;
        ctx.shadowColor = d.color; ctx.shadowBlur = 10;
        ctx.fillStyle = d.color;
        ctx.beginPath(); ctx.arc(px, py, 2.8, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [active, ref]);
}

/* — Canvas IV: Kitchen alive — fast energy streaks — */
function useEnergyCanvas(ref: React.RefObject<HTMLCanvasElement | null>, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    let raf: number; const W = canvas.width, H = canvas.height;
    type Streak = { x: number; y: number; vx: number; vy: number; len: number; alpha: number; color: string; };
    const colors = ['#ef4444','#f97316','#f59e0b','#fbbf24','#dc2626'];
    const streaks: Streak[] = Array.from({ length: 35 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 9, vy: (Math.random() - 0.5) * 7,
      len: Math.random() * 60 + 20, alpha: Math.random() * 0.5 + 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    const draw = () => {
      ctx.fillStyle = 'rgba(9,9,11,0.25)'; ctx.fillRect(0, 0, W, H);
      streaks.forEach(s => {
        ctx.save(); ctx.globalAlpha = s.alpha;
        ctx.strokeStyle = s.color; ctx.lineWidth = 1.5;
        ctx.shadowColor = s.color; ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx * (s.len / 12), s.y - s.vy * (s.len / 12)); ctx.stroke(); ctx.restore();
        s.x += s.vx; s.y += s.vy;
        if (s.x < -s.len) s.x = W + s.len;
        if (s.x > W + s.len) s.x = -s.len;
        if (s.y < -s.len) s.y = H + s.len;
        if (s.y > H + s.len) s.y = -s.len;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [active, ref]);
}

/* — Ritual Memory Canvas: Slow converging dots — */
function useRitualMemoryCanvas(ref: React.RefObject<HTMLCanvasElement | null>, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    let raf: number; let t = 0;
    const W = canvas.width, H = canvas.height;
    const pts = Array.from({ length: 80 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.4 + 0.4, alpha: Math.random() * 0.5 + 0.15,
      phase: Math.random() * Math.PI * 2, speed: Math.random() * 0.012 + 0.004,
    }));
    const draw = () => {
      t++;
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        const a = p.alpha * (0.4 + 0.6 * Math.sin(t * p.speed + p.phase));
        ctx.save(); ctx.globalAlpha = a; ctx.shadowColor = '#d4a574'; ctx.shadowBlur = 5;
        ctx.fillStyle = '#d4a574'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [active, ref]);
}

function RitualLogoScene({ active, onEnter }: { active: boolean; onEnter: () => void }) {
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
            className="text-zinc-400 text-sm italic font-medium tracking-wide">"The ritual begins again."</motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: [0, 0.55, 0.3, 0.55] }}
            transition={{ delay: 2, duration: 2.5, repeat: Infinity }}
            className="text-zinc-500 text-[10px] tracking-[0.35em] uppercase font-medium mt-2">tap anywhere to enter</motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const TheRitual: React.FC = () => {
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);
  const [isWarping, setIsWarping] = useState(false);
  const dawnRef = useRef<HTMLCanvasElement | null>(null);
  const knifeRef = useRef<HTMLCanvasElement | null>(null);
  const miseRef = useRef<HTMLCanvasElement | null>(null);
  const energyRef = useRef<HTMLCanvasElement | null>(null);
  const memRef = useRef<HTMLCanvasElement | null>(null);

  useDawnCanvas(dawnRef, idx === 0);
  useKnifeCanvas(knifeRef, idx === 1);
  useMiseCanvas(miseRef, idx === 2);
  useEnergyCanvas(energyRef, idx === 3);
  useRitualMemoryCanvas(memRef, idx === 4);

  const scene = RITUAL_SCENES[idx];
  useEffect(() => {
    if (scene.duration === 99999) return;
    const t = setTimeout(() => setIdx(i => Math.min(i + 1, RITUAL_SCENES.length - 1)), scene.duration);
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
          style={{ background: `radial-gradient(ellipse at 50% 60%, ${scene.color}22 0%, transparent 65%)` }} />
      </AnimatePresence>
      <canvas ref={dawnRef}  className={`absolute inset-0 pointer-events-none z-10 transition-opacity duration-700 ${idx === 0 ? 'opacity-100' : 'opacity-0'}`} />
      <canvas ref={knifeRef} className={`absolute inset-0 pointer-events-none z-10 transition-opacity duration-700 ${idx === 1 ? 'opacity-100' : 'opacity-0'}`} />
      <canvas ref={miseRef}  className={`absolute inset-0 pointer-events-none z-10 transition-opacity duration-700 ${idx === 2 ? 'opacity-100' : 'opacity-0'}`} />
      <canvas ref={energyRef}className={`absolute inset-0 pointer-events-none z-10 transition-opacity duration-700 ${idx === 3 ? 'opacity-100' : 'opacity-0'}`} />
      <canvas ref={memRef}   className={`absolute inset-0 pointer-events-none z-10 transition-opacity duration-700 ${idx === 4 ? 'opacity-100' : 'opacity-0'}`} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(9,9,11,0.92)_100%)] pointer-events-none z-20" />
      <div className="absolute inset-0 flex flex-col items-center justify-center z-30">
        <div className="absolute inset-0 flex items-center justify-center">
          <RitualLogoScene active={idx === 4} onEnter={handleEnter} />
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
            {RITUAL_SCENES.map((_, i) => (
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
