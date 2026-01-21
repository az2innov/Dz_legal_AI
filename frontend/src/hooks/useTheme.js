import { useEffect, useState } from 'react';

export function useTheme() {
  // On lit la préférence dans le localStorage ou on prend 'light' par défaut
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const root = window.document.documentElement;
    // On retire la classe dark si le thème est light
    root.classList.remove('dark');
    // On ajoute la classe dark seulement si le thème est dark
    if (theme === 'dark') {
      root.classList.add('dark');
    }
    // On sauvegarde
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return { theme, toggleTheme };
}