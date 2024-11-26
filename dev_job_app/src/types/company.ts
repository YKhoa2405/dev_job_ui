export type ICompanyList = {
    _id: string;
    name: string;
    address: string;
    avatar: string
    website: string
    city: string
    isApproved: boolean
    size:number
}

export type ICompanyEdit = {
    _id: string;
    name: string;
    slogan: string
    address: string;
    website: string
    field: string
    size: number
    about: string
}

export type ICompanyDetail = {
    _id: string;
    name: string;
    slogan: string
    address: string;
    city: string;
    avatar: string
    follow: number
    website: string
    field: string
    followers: number
    size: number
    about: string
    isApproved: boolean
    createBy: {
        _id: string
        email: string
    }
}
