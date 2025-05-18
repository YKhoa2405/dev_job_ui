export type ICandidate = {
    _id: string;
    userId: string; // Liên kết với User
    fullName?: string;
    avatar?: string;
    phone?: string;
    email: string;
    location?: string;
    skills?: string[];
    level?: string;
    salary?: string;
    jobType?: string;
    availability?: 'Ngay lập tức' | '1 tuần' | '2 tuần' | '1 tháng' | null;
    createdAt: string;
    createBy: { _id: string; email: string };
    updatedAt: string;
    cvUrl:string;
};
