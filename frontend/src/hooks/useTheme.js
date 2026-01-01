import { useEffect, useState } from 'react';

export function useTheme() {
  // On lit la préférence dans le localStorage ou on prend 'light' par défaut
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const root = window.document.documentElement;
    // On enlève l'ancienne classe et on met la nouvelle
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    // On sauvegarde
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return { theme, toggleTheme };
}