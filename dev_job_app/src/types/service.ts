export type IServiceDetail = {
    _id: string;                    // ID của dịch vụ
    name: string;                   // Tên dịch vụ
    description: string;            // Mô tả chi tiết dịch vụ
    price: number;                  // Giá dịch vụ
    durationDays: number;           // Thời gian dịch vụ có hiệu lực (tính bằng ngày)
    createdAt: Date;                // Thời gian tạo dịch vụ
    updatedAt: Date;                // Thời gian cập nhật dịch vụ
    isActive:boolean;
    usageLimit: number;
    code: string
    orderCount:number
}


export type IServiceList = {
    _id: string;                    // ID của dịch vụ
    name: string;                   // Tên dịch vụ
    price: number;                  // Giá dịch vụ
    durationDays: number;           // Thời gian dịch vụ có hiệu lực (tính bằng ngày)
    createdAt: string;                // Thời gian tạo dịch vụ
    isActive:boolean;
    code:boolean

}