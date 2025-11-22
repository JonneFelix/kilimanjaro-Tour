import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { BoardItem } from '../types';
import { PackCard } from './PackCard';

interface PackColumnProps {
  id: string;
  title: string;
  items: BoardItem[];
  onEditItem?: (item: BoardItem) => void;
}

export const PackColumn: React.FC<PackColumnProps> = ({ id, title, items, onEditItem }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <div 
      ref={setNodeRef}
      className={`flex-shrink-0 w-72 bg-gray-100 rounded-xl flex flex-col max-h-full transition-colors snap-center ${isOver ? 'bg-blue-50 ring-2 ring-blue-200' : ''}`}
    >
      <div className="p-3 font-semibold text-gray-700 flex justify-between items-center sticky top-0 bg-gray-100 rounded-t-xl z-10 border-b border-gray-200">
        <span>{title}</span>
        <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">{items.length}</span>
      </div>
      <div className="p-2 flex-1 overflow-y-auto flex flex-col gap-2 min-h-[100px]">
        {items.map(item => (
          <PackCard key={item.dndId} item={item} onEdit={onEditItem} />
        ))}
      </div>
    </div>
  );
};

