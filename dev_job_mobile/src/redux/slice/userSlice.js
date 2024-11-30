import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,         // Lưu thông tin người dùng
    isAuthenticated: false, // Kiểm tra trạng thái đăng nhập
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        loginSuccess: (state, action) => {
            state.user = action.payload.user;
        },
        logout: (state) => {
            state.user = null;
        },
    },
});

export const { loginSuccess, logout } = userSlice.actions;

export default userSlice.reducer;
