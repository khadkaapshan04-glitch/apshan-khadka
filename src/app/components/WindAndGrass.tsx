import React, { useEffect } from 'react';
import { motion, useAnimation } from 'motion/react';

/* ─────────────────────────────────────────────────────────
   WindAndGrass
   
   Renders:
   1. WindTrails: Floating SVG bezier trails representing waves
      of air (wind) sweeping across the hero section.
   2. SwayingGrass: Stylized, minimal grass/botanical stems
      at the base of the hero that react to the wind gusts.
   ───────────────────────────────────────────────────────── */

// ── Wind Trail Component ─────────────────────────────────
interface WindTrailProps {
  d: string;
  delay: number;
  duration: number;
  onGust?: () => void;
}

function WindTrail({ d, delay, duration, onGust }: WindTrailProps) {
  const controls = useAnimation();

  useEffect(() => {
    const sequence = async () => {
      // Wait for delay
      await new Promise((resolve) => setTimeout(resolve, delay * 1000));
      
      while (true) {
        // Trigger grass reaction slightly after wind starts
        if (onGust) {
          setTimeout(onGust, duration * 200); // Trigger mid-way
        }

        // Animate the stroke dash
        await controls.start({
          strokeDashoffset: 0,
          opacity: [0, 0.45, 0.45, 0],
          transition: { duration, ease: 'easeInOut' },
        });

        // Reset to initial state (hidden & offset)
        controls.set({ strokeDashoffset: 1000, opacity: 0 });
        
        // Wait before next gust
        await new Promise((resolve) => setTimeout(resolve, (Math.random() * 6 + 4) * 1000));
      }
    };

    sequence();
  }, [controls, delay, duration, onGust]);

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      viewBox="0 0 1440 800"
      preserveAspectRatio="none"
      fill="none"
    >
      <motion.path
        d={d}
        stroke="url(#windGradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="300 700"
        initial={{ strokeDashoffset: 1000, opacity: 0 }}
        animate={controls}
      />
      <defs>
        <linearGradient id="windGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(212, 165, 116, 0)" />
          <stop offset="30%" stopColor="rgba(212, 165, 116, 0.22)" />
          <stop offset="70%" stopColor="rgba(106, 148, 89, 0.18)" />
          <stop offset="100%" stopColor="rgba(212, 165, 116, 0)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ── Swaying Grass Stem Component ─────────────────────────
interface GrassStemProps {
  height: number;
  width: number;
  left: string;
  bottom: string;
  delay: number;
  windControls: any;
  color?: string;
  leafColor1?: string;
  leafColor2?: string;
  reverse?: boolean;
}

function GrassStem({
  height,
  width,
  left,
  bottom,
  delay,
  windControls,
  color = '#6a9459',
  leafColor1 = '#88b874',
  leafColor2 = '#79aa65',
  reverse = false,
}: GrassStemProps) {
  // Natural idle sway
  const swayAngle = reverse ? [-1.5, 1, -1.5] : [1.5, -1, 1.5];
  
  return (
    <motion.div
      className="absolute pointer-events-none origin-bottom z-10"
      style={{
        left,
        bottom,
        width,
        height,
      }}
      animate={windControls}
      custom={{ delay, swayAngle }}
    >
      <svg
        viewBox="0 0 100 200"
        className="w-full h-full"
        fill="none"
        preserveAspectRatio="none"
      >
        {/* Main Stem */}
        <path
          d="M50 200 Q48 130 53 70 Q49 30 46 0"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
        />
        
        {/* Left Leaves */}
        <path
          d="M51 140 Q25 115 15 90 Q38 110 52 135"
          fill={leafColor1}
        />
        <path
          d="M50 90 Q28 65 18 40 Q38 60 49 85"
          fill={leafColor2}
        />
        
        {/* Right Leaves */}
        <path
          d="M52 160 Q78 135 88 110 Q65 130 53 155"
          fill={leafColor1}
        />
        <path
          d="M51 110 Q75 85 85 60 Q65 80 50 105"
          fill={leafColor2}
        />
        
        {/* Tip Leaf */}
        <path
          d="M46 0 Q40 20 48 35 Q53 20 46 0"
          fill={color}
        />
      </svg>
    </motion.div>
  );
}

// ── Main Controller Component ────────────────────────────
export function WindAndGrass() {
  const windControls1 = useAnimation();
  const windControls2 = useAnimation();

  // Helper to trigger a gust animation on grass group 1
  const triggerGust1 = () => {
    windControls1.start((custom) => ({
      rotate: [custom.swayAngle[0], custom.swayAngle[0] + 8, custom.swayAngle[0] - 4, custom.swayAngle[0]],
      skewX: [0, 6, -3, 0],
      transition: {
        duration: 2.8,
        ease: 'easeOut',
        delay: custom.delay * 0.15,
      },
    }));
  };

  // Helper to trigger a gust animation on grass group 2
  const triggerGust2 = () => {
    windControls2.start((custom) => ({
      rotate: [custom.swayAngle[0], custom.swayAngle[0] - 7, custom.swayAngle[0] + 3, custom.swayAngle[0]],
      skewX: [0, -5, 2, 0],
      transition: {
        duration: 3.2,
        ease: 'easeOut',
        delay: custom.delay * 0.15,
      },
    }));
  };

  // Idle sway sequence
  useEffect(() => {
    const runIdle = () => {
      windControls1.start((custom) => ({
        rotate: custom.swayAngle,
        skewX: [0, 0.5, 0],
        transition: {
          duration: 6 + Math.random() * 2,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      }));

      windControls2.start((custom) => ({
        rotate: custom.swayAngle,
        skewX: [0, -0.5, 0],
        transition: {
          duration: 7 + Math.random() * 2,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      }));
    };
    runIdle();
  }, [windControls1, windControls2]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* ── Wind Gusts ── */}
      {/* Top Sweep */}
      <WindTrail
        d="M -100 150 C 300 80, 800 250, 1600 120"
        delay={1}
        duration={3.5}
        onGust={triggerGust1}
      />
      {/* Middle Sweep */}
      <WindTrail
        d="M -100 400 C 400 320, 700 480, 1600 350"
        delay={4}
        duration={4.2}
        onGust={triggerGust2}
      />
      {/* Bottom Sweep */}
      <WindTrail
        d="M -100 650 C 350 720, 950 550, 1600 680"
        delay={7}
        duration={3.8}
        onGust={triggerGust1}
      />

      {/* ── Swaying Stems / Grass Tufts ── */}
      {/* Bottom Left Grass Tuft (Green Accent) */}
      <GrassStem
        height={180}
        width={75}
        left="2%"
        bottom="0%"
        delay={0.5}
        windControls={windControls1}
      />
      <GrassStem
        height={130}
        width={55}
        left="5%"
        bottom="0%"
        delay={1.2}
        windControls={windControls1}
        color="#79aa65"
        leafColor1="#93c07e"
        leafColor2="#6a9459"
        reverse
      />
      <GrassStem
        height={150}
        width={65}
        left="0.5%"
        bottom="-2%"
        delay={0.1}
        windControls={windControls1}
        color="#5f8f4e"
        leafColor1="#79aa65"
        leafColor2="#88b874"
      />

      {/* Bottom Right Grass Tuft (Warm Gold/Bronze Theme matching accent) */}
      <GrassStem
        height={220}
        width={90}
        left="91%"
        bottom="0%"
        delay={0.2}
        windControls={windControls2}
        color="#b8824f" // Theme gold-bronze
        leafColor1="#d4a574" // Light theme gold
        leafColor2="#a68968" // Darker bronze
        reverse
      />
      <GrassStem
        height={160}
        width={70}
        left="88%"
        bottom="-1%"
        delay={1.0}
        windControls={windControls2}
        color="#a68968"
        leafColor1="#d4a574"
        leafColor2="#ebd494"
      />
      <GrassStem
        height={120}
        width={50}
        left="95%"
        bottom="-3%"
        delay={1.8}
        windControls={windControls2}
        color="#d4a574"
        leafColor1="#ebd494"
        leafColor2="#b8824f"
        reverse
      />
    </div>
  );
}
