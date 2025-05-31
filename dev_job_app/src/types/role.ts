export type IRole = {
    _id: string;
    name: string;
    description: string;
    permissions: string[],
    createdAt: string,
    updatedAt: string,
    isActive:boolean
}