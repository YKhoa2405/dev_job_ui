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
    const [companyDetail, setCompanyDetail] = useState<ICompanyDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams<{ id?: string }>();

    useEffect(() => {
        fetchCompanyDetail();
    }, [id]); // Include `id` in dependency array to refetch if it changes

    const fetchCompanyDetail = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("access_token");
            if (!token) throw new Error("No access token found");
            const res = await authApi(token).get(endpoints['companiesDetail'](id!));
            setCompanyDetail(res.data.data);
        } catch (error) {
            console.error('Error fetching company detail:', error);
            toast.error('Không thể tải thông tin công ty', {
                position: "top-right",
                autoClose: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCompanyDetail(prev => prev ? { ...prev, [name]: value } : null);
    };

    const toggleActiveStatus = () => {
        setCompanyDetail(prev => prev ? { ...prev, isApproved: !prev.isApproved } : null);
    };

    const validateForm = () => {
        if (!companyDetail?.name) return "Tên công ty không được để trống";
        if (!companyDetail?.address) return "Địa chỉ công ty không được để trống";
        if (!companyDetail?.field) return "Lĩnh vực hoạt động không được để trống";
        if (!companyDetail?.website || !/^https?:\/\/.+/.test(companyDetail.website)) return "Website không hợp lệ (phải bắt đầu bằng http:// hoặc https://)";
        return null;
    };

    const handleSave = async () => {
        const validationError = validateForm();
        if (validationError) {
            toast.error(validationError, {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("access_token");
            if (!token) throw new Error("No access token found");
            const updatedData = {
                name: companyDetail?.name,
                slogan: companyDetail?.slogan,
                size: companyDetail?.size,
                address: companyDetail?.address,
                field: companyDetail?.field,
                website: companyDetail?.website,
                isApproved: companyDetail?.isApproved,
                about: companyDetail?.about, // Changed from `description` to match state
            };
            const res = await authApi(token).patch(endpoints['companiesDetail'](id!), updatedData);
            setCompanyDetail(res.data.data);
            toast.success('Cập nhật công ty thành công!', {
                position: "top-right",
                autoClose: 3000,
            });
            // navigate("/admin/companies");
        } catch (error) {
            console.error('Error updating company:', error);
            toast.error('Cập nhật công ty thất bại', {
                position: "top-right",
                autoClose: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/admin/companies');
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
                    <form className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                        <div className="p-6.5">
                            <div className="flex justify-end mb-4">
                                <div className="space-x-2">
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90"
                                        disabled={loading}
                                    >
                                        Lưu
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-opacity-90"
                                        disabled={loading}
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </div>

                            {/* Hàng 1 */}
                            <div className="flex space-x-4 mb-4.5">
                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Tên công ty</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={companyDetail?.name || ''}
                                        onChange={handleInputChange}
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                        disabled={loading}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Slogan</label>
                                    <input
                                        type="text"
                                        name="slogan"
                                        value={companyDetail?.slogan || ''}
                                        onChange={handleInputChange}
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                        disabled={loading}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Quy mô công ty</label>
                                    <input
                                        type="text"
                                        name="size"
                                        value={companyDetail?.size || ''}
                                        onChange={handleInputChange}
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                        disabled={loading}
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
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                        disabled={loading}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Lĩnh vực hoạt động</label>
                                    <input
                                        type="text"
                                        name="field"
                                        value={companyDetail?.field || ''}
                                        onChange={handleInputChange}
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Hàng 3 */}
                            <div className="grid grid-cols-5 gap-4 mb-4.5">
                                <div className="col-span-3">
                                    <label className="mb-2.5 block text-black dark:text-white">Website</label>
                                    <input
                                        type="url"
                                        name="website"
                                        value={companyDetail?.website || ''}
                                        onChange={handleInputChange}
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                        disabled={loading}
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Logo</label>
                                    <img
                                        src={companyDetail?.avatar || "https://placehold.co/100x100"}
                                        alt="Company Logo"
                                        className="h-20 w-20 rounded-full object-cover"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Trạng thái</label>
                                    <button
                                        type="button"
                                        onClick={toggleActiveStatus}
                                        className={`w-full rounded py-3 px-5 text-white ${companyDetail?.isApproved ? 'bg-green-500' : 'bg-red-500'} hover:bg-opacity-90`}
                                        disabled={loading}
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
                                        name="about" // Changed from `description` to match state
                                        value={companyDetail?.about || ''}
                                        onChange={handleInputChange}
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                        rows={4}
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

export default EditCompanies;