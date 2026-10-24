import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentUser: null,
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.isAuthenticated = true;
    },
    updateProfileSuccess: (state, action) => {
      // Merge updated profile data safely without resetting auth
      state.currentUser = {
        ...state.currentUser,
        ...action.payload
      };
    },
    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
    },
  },
});

export const { loginSuccess, updateProfileSuccess, logout } = userSlice.actions;

export default userSlice.reducer;
