import { CircleCheckBigIcon, CircleX, Pencil, Plus, Search, TrashIcon, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { Fragment, useEffect, useState, useCallback } from 'react';
import API, { authApi, endpoints } from '../../common/API';
import { toast } from 'react-toastify';
import Loading from '../../common/Loader/Loading';
import Swal from 'sweetalert2';
import { Dialog, Transition } from '@headlessui/react';
import moment from 'moment';
import { IOrder } from '../../types/order';

const Orders = () => {
    const [ordersData, setOrdersData] = useState<IOrder[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingModal, setLoadingModal] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [orderDetail, setOrderDetail] = useState<IOrder | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const displayOptions = [
        { value: 5, label: '5 mục' },
        { value: 10, label: '10 mục' },
        { value: 20, label: '20 mục' },
        { value: 50, label: '50 mục' },
        { value: 100, label: '100 mục' },
      ];

    const openModal = (id: string) => {
        fetchOrderDetail(id);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setOrderDetail(null);
    };

    const fetchOrderDetail = useCallback(async (id: string) => {
        setLoadingModal(true);
        try {
            const token = localStorage.getItem('access_token');
            const res = await authApi(token).get(endpoints['ordersDetail'](id));
            setOrderDetail(res.data.data);
        } catch (error) {
            console.log('Error fetching orders detail:', error);
            toast.error('Không thể tải chi tiết đơn hàng!');
        } finally {
            setLoadingModal(false);
        }
    }, []);

    const fetchListOrders = useCallback(async (page = 1, pageSize = limit) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const params: any = {
                page: page,
                limit: pageSize,
            };

            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const res = await authApi(token).get(endpoints['orders'], { params });
            const { result, meta } = res.data.data;
            setOrdersData(result);
            setCurrentPage(meta.currentPage);
            setLimit(meta.pageSize);
            setTotalItems(meta.totalItems);
            setTotalPages(meta.totalPages);
        } catch (error) {
            console.log('Error fetching orders:', error);
            toast.error('Không thể tải danh sách đơn hàng!');
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

    const handleDeleteOrders = useCallback(async (id: string) => {
        try {
            const result = await Swal.fire({
                title: 'Bạn có chắc chắn?',
                text: 'Thông tin về đơn hàng này sẽ bị xóa!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Có, xóa!',
                cancelButtonText: 'Hủy',
            });
            if (result.isConfirmed) {
                const token = localStorage.getItem('access_token');
                await authApi(token).delete(endpoints['ordersDetail'](id));
                setOrdersData((prev) => prev.filter((item) => item._id !== id));
                setTotalItems((prev) => prev - 1);
                toast.success('Xóa thành công!', {
                    position: 'top-right',
                    autoClose: 3000,
                });
                fetchListOrders(currentPage, limit);
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra!', {
                position: 'top-right',
                autoClose: 3000,
            });
        }
    }, [currentPage, limit, fetchListOrders]);

    const handleFilter = useCallback(() => {
        setCurrentPage(1);
        fetchListOrders(1, limit);
    }, [fetchListOrders, limit]);

    const handlePrevClick = () => {
        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
            fetchListOrders(currentPage - 1, limit);
        }
    };

    const handleNextClick = () => {
        if (currentPage < totalPages) {
            setCurrentPage((prev) => prev + 1);
            fetchListOrders(currentPage + 1, limit);
        }
    };

    const handleLimitChange = (newLimit: number) => {
        setLimit(newLimit);
        setCurrentPage(1);
        fetchListOrders(1, newLimit);
    };

    useEffect(() => {
        fetchListOrders(currentPage, limit);
    }, [fetchListOrders]);

    return (
        <>
            <Breadcrumb pageName="Quản lý đơn hàng" />
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
                                    Chi tiết đơn hàng
                                </Dialog.Title>

                                <div className="mt-4">
                                    {loadingModal ? (
                                        <Loading />
                                    ) : orderDetail ? (
                                        <div>
                                            <div className="flex space-x-4 mb-4.5">
                                                <div className="flex-1">
                                                    <label className="mb-2.5 block text-black dark:text-white font-medium">Mã đơn hàng</label>
                                                    <div className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white">
                                                        {orderDetail._id}
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <label className="mb-2.5 block text-black dark:text-white font-medium">Tên dịch vụ</label>
                                                    <div className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white">
                                                        {orderDetail.serviceId?.name}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex space-x-4 mb-4.5">
                                                <div className="flex-1">
                                                    <label className="mb-2.5 block text-black dark:text-white font-medium">Số tiền</label>
                                                    <div className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white">
                                                        {orderDetail.amount.toLocaleString('vi-VN')}
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <label className="mb-2.5 block text-black dark:text-white font-medium">Công ty</label>
                                                    <div className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white">
                                                        {orderDetail.companyId?.name}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex space-x-4 mb-4.5">
                                                <div className="flex-1">
                                                    <label className="mb-2.5 block text-black dark:text-white font-medium">Người tạo</label>
                                                    <div className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white">
                                                        {orderDetail.createBy?.email}
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <label className="mb-2.5 block text-black dark:text-white font-medium">Mã dịch vụ</label>
                                                    <div className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white">
                                                        {orderDetail.code || 'Không có'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex space-x-4 mb-4.5">
                                                <div className="flex-1">
                                                    <label className="mb-2.5 block text-black dark:text-white font-medium">Ngày tạo</label>
                                                    <div className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white">
                                                        {moment(orderDetail.createdAt).format('ddd, DD/MM/YYYY, HH:mm')}
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    ) : null}
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        onClick={closeModal}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                                    >
                                        Đóng
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition>

            <div className="flex flex-col gap-8">
                <div className="rounded-sm border border-stroke bg-white shadow-default p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="mb-2 block text-black dark:text-white">Từ ngày</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-black dark:text-white">Đến ngày</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white"
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={handleFilter}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none"
                        >
                            Lọc
                        </button>
                    </div>
                </div>

                <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
                    <div className="mb-6 flex items-center justify-between">
                        <h4 className="text-xl font-semibold text-black dark:text-white">Danh sách đơn hàng</h4>
                        <Link
                            to="create"
                            className="inline-flex items-center justify-center gap-2.5 bg-primary py-2 px-5 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 rounded-md"
                        >
                            <Plus size={20} />
                            Thêm mới
                        </Link>
                    </div>

                    <div className="grid grid-cols-7 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5">
                        <div className="col-span-2 flex items-center">
                            <p className="font-medium">Mã đơn hàng</p>
                        </div>
                        <div className="col-span-2 flex items-center">
                            <p className="font-medium">Tên dịch vụ</p>
                        </div>
                        <div className="col-span-2 hidden items-center sm:flex">
                            <p className="font-medium">Công ty</p>
                        </div>
                        <div className="col-span-1 hidden items-center sm:flex">
                            <p className="font-medium">Số tiền</p>
                        </div>
                        <div className="col-span-1 hidden sm:flex items-center">
                            <p className="font-medium">Hành động</p>
                        </div>
                    </div>

                    {loading ? (
                        <Loading />
                    ) : (
                        <div>
                            {ordersData.map((item) => (
                                <div
                                    className="grid grid-cols-7 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5"
                                    key={item._id}
                                >
                                    <div className="col-span-2 flex items-center">
                                        <p className="text-sm text-blue-600 dark:text-white">{item?._id}</p>
                                    </div>
                                    <div className="col-span-2 flex items-center">
                                        <p className="text-sm text-black dark:text-white">{item?.serviceId?.name}</p>
                                    </div>
                                    <div className="col-span-2 hidden sm:flex items-center">
                                        <p className="text-sm text-black dark:text-white">{item?.companyId?.name}</p>
                                    </div>
                                    <div className="col-span-1 hidden sm:flex items-center">
                                        <p className="text-sm text-green-600 dark:text-white">
                                            {item.amount.toLocaleString('vi-VN')}
                                        </p>
                                    </div>
                                    <div className="col-span-1 hidden sm:flex items-center">
                                        <div className="flex items-center space-x-3.5">
                                            <button onClick={() => openModal(item._id)} className="hover:text-primary">
                                                <Eye size={20} />
                                            </button>
                                            <button onClick={() => handleDeleteOrders(item._id)} className="hover:text-red-500">
                                                <TrashIcon size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="py-6 px-4 md:px-6 xl:px-7.5 border-t border-stroke dark:border-strokedark">
                        <div className="flex items-center justify-between">
                            <h6 className="text-base font-semibold text-black dark:text-white">
                                Tổng {totalItems} đơn hàng
                            </h6>
                            <div className="flex items-center justify-center gap-4">
                                <select
                                    value={limit}
                                    onChange={(e) => handleLimitChange(Number(e.target.value))}
                                    className="rounded border-[1.5px] border-stroke bg-transparent py-1 px-2 text-black outline-none transition focus:border-primary active:border-primary"
                                >
                                    {displayOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={handlePrevClick}
                                    disabled={currentPage === 1}
                                    className={`inline-flex items-center justify-center gap-2 bg-primary py-1.5 px-4 text-center font-medium text-white hover:bg-opacity-90 rounded-md ${currentPage === 1 ? 'cursor-not-allowed bg-gray-300' : ''}`}
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <p
                                    className="font-medium text-black dark:text-white mx-4"
                                    style={{ width: '100px', textAlign: 'center' }}
                                >
                                    {currentPage} / {totalPages} trang
                                </p>
                                <button
                                    onClick={handleNextClick}
                                    disabled={currentPage === totalPages}
                                    className={`inline-flex items-center justify-center gap-2 bg-primary py-1.5 px-4 text-center font-medium text-white hover:bg-opacity-90 rounded-md ${currentPage === totalPages ? 'cursor-not-allowed bg-gray-300' : ''}`}
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Orders;