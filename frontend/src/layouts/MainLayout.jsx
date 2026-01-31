import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const MainLayout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-200">
      {/* Barre Latérale (Mobile Drawer & Desktop Sidebar) */}
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Zone Principale */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* En-tête */}
        <Header toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

        {/* Contenu de la page (Scrollable) */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;