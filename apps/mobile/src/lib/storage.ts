import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV({ id: 'fillinked' });

export const cache = {
  get: <T>(key: string): T | null => {
    const raw = storage.getString(key);
    return raw ? (JSON.parse(raw) as T) : null;
  },
  set: (key: string, value: unknown) => storage.set(key, JSON.stringify(value)),
  delete: (key: string) => storage.delete(key),
};
