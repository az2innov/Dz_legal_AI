import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../utils/apiConfig';

const NewsCarousel = () => {
    const [slides, setSlides] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const { i18n } = useTranslation();

    useEffect(() => {
        const fetchSlides = async () => {
            try {
                const currentLang = i18n.language || 'fr';
                const response = await axios.get(`${API_ENDPOINTS.admin}/public/news-slides?lang=${currentLang}`);

                if (Array.isArray(response.data)) {
                    setSlides(response.data);
                } else {
                    console.error("Format de réponse invalide pour le carrousel:", response.data);
                    setSlides([]);
                }
            } catch (error) {
                console.error("Erreur chargement news:", error);
                setSlides([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSlides();
    }, [i18n.language]);

    // Auto-play
    useEffect(() => {
        if (slides.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(interval);
    }, [slides.length]);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    };

    if (isLoading || slides.length === 0) return null;

    return (
        <div className="relative w-full max-w-6xl mx-auto mb-16 overflow-hidden rounded-2xl shadow-2xl group">
            {/* Main Container with Aspect Ratio */}
            <div className="relative h-[400px] w-full">

                {/* Slides */}
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                            }`}
                    >
                        {/* Background Image with Gradient Overlay */}
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${slide.image_url})` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-transparent"></div>
                        </div>

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4 drop-shadow-lg animate-in slide-in-from-bottom-4 fade-in duration-700">
                                {slide.title}
                            </h2>
                            {slide.description && (
                                <p className="text-lg md:text-xl text-gray-200 mb-6 max-w-3xl drop-shadow-md line-clamp-2 animate-in slide-in-from-bottom-5 fade-in duration-1000">
                                    {slide.description}
                                </p>
                            )}

                            {slide.link_url && (
                                <a
                                    href={slide.link_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-full font-semibold transition-all shadow-lg hover:shadow-primary-600/30 transform hover:-translate-y-1 animate-in slide-in-from-bottom-6 fade-in duration-1000"
                                >
                                    {i18n.language === 'ar' ? 'اقرأ المزيد' : 'En savoir plus'}
                                    <ExternalLink size={18} />
                                </a>
                            )}
                        </div>
                    </div>
                ))}

                {/* Navigation Buttons */}
                {slides.length > 1 && (
                    <>
                        <button
                            onClick={prevSlide}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white transition-opacity opacity-0 group-hover:opacity-100"
                        >
                            <ChevronLeft size={32} />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white transition-opacity opacity-0 group-hover:opacity-100"
                        >
                            <ChevronRight size={32} />
                        </button>
                    </>
                )}

                {/* Indicators */}
                <div className="absolute bottom-4 right-8 z-20 flex gap-2">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-3 h-3 rounded-full transition-all ${index === currentIndex ? 'bg-primary-500 w-8' : 'bg-white/50 hover:bg-white'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NewsCarousel;