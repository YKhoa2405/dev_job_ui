import { ChevronLeft, ChevronRight, Pencil, TrashIcon } from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { Fragment, useEffect, useState, useCallback } from 'react';
import { IResumeList, IResumeDetail } from '../../types/resume';
import { authApi, endpoints } from '../../common/API';
import Loading from '../../common/Loader/Loading';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { Dialog, Transition } from '@headlessui/react';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';

// Constants
const DISPLAY_OPTIONS = [
    { value: 5, label: '5 mục' },
    { value: 10, label: '10 mục' },
    { value: 20, label: '20 mục' },
    { value: 50, label: '50 mục' },
    { value: 100, label: '100 mục' },
];

const STATUS_OPTIONS = [
    { value: 'Chờ xử lý', label: 'Chờ xử lý' },
    { value: 'Đã xem', label: 'Đã xem' },
    { value: 'Chấp nhận', label: 'Chấp nhận' },
    { value: 'Từ chối', label: 'Từ chối' },
];

const Resumes = () => {
    const [resumeData, setResumeData] = useState<IResumeList[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [limit, setLimit] = useState(10);
    const [status, setStatus] = useState('');
    const [statusUpdate, setStatusUpdate] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingModal, setLoadingModal] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [resumeDetail, setResumeDetail] = useState<IResumeDetail | null>(null);
    const { hasPermission } = usePermissions();


    // Memoized fetch functions
    const fetchListResume = useCallback(async (page = 1, limitVal = 10, statusVal = '') => {
        setLoading(true);
        try {
            const token = localStorage.getItem("access_token");
            if (!token) throw new Error("Không tìm thấy access token");
            const res = await authApi(token).get(endpoints['resume'], {
                params: { page, limit: limitVal, status: statusVal },
            });
            const data = res.data.data;
            setResumeData(data.result);
            setCurrentPage(data.meta.currentPage);
            setTotalPages(data.meta.totalPages);
            setTotalItems(data.meta.totalItems);
        } catch (error: any) {
            console.error('Error fetching resumes:', error);
            toast.error(error.message || 'Không thể tải danh sách hồ sơ', { position: "top-right", autoClose: 3000 });
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchResumeDetail = useCallback(async (id: string) => {
        setLoadingModal(true);
        try {
            const token = localStorage.getItem("access_token");
            if (!token) throw new Error("Không tìm thấy access token");
            const res = await authApi(token).get(endpoints['resumeDetail'](id));
            setResumeDetail(res.data.data);
            setStatusUpdate(res.data.data.status); // Sync initial status
        } catch (error: any) {
            console.error('Error fetching resume detail:', error);
            toast.error(error.message || 'Không thể tải chi tiết hồ sơ', { position: "top-right", autoClose: 3000 });
        } finally {
            setLoadingModal(false);
        }
    }, []);

    // Debounced fetch for filter changes
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchListResume(currentPage, limit, status);
        }, 300); // 300ms debounce
        return () => clearTimeout(timer);
    }, [currentPage, limit, status, fetchListResume]);

    const handleUpdateResume = useCallback(async (id: string) => {
        if (!statusUpdate) {
            toast.error('Vui lòng chọn trạng thái!', { position: "top-right", autoClose: 3000 });
            return;
        }
        try {
            const token = localStorage.getItem("access_token");
            if (!token) throw new Error("Không tìm thấy access token");
            await authApi(token).patch(endpoints['resumeDetail'](id), { status: statusUpdate });
            toast.success('Cập nhật hồ sơ thành công!', { position: "top-right", autoClose: 3000 });
            closeModal();
            fetchListResume(currentPage, limit, status);
        } catch (error: any) {
            console.error('Error updating resume:', error);
            toast.error(error.message || 'Cập nhật hồ sơ thất bại!', { position: "top-right", autoClose: 3000 });
        }
    }, [statusUpdate, currentPage, limit, status, fetchListResume]);

    const handleDeleteResume = useCallback(async (id: string) => {
        const result = await Swal.fire({
            title: 'Bạn có chắc chắn?',
            text: 'Thông tin về đơn ứng tuyển này sẽ bị xóa!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Có, xóa!',
            cancelButtonText: 'Hủy',
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem("access_token");
                if (!token) throw new Error("Không tìm thấy access token");
                await authApi(token).delete(endpoints['resumeDetail'](id));
                toast.success('Xóa hồ sơ thành công!', { position: "top-right", autoClose: 3000 });
                fetchListResume(currentPage, limit, status);
            } catch (error: any) {
                console.error('Error deleting resume:', error);
                toast.error(error.message || 'Xóa hồ sơ thất bại!', { position: "top-right", autoClose: 3000 });
            }
        }
    }, [currentPage, limit, status, fetchListResume]);

    const openModal = (id: string) => {
        fetchResumeDetail(id);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setResumeDetail(null);
        setStatusUpdate('');
    };

    const handlePrevClick = () => currentPage > 1 && setCurrentPage(currentPage - 1);
    const handleNextClick = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

    // Status styling helper
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Chờ xử lý': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-700 dark:text-yellow-300';
            case 'Đã xem': return 'text-blue-600 bg-blue-100 dark:bg-blue-700 dark:text-blue-300';
            case 'Chấp nhận': return 'text-green-600 bg-green-100 dark:bg-green-700 dark:text-green-300';
            case 'Từ chối': return 'text-red-600 bg-red-100 dark:bg-red-700 dark:text-red-300';
            default: return '';
        }
    };

    return (
        <>
            <Breadcrumb pageName="Quản lý hồ sơ ứng tuyển" />
            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={closeModal}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <Dialog.Panel className="w-full max-w-4xl bg-white rounded-lg shadow-xl p-6">
                                <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900">Chi tiết hồ sơ ứng tuyển</Dialog.Title>
                                <div className="mt-4">
                                    {loadingModal ? (
                                        <Loading />
                                    ) : resumeDetail ? (
                                        <div className="p-6.5">
                                            <div className="flex space-x-4 mb-4.5">
                                                <div className="flex-1">
                                                    <label className="mb-2.5 block text-black dark:text-white">Email</label>
                                                    <div className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white">{resumeDetail.email}</div>
                                                </div>
                                                <div className="flex-1">
                                                    <label className="mb-2.5 block text-black dark:text-white">Họ và tên</label>
                                                    <div className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white">{resumeDetail.name}</div>
                                                </div>
                                                <div className="flex-1">
                                                    <label className="mb-2.5 block text-black dark:text-white">Số điện thoại</label>
                                                    <div className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white">{resumeDetail.phone}</div>
                                                </div>
                                            </div>
                                            <div className="flex space-x-4 mb-4.5">
                                                <div className="flex-1">
                                                    <label className="mb-2.5 block text-black dark:text-white">Tiêu đề việc làm</label>
                                                    <div className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white">{resumeDetail.jobId.name}</div>
                                                </div>
                                                <div className="flex-1">
                                                    <label className="mb-2.5 block text-black dark:text-white">Tên công ty</label>
                                                    <div className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white">{resumeDetail.companyId.name}</div>
                                                </div>
                                            </div>
                                            <div className="flex space-x-4 mb-4.5">
                                                <div className="flex-1">
                                                    <label className="mb-2.5 block text-black dark:text-white">CV</label>
                                                    <button
                                                        className="w-full rounded bg-blue-600 py-3 px-5 text-white hover:bg-opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                        onClick={() => window.open(resumeDetail.cv, '_blank')}
                                                        disabled={!resumeDetail.cv}
                                                    >
                                                        Xem CV
                                                    </button>
                                                </div>
                                                <div className="flex-1">
                                                    <label className="mb-2.5 block text-black dark:text-white">Ngày tạo</label>
                                                    <div className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white">
                                                        {moment(resumeDetail.createdAt).format("ddd, DD/MM/YYYY, HH:mm")}
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <label className="mb-2.5 block text-black dark:text-white">Trạng thái</label>
                                                    <select
                                                        value={statusUpdate}
                                                        onChange={(e) => setStatusUpdate(e.target.value)}
                                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                                    >
                                                        {STATUS_OPTIONS.map(option => (
                                                            <option key={option.value} value={option.value}>{option.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-center text-gray-500">Không có dữ liệu chi tiết</p>
                                    )}
                                </div>
                                <div className="mt-6 flex justify-end gap-3">
                                    <button onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition">Hủy</button>
                                    <button
                                        onClick={() => handleUpdateResume(resumeDetail?._id || '')}
                                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        disabled={loadingModal || !resumeDetail}
                                    >
                                        Xác nhận
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition>

            <div className="flex flex-col gap-10">
                <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    <div className="grid grid-cols-6 gap-x-6 py-3 px-6">
                        <div className="col-span-2 flex items-center">
                            <p className="font-medium mr-2 whitespace-nowrap">Trạng thái</p>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            >
                                <option value="">Tất cả</option>
                                {STATUS_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
                    <div className="mb-6 flex items-center justify-between">
                        <h4 className="text-xl font-semibold text-black dark:text-white">Danh sách hồ sơ ứng tuyển</h4>
                    </div>

                    <div className="grid grid-cols-6 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-6 md:px-6 2xl:px-7.5">
                        <div className="col-span-2 hidden items-center sm:flex"><p className="font-medium">Tin tuyển dụng</p></div>
                        <div className="col-span-1 flex items-center"><p className="font-medium">Trạng thái</p></div>
                        <div className="col-span-2 hidden items-center sm:flex"><p className="font-medium">Công ty</p></div>
                        <div className="col-span-1 flex items-center"><p className="font-medium">Hành động</p></div>
                    </div>

                    {loading ? (
                        <Loading />
                    ) : resumeData.length === 0 ? (
                        <p className="text-center py-4 text-gray-500">Không có hồ sơ nào phù hợp</p>
                    ) : (
                        resumeData.map(item => (
                            <div
                                key={item._id}
                                className="grid grid-cols-6 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-6 md:px-6 2xl:px-7.5"
                            >

                                <div className="col-span-2 hidden items-center sm:flex">
                                    <Link to={`/admin/jobs/${item.jobId._id}`} className="truncate text-sm text-blue-600 dark:text-white hover:underline">
                                        {item.jobId.name}
                                    </Link>
                                </div>

                                <div className="col-span-1 flex items-center">
                                    <p className={`text-sm font-bold px-2 rounded ${getStatusStyle(item.status)}`}>{item.status}</p>
                                </div>
                                <div className="col-span-2 hidden items-center sm:flex">
                                    <Link to={`/admin/companies/${item.companyId._id}/detail`} className="truncate text-sm  dark:text-white hover:underline">
                                        {item.companyId.name}
                                    </Link>
                                </div>
                                <div className="col-span-1 flex items-center">
                                    <div className="flex items-center space-x-3.5">
                                        {hasPermission('683bc7de789be1bf151451dd') && (
                                            <button onClick={() => openModal(item._id)} className="hover:text-primary" title="Chỉnh sửa">
                                                <Pencil size={20} />
                                            </button>
                                        )}

                                        {hasPermission('683bc7cb789be1bf151451da') && (
                                            <button onClick={() => handleDeleteResume(item._id)} className="hover:text-red-600" title="Xóa hồ sơ">
                                                <TrashIcon size={20} />
                                            </button>
                                        )}

                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    <div className="py-6 px-4 md:px-6 xl:px-7.5 border-t border-stroke dark:border-strokedark">
                        <div className="flex items-center justify-between">
                            <h6 className="text-base font-semibold text-black dark:text-white">Tổng {totalItems} hồ sơ ứng tuyển</h6>
                            <div className="flex items-center justify-center gap-4">
                                <select
                                    value={limit}
                                    onChange={(e) => setLimit(Number(e.target.value))}
                                    className="rounded border-[1.5px] border-stroke bg-transparent py-1 px-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                >
                                    {DISPLAY_OPTIONS.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={handlePrevClick}
                                    disabled={currentPage === 1}
                                    className="inline-flex items-center justify-center gap-2 bg-primary py-1.5 px-4 text-center font-medium text-white hover:bg-opacity-90 rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <p className="font-medium text-black dark:text-white mx-4" style={{ width: '100px', textAlign: 'center' }}>
                                    {currentPage} / {totalPages} trang
                                </p>
                                <button
                                    onClick={handleNextClick}
                                    disabled={currentPage === totalPages}
                                    className="inline-flex items-center justify-center gap-2 bg-primary py-1.5 px-4 text-center font-medium text-white hover:bg-opacity-90 rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed"
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

export default Resumes;