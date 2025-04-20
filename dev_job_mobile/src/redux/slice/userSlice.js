import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState = {
  user: null,
  isAuthenticated: false,
  fcmToken: null, // Lưu FCM Token
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    setFcmToken: (state, action) => {
      state.fcmToken = action.payload; // Lưu FCM Token
    },
  },
});

export const { loginSuccess, logout, setFcmToken } = userSlice.actions;

// Thunk để xử lý logout bất đồng bộ
export const logoutAsync = () => async (dispatch) => {
  try {
    await AsyncStorage.removeItem('access_token');
    dispatch(logout());
  } catch (error) {
    console.error('Error removing access token:', error);
  }
};

export default userSlice.reducer;