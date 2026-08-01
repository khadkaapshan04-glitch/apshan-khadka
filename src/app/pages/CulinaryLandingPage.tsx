import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

/* ═══════════════════════════════════════════════════════════
   STORY ACTS DEFINITION
   ═══════════════════════════════════════════════════════════ */
const ACTS = [
  {
    id: 'earth',
    duration: 3800,
    headline: 'Every great dish',
    subline: 'begins with the earth.',
    caption: 'ACT I · THE EARTH',
    bg: 'radial-gradient(ellipse at 50% 90%, rgba(101,67,33,0.5) 0%, rgba(9,9,11,0.98) 60%)',
    accent: '#a16207',
  },
  {
    id: 'harvest',
    duration: 3800,
    headline: 'Chosen at the peak',
    subline: 'of perfection.',
    caption: 'ACT II · THE HARVEST',
    bg: 'radial-gradient(ellipse at 50% 30%, rgba(180,120,40,0.35) 0%, rgba(9,9,11,0.97) 65%)',
    accent: '#d97706',
  },
  {
    id: 'fire',
    duration: 3800,
    headline: 'Transformed by fire',
    subline: 'and craft.',
    caption: 'ACT III · THE FIRE',
    bg: 'radial-gradient(ellipse at 50% 70%, rgba(220,38,38,0.25) 0%, rgba(245,158,11,0.1) 40%, rgba(9,9,11,0.97) 70%)',
    accent: '#ef4444',
  },
  {
    id: 'plate',
    duration: 4200,
    headline: 'Plated with precision',
    subline: 'and soul.',
    caption: 'ACT IV · THE PLATE',
    bg: 'radial-gradient(ellipse at 50% 45%, rgba(245,158,11,0.18) 0%, rgba(9,9,11,0.97) 65%)',
    accent: '#f59e0b',
  },
  {
    id: 'invitation',
    duration: 99999,
    headline: 'Your table',
    subline: 'is ready.',
    caption: 'FLAVORÉ · FINE DINING',
    bg: 'radial-gradient(ellipse at 50% 40%, rgba(245,158,11,0.25) 0%, rgba(9,9,11,0.95) 65%)',
    accent: '#fbbf24',
  },
];

/* ═══════════════════════════════════════════════════════════
   ACT I CANVAS — Seeds & Earth
   Glowing seeds rise from dark soil with dawn light
   ═══════════════════════════════════════════════════════════ */
function useEarthCanvas(ref: React.RefObject<HTMLCanvasElement | null>, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    let raf: number;
    type Seed = { x: number; y: number; vy: number; size: number; alpha: number; glow: number; };
    const seeds: Seed[] = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: canvas.height * 0.7 + Math.random() * canvas.height * 0.3,
      vy: -(Math.random() * 0.6 + 0.2),
      size: Math.random() * 3 + 1.5,
      alpha: Math.random() * 0.6 + 0.2,
      glow: Math.random() * 18 + 8,
    }));
    let t = 0;
    const draw = () => {
      t++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Horizon dawn glow
      const grad = ctx.createLinearGradient(0, canvas.height * 0.55, 0, canvas.height);
      grad.addColorStop(0, 'rgba(161,98,7,0.18)');
      grad.addColorStop(1, 'rgba(101,67,33,0.35)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, canvas.height * 0.55, canvas.width, canvas.height * 0.45);
      seeds.forEach(s => {
        s.y += s.vy;
        s.alpha -= 0.0018;
        if (s.y < canvas.height * 0.1 || s.alpha <= 0) {
          s.y = canvas.height * 0.7 + Math.random() * canvas.height * 0.28;
          s.alpha = Math.random() * 0.6 + 0.2;
        }
        ctx.save();
        ctx.globalAlpha = Math.max(0, s.alpha);
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = s.glow;
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.ellipse(s.x, s.y, s.size * 0.55, s.size, Math.sin(t * 0.02 + s.x) * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [active, ref]);
}

/* ═══════════════════════════════════════════════════════════
   ACT II CANVAS — Harvest Rain
   Fresh ingredients descend like glowing rain
   ═══════════════════════════════════════════════════════════ */
const HARVEST_ITEMS = ['🍅','🌿','🫒','🍋','🧄','🌶️','🫑','🥕','🍇','🍓','🫐'];
function HarvestRain({ active }: { active: boolean }) {
  type Drop = { x: number; y: number; vy: number; emoji: string; size: number; alpha: number; spin: number; };
  const [drops, setDrops] = useState<Drop[]>([]);
  useEffect(() => {
    if (!active) { setDrops([]); return; }
    setDrops(Array.from({ length: 22 }, (_, i) => ({
      x: (i / 22) * 100 + Math.random() * 4,
      y: -10 - Math.random() * 80,
      vy: Math.random() * 0.6 + 0.25,
      emoji: HARVEST_ITEMS[Math.floor(Math.random() * HARVEST_ITEMS.length)],
      size: Math.random() * 22 + 22,
      alpha: Math.random() * 0.5 + 0.5,
      spin: (Math.random() - 0.5) * 20,
    })));
  }, [active]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {drops.map((d, i) => (
        <motion.div
          key={i}
          initial={{ y: `${d.y}vh`, x: `${d.x}vw`, opacity: 0, rotate: 0 }}
          animate={active ? {
            y: '110vh',
            opacity: [0, d.alpha, d.alpha, 0],
            rotate: d.spin,
          } : {}}
          transition={{
            duration: 4.5 + Math.random() * 3,
            delay: Math.random() * 3,
            ease: 'linear',
            repeat: Infinity,
            repeatDelay: Math.random() * 2,
          }}
          className="absolute"
          style={{ fontSize: d.size, filter: 'drop-shadow(0 4px 12px rgba(245,158,11,0.35))' }}
        >
          {d.emoji}
        </motion.div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ACT III CANVAS — Fire & Embers
   Dramatic flame particles + heat shimmer
   ═══════════════════════════════════════════════════════════ */
function useFireCanvas(ref: React.RefObject<HTMLCanvasElement | null>, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    let raf: number;
    type Ember = { x: number; y: number; vx: number; vy: number; size: number; alpha: number; color: string; };
    const colors = ['#ef4444','#f97316','#f59e0b','#fbbf24','#dc2626','#fef08a'];
    const embers: Ember[] = [];
    const spawn = () => {
      const cx = canvas.width / 2;
      for (let i = 0; i < 6; i++) {
        embers.push({
          x: cx + (Math.random() - 0.5) * 180,
          y: canvas.height * 0.75 + Math.random() * 60,
          vx: (Math.random() - 0.5) * 2.5,
          vy: -(Math.random() * 4 + 2),
          size: Math.random() * 5 + 2,
          alpha: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };
    const draw = () => {
      ctx.fillStyle = 'rgba(9,9,11,0.22)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      spawn();
      // Core flame gradient
      const cx = canvas.width / 2;
      const flameGrad = ctx.createRadialGradient(cx, canvas.height * 0.72, 10, cx, canvas.height * 0.72, 200);
      flameGrad.addColorStop(0, 'rgba(251,191,36,0.35)');
      flameGrad.addColorStop(0.4, 'rgba(239,68,68,0.18)');
      flameGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = flameGrad;
      ctx.fillRect(cx - 220, canvas.height * 0.5, 440, canvas.height);
      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.x += e.vx + Math.sin(e.y * 0.012) * 0.8;
        e.y += e.vy;
        e.alpha -= 0.018;
        if (e.alpha <= 0) { embers.splice(i, 1); continue; }
        ctx.save();
        ctx.globalAlpha = e.alpha;
        ctx.shadowColor = e.color;
        ctx.shadowBlur = 18;
        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [active, ref]);
}

/* ═══════════════════════════════════════════════════════════
   ACT IV — The Plate: 3D Rotating Gourmet Dish
   ═══════════════════════════════════════════════════════════ */
function ThePlate({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex items-center justify-center"
          style={{ perspective: 1200 }}
        >
          {/* Plate shadow */}
          <motion.div
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[65%] h-[18px] bg-black/50 rounded-[100%] blur-2xl"
            animate={{ scaleX: [1, 1.12, 1], opacity: [0.35, 0.55, 0.35] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          {/* Smoke wisps */}
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="absolute bottom-[55%] pointer-events-none"
              style={{ left: `${38 + i * 12}%` }}
              animate={{ y: [-10, -70], opacity: [0, 0.18, 0], scaleX: [1, 1.8] }}
              transition={{ duration: 3.5, delay: i * 0.7, repeat: Infinity, ease: 'easeOut' }}
            >
              <div className="w-3 h-10 rounded-full bg-gradient-to-t from-zinc-400/20 to-transparent blur-md" />
            </motion.div>
          ))}
          {/* Outer glow */}
          <motion.div
            className="absolute -inset-16 rounded-full pointer-events-none"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 70%)' }}
          />
          {/* Plate */}
          <motion.div
            className="relative w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] rounded-full border-[7px] border-zinc-800/90 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black shadow-[0_20px_70px_rgba(0,0,0,0.9),inset_0_2px_15px_rgba(255,255,255,0.06)] overflow-hidden"
            animate={{ rotateZ: [0, 360] }}
            transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="absolute inset-[8%] rounded-full overflow-hidden border border-amber-500/20">
              <img
                src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800"
                alt="Gourmet dish"
                className="w-full h-full object-cover scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-amber-900/10 via-transparent to-transparent mix-blend-overlay" />
              {/* Shine sweep */}
              <motion.div
                className="absolute inset-0"
                animate={{ x: ['-120%', '200%'] }}
                transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
              >
                <div className="w-[35%] h-full bg-gradient-to-r from-transparent via-white/12 to-transparent -skew-x-12" />
              </motion.div>
            </div>
            {/* Heat glow */}
            <motion.div
              className="absolute inset-0"
              animate={{ opacity: [0.25, 0.55, 0.25] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{ background: 'radial-gradient(circle at 45% 45%, rgba(245,158,11,0.2) 0%, transparent 65%)' }}
            />
          </motion.div>
          {/* Orbiting ring */}
          <motion.div
            className="absolute -inset-10 rounded-full border border-amber-500/20 pointer-events-none"
            style={{ transform: 'rotateX(72deg)' }}
            animate={{ rotateZ: [0, 360] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════
   ACT V — The Invitation
   Logo reveal with pulsing tap prompt
   ═══════════════════════════════════════════════════════════ */
function TheInvitation({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="flex flex-col items-center gap-6"
        >
          {/* Decorative line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="h-[1px] w-28 bg-gradient-to-r from-transparent via-amber-400 to-transparent"
          />
          {/* Logo icon */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400/20 to-amber-600/20 border border-amber-500/40 flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.3)]"
          >
            <svg width="38" height="44" viewBox="0 0 26 30" fill="none">
              <motion.path
                d="M13 2 C13 2, 22 7, 22 16 C22 22, 18 27, 13 27 C8 27, 4 22, 4 16 C4 7, 13 2, 13 2Z"
                fill="#d4a574" opacity="0.25"
                animate={{ scale: [1, 1.07, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <path d="M13 3 C9 8, 6 13, 8 19 M13 3 C17 8, 20 13, 18 19 M13 3 L13 27"
                stroke="#d4a574" strokeWidth="1.6" strokeLinecap="round" fill="none" />
              <path d="M8 19 C10 22, 12 25, 13 27 C14 25, 16 22, 18 19"
                stroke="#d4a574" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            </svg>
          </motion.div>
          {/* Brand name */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="font-display font-black text-6xl sm:text-8xl text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-amber-600 tracking-[0.15em]"
          >
            Flavoré
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="flex items-center gap-3"
          >
            <div className="h-px w-10 bg-amber-500/40" />
            <p className="text-amber-400/60 text-[10px] sm:text-xs tracking-[0.4em] uppercase font-semibold">Fine Dining Experience</p>
            <div className="h-px w-10 bg-amber-500/40" />
          </motion.div>
          {/* Tap hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0.35, 0.6] }}
            transition={{ delay: 1.8, duration: 2.5, repeat: Infinity }}
            className="text-zinc-500 text-[10px] tracking-[0.35em] uppercase font-medium mt-2"
          >
            tap anywhere to enter
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN: CULINARY LANDING PAGE — 5-Act Story
   ═══════════════════════════════════════════════════════════ */
export const CulinaryLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [actIndex, setActIndex] = useState(0);
  const [isWarping, setIsWarping] = useState(false);

  const earthRef = useRef<HTMLCanvasElement | null>(null);
  const fireRef = useRef<HTMLCanvasElement | null>(null);

  useEarthCanvas(earthRef, actIndex === 0);
  useFireCanvas(fireRef, actIndex === 2);

  // Auto-advance acts
  useEffect(() => {
    const act = ACTS[actIndex];
    if (act.duration === 99999) return;
    const timer = setTimeout(() => {
      setActIndex(i => Math.min(i + 1, ACTS.length - 1));
    }, act.duration);
    return () => clearTimeout(timer);
  }, [actIndex]);

  const handleEnter = useCallback(() => {
    if (isWarping) return;
    setIsWarping(true);
    setTimeout(() => navigate('/home'), 1100);
  }, [isWarping, navigate]);

  const act = ACTS[actIndex];

  return (
    <div
      className="fixed inset-0 overflow-hidden cursor-pointer select-none bg-zinc-950"
      onClick={handleEnter}
    >
      {/* ── DYNAMIC BACKGROUND ── */}
      <AnimatePresence mode="sync">
        <motion.div
          key={act.id + '-bg'}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4 }}
          style={{ background: act.bg }}
        />
      </AnimatePresence>

      {/* ── CANVAS LAYERS ── */}
      <canvas ref={earthRef} className={`absolute inset-0 pointer-events-none z-10 transition-opacity duration-700 ${actIndex === 0 ? 'opacity-100' : 'opacity-0'}`} />
      <canvas ref={fireRef} className={`absolute inset-0 pointer-events-none z-10 transition-opacity duration-700 ${actIndex === 2 ? 'opacity-100' : 'opacity-0'}`} />

      {/* ── HARVEST RAIN ── */}
      <div className="absolute inset-0 z-10">
        <HarvestRain active={actIndex === 1} />
      </div>

      {/* ── CINEMATIC VIGNETTE ── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(9,9,11,0.88)_100%)] pointer-events-none z-20" />

      {/* ── STAGE CENTER ── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-30 gap-6 sm:gap-8 pointer-events-none">

        {/* Act IV: The Plate */}
        <div className="absolute inset-0 flex items-center justify-center">
          <ThePlate active={actIndex === 3} />
        </div>

        {/* Act V: The Invitation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <TheInvitation active={actIndex === 4} />
        </div>

        {/* Acts I–III: Cinematic text storytelling */}
        <AnimatePresence mode="wait">
          {actIndex < 4 && (
            <motion.div
              key={act.id + '-text'}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="text-center px-6 max-w-2xl"
            >
              {/* Act Caption */}
              <motion.span
                initial={{ opacity: 0, letterSpacing: '0.1em' }}
                animate={{ opacity: 1, letterSpacing: '0.35em' }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="inline-block text-[10px] sm:text-xs font-extrabold uppercase tracking-[0.35em] mb-5 px-4 py-1.5 rounded-full border"
                style={{ color: act.accent, borderColor: act.accent + '55', background: act.accent + '15' }}
              >
                {act.caption}
              </motion.span>

              {/* Headline */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="font-display font-black text-4xl sm:text-6xl lg:text-7xl text-white/95 leading-tight tracking-tight"
              >
                {act.headline}
              </motion.h2>

              {/* Sub-line with golden gradient */}
              <motion.h3
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="font-display font-black text-4xl sm:text-6xl lg:text-7xl leading-tight tracking-tight"
                style={{ color: act.accent }}
              >
                {act.subline}
              </motion.h3>

              {/* Act-specific visual element */}
              {actIndex === 0 && (
                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 1 }}
                  className="mt-8 flex items-center justify-center gap-3"
                >
                  <div className="h-px w-16 bg-gradient-to-r from-transparent to-yellow-700/50" />
                  <span className="text-yellow-700/80 text-2xl">🌱</span>
                  <div className="h-px w-16 bg-gradient-to-l from-transparent to-yellow-700/50" />
                </motion.div>
              )}
              {actIndex === 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                  className="mt-6 flex items-center justify-center gap-2 flex-wrap"
                >
                  {['🍅', '🌿', '🫒', '🍋', '🧄'].map((e, i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.8 + i * 0.1, type: 'spring', stiffness: 280, damping: 18 }}
                      className="text-3xl"
                      style={{ filter: 'drop-shadow(0 0 12px rgba(217,119,6,0.4))' }}
                    >
                      {e}
                    </motion.span>
                  ))}
                </motion.div>
              )}
              {actIndex === 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                  className="mt-6 flex items-center justify-center gap-3"
                >
                  <motion.span
                    className="text-5xl"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    style={{ filter: 'drop-shadow(0 0 20px rgba(239,68,68,0.7))' }}
                  >
                    🔥
                  </motion.span>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── ACT PROGRESS INDICATOR ── */}
        {actIndex < 4 && (
          <div className="absolute bottom-12 flex items-center gap-2">
            {ACTS.slice(0, 4).map((_, i) => (
              <motion.div
                key={i}
                className="rounded-full transition-all duration-500"
                animate={{
                  width: i === actIndex ? 28 : 6,
                  opacity: i === actIndex ? 1 : 0.3,
                  backgroundColor: i === actIndex ? act.accent : '#71717a',
                }}
                style={{ height: 6 }}
              />
            ))}
          </div>
        )}

        {/* Skip hint for Acts 1–3 */}
        {actIndex < 4 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0.25, 0.4] }}
            transition={{ delay: 1.5, duration: 2.5, repeat: Infinity }}
            className="absolute bottom-5 text-[9px] tracking-[0.3em] uppercase text-zinc-600 font-medium"
          >
            tap to skip
          </motion.p>
        )}
      </div>

      {/* ── HYPER-WARP PORTAL ── */}
      <AnimatePresence>
        {isWarping && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.85, 0] }}
              transition={{ duration: 0.28 }}
              className="fixed inset-0 bg-white z-[9998] pointer-events-none"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.01, borderRadius: '50%' }}
              animate={{ opacity: [0, 1, 1], scale: [0.01, 1, 22] }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-[9999] bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center pointer-events-none"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.28, duration: 0.4 }}
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
