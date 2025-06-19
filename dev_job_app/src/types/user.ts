export type IUserDetail = {
    _id: string;               // ID của người dùng       // Tên đăng nhập của người dùng
    email: string;            // Email của người dùng
    name:string;
    avatar: string,
    createdAt:string,
    role: {
        _id: string,
        name: string
    },
    permisstions?: {
        _id: string,
        name: string,
        apiPath: string,
        module: string
    }[]

}

export type IUserList = {
    _id: string;               // ID của người dùng       // Tên đăng nhập của người dùng
    email: string;            // Email của người dùng
    name:string
    createdAt:string,
    isDeleted:boolean,
    role: {
        _id: string,
        name: string
    },
    phone:string

}