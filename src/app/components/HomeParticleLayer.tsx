import React, { useEffect, useRef } from 'react';

/* ═══════════════════════════════════════════════════════════════
   HomeParticleLayer — Professional Edition
   ─────────────────────────────────────────────────────────────
   Three-depth parallax star field with:
     · Deep layer   — 140 micro-stars, slow drift
     · Mid layer    — 55 particles with amber constellation lines
     · Near layer   — 18 large glowing orbs, mouse-reactive
     · Nebula clouds — 5 soft morphing radial blobs
     · Shooting stars — random streaks every 2–6s
   All mouse-interactive via parallax & repulsion.
   Fixed canvas, pointer-events: none, z-index: 1.
   ═══════════════════════════════════════════════════════════════ */

interface Vec2 { x: number; y: number; }

export const HomeParticleLayer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<Vec2>({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);
    let raf: number;
    let t = 0;

    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    const onMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouse);

    /* ─────────────────────────────────────────
       LAYER 1 — Deep micro-stars (140)
       Tiny, very slow, no connections
       ───────────────────────────────────────── */
    type DeepStar = {
      x: number; y: number; ox: number; oy: number;
      r: number; alpha: number; phase: number; speed: number;
      px: number; // parallax multiplier
    };
    const deepStars: DeepStar[] = Array.from({ length: 140 }, () => ({
      ox: Math.random() * W, oy: Math.random() * H,
      x: 0, y: 0,
      r: Math.random() * 0.9 + 0.3,
      alpha: Math.random() * 0.35 + 0.08,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.006 + 0.002,
      px: Math.random() * 0.012 + 0.004,
    }));

    /* ─────────────────────────────────────────
       LAYER 2 — Mid constellation particles (55)
       Connected by amber lines when ≤ 150px
       ───────────────────────────────────────── */
    type MidStar = {
      x: number; y: number; ox: number; oy: number;
      vx: number; vy: number;
      r: number; alpha: number; phase: number;
      px: number;
    };
    const midStars: MidStar[] = Array.from({ length: 55 }, () => {
      const ox = Math.random() * W, oy = Math.random() * H;
      return {
        ox, oy, x: ox, y: oy,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.15 - 0.04,
        r: Math.random() * 1.6 + 0.6,
        alpha: Math.random() * 0.55 + 0.2,
        phase: Math.random() * Math.PI * 2,
        px: Math.random() * 0.03 + 0.01,
      };
    });

    /* ─────────────────────────────────────────
       LAYER 3 — Near glowing orbs (18)
       Large, mouse-reactive repulsion
       ───────────────────────────────────────── */
    type NearOrb = {
      x: number; y: number; ox: number; oy: number;
      vx: number; vy: number;
      r: number; glowR: number; alpha: number;
      phase: number; color: string; px: number;
    };
    const nearColors = ['#f59e0b','#fbbf24','#d4a574','#d97706','#fef08a'];
    const nearOrbs: NearOrb[] = Array.from({ length: 18 }, () => {
      const ox = Math.random() * W, oy = Math.random() * H;
      return {
        ox, oy, x: ox, y: oy,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.18 - 0.04,
        r: Math.random() * 3 + 1.5,
        glowR: Math.random() * 55 + 25,
        alpha: Math.random() * 0.45 + 0.15,
        phase: Math.random() * Math.PI * 2,
        color: nearColors[Math.floor(Math.random() * nearColors.length)],
        px: Math.random() * 0.06 + 0.025,
      };
    });

    /* ─────────────────────────────────────────
       NEBULA CLOUDS (5)
       Slowly morphing radial gradient blobs
       ───────────────────────────────────────── */
    type Nebula = {
      x: number; y: number; vx: number; vy: number;
      r: number; alpha: number; phase: number;
      color1: string; color2: string;
    };
    const nebulaColors = [
      ['rgba(212,165,116,', 'rgba(245,158,11,'],
      ['rgba(217,119,6,',   'rgba(251,191,36,'],
      ['rgba(161,98,7,',    'rgba(212,165,116,'],
    ];
    const nebulae: Nebula[] = Array.from({ length: 5 }, () => {
      const pair = nebulaColors[Math.floor(Math.random() * nebulaColors.length)];
      return {
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.07,
        vy: (Math.random() - 0.5) * 0.06,
        r: Math.random() * 220 + 120,
        alpha: Math.random() * 0.045 + 0.012,
        phase: Math.random() * Math.PI * 2,
        color1: pair[0], color2: pair[1],
      };
    });

    /* ─────────────────────────────────────────
       SHOOTING STARS
       ───────────────────────────────────────── */
    type Shoot = {
      x: number; y: number; vx: number; vy: number;
      len: number; alpha: number; life: number; maxLife: number;
    };
    const shoots: Shoot[] = [];
    let nextShoot = 120 + Math.random() * 200;

    const spawnShoot = () => {
      const angle = Math.random() * Math.PI * 0.4 + Math.PI * 0.05;
      const speed = Math.random() * 14 + 10;
      shoots.push({
        x: Math.random() * W, y: Math.random() * H * 0.5,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        len: Math.random() * 110 + 60,
        alpha: Math.random() * 0.7 + 0.3,
        life: 0, maxLife: Math.random() * 30 + 20,
      });
    };

    /* ─────────────────────────────────────────
       MAIN DRAW LOOP
       ───────────────────────────────────────── */
    const draw = () => {
      t++;
      ctx.clearRect(0, 0, W, H);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mxN = mx / W - 0.5; // -0.5 → 0.5
      const myN = my / H - 0.5;

      /* ── Nebula clouds ── */
      nebulae.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < -n.r) n.x = W + n.r;
        if (n.x > W + n.r) n.x = -n.r;
        if (n.y < -n.r) n.y = H + n.r;
        if (n.y > H + n.r) n.y = -n.r;

        const pulse = n.alpha + Math.sin(t * 0.006 + n.phase) * n.alpha * 0.35;
        const radiusPulse = n.r + Math.sin(t * 0.004 + n.phase) * n.r * 0.08;
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, radiusPulse);
        g.addColorStop(0, n.color1 + pulse * 1.4 + ')');
        g.addColorStop(0.45, n.color2 + pulse * 0.5 + ')');
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(n.x, n.y, radiusPulse, 0, Math.PI * 2);
        ctx.fill();
      });

      /* ── Deep stars (layer 1) ── */
      deepStars.forEach(s => {
        s.x = s.ox - mxN * W * s.px;
        s.y = s.oy - myN * H * s.px;
        // Wrap
        s.ox += (Math.random() - 0.5) * 0.06;
        s.oy += (Math.random() - 0.5) * 0.05 - 0.02;
        if (s.ox < 0) s.ox = W; if (s.ox > W) s.ox = 0;
        if (s.oy < 0) s.oy = H; if (s.oy > H) s.oy = 0;

        const a = s.alpha * (0.4 + 0.6 * Math.sin(t * s.speed + s.phase));
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = '#fef9ec';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      /* ── Mid constellation particles (layer 2) ── */
      midStars.forEach(s => {
        s.ox += s.vx; s.oy += s.vy;
        if (s.ox < 0) s.ox = W; if (s.ox > W) s.ox = 0;
        if (s.oy < 0) s.oy = H; if (s.oy > H) s.oy = 0;
        s.x = s.ox - mxN * W * s.px;
        s.y = s.oy - myN * H * s.px;
      });

      // Connection lines between nearby mid-stars
      const CONNECTION_DIST = 155;
      for (let i = 0; i < midStars.length; i++) {
        for (let j = i + 1; j < midStars.length; j++) {
          const dx = midStars[i].x - midStars[j].x;
          const dy = midStars[i].y - midStars[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const lineAlpha = (1 - dist / CONNECTION_DIST) * 0.18;
            ctx.save();
            ctx.globalAlpha = lineAlpha;
            const grad = ctx.createLinearGradient(midStars[i].x, midStars[i].y, midStars[j].x, midStars[j].y);
            grad.addColorStop(0, '#d4a574');
            grad.addColorStop(1, '#f59e0b');
            ctx.strokeStyle = grad;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(midStars[i].x, midStars[i].y);
            ctx.lineTo(midStars[j].x, midStars[j].y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      // Draw mid-star dots
      midStars.forEach(s => {
        const a = s.alpha * (0.5 + 0.5 * Math.sin(t * 0.009 + s.phase));
        ctx.save();
        ctx.globalAlpha = a;
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 6;
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      /* ── Near glowing orbs (layer 3, mouse-reactive) ── */
      nearOrbs.forEach(o => {
        // Drift
        o.ox += o.vx; o.oy += o.vy;
        if (o.ox < 0) o.ox = W; if (o.ox > W) o.ox = 0;
        if (o.oy < 0) o.oy = H; if (o.oy > H) o.oy = 0;

        // Parallax
        o.x = o.ox - mxN * W * o.px;
        o.y = o.oy - myN * H * o.px;

        // Mouse repulsion
        const dx = o.x - mx, dy = o.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const repulseR = 160;
        if (dist < repulseR && dist > 0) {
          const force = (1 - dist / repulseR) * 1.8;
          o.ox += (dx / dist) * force;
          o.oy += (dy / dist) * force;
        }

        const pulse = o.alpha * (0.55 + 0.45 * Math.sin(t * 0.011 + o.phase));
        const glowPulse = o.glowR + Math.sin(t * 0.008 + o.phase) * 10;

        // Outer glow
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, glowPulse);
        g.addColorStop(0, o.color + 'cc');
        g.addColorStop(0.3, o.color + '44');
        g.addColorStop(1, 'transparent');
        ctx.save();
        ctx.globalAlpha = pulse * 0.6;
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(o.x, o.y, glowPulse, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.globalAlpha = pulse;
        ctx.shadowColor = o.color;
        ctx.shadowBlur = 16;
        ctx.fillStyle = o.color;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      /* ── Shooting stars ── */
      nextShoot--;
      if (nextShoot <= 0) {
        spawnShoot();
        nextShoot = 90 + Math.random() * 300;
      }
      for (let i = shoots.length - 1; i >= 0; i--) {
        const s = shoots[i];
        s.x += s.vx; s.y += s.vy; s.life++;
        const progress = s.life / s.maxLife;
        const a = s.alpha * Math.sin(progress * Math.PI);
        if (a <= 0 || s.life >= s.maxLife) { shoots.splice(i, 1); continue; }

        const tailX = s.x - s.vx * (s.len / 12);
        const tailY = s.y - s.vy * (s.len / 12);
        ctx.save();
        ctx.globalAlpha = a;
        const sg = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        sg.addColorStop(0, 'transparent');
        sg.addColorStop(0.6, 'rgba(251,191,36,0.4)');
        sg.addColorStop(1, 'rgba(254,249,236,0.95)');
        ctx.strokeStyle = sg;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 10;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
        ctx.restore();
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1, opacity: 0.82 }}
    />
  );
};
