-- SCRIPT DE MISE À JOUR DES CATÉGORIES POUR LA PRODUCTION
-- Ce script regroupe toutes les modifications faites en local.
-- Il utilise 'Decrets' sans accent pour éviter les bugs d'encodage.

-- 1. Journaux officiels
UPDATE legal_library 
SET category = 'Journaux officiels' 
WHERE id IN ('0000169', '0000170', '0000171', '0000172', '0000174', '0000175', '0000176', '0000177');

-- 2. Constitutions
UPDATE legal_library 
SET category = 'Constitutions' 
WHERE id IN (
    '0000018', '0000017', '0000010', '0000006',
    '0000012', '0000137',
    '0000011',
    '0000136',
    '0000009', '0000135',
    '0000008', '0000132',
    '0000007', '0000131',
    '0000130',
    '0000004', '0000095',
    '0000005', '0000021', '0000129', '0000134'
);

-- 3. Lois fondamentales
UPDATE legal_library 
SET category = 'Lois fondamentales' 
WHERE id IN ('0000020', '0000096', '0000019');

-- 4. Lois organiques
UPDATE legal_library 
SET category = 'Lois organiques' 
WHERE id IN (
    '0000037', '0000116', '0000125',
    '0000038', '0000121',
    '0000065', '0000128',
    '0000022', '0000097',
    '0000001', '0000071'
);

-- 5. Lois ordinaires
UPDATE legal_library 
SET category = 'Lois ordinaires' 
WHERE id IN (
    '0000034', '0000113', '0000029', '0000103', '0000035', '0000114',
    '0000003', '0000073', '0000002', '0000072', '0000049', '0000076',
    '0000024', '0000033', '0000117', '0000118', '0000063', '0000093',
    '0000057', '0000058', '0000089', '0000064', '0000094', '0000067', '0000108',
    '0000025', '0000120', '0000062', '0000092', '0000027', '0000101',
    '0000046', '0000074', '0000061', '0000091', '0000066', '0000107',
    '0000031', '0000112', '0000030', '0000111', '0000028', '0000102',
    -- Ajouts complémentaires :
    '0000032', '0000068', '0000050', '0000060', '0000059', '0000026', '0000023',
    '0000044', '0000119', '0000109', '0000126', '0000079', '0000078', '0000106',
    '0000090', '0000104', '0000100', '0000123'
);

-- 6. Ordonnances
UPDATE legal_library 
SET category = 'Ordonnances' 
WHERE id IN (
    '0000041', '0000040', '0000122', '0000042', '0000124', '0000039', '0000099',
    '0000047', '0000077', '0000051', '0000052', '0000080', '0000081', '0000048',
    '0000075', '0000045', '0000127',
    -- Ajouts complémentaires :
    '0000056', '0000043', '0000133', '0000088'
);

-- 7. Decrets (Attention: Pas d'accent sur le E pour compatibilité)
UPDATE legal_library 
SET category = 'Decrets' 
WHERE id IN (
    '0000053', '0000054', '0000055', '0000070', '0000098', '0000105',
    '0000036', '0000115', '0000069', '0000110',
    -- Ajouts complémentaires :
    '0000082', '0000087'
);

-- 8. Lois de finances
UPDATE legal_library 
SET category = 'Lois de finances' 
WHERE (id BETWEEN '0000145' AND '0000168')
   OR id IN ('0000141', '0000143', '0000144', '0000142', '0000140', '0000139', '0000138', '0000173');
