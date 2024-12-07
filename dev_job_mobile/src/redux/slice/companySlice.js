import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API, { authApi, endpoints } from "../../assets/config/API";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const fetchListCompany = createAsyncThunk(
    "company/fetchCompanies",
    async (params) => {
        try {
            const res = await API.get(endpoints['companies'], { params })
            return res.data.data
        } catch (error) {
            console.log(error)
        }
    }
)

export const fetchCompanyByUser = createAsyncThunk(
    "company/fetchCompanyByUser",
    async () => {
        try {
            const token = await AsyncStorage.getItem("access_token");
            const res = await authApi(token).get(endpoints['companyByUser'])
            return res.data.data
        } catch (error) {
            console.log(error)
        }
    }
)

const companySlice = createSlice({
    name: "company",
    initialState: {
        companies: [], // Danh sách công ty
        companyByUser: null, // Company info for the current user
        loading: false, // Trạng thái tải dữ liệu
    },
    reducers: {}, // Không có reducers custom
    extraReducers: (builder) => {
        builder
            .addCase(fetchListCompany.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchListCompany.fulfilled, (state, action) => {
                state.loading = false;
                state.companies = action.payload.result; // Dữ liệu các công ty
                state.meta = action.payload.meta; // Dữ liệu phân trang
            })
            .addCase(fetchCompanyByUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCompanyByUser.fulfilled, (state, action) => {
                state.loading = false;
                state.companyByUser = action.payload; // Company info of the logged-in user
            })
    },
});

export default companySlice.reducer;