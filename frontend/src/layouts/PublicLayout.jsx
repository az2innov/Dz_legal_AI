import React from 'react';
import PublicNavbar from '../components/PublicNavbar';
import Footer from '../components/Footer';

const PublicLayout = ({ children }) => {
  return (
    // On force un fond sombre pour tout le site public pour garder la cohérence avec la Landing Page
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col font-sans">
      
      {/* Navbar Fixe en haut */}
      <PublicNavbar />

      {/* Contenu de la page (Le children remplacera cette partie) */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Footer Fixe en bas */}
      <Footer />
      
    </div>
  );
};

export default PublicLayout;