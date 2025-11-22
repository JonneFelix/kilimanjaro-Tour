import React, { useEffect, useState } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { ItemStatus, EquipmentItem } from '../shared-types';
import type { BoardItem } from '../types';
import { useUser } from '../context/UserContext';
import { getEquipment, updateEquipment, TRIP_ID } from '../lib/api';
import { Loader2, Plus, Filter, Eye } from 'lucide-react';
import clsx from 'clsx';
import { PackColumn } from './PackColumn';
import { PackCard } from './PackCard';
import { ItemModal } from './ItemModal';

const COLUMNS: { id: ItemStatus; title: string }[] = [
  { id: 'backlog', title: 'Backlog' },
  { id: 'to_buy', title: 'Noch besorgen' },
  { id: 'ready_to_pack', title: 'Bereit' },
  { id: 'packed', title: 'Eingepackt' },
  { id: 'optional', title: 'Optional' },
  { id: 'not_needed', title: 'Nicht benötigt' },
];

export const PackBoard: React.FC = () => {
  const { user } = useUser();
  const [items, setItems] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null); 
  const [filter, setFilter] = useState<'all' | 'mine' | 'shared'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<EquipmentItem | undefined>(undefined);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await getEquipment(TRIP_ID);
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Transform Items into View Items
  // Logic: 
  // - If 'both_individual', create TWO virtual items (Jonne & Frank).
  // - If 'shared', create ONE shared item.
  // - If 'jonne'/'frank', create ONE item.
  const getBoardItems = (): BoardItem[] => {
    const boardItems: BoardItem[] = [];
    
    items.forEach(item => {
      if (item.assignment === 'both_individual') {
        // Virtual Item for Jonne
        boardItems.push({
          ...item,
          dndId: `${item.id}-jonne`,
          viewOwner: 'jonne',
          currentStatus: item.jonne_status || 'backlog'
        });
        // Virtual Item for Frank
        boardItems.push({
          ...item,
          dndId: `${item.id}-frank`,
          viewOwner: 'frank',
          currentStatus: item.frank_status || 'backlog'
        });
      } else {
        // Single Item
        boardItems.push({
          ...item,
          dndId: `${item.id}`,
          viewOwner: item.assignment === 'shared' ? 'shared' : item.assignment as 'jonne' | 'frank',
          currentStatus: item.general_status || 'backlog'
        });
      }
    });

    return boardItems;
  };

  const allBoardItems = getBoardItems();

  // Filter View
  const filteredBoardItems = allBoardItems.filter(bItem => {
    if (filter === 'all') return true;
    if (filter === 'mine') {
      if (!user) return true;
      // Show my items AND shared items
      return bItem.viewOwner === user || bItem.viewOwner === 'shared'; 
    }
    if (filter === 'shared') {
      return bItem.viewOwner === 'shared';
    }
    return true;
  });

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const dndId = active.id as string;
    const overId = over.id; // New Status

    // Identify the board item
    const boardItem = allBoardItems.find(bi => bi.dndId === dndId);
    if (!boardItem) return;

    // Check if valid drop (on column)
    if (!COLUMNS.some(c => c.id === overId)) return;

    const newStatus = overId as ItemStatus;
    if (boardItem.currentStatus === newStatus) return;

    // Update DB
    // Logic:
    // - If virtual item (both_individual), update specific status field.
    // - If normal item, update general_status.
    
    const updates: Partial<EquipmentItem> = {};
    if (boardItem.assignment === 'both_individual') {
      if (boardItem.viewOwner === 'jonne') updates.jonne_status = newStatus;
      if (boardItem.viewOwner === 'frank') updates.frank_status = newStatus;
    } else {
      updates.general_status = newStatus;
    }

    // Optimistic UI Update (Local state update requires refreshing fetch or complex local update)
    // Simple approach: Fetch after update. Or simple map update for speed.
    // Let's update the 'items' state.
    setItems(prev => prev.map(i => {
      if (i.id === boardItem.id) {
        return { ...i, ...updates };
      }
      return i;
    }));

    try {
      await updateEquipment(boardItem.id, updates);
    } catch (e) {
      console.error(e);
      fetchItems();
    }
  };

  const handleEdit = (item: EquipmentItem) => {
    setEditingItem(item);
    setShowModal(true);
  };

  // Group for columns
  const itemsByStatus: Record<ItemStatus, BoardItem[]> = {
    backlog: [], to_buy: [], ready_to_pack: [], packed: [], optional: [], not_needed: []
  };

  filteredBoardItems.forEach(item => {
    if (itemsByStatus[item.currentStatus]) {
      itemsByStatus[item.currentStatus].push(item);
    }
  });

  const activeBoardItem = activeId ? allBoardItems.find(i => i.dndId === activeId) : null;

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCorners} 
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
          <div className="flex items-center gap-2 bg-white p-1 rounded-lg border shadow-sm overflow-x-auto max-w-full">
            <button 
              onClick={() => setFilter('all')}
              className={clsx("whitespace-nowrap px-3 py-1 text-sm rounded-md transition-colors", filter === 'all' ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50")}
            >
              <Eye size={14} className="inline mr-1"/> Alle
            </button>
            <button 
              onClick={() => setFilter('mine')}
              className={clsx("whitespace-nowrap px-3 py-1 text-sm rounded-md transition-colors", filter === 'mine' ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50")}
            >
              <Filter size={14} className="inline mr-1"/> Meine
            </button>
            <button 
              onClick={() => setFilter('shared')}
              className={clsx("whitespace-nowrap px-3 py-1 text-sm rounded-md transition-colors", filter === 'shared' ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50")}
            >
              Nur Gemeinsame
            </button>
          </div>
          
          <button 
            className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-blue-700 shadow-sm"
            onClick={() => { setEditingItem(undefined); setShowModal(true); }}
          >
            <Plus size={16} />
            Item
          </button>
        </div>

        {/* Board */}
        <div className="flex gap-4 overflow-x-auto pb-4 h-full min-h-[calc(100vh-200px)] snap-x">
          {COLUMNS.map(col => (
            <PackColumn 
              key={col.id} 
              id={col.id} 
              title={col.title} 
              items={itemsByStatus[col.id]} 
              onEditItem={handleEdit}
            />
          ))}
        </div>
        
        <DragOverlay>
          {activeBoardItem ? (
            <PackCard item={activeBoardItem} overlay />
          ) : null}
        </DragOverlay>

        <ItemModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
          onSave={fetchItems}
          existingItem={editingItem}
        />
      </div>
    </DndContext>
  );
};
