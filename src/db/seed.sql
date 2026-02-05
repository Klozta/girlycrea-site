-- ========================================
-- GirlyCrea - Seed Data
-- Description: Données de test pour le développement
-- ========================================

-- ========================================
-- Produits de test - Bijoux (4 produits)
-- ========================================
INSERT INTO products (name, slug, description, price, category, image_url, images, stock, rating, rating_count, tags) VALUES
('Bracelet Perlé Personnalisé', 'bracelet-perle-personnalise', 'Bracelet fait main, perles + initiale. Idéal cadeau. Personnalisation disponible.', 14.90, 'Bijoux', 'https://via.placeholder.com/300x300?text=Bracelet+Perle', ARRAY['https://via.placeholder.com/300x300?text=Bracelet+Perle'], 40, 4.8, 12, ARRAY['fait-main', 'cadeau', 'personnalise', 'perles']),
('Boucles d''oreilles Coeur - Rose', 'boucles-oreilles-coeur-rose', 'Boucles légères, coeur rose, finition douce. Hypoallergénique.', 12.50, 'Bijoux', 'https://via.placeholder.com/300x300?text=Boucles+Coeur', ARRAY['https://via.placeholder.com/300x300?text=Boucles+Coeur'], 30, 4.9, 8, ARRAY['coeur', 'rose', 'leger', 'hypoallergenique']),
('Collier Perle de Culture', 'collier-perle-culture', 'Collier perle de culture, longueur ajustable, fermoir doré. Élégant et intemporel.', 45.00, 'Bijoux', 'https://via.placeholder.com/300x300?text=Collier+Perle', ARRAY['https://via.placeholder.com/300x300?text=Collier+Perle'], 15, 5.0, 5, ARRAY['perle', 'culture', 'elegant', 'ajustable']),
('Bague Argent 925 avec Pierre', 'bague-argent-925-pierre', 'Bague en argent 925, pierre naturelle, taille ajustable. Design unique.', 35.00, 'Bijoux', 'https://via.placeholder.com/300x300?text=Bague+Argent', ARRAY['https://via.placeholder.com/300x300?text=Bague+Argent'], 20, 4.7, 15, ARRAY['argent', '925', 'pierre', 'naturelle'])
ON CONFLICT (slug) DO NOTHING;

-- ========================================
-- Produits de test - Mode (5 produits)
-- ========================================
INSERT INTO products (name, slug, description, price, original_price, category, image_url, images, stock, rating, rating_count, tags) VALUES
('Sac à Main Cuir Rose', 'sac-main-cuir-rose', 'Sac à main en cuir véritable, couleur rose poudré, intérieur spacieux.', 89.00, 120.00, 'Mode', 'https://via.placeholder.com/300x300?text=Sac+Cuir', ARRAY['https://via.placeholder.com/300x300?text=Sac+Cuir'], 8, 4.9, 10, ARRAY['sac', 'cuir', 'rose', 'luxe']),
('Foulard Soie Imprimé', 'foulard-soie-imprime', 'Foulard en soie, imprimé floral, dimensions 90x90cm. Accessoire élégant.', 45.00, 60.00, 'Mode', 'https://via.placeholder.com/300x300?text=Foulard+Soie', ARRAY['https://via.placeholder.com/300x300?text=Foulard+Soie'], 15, 4.8, 7, ARRAY['foulard', 'soie', 'imprime', 'floral']),
('Ceinture Cuir avec Boucle Dorée', 'ceinture-cuir-boucle-doree', 'Ceinture en cuir véritable, boucle dorée, taille ajustable. Style classique.', 35.00, 45.00, 'Mode', 'https://via.placeholder.com/300x300?text=Ceinture+Cuir', ARRAY['https://via.placeholder.com/300x300?text=Ceinture+Cuir'], 20, 4.6, 9, ARRAY['ceinture', 'cuir', 'doree', 'ajustable']),
('Porte-clés Personnalisé', 'porte-cles-personnalise', 'Porte-clés personnalisé avec initiale, plusieurs coloris disponibles.', 8.90, 12.90, 'Mode', 'https://via.placeholder.com/300x300?text=Porte+Cles', ARRAY['https://via.placeholder.com/300x300?text=Porte+Cles'], 50, 4.7, 20, ARRAY['porte-cles', 'personnalise', 'initiale', 'cadeau']),
('Étui à Lunettes Rose', 'etui-lunettes-rose', 'Étui à lunettes en cuir synthétique, couleur rose, protection renforcée.', 12.50, 18.50, 'Mode', 'https://via.placeholder.com/300x300?text=Etui+Lunettes', ARRAY['https://via.placeholder.com/300x300?text=Etui+Lunettes'], 30, 4.8, 11, ARRAY['etui', 'lunettes', 'rose', 'protection'])
ON CONFLICT (slug) DO NOTHING;

-- ========================================
-- Produits de test - Beauté (4 produits)
-- ========================================
INSERT INTO products (name, slug, description, price, original_price, category, image_url, images, stock, rating, rating_count, tags) VALUES
('Trousse de Maquillage Rose', 'trousse-maquillage-rose', 'Trousse de maquillage rose, compartiments multiples, design pratique.', 15.90, 22.90, 'Beauté', 'https://via.placeholder.com/300x300?text=Trousse+Maquillage', ARRAY['https://via.placeholder.com/300x300?text=Trousse+Maquillage'], 35, 4.9, 14, ARRAY['trousse', 'maquillage', 'rose', 'pratique']),
('Pinceau Maquillage Premium', 'pinceau-maquillage-premium', 'Set de 5 pinceaux maquillage premium, poils synthétiques doux.', 22.00, 32.00, 'Beauté', 'https://via.placeholder.com/300x300?text=Pinceaux+Premium', ARRAY['https://via.placeholder.com/300x300?text=Pinceaux+Premium'], 25, 5.0, 8, ARRAY['pinceau', 'maquillage', 'premium', 'set']),
('Miroir de Poche LED', 'miroir-poche-led', 'Miroir de poche avec éclairage LED, rechargeable, design compact.', 19.90, 29.90, 'Beauté', 'https://via.placeholder.com/300x300?text=Miroir+LED', ARRAY['https://via.placeholder.com/300x300?text=Miroir+LED'], 28, 4.7, 13, ARRAY['miroir', 'led', 'rechargeable', 'compact']),
('Chouchou Cheveux Satin', 'chouchou-cheveux-satin', 'Chouchou cheveux en satin, plusieurs coloris, doux pour les cheveux.', 6.90, 9.90, 'Beauté', 'https://via.placeholder.com/300x300?text=Chouchou+Satin', ARRAY['https://via.placeholder.com/300x300?text=Chouchou+Satin'], 45, 4.8, 25, ARRAY['chouchou', 'satin', 'cheveux', 'doux'])
ON CONFLICT (slug) DO NOTHING;

-- ========================================
-- Produits de test - Crochet (4 produits)
-- ========================================
INSERT INTO products (name, slug, description, price, category, image_url, images, stock, rating, rating_count, tags, is_featured) VALUES
('Pochette Crochet Bohème', 'pochette-crochet-boheme', 'Pochette crochet style bohème, doublée, fermeture zip. Fait main avec amour.', 24.00, 'Crochet', 'https://via.placeholder.com/300x300?text=Pochette+Crochet', ARRAY['https://via.placeholder.com/300x300?text=Pochette+Crochet'], 8, 5.0, 6, ARRAY['crochet', 'boheme', 'artisanat', 'fait-main'], TRUE),
('Tote bag Crochet "Noël"', 'tote-bag-crochet-noel', 'Tote bag crochet, édition Noël, stock limité. Parfait pour les fêtes.', 29.00, 'Crochet', 'https://via.placeholder.com/300x300?text=Tote+Noel', ARRAY['https://via.placeholder.com/300x300?text=Tote+Noel'], 5, 4.9, 4, ARRAY['noel', 'stock-limite', 'crochet', 'fetes'], TRUE),
('Bonnet Crochet Hiver', 'bonnet-crochet-hiver', 'Bonnet crochet doux et chaud, plusieurs coloris disponibles. Fait main.', 18.50, 'Crochet', 'https://via.placeholder.com/300x300?text=Bonnet+Hiver', ARRAY['https://via.placeholder.com/300x300?text=Bonnet+Hiver'], 12, 4.8, 9, ARRAY['bonnet', 'hiver', 'chaud', 'crochet'], FALSE),
('Écharpe Crochet Longue', 'echarpe-crochet-longue', 'Écharpe crochet extra longue, motifs géométriques, laine douce.', 32.00, 'Crochet', 'https://via.placeholder.com/300x300?text=Echarpe+Longue', ARRAY['https://via.placeholder.com/300x300?text=Echarpe+Longue'], 10, 4.9, 7, ARRAY['echarpe', 'longue', 'geometrique', 'laine'], TRUE)
ON CONFLICT (slug) DO NOTHING;

-- ========================================
-- Coques iPhone (4 produits supplémentaires)
-- ========================================
INSERT INTO products (name, slug, description, price, original_price, category, image_url, images, stock, rating, rating_count, tags) VALUES
('Coque iPhone Rose Gold - GirlyCrea', 'coque-iphone-rose-gold', 'Coque rose gold premium, finition brillante, protection antichoc. Compatible iPhone 12/13/14/15.', 19.90, 24.90, 'Coques', 'https://via.placeholder.com/300x300?text=Coque+Rose+Gold', ARRAY['https://via.placeholder.com/300x300?text=Coque+Rose+Gold'], 25, 4.8, 18, ARRAY['rose-gold', 'iphone', 'tendance', 'protection']),
('Coque iPhone Transparente avec Strass', 'coque-iphone-transparente-strass', 'Coque transparente élégante avec strass, protection renforcée, design unique.', 24.90, 29.90, 'Coques', 'https://via.placeholder.com/300x300?text=Coque+Strass', ARRAY['https://via.placeholder.com/300x300?text=Coque+Strass'], 18, 4.9, 12, ARRAY['transparent', 'strass', 'iphone', 'elegant']),
('Coque iPhone Floral Print', 'coque-iphone-floral-print', 'Coque avec motif floral délicat, protection complète, design féminin.', 22.50, 27.50, 'Coques', 'https://via.placeholder.com/300x300?text=Coque+Floral', ARRAY['https://via.placeholder.com/300x300?text=Coque+Floral'], 30, 4.7, 15, ARRAY['floral', 'print', 'feminin', 'iphone']),
('Coque iPhone Premium Protection', 'coque-iphone-premium-protection', 'Coque premium avec protection renforcée aux angles, design épuré, plusieurs coloris.', 29.90, 39.90, 'Coques', 'https://via.placeholder.com/300x300?text=Coque+Premium', ARRAY['https://via.placeholder.com/300x300?text=Coque+Premium'], 22, 5.0, 10, ARRAY['premium', 'protection', 'iphone', 'design'])
ON CONFLICT (slug) DO NOTHING;

-- ========================================
-- Coupons de test (4 coupons)
-- ========================================
INSERT INTO coupons (code, name, description, discount_type, discount_value, min_purchase_amount, max_discount_amount, max_uses, used_count, is_active, starts_at, expires_at) VALUES
('WELCOME10', 'Bienvenue -10%', 'Réduction de 10% pour les nouveaux clients', 'percent', 10.00, 20.00, NULL, 1000, 0, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days'),
('SUMMER20', 'Été -20%', 'Réduction de 20% sur tous les produits', 'percent', 20.00, 50.00, 50.00, 500, 0, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '60 days'),
('VIP30', 'VIP -30%', 'Réduction exclusive de 30% pour les membres VIP', 'percent', 30.00, 100.00, 100.00, 100, 0, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '90 days'),
('NEW15', 'Nouveau Client -15%', 'Réduction de 15% pour votre première commande', 'percent', 15.00, 30.00, NULL, 2000, 0, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '45 days')
ON CONFLICT (code) DO NOTHING;

-- ========================================
-- Seed terminé
-- ========================================
