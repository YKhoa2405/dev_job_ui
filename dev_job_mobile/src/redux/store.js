import { configureStore } from '@reduxjs/toolkit'
import userSlice from './slice/userSlice'
import companySlice from './slice/companySlice'
import cvSLice from './slice/cvSLice'
import jobSlice from './slice/jobSlice'
import saveJobSlice from './slice/saveJobSlice'
import resumeSlice from './slice/resumeSlice'




export const store = configureStore({
    reducer: {
        user: userSlice,
        company: companySlice,
        cv: cvSLice,
        job: jobSlice,
        saveJob: saveJobSlice,
        resume: resumeSlice,

    },
})