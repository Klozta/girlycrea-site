-- Migration: Création des tables pour les cours
-- Date: 2025-12-18
-- Description: Tables pour gérer les cours, instructeurs, leçons et avis

-- Table des instructeurs
CREATE TABLE IF NOT EXISTS instructors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bio TEXT,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des cours
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  duration TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('débutant', 'intermédiaire', 'avancé')),
  format TEXT NOT NULL CHECK (format IN ('en ligne', 'présentiel', 'mixte')),
  instructor_id UUID NOT NULL REFERENCES instructors(id) ON DELETE RESTRICT,
  image TEXT,
  rating NUMERIC(3, 1) CHECK (rating >= 0 AND rating <= 5),
  badge TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Table des leçons
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  duration TEXT NOT NULL,
  description TEXT,
  order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des avis sur les cours
CREATE TABLE IF NOT EXISTS course_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, user_id) -- Un utilisateur ne peut laisser qu'un seul avis par cours
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX IF NOT EXISTS idx_courses_format ON courses(format);
CREATE INDEX IF NOT EXISTS idx_courses_is_deleted ON courses(is_deleted);
CREATE INDEX IF NOT EXISTS idx_courses_rating ON courses(rating);
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(course_id, "order");
CREATE INDEX IF NOT EXISTS idx_course_reviews_course_id ON course_reviews(course_id);
CREATE INDEX IF NOT EXISTS idx_course_reviews_user_id ON course_reviews(user_id);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour courses
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour instructors
CREATE TRIGGER update_instructors_updated_at
  BEFORE UPDATE ON instructors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - Politiques de sécurité
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_reviews ENABLE ROW LEVEL SECURITY;

-- Politiques pour instructors (lecture publique, écriture admin)
CREATE POLICY "Instructors are viewable by everyone" ON instructors
  FOR SELECT USING (true);

CREATE POLICY "Instructors are insertable by admins" ON instructors
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Instructors are updatable by admins" ON instructors
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Politiques pour courses (lecture publique, écriture admin)
CREATE POLICY "Courses are viewable by everyone" ON courses
  FOR SELECT USING (is_deleted = false);

CREATE POLICY "Courses are insertable by admins" ON courses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Courses are updatable by admins" ON courses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Politiques pour lessons (lecture publique, écriture admin)
CREATE POLICY "Lessons are viewable by everyone" ON lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = lessons.course_id
      AND courses.is_deleted = false
    )
  );

CREATE POLICY "Lessons are insertable by admins" ON lessons
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Lessons are updatable by admins" ON lessons
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Politiques pour course_reviews (lecture publique, écriture utilisateurs authentifiés)
CREATE POLICY "Course reviews are viewable by everyone" ON course_reviews
  FOR SELECT USING (true);

CREATE POLICY "Course reviews are insertable by authenticated users" ON course_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON course_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON course_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Commentaires pour documentation
COMMENT ON TABLE instructors IS 'Table des instructeurs des cours';
COMMENT ON TABLE courses IS 'Table des cours disponibles';
COMMENT ON TABLE lessons IS 'Table des leçons d''un cours';
COMMENT ON TABLE course_reviews IS 'Table des avis utilisateurs sur les cours';

COMMENT ON COLUMN courses.rating IS 'Note moyenne calculée depuis les avis (0-5)';
COMMENT ON COLUMN courses.is_deleted IS 'Soft delete: cours supprimé mais conservé en base';
COMMENT ON COLUMN lessons."order" IS 'Ordre d''affichage des leçons dans le cours';








