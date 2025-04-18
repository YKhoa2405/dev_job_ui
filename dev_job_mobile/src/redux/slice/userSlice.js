import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState = {
  user: null,
  isAuthenticated: false,
  fcmToken: null, // Thêm trường để lưu FCM token
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
      state.fcmToken = null; // Xóa FCM token khi đăng xuất
      AsyncStorage.removeItem('access_token'); // Xóa access_token
    },
    setFcmToken: (state, action) => {
      state.fcmToken = action.payload; // Lưu FCM token
    },
  },
});

export const { loginSuccess, logout, setFcmToken } = userSlice.actions;

export default userSlice.reducer;