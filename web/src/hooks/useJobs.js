import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useJobs = (params = {}) => {
  return useQuery({
    queryKey: ['jobs', params],
    queryFn: async () => {
      const { data } = await api.get('/jobs', { params });
      return data;
    },
  });
};

export const useJobById = (id) => {
  return useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      const { data } = await api.get(`/jobs/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useRelatedJobs = (id) => {
  return useQuery({
    queryKey: ['related-jobs', id],
    queryFn: async () => {
      const { data } = await api.get(`/jobs/${id}/related`);
      return data;
    },
    enabled: !!id,
  });
};

export const useRecruiterJobs = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return useQuery({
    queryKey: ['recruiter-jobs', user.id],
    queryFn: async () => {
      const { data } = await api.get('/jobs/recruiter');
      return data;
    },
    enabled: !!user.id,
  });
};

export const usePostJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (jobData) => {
      const { data } = await api.post('/jobs', jobData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiter-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};

export const useUpdateJob = (id) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (jobData) => {
      const { data } = await api.put(`/jobs/${id}`, jobData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiter-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job', id] });
    },
  });
};

export const useUpdateJobStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }) => {
      const { data } = await api.put(`/jobs/${id}`, { status });
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recruiter-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job', variables.id] });
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.delete(`/jobs/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiter-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};
