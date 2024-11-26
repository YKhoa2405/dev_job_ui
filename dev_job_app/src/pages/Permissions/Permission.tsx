import { ChevronLeft, ChevronRight, Eye, Pencil, Plus, TrashIcon } from 'lucide-react';

import { Link } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { IPermission } from '../../types/permission';
import { Fragment, useEffect, useState } from 'react';
import { authApi, endpoints } from '../../common/API';
import Loading from '../../common/Loader/Loading';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { Dialog, Transition } from '@headlessui/react';
const Permission = () => {
    const [permissionData, setPermissionData] = useState<IPermission[]>([]);
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [limit, setLimit] = useState(10);

    const [name, setName] = useState<string>('');
    const [apiPath, setApiPath] = useState<string>('');
    const [method, setMethod] = useState<string>('');
    const [module, setModule] = useState<string>('');


    const [isOpen, setIsOpen] = useState(false);

    const closeModal = () => setIsOpen(false);
    const openModal = () => setIsOpen(true);

    const displayOptions = [
        { value: 5, label: '5 mục' },
        { value: 10, label: '10 mục' },
        { value: 20, label: '20 mục' },
        { value: 50, label: '50 mục' },
        { value: 100, label: '100 mục' },
    ];

    const methodOptions = [
        { value: 'GET', label: 'GET (Lấy dữ liệu)' },
        { value: 'POST', label: 'POST (Tạo mới)' },
        { value: 'PUT', label: 'PUT (Cập nhật)' },
        { value: 'DELETE', label: 'DELETE (Xóa)' },
    ];

    useEffect(() => {
        fetchListPermission(currentPage, limit);
    }, [limit, currentPage]);

    const fetchListPermission = async (currentPage = 1, limit = 10, name = '') => {
        try {
            setLoading(true)
            const searchQuery = name ? `/${name}/i` : '';

            console.log(searchQuery)
            const token: any = localStorage.getItem("access_token");
            const res = await authApi(token).get(endpoints['permissions'], { // Update the endpoint as needed
                params: {
                    page: currentPage,
                    limit: limit,
                },
            });
            const data = res.data.data;
            setPermissionData(data.result);
            setCurrentPage(data.meta.currentPage);
            setTotalPages(data.meta.totalPages);
            setTotalItems(data.meta.totalItems);

        } catch (error) {
            console.log('Error fetching companies:', error);
        } finally { setLoading(false) }
    };

    const handleCreatePermission = async () => {
        if (!name || !method || !module || !apiPath) {
            toast.error('Vui lòng nhập đầy đủ thông tin!', {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }
    
        try {
            // Tạo formData để gửi dữ liệu
            const formData = new FormData();
            formData.append('name', name);
            formData.append('method', method);
            formData.append('module', module);
            formData.append('apiPath', apiPath);
    
            const token: any = localStorage.getItem("access_token");
    
            const response = await authApi(token).post(endpoints['permissions'], formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Đảm bảo rằng bạn gửi đúng loại dữ liệu
                }
            });
    
            if (response.status === 201) {
                toast.success('Thêm mới thành công!', {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
            closeModal();  // Đóng modal sau khi thành công
        } catch (error) {
            toast.error('Thêm mới thất bại!', {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };
    

    const handleDeletePermission = async (id: string) => {
        try {
            const result = await Swal.fire({
                title: 'Bạn có chắc chắn?',
                text: 'Thông tin về API này sẽ bị xóa!',
                icon: 'warning',
                showCancelButton: true, // Hiển thị nút "Hủy"
                confirmButtonColor: '#3085d6', // Màu nút "Yes"
                cancelButtonColor: '#d33', // Màu nút "No"
                confirmButtonText: 'Có, xóa!', // Nội dung nút "Yes"
                cancelButtonText: 'Hủy', // Nội dung nút "No"
            });

            if (result.isConfirmed) {
                const token: any = localStorage.getItem("access_token");
                await authApi(token).delete(endpoints['permissionsDetail'](id));

                toast.success('Xóa thông tin thành công!', {
                    position: "top-right",
                    autoClose: 3000,
                });
                fetchListPermission()
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra!', {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    const handlePrevClick = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextClick = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    return (
        <>
            <Breadcrumb pageName="Phân quyền trong hệ thống" />
            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={closeModal}>
                    {/* Overlay */}
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
                            <Dialog.Panel className="w-full max-w-3xl h-auto bg-white rounded-lg shadow-xl p-6">
                                {/* Header */}
                                <Dialog.Title
                                    as="h3"
                                    className="text-lg font-semibold leading-6 text-gray-900">
                                    Thêm mới quyền hạn
                                </Dialog.Title>

                                {/* Body */}
                                <div className="mt-4">
                                    <div className='flex space-x-4 mb-4.5'>
                                        <div className='flex-1'>
                                            <label className="mb-2.5 block text-black dark:text-white">Tên quyền hạn<span className="text-meta-1">*</span></label>
                                            <input
                                                type="text"
                                                placeholder="Nhập tên quyền hạn, ..."
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex space-x-4 mb-4.5">
                                        <div className="flex-1">
                                            <label className="mb-2.5 block text-black dark:text-white">API Path<span className="text-meta-1">*</span></label>
                                            <input
                                                type="text"
                                                placeholder="/companies, ..."
                                                value={apiPath}
                                                onChange={(e) => setApiPath(e.target.value)}
                                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                            />
                                        </div>

                                        <div className="flex-1">
                                            <label className="mb-2.5 block text-black dark:text-white">Method<span className="text-meta-1">*</span></label>
                                            <select
                                                value={method}
                                                onChange={(e) => setMethod(e.target.value)}
                                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
                                                <option value="" disabled hidden>Chọn Method</option>
                                                {methodOptions.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex-1">
                                            <label className="mb-2.5 block text-black dark:text-white">Module<span className="text-meta-1">*</span></label>

                                        </div>
                                    </div>

                                </div>

                                {/* Footer */}
                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        onClick={closeModal}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition">Hủy
                                    </button>
                                    <button
                                        onClick={() => handleCreatePermission()}
                                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">Xác nhận
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition>


            <div className="flex flex-col gap-10">
                <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
                    <div className="mb-6 flex items-center justify-between">
                        <h4 className="text-xl font-semibold text-black dark:text-white">
                            Danh sách quyền hạn
                        </h4>
                        <button
                            onClick={openModal}
                            type='button'
                            className="inline-flex items-center justify-center gap-2.5 bg-primary py-2 px-5 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 rounded-md">
                            <Plus size={20} />
                            Thêm mới
                        </button>
                    </div>

                    <div className="grid grid-cols-6 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5">
                        <div className="col-span-2 flex items-center">
                            <p className="font-medium">Tên quyền hạn</p>
                        </div>
                        <div className="col-span-3 hidden items-center sm:flex">
                            <p className="font-medium">API Path</p>
                        </div>
                        <div className="col-span-1 hidden items-center sm:flex">
                            <p className="font-medium">Method</p>
                        </div>
                        <div className="col-span-1 flex items-center">
                            <p className="font-medium">Module</p>
                        </div>
                        <div className="col-span-1 hidden items-center sm:flex">
                            <p className="font-medium">Hành động</p>
                        </div>
                    </div>
                    {loading ? (
                        <Loading />
                    ) : (
                        <div>
                            {permissionData.map((item) => (
                                <div
                                    className="grid grid-cols-6 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5"
                                    key={item._id}>
                                    <div className="col-span-2 flex items-center">
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                            <p className="text-sm text-black dark:text-white">
                                                {item.name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="col-span-3 flex items-center">
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                            <p className="text-sm text-black dark:text-white">
                                                {item.apiPath}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="col-span-1 hidden items-center sm:flex">
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                            <p
                                                className={`text-sm font-medium px-2 py-1 rounded ${item.method === 'GET'
                                                    ? ' text-blue-600'
                                                    : item.method === 'POST'
                                                        ? ' text-green-600'
                                                        : item.method === 'PATCH'
                                                            ? ' text-purple-600'
                                                            : item.method === 'DELETE'
                                                                ? ' text-red-600'
                                                                : ' text-gray-600'
                                                    }`}
                                            >
                                                {item.method}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="col-span-1 hidden items-center sm:flex">
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                            <p className="text-sm text-black dark:text-white">
                                                {item.module}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="col-span-1  hidden items-center sm:flex">
                                        <div className="flex items-center space-x-3.5">
                                            <button className="hover:text-primary">
                                                <Eye size={20} />
                                            </button>
                                            <button onClick={() => handleDeletePermission(item._id)} className="hover:text-red-500">
                                                <TrashIcon size={20} />
                                            </button>
                                            <button className="hover:text-primary">
                                                <Pencil size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                        </div>
                    )}

                    <div className="py-6 px-4 md:px-6 xl:px-7.5 border-t border-stroke dark:border-strokedark">
                        <div className="flex items-center justify-between">
                            <h6 className="text-base font-semibold text-black ">Tổng {totalItems} API  </h6>
                            <div className="flex items-center justify-center gap-4">
                                <select
                                    value={limit}
                                    onChange={(e) => setLimit(Number(e.target.value))}
                                    className="rounded border-[1.5px] border-stroke bg-transparent py-1 px-2 text-black outline-none transition focus:border-primary active:border-primary"
                                >
                                    {displayOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                {/* Nút Previous */}
                                <button
                                    onClick={handlePrevClick}
                                    disabled={currentPage === 1}
                                    className={`inline-flex items-center justify-center gap-2 bg-primary py-1.5 px-4 text-center font-medium text-white hover:bg-opacity-90 rounded-md ${currentPage === 1 ? 'cursor-not-allowed bg-gray-300' : ''}`}
                                >
                                    <ChevronLeft size={18} />
                                </button>

                                {/* Current Page */}
                                <p className="font-medium text-black  mx-4" style={{ width: '100px', textAlign: 'center' }}>
                                    {currentPage} / {totalPages} trang
                                </p>

                                {/* Next Button */}
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

export default Permission;
