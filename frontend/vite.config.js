import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  build: {
    // Génération de sourcemaps pour debugging (optionnel en prod)
    sourcemap: false,

    // Configuration du nom des fichiers avec hash pour cache busting
    rollupOptions: {
      output: {
        // Hash automatique pour forcer le rechargement après déploiement
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',

        // Optimisation: séparer les vendors pour meilleur cache
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'i18n-vendor': ['react-i18next', 'i18next'],
          'ui-vendor': ['lucide-react'],
        }
      }
    },

    // Taille maximale des chunks (warning si dépassé)
    chunkSizeWarningLimit: 1000,

    // Optimisation du CSS
    cssCodeSplit: true,

    // Minification avec esbuild (plus rapide que terser et déjà inclus)
    minify: 'esbuild',

    // Options esbuild
    esbuild: {
      drop: ['console', 'debugger'], // Supprime console.log et debugger en production
    }
  },

  // Configuration du serveur de dev
  server: {
    port: 5173,
    strictPort: false,
    host: true, // Permet l'accès depuis le réseau local
    open: false // N'ouvre pas automatiquement le navigateur
  }
})
