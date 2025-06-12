import axios from 'axios';

const HOST = 'http://192.168.1.120:8000';
// const HOST = 'https://devjob-yo64.onrender.com';




export const endpoints = {
    // 
    'scanCV': 'http://192.168.1.120:8001/apip/extract',
    'recommend': 'http://192.168.1.120:8001/apip/recommend',
    // auths
    'login': '/auth/login',
    'githubCallback': (code) => `/auth/github/callback?code=${code}`,
    // users
    'users': '/users',
    'listUsers': '/users/allUser',
    'userDetail': (userId) => `/users/${userId}`,
    'changePassword': '/users/changePassword',
    'sendCode': '/users/sendCode',
    'verify': '/users/verify',
    'registerUser': '/users/register',
    'uploadChat': '/files/uploadChat',
    'saveFcmToken': '/users/saveFcmToken',

    // skills
    'skills': '/skills',
    'skillsDetail': (skillId) => `/skills/${skillId}`,

    // subscribers
    'subscribers': '/subscribers',
    'subscribersUser': '/subscribers/user',
    'subscribersDetail': (subId) => `/subscribers/${subId}`,

    // suggestions
    'suggestions': '/suggestions',
    'popularSuggestions': '/suggestions/popular',

    // search history
    'searchHistory': '/search-history',
    'deleteSearchHistory': '/search-history/all',

    //services
    'services': '/services',
    'servicesDetail': (serviceId) => `/services/${serviceId}`,
    'paymentUrl': '/payments/create',
    'paymentSave': '/payments/save',
    'paymentByCompany': (companyId) => `/payments/${companyId}`,
    'paymentRefunt': '/payments/refund',

    // order
    'order': '/orders',
    'orderDetailByCompany': (companyId, serviceId) => `/orders/${companyId}/service/${serviceId}/detail`,
    'orderByCompany': (companyId) => `/orders/${companyId}`,

    // company
    'companies': '/companies',
    'companyByUser': '/companies/user',
    'companiesDetail': (companyId) => `/companies/${companyId}`,

    // reviews
    'reviews': '/reviews',
    'reviewsCompany': (companyId) => `/reviews/company/${companyId}`,
    'deleteReview': (reviewId) => `/reviews/${reviewId}`,

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
    'jobsNearBy': '/jobs/nearby',
    // 'jobsNearBy': (latitude, longitude, distance) => `/jobs/nearby?latitude=${latitude}&longitude=${longitude}&radius=${distance}`,
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
    'chatUploadFile': '/chat/upload',
    'chatbot': 'chat/chatbot',




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