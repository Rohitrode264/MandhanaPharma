import api from '../utils/api';
import { type IProduct, ProductStatus } from '../types';

export const productService = {
  getProducts: async (): Promise<IProduct[]> => {
    const response = await api.get('/products');
    return response.data.data.products;
  },

  getProduct: async (id: string): Promise<IProduct> => {
    const response = await api.get(`/products/${id}`);
    return response.data.data;
  },

  createProduct: async (data: Partial<IProduct>): Promise<IProduct> => {
    const response = await api.post('/products', data);
    return response.data.data;
  },

  updateProduct: async (id: string, data: Partial<IProduct>): Promise<IProduct> => {
    const response = await api.patch(`/products/${id}`, data);
    return response.data.data;
  },

  changeProductStatus: async (id: string, status: ProductStatus): Promise<IProduct> => {
    const response = await api.patch(`/products/${id}/status`, { status });
    return response.data.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};
