-- Migration: Création de la table product_reviews
-- Date: 2026-01-03
-- Description: Système d'avis produits avec photos et modération

-- Table des avis produits
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL, -- Pour vérifier l'achat
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT, -- Titre de l'avis
  comment TEXT, -- Commentaire détaillé
  photos TEXT[] DEFAULT '{}', -- URLs des photos
  is_verified_purchase BOOLEAN DEFAULT FALSE, -- Avis vérifié (client a acheté)
  is_approved BOOLEAN DEFAULT FALSE, -- Modération admin
  is_featured BOOLEAN DEFAULT FALSE, -- Avis mis en avant
  helpful_count INTEGER DEFAULT 0, -- Nombre de "utile"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Un utilisateur ne peut laisser qu'un seul avis par produit
  UNIQUE(product_id, user_id)
);

-- Table pour les votes "utile" sur les avis
CREATE TABLE IF NOT EXISTS review_helpful_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES product_reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id, user_id) -- Un utilisateur ne peut voter qu'une fois par avis
);

-- Table pour les réponses du vendeur/admin aux avis
CREATE TABLE IF NOT EXISTS review_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES product_reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Admin ou vendeur
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_product_reviews_is_approved ON product_reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_product_reviews_is_featured ON product_reviews(is_featured);
CREATE INDEX IF NOT EXISTS idx_product_reviews_created_at ON product_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_reviews_is_verified ON product_reviews(is_verified_purchase);
CREATE INDEX IF NOT EXISTS idx_review_helpful_votes_review_id ON review_helpful_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_responses_review_id ON review_responses(review_id);

-- Fonction pour calculer la note moyenne d'un produit
CREATE OR REPLACE FUNCTION calculate_product_rating(p_product_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_avg_rating NUMERIC;
BEGIN
  SELECT COALESCE(AVG(rating), 0) INTO v_avg_rating
  FROM product_reviews
  WHERE product_id = p_product_id
    AND is_approved = TRUE;

  RETURN ROUND(v_avg_rating, 1);
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir le nombre d'avis d'un produit
CREATE OR REPLACE FUNCTION get_product_review_count(p_product_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM product_reviews
  WHERE product_id = p_product_id
    AND is_approved = TRUE;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_product_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_reviews_updated_at
  BEFORE UPDATE ON product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_product_reviews_updated_at();

CREATE TRIGGER update_review_responses_updated_at
  BEFORE UPDATE ON review_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_product_reviews_updated_at();

-- Trigger pour mettre à jour le compteur "utile"
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE product_reviews
    SET helpful_count = helpful_count + 1
    WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE product_reviews
    SET helpful_count = GREATEST(helpful_count - 1, 0)
    WHERE id = OLD.review_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_review_helpful_count_trigger
  AFTER INSERT OR DELETE ON review_helpful_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_review_helpful_count();

-- RLS Policies
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpful_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_responses ENABLE ROW LEVEL SECURITY;

-- Policy: Tout le monde peut voir les avis approuvés
CREATE POLICY "Approved reviews are viewable by everyone"
  ON product_reviews FOR SELECT
  USING (is_approved = TRUE);

-- Policy: Les utilisateurs peuvent voir leurs propres avis (même non approuvés)
CREATE POLICY "Users can view their own reviews"
  ON product_reviews FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Les utilisateurs authentifiés peuvent créer des avis
CREATE POLICY "Authenticated users can create reviews"
  ON product_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Les utilisateurs peuvent modifier leurs propres avis
CREATE POLICY "Users can update their own reviews"
  ON product_reviews FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy: Les admins peuvent approuver/modifier tous les avis
CREATE POLICY "Admins can manage all reviews"
  ON product_reviews FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy: Les utilisateurs peuvent voter "utile" sur les avis
CREATE POLICY "Authenticated users can vote on reviews"
  ON review_helpful_votes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Tout le monde peut voir les réponses aux avis
CREATE POLICY "Review responses are viewable by everyone"
  ON review_responses FOR SELECT
  USING (TRUE);

-- Policy: Seuls les admins peuvent répondre aux avis
CREATE POLICY "Admins can create review responses"
  ON review_responses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Commentaires
COMMENT ON TABLE product_reviews IS 'Avis clients sur les produits';
COMMENT ON TABLE review_helpful_votes IS 'Votes "utile" sur les avis';
COMMENT ON TABLE review_responses IS 'Réponses du vendeur/admin aux avis';
COMMENT ON FUNCTION calculate_product_rating IS 'Calcule la note moyenne d''un produit';
COMMENT ON FUNCTION get_product_review_count IS 'Retourne le nombre d''avis approuvés d''un produit';





