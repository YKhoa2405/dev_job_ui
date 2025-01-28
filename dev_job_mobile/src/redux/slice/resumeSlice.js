import { createSlice } from '@reduxjs/toolkit';

const resumeSlice = createSlice({
    name: 'resume',
    initialState: {
        experiences: [],
        educations: [],
        projects: [],
        skills: [],
        personalInfo: {},
    },
    reducers: {
        addExperience: (state, action) => {
            state.experiences.push(action.payload);
        },
        addProject: (state, action) => {
            state.projects.push(action.payload);
        },
        addEducation: (state, action) => {
            state.educations.push(action.payload);
        },
        deleteEducation: (state, action) => {
            state.educations = state.educations.filter(education => education.id !== action.payload.id);
        },
        addSkill: (state, action) => {
            state.skills.push(action.payload);
        },
        deleteSkill: (state, action) => {
            state.skills = state.skills.filter(skill => skill.id !== action.payload.id);
        },
        addPersonalInfo: (state, action) => {
            state.personalInfo = action.payload;
        },
    },
});

// Export actions để sử dụng
export const { addExperience, addProject, addEducation, addPersonalInfo, addSkill, deleteEducation } = resumeSlice.actions;

// Export reducer để thêm vào store
export default resumeSlice.reducer;
