import React, { useState, useEffect } from 'react';
import type { Assignment, SourceType, EquipmentItem, ItemStatus } from '../shared-types';
import { TRIP_ID, createEquipment, updateEquipment } from '../lib/api';
import { X, Save } from 'lucide-react';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  existingItem?: EquipmentItem; // If provided, mode is Edit
}

export const ItemModal: React.FC<ItemModalProps> = ({ isOpen, onClose, onSave, existingItem }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [assignment, setAssignment] = useState<Assignment>('both_individual');
  const [notes, setNotes] = useState('');
  const [sourceType, setSourceType] = useState<SourceType | ''>('');
  const [loading, setLoading] = useState(false);

  // Reset state when modal opens or existingItem changes
  useEffect(() => {
    if (isOpen) {
      setName(existingItem?.name || '');
      setCategory(existingItem?.category || '');
      setAssignment(existingItem?.assignment || 'both_individual');
      setNotes(existingItem?.notes || '');
      setSourceType(existingItem?.source_type || '');
    }
  }, [isOpen, existingItem]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        trip_id: TRIP_ID,
        name,
        category,
        assignment,
        notes,
        source_type: sourceType || null,
        // If creating new, set default status. If updating, don't overwrite status unless logic demands it.
        // For now, keep existing status logic.
        general_status: (existingItem ? undefined : 'backlog') as ItemStatus | undefined,
        jonne_status: (existingItem ? undefined : 'backlog') as ItemStatus | undefined,
        frank_status: (existingItem ? undefined : 'backlog') as ItemStatus | undefined,
      };

      if (existingItem) {
        await updateEquipment(existingItem.id, data);
      } else {
        await createEquipment(data);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-semibold text-lg">{existingItem ? 'Item bearbeiten' : 'Neues Item'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
              <input 
                type="text" 
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                placeholder="z.B. Kleidung"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zuweisung</label>
              <select 
                value={assignment}
                onChange={e => setAssignment(e.target.value as Assignment)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
              >
                <option value="both_individual">Beide (Individuell)</option>
                <option value="shared">Gemeinsam (Geteilt)</option>
                <option value="jonne">Nur Jonne</option>
                <option value="frank">Nur Frank</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quelle (optional)</label>
            <select 
                value={sourceType}
                onChange={e => setSourceType(e.target.value as SourceType)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
              >
                <option value="">- Keine -</option>
                <option value="shop">Kaufen (Shop)</option>
                <option value="own">Vorhanden (Besitz)</option>
                <option value="borrow">Leihen</option>
                <option value="local_store">Vor Ort kaufen</option>
              </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
            <textarea 
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px] transition-shadow"
              placeholder="Größe, Farbe, Details..."
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Abbrechen
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors shadow-sm"
            >
              <Save size={18} />
              Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
