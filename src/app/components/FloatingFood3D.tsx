import React from 'react';
import { motion } from 'motion/react';

interface FloatingFood3DProps {
  src: string;
  size?: number;
  className?: string;
  initialRotation?: { x: number; y: number; z: number };
  floatIntensity?: number;
  rotationIntensity?: number;
}

export function FloatingFood3D({
  src,
  size = 120,
  className = "",
  initialRotation = { x: 15, y: 15, z: 0 },
  floatIntensity = 20,
  rotationIntensity = 10,
}: FloatingFood3DProps) {
  return (
    <motion.div
      className={`relative ${className}`}
      style={{
        width: size,
        height: size,
        perspective: 1000,
      }}
      initial={{
        rotateX: initialRotation.x,
        rotateY: initialRotation.y,
        rotateZ: initialRotation.z,
        y: 0
      }}
      animate={{
        rotateX: [
          initialRotation.x - rotationIntensity,
          initialRotation.x + rotationIntensity,
          initialRotation.x - rotationIntensity
        ],
        rotateY: [
          initialRotation.y - rotationIntensity,
          initialRotation.y + rotationIntensity,
          initialRotation.y - rotationIntensity
        ],
        rotateZ: [
          initialRotation.z - 5,
          initialRotation.z + 5,
          initialRotation.z - 5
        ],
        y: [-floatIntensity, floatIntensity, -floatIntensity],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <div className="relative w-full h-full">
        {/* Shadow */}
        <motion.div
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-4/5 h-4 bg-black/10 rounded-[100%] blur-xl"
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Food Image with 3D look */}
        <div className="w-full h-full rounded-full overflow-hidden shadow-2xl border-4 border-white/10 backdrop-blur-sm">
          <img
            src={src}
            alt="Floating food"
            className="w-full h-full object-cover"
          />
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none" />
        </div>
      </div>
    </motion.div>
  );
}
