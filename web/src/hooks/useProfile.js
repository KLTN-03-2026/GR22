import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useUser = () => {
  return useQuery({
    queryKey: ['user-info'],
    queryFn: async () => {
      const { data } = await api.get('/user/me');
      return data;
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userData) => {
      const { data } = await api.put('/user/me', userData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-info'] });
    },
  });
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/user/avatar', formData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-info'] });
    },
  });
};

export const useProfile = () => {
  return useQuery({
    queryKey: ['candidate-profile'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/cv/profile');
        return data;
      } catch (err) {
        if (err.response?.status === 404) return null;
        throw err;
      }
    },
  });
};

export const useUserCVs = () => {
  return useQuery({
    queryKey: ['user-cvs'],
    queryFn: async () => {
      const { data } = await api.get('/cv');
      return data;
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profileData) => {
      const { data } = await api.put('/cv/profile', profileData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate-profile'] });
    },
  });
};

export const useUploadCV = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/cv/upload', formData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate-profile'] });
    },
  });
};

export const useSuggestions = () => {
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.get('/cv/suggestions');
      return data;
    },
  });
};
