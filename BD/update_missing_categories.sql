-- Mise à jour complémentaire des catégories manquantes

-- Lois de finances
UPDATE legal_library 
SET category = 'Lois de finances' 
WHERE id IN ('0000144', '0000142', '0000140', '0000139', '0000138', '0000173');

-- Ordonnances
UPDATE legal_library 
SET category = 'Ordonnances' 
WHERE id IN ('0000056', '0000043', '0000133', '0000088');

-- Lois ordinaires
UPDATE legal_library 
SET category = 'Lois ordinaires' 
WHERE id IN ('0000032', '0000068', '0000050', '0000060', '0000059', '0000026', '0000023', '0000044', '0000119', '0000109', '0000126', '0000079', '0000078', '0000106', '0000090', '0000104', '0000100', '0000123');

-- Décrets
UPDATE legal_library 
SET category = 'Décrets' 
WHERE id IN ('0000082', '0000087');
