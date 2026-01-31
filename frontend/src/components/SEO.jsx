import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, ogTitle, ogDescription, ogImage, canonicalUrl }) => {
    const siteTitle = "Dz Legal AI";
    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    const defaultDescription = "Plateforme d'intelligence artificielle dédiée au droit algérien. Analyse de documents, recherches juridiques et codes officiels.";

    return (
        <Helmet>
            {/* Standard tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description || defaultDescription} />
            {keywords && <meta name="keywords" content={keywords} />}

            {/* Open Graph / Facebook */}
            <meta property="og:title" content={ogTitle || fullTitle} />
            <meta property="og:description" content={ogDescription || description || defaultDescription} />
            {ogImage && <meta property="og:image" content={ogImage} />}
            {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

            {/* Twitter */}
            <meta name="twitter:title" content={ogTitle || fullTitle} />
            <meta name="twitter:description" content={ogDescription || description || defaultDescription} />
            {ogImage && <meta name="twitter:image" content={ogImage} />}
        </Helmet>
    );
};

export default SEO;
