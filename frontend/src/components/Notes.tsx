import React, { useEffect, useState } from 'react';
import type { Note } from '../shared-types';
import { getNotes, deleteNote, TRIP_ID } from '../lib/api';
import { Loader2, Trash2, Plus, Edit2 } from 'lucide-react';
import { NoteModal } from './NoteModal';

export const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>(undefined);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const data = await getNotes(TRIP_ID);
      setNotes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleAdd = () => {
    setEditingNote(undefined);
    setShowModal(true);
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Notiz wirklich löschen?')) return;
    try {
      await deleteNote(id);
      setNotes(notes.filter(n => n.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Notizen</h2>
        <button 
          onClick={handleAdd}
          className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-blue-700 shadow-sm"
        >
          <Plus size={16} />
          Notiz
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pb-20">
        {notes.map(note => (
          <div key={note.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all relative group flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg truncate pr-2">{note.title}</h3>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleEdit(note)} 
                  className="text-gray-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50"
                  title="Bearbeiten"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(note.id)} 
                  className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
                  title="Löschen"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            {note.category && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full mb-3 self-start">{note.category}</span>}
            <p className="text-gray-600 whitespace-pre-wrap text-sm flex-1 line-clamp-6">{note.content}</p>
            <div className="mt-4 text-xs text-gray-400 text-right pt-2 border-t border-gray-50">
              {new Date(note.updated_at).toLocaleDateString()}
            </div>
          </div>
        ))}
        {notes.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center text-gray-400 py-10">
            <p>Noch keine Notizen.</p>
          </div>
        )}
      </div>

      <NoteModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        onSave={fetchNotes} 
        existingNote={editingNote}
      />
    </div>
  );
};
