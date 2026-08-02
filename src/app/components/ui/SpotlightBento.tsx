import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface SpotlightBentoProps {
  items: {
    title: string;
    description: string;
    icon: React.ReactNode;
    colSpan?: number;
    bgImage?: string;
  }[];
}

export const SpotlightBento: React.FC<SpotlightBentoProps> = ({ items }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePosition({ x, y });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 group relative"
    >
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: i * 0.1, ease: 'easeOut' }}
          className={`relative overflow-hidden rounded-3xl bg-secondary/30 border border-border/20 ${
            item.colSpan === 2 ? 'md:col-span-2' : ''
          } ${item.colSpan === 3 ? 'md:col-span-3' : ''}`}
        >
          {/* Spotlight Gradient effect (only visible on hover through group-hover opacity mask) */}
          <div
            className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-0"
            style={{
              background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(200, 146, 58, 0.15), transparent 40%)`,
            }}
          />

          {/* Border Highlight Spotlight */}
          <div
            className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-0"
            style={{
              background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(200, 146, 58, 0.4), transparent 40%)`,
              WebkitMask:
                'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              padding: '1px',
            }}
          />

          {/* Background image if provided */}
          {item.bgImage && (
            <div
              className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay transition-transform duration-700 hover:scale-105"
              style={{ backgroundImage: `url(${item.bgImage})` }}
            />
          )}

          {/* Card Content */}
          <div className="relative z-10 p-8 h-full flex flex-col justify-end min-h-[220px]">
            <div className="mb-4 inline-flex p-3 rounded-2xl bg-background/50 backdrop-blur-md border border-border/50 text-accent w-fit shadow-lg">
              {item.icon}
            </div>
            <h3 className="text-xl font-display font-bold text-foreground mb-2">
              {item.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              {item.description}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
