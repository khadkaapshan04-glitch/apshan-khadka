import React from 'react';
import { motion } from 'motion/react';

/* ─────────────────────────────────────────────────────────
   SplitText
   
   Splits a text string into characters or words and animates
   them with a premium staggered reveal effect (sliding
   up and fading in from a clip path mask). Uses crisp 2D
   render styling to avoid browser subpixel text blur.
   ───────────────────────────────────────────────────────── */

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  type?: 'words' | 'chars';
  style?: React.CSSProperties;
}

export function SplitText({
  text,
  className = '',
  delay = 0,
  type = 'words',
  style = {},
}: SplitTextProps) {
  // Split text into words or characters
  const items = type === 'words' ? text.split(' ') : text.split('');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: type === 'words' ? 0.06 : 0.02,
        delayChildren: delay,
      },
    },
  };

  const itemVariants = {
    hidden: {
      y: '105%',
      opacity: 0,
    },
    visible: {
      y: '0%',
      opacity: 1,
      transition: {
        duration: 0.65,
        ease: [0.25, 1, 0.5, 1], // easeOutQuart for smooth decay
      },
    },
  };

  return (
    <motion.span
      className={`inline-block select-none ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        textRendering: 'optimizeLegibility',
        ...style,
      }}
    >
      {items.map((item, index) => (
        <span
          key={index}
          className="inline-block overflow-hidden"
          style={{ verticalAlign: 'bottom', paddingBottom: '0.05em' }}
        >
          <motion.span
            className="inline-block origin-bottom"
            variants={itemVariants}
            style={{
              whiteSpace: 'pre',
              display: 'inline-block',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
            }}
          >
            {item}
          </motion.span>
          {/* Add spaces back if splitting by words */}
          {type === 'words' && index < items.length - 1 && (
            <span className="inline-block">&nbsp;</span>
          )}
        </span>
      ))}
    </motion.span>
  );
}
