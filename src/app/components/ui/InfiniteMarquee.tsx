import React from 'react';
import { motion } from 'motion/react';

interface InfiniteMarqueeProps {
  items: string[];
  speed?: number; // seconds to complete one cycle
  className?: string;
  itemClassName?: string;
}

export const InfiniteMarquee: React.FC<InfiniteMarqueeProps> = ({
  items,
  speed = 20,
  className = '',
  itemClassName = '',
}) => {
  // Duplicate items array a few times so the loop feels continuous
  const duplicatedItems = [...items, ...items, ...items, ...items];

  return (
    <div className={`relative flex overflow-hidden whitespace-nowrap bg-background ${className}`}>
      {/* 
        We use two motion divs translating from 0% to -50% to create a seamless infinite loop.
        Since they are side-by-side, moving by exactly -50% shifts them seamlessly.
      */}
      <motion.div
        className="flex items-center flex-nowrap shrink-0 will-change-transform"
        animate={{ x: [0, '-50%'] }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: 'linear',
          repeatType: 'loop',
        }}
      >
        {duplicatedItems.map((item, i) => (
          <div
            key={i}
            className={`flex items-center justify-center shrink-0 ${itemClassName}`}
          >
            {item}
            {/* Divider element between items */}
            <span className="mx-6 text-accent/50 text-sm">✦</span>
          </div>
        ))}
      </motion.div>

      {/* Fade edges to smooth the entry/exit of text */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
};
