import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { ICvDetail } from '../../types/resume';
import { authApi, endpoints } from '../../common/API';
import moment from 'moment';
import "moment/locale/vi";
import { toast } from 'react-toastify';
import { IServiceDetail } from '../../types/service';

interface EditServicesProps {
    isOpen: boolean;
    onClose: () => void;
    id: string; // ID cần nhận
}

const EditServices: React.FC<EditServicesProps> = ({ isOpen, onClose, id }) => {
    moment.locale("vi");
    if (!isOpen) return null;
    const [serviceDetail, setServiceDetail] = useState<IServiceDetail | null>(null);

    useEffect(() => {
        fetchServiceDetail();
    }, []);

    const toggleActiveStatus = () => {
        if (serviceDetail) {
            setServiceDetail(prev => prev ? { ...prev, isActive: !prev.isActive } : null);
        }
    };

    const fetchServiceDetail = async () => {
        try {
            const token: any = localStorage.getItem("access_token");
            const res = await authApi(token).get(endpoints['servicesDetail'](id));
            setServiceDetail(res.data.data)
        } catch (error) {
            console.log('Error fetching resume:', error);
        }
    }

    const updateService = async (e: { preventDefault: () => void; }) => {
        e.preventDefault(); // Ngăn chặn form reload mặc định
        try {
            const token = localStorage.getItem("access_token");
            await authApi(token).patch(endpoints['servicesDetail'](id), serviceDetail);
            toast.success('Cập nhật thành công!');
            onClose();
        } catch (error) {
            toast.error('Cập nhật thất bại!');
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark w-1/2">
                <div className=" flex items-center justify-between px-6.5 pt-6.5">
                    <h4 className="text-lg font-semibold text-black dark:text-white">
                        Cập nhật dịch vụ
                    </h4>
                    <X size={20} color='red' onClick={onClose} style={{ cursor: 'pointer' }} />
                </div>
                <form onSubmit={updateService}>
                    <div className="p-6.5">
                        <div className="flex space-x-4 mb-4.5">
                            {/* Tên dịch vụ */}
                            <div className="flex-1">
                                <label className="mb-2.5 block text-black dark:text-white">Tên dịch vụ</label>
                                <input
                                    type="text"
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                    value={serviceDetail?.name || ""}
                                    onChange={(e) => setServiceDetail(prev =>
                                        prev ? { ...prev, name: e.target.value } : null
                                    )}
                                />
                            </div>

                            {/* Ngày tạo */}
                            <div className="flex-1">
                                <label className="mb-2.5 block text-black dark:text-white">Ngày tạo</label>
                                <div className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white">
                                    {moment(serviceDetail?.createdAt).format("ddd, DD/MM/YYYY, HH:mm")}
                                </div>
                            </div>
                        </div>

                        <div className="flex space-x-4 mb-4.5">
                            {/* Giá dịch vụ */}
                            <div className="flex-1">
                                <label className="mb-2.5 block text-black dark:text-white">Giá dịch vụ</label>
                                <input
                                    type="number"
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                    value={serviceDetail?.price || ""}
                                    onChange={(e) => setServiceDetail(prev =>
                                        prev ? { ...prev, price: Number(e.target.value) } : null
                                    )}
                                />
                            </div>

                            {/* Thời hạn hiệu lực */}
                            <div className="flex-1">
                                <label className="mb-2.5 block text-black dark:text-white">Thời hạn hiệu lực (ngày  )</label>
                                <input
                                    type="number"
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                    value={serviceDetail?.durationDays || ""}
                                    onChange={(e) => setServiceDetail(prev =>
                                        prev ? { ...prev, durationDays: Number(e.target.value) } : null
                                    )}
                                />
                            </div>
                            <div className='flex-1'>
                                <label className="mb-2.5 block text-black dark:text-white">Trạng thái</label>
                                <button
                                    type="button"
                                    onClick={toggleActiveStatus}
                                    className={`w-full rounded py-3 px-5 text-white ${serviceDetail?.isActive ? 'bg-green-500' : 'bg-red-500'} hover:bg-opacity-90`}
                                >
                                    {serviceDetail?.isActive ? 'Hoạt động' : 'Dừng hoạt động'}
                                </button>

                            </div>
                        </div>

                        <div className="flex space-x-4 mb-4.5">
                            {/* Mô tả */}
                            <div className="flex-1">
                                <label className="mb-2.5 block text-black dark:text-white">Mô tả</label>
                                <textarea
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                    value={serviceDetail?.description || ""}
                                    onChange={(e) => setServiceDetail(prev =>
                                        prev ? { ...prev, description: e.target.value } : null
                                    )}
                                />
                            </div>
                        </div>

                        {/* Nút cập nhật */}
                        <button
                            type="submit"
                            className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                        >
                            Cập nhật
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default EditServices
