import axios from "axios";

// const HOST = "https:/ykhoa2405.pythonanywhere.com"
const HOST = "http://192.168.1.120:8000"


export const endpoints = {
    // user
    'users': '/users/',
    'login': '/o/token/',
    'current_user': '/users/current_user/',
    'update_seeker': '/users/update_seeker/',
    'update_employer': '/users/update_employer/',
    'employer_detail': (userId) => `/users/${userId}/employer_detail/`,
    'follow': (userId) => `/users/${userId}/follow/`,
    'unfollow': (userId) => `/users/${userId}/unfollow/`,
    'following_list': '/users/following/',
    'send_otp': '/users/send_otp/',
    'reset-password': '/users/reset-password/',
    'statistics': '/statistics/',
    'job_application_statis': '/statistics/applications_per_month/',



    //job
    'jobs': '/jobs/',
    'jobs_detail': (jobId) => `/jobs/${jobId}/`,
    'job_employer_current': '/jobs/employer_jobs/',
    'job_by_employer': (employerId) => `/jobs/${employerId}/jobs_by_employer/`,
    'job_recommned': '/jobs/recommend/',
    'job_salary': '/jobs/high_salary/',
    'job_nearby': (latitude, longitude, distance) => `/jobs/nearby/?latitude=${latitude}&longitude=${longitude}&distance=${distance}`,



    // save job
    'save_job': '/save_job/',
    'unsave_job': (jobId) => `/save_job/${jobId}/`,
    //services
    'services_list': '/services/',
    'services_detail': (serviceId) => `/services/${serviceId}/`,

    'purchase': (serviceId) => `/services/${serviceId}/purchase/`,
    'purchased_services': '/services/purchased_services/',

    // technology
    'technology': '/technology/',

    // aplly
    'apply_list': '/apply/employer_apply/',
    'apply_list_new': '/apply/employer_apply_new/',
    'apply_list_seeker': '/apply/seeker_apply/',
    'apply': (jobId) => `/apply/${jobId}/apply_job/`,
    // 'apply_detail': (applyId) => `/apply/${applyId}/apply_detail/`,
    'apply_update_status': (applyId) => `/apply/${applyId}/`,
    // vn pay
    'vnpay_post': '/vnpay/payment_url/',

    // Lấy tỉnh thành
    'province': 'https://esgoo.net/api-tinhthanh/1/0.htm',

}

export const authApi = (accessToken) => {
    return axios.create({
        baseURL: HOST,
        headers: {
            Authorization: `Bearer ${accessToken}`,
        }
    })
}

export default axios.create({
    baseURL: HOST
})
