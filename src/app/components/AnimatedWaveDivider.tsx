import React from 'react';
import { motion } from 'motion/react';

/* ─────────────────────────────────────────────────────────
   AnimatedWaveDivider
   
   A smooth, animated SVG wave that separates sections with
   gentle flowing motion.
   ───────────────────────────────────────────────────────── */

export function AnimatedWaveDivider({ flip = false }: { flip?: boolean }) {
  return (
    <div
      className="relative w-full overflow-hidden pointer-events-none"
      style={{
        height: 80,
        marginTop: flip ? 0 : -1,
        marginBottom: flip ? -1 : 0,
        transform: flip ? 'scaleY(-1)' : undefined,
      }}
    >
      <svg
        className="absolute bottom-0 w-full"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        style={{ display: 'block', width: '100%', height: '100%' }}
      >
        {/* Wave layer 1 — slowest */}
        <motion.path
          d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
          fill="rgba(212, 165, 116, 0.04)"
          animate={{
            d: [
              'M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z',
              'M0,50 C240,10 480,70 720,30 C960,10 1200,70 1440,50 L1440,80 L0,80 Z',
              'M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z',
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Wave layer 2 — medium */}
        <motion.path
          d="M0,50 C360,20 720,70 1080,35 C1260,20 1350,50 1440,45 L1440,80 L0,80 Z"
          fill="rgba(212, 165, 116, 0.06)"
          animate={{
            d: [
              'M0,50 C360,20 720,70 1080,35 C1260,20 1350,50 1440,45 L1440,80 L0,80 Z',
              'M0,35 C360,65 720,25 1080,55 C1260,70 1350,30 1440,40 L1440,80 L0,80 Z',
              'M0,50 C360,20 720,70 1080,35 C1260,20 1350,50 1440,45 L1440,80 L0,80 Z',
            ],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Wave layer 3 — fastest, most opaque */}
        <motion.path
          d="M0,55 C180,40 360,65 540,50 C720,35 900,60 1080,48 C1260,36 1350,55 1440,50 L1440,80 L0,80 Z"
          fill="rgba(212, 165, 116, 0.08)"
          animate={{
            d: [
              'M0,55 C180,40 360,65 540,50 C720,35 900,60 1080,48 C1260,36 1350,55 1440,50 L1440,80 L0,80 Z',
              'M0,45 C180,60 360,35 540,55 C720,65 900,40 1080,52 C1260,64 1350,42 1440,48 L1440,80 L0,80 Z',
              'M0,55 C180,40 360,65 540,50 C720,35 900,60 1080,48 C1260,36 1350,55 1440,50 L1440,80 L0,80 Z',
            ],
          }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>
    </div>
  );
}
