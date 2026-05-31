import React from 'react';
import { AdminView } from '../components/AdminView';
import { FloatingFood3D } from '../components/FloatingFood3D';

export function AdminPage() {
  return (
    <div className="pt-[72px] min-h-screen bg-background pb-12 relative overflow-hidden">
      <FloatingFood3D
        src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600"
        size={140}
        className="absolute -left-10 top-32 opacity-20 hidden xl:block"
        initialRotation={{ x: 10, y: 20, z: 0 }}
      />
      <AdminView />
    </div>
  );
}

