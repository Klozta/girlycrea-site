-- Script SQL pour insérer des produits de test
-- Usage: docker exec -i girlycrea-postgres-staging psql -U girlycrea_user -d girlycrea < scripts/seed-products.sql

-- Insérer 20 produits de test
INSERT INTO products (title, description, price, category, stock, images, tags, is_deleted) VALUES
('Coque iPhone Rose Gold - GirlyCrea', 'Coque rose gold premium, finition brillante, protection antichoc. Compatible iPhone 12/13/14/15.', 19.9, 'Coques', 25, ARRAY['https://picsum.photos/seed/girlycoque1/900/900'], ARRAY['rose-gold', 'iphone', 'tendance', 'protection'], false),
('Coque iPhone Transparente avec Strass', 'Coque transparente élégante avec strass, protection renforcée, design unique.', 24.9, 'Coques', 18, ARRAY['https://picsum.photos/seed/girlycoque2/900/900'], ARRAY['transparent', 'strass', 'iphone', 'elegant'], false),
('Coque iPhone Floral Print', 'Coque avec motif floral délicat, protection complète, design féminin.', 22.5, 'Coques', 30, ARRAY['https://picsum.photos/seed/girlycoque3/900/900'], ARRAY['floral', 'print', 'feminin', 'iphone'], false),
('Bracelet Perlé Personnalisé', 'Bracelet fait main, perles + initiale. Idéal cadeau. Personnalisation disponible.', 14.9, 'Bijoux', 40, ARRAY['https://picsum.photos/seed/girlybracelet/900/900'], ARRAY['fait-main', 'cadeau', 'personnalise', 'perles'], false),
('Boucles d''oreilles Coeur - Rose', 'Boucles légères, coeur rose, finition douce. Hypoallergénique.', 12.5, 'Bijoux', 30, ARRAY['https://picsum.photos/seed/girlyearrings/900/900'], ARRAY['coeur', 'rose', 'leger', 'hypoallergenique'], false),
('Collier Perle de Culture', 'Collier perle de culture, longueur ajustable, fermoir doré. Élégant et intemporel.', 45.0, 'Bijoux', 15, ARRAY['https://picsum.photos/seed/girlynecklace/900/900'], ARRAY['perle', 'culture', 'elegant', 'ajustable'], false),
('Bague Argent 925 avec Pierre', 'Bague en argent 925, pierre naturelle, taille ajustable. Design unique.', 35.0, 'Bijoux', 20, ARRAY['https://picsum.photos/seed/girlyring/900/900'], ARRAY['argent', '925', 'pierre', 'naturelle'], false),
('Pochette Crochet Bohème', 'Pochette crochet style bohème, doublée, fermeture zip. Fait main avec amour.', 24.0, 'Crochet', 8, ARRAY['https://picsum.photos/seed/girlycrochet1/900/900'], ARRAY['crochet', 'boheme', 'artisanat', 'fait-main'], false),
('Tote bag Crochet "Noël"', 'Tote bag crochet, édition Noël, stock limité. Parfait pour les fêtes.', 29.0, 'Crochet', 5, ARRAY['https://picsum.photos/seed/girlytote/900/900'], ARRAY['noel', 'stock-limite', 'crochet', 'fetes'], false),
('Bonnet Crochet Hiver', 'Bonnet crochet doux et chaud, plusieurs coloris disponibles. Fait main.', 18.5, 'Crochet', 12, ARRAY['https://picsum.photos/seed/girlyhat/900/900'], ARRAY['bonnet', 'hiver', 'chaud', 'crochet'], false),
('Écharpe Crochet Longue', 'Écharpe crochet extra longue, motifs géométriques, laine douce.', 32.0, 'Crochet', 10, ARRAY['https://picsum.photos/seed/girlyscarf/900/900'], ARRAY['echarpe', 'longue', 'geometrique', 'laine'], false),
('Trousse de Maquillage Rose', 'Trousse de maquillage rose, compartiments multiples, design pratique.', 15.9, 'Beauté', 35, ARRAY['https://picsum.photos/seed/girlymakeup/900/900'], ARRAY['trousse', 'maquillage', 'rose', 'pratique'], false),
('Pinceau Maquillage Premium', 'Set de 5 pinceaux maquillage premium, poils synthétiques doux.', 22.0, 'Beauté', 25, ARRAY['https://picsum.photos/seed/girlybrush/900/900'], ARRAY['pinceau', 'maquillage', 'premium', 'set'], false),
('Miroir de Poche LED', 'Miroir de poche avec éclairage LED, rechargeable, design compact.', 19.9, 'Beauté', 28, ARRAY['https://picsum.photos/seed/girlymirror/900/900'], ARRAY['miroir', 'led', 'rechargeable', 'compact'], false),
('Sac à Main Cuir Rose', 'Sac à main en cuir véritable, couleur rose poudré, intérieur spacieux.', 89.0, 'Mode', 8, ARRAY['https://picsum.photos/seed/girlybag/900/900'], ARRAY['sac', 'cuir', 'rose', 'luxe'], false),
('Foulard Soie Imprimé', 'Foulard en soie, imprimé floral, dimensions 90x90cm. Accessoire élégant.', 45.0, 'Mode', 15, ARRAY['https://picsum.photos/seed/girlyscarf2/900/900'], ARRAY['foulard', 'soie', 'imprime', 'floral'], false),
('Ceinture Cuir avec Boucle Dorée', 'Ceinture en cuir véritable, boucle dorée, taille ajustable. Style classique.', 35.0, 'Mode', 20, ARRAY['https://picsum.photos/seed/girlybelt/900/900'], ARRAY['ceinture', 'cuir', 'dorée', 'ajustable'], false),
('Porte-clés Personnalisé', 'Porte-clés personnalisé avec initiale, plusieurs coloris disponibles.', 8.9, 'Accessoires', 50, ARRAY['https://picsum.photos/seed/girlykeychain/900/900'], ARRAY['porte-cles', 'personnalise', 'initiale', 'cadeau'], false),
('Étui à Lunettes Rose', 'Étui à lunettes en cuir synthétique, couleur rose, protection renforcée.', 12.5, 'Accessoires', 30, ARRAY['https://picsum.photos/seed/girlyglasses/900/900'], ARRAY['etui', 'lunettes', 'rose', 'protection'], false),
('Chouchou Cheveux Satin', 'Chouchou cheveux en satin, plusieurs coloris, doux pour les cheveux.', 6.9, 'Accessoires', 45, ARRAY['https://picsum.photos/seed/girlyhair/900/900'], ARRAY['chouchou', 'satin', 'cheveux', 'doux'], false)
ON CONFLICT DO NOTHING;

-- Afficher le nombre de produits insérés
SELECT COUNT(*) as total_products FROM products;
