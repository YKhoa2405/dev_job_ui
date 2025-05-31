import { CircleCheckBigIcon, CircleX, Pencil, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { authApi, endpoints } from '../../common/API';
import { IRole } from '../../types/role';
import moment from "moment";
import "moment/locale/vi";
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

// Mock data cho quyền hạn
const mockPermissions = [
    {
        group: "COMPANIES",
        permissions: [
            { name: "Get Company with paginate", endpoint: "GET /api/v1/companies", active: true },
            { name: "Create Company", endpoint: "POST /api/v1/companies", active: false },
            { name: "Get Company by id", endpoint: "GET /api/v1/companies/:id", active: true },
            { name: "Delete Company", endpoint: "DELETE /api/v1/companies/:id", active: false },
        ],
    },
    {
        group: "USERS",
        permissions: [
            { name: "Get User with paginate", endpoint: "GET /api/v1/users", active: true },
            { name: "Create User", endpoint: "POST /api/v1/users", active: false },
        ],
    },
    {
        group: "PRODUCTS",
        permissions: [
            { name: "Get Product with paginate", endpoint: "GET /api/v1/products", active: true },
            { name: "Create Product", endpoint: "POST /api/v1/products", active: false },
            { name: "Update Product", endpoint: "PUT /api/v1/products/:id", active: true },
            { name: "Delete Product", endpoint: "DELETE /api/v1/products/:id", active: false },
        ],
    },
];

const Roles = () => {
    moment.locale("vi");
    const [roleData, setRoleData] = useState<IRole[]>([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<IRole | null>(null);
    const [editForm, setEditForm] = useState({
        name: "",
        description: "",
        isActive: true,
        permissions: mockPermissions,
    });
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]); // Quản lý trạng thái thu gọn/mở rộng của các nhóm

    useEffect(() => {
        fetchListRole();
    }, []);

    const fetchListRole = async () => {
        try {
            const token: string | null = localStorage.getItem("access_token");
            const res = await authApi(token).get(endpoints['roles']);
            setRoleData(res.data.data.result);
        } catch (error) {
            console.error(error);
        }
    };

    const handleEditRole = (role: IRole) => {
        setSelectedRole(role);
        setEditForm({
            name: role.name,
            description: role.description || "",
            isActive: role.isActive,
            permissions: mockPermissions, // Trong thực tế, bạn sẽ lấy permissions từ API
        });
        setExpandedGroups(mockPermissions.map(group => group.group)); // Mở tất cả các nhóm mặc định
        setIsEditModalOpen(true);
    };

    const handleUpdateRole = async () => {
        try {
            const token: string | null = localStorage.getItem("access_token");
            await authApi(token).put(endpoints['roles'] + `/${selectedRole?._id}`, {
                name: editForm.name,
                description: editForm.description,
                isActive: editForm.isActive,
                permissions: editForm.permissions,
            });
            fetchListRole();
            setIsEditModalOpen(false);
        } catch (error) {
            console.error(error);
        }
    };

    const togglePermission = (groupIndex: number, permIndex: number) => {
        const updatedPermissions = [...editForm.permissions];
        updatedPermissions[groupIndex].permissions[permIndex].active = !updatedPermissions[groupIndex].permissions[permIndex].active;
        setEditForm({ ...editForm, permissions: updatedPermissions });
    };

    const toggleGroup = (group: string) => {
        setExpandedGroups(prev =>
            prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
        );
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
                        <Link
                            to="#"
                            className="inline-flex items-center justify-center gap-2.5 bg-primary py-2 px-5 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 rounded-md"
                        >
                            <Plus size={20} />
                            Thêm mới
                        </Link>
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
                                    {moment(item.createdAt).format("ddd, DD/MM/YYYY, HH:mm")}
                                </p>
                            </div>
                            <div className="col-span-1 flex items-center">
                                <p className="text-sm text-black dark:text-white">
                                    {moment(item.updatedAt).format("ddd, DD/MM/YYYY, HH:mm")}
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
                                    <button onClick={() => handleEditRole(item)} className="hover:text-blue-500">
                                        <Pencil size={20} />
                                    </button>
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
                                <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                                    Cập nhật Role
                                </Dialog.Title>
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
                                            />
                                        </div>
                                        <div className="flex-1 flex items-center">
                                            <label className="mb-2 block text-black dark:text-white mr-4">
                                                Trạng thái
                                            </label>
                                            <button
                                                onClick={() => setEditForm({ ...editForm, isActive: !editForm.isActive })}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${editForm.isActive ? 'bg-green-500' : 'bg-gray-300'
                                                    }`}
                                            >
                                                <span
                                                    className={`absolute h-4 w-4 rounded-full bg-white transition-transform duration-200 ${editForm.isActive ? 'translate-x-5' : 'translate-x-1'
                                                        }`}
                                                />
                                            </button>
                                            <span className="ml-2 text-black dark:text-white">
                                                {editForm.isActive ? 'ACTIVE' : 'INACTIVE'}
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
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="mb-2 block text-black dark:text-white">
                                            Quyền hạn
                                        </label>
                                        {editForm.permissions.map((group, groupIndex) => (
                                            <div key={group.group} className="mb-2">
                                                <div className="flex items-center justify-between bg-gray-100 p-2 rounded cursor-pointer" onClick={() => toggleGroup(group.group)}>
                                                    <span className="text-sm font-medium text-black">{group.group}</span>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const updatedPermissions = [...editForm.permissions];
                                                                updatedPermissions[groupIndex].permissions = updatedPermissions[groupIndex].permissions.map(perm => ({
                                                                    ...perm,
                                                                    active: !updatedPermissions[groupIndex].permissions.every(p => p.active),
                                                                }));
                                                                setEditForm({ ...editForm, permissions: updatedPermissions });
                                                            }}
                                                            className="text-sm text-blue-500"
                                                        >
                                                            {group.permissions.every(p => p.active) ? 'Tắt tất cả' : 'Bật tất cả'}
                                                        </button>
                                                        {expandedGroups.includes(group.group) ? (
                                                            <ChevronUp size={16} />
                                                        ) : (
                                                            <ChevronDown size={16} />
                                                        )}
                                                    </div>
                                                </div>
                                                {expandedGroups.includes(group.group) && (
                                                    <div className="mt-2 grid grid-cols-2 gap-2">
                                                        {group.permissions.map((perm, permIndex) => (
                                                            <div key={perm.endpoint} className="flex items-center justify-between p-2 bg-white border rounded">
                                                                <span className="text-sm text-black">{perm.name}</span>
                                                                <button
                                                                    onClick={() => togglePermission(groupIndex, permIndex)}
                                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${perm.active ? 'bg-green-500' : 'bg-gray-300'
                                                                        }`}
                                                                >
                                                                    <span
                                                                        className={`absolute h-4 w-4 rounded-full bg-white transition-transform duration-200 ${perm.active ? 'translate-x-5' : 'translate-x-1'
                                                                            }`}
                                                                    />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                    </div>
                                </div>
                                <div className="mt-4 flex justify-end gap-3">
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
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
};

export default Roles;