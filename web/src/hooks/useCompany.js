import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// Public: list all companies
export const useCompanies = () => {
  return useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data } = await api.get('/company');
      return data;
    },
  });
};

// Public: single company by ID
export const useCompanyDetail = (id) => {
  return useQuery({
    queryKey: ['company', id],
    queryFn: async () => {
      const { data } = await api.get(`/company/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

// Recruiter: get own company (no ID needed)
// Also exported as useCompany for backward compatibility with CompanyProfile
export const useCompany = (id) => {
  // If id is provided, fetch public company detail
  if (id) {
    return useCompanyDetail(id);
  }
  // If no id, fetch recruiter's own company
  return useQuery({
    queryKey: ['my-company'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/company/my-company');
        return data;
      } catch (err) {
        if (err.response?.status === 404) return null;
        throw err;
      }
    },
  });
};

// Recruiter: update company (supports FormData for logo upload)
export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData) => {
      const { data } = await api.post('/company/my-company', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-company'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
};
