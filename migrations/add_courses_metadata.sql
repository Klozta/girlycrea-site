-- Migration: Ajout des champs objectifs, prérequis et FAQ aux cours
-- Date: 2025-12-18
-- Description: Ajoute les champs metadata pour enrichir les cours

-- Ajouter les colonnes JSONB pour objectifs, prérequis et FAQ
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS objectives JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS prerequisites JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS faq JSONB DEFAULT '[]'::jsonb;

-- Index GIN pour les recherches dans les champs JSONB
CREATE INDEX IF NOT EXISTS idx_courses_objectives ON courses USING GIN (objectives);
CREATE INDEX IF NOT EXISTS idx_courses_prerequisites ON courses USING GIN (prerequisites);
CREATE INDEX IF NOT EXISTS idx_courses_faq ON courses USING GIN (faq);

-- Commentaires pour documentation
COMMENT ON COLUMN courses.objectives IS 'Liste des objectifs d''apprentissage (array de strings)';
COMMENT ON COLUMN courses.prerequisites IS 'Liste des prérequis (array de strings)';
COMMENT ON COLUMN courses.faq IS 'Questions fréquentes (array d''objets {question, answer})';








