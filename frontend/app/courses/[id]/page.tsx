'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, Users, Star, BookOpen, CheckCircle, PlayCircle, ArrowLeft, User } from 'lucide-react';
import { api } from '@/lib/api';
import { useStore } from '@/lib/store';
import { toast } from 'react-hot-toast';

const levelColors: Record<string, string> = {
  débutant: 'bg-green-100 text-green-800',
  intermédiaire: 'bg-blue-100 text-blue-800',
  avancé: 'bg-purple-100 text-purple-800',
};

const formatLabels: Record<string, string> = {
  'en ligne': 'En ligne',
  'présentiel': 'Présentiel',
  'mixte': 'Mixte',
};

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useStore();
  const courseId = params.id as string;

  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (courseId) {
      loadCourse();
      loadLessons();
      loadReviews();
    }
  }, [courseId]);

  const loadCourse = async () => {
    try {
      const data = await api.getCourse(courseId);
      setCourse(data);
    } catch (error: any) {
      console.error('Error loading course:', error);
      if (error.isNetworkError) {
        toast.error('Impossible de charger le cours');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadLessons = async () => {
    try {
      const data = await api.getCourseLessons(courseId);
      setLessons(data || []);
    } catch (error) {
      console.error('Error loading lessons:', error);
    }
  };

  const loadReviews = async () => {
    try {
      const data = await api.getCourseReviews(courseId);
      setReviews(data || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast.error('Veuillez vous connecter pour vous inscrire au cours');
      router.push('/login');
      return;
    }

    setEnrolling(true);
    try {
      await api.enrollInCourse(courseId);
      toast.success('Inscription réussie ! Vous pouvez maintenant accéder au cours.');
      router.push('/profile?tab=courses');
    } catch (error: any) {
      console.error('Error enrolling:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de l\'inscription');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="h-64 bg-gray-200 rounded" />
            <div className="h-32 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold mb-2">Cours introuvable</h2>
          <Link href="/courses" className="btn btn-primary mt-4">
            Retour aux cours
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/courses" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600">
            <ArrowLeft className="w-5 h-5" />
            Retour aux cours
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Image */}
            {course.image && (
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              </div>
            )}

            {/* Course Info */}
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-display font-bold mb-2">{course.title}</h1>
                  {course.instructor && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="w-4 h-4" />
                      <span>Par {course.instructor.name}</span>
                    </div>
                  )}
                </div>
                {course.level && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${levelColors[course.level] || ''}`}>
                    {course.level}
                  </span>
                )}
              </div>

              {course.description && (
                <div className="prose max-w-none mb-6">
                  <p className="text-gray-700 whitespace-pre-line">{course.description}</p>
                </div>
              )}

              {/* Course Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="text-sm text-gray-500">Durée</p>
                    <p className="font-medium">{course.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="text-sm text-gray-500">Format</p>
                    <p className="font-medium">{formatLabels[course.format] || course.format}</p>
                  </div>
                </div>
                {course.rating !== null && course.rating > 0 && (
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <div>
                      <p className="text-sm text-gray-500">Note</p>
                      <p className="font-medium">{course.rating.toFixed(1)}/5</p>
                    </div>
                  </div>
                )}
                {lessons.length > 0 && (
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary-600" />
                    <div>
                      <p className="text-sm text-gray-500">Leçons</p>
                      <p className="font-medium">{lessons.length}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Objectives */}
              {course.objectives && course.objectives.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xl font-display font-bold mb-3">Objectifs d'apprentissage</h3>
                  <ul className="space-y-2">
                    {course.objectives.map((objective: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Prerequisites */}
              {course.prerequisites && course.prerequisites.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xl font-display font-bold mb-3">Prérequis</h3>
                  <ul className="space-y-2">
                    {course.prerequisites.map((prerequisite: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary-600">•</span>
                        <span>{prerequisite}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Lessons */}
            {lessons.length > 0 && (
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-2xl font-display font-bold mb-4">Contenu du cours</h2>
                <div className="space-y-3">
                  {lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{lesson.title}</h3>
                        {lesson.description && (
                          <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                        )}
                        {lesson.duration && (
                          <p className="text-xs text-gray-500 mt-1">{lesson.duration}</p>
                        )}
                      </div>
                      {lesson.video_url && (
                        <PlayCircle className="w-6 h-6 text-primary-600" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-2xl font-display font-bold mb-4">
                  Avis ({reviews.length})
                </h2>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold">{review.user?.name || 'Anonyme'}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      {review.comment && <p className="text-gray-700">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 sticky top-20">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-primary-600 mb-2">
                  {course.price.toFixed(2)}€
                </div>
                {course.rating !== null && course.rating > 0 && (
                  <div className="flex items-center justify-center gap-2">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{course.rating.toFixed(1)}</span>
                    <span className="text-gray-500">({reviews.length} avis)</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full btn btn-primary mb-4"
              >
                {enrolling ? 'Inscription...' : 'S\'inscrire au cours'}
              </button>

              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Accès à vie</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Support instructeur</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Certificat de complétion</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}






