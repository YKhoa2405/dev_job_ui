export type IOrder = {
    _id: string;
    companyId: {
        _id: string;
        name: string;
    };
    serviceId: {
        _id: string;
        name: string;
    };
    amount: number;
    startDate: Date;
    endDate: Date;
    remainingUses: number | null;
    code: string; // Mã đơn hàng duy nhất
    createBy: {
        _id: string;
        email: string;
    };
    updateBy?: {
        _id: string;
        email: string;
    };
    isDeleted: boolean;
    deletedAt?: Date | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
};
