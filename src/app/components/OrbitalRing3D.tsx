import React from 'react';
import { motion } from 'motion/react';

/* ─────────────────────────────────────────────────────────
   OrbitalRing3D
   
   Renders animated orbital rings around the hero food image
   with small orbiting dots for a futuristic 3D feel.
   ───────────────────────────────────────────────────────── */

function OrbitDot({
  orbitSize,
  dotSize,
  duration,
  delay,
  color,
}: {
  orbitSize: number;
  dotSize: number;
  duration: number;
  delay: number;
  color: string;
}) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        width: dotSize,
        height: dotSize,
        borderRadius: '50%',
        backgroundColor: color,
        boxShadow: `0 0 ${dotSize * 2}px ${color}`,
        top: '50%',
        left: '50%',
        marginTop: -dotSize / 2,
        marginLeft: -dotSize / 2,
      }}
      animate={{
        rotate: [0, 360],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
      // Use a wrapper to position along the orbit
    >
      <motion.div
        style={{
          position: 'absolute',
          top: -orbitSize / 2,
          left: -dotSize / 2,
          width: dotSize,
          height: dotSize,
          borderRadius: '50%',
          backgroundColor: color,
          boxShadow: `0 0 ${dotSize * 3}px ${color}`,
        }}
      />
    </motion.div>
  );
}

export function OrbitalRing3D() {
  const rings = [
    { size: 430, tilt: 72, rotateY: 0, duration: 20, color: 'rgba(212, 165, 116, 0.12)', thickness: 1 },
    { size: 470, tilt: 68, rotateY: 60, duration: 28, color: 'rgba(212, 165, 116, 0.08)', thickness: 1 },
    { size: 510, tilt: 75, rotateY: 120, duration: 35, color: 'rgba(185, 130, 80, 0.06)', thickness: 1 },
  ];

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ perspective: 900, transformStyle: 'preserve-3d' }}
    >
      {rings.map((ring, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            width: ring.size,
            height: ring.size,
            top: '50%',
            left: '50%',
            marginTop: -ring.size / 2,
            marginLeft: -ring.size / 2,
            transformStyle: 'preserve-3d',
            transform: `rotateX(${ring.tilt}deg) rotateY(${ring.rotateY}deg)`,
          }}
          animate={{
            rotateZ: [0, 360],
          }}
          transition={{
            duration: ring.duration,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {/* Ring border */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: `${ring.thickness}px solid ${ring.color}`,
            }}
          />

          {/* Orbiting dot */}
          <motion.div
            className="absolute"
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: 'rgba(212, 165, 116, 0.6)',
              boxShadow: '0 0 12px rgba(212, 165, 116, 0.4)',
              top: -3,
              left: '50%',
              marginLeft: -3,
            }}
          />

          {/* Second orbiting dot on opposite side */}
          <motion.div
            className="absolute"
            style={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              backgroundColor: 'rgba(212, 165, 116, 0.4)',
              boxShadow: '0 0 8px rgba(212, 165, 116, 0.3)',
              bottom: -2,
              left: '50%',
              marginLeft: -2,
            }}
          />
        </motion.div>
      ))}

      {/* Center glow pulse */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 200,
          height: 200,
          top: '50%',
          left: '50%',
          marginTop: -100,
          marginLeft: -100,
          background: 'radial-gradient(circle, rgba(212, 165, 116, 0.06) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}
