import { useState, useEffect } from 'react';
import api from '../lib/api';
import type { Course } from '../types';

export const useFetchCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      try {
        const res = await api.get('/courses/courseList', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        setCourses(res.data);
      } catch (err: any) {
        setError(err?.message ?? String(err));
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return { courses, isLoading, error };
};
