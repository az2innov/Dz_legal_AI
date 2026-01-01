import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState('loading'); // loading, success, error
  
  // --- CORRECTIF ANTI-DOUBLE APPEL ---
  // On utilise useRef pour garder une trace si l'effet a déjà tourné.
  // Contrairement à useState, changer cette valeur ne relance pas le rendu du composant.
  const hasCalledAPI = useRef(false);

  useEffect(() => {
    // 1. Si on a déjà appelé l'API, on arrête tout de suite.
    if (hasCalledAPI.current) {
        return;
    }

    // 2. Si pas de token dans l'URL, erreur
    if (!token) {
      setStatus('error');
      return;
    }

    // 3. On marque qu'on va faire l'appel (pour bloquer le 2ème passage du Strict Mode)
    hasCalledAPI.current = true;

    const verify = async () => {
      try {
        // Appel au backend
        await authService.verifyEmail(token);
        
        setStatus('success');
        
        // Redirection automatique vers le login après 3 secondes
        setTimeout(() => {
            navigate('/login');
        }, 3000);

      } catch (error) {
        console.error("Erreur lors de la vérification:", error);
        
        // Petite subtilité : Si l'erreur dit "déjà vérifié", on pourrait considérer ça comme un succès,
        // mais pour l'instant on affiche l'erreur pour être strict.
        setStatus('error');
      }
    };

    verify();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg p-4">
      <div className="max-w-md w-full bg-white dark:bg-dark-card rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-800 text-center">
        
        {/* ÉTAT : CHARGEMENT */}
        {status === 'loading' && (
          <div className="flex flex-col items-center animate-pulse">
            <Loader2 className="h-12 w-12 text-primary-600 animate-spin mb-4" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Vérification en cours...</h2>
            <p className="text-sm text-gray-500 mt-2">Veuillez patienter un instant.</p>
          </div>
        )}

        {/* ÉTAT : SUCCÈS */}
        {status === 'success' && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <div className="bg-green-100 p-3 rounded-full mb-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Email confirmé !</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Votre compte est maintenant activé.
              <br />
              Vous allez être redirigé vers la page de connexion.
            </p>
            <button 
                onClick={() => navigate('/login')}
                className="mt-6 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-md"
            >
                Aller à la connexion maintenant
            </button>
          </div>
        )}

        {/* ÉTAT : ERREUR */}
        {status === 'error' && (
          <div className="flex flex-col items-center animate-in shake duration-300">
            <div className="bg-red-100 p-3 rounded-full mb-4">
                <XCircle className="h-12 w-12 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Échec de la vérification</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Le lien de confirmation est invalide ou a expiré.
              <br/>
              Il est possible que votre compte soit déjà activé.
            </p>
            <button 
                onClick={() => navigate('/login')}
                className="mt-6 text-primary-600 hover:text-primary-700 hover:underline font-medium"
            >
                Retourner à la connexion
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default VerifyEmailPage;