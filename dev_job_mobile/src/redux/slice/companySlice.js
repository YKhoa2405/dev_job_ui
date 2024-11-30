import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API, { endpoints } from "../../assets/config/API";

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

const companySlice = createSlice({
    name: "company",
    initialState: {
        companies: [], // Danh sách công ty
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
    },
});

export default companySlice.reducer;