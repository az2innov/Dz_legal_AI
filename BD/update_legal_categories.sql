-- Mise à jour des catégories dans la table legal_library

-- 1. Journaux officiels
UPDATE legal_library 
SET category = 'Journaux officiels' 
WHERE id IN ('0000169', '0000170', '0000171', '0000172', '0000174', '0000175', '0000176', '0000177');

-- 2. Constitutions
UPDATE legal_library 
SET category = 'Constitutions' 
WHERE id IN (
    '0000018', '0000017', '0000010', '0000006', -- Historiques
    '0000012', '0000137', -- 1979
    '0000011', -- 1980
    '0000136', -- 1988
    '0000009', '0000135', -- 1996
    '0000008', '0000132', -- 2002
    '0000007', '0000131', -- 2008
    '0000130', -- 2016
    '0000004', '0000095', -- 2020
    '0000005', '0000021', '0000129', '0000134' -- Projets
);

-- 3. Lois fondamentales (Correction orthographique de "fondamentaux")
UPDATE legal_library 
SET category = 'Lois fondamentales' 
WHERE id IN ('0000020', '0000096', '0000019');

-- 4. Lois organiques
UPDATE legal_library 
SET category = 'Lois organiques' 
WHERE id IN (
    '0000037', '0000116', '0000125', -- Electoral
    '0000038', '0000121', -- Partis
    '0000065', '0000128', -- Information
    '0000022', '0000097', -- Langue amazighe
    '0000001', '0000071'
);

-- 5. Lois ordinaires
UPDATE legal_library 
SET category = 'Lois ordinaires' 
WHERE id IN (
    '0000034', '0000113', -- Commune
    '0000029', '0000103', -- Wilaya
    '0000035', '0000114', -- Org territoriale
    '0000003', '0000073', -- Investissement
    '0000002', '0000072', -- Textes d'application
    '0000049', '0000076', -- PME
    '0000024', '0000033', '0000117', '0000118', -- Hydrocarbures
    '0000063', '0000093', -- Relations travail
    '0000057', '0000058', '0000089', -- Santé
    '0000064', '0000094', -- Assurances sociales
    '0000067', '0000108', -- Urbanisme
    '0000025', '0000120', -- Aménagement territoire
    '0000062', '0000092', -- Eau
    '0000027', '0000101', -- Risques majeurs
    '0000046', '0000074', -- Education
    '0000061', '0000091', -- Enseignement sup
    '0000066', '0000107', -- Audiovisuel
    '0000031', '0000112', -- Service national
    '0000030', '0000111', -- Conso
    '0000028', '0000102'  -- Réunions
);

-- 6. Ordonnances
UPDATE legal_library 
SET category = 'Ordonnances' 
WHERE id IN (
    '0000041', -- Code civil
    '0000040', '0000122', -- Commerce
    '0000042', '0000124', -- Pénal
    '0000039', '0000099', -- État civil
    '0000047', '0000077', -- Fonction publique
    '0000051', '0000052', '0000080', '0000081', -- Monnaie
    '0000048', '0000075', -- Paix
    '0000045', '0000127'  -- Justice militaire
);

-- 7. Décrets
UPDATE legal_library 
SET category = 'Décrets' 
WHERE id IN (
    '0000053', '0000054', '0000055', '0000070', '0000098', '0000105', -- Marchés
    '0000036', '0000115', -- Circonscriptions
    '0000069', '0000110'  -- Urbanisme
);

-- 8. Lois de finances
-- Plage de 0000145 à 0000168
UPDATE legal_library 
SET category = 'Lois de finances' 
WHERE id BETWEEN '0000145' AND '0000168';

-- Autres lois de finances spécifiques hors plage si nécessaire
UPDATE legal_library 
SET category = 'Lois de finances' 
WHERE id IN ('0000141', '0000143') 
AND category != 'Lois de finances';
