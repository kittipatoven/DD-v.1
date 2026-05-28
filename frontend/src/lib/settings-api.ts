import api from './api';
import axios from 'axios';

export interface Setting {
  id: number;
  key_name: string;
  value: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface SettingUpdate {
  key: string;
  value: string;
}

export const settingsApi = {
  // Public endpoint - no auth required for LINE integration
  getPublic: async (): Promise<Record<string, string>> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    // Ensure /api/v1 is included
    const baseURL = API_URL.endsWith('/api/v1') ? API_URL : `${API_URL}/api/v1`;
    const fullUrl = `${baseURL}/settings/public`;
    console.log('[SettingsAPI] Fetching from:', fullUrl);
    console.log('[SettingsAPI] Current window.location:', typeof window !== 'undefined' ? window.location.href : 'SSR');

    try {
      const response = await axios.get(fullUrl, { timeout: 5000 });
      console.log('[SettingsAPI] Response status:', response.status);
      console.log('[SettingsAPI] Response data:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[SettingsAPI] Error fetching settings:', error.message);
      console.error('[SettingsAPI] Error status:', error.response?.status);
      console.error('[SettingsAPI] Full URL that failed:', fullUrl);

      // Return empty object as fallback
      return {};
    }
  },

  getAll: async (): Promise<Setting[]> => {
    const response = await api.get('/settings');
    return response.data;
  },

  getAsObject: async (): Promise<Record<string, string>> => {
    const response = await api.get('/settings/object');
    return response.data;
  },

  update: async (data: SettingUpdate[]): Promise<{ success: boolean }> => {
    const response = await api.post('/settings', data);
    return response.data;
  },
};
