import { ChevronDown, ChevronUp, CircleCheckBigIcon, CircleX, Pencil, Plus } from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { useEffect, useState } from 'react';
import { authApi, endpoints } from '../../common/API';
import { IRole } from '../../types/role';
import moment from 'moment';
import 'moment/locale/vi';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { PermissionGroup } from '../../types/permisstions';
import { toast } from 'react-toastify';
import { usePermissions } from '../../hooks/usePermissions';

const Roles = () => {
    moment.locale('vi');
    const [roleData, setRoleData] = useState<IRole[]>([]);
    const [permissionsData, setPermissionsData] = useState<PermissionGroup[]>([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<IRole | null>(null);
    const [editForm, setEditForm] = useState({
        name: '',
        description: '',
        isActive: true,
        permissions: [] as PermissionGroup[],
    });
    const [createForm, setCreateForm] = useState({
        name: '',
        description: '',
        isActive: true,
        permissions: [] as PermissionGroup[],
    });
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
    const { hasPermission } = usePermissions();

    // Lấy danh sách tất cả quyền (dùng để hiển thị trong modal)
    async function fetchPermissions() {
        try {
            const token = localStorage.getItem('access_token');
            const res = await authApi(token).get(endpoints['permissionGroup']);
            const result = res.data.data;
            const initializedPermissions = result.map((group: PermissionGroup) => ({
                ...group,
                permissions: group.permissions.map((perm: any) => ({
                    ...perm,
                    enabled: false,
                })),
            }));
            setPermissionsData(result);
            setCreateForm((prev) => ({ ...prev, permissions: initializedPermissions }));
            setEditForm((prev) => ({ ...prev, permissions: initializedPermissions }));
        } catch (error) {
            console.error('Lỗi khi lấy danh sách quyền:', error);
            toast.error('Không thể tải danh sách quyền', {
                position: 'top-right',
                autoClose: 3000,
            });
        }
    }

    // Lấy danh sách role (bao gồm permissions của từng role)
    const fetchListRole = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const res = await authApi(token).get(endpoints['roles']);
            setRoleData(res.data.data.result);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách role:', error);
            toast.error('Không thể tải danh sách vai trò', {
                position: 'top-right',
                autoClose: 3000,
            });
        }
    };

    useEffect(() => {
        fetchListRole();
        fetchPermissions();
    }, []);

    // Xử lý mở modal chỉnh sửa
    const handleEditRole = (role: IRole) => {
        setSelectedRole(role);
        // Khởi tạo permissions với trạng thái enabled dựa trên permissions của role
        const initializedPermissions = permissionsData.map((group: PermissionGroup) => ({
            ...group,
            permissions: group.permissions.map((perm: any) => ({
                ...perm,
                enabled: role.permissions.some((rolePermId: string) => rolePermId === perm._id),
            })),
        }));
        setEditForm({
            name: role.name,
            description: role.description || '',
            isActive: role.isActive,
            permissions: initializedPermissions,
        });
        setExpandedGroups(permissionsData.map((group) => group.group));
        setIsEditModalOpen(true);
    };

    // Xử lý tạo mới role
    const handleCreateRole = async () => {
        try {
            if (!createForm.name || !createForm.description) {
                toast.error('Vui lòng nhập đầy đủ thông tin', {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                });
                return;
            }
            const token = localStorage.getItem('access_token');
            const enabledPermissionIds = createForm.permissions
                .flatMap((group) => group.permissions)
                .filter((perm) => perm.enabled)
                .map((perm) => perm._id);
            await authApi(token).post(endpoints['roles'], {
                name: createForm.name,
                description: createForm.description,
                isActive: createForm.isActive,
                permissions: enabledPermissionIds,
            });
            toast.success('Thêm mới thành công!', {
                position: 'top-right',
                autoClose: 3000,
            });
            fetchListRole();
            setIsCreateModalOpen(false);
            setCreateForm({
                name: '',
                description: '',
                isActive: true,
                permissions: permissionsData.map((group: PermissionGroup) => ({
                    ...group,
                    permissions: group.permissions.map((perm: any) => ({
                        ...perm,
                        enabled: false,
                    })),
                })),
            });
        } catch (error) {
            console.error('Lỗi khi tạo role:', error);
            toast.error('Thêm mới thất bại', {
                position: 'top-right',
                autoClose: 3000,
            });
        }
    };

    // Xử lý cập nhật role
    const handleUpdateRole = async () => {
        try {
            if (!editForm.name || !editForm.description) {
                toast.error('Vui lòng nhập đầy đủ thông tin', {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                });
                return;
            }
            const token = localStorage.getItem('access_token');
            const enabledPermissionIds = editForm.permissions
                .flatMap((group) => group.permissions)
                .filter((perm) => perm.enabled)
                .map((perm) => perm._id);
            await authApi(token).patch(endpoints['rolesDetail'](selectedRole!._id), {
                name: editForm.name,
                description: editForm.description,
                isActive: editForm.isActive,
                permissions: enabledPermissionIds,
            });
            toast.success('Cập nhật thành công!', {
                position: 'top-right',
                autoClose: 3000,
            });
            fetchListRole();
            setIsEditModalOpen(false);
        } catch (error) {
            console.error('Lỗi khi cập nhật role:', error);
            toast.error('Cập nhật thất bại', {
                position: 'top-right',
                autoClose: 3000,
            });
        }
    };

    // Chuyển đổi trạng thái nhóm quyền
    const toggleGroup = (group: string) => {
        setExpandedGroups((prev) =>
            prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
        );
    };

    // Chuyển đổi trạng thái quyền trong modal tạo
    const togglePermission = (groupIndex: number, permIndex: number) => {
        setCreateForm((prev) => {
            const newPermissions = prev.permissions.map((group, gIndex) =>
                gIndex === groupIndex
                    ? {
                        ...group,
                        permissions: group.permissions.map((perm, pIndex) =>
                            pIndex === permIndex ? { ...perm, enabled: !perm.enabled } : perm
                        ),
                    }
                    : group
            );
            return { ...prev, permissions: newPermissions };
        });
    };

    // Bật tất cả quyền trong nhóm (modal tạo)
    const enableAllPermissionsInGroup = (groupIndex: number) => {
        setCreateForm((prev) => {
            const newPermissions = prev.permissions.map((group, gIndex) =>
                gIndex === groupIndex
                    ? {
                        ...group,
                        permissions: group.permissions.map((perm) => ({ ...perm, enabled: true })),
                    }
                    : group
            );
            return { ...prev, permissions: newPermissions };
        });
    };

    // Tắt tất cả quyền trong nhóm (modal tạo)
    const disableAllPermissionsInGroup = (groupIndex: number) => {
        setCreateForm((prev) => {
            const newPermissions = prev.permissions.map((group, gIndex) =>
                gIndex === groupIndex
                    ? {
                        ...group,
                        permissions: group.permissions.map((perm) => ({ ...perm, enabled: false })),
                    }
                    : group
            );
            return { ...prev, permissions: newPermissions };
        });
    };

    // Chuyển đổi trạng thái quyền trong modal chỉnh sửa
    const toggleEditPermission = (groupIndex: number, permIndex: number) => {
        setEditForm((prev) => {
            const newPermissions = prev.permissions.map((group, gIndex) =>
                gIndex === groupIndex
                    ? {
                        ...group,
                        permissions: group.permissions.map((perm, pIndex) =>
                            pIndex === permIndex ? { ...perm, enabled: !perm.enabled } : perm
                        ),
                    }
                    : group
            );
            return { ...prev, permissions: newPermissions };
        });
    };

    // Bật tất cả quyền trong nhóm (modal chỉnh sửa)
    const enableAllPermissionsInEditGroup = (groupIndex: number) => {
        setEditForm((prev) => {
            const newPermissions = prev.permissions.map((group, gIndex) =>
                gIndex === groupIndex
                    ? {
                        ...group,
                        permissions: group.permissions.map((perm) => ({ ...perm, enabled: true })),
                    }
                    : group
            );
            return { ...prev, permissions: newPermissions };
        });
    };

    // Tắt tất cả quyền trong nhóm (modal chỉnh sửa)
    const disableAllPermissionsInEditGroup = (groupIndex: number) => {
        setEditForm((prev) => {
            const newPermissions = prev.permissions.map((group, gIndex) =>
                gIndex === groupIndex
                    ? {
                        ...group,
                        permissions: group.permissions.map((perm) => ({ ...perm, enabled: false })),
                    }
                    : group
            );
            return { ...prev, permissions: newPermissions };
        });
    };

    return (
        <>
            <Breadcrumb pageName="Quản lý vai trò người dùng" />
            <div className="flex flex-col gap-10">
                <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
                    <div className="mb-6 flex items-center justify-between">
                        <h4 className="text-xl font-semibold text-black dark:text-white">
                            Danh sách vai trò trong hệ thống
                        </h4>
                        {hasPermission('683bcba2b0844882a0ba0396') && (
                            <button
                                onClick={() => {
                                    if (!permissionsData.length) {
                                        toast.error('Danh sách quyền chưa được tải', {
                                            position: 'top-right',
                                            autoClose: 3000,
                                        });
                                        return;
                                    }
                                    setCreateForm({
                                        name: '',
                                        description: '',
                                        isActive: true,
                                        permissions: permissionsData.map((group: PermissionGroup) => ({
                                            ...group,
                                            permissions: group.permissions.map((perm: any) => ({
                                                ...perm,
                                                enabled: false,
                                            })),
                                        })),
                                    });
                                    setExpandedGroups(permissionsData.map((group) => group.group));
                                    setIsCreateModalOpen(true);
                                }}
                                className="inline-flex items-center justify-center gap-2.5 bg-primary py-2 px-5 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 rounded-md"
                            >
                                <Plus size={20} />
                                Thêm mới
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-6 border-t border-stroke py-4.5 px-4 sm:grid-cols-8 md:px-6 2xl:px-7.5">
                        <div className="col-span-1 flex items-center">
                            <p className="font-medium">Tên</p>
                        </div>
                        <div className="col-span-3 flex items-center">
                            <p className="font-medium">Mô tả</p>
                        </div>
                        <div className="col-span-1 hidden items-center sm:flex">
                            <p className="font-medium">Ngày tạo</p>
                        </div>
                        <div className="col-span-1 hidden items-center sm:flex">
                            <p className="font-medium">Ngày cập nhật</p>
                        </div>
                        <div className="col-span-1 hidden items-center sm:flex">
                            <p className="font-medium">Trạng thái</p>
                        </div>
                        <div className="col-span-1 hidden items-center sm:flex">
                            <p className="font-medium">Hành động</p>
                        </div>
                    </div>

                    {roleData.map((item) => (
                        <div
                            className="grid grid-cols-6 border-t border-stroke py-4.5 px-4 sm:grid-cols-8 md:px-6 2xl:px-7.5"
                            key={item._id}
                        >
                            <div className="col-span-1 flex items-center">
                                <p className="text-sm text-blue-600 dark:text-white">{item.name}</p>
                            </div>
                            <div className="col-span-3 flex items-center">
                                <p className="text-sm text-black dark:text-white">{item.description}</p>
                            </div>
                            <div className="col-span-1 flex items-center">
                                <p className="text-sm text-black dark:text-white">
                                    {moment(item.createdAt).format('ddd, DD/MM/YYYY, HH:mm')}
                                </p>
                            </div>
                            <div className="col-span-1 flex items-center">
                                <p className="text-sm text-black dark:text-white">
                                    {moment(item.updatedAt).format('ddd, DD/MM/YYYY, HH:mm')}
                                </p>
                            </div>
                            <div className="col-span-1 flex items-center">
                                <p className="text-sm text-black dark:text-white">
                                    {item.isActive ? (
                                        <CircleCheckBigIcon size={20} color="green" />
                                    ) : (
                                        <CircleX size={20} color="red" />
                                    )}
                                </p>
                            </div>
                            <div className="col-span-1 flex items-center">
                                <div className="flex items-center space-x-3.5">
                                    {hasPermission('683bcbbab0844882a0ba0399') && (
                                        <button
                                            onClick={() => {
                                                if (!permissionsData.length) {
                                                    toast.error('Danh sách quyền chưa được tải', {
                                                        position: 'top-right',
                                                        autoClose: 3000,
                                                    });
                                                    return;
                                                }
                                                handleEditRole(item);
                                            }}
                                            className="hover:text-blue-500"
                                        >
                                            <Pencil size={20} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal chỉnh sửa Role */}
            <Transition show={isEditModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={() => setIsEditModalOpen(false)}>
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
                            <Dialog.Panel className="w-full max-w-4xl max-h-[80vh] bg-white rounded-lg shadow-xl p-6 overflow-y-auto">
                                <div className="flex items-center justify-between border-b pb-3">
                                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                                        Cập nhật Role
                                    </Dialog.Title>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setIsEditModalOpen(false)}
                                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            onClick={handleUpdateRole}
                                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                                        >
                                            Cập nhật
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <div className="flex space-x-4 mb-4">
                                        <div className="flex-1">
                                            <label className="mb-2 block text-black dark:text-white">
                                                Tên Role <span className="text-meta-1">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={editForm.name}
                                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                placeholder="Nhập tên role"
                                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                                required
                                            />
                                        </div>
                                        <div className="flex-1 flex items-center">
                                            <label className="mb-2 block text-black dark:text-white mr-4">
                                                Trạng thái
                                            </label>
                                            <button
                                                onClick={() => setEditForm({ ...editForm, isActive: !editForm.isActive })}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${editForm.isActive ? 'bg-blue-500' : 'bg-gray-300'
                                                    }`}
                                            >
                                                <span
                                                    className={`absolute h-4 w-4 rounded-full bg-white transition-transform duration-200 ${editForm.isActive ? 'translate-x-5' : 'translate-x-1'
                                                        }`}
                                                />
                                            </button>
                                            <span className="ml-2 text-black dark:text-white">
                                                {editForm.isActive ? 'Hoạt động' : 'Dừng hoạt động'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="mb-2 block text-black dark:text-white">
                                            Mô tả <span className="text-meta-1">*</span>
                                        </label>
                                        <textarea
                                            value={editForm.description}
                                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                            placeholder="Nhập mô tả role"
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                            rows={2}
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="mb-2 block text-black dark:text-white">
                                            Quyền hạn
                                        </label>
                                        {editForm.permissions.map((group, groupIndex) => (
                                            <div key={group.group} className="mb-2">
                                                <div className="flex items-center justify-between bg-gray-100 p-2 rounded cursor-pointer">
                                                    <div className="flex items-center">
                                                        <span
                                                            className="text-sm font-medium text-black mr-4"
                                                            onClick={() => toggleGroup(group.group)}
                                                        >
                                                            {group.group}
                                                        </span>
                                                        <button
                                                            onClick={() => enableAllPermissionsInEditGroup(groupIndex)}
                                                            className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition text-xs mr-2"
                                                        >
                                                            Bật tất cả
                                                        </button>
                                                        <button
                                                            onClick={() => disableAllPermissionsInEditGroup(groupIndex)}
                                                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-xs"
                                                        >
                                                            Tắt tất cả
                                                        </button>
                                                    </div>
                                                    {expandedGroups.includes(group.group) ? (
                                                        <ChevronUp size={20} onClick={() => toggleGroup(group.group)} />
                                                    ) : (
                                                        <ChevronDown size={20} onClick={() => toggleGroup(group.group)} />
                                                    )}
                                                </div>
                                                {expandedGroups.includes(group.group) && (
                                                    <div className="mt-2 grid grid-cols-2 gap-2">
                                                        {group.permissions.map((perm, permIndex) => (
                                                            <div key={perm._id} className="mb-2 border rounded p-2 bg-white">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-sm text-black">{perm.name}</span>
                                                                    <button
                                                                        onClick={() => toggleEditPermission(groupIndex, permIndex)}
                                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${perm.enabled ? 'bg-blue-500' : 'bg-gray-300'
                                                                            }`}
                                                                    >
                                                                        <span
                                                                            className={`absolute h-4 w-4 rounded-full bg-white transition-transform duration-200 ${perm.enabled ? 'translate-x-5' : 'translate-x-1'
                                                                                }`}
                                                                        />
                                                                    </button>
                                                                </div>
                                                                <div className="mt-1 text-sm font-mono">
                                                                    <span
                                                                        className={`mr-1 font-bold ${perm.method.toUpperCase() === 'GET'
                                                                            ? 'text-green-600'
                                                                            : perm.method.toUpperCase() === 'POST'
                                                                                ? 'text-blue-600'
                                                                                : perm.method.toUpperCase() === 'PATCH'
                                                                                    ? 'text-yellow-600'
                                                                                    : perm.method.toUpperCase() === 'DELETE'
                                                                                        ? 'text-red-600'
                                                                                        : 'text-gray-600'
                                                                            }`}
                                                                    >
                                                                        {perm.method.toUpperCase()}
                                                                    </span>
                                                                    <span className="text-black">{perm.apiPath}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition>

            {/* Modal thêm mới Role */}
            <Transition show={isCreateModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={() => setIsCreateModalOpen(false)}>
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
                            <Dialog.Panel className="w-full max-w-4xl max-h-[80vh] bg-white rounded-lg shadow-xl p-6 overflow-y-auto">
                                <div className="flex items-center justify-between border-b pb-3">
                                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                                        Thêm mới Role
                                    </Dialog.Title>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setIsCreateModalOpen(false)}
                                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            onClick={handleCreateRole}
                                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                                        >
                                            Tạo mới
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <div className="flex space-x-4 mb-4">
                                        <div className="flex-1">
                                            <label className="mb-2 block text-black dark:text-white">
                                                Tên Role <span className="text-meta-1">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={createForm.name}
                                                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                                                placeholder="Nhập tên role"
                                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                                required
                                            />
                                        </div>
                                        <div className="flex-1 flex items-center">
                                            <label className="mb-2 block text-black dark:text-white mr-4">
                                                Trạng thái
                                            </label>
                                            <button
                                                onClick={() => setCreateForm({ ...createForm, isActive: !createForm.isActive })}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${createForm.isActive ? 'bg-blue-500' : 'bg-gray-300'
                                                    }`}
                                            >
                                                <span
                                                    className={`absolute h-4 w-4 rounded-full bg-white transition-transform duration-200 ${createForm.isActive ? 'translate-x-5' : 'translate-x-1'
                                                        }`}
                                                />
                                            </button>
                                            <span className="ml-2 text-black dark:text-white">
                                                {createForm.isActive ? 'Hoạt động' : 'Dừng hoạt động'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="mb-2 block text-black dark:text-white">
                                            Mô tả <span className="text-meta-1">*</span>
                                        </label>
                                        <textarea
                                            value={createForm.description}
                                            onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                                            placeholder="Nhập mô tả role"
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                            rows={2}
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="mb-2 block text-black dark:text-white">
                                            Quyền hạn
                                        </label>
                                        {createForm.permissions.map((group, groupIndex) => (
                                            <div key={group.group} className="mb-2">
                                                <div className="flex items-center justify-between bg-gray-100 p-2 rounded cursor-pointer">
                                                    <div className="flex items-center">
                                                        <span
                                                            className="text-sm font-medium text-black mr-4"
                                                            onClick={() => toggleGroup(group.group)}
                                                        >
                                                            {group.group}
                                                        </span>
                                                        <button
                                                            onClick={() => enableAllPermissionsInGroup(groupIndex)}
                                                            className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition text-xs mr-2"
                                                        >
                                                            Bật tất cả
                                                        </button>
                                                        <button
                                                            onClick={() => disableAllPermissionsInGroup(groupIndex)}
                                                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-xs"
                                                        >
                                                            Tắt tất cả
                                                        </button>
                                                    </div>
                                                    {expandedGroups.includes(group.group) ? (
                                                        <ChevronUp size={20} onClick={() => toggleGroup(group.group)} />
                                                    ) : (
                                                        <ChevronDown size={20} onClick={() => toggleGroup(group.group)} />
                                                    )}
                                                </div>
                                                {expandedGroups.includes(group.group) && (
                                                    <div className="mt-2 grid grid-cols-2 gap-2">
                                                        {group.permissions.map((perm, permIndex) => (
                                                            <div key={perm._id} className="mb-2 border rounded p-2 bg-white">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-sm text-black">{perm.name}</span>
                                                                    <button
                                                                        onClick={() => togglePermission(groupIndex, permIndex)}
                                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${perm.enabled ? 'bg-blue-500' : 'bg-gray-300'
                                                                            }`}
                                                                    >
                                                                        <span
                                                                            className={`absolute h-4 w-4 rounded-full bg-white transition-transform duration-200 ${perm.enabled ? 'translate-x-5' : 'translate-x-1'
                                                                                }`}
                                                                        />
                                                                    </button>
                                                                </div>
                                                                <div className="mt-1 text-sm font-mono">
                                                                    <span
                                                                        className={`mr-1 font-bold ${perm.method.toUpperCase() === 'GET'
                                                                            ? 'text-green-600'
                                                                            : perm.method.toUpperCase() === 'POST'
                                                                                ? 'text-blue-600'
                                                                                : perm.method.toUpperCase() === 'PATCH'
                                                                                    ? 'text-yellow-600'
                                                                                    : perm.method.toUpperCase() === 'DELETE'
                                                                                        ? 'text-red-600'
                                                                                        : 'text-gray-600'
                                                                            }`}
                                                                    >
                                                                        {perm.method.toUpperCase()}
                                                                    </span>
                                                                    <span className="text-black">{perm.apiPath}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
};

export default Roles;