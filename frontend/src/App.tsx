import React, { useState } from 'react';
import { UserProvider, useUser } from './context/UserContext';
import { IdentityModal } from './components/IdentityModal';
import { PackBoard } from './components/PackBoard';
import { Notes } from './components/Notes';
import { MapView } from './components/Map';
import { Documents } from './components/Documents';
import { Package, NotebookPen, Map as MapIcon, FileText, User, RefreshCw } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { user, setUser } = useUser();
  const [activeTab, setActiveTab] = useState<'pack' | 'notes' | 'map' | 'documents'>('pack');

  const tabs = [
    { id: 'pack', label: 'Packen', icon: Package },
    { id: 'notes', label: 'Notizen', icon: NotebookPen },
    { id: 'map', label: 'Karte', icon: MapIcon },
    { id: 'documents', label: 'Dokumente', icon: FileText },
  ] as const;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header (Desktop) */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏔️</span>
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">Kilimandscharo Tour - Papa & Jonne</h1>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </nav>

          {/* User Identity */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                <User size={16} className="text-gray-500" />
                <span className="text-sm font-medium capitalize">{user}</span>
                <button 
                  onClick={() => setUser(null)}
                  className="ml-1 p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600"
                  title="Nutzer wechseln"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full mb-16 md:mb-0">
        {activeTab === 'pack' && <PackBoard />}
        {activeTab === 'notes' && <Notes />}
        {activeTab === 'map' && <MapView />}
        {activeTab === 'documents' && <Documents />}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-40">
        <div className="flex justify-around">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center py-3 px-2 flex-1 ${
                activeTab === tab.id ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <tab.icon size={20} />
              <span className="text-[10px] mt-1">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <IdentityModal />
    </div>
  );
};

function App() {
  return (
    <UserProvider>
      <MainLayout />
    </UserProvider>
  );
}

export default App;
