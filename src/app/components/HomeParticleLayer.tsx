import React, { useEffect, useRef } from 'react';

/* ═══════════════════════════════════════════════════════════
   HomeParticleLayer
   A purely decorative canvas layer for the HomePage.
   Renders:
     1. Slow golden dust motes drifting across the viewport
     2. Subtle depth-of-field bokeh orbs
     3. Hair-thin amber grid lines fading in/out (space feel)
   Sits as position:fixed, pointer-events:none, z-0 so it
   never interferes with any existing content or interactions.
   ═══════════════════════════════════════════════════════════ */
export const HomeParticleLayer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const handleResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    /* ── 1. Golden Dust Motes ── */
    type Mote = {
      x: number; y: number; vx: number; vy: number;
      r: number; alpha: number; phase: number; speed: number;
    };
    const motes: Mote[] = Array.from({ length: 70 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.18 - 0.06,
      r: Math.random() * 1.8 + 0.4,
      alpha: Math.random() * 0.45 + 0.1,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.008 + 0.003,
    }));

    /* ── 2. Bokeh Orbs ── */
    type Orb = {
      x: number; y: number; vx: number; vy: number;
      r: number; alpha: number; phase: number; color: string;
    };
    const orbColors = [
      'rgba(212,165,116,COLOR)', 'rgba(245,158,11,COLOR)',
      'rgba(217,119,6,COLOR)', 'rgba(251,191,36,COLOR)',
    ];
    const orbs: Orb[] = Array.from({ length: 18 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.1,
      r: Math.random() * 80 + 30,
      alpha: Math.random() * 0.055 + 0.015,
      phase: Math.random() * Math.PI * 2,
      color: orbColors[Math.floor(Math.random() * orbColors.length)],
    }));

    /* ── 3. Space Grid Lines ── */
    type GridLine = {
      progress: number; speed: number; alpha: number;
      isHoriz: boolean; pos: number;
    };
    const gridLines: GridLine[] = Array.from({ length: 12 }, () => ({
      progress: Math.random(),
      speed: Math.random() * 0.0008 + 0.0003,
      alpha: Math.random() * 0.06 + 0.02,
      isHoriz: Math.random() > 0.5,
      pos: Math.random(),
    }));

    let t = 0;

    const draw = () => {
      t++;
      ctx.clearRect(0, 0, W, H);

      /* -- Bokeh orbs -- */
      orbs.forEach(o => {
        o.x += o.vx; o.y += o.vy;
        if (o.x < -o.r * 2) o.x = W + o.r;
        if (o.x > W + o.r * 2) o.x = -o.r;
        if (o.y < -o.r * 2) o.y = H + o.r;
        if (o.y > H + o.r * 2) o.y = -o.r;

        const pulse = o.alpha + Math.sin(t * 0.007 + o.phase) * (o.alpha * 0.4);
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        const col = o.color.replace('COLOR', String(pulse));
        g.addColorStop(0, col);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fill();
      });

      /* -- Space grid lines -- */
      gridLines.forEach(gl => {
        gl.progress += gl.speed;
        if (gl.progress > 1) gl.progress = 0;

        const pulse = gl.alpha * (0.4 + 0.6 * Math.sin(t * 0.005 + gl.progress * Math.PI));
        ctx.save();
        ctx.globalAlpha = pulse;
        ctx.strokeStyle = '#d4a574';
        ctx.lineWidth = 0.5;

        if (gl.isHoriz) {
          const y = gl.pos * H;
          const xStart = gl.progress * W * 1.5 - W * 0.25;
          const xEnd = xStart + W * 0.4;
          const grad = ctx.createLinearGradient(xStart, y, xEnd, y);
          grad.addColorStop(0, 'transparent');
          grad.addColorStop(0.5, `rgba(212,165,116,${pulse})`);
          grad.addColorStop(1, 'transparent');
          ctx.strokeStyle = grad as unknown as string;
          ctx.beginPath();
          ctx.moveTo(xStart, y);
          ctx.lineTo(xEnd, y);
          ctx.stroke();
        } else {
          const x = gl.pos * W;
          const yStart = gl.progress * H * 1.5 - H * 0.25;
          const yEnd = yStart + H * 0.4;
          const grad = ctx.createLinearGradient(x, yStart, x, yEnd);
          grad.addColorStop(0, 'transparent');
          grad.addColorStop(0.5, `rgba(212,165,116,${pulse})`);
          grad.addColorStop(1, 'transparent');
          ctx.strokeStyle = grad as unknown as string;
          ctx.beginPath();
          ctx.moveTo(x, yStart);
          ctx.lineTo(x, yEnd);
          ctx.stroke();
        }
        ctx.restore();
      });

      /* -- Golden dust motes -- */
      motes.forEach(m => {
        m.x += m.vx + Math.sin(t * 0.008 + m.phase) * 0.15;
        m.y += m.vy;
        if (m.x < 0) m.x = W;
        if (m.x > W) m.x = 0;
        if (m.y < -10) m.y = H + 10;
        if (m.y > H + 10) m.y = -10;

        const a = m.alpha * (0.45 + 0.55 * Math.sin(t * m.speed + m.phase));
        ctx.save();
        ctx.globalAlpha = a;
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 5;
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1, opacity: 0.7 }}
    />
  );
};
