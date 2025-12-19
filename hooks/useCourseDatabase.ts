import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Course } from '@/types';

export function useSearchCourses(query: string, degreeField?: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['course-database', 'search', query, degreeField],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      const res = await api.get('/course-database/search', {
        params: { query, degreeField, limit: 10 }
      });
      return res.data.courses as Course[];
    },
    enabled: enabled && query.length >= 2,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

export function usePopularCourses(degreeField?: string) {
  return useQuery({
    queryKey: ['course-database', 'popular', degreeField],
    queryFn: async () => {
      const res = await api.get('/course-database/search', {
        params: { popular: true, limit: 10, degreeField }
      });
      return res.data.courses as Course[];
    },
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });
}
