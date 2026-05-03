// Module: hooks/useCV.js - Quản lý logic hệ thống
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// Safely parse JSON fields from DB
const safeArray = (val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') { try { const p = JSON.parse(val); return Array.isArray(p) ? p : []; } catch { return []; } }
  return [];
};
const safeObj = (val) => {
  if (val && typeof val === 'object' && !Array.isArray(val)) return val;
  if (typeof val === 'string') { try { const p = JSON.parse(val); return (p && typeof p === 'object' && !Array.isArray(p)) ? p : {}; } catch { return {}; } }
  return {};
};

const normalizeCV = (cv) => ({
  ...cv,
  experience: safeArray(cv?.experience),
  education: safeArray(cv?.education),
  projects: safeArray(cv?.projects),
  skills: safeObj(cv?.skills),
});

// List all CVs
export const useCVList = () => {
  return useQuery({
    queryKey: ['cv-list'],
    queryFn: async () => {
      const { data } = await api.get('/cv');
      return data;
    },
  });
};

// Get single CV
export const useCV = (id) => {
  return useQuery({
    queryKey: ['cv', id],
    queryFn: async () => {
      const { data } = await api.get(`/cv/${id}`);
      return normalizeCV(data);
    },
    enabled: !!id,
  });
};

// Create new CV
export const useCreateCV = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (cvData) => {
      const { data } = await api.post('/cv', cvData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cv-list'] });
    },
  });
};

// Update CV
export const useUpdateCV = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...cvData }) => {
      const { data } = await api.put(`/cv/${id}`, cvData);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cv-list'] });
      queryClient.invalidateQueries({ queryKey: ['cv', variables.id] });
    },
  });
};

// Delete CV
export const useDeleteCV = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.delete(`/cv/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cv-list'] });
    },
  });
};

// Extract CV from PDF (returns JSON, doesn't save)
export const useExtractCV = () => {
  return useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/cv/extract', formData);
      return data;
    },
  });
};

// Evaluate CV with AI
export const useEvaluateCV = () => {
  return useMutation({
    mutationFn: async ({ profileId, ...cvData }) => {
      const { data } = await api.post(`/cv/evaluate${profileId ? `?profileId=${profileId}` : ''}`, cvData);
      return data;
    },
  });
};

// Get Evaluation History
export const useEvaluationHistory = (profileId) => {
  return useQuery({
    queryKey: ['cv-evaluation-history', profileId],
    queryFn: async () => {
      const { data } = await api.get(`/cv/history/${profileId}`);
      return data;
    },
    enabled: !!profileId,
  });
};

// Get Job Recommendations for a CV
export const useRecommendations = (cvId) => {
  return useQuery({
    queryKey: ['job-recommendations', cvId],
    queryFn: async () => {
      const { data } = await api.get(`/recommend/jobs/${cvId}`);
      return data;
    },
    enabled: !!cvId,
  });
};

// Git update: Triggering change for push
