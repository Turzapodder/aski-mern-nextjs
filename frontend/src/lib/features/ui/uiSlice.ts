import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  isSidebarOpen: boolean;
  isMobileMenuOpen: boolean;
  globalModal: {
    isOpen: boolean;
    type: string | null;
    data: any | null;
  };
}

const initialState: UIState = {
  isSidebarOpen: true,
  isMobileMenuOpen: false,
  globalModal: {
    isOpen: false,
    type: null,
    data: null,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isSidebarOpen = action.payload;
    },
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.isMobileMenuOpen = action.payload;
    },
    openModal: (
      state,
      action: PayloadAction<{ type: string; data?: any }>
    ) => {
      state.globalModal.isOpen = true;
      state.globalModal.type = action.payload.type;
      state.globalModal.data = action.payload.data || null;
    },
    closeModal: (state) => {
      state.globalModal.isOpen = false;
      state.globalModal.type = null;
      state.globalModal.data = null;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleMobileMenu,
  setMobileMenuOpen,
  openModal,
  closeModal,
} = uiSlice.actions;

export default uiSlice.reducer;
