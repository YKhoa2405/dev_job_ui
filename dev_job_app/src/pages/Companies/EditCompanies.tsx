import React, { useEffect, useState } from 'react';
import { authApi, endpoints } from '../../common/API';
import moment from 'moment';
import "moment/locale/vi";
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import Loader from '../../common/Loader';
import { useParams } from 'react-router-dom';
import { ICompanyDetail } from '../../types/company';


const EditCompanies = () => {
    moment.locale("vi");
    const [companyDetail, setCompanyDetail] = useState<ICompanyDetail | null>();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const { id } = useParams<{ id?: string }>();

    const toggleActiveStatus = () => {
        if (companyDetail) {
            setCompanyDetail(prev => prev ? { ...prev, isApproved: !prev.isApproved } : null);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCompanyDetail((prev) => ({
            ...prev!,
            [name]: value,
        }));
    };

    useEffect(() => {
        fetchCompanyDetail();
    }, []);

    const fetchCompanyDetail = async () => {
        setLoading(true)
        try {
            const token: any = localStorage.getItem("access_token");
            const res = await authApi(token).get(endpoints['companiesDetail'](id!));
            setCompanyDetail(res.data.data)
        } catch (error) {
            console.log('Error fetching resume:', error);
        } finally { setLoading(false) }
    }

    const handleUpdateCompany = async (e: { preventDefault: () => void; }) => {
        e.preventDefault(); // Ngăn chặn form reload mặc định
        console.log(companyDetail?.isApproved)
        try {
            const token: any = localStorage.getItem("access_token");
            await authApi(token).patch(endpoints['companiesDetail'](id!), {
                name: companyDetail?.name,
                slogan: companyDetail?.slogan,
                size: companyDetail?.size,
                address: companyDetail?.address,
                field: companyDetail?.field,
                website: companyDetail?.website,
                isApproved: companyDetail?.isApproved,
                // // avatar: companyDetail?.avatar,
                about: companyDetail?.about,

            });
            toast.success('Cập nhật thành công!', {
                position: "top-right",
                autoClose: 3000,
            });
            navigate("/admin/companies");
        } catch (error) {
            console.log('Error updating company:', error);
            toast.error('Cập nhật thất bại!', {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };


    return (
        <>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-title-md2 font-semibold text-black dark:text-white">
                    Chỉnh sửa công ty
                </h2>
                <nav>
                    <ol className="flex items-center gap-2">
                        <li>
                            <Link className="font-medium" to="/admin/companies">
                                Quản lý công ty /
                            </Link>
                        </li>
                        <li className="font-medium text-primary">Chỉnh sửa công ty</li>
                    </ol>
                </nav>
            </div>

            {loading ? (
                <Loader />

            ) : (
                <div className="flex flex-col gap-10">
                    <form className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark" onSubmit={handleUpdateCompany}>
                        <div className="p-6.5">
                            {/* Hàng 1 */}
                            <div className="flex space-x-4 mb-4.5">
                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Tên công ty</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={companyDetail?.name || ''}
                                        onChange={handleInputChange}
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Slogan</label>
                                    <input
                                        type="text"
                                        name="slogan"
                                        value={companyDetail?.slogan || ''}
                                        onChange={handleInputChange}
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Quy mô công ty</label>
                                    <input
                                        type="text"
                                        name="size"
                                        value={companyDetail?.size || ''}
                                        onChange={handleInputChange}
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Hàng 2 */}
                            <div className="flex space-x-4 mb-4.5">
                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Địa chỉ công ty</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={companyDetail?.address || ''}
                                        onChange={handleInputChange}
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Lĩnh vực hoạt động</label>
                                    <input
                                        type="text"
                                        name="field"
                                        value={companyDetail?.field || ''}
                                        onChange={handleInputChange}
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-5 gap-4 mb-4.5">
                                <div className="col-span-3">
                                    <label className="mb-2.5 block text-black dark:text-white">Website</label>

                                    <input
                                        type="url"
                                        name="website"
                                        value={companyDetail?.website || ''}
                                        onChange={handleInputChange}
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white"

                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Logo</label>
                                    <img
                                        src={companyDetail?.avatar}
                                        alt="Uploaded"
                                        className="h-20 w-20 rounded-full object-cover"

                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Trạng thái</label>
                                    <button
                                        type="button"
                                        onClick={toggleActiveStatus}
                                        className={`w-full rounded py-3 px-5 text-white ${companyDetail?.isApproved ? 'bg-green-500' : 'bg-red-500'} hover:bg-opacity-90`}
                                    >
                                        {companyDetail?.isApproved ? 'Hoạt động' : 'Dừng hoạt động'}
                                    </button>
                                </div>
                            </div>

                            {/* Hàng 4 */}
                            <div className="flex space-x-4 mb-4.5">
                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Giới thiệu</label>
                                    <textarea
                                        name="description"
                                        value={companyDetail?.about || ''}
                                        onChange={handleInputChange}
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                        rows={4}
                                    ></textarea>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                            >
                                Cập nhật
                            </button>
                        </div>
                    </form>

                </div>
            )
            }
        </>
    );
};

export default EditCompanies;


