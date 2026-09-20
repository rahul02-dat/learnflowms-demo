import { create } from 'zustand';

interface CourseState {
  sidebarOpen: boolean;
  distractionFree: boolean;
  toggleSidebar: () => void;
  setDistractionFree: (value: boolean) => void;
}

export const useCourseStore = create<CourseState>((set) => ({
  sidebarOpen: true,
  distractionFree: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setDistractionFree: (value) => set({ distractionFree: value, sidebarOpen: !value }),
}));
