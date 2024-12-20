import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi, endpoints } from '../../assets/config/API';

// API call để kiểm tra công việc đã lưu hay chưa
export const checkSavedJob = createAsyncThunk(
  'saveJob/checkSavedJob',
  async (jobId, thunkAPI) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await authApi(token).get(endpoints['checkSavedJob'](jobId));
      return { jobId, isSaved: response.data.isSaved };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response);
    }
  }
);

// API call để lưu hoặc xóa công việc
export const saveJob = createAsyncThunk(
  'saveJob/saveJob',
  async ({ jobId }, thunkAPI) => {
    try {
      const token = await AsyncStorage.getItem('access_token');

      // Kiểm tra xem công việc đã lưu chưa
      const checkResponse = await authApi(token).get(endpoints['checkSavedJob'](jobId));
      if (checkResponse.data.isSaved) {
        // Nếu công việc đã lưu, xóa
        await authApi(token).delete(endpoints['saveJobDetail'](jobId));
        return { jobId, isSaved: false };  // Trả về dữ liệu đã xóa
      } else {
        // Nếu chưa lưu, lưu công việc
        await authApi(token).post(endpoints['saveJob'], { jobId });
        return { jobId, isSaved: true };  // Trả về dữ liệu đã lưu
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response);
    }
  }
);

const saveJobSlice = createSlice({
  name: 'saveJob',
  initialState: {
    savedJobs: {},  // Lưu trạng thái các công việc đã lưu (jobId => isSaved)
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Kiểm tra trạng thái lưu công việc
      .addCase(checkSavedJob.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(checkSavedJob.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.savedJobs[action.payload.jobId] = action.payload.isSaved;
      })
      .addCase(checkSavedJob.rejected, (state, action) => {
        state.status = 'failed';
        console.error(action.payload);  // Log lỗi nếu có
      })
      // Lưu hoặc xóa công việc
      .addCase(saveJob.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(saveJob.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.savedJobs[action.payload.jobId] = action.payload.isSaved;
      })
      .addCase(saveJob.rejected, (state, action) => {
        state.status = 'failed';
        console.error(action.payload);  // Log lỗi nếu có
      });
  },
});

export default saveJobSlice.reducer;
