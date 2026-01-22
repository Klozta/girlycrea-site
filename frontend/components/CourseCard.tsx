'use client';

import Link from 'next/link';
import Image from 'next/image';
import { GraduationCap, Clock, Users, Star } from 'lucide-react';

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description?: string;
    image?: string;
    price: number;
    original_price?: number;
    duration?: string;
    level?: string;
    rating?: number;
    students_count?: number;
    category?: string;
  };
}

export default function CourseCard({ course }: CourseCardProps) {
  const getLevelColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'débutant':
        return 'bg-green-100 text-green-800';
      case 'intermédiaire':
        return 'bg-yellow-100 text-yellow-800';
      case 'avancé':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatLevel = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'débutant':
        return 'Débutant';
      case 'intermédiaire':
        return 'Intermédiaire';
      case 'avancé':
        return 'Avancé';
      default:
        return level || 'Tous niveaux';
    }
  };

  return (
    <Link href={`/courses/${course.id}`} className="card group hover:shadow-xl transition-all">
      <div className="relative aspect-video bg-gray-100 overflow-hidden rounded-t-lg">
        {course.image ? (
          <Image
            src={course.image}
            alt={course.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary-50">
            <GraduationCap className="w-16 h-16 text-primary-300" />
          </div>
        )}

        {course.level && (
          <div className="absolute top-3 left-3">
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getLevelColor(course.level)}`}>
              {formatLevel(course.level)}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {course.title}
          </h3>
          {course.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
              {course.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          {course.duration && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{course.duration}</span>
            </div>
          )}

          {course.students_count !== undefined && (
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{course.students_count} élèves</span>
            </div>
          )}

          {course.rating !== undefined && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{course.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary-600">
              {Number(course.price).toFixed(2)} €
            </span>
            {course.original_price && Number(course.original_price) > Number(course.price) && (
              <span className="text-sm text-gray-500 line-through">
                {Number(course.original_price).toFixed(2)} €
              </span>
            )}
          </div>

          <button className="btn btn-primary btn-sm">
            Voir le cours
          </button>
        </div>

        {course.category && (
          <div className="mt-2">
            <span className="inline-block bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded">
              {course.category}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
