-- Migration: Création de la table coupons
-- Date: 2026-01-03
-- Description: Système de coupons et codes promo

-- Table des coupons
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
  min_purchase_amount NUMERIC(10, 2) DEFAULT 0 CHECK (min_purchase_amount >= 0),
  max_discount_amount NUMERIC(10, 2), -- Limite pour les pourcentages
  usage_limit INTEGER, -- Nombre total d'utilisations (NULL = illimité)
  usage_count INTEGER DEFAULT 0,
  user_usage_limit INTEGER DEFAULT 1, -- Nombre d'utilisations par utilisateur
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  applicable_to TEXT[] DEFAULT '{}', -- Catégories applicables (vide = toutes)
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour suivre l'utilisation des coupons par utilisateur
CREATE TABLE IF NOT EXISTS coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  discount_amount NUMERIC(10, 2) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(coupon_id, user_id, order_id) -- Un coupon ne peut être utilisé qu'une fois par commande
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_dates ON coupons(valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon_id ON coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user_id ON coupon_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_order_id ON coupon_usage(order_id);

-- Fonction pour vérifier si un coupon est valide
CREATE OR REPLACE FUNCTION is_coupon_valid(
  p_code TEXT,
  p_user_id UUID,
  p_order_total NUMERIC
) RETURNS BOOLEAN AS $$
DECLARE
  v_coupon coupons%ROWTYPE;
  v_user_usage_count INTEGER;
BEGIN
  -- Récupérer le coupon
  SELECT * INTO v_coupon
  FROM coupons
  WHERE code = p_code
    AND is_active = TRUE
    AND (valid_from IS NULL OR valid_from <= NOW())
    AND (valid_until IS NULL OR valid_until >= NOW())
    AND (usage_limit IS NULL OR usage_count < usage_limit);

  -- Si coupon non trouvé ou inactif
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Vérifier le montant minimum
  IF v_coupon.min_purchase_amount > 0 AND p_order_total < v_coupon.min_purchase_amount THEN
    RETURN FALSE;
  END IF;

  -- Vérifier les catégories applicables (si spécifiées)
  IF array_length(v_coupon.applicable_to, 1) > 0 THEN
    -- Cette vérification doit être faite côté application avec les produits de la commande
    -- On retourne TRUE ici, la vérification complète se fera dans le service
  END IF;

  -- Vérifier l'utilisation par utilisateur
  SELECT COUNT(*) INTO v_user_usage_count
  FROM coupon_usage
  WHERE coupon_id = v_coupon.id
    AND user_id = p_user_id;

  IF v_user_usage_count >= v_coupon.user_usage_limit THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour calculer le montant de réduction
CREATE OR REPLACE FUNCTION calculate_coupon_discount(
  p_code TEXT,
  p_order_total NUMERIC
) RETURNS NUMERIC AS $$
DECLARE
  v_coupon coupons%ROWTYPE;
  v_discount NUMERIC;
BEGIN
  -- Récupérer le coupon
  SELECT * INTO v_coupon
  FROM coupons
  WHERE code = p_code
    AND is_active = TRUE;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- Calculer la réduction
  IF v_coupon.discount_type = 'percentage' THEN
    v_discount := (p_order_total * v_coupon.discount_value / 100);
    -- Appliquer la limite max si définie
    IF v_coupon.max_discount_amount IS NOT NULL AND v_discount > v_coupon.max_discount_amount THEN
      v_discount := v_coupon.max_discount_amount;
    END IF;
  ELSE
    v_discount := v_coupon.discount_value;
  END IF;

  -- Ne pas dépasser le montant de la commande
  IF v_discount > p_order_total THEN
    v_discount := p_order_total;
  END IF;

  RETURN v_discount;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_coupons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_coupons_updated_at();

-- RLS Policies
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;

-- Policy: Tout le monde peut voir les coupons actifs
CREATE POLICY "Coupons are viewable by everyone"
  ON coupons FOR SELECT
  USING (is_active = TRUE);

-- Policy: Seuls les admins peuvent créer/modifier/supprimer des coupons
CREATE POLICY "Coupons are manageable by admins"
  ON coupons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy: Les utilisateurs peuvent voir leurs propres utilisations de coupons
CREATE POLICY "Users can view their own coupon usage"
  ON coupon_usage FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Les utilisateurs peuvent créer leurs propres utilisations (via API)
CREATE POLICY "Users can create their own coupon usage"
  ON coupon_usage FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Commentaires
COMMENT ON TABLE coupons IS 'Table des coupons et codes promo';
COMMENT ON TABLE coupon_usage IS 'Historique d''utilisation des coupons par utilisateur';
COMMENT ON FUNCTION is_coupon_valid IS 'Vérifie si un coupon est valide pour un utilisateur et un montant donné';
COMMENT ON FUNCTION calculate_coupon_discount IS 'Calcule le montant de réduction d''un coupon';





