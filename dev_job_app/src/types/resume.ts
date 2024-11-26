export type IResumeDetail = {
    _id: string;             
    email: string;        
    userId: string;
    jobId: {
        _id:string,
        name:string
    };
    companyId: {
        _id:string,
        name:string
    };
    name: string;
    phone: string;
    cv: string;
    createdAt:string;
    status:string
}

export type IResumeList = {
    _id: string;            
    status: string;
    companyId:{
        name:string
    };
    jobId:{
        name:string
    };
}