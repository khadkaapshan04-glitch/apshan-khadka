import React from 'react';
import { FloatingFood3D } from '../components/FloatingFood3D';
import { StaffAdminKitchenView } from '../components/StaffAdminKitchenView';

export function StaffAdminKitchenPage({ mode }: { mode: 'staff' | 'admin' }) {
  return (
    <div className="pt-[72px] min-h-screen bg-background pb-12 relative overflow-hidden">
      <FloatingFood3D
        src="https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&q=80&w=600"
        size={160}
        className="absolute -right-10 top-32 opacity-20 hidden xl:block"
        initialRotation={{ x: 10, y: -20, z: 0 }}
      />
      <StaffAdminKitchenView mode={mode} />
    </div>
  );
}

