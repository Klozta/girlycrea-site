'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, BookOpen, GraduationCap } from 'lucide-react';
import { api } from '@/lib/api';
import CourseCard from '@/components/CourseCard';

// Force dynamic rendering pour useSearchParams
export const dynamic = 'force-dynamic';

export default function CoursesPage() {
  const [searchParams, setSearchParamsState] = useState<URLSearchParams | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    level: '',
    format: '',
    sort: 'created_at_desc',
  });

  // Charger searchParams côté client uniquement
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setSearchParamsState(params);
      setFilters({
        search: params.get('search') || '',
        level: params.get('level') || '',
        format: params.get('format') || '',
        sort: params.get('sort') || 'created_at_desc',
      });
    }
  }, []);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    if (searchParams !== null) {
      loadCourses();
    }
  }, [filters, pagination.page, searchParams]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
        sort: filters.sort,
      };

      if (filters.search) params.search = filters.search;
      if (filters.level) params.level = filters.level;
      if (filters.format) params.format = filters.format;

      const data = await api.getCourses(params);
      setCourses(data.courses || []);
      setPagination({
        ...pagination,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 0,
      });
    } catch (error: any) {
      console.error('Error loading courses:', error);
      if (error.isNetworkError) {
        console.warn('Backend non accessible:', error.backendUrl);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    loadCourses();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-500 to-primary-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <GraduationCap className="w-10 h-10" />
              <h1 className="text-4xl md:text-5xl font-display font-bold">
                Cours de Crochet
              </h1>
            </div>
            <p className="text-xl text-primary-100">
              Apprenez l'art du crochet avec nos cours adaptés à tous les niveaux.
              Des techniques de base aux créations avancées, développez vos compétences
              avec nos instructeurs expérimentés.
            </p>
          </div>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="bg-white border-b sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un cours..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="input pl-10 w-full"
              />
            </div>

            {/* Level Filter */}
            <select
              value={filters.level}
              onChange={(e) => {
                setFilters({ ...filters, level: e.target.value });
                setPagination({ ...pagination, page: 1 });
              }}
              className="input"
            >
              <option value="">Tous les niveaux</option>
              <option value="débutant">Débutant</option>
              <option value="intermédiaire">Intermédiaire</option>
              <option value="avancé">Avancé</option>
            </select>

            {/* Format Filter */}
            <select
              value={filters.format}
              onChange={(e) => {
                setFilters({ ...filters, format: e.target.value });
                setPagination({ ...pagination, page: 1 });
              }}
              className="input"
            >
              <option value="">Tous les formats</option>
              <option value="en ligne">En ligne</option>
              <option value="présentiel">Présentiel</option>
              <option value="mixte">Mixte</option>
            </select>

            {/* Sort */}
            <select
              value={filters.sort}
              onChange={(e) => {
                setFilters({ ...filters, sort: e.target.value });
                setPagination({ ...pagination, page: 1 });
              }}
              className="input"
            >
              <option value="created_at_desc">Plus récents</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
              <option value="rating_desc">Mieux notés</option>
            </select>

            <button type="submit" className="btn btn-primary">
              <Search className="w-5 h-5" />
            </button>
          </form>
        </div>
      </section>

      {/* Courses List */}
      <section className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-video bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length > 0 ? (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                {pagination.total} cours trouvé{pagination.total > 1 ? 's' : ''}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="btn btn-outline disabled:opacity-50"
                >
                  Précédent
                </button>
                <span className="flex items-center px-4">
                  Page {pagination.page} sur {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page >= pagination.totalPages}
                  className="btn btn-outline disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-display font-bold mb-2">Aucun cours trouvé</h2>
            <p className="text-gray-600 mb-6">
              Essayez de modifier vos critères de recherche
            </p>
            <button
              onClick={() => {
                setFilters({ search: '', level: '', format: '', sort: 'created_at_desc' });
                setPagination({ ...pagination, page: 1 });
              }}
              className="btn btn-primary"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </section>
    </div>
  );
}


