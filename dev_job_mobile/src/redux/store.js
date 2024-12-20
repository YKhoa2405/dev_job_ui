import { configureStore } from '@reduxjs/toolkit'
import userSlice from './slice/userSlice'
import companySlice from './slice/companySlice'
import cvSLice from './slice/cvSLice'
import jobSlice from './slice/jobSlice'
import saveJobSlice from './slice/saveJobSlice'




export const store = configureStore({
    reducer: {
        user: userSlice,
        company: companySlice,
        cv: cvSLice,
        job: jobSlice,
        saveJob: saveJobSlice,
    },
})