import React from 'react';
import { useLocation } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import Footer from '../components/Footer';

const PublicLayout = ({ children }) => {
  const location = useLocation();
  const isChat = location.pathname === '/chat';

  return (
    // On force un fond sombre pour tout le site public
    // Pour le Chat (Guest), on veut un "App Layout" (h-screen, sans scroll global) pour que le footer reste visible.
    // Pour les autres pages (Landing), on veut un "Web Layout" (min-h-screen, scroll global).
    <div className={`${isChat ? 'h-[100dvh] overflow-hidden' : 'min-h-screen'} bg-[#0f172a] text-white flex flex-col font-sans`}>

      {/* Navbar Fixe en haut */}
      <PublicNavbar />

      {/* Contenu de la page (Le children remplacera cette partie) */}
      <main className="flex-1 flex flex-col min-h-0 min-w-0">
        {children}
      </main>

      {/* Footer Fixe en bas (Masqué sur le chat pour éviter le 'double footer' avec la barre de saisie) */}
      {!isChat && <Footer />}

    </div>
  );
};

export default PublicLayout;