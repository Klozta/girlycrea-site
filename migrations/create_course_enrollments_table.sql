-- Migration: Table pour les inscriptions aux cours
-- Date: 2025-12-18
-- Description: Crée une table pour gérer les inscriptions des utilisateurs aux cours achetés

-- Table des inscriptions aux cours
CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL, -- Lien avec la commande
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress JSONB DEFAULT '{}'::jsonb, -- Progression: { "lessons_completed": [], "last_accessed": null }
  completed_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Contrainte: un utilisateur ne peut s'inscrire qu'une fois à un cours
  UNIQUE(user_id, course_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_order_id ON course_enrollments(order_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_enrolled_at ON course_enrollments(enrolled_at DESC);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_course_enrollments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_course_enrollments_updated_at
  BEFORE UPDATE ON course_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_course_enrollments_updated_at();

-- RLS Policies
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

-- Policy: Les utilisateurs peuvent voir leurs propres inscriptions
CREATE POLICY "Users can view their own enrollments"
  ON course_enrollments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Les utilisateurs peuvent créer leurs propres inscriptions (via API)
CREATE POLICY "Users can create their own enrollments"
  ON course_enrollments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Les utilisateurs peuvent mettre à jour leurs propres inscriptions
CREATE POLICY "Users can update their own enrollments"
  ON course_enrollments
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Les admins peuvent tout voir
CREATE POLICY "Admins can view all enrollments"
  ON course_enrollments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Commentaires pour documentation
COMMENT ON TABLE course_enrollments IS 'Inscriptions des utilisateurs aux cours achetés';
COMMENT ON COLUMN course_enrollments.progress IS 'Progression JSON: { "lessons_completed": ["uuid1", "uuid2"], "last_accessed": "timestamp" }';
COMMENT ON COLUMN course_enrollments.order_id IS 'Lien avec la commande qui a acheté le cours';








