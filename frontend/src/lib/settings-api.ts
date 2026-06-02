import api from './api';
import { getApiBaseUrl } from '@/lib/env';

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
  getPublic: async (): Promise<Record<string, string>> => {
    try {
      const response = await api.get('/settings/public', { timeout: 5000 });
      return response.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(
        `[SettingsAPI] Failed to load public settings from ${getApiBaseUrl()}:`,
        message
      );
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
