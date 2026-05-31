import React from 'react';
import { KitchenView } from '../components/KitchenView';
import { FloatingFood3D } from '../components/FloatingFood3D';

export function KitchenPage() {
  return (
    <div className="pt-[72px] min-h-screen bg-background pb-12 relative overflow-hidden">
      <FloatingFood3D
        src="https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&q=80&w=600"
        size={140}
        className="absolute -right-10 top-32 opacity-20 hidden xl:block"
        initialRotation={{ x: 10, y: -20, z: 0 }}
      />
      <KitchenView />
    </div>
  );
}

