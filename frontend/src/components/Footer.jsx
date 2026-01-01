import React from 'react';
import { useTranslation } from 'react-i18next';
import { Linkedin, Facebook, Instagram, MessageCircle, Globe, Mail } from 'lucide-react';

const TikTokIcon = ({ size = 20, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
);

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  // Liste des réseaux sociaux avec leurs couleurs officielles
  const socialLinks = [
    { icon: Linkedin, href: "https://www.linkedin.com/company/dz-legalai/", color: "bg-[#0077b5] text-white hover:bg-[#006396]" },
    { icon: Facebook, href: "https://web.facebook.com/profile.php?id=61585640669184", color: "bg-[#1877F2] text-white hover:bg-[#1464cc]" },
    { icon: Instagram, href: "https://www.instagram.com/dz_legalai/", color: "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white hover:opacity-90" },
    { icon: TikTokIcon, href: "https://www.tiktok.com/@dz_legalai", color: "bg-black text-white hover:bg-gray-800" },
    { icon: MessageCircle, href: "https://wa.me/2135060383640", color: "bg-[#25D366] text-white hover:bg-[#20bd5a]" },
  ];

  return (
    <footer className="bg-[#0b1120] border-t border-gray-800 py-10 mt-auto text-white">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
        
        {/* Copyright & Creator */}
        <div className="text-center md:text-start space-y-2">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <img src="/logo_w.png" alt="Logo" className="h-8 w-auto" />
              <span className="text-lg font-bold">Dz Legal AI</span>
          </div>
          <p className="text-sm text-gray-400">
            © {currentYear}. {t('footer.rights')}
          </p>
          <p className="text-sm text-gray-500">
            {t('footer.copyright')} <a href="https://innov-num.pro" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">Innov-Num.pro</a>
          </p>
        </div>

        {/* Liens de contact mis en valeur */}
        <div className="flex flex-col items-center md:items-end gap-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400">{t('footer.follow_us')}</h4>
            <div className="flex items-center gap-3">
            {socialLinks.map((link, index) => (
                <a 
                key={index} 
                href={link.href} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`p-2.5 rounded-full transition-all transform hover:-translate-y-1 shadow-lg ${link.color}`}
                >
                <link.icon size={20} />
                </a>
            ))}
            </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;