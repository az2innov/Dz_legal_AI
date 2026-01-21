-- ========================================
-- Script SQL d'importation des documents juridiques
-- 159 documents - Base de données de production
-- ========================================

-- ⚠️ IMPORTANT : Forcer l'encodage UTF-8MB4
-- ========================================
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET character_set_connection=utf8mb4;
SET collation_connection=utf8mb4_unicode_ci;

-- Étape 1 : Modifier la structure de la table
-- ========================================

-- Ajouter la colonne gcs_uri
ALTER TABLE `legal_library` 
ADD COLUMN `gcs_uri` VARCHAR(512) NULL 
AFTER `file_content`;

-- Permettre file_content NULL
ALTER TABLE `legal_library` 
MODIFY COLUMN `file_content` LONGBLOB NULL;

-- Étape 2 : Nettoyer les données existantes
-- ========================================

DELETE FROM `legal_library`;

-- Étape 3 : Insérer les 159 documents
-- ========================================

-- Documents français

INSERT INTO `legal_library` (`id`, `title`, `category`, `lang`, `file_name`, `gcs_uri`) VALUES
('0000001', 'l\'Organisation et le Fonctionnement de l\'Agence Algérienne de Promotion de l\'investissement', 'investment', 'fr', '0000001.pdf', 'gs://legaldz/0000001.pdf'),
('0000002', 'Textes d\'application de la loi relative à l\'investissement 22-18', 'investment', 'fr', '0000002.pdf', 'gs://legaldz/0000002.pdf'),
('0000003', 'La loi 22-18 relative à l\'Investissement', 'investment', 'fr', '0000003.pdf', 'gs://legaldz/0000003.pdf'),
('0000004', 'Décret de promulgation de la révision constitutionnelle 2020', 'constitution', 'fr', '0000004.pdf', 'gs://legaldz/0000004.pdf'),
('0000005', 'Projet de Révision de la Constitution-mai 2020', 'constitution', 'fr', '0000005.pdf', 'gs://legaldz/0000005.pdf'),
('0000006', 'Nouvelle Constitution 2016', 'constitution', 'fr', '0000006.pdf', 'gs://legaldz/0000006.pdf'),
('0000007', 'Révision constitutionnelle de 2008', 'constitution', 'fr', '0000007.pdf', 'gs://legaldz/0000007.pdf'),
('0000008', 'Révision constitutionnelle de 2002', 'constitution', 'fr', '0000008.pdf', 'gs://legaldz/0000008.pdf'),
('0000009', 'Révision constitutionnelle de 1996', 'constitution', 'fr', '0000009.pdf', 'gs://legaldz/0000009.pdf'),
('0000010', 'Constitution de 1989', 'constitution', 'fr', '0000010.pdf', 'gs://legaldz/0000010.pdf'),
('0000011', 'Révision constitutionnelle de 1980', 'constitution', 'fr', '0000011.pdf', 'gs://legaldz/0000011.pdf'),
('0000012', 'Révision constitutionnelle de 1979', 'constitution', 'fr', '0000012.pdf', 'gs://legaldz/0000012.pdf'),
('0000017', 'Constitution de 1976', 'constitution', 'fr', '0000017.pdf', 'gs://legaldz/0000017.pdf'),
('0000018', 'Constitution de 1963', 'constitution', 'fr', '0000018.pdf', 'gs://legaldz/0000018.pdf'),
('0000019', 'Plateforme de la Soummam 20 Août 1956', 'admin', 'fr', '0000019.pdf', 'gs://legaldz/0000019.pdf'),
('0000020', 'Déclaration du 1 Novembre 1954', 'admin', 'fr', '0000020.pdf', 'gs://legaldz/0000020.pdf'),
('0000021', 'Projet de révision de la constitution', 'constitution', 'fr', '0000021.pdf', 'gs://legaldz/0000021.pdf'),
('0000022', 'Loi organique n°18-17 relative à l\'académie algérienne de la Langue Amazighe', 'admin', 'fr', '0000022.pdf', 'gs://legaldz/0000022.pdf'),
('0000023', 'Loi n° 14-08 modifiant et complétant l\'ordonnance n° 70-20 relative à l\'état civil', 'admin', 'fr', '0000023.pdf', 'gs://legaldz/0000023.pdf'),
('0000024', 'Loi n° 05-07 relative aux hydrocarbures', 'admin', 'fr', '0000024.pdf', 'gs://legaldz/0000024.pdf'),
('0000025', 'Loi n° 01-20 relative au développement et à l\'aménagement durable du territoire', 'admin', 'fr', '0000025.pdf', 'gs://legaldz/0000025.pdf'),
('0000026', 'Loi n° 08-09 portant code de procédure civile et administrative', 'procedure_civil', 'fr', '0000026.pdf', 'gs://legaldz/0000026.pdf'),
('0000027', 'Loi n° 04-20 relative à la prévention des risques majeurs et à la gestion des catastrophes dans le cadre du développement durable', 'admin', 'fr', '0000027.pdf', 'gs://legaldz/0000027.pdf'),
('0000028', 'Loi n° 89-28 relative aux réunions et manifestations publiques', 'admin', 'fr', '0000028.pdf', 'gs://legaldz/0000028.pdf'),
('0000029', 'Loi n° 12-07 relative à la wilaya', 'admin', 'fr', '0000029.pdf', 'gs://legaldz/0000029.pdf'),
('0000030', 'Loi n° 09-03 la protection du consommateur et à la répression des fraudes', 'admin', 'fr', '0000030.pdf', 'gs://legaldz/0000030.pdf'),
('0000031', 'Loi n° 14-06 relative au service national', 'military', 'fr', '0000031.pdf', 'gs://legaldz/0000031.pdf'),
('0000032', 'Loi n° 03-01 relative au développement durable du tourisme', 'admin', 'fr', '0000032.pdf', 'gs://legaldz/0000032.pdf'),
('0000033', 'Loi n° 13-01 modifiant et complétant la loi n° 05-07 relative aux hydrocarbures', 'admin', 'fr', '0000033.pdf', 'gs://legaldz/0000033.pdf'),
('0000034', 'Loi n° 11-10 relative à la commune', 'admin', 'fr', '0000034.pdf', 'gs://legaldz/0000034.pdf'),
('0000035', 'Loi n° 84-09 relative à l\'organisation territoriale du pays', 'admin', 'fr', '0000035.pdf', 'gs://legaldz/0000035.pdf'),
('0000036', 'Décret présidentiel n° 15-140 portant création de circonscriptions administratives dans certaines wilyas', 'admin', 'fr', '0000036.pdf', 'gs://legaldz/0000036.pdf'),
('0000037', 'Loi organique N 12-01 relative au régime électoral', 'electoral', 'fr', '0000037.pdf', 'gs://legaldz/0000037.pdf'),
('0000038', 'Loi organique N°12-04 relative aux partis politiques', 'electoral', 'fr', '0000038.pdf', 'gs://legaldz/0000038.pdf'),
('0000039', 'Ordonnance n° 70-20 portant code de l\'état civil', 'admin', 'fr', '0000039.pdf', 'gs://legaldz/0000039.pdf'),
('0000040', 'Ordonnance n° 75-59 portant code de commerce modifiée et complétée', 'commerce', 'fr', '0000040.pdf', 'gs://legaldz/0000040.pdf'),
('0000041', 'Ordonnance n° 75-58 portant code civil modifiée et complétée', 'civil', 'fr', '0000041.pdf', 'gs://legaldz/0000041.pdf'),
('0000042', 'Ordonnance n° 66-155 portant code de procédure pénale modifiée et complétée', 'procedure_penal', 'fr', '0000042.pdf', 'gs://legaldz/0000042.pdf'),
('0000043', 'Ordonnance n° 01-03 relative au développement de l\'investissement', 'investment', 'fr', '0000043.pdf', 'gs://legaldz/0000043.pdf'),
('0000044', 'Loi n° 84-11 portant code de la famille modifiée et complétée', 'family', 'fr', '0000044.pdf', 'gs://legaldz/0000044.pdf'),
('0000045', 'Ordonnance n° 71-28 portant code de justice militaire modifié et complété', 'military', 'fr', '0000045.pdf', 'gs://legaldz/0000045.pdf'),
('0000046', 'Loi n° 08-04 portant loi d\'orientation sur l\'éducation nationale', 'admin', 'fr', '0000046.pdf', 'gs://legaldz/0000046.pdf'),
('0000047', 'Ordonnance n°06-03 portant statut général de la fonction publique', 'admin', 'fr', '0000047.pdf', 'gs://legaldz/0000047.pdf'),
('0000048', 'Ordonnance n° 06-01 portant mise en oeuvre de la charte pour la paix et la réconciliation nationale', 'admin', 'fr', '0000048.pdf', 'gs://legaldz/0000048.pdf'),
('0000049', 'Loi n° 01-18 portant loi d\'orientation sur la promotion de la petite et moyenne entreprise (PME)', 'admin', 'fr', '0000049.pdf', 'gs://legaldz/0000049.pdf'),
('0000050', 'Loi n° 88-01 portant loi d\'orientation sur les entreprises économiques publiques', 'admin', 'fr', '0000050.pdf', 'gs://legaldz/0000050.pdf'),
('0000051', 'Ordonnance n° 10-04 modifiant la l\'ordonnance n° 03-11 relative à la monnaie et au crédit', 'finance', 'fr', '0000051.pdf', 'gs://legaldz/0000051.pdf'),
('0000052', 'Ordonnance n° 03-11 relative à la monnaie et au crédit', 'finance', 'fr', '0000052.pdf', 'gs://legaldz/0000052.pdf'),
('0000053', 'Décret présidentiel N° 10-236 portant réglementation des marchés publics', 'public_market', 'fr', '0000053.pdf', 'gs://legaldz/0000053.pdf'),
('0000054', 'Décret présidentiel n° 12-23 modifiant et complétant le décret présidentiel n° 10-236 portant réglementation des marchés publics', 'public_market', 'fr', '0000054.pdf', 'gs://legaldz/0000054.pdf'),
('0000055', 'Décret présidentiel n° 13-03 modifiant et complétant le décret présidentiel n° 10-236 portant réglementation des marchés publics', 'public_market', 'fr', '0000055.pdf', 'gs://legaldz/0000055.pdf'),
('0000056', 'Ordonnance n° 12-02 modifiant et complétant la loi n° 05-01 relative à la prévention et à la lutte contre le blanchiment d\'argent et le financement du terrorisme', 'penal', 'fr', '0000056.pdf', 'gs://legaldz/0000056.pdf'),
('0000057', 'Loi N° 85-05 relative à la protection et à la promotion de la santé', 'admin', 'fr', '0000057.pdf', 'gs://legaldz/0000057.pdf'),
('0000058', 'Loi N° 90-17 modifiant et complétant la loi N°85-05 relative à la protection et à la promotion de la santé', 'admin', 'fr', '0000058.pdf', 'gs://legaldz/0000058.pdf'),
('0000059', 'Loi N° 90-21 relative à la comptabilité publique', 'finance', 'fr', '0000059.pdf', 'gs://legaldz/0000059.pdf'),
('0000060', 'Loi N° 90-11 fixant les règles relatives à l\'expropriation pour utilité publique', 'admin', 'fr', '0000060.pdf', 'gs://legaldz/0000060.pdf'),
('0000061', 'Loi N° 99-05 portant orientation de l\'enseignement supérieur', 'admin', 'fr', '0000061.pdf', 'gs://legaldz/0000061.pdf'),
('0000062', 'Loi N° 05-12 relative à l\'eau', 'admin', 'fr', '0000062.pdf', 'gs://legaldz/0000062.pdf'),
('0000063', 'Loi N° 90-11 relative aux relations de travail', 'admin', 'fr', '0000063.pdf', 'gs://legaldz/0000063.pdf'),
('0000064', 'Loi n° 83-11 relative aux assurances sociales', 'admin', 'fr', '0000064.pdf', 'gs://legaldz/0000064.pdf'),
('0000065', 'Loi organique n° 12-05 relative à l\'information', 'info', 'fr', '0000065.pdf', 'gs://legaldz/0000065.pdf'),
('0000066', 'Loi n° 14-04 relative à l\'activité audiovisuelle', 'info', 'fr', '0000066.pdf', 'gs://legaldz/0000066.pdf'),
('0000067', 'Loi n° 90-29 relative à l\'aménagement et l\'urbanisme', 'urbanisme', 'fr', '0000067.pdf', 'gs://legaldz/0000067.pdf'),
('0000068', 'Loi n° 08-15 du fixant les règles de mise en conformité des constructions et leur achèvement', 'urbanisme', 'fr', '0000068.pdf', 'gs://legaldz/0000068.pdf'),
('0000069', 'Décret exécutif n° 15-19 fixant les modalités d\'instruction et de délivrance des actes d\'urbanisme', 'urbanisme', 'fr', '0000069.pdf', 'gs://legaldz/0000069.pdf'),
('0000070', 'Décret présidentiel n° 15-247 portant réglementation des marchés publics et des délégations de service public', 'public_market', 'fr', '0000070.pdf', 'gs://legaldz/0000070.pdf'),
('0000138', 'Loi de Finances pour 2024', 'finance', 'fr', '0000138.pdf', 'gs://legaldz/0000138.pdf'),
('0000139', 'Loi de finance rectificative pour 2023', 'finance', 'fr', '0000139.pdf', 'gs://legaldz/0000139.pdf'),
('0000140', 'Loi de finance 2023', 'finance', 'fr', '0000140.pdf', 'gs://legaldz/0000140.pdf'),
('0000141', 'Ordonnance 22-01 portant loi de finances complémentaire 2022', 'finance', 'fr', '0000141.pdf', 'gs://legaldz/0000141.pdf'),
('0000142', 'Loi de finance 2022', 'finance', 'fr', '0000142.pdf', 'gs://legaldz/0000142.pdf'),
('0000143', 'Loi de finance complémentaire 2021', 'finance', 'fr', '0000143.pdf', 'gs://legaldz/0000143.pdf'),
('0000144', 'Loi de finance 2021', 'finance', 'fr', '0000144.pdf', 'gs://legaldz/0000144.pdf'),
('0000145', 'Loi de finances 2020', 'finance', 'fr', '0000145.pdf', 'gs://legaldz/0000145.pdf'),
('0000146', 'Loi de finances 2019', 'finance', 'fr', '0000146.pdf', 'gs://legaldz/0000146.pdf'),
('0000147', 'Loi de finances 2018', 'finance', 'fr', '0000147.pdf', 'gs://legaldz/0000147.pdf'),
('0000148', 'Loi de finances 2017', 'finance', 'fr', '0000148.pdf', 'gs://legaldz/0000148.pdf'),
('0000149', 'Loi de finances 2016', 'finance', 'fr', '0000149.pdf', 'gs://legaldz/0000149.pdf'),
('0000150', 'Loi de finances complémentaire pour 2015', 'finance', 'fr', '0000150.pdf', 'gs://legaldz/0000150.pdf'),
('0000151', 'Loi de finances pour 2015', 'finance', 'fr', '0000151.pdf', 'gs://legaldz/0000151.pdf');

-- Documents arabes

INSERT INTO `legal_library` (`id`, `title`, `category`, `lang`, `file_name`, `gcs_uri`) VALUES
('0000071', 'تنظيم الوكالة الجزائرية لترقية الاستثمار وسيرها', 'investment', 'ar', '0000071.pdf', 'gs://legaldz/0000071.pdf'),
('0000072', 'النصوص التطبيقية لقانون الاسثتمار 22-18', 'investment', 'ar', '0000072.pdf', 'gs://legaldz/0000072.pdf'),
('0000073', 'قانون رقم 22-18 يتعلق بالاستثمار', 'investment', 'ar', '0000073.pdf', 'gs://legaldz/0000073.pdf'),
('0000074', 'قانون رقم 08-04 يتضمن القانون التوجيهي للتربية الوطنية', 'admin', 'ar', '0000074.pdf', 'gs://legaldz/0000074.pdf'),
('0000075', 'أمر رقم 06-01 يتضمن تنفيذ ميثاق السلم و المصالحة الوطنية', 'admin', 'ar', '0000075.pdf', 'gs://legaldz/0000075.pdf'),
('0000076', 'قانون رقم 01-18 يتضمن القانون التوجيهي لترقية المؤسسات الصغيرة و المتوسطة', 'admin', 'ar', '0000076.pdf', 'gs://legaldz/0000076.pdf'),
('0000077', 'أمر رقم 06-03 يتضمن القانون الأساسي للوظيفة العمومية', 'admin', 'ar', '0000077.pdf', 'gs://legaldz/0000077.pdf'),
('0000078', 'قانون رقم 88-01 يتضمن القانون التوجيهي للمؤسسات الاقتصادية العمومية', 'admin', 'ar', '0000078.pdf', 'gs://legaldz/0000078.pdf'),
('0000079', 'قانون رقم 84-17 يتعلق بقوانين المالية', 'finance', 'ar', '0000079.pdf', 'gs://legaldz/0000079.pdf'),
('0000080', 'أمر رقم 03-11 يتعلق بالنقد و القرض', 'finance', 'ar', '0000080.pdf', 'gs://legaldz/0000080.pdf'),
('0000081', 'أمر رقم 10-04 يعدل و يتمم الأمر رقم 03-11 و المتعلق بالنقد و القرض', 'finance', 'ar', '0000081.pdf', 'gs://legaldz/0000081.pdf'),
('0000082', 'مرسوم رئاسي رقم 12-23 يعدل و يتمم للمرسوم الرئاسي رقم 10-236 والمتعلق بتنظيم الصفقات العمومية', 'public_market', 'ar', '0000082.pdf', 'gs://legaldz/0000082.pdf'),
('0000087', 'مرسوم رئاسي رقم 13-03 يعدل ويتمم المرسوم الرئاسي رقم 10-236 و المتضن تنظيم الصفقات العمومية', 'public_market', 'ar', '0000087.pdf', 'gs://legaldz/0000087.pdf'),
('0000088', 'أمر رقم 12-02 يعدل و يتمم للقانون رقم 05-01 و المتعلق بالوقاية و مكافحة تبييض الأموال و تمويل الإرهاب', 'penal', 'ar', '0000088.pdf', 'gs://legaldz/0000088.pdf'),
('0000089', 'قانون رقم 90-17 يعدل و يتمم للقانون رقم 85-05 و المتعلق بحماية و ترقية الصحة', 'admin', 'ar', '0000089.pdf', 'gs://legaldz/0000089.pdf'),
('0000090', 'قانون رقم 90-21 يتعلق بالمحاسبة العمومية', 'finance', 'ar', '0000090.pdf', 'gs://legaldz/0000090.pdf'),
('0000091', 'قانون رقم 99-05 يتضمن القانون التوجيهي للتعليم العالي', 'admin', 'ar', '0000091.pdf', 'gs://legaldz/0000091.pdf'),
('0000092', 'قانون رقم 05-12 يتعلق بالمياه', 'admin', 'ar', '0000092.pdf', 'gs://legaldz/0000092.pdf'),
('0000093', 'قانون رقم 90-11 يتعلق بعلاقات العمل', 'admin', 'ar', '0000093.pdf', 'gs://legaldz/0000093.pdf'),
('0000094', 'قانون رقم 83-11 يتعلق بالتأمينات الاجتماعية', 'admin', 'ar', '0000094.pdf', 'gs://legaldz/0000094.pdf'),
('0000095', 'مرسوم إصدار التعديل الدستوري-2020', 'constitution', 'ar', '0000095.pdf', 'gs://legaldz/0000095.pdf'),
('0000096', 'بيان أول نوفمبر 1954', 'constitution', 'ar', '0000096.pdf', 'gs://legaldz/0000096.pdf'),
('0000097', 'القانون العضوي رقم 18-17  المتعلق بالمجمع الجزائري للغة الأمازيغية', 'admin', 'ar', '0000097.pdf', 'gs://legaldz/0000097.pdf'),
('0000098', 'مرسوم رئاسي رقم 15-247 يتضمن تنظيم الصفقات العمومية و تفويضات المرفق العام', 'public_market', 'ar', '0000098.pdf', 'gs://legaldz/0000098.pdf'),
('0000099', 'أمر رقم 70-20 يتعلق بقانون الحالة المدنية', 'admin', 'ar', '0000099.pdf', 'gs://legaldz/0000099.pdf'),
('0000100', 'قانون رقم 14-08 يعدل و يتمم الأمر رقم 70-20 و المتعلق الحالة المدنية', 'admin', 'ar', '0000100.pdf', 'gs://legaldz/0000100.pdf'),
('0000101', 'قانون رقم 04-20 يتعلق بالوقاية من الأخطار الكبرى و تسيير الكوارث في إطار التنمية المستدامة', 'admin', 'ar', '0000101.pdf', 'gs://legaldz/0000101.pdf'),
('0000102', 'قانون رقم 89-28 يتعلق بالاجتماعات و المظاهرات العمومية', 'admin', 'ar', '0000102.pdf', 'gs://legaldz/0000102.pdf'),
('0000103', 'قانون رقم 12-07 يتعلق بالولاية', 'admin', 'ar', '0000103.pdf', 'gs://legaldz/0000103.pdf'),
('0000104', 'قانون رقم 90-25 يتضمن التوجيه العقاري', 'admin', 'ar', '0000104.pdf', 'gs://legaldz/0000104.pdf'),
('0000105', 'مرسوم رئاسي رقم 10-236 يتضمن تنظيم الصفقات العمومية', 'public_market', 'ar', '0000105.pdf', 'gs://legaldz/0000105.pdf'),
('0000106', 'قانون رقم 90-11 يحدد القواعد المتعلقة بنزع الملكية من أجل المنفعة العمومية', 'admin', 'ar', '0000106.pdf', 'gs://legaldz/0000106.pdf'),
('0000107', 'قانون رقم 14-04 يتعلق بالنشاط السمعي البصري', 'info', 'ar', '0000107.pdf', 'gs://legaldz/0000107.pdf'),
('0000108', 'قانون رقم 90-29 يتعلق بالتهيئة و التعمير', 'urbanisme', 'ar', '0000108.pdf', 'gs://legaldz/0000108.pdf'),
('0000109', 'قانون رقم 08-15 يحدد قواعد مطابقة البنايات و إتمام انجازها', 'urbanisme', 'ar', '0000109.pdf', 'gs://legaldz/0000109.pdf'),
('0000110', 'مرسوم تنفيذي رقم 15-19 يحدد كيفيات تحضير عقود التعمير و تسليمها', 'urbanisme', 'ar', '0000110.pdf', 'gs://legaldz/0000110.pdf'),
('0000111', 'قانون 09-03 يتعلق بحماية المستهلك و قمع الغش', 'admin', 'ar', '0000111.pdf', 'gs://legaldz/0000111.pdf'),
('0000112', 'قانون رقم 14-06 يتعلق بالخدمة الوطنية', 'military', 'ar', '0000112.pdf', 'gs://legaldz/0000112.pdf'),
('0000113', 'قانون رقم 11-10 يتعلق بالبلدية', 'admin', 'ar', '0000113.pdf', 'gs://legaldz/0000113.pdf'),
('0000114', 'قانون رقم 84-09 يتعلق بالتنظيم الإقليمي للبلاد', 'admin', 'ar', '0000114.pdf', 'gs://legaldz/0000114.pdf'),
('0000115', 'مرسوم رئاسي رقم 15-140 يتضمن إحداث مقاطعات إدارية داخل بعض الولايات و تحديد القواعد الخاصة المرتبطة بها', 'admin', 'ar', '0000115.pdf', 'gs://legaldz/0000115.pdf'),
('0000116', 'قانون عضوي رقم 12-01 يتعلق بنظام الانتخابات', 'electoral', 'ar', '0000116.pdf', 'gs://legaldz/0000116.pdf'),
('0000117', 'قانون رقم 13-01 يعدل و يتمم القانون رقم 05-07 و المتعلق بالمحروقات', 'admin', 'ar', '0000117.pdf', 'gs://legaldz/0000117.pdf'),
('0000118', 'قانون رقم 05-07 يتعلق بالمحروقات', 'admin', 'ar', '0000118.pdf', 'gs://legaldz/0000118.pdf'),
('0000119', 'قانون رقم 03-01 يتعلق بالتنمية المستدامة للسياحة', 'admin', 'ar', '0000119.pdf', 'gs://legaldz/0000119.pdf'),
('0000120', 'قانون رقم 01-20 يتعلق بتهيئة الإقليم وتنميته المستدامة', 'admin', 'ar', '0000120.pdf', 'gs://legaldz/0000120.pdf'),
('0000121', 'قانون عضوي رقم 12-04 يتعلق بالاحزاب السياسية', 'electoral', 'ar', '0000121.pdf', 'gs://legaldz/0000121.pdf'),
('0000122', 'أمر رقم 75-59 يتضمن القانون التجاري معدل و متمم', 'commerce', 'ar', '0000122.pdf', 'gs://legaldz/0000122.pdf'),
('0000123', 'قانون رقم 08-09 يتضمن قانون الاجراءات المدنية و الإدارية', 'procedure_civil', 'ar', '0000123.pdf', 'gs://legaldz/0000123.pdf'),
('0000124', 'أمر رقم 66-156 يتضمن قانون الاجراءات الجزائية معدل و متمم', 'procedure_penal', 'ar', '0000124.pdf', 'gs://legaldz/0000124.pdf'),
('0000125', 'أمر رقم 97-07 معدل و متمم يتضمن القانون العضوي المتعلق بالنظام الانتخابي', 'electoral', 'ar', '0000125.pdf', 'gs://legaldz/0000125.pdf'),
('0000126', 'قانون رقم 84-11 يتضمن قانون الاسرة معدل و متمم', 'family', 'ar', '0000126.pdf', 'gs://legaldz/0000126.pdf'),
('0000127', 'أمر رقم 71-28 يتضمن قانون القضاء العسكري معدل و متمم', 'military', 'ar', '0000127.pdf', 'gs://legaldz/0000127.pdf'),
('0000128', 'قانون عضوي رقم 12-05 يتعلق بالاعلام', 'info', 'ar', '0000128.pdf', 'gs://legaldz/0000128.pdf'),
('0000129', 'مشروع تمهيدي لتعديل الدستور - ماي 2020', 'constitution', 'ar', '0000129.pdf', 'gs://legaldz/0000129.pdf'),
('0000130', 'التعديل الدستوري لسنة 2016', 'constitution', 'ar', '0000130.pdf', 'gs://legaldz/0000130.pdf'),
('0000131', 'التعديل الدستوري لسنة 2008', 'constitution', 'ar', '0000131.pdf', 'gs://legaldz/0000131.pdf'),
('0000132', 'التعديل الدستوري لسنة 2002', 'constitution', 'ar', '0000132.pdf', 'gs://legaldz/0000132.pdf'),
('0000133', 'أمر رقم 01-03 يتعلق بتطوير الاستثمار', 'investment', 'ar', '0000133.pdf', 'gs://legaldz/0000133.pdf'),
('0000134', 'مشروع تعديل الدستور', 'constitution', 'ar', '0000134.pdf', 'gs://legaldz/0000134.pdf'),
('0000135', 'التعديل الدستوري لسنة 1996', 'constitution', 'ar', '0000135.pdf', 'gs://legaldz/0000135.pdf'),
('0000136', 'التعديل الدستوري لسنة 1988', 'constitution', 'ar', '0000136.pdf', 'gs://legaldz/0000136.pdf'),
('0000137', 'التعديل الدستوري لسنة 1979', 'constitution', 'ar', '0000137.pdf', 'gs://legaldz/0000137.pdf'),
('0000152', 'قانون المالية 2024', 'finance', 'ar', '0000152.pdf', 'gs://legaldz/0000152.pdf'),
('0000153', 'قانون المالية التصحيحي لسنة 2023', 'finance', 'ar', '0000153.pdf', 'gs://legaldz/0000153.pdf'),
('0000154', 'قانون المالية لسنة 2023', 'finance', 'ar', '0000154.pdf', 'gs://legaldz/0000154.pdf'),
('0000155', 'أمر 22-01 يتضمن قانون المالية التكميلي لسنة 2022', 'finance', 'ar', '0000155.pdf', 'gs://legaldz/0000155.pdf'),
('0000156', 'قانون المالية 2022', 'finance', 'ar', '0000156.pdf', 'gs://legaldz/0000156.pdf'),
('0000157', 'قانون المالية التكميلي لسنة 2021', 'finance', 'ar', '0000157.pdf', 'gs://legaldz/0000157.pdf'),
('0000158', 'قانون المالية لسنة 2021', 'finance', 'ar', '0000158.pdf', 'gs://legaldz/0000158.pdf'),
('0000159', 'قانون المالية لسنة 2020', 'finance', 'ar', '0000159.pdf', 'gs://legaldz/0000159.pdf'),
('0000160', 'قانون المالية التكميلي لسنة 2020', 'finance', 'ar', '0000160.pdf', 'gs://legaldz/0000160.pdf'),
('0000161', 'قانون المالية لسنة 2019', 'finance', 'ar', '0000161.pdf', 'gs://legaldz/0000161.pdf'),
('0000162', 'قانون المالية التكميلي لسنة 2018', 'finance', 'ar', '0000162.pdf', 'gs://legaldz/0000162.pdf'),
('0000163', 'قانون المالية لسنة 2018', 'finance', 'ar', '0000163.pdf', 'gs://legaldz/0000163.pdf'),
('0000164', 'قانون المالية لسنة 2017', 'finance', 'ar', '0000164.pdf', 'gs://legaldz/0000164.pdf'),
('0000165', 'قانون المالية لسنة 2016', 'finance', 'ar', '0000165.pdf', 'gs://legaldz/0000165.pdf'),
('0000166', 'قانون المالية التكميلي لسنة 2015', 'finance', 'ar', '0000166.pdf', 'gs://legaldz/0000166.pdf'),
('0000167', 'قانون المالية لسنة 2015', 'finance', 'ar', '0000167.pdf', 'gs://legaldz/0000167.pdf');

-- Étape 4 : Vérification
-- ========================================

-- Afficher le nombre total de documents (doit être 159)
SELECT COUNT(*) as total_documents FROM `legal_library`;

-- Afficher par langue
SELECT lang, COUNT(*) as count FROM `legal_library` GROUP BY lang;

-- Afficher les 5 principales catégories
SELECT category, COUNT(*) as count FROM `legal_library` GROUP BY category ORDER BY count DESC LIMIT 5;

-- ========================================
-- FIN DU SCRIPT
-- ========================================
