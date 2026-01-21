-- ===================================================
-- AUTO-CATÉGORISATION des textes juridiques existants
-- ===================================================
-- Ce script détecte automatiquement la catégorie à partir du titre
-- et met à jour la colonne 'category' dans legal_library

SET NAMES 'utf8mb4';

-- 1. Journaux officiels (FR + AR)
UPDATE legal_library 
SET category = 'Journal officiel' 
WHERE (
    LOWER(title) LIKE '%journal officiel%' 
    OR title LIKE '%الجريدة الرسمية%' 
    OR LOWER(title) LIKE '%j.o.%'
    OR LOWER(title) LIKE '%jo n°%'
);

-- 2. Lois (FR + AR)
UPDATE legal_library 
SET category = 'Loi' 
WHERE (
    LOWER(title) LIKE '%loi de finances%' 
    OR title LIKE '%قانون المالية%' 
    OR LOWER(title) LIKE '%loi n°%'
    OR title LIKE '%قانون رقم%'
    OR LOWER(title) LIKE '%loi du%'
);

-- 3. Code pénal (FR + AR)
UPDATE legal_library 
SET category = 'penal' 
WHERE (
    LOWER(title) LIKE '%pénal%' 
    OR LOWER(title) LIKE '%penal%'
    OR title LIKE '%جنائي%' 
    OR title LIKE '%عقوبات%'
    OR LOWER(title) LIKE '%code pénal%'
);

-- 4. Procédure pénale (FR + AR)
UPDATE legal_library 
SET category = 'procedure_penal' 
WHERE (
    LOWER(title) LIKE '%procédure pénale%' 
    OR LOWER(title) LIKE '%procédure penale%'
    OR title LIKE '%إجراءات جزائية%'
);

-- 5. Code civil (FR + AR)
UPDATE legal_library 
SET category = 'civil' 
WHERE (
    LOWER(title) LIKE '%civil%' 
    OR title LIKE '%مدني%'
    OR LOWER(title) LIKE '%code civil%'
)
AND category NOT LIKE 'procedure_civil';

-- 6. Procédure civile (FR + AR)
UPDATE legal_library 
SET category = 'procedure_civil' 
WHERE (
    LOWER(title) LIKE '%procédure civil%' 
    OR title LIKE '%إجراءات مدنية%'
);

-- 7. Commercial (FR + AR)
UPDATE legal_library 
SET category = 'commerce' 
WHERE (
    LOWER(title) LIKE '%commercial%' 
    OR title LIKE '%تجاري%' 
    OR LOWER(title) LIKE '%commerce%'
    OR LOWER(title) LIKE '%code de commerce%'
);

-- 8. Famille (FR + AR)
UPDATE legal_library 
SET category = 'family' 
WHERE (
    LOWER(title) LIKE '%famille%' 
    OR title LIKE '%شؤون الأسرة%' 
    OR title LIKE '%أسرة%'
);

-- 9. Administratif (FR + AR)
UPDATE legal_library 
SET category = 'admin' 
WHERE (
    LOWER(title) LIKE '%administratif%' 
    OR title LIKE '%إداري%'
);

-- 10. Constitution (FR + AR)
UPDATE legal_library 
SET category = 'constitution' 
WHERE (
    LOWER(title) LIKE '%constitution%' 
    OR title LIKE '%دستور%' 
    OR LOWER(title) LIKE '%constitutionnel%'
);

-- 11. Électoral (FR + AR)
UPDATE legal_library 
SET category = 'electoral' 
WHERE (
    LOWER(title) LIKE '%électoral%' 
    OR LOWER(title) LIKE '%electoral%'
    OR title LIKE '%انتخابي%' 
    OR LOWER(title) LIKE '%élection%'
);

-- 12. Marchés publics (FR + AR)
UPDATE legal_library 
SET category = 'public_market' 
WHERE (
    LOWER(title) LIKE '%marchés publics%' 
    OR LOWER(title) LIKE '%marches publics%'
    OR LOWER(title) LIKE '%marché public%'
    OR title LIKE '%صفقات عمومية%'
);

-- 13. Investissement (FR + AR)
UPDATE legal_library 
SET category = 'investment' 
WHERE (
    LOWER(title) LIKE '%investissement%' 
    OR title LIKE '%استثمار%'
);

-- 14. Finance (FR + AR)
UPDATE legal_library 
SET category = 'finance' 
WHERE (
    LOWER(title) LIKE '%finance%' 
    OR LOWER(title) LIKE '%financ%'
    OR title LIKE '%مالية%'
)
AND category NOT LIKE 'Loi'; -- Éviter d'écraser "Loi de Finances"

-- 15. Urbanisme (FR + AR)
UPDATE legal_library 
SET category = 'urbanisme' 
WHERE (
    LOWER(title) LIKE '%urbanisme%' 
    OR title LIKE '%تعمير%'
);

-- 16. Information (FR + AR)
UPDATE legal_library 
SET category = 'info' 
WHERE (
    LOWER(title) LIKE '%information%' 
    OR title LIKE '%إعلام%'
);

-- 17. Militaire (FR + AR)
UPDATE legal_library 
SET category = 'military' 
WHERE (
    LOWER(title) LIKE '%militaire%' 
    OR title LIKE '%قضاء عسكري%' 
    OR title LIKE '%عسكري%'
);

-- ===================================================
-- VÉRIFICATION
-- ===================================================

-- Voir la répartition par catégorie
SELECT category, COUNT(*) as count, 
       GROUP_CONCAT(DISTINCT lang) as langues
FROM legal_library 
GROUP BY category 
ORDER BY count DESC;

-- Voir les textes sans catégorie
SELECT id, title, lang 
FROM legal_library 
WHERE category IS NULL OR category = '' OR category = 'Autre';
