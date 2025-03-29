import { CircleCheckBigIcon, CircleX, Pencil, Plus, Search, TrashIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { IServiceDetail, IServiceList } from '../../types/service';
import { Fragment, useEffect, useState, useCallback } from 'react';
import API, { authApi, endpoints } from '../../common/API';
import { toast } from 'react-toastify';
import Loading from '../../common/Loader/Loading';
import Swal from 'sweetalert2';
import { Dialog, Transition } from '@headlessui/react';
import moment from 'moment';

const Services = () => {
    const [serviceData, setServiceData] = useState<IServiceList[]>([]);
    const [searchKeyword, setSearchKeyword] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [loadingModal, setLoadingModal] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [serviceDetail, setServiceDetail] = useState<IServiceDetail | null>(null);

    const openModal = (id: string) => {
        fetchServiceDetail(id);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setServiceDetail(null);
    };

    const toggleActiveStatus = () => {
        if (serviceDetail) {
            setServiceDetail((prev) => (prev ? { ...prev, isActive: !prev.isActive } : null));
        }
    };

    const fetchServiceDetail = useCallback(async (id: string) => {
        setLoadingModal(true);
        try {
            const token = localStorage.getItem('access_token');
            const res = await authApi(token).get(endpoints['servicesDetail'](id));
            setServiceDetail(res.data.data);
        } catch (error) {
            console.log('Error fetching service detail:', error);
            toast.error('Không thể tải chi tiết dịch vụ!');
        } finally {
            setLoadingModal(false);
        }
    }, []);

    const fetchListService = useCallback(async (name = '') => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const res = await authApi(token).get(endpoints['services'], {
                params: {
                    name: name ? `/${name}/i` : '',
                },
            });
            setServiceData(res.data.data.result);
        } catch (error) {
            console.log('Error fetching services:', error);
            toast.error('Không thể tải danh sách dịch vụ!');
        } finally {
            setLoading(false);
        }
    }, []);

    const handleUpdateService = useCallback(
        async (id: string) => {
            try {
                const token = localStorage.getItem('access_token');
                await authApi(token).patch(endpoints['servicesDetail'](id), serviceDetail);
                // Cập nhật serviceData mà không fetch lại
                setServiceData((prev) =>
                    prev.map((item) => (item._id === id ? { ...item, ...serviceDetail } : item))
                );
                toast.success('Cập nhật thành công!');
                closeModal();
            } catch (error) {
                toast.error('Cập nhật thất bại!');
            }
        },
        [serviceDetail]
    );

    const handleDeleteService = useCallback(async (id: string) => {
        try {
            const result = await Swal.fire({
                title: 'Bạn có chắc chắn?',
                text: 'Thông tin về dịch vụ này sẽ bị xóa!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Có, xóa!',
                cancelButtonText: 'Hủy',
            });
            if (result.isConfirmed) {
                const token = localStorage.getItem('access_token');
                await authApi(token).delete(endpoints['servicesDetail'](id));
                // Xóa item khỏi serviceData mà không fetch lại
                setServiceData((prev) => prev.filter((item) => item._id !== id));
                toast.success('Xóa thành công!', {
                    position: 'top-right',
                    autoClose: 3000,
                });
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra!', {
                position: 'top-right',
                autoClose: 3000,
            });
        }
    }, []);

    const handleSearch = useCallback(() => {
        fetchListService(searchKeyword);
    }, [searchKeyword, fetchListService]);

    useEffect(() => {
        fetchListService();
    }, [fetchListService]);

    return (
        <>
            <Breadcrumb pageName="Quản lý dịch vụ" />
            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={closeModal}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-2xl h-auto bg-white rounded-lg shadow-xl p-6">
                                <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                                    Chi tiết dịch vụ
                                </Dialog.Title>

                                <div className="mt-4">
                                    {loadingModal ? (
                                        <Loading />
                                    ) : (
                                        <div>
                                            <div className="flex space-x-4 mb-4.5">
                                                <div className="flex-1">
                                                    <label className="mb-2.5 block text-black dark:text-white">Tên dịch vụ</label>
                                                    <input
                                                        type="text"
                                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                                        value={serviceDetail?.name || ''}
                                                        onChange={(e) =>
                                                            setServiceDetail((prev) =>
                                                                prev ? { ...prev, name: e.target.value } : null
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="mb-2.5 block text-black dark:text-white">Ngày tạo</label>
                                                    <div className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white">
                                                        {moment(serviceDetail?.createdAt).format('ddd, DD/MM/YYYY, HH:mm')}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex space-x-4 mb-4.5">
                                                <div className="flex-1">
                                                    <label className="mb-2.5 block text-black dark:text-white">Giá dịch vụ</label>
                                                    <input
                                                        type="number"
                                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                                        value={serviceDetail?.price || ''}
                                                        onChange={(e) =>
                                                            setServiceDetail((prev) =>
                                                                prev ? { ...prev, price: Number(e.target.value) } : null
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="mb-2.5 block text-black dark:text-white">
                                                        Thời hạn hiệu lực (ngày)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                                        value={serviceDetail?.durationDays || ''}
                                                        onChange={(e) =>
                                                            setServiceDetail((prev) =>
                                                                prev ? { ...prev, durationDays: Number(e.target.value) } : null
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="mb-2.5 block text-black dark:text-white">Trạng thái</label>
                                                    <button
                                                        type="button"
                                                        onClick={toggleActiveStatus}
                                                        className={`w-full rounded py-3 px-5 text-white ${serviceDetail?.isActive ? 'bg-green-500' : 'bg-red-500'
                                                            } hover:bg-opacity-90`}
                                                    >
                                                        {serviceDetail?.isActive ? 'Hoạt động' : 'Dừng hoạt động'}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex space-x-4 mb-4.5">
                                                <div className="flex-1">
                                                    <label className="mb-2.5 block text-black dark:text-white">Số lượt sử dụng</label>
                                                    <input
                                                        type="number"
                                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                                        value={serviceDetail?.usageLimit || 'Không có'}
                                                        onChange={(e) =>
                                                            setServiceDetail((prev) =>
                                                                prev ? { ...prev, usageLimit: Number(e.target.value) } : null
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="mb-2.5 block text-black dark:text-white">Mã dịch vụ</label>
                                                    <input
                                                        type="text"
                                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                                        value={serviceDetail?.code || ''}
                                                        onChange={(e) =>
                                                            setServiceDetail((prev) =>
                                                                prev ? { ...prev, code: e.target.value.toUpperCase() } : null
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="mb-2.5 block text-black dark:text-white">Tổng lượt mua</label>
                                                    <input
                                                        type="text"
                                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                                        value={serviceDetail?.orderCount || 0}

                                                    />
                                                </div>
                                            </div>

                                            <div className="flex space-x-4 mb-4.5">
                                                <div className="flex-1">
                                                    <label className="mb-2.5 block text-black dark:text-white">Mô tả</label>
                                                    <textarea
                                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                                        value={serviceDetail?.description || ''}
                                                        onChange={(e) =>
                                                            setServiceDetail((prev) =>
                                                                prev ? { ...prev, description: e.target.value } : null
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        onClick={closeModal}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={() => handleUpdateService(serviceDetail?._id || '')}
                                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                                    >
                                        Xác nhận
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition>

            <div className="flex flex-col gap-8">
                <div className="rounded-sm border border-stroke bg-white shadow-default">
                    <div className="py-3 px-2 md:px-6 xl:px-7.5">
                        <div className="relative flex items-center">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2">
                                <Search size={20} />
                            </div>
                            <input
                                type="text"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                placeholder="Nhập tên dịch vụ..."
                                className="w-full bg-transparent pl-9 pr-4 text-black focus:outline-none"
                            />
                            <button
                                onClick={handleSearch}
                                className="absolute right-0 top-1/2 -translate-y-1/2 bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 focus:outline-none"
                            >
                                Tìm kiếm
                            </button>
                        </div>
                    </div>
                </div>

                <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
                    <div className="mb-6 flex items-center justify-between">
                        <h4 className="text-xl font-semibold text-black dark:text-white">Danh sách dịch vụ</h4>
                        <Link
                            to="create"
                            className="inline-flex items-center justify-center gap-2.5 bg-primary py-2 px-5 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 rounded-md"
                        >
                            <Plus size={20} />
                            Thêm mới
                        </Link>
                    </div>

                    <div className="grid grid-cols-6 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5">
                        <div className="col-span-2 flex items-center">
                            <p className="font-medium">Tên dịch vụ</p>
                        </div>
                        <div className="col-span-2 flex items-center">
                            <p className="font-medium">Mã dịch vụ</p>
                        </div>
                        <div className="col-span-1 hidden items-center sm:flex">
                            <p className="font-medium">Giá (VND)</p>
                        </div>
                        <div className="col-span-1 hidden items-center sm:flex">
                            <p className="font-medium">Thời hạn</p>
                        </div>
                        <div className="col-span-1 flex items-center">
                            <p className="font-medium">Trạng thái</p>
                        </div>
                        <div className="col-span-1 hidden sm:flex items-center">
                            <p className="font-medium">Hành động</p>
                        </div>
                    </div>

                    {loading ? (
                        <Loading />
                    ) : (
                        <div>
                            {serviceData.map((item) => (
                                <div
                                    className="grid grid-cols-6 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5"
                                    key={item._id}
                                >
                                    <div className="col-span-2 flex items-center">
                                        <p className="text-sm text-blue-600 dark:text-white">{item.name}</p>
                                    </div>
                                    <div className="col-span-2 flex items-center">
                                        <p className="text-sm text-black dark:text-white">{item.code}</p>
                                    </div>
                                    <div className="col-span-1 hidden sm:flex items-center">
                                        <p className="text-sm text-green-600 dark:text-white">
                                            {item.price.toLocaleString('vi-VN')}
                                        </p>
                                    </div>
                                    <div className="col-span-1 hidden sm:flex items-center">
                                        <p className="text-sm text-black dark:text-white">{item.durationDays} ngày</p>
                                    </div>
                                    <div className="col-span-1 flex items-center">
                                        {item.isActive ? (
                                            <CircleCheckBigIcon size={20} color="green" />
                                        ) : (
                                            <CircleX size={20} color="red" />
                                        )}
                                    </div>
                                    <div className="col-span-1 hidden sm:flex items-center">
                                        <div className="flex items-center space-x-3.5">
                                            <button onClick={() => handleDeleteService(item._id)} className="hover:text-red-500">
                                                <TrashIcon size={20} />
                                            </button>
                                            <button onClick={() => openModal(item._id)} className="hover:text-primary">
                                                <Pencil size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Services;