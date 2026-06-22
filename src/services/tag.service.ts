import api from '../utils/api';
import { type ITag } from '../types';

export const tagService = {
  getTags: async (): Promise<ITag[]> => {
    const response = await api.get('/tags');
    return response.data.data;
  },

  getTag: async (id: string): Promise<ITag> => {
    const response = await api.get(`/tags/${id}`);
    return response.data.data;
  },

  createTag: async (data: Partial<ITag>): Promise<ITag> => {
    const response = await api.post('/tags', data);
    return response.data.data;
  },

  updateTag: async (id: string, data: Partial<ITag>): Promise<ITag> => {
    const response = await api.patch(`/tags/${id}`, data);
    return response.data.data;
  },

  deleteTag: async (id: string): Promise<void> => {
    await api.delete(`/tags/${id}`);
  },
};
