import React from 'react';
import { motion } from 'motion/react';
import { RestaurantTable } from '../utils/mockDb';
import { Users, Info } from 'lucide-react';

interface TableLayoutProps {
  tables: RestaurantTable[];
  availableTableIds: string[];
  selectedTableId: string | null;
  onSelectTable: (tableId: string) => void;
  guestCount: number;
}

export const TableLayout: React.FC<TableLayoutProps> = ({
  tables,
  availableTableIds,
  selectedTableId,
  onSelectTable,
  guestCount
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground pb-4 border-b border-border/10">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-green-500/20 border border-green-500/50" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-red-500/20 border border-red-500/50" />
          <span>Reserved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-secondary border border-border/30" />
          <span>Too Small</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-accent border border-accent" />
          <span>Selected</span>
        </div>
      </div>

      <div className="relative w-full aspect-[16/10] bg-secondary/20 rounded-3xl border border-border/30 overflow-hidden p-8">
        {/* Entrance Marker */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-border/40 px-6 py-1 rounded-b-xl text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Entrance
        </div>

        {/* Kitchen Marker */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-border/40 px-6 py-1 rounded-t-xl text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Kitchen
        </div>

        {tables.map((table) => {
          const isSuitable = table.capacity >= guestCount;
          const isAvailable = availableTableIds.includes(table.id);
          const isSelected = selectedTableId === table.id;

          let statusColor = "bg-secondary border-border/30 text-muted-foreground opacity-50";
          if (isSuitable) {
            if (isAvailable) {
              statusColor = isSelected
                ? "bg-accent border-accent text-white shadow-lg shadow-accent/20 scale-105 z-10"
                : "bg-green-500/10 border-green-500/40 text-green-700 hover:bg-green-500/20 cursor-pointer";
            } else {
              statusColor = "bg-red-500/10 border-red-500/40 text-red-700 opacity-80 cursor-not-allowed";
            }
          }

          const tableSize = table.capacity <= 2 ? 'w-16 h-16' : table.capacity <= 4 ? 'w-20 h-20' : 'w-24 h-24';

          return (
            <motion.button
              key={table.id}
              type="button"
              whileHover={isAvailable && isSuitable ? { scale: 1.05 } : {}}
              whileTap={isAvailable && isSuitable ? { scale: 0.95 } : {}}
              onClick={() => isAvailable && isSuitable && onSelectTable(table.id)}
              disabled={!isAvailable || !isSuitable}
              className={`absolute flex flex-col items-center justify-center rounded-2xl border-2 transition-all duration-300 ${tableSize} ${statusColor}`}
              style={{
                left: `${table.position.x}%`,
                top: `${table.position.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <span className="text-xs font-bold">T-{table.number}</span>
              <div className="flex items-center gap-0.5 mt-1">
                <Users className="w-3 h-3" />
                <span className="text-[10px] font-medium">{table.capacity}</span>
              </div>
              {isSelected && (
                <motion.div
                  layoutId="selected-ring"
                  className="absolute -inset-2 border-2 border-accent rounded-[22px] opacity-40"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Please select an available table (green) from the layout above. Tables are automatically filtered based on your guest count. A standard reservation lasts for 2 hours.
        </p>
      </div>
    </div>
  );
};
