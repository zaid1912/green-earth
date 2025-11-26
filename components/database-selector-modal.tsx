'use client';

import { useState, useEffect } from 'react';
import { Database } from 'lucide-react';

type DatabaseType = 'oracle' | 'mongodb';

export default function DatabaseSelectorModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDb, setSelectedDb] = useState<DatabaseType | null>(null);

  useEffect(() => {
    // Check if database is already selected in this session
    const dbSelection = sessionStorage.getItem('db_type');
    if (!dbSelection) {
      setIsOpen(true);
    } else {
      setSelectedDb(dbSelection as DatabaseType);
    }
  }, []);

  const handleSelect = (dbType: DatabaseType) => {
    // Store in sessionStorage (persists for the session only)
    sessionStorage.setItem('db_type', dbType);

    // Also set a cookie for API routes to access
    document.cookie = `db_type=${dbType}; path=/; max-age=86400`; // 24 hours

    setSelectedDb(dbType);
    setIsOpen(false);

    // Reload to apply the selection
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Database className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Choose Database</h2>
            <p className="text-sm text-gray-600">Select which database to use for this session</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Oracle Option */}
          <button
            onClick={() => handleSelect('oracle')}
            className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                <svg className="w-6 h-6 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Oracle Cloud Database</h3>
                <p className="text-sm text-gray-600">Relational database with SQL</p>
              </div>
            </div>
          </button>

          {/* MongoDB Option */}
          <button
            onClick={() => handleSelect('mongodb')}
            className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l-1 9h2l-1-9zm-1 10v10h2V12h-2z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">MongoDB</h3>
                <p className="text-sm text-gray-600">NoSQL document database</p>
              </div>
            </div>
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          This selection will be active for your current session
        </p>
      </div>
    </div>
  );
}
