-- Migration: Fonction RPC pour recherche avancée des cours
-- Date: 2025-12-18
-- Description: Crée une fonction PostgreSQL pour recherche full-text avec tsvector (comme pour les produits)

-- Créer la fonction de recherche pour les cours
CREATE OR REPLACE FUNCTION search_courses(
  query_text TEXT,
  page_num INTEGER DEFAULT 1,
  page_size INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  price NUMERIC,
  duration TEXT,
  level TEXT,
  format TEXT,
  instructor_id UUID,
  image TEXT,
  rating NUMERIC,
  badge TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN,
  total_count BIGINT
) AS $$
DECLARE
  offset_val INTEGER;
BEGIN
  offset_val := (page_num - 1) * page_size;

  RETURN QUERY
  SELECT
    c.id,
    c.title,
    c.description,
    c.price,
    c.duration,
    c.level,
    c.format,
    c.instructor_id,
    c.image,
    c.rating,
    c.badge,
    c.created_at,
    c.updated_at,
    c.is_deleted,
    COUNT(*) OVER() AS total_count
  FROM courses c
  WHERE
    c.is_deleted = false
    AND (
      -- Recherche dans le titre
      c.title ILIKE '%' || query_text || '%'
      OR
      -- Recherche dans la description
      c.description ILIKE '%' || query_text || '%'
    )
  ORDER BY
    -- Prioriser les correspondances dans le titre
    CASE
      WHEN c.title ILIKE '%' || query_text || '%' THEN 1
      ELSE 2
    END,
    c.created_at DESC
  LIMIT page_size
  OFFSET offset_val;
END;
$$ LANGUAGE plpgsql STABLE;

-- Commentaire pour documentation
COMMENT ON FUNCTION search_courses IS 'Recherche full-text dans les cours (titre et description) avec pagination';

-- Index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_courses_title_trgm ON courses USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_courses_description_trgm ON courses USING gin (description gin_trgm_ops);

-- Note: Les extensions pg_trgm doivent être activées dans Supabase
-- Exécuter dans Supabase Dashboard > Database > Extensions :
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;








