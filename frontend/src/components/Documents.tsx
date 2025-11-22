import React, { useEffect, useState } from 'react';
import type { DocumentItem } from '../shared-types';
import { getDocuments, deleteDocument, TRIP_ID } from '../lib/api';
import { Loader2, Trash2, FileText, Download, Eye, X, Plus } from 'lucide-react';
import { DocumentModal } from './DocumentModal';

export const Documents: React.FC = () => {
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const data = await getDocuments(TRIP_ID);
      setDocs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Dokument löschen?')) return;
    try {
      await deleteDocument(id);
      setDocs(docs.filter(d => d.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const getFileUrl = (doc: DocumentItem) => `/uploads/${doc.stored_name}`;
  const isImage = (name: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
  const isPdf = (name: string) => /\.pdf$/i.test(name);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Dokumente</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-blue-700 shadow-sm"
        >
          <Plus size={16} />
          Dokument
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1">
          <ul className="divide-y divide-gray-200">
            {docs.map(doc => (
              <li key={doc.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                <div className="flex items-start gap-3 overflow-hidden">
                  <div className="bg-blue-100 p-2 rounded-lg text-blue-600 flex-shrink-0">
                    <FileText size={24} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{doc.original_name}</h4>
                    <div className="flex gap-2 text-xs text-gray-500 mt-1 flex-wrap">
                      {doc.category && <span className="bg-gray-100 px-2 py-0.5 rounded">{doc.category}</span>}
                      {doc.tags && <span className="text-gray-400 truncate max-w-[150px]">Tags: {doc.tags}</span>}
                      <span className="whitespace-nowrap">• {new Date(doc.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 pl-2">
                  {(isImage(doc.original_name) || isPdf(doc.original_name)) && (
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      title="Vorschau"
                    >
                      <Eye size={18} />
                    </button>
                  )}
                  <a 
                    href={getFileUrl(doc)} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    title="Download"
                  >
                    <Download size={18} />
                  </a>
                  <button 
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                    title="Löschen"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </li>
            ))}
            {docs.length === 0 && <li className="p-10 text-center text-gray-500">Keine Dokumente vorhanden.</li>}
          </ul>
        </div>
      )}

      <DocumentModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        onUploadComplete={fetchDocs} 
      />

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setPreviewDoc(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold truncate pr-4">{previewDoc.original_name}</h3>
              <button onClick={() => setPreviewDoc(null)} className="text-gray-500 hover:text-gray-700 bg-gray-200 p-1.5 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 bg-gray-100 overflow-auto flex items-center justify-center p-4">
              {isImage(previewDoc.original_name) ? (
                <img src={getFileUrl(previewDoc)} alt={previewDoc.original_name} className="max-w-full max-h-full object-contain shadow-lg rounded" />
              ) : isPdf(previewDoc.original_name) ? (
                <iframe src={getFileUrl(previewDoc)} className="w-full h-full rounded bg-white shadow-lg" title={previewDoc.original_name} />
              ) : (
                <div className="text-center">
                  <p className="text-gray-500 mb-4">Vorschau nicht verfügbar</p>
                  <a href={getFileUrl(previewDoc)} download className="text-blue-600 hover:underline">Herunterladen</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
