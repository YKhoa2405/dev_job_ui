export type IPermission = {
    _id: string;
    name: string;
    apiPath: string;
    method: string;
    module: string;
    createBy: {
        _id: string;
        email: string;
    };
    createdAt: string;
    updatedAt: string;
    enabled?: boolean;
    __v: number;
}

export type PermissionGroup = {
    group: string;
    permissions: IPermission[];
}