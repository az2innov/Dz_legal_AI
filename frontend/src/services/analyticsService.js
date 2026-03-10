import ReactGA from "react-ga4";

const MEASUREMENT_ID = "G-2GMTND0PM3";

/**
 * Initialise Google Analytics 4
 */
export const initGA = () => {
    ReactGA.initialize(MEASUREMENT_ID);
    console.log("GA4 Initialized");
};

/**
 * Envoie une page view manuelle (Utile pour le tracking de changement de route)
 * @param {string} path - Le chemin de la page
 */
export const logPageView = (path) => {
    ReactGA.send({ hitType: "pageview", page: path });
};

/**
 * Log un événement personnalisé
 * @param {string} category 
 * @param {string} action 
 * @param {string} label 
 */
export const logEvent = (category, action, label) => {
    ReactGA.event({
        category,
        action,
        label,
    });
};

/**
 * Événement spécifique pour le tunnel de conversion
 */
export const analytics = {
    // Inscription
    trackSignUp: (method = 'email') => {
        ReactGA.event('sign_up', { method });
    },

    // Connexion
    trackLogin: (method = 'email') => {
        ReactGA.event('login', { method });
    },

    // Interaction Assistant
    trackAssistantQuery: (subject = 'general', userType = 'anonymous') => {
        ReactGA.event('assistant_interact', {
            subject,
            user_type: userType
        });
    },

    // Vue de document
    trackDocView: (docName) => {
        ReactGA.event('view_document', { document_name: docName });
    },

    // Upload de document
    trackDocUpload: (fileType = 'pdf', userType = 'anonymous') => {
        ReactGA.event('upload_document', {
            file_type: fileType,
            user_type: userType
        });
    }
};

export default {
    initGA,
    logPageView,
    logEvent,
    analytics
};
