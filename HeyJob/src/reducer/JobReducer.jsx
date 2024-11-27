const initialState = {
    jobs: [],
    loading: true,
    error: null,
    totalItems: 0,
    next: null
};


const JobReducer = (state, action) => {
    switch (action.type) {
        case 'DELETE_JOB_SUCCESS':
            return {
                ...state,
                jobs: state.jobs.filter((job) => job.id !== action.payload),
            };
        case 'UPDATE_ACTIVE_JOBS':
            return {
                ...state,
                jobs: state.jobs.map((job) =>
                    job.id === action.payload ? { ...job, is_active: false } : job
                ),
            };
        case 'UNSAVE_JOB_SUCCESS':
            return {
                ...state,
                jobs: state.jobs.filter((job) => job.job.id !== action.payload),
            };
        // case 'SAVE_JOB_SUCCESS':
        //     return {
        //         ...state,
        //         jobs: state.jobs.some(job => job.id === action.payload.id)
        //             ? state.jobs
        //             : [...state.jobs, action.payload],
        //     };
        case 'SAVE_JOB_SUCCESS':
            return {
                ...state,
                jobs: state.jobs.map(job =>
                    job.id === action.payload.job_id
                        ? { ...job, is_saved: true }
                        : job
                ),
            };
        case 'FETCH_JOBS_REQUEST': // Bắt đầu tải công việc
            return {
                ...state,
                loading: true,
                error: null, // Reset lỗi khi bắt đầu tải
            };
        case 'FETCH_JOBS_SUCCESS':
            return {
                ...state,
                loading: false,
                jobs: action.payload.page === 1
                    ? action.payload.jobs
                    : [...state.jobs, ...action.payload.jobs], // Nếu page 1 thì thay thế, nếu không thì nối vào danh sách
                totalItems: action.payload.totalItems,
                next: action.payload.next,
            };
        case 'FETCH_JOBS_FAILURE': // Xảy ra lỗi khi tải
            return {
                ...state,
                loading: false,
                error: action.payload, // Lưu thông tin lỗi
            };
        default:
            return state;
    }
};




export { initialState }
export default JobReducer