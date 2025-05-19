export type ICompanyList = {
    _id: string;
    name: string;
    address: string;
    avatar: string
    website: string
    city: string
    isApproved: boolean
    size: number,
    businessLicenseUrl: string
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
    website: string
    field: string
    followers: number
    size: string
    about: string
    isApproved: boolean,
    taxCode: string,
    createdAt: string
    updatedAt: string,
    businessLicenseUrl: string
    createBy: {
        _id: string
        email: string
    }
}
