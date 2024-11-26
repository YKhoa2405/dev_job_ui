import { CircleCheckBigIcon, CircleX, Eye, Pencil, Plus, TrashIcon } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { authApi, endpoints } from '../common/API';
import { IRole } from '../types/role';
import moment from "moment";
import "moment/locale/vi"; // Đảm bảo ngôn ngữ tiếng Việt được import
const Roles = () => {
    moment.locale("vi");
    const [roleData, setRoleData] = useState<IRole[]>([]);


    useEffect(() => {
        fetchListRole();
    }, []);

    const fetchListRole = async () => {
        try {
            const token: any = localStorage.getItem("access_token");
            const res = await authApi(token).get(endpoints['roles'])
            setRoleData(res.data.data.result)
            console.log(res)
        } catch (error) {
            console.log(error)
        }
    }


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
                            className="inline-flex items-center justify-center gap-2.5 bg-primary py-2 px-5 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 rounded-md">
                            <Plus size={20} />
                            Thêm mới
                        </Link>
                    </div>

                    <div className="grid grid-cols-6 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5">
                        <div className="col-span-2 flex items-center">
                            <p className="font-medium">Id</p>
                        </div>
                        <div className="col-span-2 flex items-center">
                            <p className="font-medium">Tên</p>
                        </div>
                        <div className="col-span-2 hidden items-center sm:flex">
                            <p className="font-medium">Ngày tạo</p>
                        </div>
                        <div className="col-span-1 hidden items-center sm:flex">
                            <p className="font-medium">Trạng thái</p>
                        </div>
                        <div className="col-span-1 flex items-center">
                            <p className="font-medium">Hành động</p>
                        </div>
                    </div>

                    {roleData.map((item) => (
                        <div
                            className="grid grid-cols-6 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5"
                            key={item._id}>
                            <div className="col-span-2 flex items-center">
                                <p className="text-sm text-blue-600 dark:text-white">
                                    {item._id}
                                </p>
                            </div>
                            <div className="col-span-2 flex items-center">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                    <p className="text-sm text-black dark:text-white">
                                        {item.name}
                                    </p>
                                </div>
                            </div>
                            <div className="col-span-2 flex items-center">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                    <p className="text-sm text-black dark:text-white">
                                        {moment(item.createdAt).format("ddd, DD/MM/YYYY, HH:mm")}
                                    </p>
                                </div>
                            </div>
                            <div className="col-span-1 flex items-center">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                    <p className="text-sm text-black dark:text-white">
                                        {item.isActive ? (
                                            <CircleCheckBigIcon size={20} color="green" />
                                        ) : (
                                            <CircleX size={20} color="red" />
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="col-span-1 flex items-center">
                                <div className="flex items-center space-x-3.5">
                                    <button className="hover:text-primary">
                                        <Eye size={20} />
                                    </button>
                                    <button className="hover:text-primary">
                                        <Pencil size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Roles;
