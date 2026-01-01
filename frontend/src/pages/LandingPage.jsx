import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
// import Footer from '../components/Footer'; <--- LIGNE SUPPRIMÉE

const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="relative flex-1 flex flex-col items-center justify-center text-center px-4 overflow-hidden py-20">
        
        {/* Fond Grid */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
             style={{ 
                 backgroundImage: 'linear-gradient(#4f4f4f 1px, transparent 1px), linear-gradient(90deg, #4f4f4f 1px, transparent 1px)', 
                 backgroundSize: '40px 40px' 
             }}
        ></div>
        
        {/* Lumière bleue */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="z-10 max-w-4xl space-y-8 animate-in fade-in zoom-in duration-700 flex flex-col items-center">
            
            <img 
                src="/logo_w.png" 
                alt="Logo Dz Legal AI" 
                className="w-48 h-48 md:w-64 md:h-64 object-contain mb-4 drop-shadow-2xl"
            />

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 pb-2 leading-tight">
                {t('landing.hero_title')}
            </h1>
            
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                {t('landing.hero_subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                <button 
                    onClick={() => navigate('/register')}
                    className="group relative inline-flex items-center justify-center px-8 py-3.5 font-semibold text-white transition-all duration-200 bg-blue-600 font-pj rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/50"
                >
                    {t('landing.cta_start')}
                    <ArrowRight className={`ml-2 w-5 h-5 transition-transform group-hover:translate-x-1 ${i18n.language === 'ar' ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                </button>
            </div>
        </div>

      {/* <Footer />  <--- LIGNE SUPPRIMÉE CAR GÉRÉE PAR LE LAYOUT */}
    </div>
  );
};

export default LandingPage;