-- Insérer des produits de test

INSERT INTO products (name, slug, description, price, category, image_url, stock, rating) VALUES
('Bague Elegance', 'bague-elegance', 'Bague en or avec diamant', 299.99, 'bijoux', 'https://via.placeholder.com/300x300?text=Bague+Elegance', 50, 4.8),
('Collier Pearl', 'collier-pearl', 'Collier perles authentiques', 199.99, 'bijoux', 'https://via.placeholder.com/300x300?text=Collier+Pearl', 30, 4.9),
('Bracelet Sunrise', 'bracelet-sunrise', 'Bracelet à chaîne dorée', 149.99, 'bijoux', 'https://via.placeholder.com/300x300?text=Bracelet+Sunrise', 45, 4.7),
('Montre Classic', 'montre-classic', 'Montre analogique intemporelle', 399.99, 'mode', 'https://via.placeholder.com/300x300?text=Montre+Classic', 20, 4.9),
('Sac Milano', 'sac-milano', 'Sac à main cuir premium', 249.99, 'mode', 'https://via.placeholder.com/300x300?text=Sac+Milano', 25, 4.8),
('Écharpe Velours', 'echarpe-velours', 'Écharpe velours doux', 89.99, 'mode', 'https://via.placeholder.com/300x300?text=Echarpe+Velours', 60, 4.6),
('Crème Visage Premium', 'creme-visage-premium', 'Crème anti-âge premium', 79.99, 'beauté', 'https://via.placeholder.com/300x300?text=Creme+Visage', 40, 4.7),
('Lipstick Rouge', 'lipstick-rouge', 'Rouge à lèvres longue tenue', 34.99, 'beauté', 'https://via.placeholder.com/300x300?text=Lipstick+Rouge', 100, 4.8),
('Mascara Noir', 'mascara-noir', 'Mascara volume extrême', 29.99, 'beauté', 'https://via.placeholder.com/300x300?text=Mascara+Noir', 80, 4.9),
('Amigurumi Chat', 'amigurumi-chat', 'Chat au crochet fait main', 34.99, 'crochet', 'https://via.placeholder.com/300x300?text=Amigurumi+Chat', 15, 5.0),
('Couverture Bébé', 'couverture-bebe', 'Couverture crochet pour bébé', 64.99, 'crochet', 'https://via.placeholder.com/300x300?text=Couverture+Bebe', 20, 4.9),
('Porte-clés Fleur', 'porte-cles-fleur', 'Porte-clés fleur au crochet', 14.99, 'crochet', 'https://via.placeholder.com/300x300?text=Porte+cles+Fleur', 50, 4.8),
('Pull Tricot Chaud', 'pull-tricot-chaud', 'Pull tricoté main luxe', 129.99, 'mode', 'https://via.placeholder.com/300x300?text=Pull+Tricot', 18, 4.7),
('Boucles Oreilles', 'boucles-oreilles', 'Boucles oreilles perles', 79.99, 'bijoux', 'https://via.placeholder.com/300x300?text=Boucles+Oreilles', 55, 4.8),
('Anneau Cristal', 'anneau-cristal', 'Anneau cristal Swarovski', 89.99, 'bijoux', 'https://via.placeholder.com/300x300?text=Anneau+Cristal', 35, 4.9),
('Parfum Floral', 'parfum-floral', 'Parfum floral 50ml', 64.99, 'beauté', 'https://via.placeholder.com/300x300?text=Parfum+Floral', 45, 4.8),
('Gant Dentelle', 'gant-dentelle', 'Gants dentelle noirs', 29.99, 'mode', 'https://via.placeholder.com/300x300?text=Gant+Dentelle', 40, 4.7),
('Chapeau Fleurie', 'chapeau-fleurie', 'Chapeau ornementé fleuri', 44.99, 'mode', 'https://via.placeholder.com/300x300?text=Chapeau+Fleurie', 25, 4.6),
('Pouf Crochet', 'pouf-crochet', 'Pouf fait main au crochet', 79.99, 'crochet', 'https://via.placeholder.com/300x300?text=Pouf+Crochet', 12, 4.9),
('Napperon Dentelle', 'napperon-dentelle', 'Napperon dentelle vintage', 24.99, 'crochet', 'https://via.placeholder.com/300x300?text=Napperon+Dentelle', 30, 4.8);

-- Insérer des coupons de test
INSERT INTO coupons (code, discount_percent, expiry_date, max_uses) VALUES
('WELCOME10', 10, NOW() + INTERVAL '30 days', 100),
('SUMMER20', 20, NOW() + INTERVAL '60 days', 50),
('VIP30', 30, NOW() + INTERVAL '90 days', 10),
('NEW15', 15, NOW() + INTERVAL '45 days', 200);
