import api from './api';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
}

// Pure API functions only - NO store interaction
export const authApi = {
  login: async (dto: LoginDto): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', dto);
    return response.data;
  },

  register: async (dto: RegisterDto): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', dto);
    return response.data;
  },

  logout: async (): Promise<void> => {
    // Pure API call only - no store interaction
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Continue with local logout even if API call fails
      console.warn('Logout API call failed:', error);
    }
  },

  forgotPassword: async (dto: ForgotPasswordDto): Promise<{ message: string; resetLink?: string }> => {
    const response = await api.post<{ message: string; resetLink?: string }>('/auth/forgot-password', dto);
    return response.data;
  },

  resetPassword: async (dto: ResetPasswordDto): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/reset-password', dto);
    return response.data;
  },
};
