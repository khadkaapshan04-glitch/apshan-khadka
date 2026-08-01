import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';

interface Particle {
  x: number;
  y: number;
  z: number;
  pz: number;
  size: number;
  color: string;
  alpha: number;
}

interface GoldenSpacePortalProps {
  isWarping?: boolean;
  onWarpComplete?: () => void;
  className?: string;
}

export const GoldenSpacePortal: React.FC<GoldenSpacePortalProps> = ({
  isWarping = false,
  onWarpComplete,
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

    const particleCount = isWarping ? 250 : 120;
    const particles: Particle[] = [];
    const colors = ['#f59e0b', '#fbbf24', '#d97706', '#fef08a', '#d4a574'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 2,
        y: (Math.random() - 0.5) * height * 2,
        z: Math.random() * width,
        pz: width,
        size: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.7 + 0.3,
      });
    }

    const render = () => {
      ctx.fillStyle = 'rgba(9, 9, 11, 0.25)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const speed = isWarping ? 28 : 3;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.pz = p.z;
        p.z -= speed;

        if (p.z <= 0) {
          p.z = width;
          p.pz = width;
          p.x = (Math.random() - 0.5) * width * 2;
          p.y = (Math.random() - 0.5) * height * 2;
        }

        const k = 250 / p.z;
        const pk = 250 / p.pz;
        const px = p.x * k + cx;
        const py = p.y * k + cy;

        const prevX = p.x * pk + cx;
        const prevY = p.y * pk + cy;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = isWarping ? p.size * 1.8 : p.size;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = isWarping ? 15 : 6;

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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(9,9,11,0.85)_100%)] pointer-events-none" />
    </div>
  );
};
