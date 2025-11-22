import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { BoardItem } from '../types';
import { User, Users, ShoppingBag, StickyNote, Edit2 } from 'lucide-react';
import clsx from 'clsx';

interface PackCardProps {
  item: BoardItem;
  overlay?: boolean;
  onEdit?: (item: BoardItem) => void;
}

export const PackCard: React.FC<PackCardProps> = ({ item, overlay, onEdit }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.dndId,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const getOwnerBadge = () => {
    switch (item.viewOwner) {
      case 'jonne': return <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded font-medium flex items-center gap-1"><User size={10}/> Jonne</span>;
      case 'frank': return <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded font-medium flex items-center gap-1"><User size={10}/> Frank</span>;
      case 'shared': return <span className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.5 rounded font-medium flex items-center gap-1"><Users size={10}/> Gemeinsam</span>;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={clsx(
        "bg-white p-3 rounded-lg shadow-sm border border-gray-200 group relative select-none touch-none",
        isDragging ? "opacity-30" : "opacity-100",
        overlay ? "shadow-xl rotate-2 scale-105 cursor-grabbing" : "hover:shadow-md hover:border-blue-300 transition-all cursor-grab active:cursor-grabbing"
      )}
    >
      <div className="flex justify-between items-start gap-2">
        <h4 className="font-medium text-gray-900 text-sm leading-tight">{item.name}</h4>
        {onEdit && (
          <button 
            onPointerDown={(e) => e.stopPropagation()} // Prevent drag start
            onClick={(e) => { e.stopPropagation(); onEdit(item); }}
            className="text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 -mr-1 -mt-1"
            title="Bearbeiten"
          >
            <Edit2 size={12} />
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-1 mt-2 items-center">
        {item.category && (
          <span className="bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded truncate max-w-[80px]">{item.category}</span>
        )}
        {getOwnerBadge()}
        {item.source_type && (
            <span className="bg-yellow-50 text-yellow-700 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1" title={`Source: ${item.source_type}`}>
                <ShoppingBag size={10} />
            </span>
        )}
         {item.notes && (
            <span className="bg-amber-50 text-amber-600 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1" title={item.notes}>
                <StickyNote size={10} />
            </span>
        )}
      </div>
    </div>
  );
};
