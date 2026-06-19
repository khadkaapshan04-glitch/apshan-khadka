import React, { useEffect, useRef, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

/* ─────────────────────────────────────────────────────────
   Hero3DBackground
   
   Renders multiple layers of animated 3D geometry behind
   the hero section:
   • Floating glowing orbs on lissajous curves
   • Rotating wireframe torus rings (CSS 3D)
   • Parallax-shifting geometric particles
   ───────────────────────────────────────────────────────── */

// ── Glowing Orb ──────────────────────────────────────────
function GlowingOrb({
  size,
  color,
  blur,
  duration,
  delay,
  pathX,
  pathY,
}: {
  size: number;
  color: string;
  blur: number;
  duration: number;
  delay: number;
  pathX: number[];
  pathY: number[];
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: `blur(${blur}px)`,
        willChange: 'transform',
      }}
      animate={{
        x: pathX,
        y: pathY,
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatType: 'mirror',
        ease: 'easeInOut',
      }}
    />
  );
}

// ── 3D Rotating Ring ─────────────────────────────────────
function RotatingRing({
  size,
  color,
  thickness,
  duration,
  rotateAxis,
  initialAngle,
  opacity,
  top,
  left,
}: {
  size: number;
  color: string;
  thickness: number;
  duration: number;
  rotateAxis: 'X' | 'Y' | 'Z';
  initialAngle: number;
  opacity: number;
  top: string;
  left: string;
}) {
  const animateProps = {
    ...(rotateAxis === 'X' ? { rotateX: [initialAngle, initialAngle + 360] } : {}),
    ...(rotateAxis === 'Y' ? { rotateY: [initialAngle, initialAngle + 360] } : {}),
    ...(rotateAxis === 'Z' ? { rotateZ: [initialAngle, initialAngle + 360] } : {}),
  };

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        top,
        left,
        width: size,
        height: size,
        perspective: 800,
        transformStyle: 'preserve-3d',
        opacity,
      }}
      animate={animateProps}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      <div
        className="w-full h-full rounded-full"
        style={{
          border: `${thickness}px solid ${color}`,
          borderRadius: '50%',
          transformStyle: 'preserve-3d',
          transform: 'rotateX(65deg)',
        }}
      />
    </motion.div>
  );
}

// ── Floating Geometric Particle ──────────────────────────
function FloatingParticle({
  size,
  color,
  shape,
  duration,
  delay,
  startX,
  startY,
  floatRange,
}: {
  size: number;
  color: string;
  shape: 'diamond' | 'circle' | 'square' | 'triangle';
  duration: number;
  delay: number;
  startX: string;
  startY: string;
  floatRange: number;
}) {
  const borderRadius = shape === 'circle' ? '50%' : shape === 'diamond' ? '4px' : '3px';
  const rotation = shape === 'diamond' ? 45 : 0;
  const clipPath = shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : undefined;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: startX,
        top: startY,
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius,
        clipPath,
        transform: `rotate(${rotation}deg)`,
        willChange: 'transform, opacity',
      }}
      animate={{
        y: [0, -floatRange, 0, floatRange * 0.5, 0],
        x: [0, floatRange * 0.3, 0, -floatRange * 0.3, 0],
        rotate: [rotation, rotation + 180, rotation + 360],
        opacity: [0.3, 0.7, 0.3],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

// ── Main Component ───────────────────────────────────────
export function Hero3DBackground({ mousePos }: { mousePos: { x: number; y: number } }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const springX = useSpring(mx, { stiffness: 40, damping: 30 });
  const springY = useSpring(my, { stiffness: 40, damping: 30 });

  useEffect(() => {
    mx.set(mousePos.x * 0.5);
    my.set(mousePos.y * 0.5);
  }, [mousePos.x, mousePos.y]);

  const layer1X = useTransform(springX, (v) => v * 0.3);
  const layer1Y = useTransform(springY, (v) => v * 0.3);
  const layer2X = useTransform(springX, (v) => v * 0.6);
  const layer2Y = useTransform(springY, (v) => v * 0.6);
  const layer3X = useTransform(springX, (v) => v * 1.0);
  const layer3Y = useTransform(springY, (v) => v * 1.0);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ perspective: 1200 }}>
      {/* ── Layer 1: Deep background orbs ── */}
      <motion.div
        className="absolute inset-0"
        style={{ x: layer1X, y: layer1Y, transformStyle: 'preserve-3d', translateZ: -200 }}
      >
        <GlowingOrb
          size={300}
          color="rgba(212, 165, 116, 0.08)"
          blur={80}
          duration={18}
          delay={0}
          pathX={[-50, 100, -30]}
          pathY={[-20, 80, -40]}
        />
        <GlowingOrb
          size={200}
          color="rgba(212, 165, 116, 0.06)"
          blur={60}
          duration={22}
          delay={3}
          pathX={[400, 250, 500]}
          pathY={[100, -30, 150]}
        />
        <GlowingOrb
          size={150}
          color="rgba(185, 130, 80, 0.05)"
          blur={50}
          duration={15}
          delay={6}
          pathX={[200, 350, 150]}
          pathY={[300, 200, 350]}
        />
      </motion.div>

      {/* ── Layer 2: Rotating 3D rings ── */}
      <motion.div
        className="absolute inset-0"
        style={{ x: layer2X, y: layer2Y, transformStyle: 'preserve-3d' }}
      >
        <RotatingRing
          size={220}
          color="rgba(212, 165, 116, 0.08)"
          thickness={1}
          duration={25}
          rotateAxis="Y"
          initialAngle={0}
          opacity={0.6}
          top="8%"
          left="75%"
        />
        <RotatingRing
          size={160}
          color="rgba(212, 165, 116, 0.06)"
          thickness={1}
          duration={30}
          rotateAxis="X"
          initialAngle={45}
          opacity={0.5}
          top="65%"
          left="10%"
        />
        <RotatingRing
          size={100}
          color="rgba(185, 130, 80, 0.07)"
          thickness={1}
          duration={20}
          rotateAxis="Z"
          initialAngle={20}
          opacity={0.4}
          top="35%"
          left="50%"
        />
      </motion.div>

      {/* ── Layer 3: Floating geometric particles ── */}
      <motion.div
        className="absolute inset-0"
        style={{ x: layer3X, y: layer3Y }}
      >
        <FloatingParticle size={8} color="rgba(212, 165, 116, 0.25)" shape="diamond" duration={12} delay={0} startX="15%" startY="20%" floatRange={30} />
        <FloatingParticle size={6} color="rgba(212, 165, 116, 0.20)" shape="circle" duration={10} delay={1} startX="80%" startY="30%" floatRange={25} />
        <FloatingParticle size={10} color="rgba(185, 130, 80, 0.15)" shape="square" duration={14} delay={2} startX="60%" startY="70%" floatRange={35} />
        <FloatingParticle size={7} color="rgba(212, 165, 116, 0.22)" shape="diamond" duration={11} delay={3} startX="30%" startY="60%" floatRange={20} />
        <FloatingParticle size={5} color="rgba(212, 165, 116, 0.18)" shape="circle" duration={9} delay={0.5} startX="90%" startY="55%" floatRange={28} />
        <FloatingParticle size={9} color="rgba(185, 130, 80, 0.12)" shape="triangle" duration={16} delay={4} startX="45%" startY="15%" floatRange={32} />
        <FloatingParticle size={6} color="rgba(212, 165, 116, 0.20)" shape="diamond" duration={13} delay={2.5} startX="70%" startY="80%" floatRange={22} />
        <FloatingParticle size={4} color="rgba(212, 165, 116, 0.15)" shape="circle" duration={8} delay={1.5} startX="25%" startY="85%" floatRange={18} />
      </motion.div>

      {/* ── Animated gradient sweep ── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, transparent 0%, rgba(212,165,116,0.03) 25%, transparent 50%, rgba(185,130,80,0.02) 75%, transparent 100%)',
          backgroundSize: '400% 400%',
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}
