import api from '../utils/api';
import { type ICategory } from '../types';

export const categoryService = {
  getCategories: async (): Promise<ICategory[]> => {
    const response = await api.get('/categories');
    return response.data.data;
  },

  getCategory: async (id: string): Promise<ICategory> => {
    const response = await api.get(`/categories/${id}`);
    return response.data.data;
  },

  createCategory: async (data: Partial<ICategory>): Promise<ICategory> => {
    const response = await api.post('/categories', data);
    return response.data.data;
  },

  updateCategory: async (id: string, data: Partial<ICategory>): Promise<ICategory> => {
    const response = await api.patch(`/categories/${id}`, data);
    return response.data.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};
