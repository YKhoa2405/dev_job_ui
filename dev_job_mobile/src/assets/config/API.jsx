import axios from 'axios';

// const HOST = 'http://localhost:3000';
const HOST = 'http://192.168.1.120:8000';


export const endpoints = {
    // auths
    'login': '/auth/login',
    'loginGoogle': '/auth/google/',
    // users
    'users': '/users',
    'listUsers': '/users/allUser',
    'userDetail': (userId) => `/users/${userId}`,
    'changePassword': '/users/changePassword',
    'sendCode': '/users/sendCode',
    'verify': '/users/verify',
    'registerUser': '/users/register',

    // skills
    'skills': '/skills',
    'skillsDetail': (skillId) => `/skills/${skillId}`,

    // subscribers
    'subscribers': '/subscribers',
    'subscribersDetail': (subId) => `/subscribers/${subId}`,

    //services
    'services': '/services',
    'servicesDetail': (serviceId) => `/services/${serviceId}`,
    'paymentUrl': '/payments/create',
    'paymentSave': '/payments/save',
    'paymentByCompany': (companyId) => `/payments/${companyId}`,

    // order
    'order': '/orders',
    'orderByCompany': (companyId) => `/orders/${companyId}`,


    // company
    'companies': '/companies',
    'companyByUser': '/companies/user',
    'companiesDetail': (companyId) => `/companies/${companyId}`,

    // follow
    'follows': '/follows',

    // jobs
    'jobs': '/jobs',
    'jobsByClient': '/jobs/client',

    'jobsNearBy': (latitude, longitude, distance) => `http://192.168.1.120:8000/jobs/nearby?latitude=${latitude}&longitude=${longitude}&radius=${distance}`,
    'jobsByCompany': (companyId) => `/jobs/${companyId}/jobs`,
    'jobDetail': (jobId) => `/jobs/${jobId}`,

    // save-job
    'saveJob': '/save-job',
    'saveJobDetail': (id) => `/save-job/${id}`,
    'deleteAllSaveJob': '/save-job/clearAll',
    'checkSavedJob': (jobId) => `/save-job/check/${jobId}`,

    // roles
    'roles': 'roles',
    // permissions
    'permissions': 'permission',
    'permissionsDetail': (permissionId) => `/permission/${permissionId}`,

    // resume
    'resume': 'applications',
    'resumeDetail': (resumeId) => `/applications/${resumeId}`,
    'resumeApply': '/applications/apply',
    'resumeByCompany': (companyId) => `/applications/byCompany/${companyId}`,
    'resumeByJob': (jobId) => `/applications/byJob/${jobId}`,


    // cv
    'uploadCV': '/cv/upload',
    'cvByUser': (userId) => `/cv/${userId}`

};

export const authApi = (accessToken) => {
    return axios.create({
        baseURL: HOST,
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
};

// Default axios instance
export default axios.create({
    baseURL: HOST,
});