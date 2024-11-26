export type IRole = {
    _id: string;
    name: string;
    description: string;
    permissions: string[],
    createdAt: string,
    isActive:boolean
}