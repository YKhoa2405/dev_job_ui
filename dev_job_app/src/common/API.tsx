import axios from 'axios';

const HOST = 'http://localhost:3000';

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

    // skills
    'skills': '/skills',
    'skillsDetail': (skillId: string) => `/skills/${skillId}`,


    //services
    'services': '/services',
    'servicesDetail': (serviceId: string) => `/services/${serviceId}`,

    // company
    'companies': '/companies',
    'companiesDetail': (companyId: string) => `/companies/${companyId}`,


    // jobs
    'jobs': '/jobs',
    'jobDetail': (jobId: string) => `/jobs/${jobId}`,


    // roles
    'roles': 'roles',
    // permissions
    'permissions': 'permission',
    'permissionsDetail': (permissionId: string) => `/permission/${permissionId}`,



    // resume
    'resume': 'applications',
    'resumeDetail': (resumeId: string) => `/applications/${resumeId}`,






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