// features/cvSlice.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { authApi, endpoints } from '../../assets/config/API';

// Thunk để fetch danh sách CV của người dùng
export const fetchListCvByUser = createAsyncThunk('cv/fetchListCvByUser', async (userId, thunkAPI) => {
    try {
        const token = await AsyncStorage.getItem("access_token"); 
        const response = await authApi(token).get(endpoints['cvByUser'](userId));
        return response.data.data; // Trả về dữ liệu từ API
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response); // Trả về lỗi
    }
});

// Thunk để fetch CV chính (isPrimary = true)
export const fetchPrimaryCvByUser = createAsyncThunk('cv/fetchPrimaryCvByUser', async (userId, thunkAPI) => {
    try {
        const token = await AsyncStorage.getItem("access_token"); 
        const response = await authApi(token).get(endpoints['cvByUser'](userId));
        const cvList = response.data.data; // Lấy danh sách CV từ API
        const primaryCv = cvList.find(cv => cv.isPrimary === true); // Lọc CV có isPrimary = true
        if (!primaryCv) {
            return thunkAPI.rejectWithValue({ message: "No primary CV found" });
        }
        return primaryCv; // Trả về CV chính
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response); // Trả về lỗi nếu có
    }
});

const cvSlice = createSlice({
    name: 'cv',
    initialState: {
        cvData: null,
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        primaryCv: null, // Thêm state để lưu CV chính
        primaryStatus: 'idle', // Trạng thái riêng cho CV chính
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Xử lý fetchListCvByUser
            .addCase(fetchListCvByUser.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchListCvByUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.cvData = action.payload; // Cập nhật danh sách CV
            })
            .addCase(fetchListCvByUser.rejected, (state, action) => {
                state.status = 'failed';
                state.cvData = null;
            })

            // Xử lý fetchPrimaryCvByUser
            .addCase(fetchPrimaryCvByUser.pending, (state) => {
                state.primaryStatus = 'loading';
            })
            .addCase(fetchPrimaryCvByUser.fulfilled, (state, action) => {
                state.primaryStatus = 'succeeded';
                state.primaryCv = action.payload; // Cập nhật CV chính
            })
            .addCase(fetchPrimaryCvByUser.rejected, (state, action) => {
                state.primaryStatus = 'failed';
                state.primaryCv = null;
            });
    },
});

export default cvSlice.reducer;