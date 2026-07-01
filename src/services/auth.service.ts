import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';
const authBase = `${API_URL}/auth`;

export interface ApiResponse<T = any> {
  status: number;
  data: T | null;
  message?: string;
}

export const forgotPassword = async (email: string): Promise<ApiResponse> => {
  const res = await axios.post<ApiResponse>(`${authBase}/forgot-password`, { email });
  return res.data;
};

export const resetPassword = async (token: string, password: string): Promise<ApiResponse<{ token?: string }>> => {
  const res = await axios.post<ApiResponse<{ token?: string }>>(
    `${authBase}/reset-password/${token}`,
    { password }
  );
  return res.data;
};
