import { ChevronLeft, ChevronRight, Pencil, Plus, Search, TrashIcon } from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { Fragment, useEffect, useState, useCallback } from 'react';
import API, { authApi, endpoints } from '../../common/API';
import moment from 'moment';
import 'moment/locale/vi';
import { Dialog, Transition } from '@headlessui/react';
import { toast } from 'react-toastify';
import Loading from '../../common/Loader/Loading';
import { IPermission } from '../../types/permisstions';
import Swal from 'sweetalert2';
import { usePermissions } from '../../hooks/usePermissions';

// Constants
const DISPLAY_OPTIONS = [
    { value: 5, label: '5 mục' },
    { value: 10, label: '10 mục' },
    { value: 20, label: '20 mục' },
    { value: 50, label: '50 mục' },
    { value: 100, label: '100 mục' },
];

const METHOD_OPTIONS = [
    { value: '', label: 'Tất cả' },
    { value: 'GET', label: 'GET' },
    { value: 'POST', label: 'POST' },
    { value: 'PATCH', label: 'PATCH' },
    { value: 'DELETE', label: 'DELETE' },
];

const mockMethods = ['GET', 'POST', 'PATCH', 'DELETE'];

const Permissions = () => {
    moment.locale('vi');
    const [permissionData, setPermissionData] = useState<IPermission[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [limit, setLimit] = useState(10);
    const [method, setMethod] = useState('');
    const [searchName, setSearchName] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedPermission, setSelectedPermission] = useState<IPermission | null>(null);
    const [name, setName] = useState('');
    const [apiPath, setApiPath] = useState('');
    const [modalMethod, setModalMethod] = useState('');
    const [module, setModule] = useState('');
    const { hasPermission } = usePermissions();

    const [listModuleName, setListModuleName] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // Memoized fetch function
    const fetchListPermissions = useCallback(async (page = 1, limitVal = 10, methodVal = '', nameVal = '') => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const searchQuery = nameVal ? `/${nameVal}/i` : '';
            const filterMethod = methodVal ? `/${methodVal}/i` : '';

            const res = await authApi(token).get(endpoints['permissions'], {
                params: { page, limit: limitVal, method: filterMethod, name: searchQuery },
            });
            const data = res.data.data;
            setPermissionData(data.result);
            setCurrentPage(data.meta.currentPage);
            setTotalPages(data.meta.totalPages);
            setTotalItems(data.meta.totalItems);
        } catch (error: any) {
            console.error('Error fetching permissions:', error);
            toast.error(error.message || 'Không thể tải danh sách quyền hạn', { position: 'top-right', autoClose: 3000 });
        } finally {
            setLoading(false);
        }
    }, []);

    // Debounced fetch for filter and search changes
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchListPermissions(currentPage, limit, method, searchName);
            fetchListModuleName();
        }, 300); // 300ms debounce
        return () => clearTimeout(timer);
    }, [currentPage, limit, method, searchName, fetchListPermissions]);

    const openModal = (permission?: IPermission) => {
        if (permission) {
            // Edit mode
            setIsEditMode(true);
            setSelectedPermission(permission);
            setName(permission.name);
            setApiPath(permission.apiPath);
            setModalMethod(permission.method);
            setModule(permission.module);
        } else {
            // Create mode
            setIsEditMode(false);
            setSelectedPermission(null);
            setName('');
            setApiPath('');
            setModalMethod('');
            setModule('');
        }
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setIsEditMode(false);
        setSelectedPermission(null);
        setName('');
        setApiPath('');
        setModalMethod('');
        setModule('');
    };

    const handleCreatePermission = async () => {
        if (!name || !apiPath || !modalMethod || !module) {
            toast.error('Vui lòng điền đầy đủ thông tin!', { position: 'top-right', autoClose: 3000 });
            return;
        }
        try {
            const token = localStorage.getItem('access_token');
            const newPermission = { name, apiPath, method: modalMethod, module };
            await authApi(token).post(endpoints['permissions'], newPermission);
            toast.success('Thêm quyền hạn thành công!', { position: 'top-right', autoClose: 3000 });
            fetchListPermissions(currentPage, limit, method, searchName);
            closeModal();
        } catch (error: any) {
            console.error('Error creating permission:', error);
            toast.error(error.message || 'Thêm quyền hạn thất bại!', { position: 'top-right', autoClose: 3000 });
        }
    };

    const handleUpdatePermission = async () => {
        if (!name || !apiPath || !modalMethod || !module || !selectedPermission) {
            toast.error('Vui lòng điền đầy đủ thông tin!', { position: 'top-right', autoClose: 3000 });
            return;
        }
        try {
            const token = localStorage.getItem('access_token');
            const updatedPermission = { name, apiPath, method: modalMethod, module };
            await authApi(token).patch(endpoints['permissionsDetail'](selectedPermission._id), updatedPermission);
            toast.success('Cập nhật quyền hạn thành công!', { position: 'top-right', autoClose: 3000 });
            fetchListPermissions(currentPage, limit, method, searchName);
            closeModal();
        } catch (error: any) {
            console.error('Error updating permission:', error);
            toast.error(error.message || 'Cập nhật quyền hạn thất bại!', { position: 'top-right', autoClose: 3000 });
        }
    };

    const handleDeletePermission = useCallback(
        async (id: string) => {
            try {
                const result = await Swal.fire({
                    title: 'Bạn có chắc chắn?',
                    text: 'Thông tin về quyền hạn này sẽ bị xóa!',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Có, xóa!',
                    cancelButtonText: 'Hủy',
                });

                if (result.isConfirmed) {
                    const token = localStorage.getItem('access_token');
                    await authApi(token).delete(endpoints['permissionsDetail'](id));
                    setPermissionData(permissionData.filter((permission) => permission._id !== id));
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
        },
        [permissionData]
    );

    const fetchListModuleName = useCallback(async () => {
        setLoading(true);
        try {
            const res = await API.get(endpoints['permissionModuleName']);
            const data = res.data?.data || res.data; // tùy thuộc vào cấu trúc response
            console.log(res)
            setListModuleName(data);
        } catch (error: any) {
            console.log('Error fetching modules:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handlePrevClick = () => currentPage > 1 && setCurrentPage(currentPage - 1);
    const handleNextClick = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

    const getMethodColor = (method: string) => {
        switch (method.toLowerCase()) {
            case 'get':
                return 'text-green-600';
            case 'patch':
                return 'text-yellow-600';
            case 'post':
                return 'text-blue-600';
            case 'delete':
                return 'text-red-600';
            default:
                return 'text-black dark:text-white';
        }
    };

    return (
        <>
            <Breadcrumb pageName="Quản lý quyền hạn" />
            <div className="flex flex-col gap-10">
                <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    <div className="grid grid-cols-6 gap-x-6 py-3 px-6">
                        <div className="col-span-2 flex items-center">
                            <p className="font-medium mr-2 whitespace-nowrap">Phương thức</p>
                            <select
                                value={method}
                                onChange={(e) => setMethod(e.target.value)}
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            >
                                {METHOD_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-4 flex items-center">
                            <Search size={20} />
                            <input
                                type="text"
                                value={searchName}
                                onChange={(e) => setSearchName(e.target.value)}
                                placeholder="Nhập tên quyền hạn..."
                                className="w-full bg-transparent pl-9 pr-4 text-black focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
                    <div className="mb-6 flex items-center justify-between">
                        <h4 className="text-xl font-semibold text-black dark:text-white">
                            Danh sách quyền hạn trong hệ thống
                        </h4>
                        {hasPermission('683bcb07b0844882a0ba0383') && (
                            <button
                                onClick={() => openModal()}
                                className="inline-flex items-center justify-center gap-2.5 bg-primary py-2 px-5 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 rounded-md"
                            >
                                <Plus size={20} />
                                Thêm mới
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-6 border-t border-stroke py-4.5 px-4 sm:grid-cols-7 md:px-6 2xl:px-7.5">
                        <div className="col-span-1 flex items-center">
                            <p className="font-medium">Tên</p>
                        </div>
                        <div className="col-span-1 flex items-center">
                            <p className="font-medium">API Path</p>
                        </div>
                        <div className="col-span-1 flex items-center">
                            <p className="font-medium">Phương thức</p>
                        </div>
                        <div className="col-span-1 flex items-center">
                            <p className="font-medium">Module</p>
                        </div>
                        <div className="col-span-1 flex items-center">
                            <p className="font-medium">Người tạo</p>
                        </div>
                        <div className="col-span-1 flex items-center">
                            <p className="font-medium">Ngày tạo</p>
                        </div>
                        <div className="col-span-1 flex items-center">
                            <p className="font-medium">Hành động</p>
                        </div>
                    </div>

                    {loading ? (
                        <Loading />
                    ) : permissionData.length === 0 ? (
                        <p className="text-center py-4 text-gray-500">Không có quyền hạn nào phù hợp</p>
                    ) : (
                        permissionData.map((item) => (
                            <div
                                className="grid grid-cols-6 border-t border-stroke py-4.5 px-4 sm:grid-cols-7 md:px-6 2xl:px-7.5"
                                key={item._id}
                            >
                                <div className="col-span-1 flex items-center">
                                    <p className="text-sm text-black dark:text-white">{item.name}</p>
                                </div>
                                <div className="col-span-1 flex items-center">
                                    <p className="text-sm text-black dark:text-white">{item.apiPath}</p>
                                </div>
                                <div className="col-span-1 flex items-center font-bold">
                                    <p className={`text-sm ${getMethodColor(item.method)}`}>{item.method.toUpperCase()}</p>
                                </div>
                                <div className="col-span-1 flex items-center">
                                    <p className="text-sm text-black dark:text-white">{item.module}</p>
                                </div>
                                <div className="col-span-1 flex items-center">
                                    <p className="text-sm text-black dark:text-white">{item.createBy.email}</p>
                                </div>
                                <div className="col-span-1 flex items-center">
                                    <p className="text-sm text-black dark:text-white">
                                        {moment(item.createdAt).format('ddd, DD/MM/YYYY, HH:mm')}
                                    </p>
                                </div>
                                <div className="col-span-1 flex items-center">
                                    <div className="flex items-center space-x-3.5">
                                        {hasPermission('683bcb27b0844882a0ba0389') && (
                                            <button
                                                onClick={() => openModal(item)}
                                                className="hover:text-blue-500"
                                            >
                                                <Pencil size={20} />
                                            </button>
                                        )}
                                        {hasPermission('683bcb3db0844882a0ba038c') && (
                                            <button
                                                onClick={() => handleDeletePermission(item._id)}
                                                className="hover:text-red-500"
                                            >
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
                            <h6 className="text-base font-semibold text-black dark:text-white">Tổng {totalItems} quyền hạn</h6>
                            <div className="flex items-center justify-center gap-4">
                                <select
                                    value={limit}
                                    onChange={(e) => setLimit(Number(e.target.value))}
                                    className="rounded border-[1.5px] border-stroke bg-transparent py-1 px-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                >
                                    {DISPLAY_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={handlePrevClick}
                                    disabled={currentPage === 1}
                                    className="inline-flex items-center justify-center gap-2 bg-primary py-1.5 px-4 text-center font-medium text-white hover:bg-opacity-90 rounded-md disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <p className="font-medium text-black dark:text-white mx-4" style={{ width: '100px', textAlign: 'center' }}>
                                    {currentPage} / {totalPages} trang
                                </p>
                                <button
                                    onClick={handleNextClick}
                                    disabled={currentPage === totalPages}
                                    className="inline-flex items-center justify-center gap-2 bg-primary py-1.5 px-4 text-center font-medium text-white hover:bg-opacity-90 rounded-md disabled:cursor-not-allowed"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal for creating/editing permission */}
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
                            <Dialog.Panel className="w-full max-w-3xl h-auto bg-white rounded-lg shadow-xl p-6">
                                <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                                    {isEditMode ? 'Chỉnh sửa quyền hạn' : 'Thêm mới quyền hạn'}
                                </Dialog.Title>
                                < div className="mt-4">
                                    <div className="flex space-x-4 mb-4.5">
                                        <div className="flex-1">
                                            <label className="mb-2.5 block text-black dark:text-white">
                                                Tên <span className="text-meta-1">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Nhập tên quyền hạn"
                                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="mb-2.5 block text-black dark:text-white">
                                                API Path <span className="text-meta-1">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={apiPath}
                                                onChange={(e) => setApiPath(e.target.value)}
                                                placeholder="Nhập API Path"
                                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex space-x-4 mb-4.5">
                                        <div className="flex-1">
                                            <label className="mb-2.5 block text-black dark:text-white">
                                                Phương thức <span className="text-meta-1">*</span>
                                            </label>
                                            <select
                                                value={modalMethod}
                                                onChange={(e) => setModalMethod(e.target.value)}
                                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                            >
                                                <option value="" disabled>
                                                    Chọn Phương thức
                                                </option>
                                                {mockMethods.map((method) => (
                                                    <option key={method} value={method}>
                                                        {method}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex-1">
                                            <label className="mb-2.5 block text-black dark:text-white">
                                                Module <span className="text-meta-1">*</span>
                                            </label>
                                            <select
                                                value={module}
                                                onChange={(e) => setModule(e.target.value)}
                                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                            >
                                                <option value="" disabled>
                                                    Chọn Module
                                                </option>
                                                {listModuleName.map((mod) => (
                                                    <option key={mod} value={mod}>
                                                        {mod}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        onClick={closeModal}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={isEditMode ? handleUpdatePermission : handleCreatePermission}
                                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                                    >
                                        {isEditMode ? 'Cập nhật' : 'Xác nhận'}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
};

export default Permissions;