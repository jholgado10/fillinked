import { create } from 'zustand';

interface NetworkState {
  connectionIds: string[];
  setConnectionIds: (ids: string[]) => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  connectionIds: [],
  setConnectionIds: (ids) => set({ connectionIds: ids }),
}));
