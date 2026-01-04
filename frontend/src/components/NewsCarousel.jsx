import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Calendar, Tag } from 'lucide-react';

const newsData = [
    {
        id: 1,
        title: "Mémoire Nationale : Nouvelle Loi",
        date: "2026",
        desc: "Loi criminalisant la colonisation française : une étape historique reflétant l'attachement de l'État à la mémoire nationale.",
        category: "Législation",
        // Image de remplacement Pexels (Plus fiable pour le hotlinking) - Justice / Palais
        image: "https://images.pexels.com/photos/5668473/pexels-photo-5668473.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        link: "https://www.aps.dz/fr/algerie/actualite-nationale/mjlog36b-loi-criminalisant-la-colonisation-francaise-en-algerie-une-etape-historique-refletant-l-attachement-de-l-etat-a-la-memoire-nationale"
    },
    {
        id: 2,
        title: "Loi de Finances 2026",
        date: "Jan 2026",
        desc: "Publiée au JO : Importation de véhicules, nouvelles taxes et leviers de croissance économique.",
        category: "Économie",
        image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1000&auto=format&fit=crop",
        link: "https://www.algerie360.com/la-loi-de-finances-2026-publiee-au-jo-importation-de-vehicules-taxes-croissance-les-points-cles/"
    },
    {
        id: 3,
        title: "Numérisation de la Justice",
        date: "Déc 2025",
        desc: "Lancement de la plateforme numérique pour le retrait du casier judiciaire et des documents officiels à distance.",
        category: "Numérique",
        image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=1000&auto=format&fit=crop",
        link: "#"
    }
];

const NewsCarousel = () => {
    const [current, setCurrent] = useState(0);
    const [progress, setProgress] = useState(0);
    const progressRef = useRef(null);
    const DURATION = 6000; // 6 secondes par slide

    // Auto-play avec barre de progression
    useEffect(() => {
        const startTime = Date.now();
        const timer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const pct = Math.min((elapsed / DURATION) * 100, 100);
            setProgress(pct);

            if (elapsed >= DURATION) {
                handleNext();
            }
        }, 50); // Mise à jour fluide

        return () => clearInterval(timer);
    }, [current]);

    const handleNext = () => {
        setCurrent((prev) => (prev === newsData.length - 1 ? 0 : prev + 1));
        setProgress(0);
    };

    const handlePrev = () => {
        setCurrent((prev) => (prev === 0 ? newsData.length - 1 : prev - 1));
        setProgress(0);
    };

    return (
        // HAUTEUR RÉDUITE ICI : h-[400px] au lieu de h-[500px]
        <div className="relative w-full max-w-6xl mx-auto h-[400px] rounded-3xl overflow-hidden shadow-2xl group border border-white/10 bg-[#0f172a]">

            {/* 1. SLIDES (Images de fond) */}
            {newsData.map((item, index) => (
                <div
                    key={item.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                    {/* Image avec effet Ken Burns (Zoom lent) */}
                    <div className={`w-full h-full transform transition-transform duration-[8000ms] ease-out ${index === current ? 'scale-110' : 'scale-100'}`}>
                        <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Gradient Overlay Cinématographique */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/50 to-transparent opacity-90"></div>
                </div>
            ))}

            {/* 2. CONTENU (Carte Flottante) */}
            <div className="absolute bottom-12 left-8 md:left-12 z-20 max-w-xl">
                <div
                    key={current} // Clé unique pour relancer l'animation à chaque changement
                    className="animate-in slide-in-from-bottom-5 fade-in duration-700"
                >
                    {/* Badges */}
                    <div className="flex items-center gap-3 mb-4">
                        <span className="flex items-center gap-1 px-3 py-1 text-[10px] font-bold tracking-wider uppercase text-white bg-blue-600 rounded-full shadow-lg shadow-blue-900/50">
                            <Tag size={10} /> {newsData[current].category}
                        </span>
                        <span className="flex items-center gap-1 text-gray-300 text-xs font-medium bg-black/30 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                            <Calendar size={10} /> {newsData[current].date}
                        </span>
                    </div>

                    {/* Titre & Description */}
                    <h3 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight drop-shadow-lg tracking-tight">
                        {newsData[current].title}
                    </h3>

                    <p className="text-gray-300 text-base md:text-lg mb-8 leading-relaxed line-clamp-2 border-l-4 border-blue-500 pl-4">
                        {newsData[current].desc}
                    </p>

                    {/* Bouton d'action */}
                    <a
                        href={newsData[current].link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-white text-gray-900 hover:bg-gray-100 px-6 py-3 rounded-full font-bold text-sm transition-all transform hover:scale-105 shadow-xl group/btn"
                    >
                        Lire l'article
                        <ExternalLink size={16} className="text-gray-600 group-hover/btn:text-blue-600 transition-colors" />
                    </a>
                </div>
            </div>

            {/* 3. NAVIGATION (Flèches) */}
            <div className="absolute bottom-12 right-12 z-20 flex items-center gap-4">
                <button
                    onClick={handlePrev}
                    className="p-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white backdrop-blur-md transition-all hover:scale-110 active:scale-95 group/arrow"
                >
                    <ChevronLeft size={24} className="group-hover/arrow:-translate-x-1 transition-transform" />
                </button>
                <button
                    onClick={handleNext}
                    className="p-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white backdrop-blur-md transition-all hover:scale-110 active:scale-95 group/arrow"
                >
                    <ChevronRight size={24} className="group-hover/arrow:translate-x-1 transition-transform" />
                </button>
            </div>

            {/* 4. BARRE DE PROGRESSION */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 z-30">
                <div
                    className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            {/* Pagination Dots (Optionnel, en haut à droite) */}
            <div className="absolute top-8 right-8 z-20 flex gap-2">
                {newsData.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => { setCurrent(idx); setProgress(0); }}
                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === current ? 'w-8 bg-blue-500' : 'w-2 bg-white/30 hover:bg-white/60'}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default NewsCarousel;