import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export const useSkills = () => {
  return useQuery({
    queryKey: ['skills'],
    queryFn: async () => {
      const { data } = await api.get('/admin/skills');
      return data;
    },
  });
};
