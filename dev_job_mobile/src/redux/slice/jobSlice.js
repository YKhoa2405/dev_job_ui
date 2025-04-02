
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { authApi, endpoints } from '../../assets/config/API';

export const fetchJobDetail = createAsyncThunk('job/fetchJobDetail', async (jobId, thunkAPI) => {
    try {
        const token = await AsyncStorage.getItem("access_token");
        const response = await authApi(token).get(endpoints['jobDetail'](jobId));
        return response.data.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response);
    }
});


const jobSlice = createSlice({
    name: 'job',
    initialState: {
        jobDetail: null,
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchJobDetail.pending, (state) => {
                state.status = 'loading'; // Đang tải dữ liệu
            })
            .addCase(fetchJobDetail.fulfilled, (state, action) => {
                state.status = 'succeeded'; // Dữ liệu đã được lấy thành công
                state.jobDetail = action.payload; // Lưu dữ liệu công việc vào state
            })
            .addCase(fetchJobDetail.rejected, (state, action) => {
                state.status = 'failed'; // Nếu thất bại, lưu trạng thái lỗi
                console.error(action.payload); // Log lỗi nếu cần
            });
    },
});

export default jobSlice.reducer;

