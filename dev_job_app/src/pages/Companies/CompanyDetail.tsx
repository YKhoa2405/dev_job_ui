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
    const [companyDetail, setCompanyDetail] = useState<ICompanyDetail | null>();
    const [jobData, setJobData] = useState<IJobList[]>([]);
    const [orderData, setOrderData] = useState<IOrder[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [limit, setLimit] = useState(10);

    const [loading, setLoading] = useState(false);
    const { id } = useParams<{ id?: string }>();

    const displayOptions = [
        { value: 1, label: '5 mục' },
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
        fetchJobByCompany(currentPage, limit)
    }, [limit, currentPage]);

    const fetchCompanyDetail = async () => {
        setLoading(true);
        try {
            const token: any = localStorage.getItem("access_token");
            const res = await authApi(token).get(endpoints['companiesDetail'](id!));
            setCompanyDetail(res.data.data);
        } catch (error) {
            console.log('Error fetching company detail:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrderByCompany = async () => {
        try {
            const token: any = localStorage.getItem("access_token");
            const res = await authApi(token).get(endpoints['ordersByCompany'](id!));
            const data = res.data.data;
            console.log(data)
            setOrderData(data.result); // Update company data
        } catch (error) {
            console.log('Error fetching companies:', error);
        }
    };

    const fetchJobByCompany = async (currentPage = 1, limit = 10) => {
        try {
            const token: any = localStorage.getItem("access_token");
            const res = await authApi(token).get(endpoints['jobsByCompany'](id!), {
                params: {
                    page: currentPage,
                    limit: limit,
                },
            });
            const data = res.data.data;
            console.log(data)
            setJobData(data.result); // Update company data
            setCurrentPage(data.meta.currentPage); // Update the current page from API response
            setTotalPages(data.meta.totalPages); // Update the total pages from API response
            setTotalItems(data.meta.totalItems); // Update the total pages from API response

        } catch (error) {
            console.log('Error fetching companies:', error);
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
                    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                        <div className="p-6.5">
                            <div className="flex space-x-4 mb-4.5">
                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Tên công ty</label>
                                    <div className="w-full py-3 px-5 text-black dark:text-white bg-transparent border-[1.5px] border-stroke rounded dark:border-form-strokedark">
                                        {companyDetail?.name}
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Quy mô công ty</label>
                                    <div className="w-full py-3 px-5 text-black dark:text-white bg-transparent border-[1.5px] border-stroke rounded dark:border-form-strokedark">
                                        {companyDetail?.size}
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-4 mb-4.5">
                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Địa chỉ công ty</label>
                                    <div className="w-full py-3 px-5 text-black dark:text-white bg-transparent border-[1.5px] border-stroke rounded dark:border-form-strokedark">
                                        {companyDetail?.address}
                                    </div>
                                </div>
                            </div>
                            {/* Hàng 2 */}
                            <div className="flex space-x-4 mb-4.5">
                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Slogan</label>
                                    <div className="w-full py-3 px-5 text-black dark:text-white bg-transparent border-[1.5px] border-stroke rounded dark:border-form-strokedark">
                                        {companyDetail?.slogan}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Lĩnh vực hoạt động</label>
                                    <div className="w-full py-3 px-5 text-black dark:text-white bg-transparent border-[1.5px] border-stroke rounded dark:border-form-strokedark">
                                        {companyDetail?.field}
                                    </div>
                                </div>
                            </div>

                            {/* Hàng 3 */}
                            <div className="grid grid-cols-5 gap-4 mb-4.5">
                                <div className="col-span-3">
                                    <label className="mb-2.5 block text-black dark:text-white">Website</label>
                                    <div className="w-full py-3 px-5 text-black dark:text-white bg-transparent border-[1.5px] border-stroke rounded dark:border-form-strokedark">
                                        {companyDetail?.website}
                                    </div>
                                </div>
                                <div className="col-span-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Logo</label>
                                    <img
                                        src={companyDetail?.avatar}
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

                            {/* Hàng 4 */}
                            <div className="flex space-x-4 mb-4.5">
                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Giới thiệu</label>
                                    <div className="w-full py-3 px-5 text-black dark:text-white bg-transparent border-[1.5px] border-stroke rounded dark:border-form-strokedark">
                                        {companyDetail?.about}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-sm border border-stroke bg-white shadow-default">
                        <div className="py-6 px-4 md:px-6 xl:px-7.5">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xl font-semibold text-black ">Dịch vụ đã mua</h4>
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
                                        <p className="text-sm text-blue-600 ">{item.serviceId.name}</p>
                                    </div>
                                    <div className="col-span-1 hidden items-center sm:flex">
                                        <p className="text-sm text-black ">{item.amount.toLocaleString('vi-VN')}</p>
                                    </div>
                                    <div className="col-span-2 hidden items-center sm:flex">
                                        <p className="text-sm text-black ">{moment(item.createdAt).format("ddd, DD/MM/YYYY, HH:mm")}</p>
                                    </div>
                                    <div className="col-span-2 hidden items-center sm:flex">
                                        <p className="text-sm text-black ">{moment(item.endDate).format("ddd, DD/MM/YYYY, HH:mm")}
                                        </p>
                                    </div>
                                    <div className="col-span-1 flex items-center">
                                        <p className="text-sm text-black ">
                                            {item.isActive ? (
                                                <CircleCheckBigIcon size={20} color="green" />
                                            ) : (
                                                <CircleX size={20} color="red" />
                                            )}</p>
                                    </div>
                                    {/* <div className="col-span-1 hidden items-center sm:flex">
                                        <button className="hover:text-primary">
                                            <Pencil size={20} />
                                        </button>
                                    </div> */}
                                </div>
                            ))}
                        </div>

                    </div>

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
                                    <a className="col-span-2 flex items-center" href={`/admin/jobs/${item._id}`}>
                                        <p className="text-sm text-blue-600 ">{item.name}</p>
                                    </a>
                                    <div className="col-span-1 hidden items-center sm:flex">
                                        <p className="text-sm text-black ">{item.salary}</p>
                                    </div>
                                    <div className="col-span-1 hidden items-center sm:flex">
                                        <p className="text-sm text-black ">{item.salary}</p>
                                    </div>

                                    <div className="col-span-1 flex items-center">
                                        <p className="text-sm text-black ">
                                            {item.isActive ? (
                                                <CircleCheckBigIcon size={20} color="green" />
                                            ) : (
                                                <CircleX size={20} color="red" />
                                            )}</p>
                                    </div>
                                    <div className="col-span-1 hidden items-center sm:flex">
                                        <p className="text-sm text-black ">{item.quantity}</p>
                                    </div>
                                    <div className="col-span-2 hidden items-center sm:flex">
                                        <p className="text-sm text-black ">{moment(item.createAt).format("ddd, DD/MM/YYYY, HH:mm")}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="py-6 px-4 md:px-6 xl:px-7.5 border-t border-stroke dark:border-strokedark">
                            <div className="flex items-center justify-between">
                                <h6 className="text-base font-semibold text-black ">Tổng {totalItems} tin tuyển dụng </h6>
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
            )}
        </>
    );
};

export default CompanyDetail;
