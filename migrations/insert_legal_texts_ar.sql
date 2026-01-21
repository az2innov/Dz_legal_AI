-- Encodage UTF-8 pour textes arabes
SET NAMES 'utf8mb4';
SET CHARACTER_SET_CLIENT = utf8mb4;
SET CHARACTER_SET_CONNECTION = utf8mb4;
SET CHARACTER_SET_RESULTS = utf8mb4;

-- Supprimer anciennes lignes incorrectes
DELETE FROM legal_library WHERE id IN ('0000173', '0000174', '0000175', '0000176', '0000177');

-- Insérer avec encodage correct
INSERT INTO legal_library (id, title, category, lang, file_name, gcs_uri, mime_type, is_active) VALUES
('0000173', 'قانون المالية لعام 2026', 'قانون', 'ar', '0000173.pdf', 'gs://legaldz/0000173.pdf', 'application/pdf', 1),
('0000174', 'الجريدة الرسمية رقم 1 الصادرة في 8 جـانفي 2026', 'الجريدة الرسمية', 'ar', '0000174.pdf', 'gs://legaldz/0000174.pdf', 'application/pdf', 1),
('0000175', 'الجريدة الرسمية رقم 2 الصادرة في 11 جـانفي 2026', 'الجريدة الرسمية', 'ar', '0000175.pdf', 'gs://legaldz/0000175.pdf', 'application/pdf', 1),
('0000176', 'الجريدة الرسمية رقم 87 الصادرة في 30 ديسمبر 2025', 'الجريدة الرسمية', 'ar', '0000176.pdf', 'gs://legaldz/0000176.pdf', 'application/pdf', 1),
('0000177', 'الجريدة الرسمية رقم 88 الصادرة في 31 ديسمبر 2025', 'الجريدة الرسمية', 'ar', '0000177.pdf', 'gs://legaldz/0000177.pdf', 'application/pdf', 1);

-- Vérification
SELECT id, title, category, lang FROM legal_library WHERE lang = 'ar' ORDER BY id DESC LIMIT 10;
