import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import type { JobListing } from '@/types';

export function useSavedJobs() {
  return useQuery({
    queryKey: ['savedJobs'],
    queryFn: async () => {
      const res = await api.get('/jobs/get-saved-jobs');
      const jobs: JobListing[] = res.data.savedJobs || [];
      return jobs;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    enabled: true, // Always enabled since auth is handled by API
  });
}

export function useToggleSaveJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (job: JobListing) => {
      const res = await api.post('/jobs/save-job', { job });
      return { savedJobs: res.data.savedJobs || [], message: res.data.message };
    },
    onMutate: async (job: JobListing) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['savedJobs'] });

      // Snapshot the previous value
      const previousSavedJobs = queryClient.getQueryData<JobListing[]>(['savedJobs']);

      // Optimistically update
      queryClient.setQueryData<JobListing[]>(['savedJobs'], (old = []) => {
        const exists = old.some(j => j.job_id === job.job_id);
        if (exists) {
          return old.filter(j => j.job_id !== job.job_id);
        } else {
          return [...old, job];
        }
      });

      return { previousSavedJobs };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['savedJobs'], data.savedJobs);
      toast.success(data.message);
    },
    onError: (error, job, context) => {
      // Rollback on error
      if (context?.previousSavedJobs) {
        queryClient.setQueryData(['savedJobs'], context.previousSavedJobs);
      }
      console.error('Failed to save job:', error);
      toast.error('Failed to save job. Please try again.');
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['savedJobs'] });
    },
  });
}
