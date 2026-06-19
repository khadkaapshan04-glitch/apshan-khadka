import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

/* ─────────────────────────────────────────────────────────
   Tilt3DCard
   
   Wraps any child content in a 3D tilt-on-hover container.
   The card subtly rotates towards the cursor and adds a 
   dynamic highlight shimmer.
   ───────────────────────────────────────────────────────── */

interface Tilt3DCardProps {
  children: React.ReactNode;
  className?: string;
  tiltIntensity?: number;
  glareEnabled?: boolean;
  onClick?: () => void;
}

export function Tilt3DCard({
  children,
  className = '',
  tiltIntensity = 15,
  glareEnabled = true,
  onClick,
}: Tilt3DCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);

  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = e.clientX - centerX;
    const y = e.clientY - centerY;

    rotateX.set((-y / (rect.height / 2)) * tiltIntensity);
    rotateY.set((x / (rect.width / 2)) * tiltIntensity);
    glareX.set(((e.clientX - rect.left) / rect.width) * 100);
    glareY.set(((e.clientY - rect.top) / rect.height) * 100);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    glareX.set(50);
    glareY.set(50);
    setIsHovered(false);
  };

  // Generate the glare gradient position
  const glareBackground = useTransform(
    [glareX, glareY],
    ([gx, gy]: number[]) =>
      `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.15) 0%, transparent 60%)`
  );

  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      style={{
        perspective: isHovered ? 800 : undefined,
        transformStyle: isHovered ? 'preserve-3d' : undefined,
        rotateX: springRotateX,
        rotateY: springRotateY,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={{ z: 20 }}
      transition={{ duration: 0.2 }}
    >
      {children}

      {/* Glare overlay */}
      {glareEnabled && isHovered && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none z-10"
          style={{
            background: glareBackground as any,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </motion.div>
  );
}
