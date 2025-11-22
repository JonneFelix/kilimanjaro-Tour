import React from 'react';
import { useUser } from '../context/UserContext';

export const IdentityModal: React.FC = () => {
  const { user, setUser } = useUser();

  if (user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full text-center">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Wer bist du?</h2>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => setUser('jonne')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Jonne
          </button>
          <button
            onClick={() => setUser('frank')}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Frank
          </button>
        </div>
      </div>
    </div>
  );
};

