import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number;
  pz: number;
  size: number;
  color: string;
  alpha: number;
  speed: number;
  angle: number;
}

interface GoldenSpacePortalProps {
  isWarping?: boolean;
  className?: string;
}

export const GoldenSpacePortal: React.FC<GoldenSpacePortalProps> = ({
  isWarping = false,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const count = isWarping ? 320 : 160;
    const particles: Particle[] = [];
    const colors = ['#f59e0b', '#fbbf24', '#d97706', '#fef08a', '#d4a574', '#ffffff'];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 2.5,
        y: (Math.random() - 0.5) * height * 2.5,
        z: Math.random() * width,
        pz: width,
        size: Math.random() * 2.2 + 0.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.7 + 0.3,
        speed: Math.random() * 2 + 1,
        angle: Math.random() * Math.PI * 2,
      });
    }

    let rotAngle = 0;

    const render = () => {
      // Cinematic dark clear with trailing effect
      ctx.fillStyle = isWarping ? 'rgba(9, 9, 11, 0.18)' : 'rgba(9, 9, 11, 0.28)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const moveSpeed = isWarping ? 32 : 4;
      rotAngle += 0.005;

      // 1. Render 3D Concentric Accretion Portal Rings
      const ringCount = 5;
      for (let r = 1; r <= ringCount; r++) {
        const radius = (r * 70 + (Date.now() * 0.03) % 70) * (isWarping ? 2.5 : 1);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(1, 0.38); // 3D Perspective tilt
        ctx.rotate(rotAngle * (r % 2 === 0 ? 1 : -1));
        ctx.strokeStyle = `rgba(245, 158, 11, ${0.12 - r * 0.015})`;
        ctx.lineWidth = isWarping ? 3 : 1.5;
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = isWarping ? 20 : 8;

        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 2. Render 3D Starfield Tunnel Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.pz = p.z;
        p.z -= moveSpeed;

        if (p.z <= 0) {
          p.z = width;
          p.pz = width;
          p.x = (Math.random() - 0.5) * width * 2.5;
          p.y = (Math.random() - 0.5) * height * 2.5;
        }

        const k = 300 / p.z;
        const pk = 300 / p.pz;
        const px = p.x * k + cx;
        const py = p.y * k + cy;

        const prevX = p.x * pk + cx;
        const prevY = p.y * pk + cy;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = isWarping ? p.size * 2.2 : p.size;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = isWarping ? 18 : 8;

          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(px, py);
          ctx.stroke();
          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isWarping]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(9,9,11,0.9)_100%)] pointer-events-none" />
    </div>
  );
};
