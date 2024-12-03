// features/cvSlice.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { authApi, endpoints } from '../../assets/config/API';

// Thunk để fetch CV
export const fetchListCvByUser = createAsyncThunk('cv/fetchListCvByUser', async (userId, thunkAPI) => {
    try {
        const token = await AsyncStorage.getItem("access_token"); 
        const response = await authApi(token).get(endpoints['cvByUser'](userId));
        return response.data.data; // Trả về dữ liệu từ API
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response); // Trả về lỗi
    }
});


const cvSlice = createSlice({
    name: 'cv',
    initialState: {
        cvData: null,
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchListCvByUser.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchListCvByUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.cvData = action.payload; // Cập nhật dữ liệu từ API
            })
    },
});


export default cvSlice.reducer;
