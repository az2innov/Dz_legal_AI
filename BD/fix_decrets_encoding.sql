-- Correction de l'encodage pour la catégorie Décrets
-- On force l'utilisation de "Decrets" sans accent pour éviter les problèmes d'affichage

UPDATE legal_library 
SET category = 'Decrets' 
WHERE id IN (
    -- Liste initiale des Décrets
    '0000053', '0000054', '0000055', '0000070', '0000098', '0000105', -- Marchés publics
    '0000036', '0000115', -- Circonscriptions
    '0000069', '0000110', -- Urbanisme

    -- Liste complémentaire
    '0000082', '0000087'
);
