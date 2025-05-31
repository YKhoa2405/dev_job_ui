import { useEffect, useState } from 'react';
import { authApi, endpoints } from '../../common/API';
import moment from 'moment';
import "moment/locale/vi";
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { ICompanyDetail } from '../../types/company';
import { ChevronLeft, ChevronRight, CircleCheckBigIcon, CircleX } from 'lucide-react';
import { IJobList } from '../../types/job';
import Loader from '../../common/Loader';
import { IOrder } from '../../types/order';

const CompanyDetail = () => {
    moment.locale("vi");
    const [companyDetail, setCompanyDetail] = useState<ICompanyDetail | null>(null);
    const [jobData, setJobData] = useState<IJobList[]>([]);
    const [orderData, setOrderData] = useState<IOrder[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [limit, setLimit] = useState(10);
    const [loading, setLoading] = useState(false);
    const { id } = useParams<{ id?: string }>();

    const displayOptions = [
        { value: 5, label: '5 mục' }, // Adjusted value to match label
        { value: 10, label: '10 mục' },
        { value: 20, label: '20 mục' },
        { value: 50, label: '50 mục' },
        { value: 100, label: '100 mục' },
    ];

    useEffect(() => {
        fetchCompanyDetail();
        fetchOrderByCompany();
    }, [id]);

    useEffect(() => {
        fetchJobByCompany(currentPage, limit);
    }, [id, currentPage, limit]); // Added `id` to dependencies to ensure re-fetch on ID change

    const fetchCompanyDetail = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("access_token");
            const res = await authApi(token).get(endpoints['companiesDetail'](id!));
            setCompanyDetail(res.data.data);
        } catch (error) {
            console.error('Error fetching company detail:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrderByCompany = async () => {
        try {
            const token = localStorage.getItem("access_token");
            const res = await authApi(token).get(endpoints['ordersByCompany'](id!));
            setOrderData(res.data.data.result);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const fetchJobByCompany = async (page: number, limit: number) => {
        setLoading(true); // Show loading while fetching jobs
        try {
            const token = localStorage.getItem("access_token");
            const res = await authApi(token).get(endpoints['jobsByCompany'](id!), {
                params: {
                    page,
                    limit,
                },
            });
            const data = res.data.data;
            setJobData(data.result);
            setCurrentPage(data.meta.currentPage);
            setTotalPages(data.meta.totalPages);
            setTotalItems(data.meta.totalItems);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
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

    const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLimit = Number(e.target.value);
        setLimit(newLimit);
        setCurrentPage(1); // Reset to first page when limit changes
    };

    return (
        <>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-title-md2 font-semibold text-black dark:text-white">
                    Chi tiết công ty
                </h2>
                <nav>
                    <ol className="flex items-center gap-2">
                        <li>
                            <Link className="font-medium" to="/admin/companies">
                                Quản lý công ty /
                            </Link>
                        </li>
                        <li className="font-medium text-primary">Chi tiết công ty</li>
                    </ol>
                </nav>
            </div>

            {loading ? (
                <Loader />
            ) : (
                <div className="flex flex-col gap-10">
                    {/* Company Details Section */}
                    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                        <div className="p-6.5">
                            <div className="flex space-x-4 mb-4.5">
                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Tên công ty</label>
                                    <div className="w-full py-3 px-5 text-black dark:text-white bg-transparent border-[1.5px] border-stroke rounded dark:border-form-strokedark">
                                        {companyDetail?.name || 'N/A'}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Quy mô công ty</label>
                                    <div className="w-full py-3 px-5 text-black dark:text-white bg-transparent border-[1.5px] border-stroke rounded dark:border-form-strokedark">
                                        {companyDetail?.size || 'N/A'}
                                    </div>
                                </div>
                            </div>
                            {/* Other company details fields */}
                            <div className="flex space-x-4 mb-4.5">
                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Địa chỉ công ty</label>
                                    <div className="w-full py-3 px-5 text-black dark:text-white bg-transparent border-[1.5px] border-stroke rounded dark:border-form-strokedark">
                                        {companyDetail?.address || 'N/A'}
                                    </div>
                                </div>
                            </div>
                            <div className="flex space-x-4 mb-4.5">
                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Mã số thuế</label>
                                    <div className="w-full py-3 px-5 text-black dark:text-white bg-transparent border-[1.5px] border-stroke rounded dark:border-form-strokedark">
                                        {companyDetail?.taxCode || 'N/A'}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Slogan</label>
                                    <div className="w-full py-3 px-5 text-black dark:text-white bg-transparent border-[1.5px] border-stroke rounded dark:border-form-strokedark">
                                        {companyDetail?.slogan || 'N/A'}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Lĩnh vực hoạt động</label>
                                    <div className="w-full py-3 px-5 text-black dark:text-white bg-transparent border-[1.5px] border-stroke rounded dark:border-form-strokedark">
                                        {companyDetail?.field || 'N/A'}
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-5 gap-4 mb-4.5">
                                <div className="col-span-3">
                                    <label className="mb-2.5 block text-black dark:text-white">Website</label>
                                    <div className="w-full py-3 px-5 text-black dark:text-white bg-transparent border-[1.5px] border-stroke rounded dark:border-form-strokedark">
                                        {companyDetail?.website || 'N/A'}
                                    </div>
                                </div>
                                <div className="col-span-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Logo</label>
                                    <img
                                        src={companyDetail?.avatar || '/default-logo.png'}
                                        alt="Logo"
                                        className="h-20 w-20 rounded-full object-cover"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Trạng thái</label>
                                    <div
                                        className={`w-full py-3 px-5 text-white text-center rounded ${companyDetail?.isApproved ? 'bg-green-500' : 'bg-red-500'}`}
                                    >
                                        {companyDetail?.isApproved ? 'Hoạt động' : 'Dừng hoạt động'}
                                    </div>
                                </div>
                            </div>
                            <div className="flex space-x-4 mb-4.5">
                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Giới thiệu</label>
                                    <div className="w-full py-3 px-5 text-black dark:text-white bg-transparent border-[1.5px] border-stroke rounded dark:border-form-strokedark">
                                        {companyDetail?.about || 'N/A'}
                                    </div>
                                </div>
                            </div>
                            <div className="flex space-x-4 mb-4.5">
                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Giấy phép kinh doanh</label>
                                    {companyDetail?.businessLicenseUrl ? (
                                        <a
                                            href={companyDetail.businessLicenseUrl}
                                            target="_blank"
                                            className="bg-blue-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-600 transition"
                                        >
                                            Xem chi tiết
                                        </a>
                                    ) : (
                                        "Chưa cập nhật"
                                    )}
                                </div>
                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Số người theo dõi</label>
                                    <div className="w-full py-3 px-5 text-black dark:text-white bg-transparent border-[1.5px] border-stroke rounded dark:border-form-strokedark">
                                        {companyDetail?.followers || 0}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Người tạo tài khoản</label>
                                    <div className="w-full py-3 px-5 text-black dark:text-white bg-transparent border-[1.5px] border-stroke rounded dark:border-form-strokedark">
                                        {companyDetail?.createBy?.email || 'N/A'}
                                    </div>
                                </div>
                            </div>
                            <div className="flex space-x-4 mb-4.5">
                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Ngày tạo tài khoản</label>
                                    <div className="w-full py-3 px-5 text-black dark:text-white bg-transparent border-[1.5px] border-stroke rounded dark:border-form-strokedark">
                                        {companyDetail?.createdAt ? moment(companyDetail.createdAt).format("ddd, DD/MM/YYYY, HH:mm") : 'N/A'}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Ngày cập nhật</label>
                                    <div className="w-full py-3 px-5 text-black dark:text-white bg-transparent border-[1.5px] border-stroke rounded dark:border-form-strokedark">
                                        {companyDetail?.updatedAt ? moment(companyDetail.updatedAt).format("ddd, DD/MM/YYYY, HH:mm") : 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Job Listings Section (Moved Up) */}
                    <div className="rounded-sm border border-stroke bg-white shadow-default">
                        <div className="py-6 px-4 md:px-6 xl:px-7.5">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xl font-semibold text-black ">Tin tuyển dụng</h4>
                            </div>
                        </div>

                        <div className="grid grid-cols-6 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5">
                            <div className="col-span-2 flex items-center">
                                <p className="font-medium">Tiêu đề</p>
                            </div>
                            <div className="col-span-1 hidden items-center sm:flex">
                                <p className="font-medium">Mức lương</p>
                            </div>
                            <div className="col-span-1 flex items-center">
                                <p className="font-medium">Level</p>
                            </div>
                            <div className="col-span-1 flex items-center">
                                <p className="font-medium">Trạng thái</p>
                            </div>
                            <div className="col-span-1 hidden sm:flex items-center">
                                <p className="font-medium">Số lượng tuyển</p>
                            </div>
                            <div className="col-span-2 hidden sm:flex items-center">
                                <p className="font-medium">Ngày tạo</p>
                            </div>
                        </div>
                        <div>
                            {jobData.map((item) => (
                                <div
                                    className="grid grid-cols-6 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5"
                                    key={item._id}
                                >
                                    <Link to={`/admin/jobs/${item._id}`} className="col-span-2 flex items-center">
                                        <p className="text-sm text-blue-600">{item.name}</p>
                                    </Link>
                                    <div className="col-span-1 hidden items-center sm:flex">
                                        <p className="text-sm text-black">{item.salary || 'N/A'}</p>
                                    </div>
                                    <div className="col-span-1 flex items-center">
                                        <p className="text-sm text-black">{item.level || 'N/A'}</p>
                                    </div>
                                    <div className="col-span-1 flex items-center">
                                        <p className="text-sm text-black">
                                            {item.isActive ? (
                                                <CircleCheckBigIcon size={20} color="green" />
                                            ) : (
                                                <CircleX size={20} color="red" />
                                            )}
                                        </p>
                                    </div>
                                    <div className="col-span-1 hidden items-center sm:flex">
                                        <p className="text-sm text-black">{item.quantity || 0}</p>
                                    </div>
                                    <div className="col-span-2 hidden items-center sm:flex"> <p className="text-sm text-black ">{moment(item.createAt).format("ddd, DD/MM/YYYY, HH:mm")} </p> </div>
                                </div>
                            ))}
                        </div>

                        <div className="py-6 px-4 md:px-6 xl:px-7.5 border-t border-stroke dark:border-strokedark">
                            <div className="flex items-center justify-between">
                                <h6 className="text-base font-semibold text-black">Tổng {totalItems} tin tuyển dụng</h6>
                                <div className="flex items-center justify-center gap-4">
                                    <select
                                        value={limit}
                                        onChange={handleLimitChange}
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
                                    <p className="font-medium text-black mx-4" style={{ width: '100px', textAlign: 'center' }}>
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

                    {/* Purchased Services Section */}
                    <div className="rounded-sm border border-stroke bg-white shadow-default">
                        <div className="py-6 px-4 md:px-6 xl:px-7.5">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xl font-semibold text-black">Dịch vụ đã mua</h4>
                            </div>
                        </div>

                        <div className="grid grid-cols-8 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5">
                            <div className="col-span-2 flex items-center">
                                <p className="font-medium">Tên dịch vụ</p>
                            </div>
                            <div className="col-span-1 hidden items-center sm:flex">
                                <p className="font-medium">Giá (VND)</p>
                            </div>
                            <div className="col-span-2 hidden sm:flex items-center">
                                <p className="font-medium">Ngày mua</p>
                            </div>
                            <div className="col-span-2 flex items-center">
                                <p className="font-medium">Ngày hết hạn</p>
                            </div>
                            <div className="col-span-1 flex items-center">
                                <p className="font-medium">Trạng thái</p>
                            </div>
                        </div>
                        <div>
                            {orderData.map((item) => (
                                <div
                                    className="grid grid-cols-8 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5"
                                    key={item._id}
                                >
                                    <div className="col-span-2 flex items-center">
                                        <p className="text-sm text-black">{item.serviceId?.name || 'N/A'}</p>
                                    </div>
                                    <div className="col-span-1 hidden items-center sm:flex">
                                        <p className="text-sm text-black">{item.amount ? item.amount.toLocaleString('vi-VN') : 'N/A'}</p>
                                    </div>
                                    <div className="col-span-2 hidden items-center sm:flex">
                                        <p className="text-sm text-black">
                                            {item.createdAt ? moment(item.createdAt).format("ddd, DD/MM/YYYY, HH:mm") : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="col-span-2 hidden items-center sm:flex">
                                        <p className="text-sm text-black">
                                            {item.endDate ? moment(item.endDate).format("ddd, DD/MM/YYYY, HH:mm") : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="col-span-1 flex items-center">
                                        <p className="text-sm text-black">
                                            {item.isActive ? (
                                                <CircleCheckBigIcon size={20} color="green" />
                                            ) : (
                                                <CircleX size={20} color="red" />
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CompanyDetail;