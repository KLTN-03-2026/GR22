import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useJobApplications = (jobId) => {
  return useQuery({
    queryKey: ['job-applications', jobId],
    queryFn: async () => {
      const { data } = await api.get(`/applications/job/${jobId}`);
      return data;
    },
    enabled: !!jobId,
  });
};

export const useUpdateApplicationStatus = (jobId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }) => {
      const { data } = await api.put(`/applications/${id}/status`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications', jobId] });
    },
  });
};

export const useApplyToJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ jobId, profileId }) => {
      const { data } = await api.post('/applications', { jobId, profileId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
    },
  });
};

export const useMyApplications = () => {
  return useQuery({
    queryKey: ['my-applications'],
    queryFn: async () => {
      const { data } = await api.get('/applications/my');
      return data;
    },
  });
};

export const useSendAcceptanceEmail = () => {
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.post(`/applications/${id}/send-acceptance-email`);
      return data;
    },
  });
};

export const useAnalyzeApplications = (jobId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/applications/analyze/${jobId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications', jobId] });
    },
  });
};
