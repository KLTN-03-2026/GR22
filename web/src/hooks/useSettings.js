import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useSmtpSettings = () => {
  return useQuery({
    queryKey: ['smtp-settings'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/api/settings/smtp`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    }
  });
};

export const useUpdateSmtpSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings) => {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(`${API_URL}/api/settings/smtp`, settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smtp-settings'] });
    }
  });
};
