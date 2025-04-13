import axios from 'axios';

// const HOST = 'http://localhost:3000';
const HOST = 'http://192.168.1.120:8000';
// const HOST = 'http://192.168.1.4:8000';





export const endpoints = {
    // 
    'scanCV': 'http://192.168.1.120:8001/apip/extract',
    'recommend': 'http://192.168.1.120:8001/apip/recommend',
    // auths
    'login': '/auth/login',
    'github': '/auth/github/',
    'githubCallback': '/auth/github/callback',
    // users
    'users': '/users',
    'listUsers': '/users/allUser',
    'userDetail': (userId) => `/users/${userId}`,
    'changePassword': '/users/changePassword',
    'sendCode': '/users/sendCode',
    'verify': '/users/verify',
    'registerUser': '/users/register',
    'uploadChat': '/files/uploadChat',

    // skills
    'skills': '/skills',
    'skillsDetail': (skillId) => `/skills/${skillId}`,

    // subscribers
    'subscribers': '/subscribers',
    'subscribersDetail': (subId) => `/subscribers/${subId}`,

    // suggestions
    'suggestions': '/suggestions',
    'popularSuggestions': '/suggestions/popular',

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

    //candidates

    'candidates': '/candidates',
    'candidateDetail': (candidateId) => `/candidates/${candidateId}`,

    // follow
    'follows': '/follows',
    'followDetail': (companyId) => `/follows/${companyId}`,
    'followSaved': (companyId) => `/follows/${companyId}/isSaved`,

    // jobs
    'jobs': '/jobs',
    'jobsSearchKey': '/jobs/searchkey',
    'jobsNearBy': (latitude, longitude, distance) => `http://192.168.1.120:8000/jobs/nearby?latitude=${latitude}&longitude=${longitude}&radius=${distance}`,
    'jobsByCompany': (companyId) => `/jobs/${companyId}/jobs`,
    'jobDetail': (jobId) => `/jobs/${jobId}`,

    // report job
    'reportJob': '/reports',

    // save-job
    'saveJob': '/save-job',
    'saveJobDetail': (id) => `/save-job/${id}`,
    'deleteAllSaveJob': '/save-job/clearAll',
    'checkSavedJob': (jobId) => `/save-job/check-saved/${jobId}`,

    // roles
    'roles': 'roles',
    // permissions
    'permissions': 'permission',
    'permissionsDetail': (permissionId) => `/permission/${permissionId}`,

    // resume
    'resume': 'applications',
    'resumeDetail': (resumeId) => `/applications/${resumeId}`,
    'resumeApply': '/applications/apply', // apply job
    'resumeByCandidate': '/applications/candidate',
    'resumeByJob': (jobId) => `/applications/byJob/${jobId}`,

    // Notification
    'notificationsByUser': (userId) => `/notifications/${userId}`,
    'notification': '/notifications',
    'notificationDetail': (notificationId) => `/notifications/${notificationId}`,
    // cv
    'uploadCV': '/cv/upload',
    'cvDetail': (cvId) => `/cv/${cvId}`,
    'cvByUser': (userId) => `/cv/${userId}`,

    // statistic
    'statistic': (type) => `/statistics/${type}`,

    // Chat
    'getMessages': (senderId, recipientId) => `/chat/messages?senderId=${senderId}&recipientId=${recipientId}`,
    'chatRooms': (currentUserId) => `/chat/rooms?userId=${currentUserId}`,
    'chatUploadFile': '/chat/upload'




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