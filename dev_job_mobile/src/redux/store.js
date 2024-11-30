import { configureStore } from '@reduxjs/toolkit'
import userSlice from './slice/userSlice'
import companySlice from './slice/companySlice'


export const store = configureStore({
    reducer: {
        user: userSlice,
        company: companySlice
    },
})