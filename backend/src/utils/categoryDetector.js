/**
 * Détection automatique de catégorie à partir du titre
 * Pour insertion automatique dans legal_library
 */

function detectCategory(title) {
    const titleLower = title.toLowerCase();

    // Règles de détection par mots-clés
    const rules = [
        // Journaux officiels
        { keywords: ['journal officiel', 'الجريدة الرسمية', 'j.o.', 'jo n°'], category: 'Journal officiel' },

        // Lois
        { keywords: ['loi de finances', 'قانون المالية', 'loi n°', 'قانون رقم'], category: 'Loi' },

        // Pénal
        { keywords: ['pénal', 'جنائي', 'عقوبات', 'code pénal'], category: 'penal' },

        // Procédure pénale
        { keywords: ['procédure pénale', 'إجراءات جزائية'], category: 'procedure_penal' },

        // Civil
        { keywords: ['civil', 'مدني', 'code civil'], category: 'civil' },

        // Procédure civile
        { keywords: ['procédure civil', 'إجراءات مدنية'], category: 'procedure_civil' },

        // Commercial
        { keywords: ['commercial', 'تجاري', 'commerce'], category: 'commerce' },

        // Famille
        { keywords: ['famille', 'شؤون الأسرة', 'أسرة'], category: 'family' },

        // Administratif
        { keywords: ['administratif', 'إداري'], category: 'admin' },

        // Constitution
        { keywords: ['constitution', 'دستور', 'constitutionnel'], category: 'constitution' },

        // Électoral
        { keywords: ['électoral', 'انتخابي', 'élection'], category: 'electoral' },

        // Marchés publics
        { keywords: ['marchés publics', 'صفقات عمومية', 'marché public'], category: 'public_market' },

        // Investissement
        { keywords: ['investissement', 'استثمار'], category: 'investment' },

        // Finance
        { keywords: ['finance', 'مالية', 'financier'], category: 'finance' },

        // Urbanisme
        { keywords: ['urbanisme', 'تعمير'], category: 'urbanisme' },

        // Information
        { keywords: ['information', 'إعلام'], category: 'info' },

        // Militaire
        { keywords: ['militaire', 'قضاء عسكري', 'عسكري'], category: 'military' }
    ];

    // Chercher la première règle qui matche
    for (const rule of rules) {
        for (const keyword of rule.keywords) {
            if (titleLower.includes(keyword.toLowerCase())) {
                return rule.category;
            }
        }
    }

    // Par défaut : "Autre" si aucune catégorie détectée
    return 'Autre';
}

// ===== EXEMPLES D'UTILISATION =====

// Exemple 1 : Détection simple
console.log(detectCategory("Loi de Finances pour 2026"));
// → "Loi"

console.log(detectCategory("Journal officiel n° 1 du 8 Janvier 2026"));
// → "Journal officiel"

console.log(detectCategory("قانون المالية لعام 2026"));
// → "Loi"

console.log(detectCategory("الجريدة الرسمية رقم 1"));
// → "Journal officiel"

// ===== SCRIPT SQL POUR MISE À JOUR AUTOMATIQUE =====

/*
-- Mettre à jour automatiquement les catégories existantes

-- 1. Journaux officiels
UPDATE legal_library 
SET category = 'Journal officiel' 
WHERE (LOWER(title) LIKE '%journal officiel%' 
   OR LOWER(title) LIKE '%الجريدة الرسمية%' 
   OR LOWER(title) LIKE '%j.o.%')
AND (category IS NULL OR category = '');

-- 2. Lois
UPDATE legal_library 
SET category = 'Loi' 
WHERE (LOWER(title) LIKE '%loi de finances%' 
   OR LOWER(title) LIKE '%قانون المالية%' 
   OR LOWER(title) LIKE '%loi n°%'
   OR LOWER(title) LIKE '%قانون رقم%')
AND (category IS NULL OR category = '');

-- 3. Code pénal
UPDATE legal_library 
SET category = 'penal' 
WHERE (LOWER(title) LIKE '%pénal%' 
   OR LOWER(title) LIKE '%جنائي%' 
   OR LOWER(title) LIKE '%عقوبات%')
AND (category IS NULL OR category = '');

-- 4. Code civil
UPDATE legal_library 
SET category = 'civil' 
WHERE (LOWER(title) LIKE '%civil%' 
   OR LOWER(title) LIKE '%مدني%')
AND (category IS NULL OR category = '');

-- 5. Commercial
UPDATE legal_library 
SET category = 'commerce' 
WHERE (LOWER(title) LIKE '%commercial%' 
   OR LOWER(title) LIKE '%تجاري%' 
   OR LOWER(title) LIKE '%commerce%')
AND (category IS NULL OR category = '');

-- 6. Constitution
UPDATE legal_library 
SET category = 'constitution' 
WHERE (LOWER(title) LIKE '%constitution%' 
   OR LOWER(title) LIKE '%دستور%' 
   OR LOWER(title) LIKE '%constitutionnel%')
AND (category IS NULL OR category = '');

-- ... Ajouter d'autres selon besoins
*/

// ===== EXPORT POUR UTILISATION =====
module.exports = { detectCategory };
