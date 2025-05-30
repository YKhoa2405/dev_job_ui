import axios from 'axios';

const HOST = 'http://192.168.1.120:8000';
// const HOST = 'https://devjob-yo64.onrender.com';



export const endpoints = {
    // auths
    'login': '/auth/login',
    // users
    'users': '/users',
    'listUsers': '/users/allUser',
    'userDetail': (userId: string) => `/users/${userId}`,
    'changePassword': '/users/changePassword',
    'sendCode': '/users/sendCode',
    'verify': '/users/verify',
    'registerUser': '/users/register',

    // candidates
    'candidates': '/candidates',
    'candidatesAdmin': '/candidates/admin',
    'candidatesDetail': (candidateId: string) => `/candidates/${candidateId}`,

    // skills
    'skills': '/skills',
    'skillsDetail': (skillId: string) => `/skills/${skillId}`,


    //services
    'services': '/services',
    'servicesDetail': (serviceId: string) => `/services/${serviceId}`,

    // order
    'orders': '/orders',
    'ordersDetail': (orderId: string) => `/orders/${orderId}/detail`,
    'ordersByCompany': (companyId: string) => `/orders/${companyId}`,
    'orderSummary': '/orders/summary',

    // company
    'companies': '/companies',
    'companiesAdmin': '/companies/admin',

    'companiesDetail': (companyId: string) => `/companies/${companyId}`,


    // jobs
    'jobs': '/jobs',
    'jobsByCompany': (companyId: string) => `/jobs/${companyId}/jobs`,
    'jobDetail': (jobId: string) => `/jobs/${jobId}`,


    // roles
    'roles': 'roles',
    // permissions
    'permissions': 'permission',
    'permissionsDetail': (permissionId: string) => `/permission/${permissionId}`,

    // resume
    'resume': 'applications',
    'resumeDetail': (resumeId: string) => `/applications/${resumeId}`,

    // statistics
    'overViewAdmin': '/statistics/overview-admin',
    'analyticsAdmin': '/statistics/analytics-admin',

    // report
    'reportByJob': (jobId: string) => `/reports/job/${jobId}`,
    'reportDetail': (reportId: string) => `/reports/${reportId}`,

    // notifications
    'notifications': '/notifications',
    'notificationDetail': (notificationId: string) => `/notifications/${notificationId}`,
    'notificationCreateAdmin': '/notifications/group',
};

export const authApi = (accessToken: any) => {
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