import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { UserCourse } from '../types';

// Query key factory
export const courseKeys = {
  all: ['courses'] as const,
  lists: () => [...courseKeys.all, 'list'] as const,
  list: () => [...courseKeys.lists()] as const,
};

// Fetch courses query
export const useCourses = () => {
  return useQuery({
    queryKey: courseKeys.list(),
    queryFn: async () => {
      const res = await api.get('/courses/course-list');
      return res.data as UserCourse[];
    },
  });
};

// Add course mutation
export const useAddCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: Partial<UserCourse>) => {
      const res = await api.post('/courses/add-course', formData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.list() });
    },
  });
};

// Edit course mutation
export const useEditCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, formData }: { courseId: string; formData: Partial<UserCourse> }) => {
      const res = await api.patch(`/courses/update-course/${courseId}`, formData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.list() });
    },
  });
};

// Delete course mutation
export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      const res = await api.delete('/courses/delete-course', { data: { courseId } });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.list() });
    },
  });
};

