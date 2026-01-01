import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const MainLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-200">
      {/* Barre Latérale */}
      <Sidebar />

      {/* Zone Principale */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* En-tête */}
        <Header />

        {/* Contenu de la page (Scrollable) */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;