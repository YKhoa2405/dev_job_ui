export type IJobDetail = {
    _id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    companyId: {
        _id: string,
        name: string
    }
    description: string;
    requirement: string;
    prioritize: string;
    location: string;
    jobType: string;
    city: string;
    level: string
    quantity: number;
    skills: [];
    salary: string;
    geoLocation: {
        type: 'Point',
        coordinates: [number, number],
    },
    isActive: boolean;
    isUrgent: boolean;
    createdAt: Date;
    updatedAt: Date
}

export type IJobList = {
    _id: string;               // ID của người dùng       // Tên đăng nhập của người dùng
    name: string;            // Email của người dùng
    isActive: boolean;
    salary: string;
    level: string;
    quantity: number;
    createAt: Date;
    companyId: {
        _id: string,
        name: string
    }

}