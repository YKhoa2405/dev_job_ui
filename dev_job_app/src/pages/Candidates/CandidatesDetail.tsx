import { useEffect, useState } from 'react';
import { authApi, endpoints } from '../../common/API';
import moment from 'moment';
import "moment/locale/vi";
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';

import Loader from '../../common/Loader';
import { ICandidate } from '../../types/candidates';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { IResumeList } from '../../types/resume';

const CandidatesDetail = () => {
    moment.locale("vi");
    const [candidatesDetail, setCandidatesDetail] = useState<ICandidate | null>();
    const [resumeData, setResumeData] = useState<IResumeList[]>([]);
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
        fetchCandidatesDetail();
    }, [id]);

    useEffect(() => {
        fetchResumeByCandidate(currentPage, limit)
    }, [limit, currentPage, id]);

    const fetchCandidatesDetail = async () => {
        setLoading(true);
        try {
            const token: any = localStorage.getItem("access_token");
            const res = await authApi(token).get(endpoints['candidatesDetail'](id!));
            console.log(res.data.data)
            setCandidatesDetail(res.data.data);
        } catch (error) {
            console.log('Error fetching company detail:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchResumeByCandidate = async (currentPage = 1, limit = 10) => {
        try {
            const token: any = localStorage.getItem("access_token");
            const res = await authApi(token).get(endpoints['resume'], { // Update the endpoint as needed
                params: {
                    page: currentPage,
                    limit: limit,
                    userId: id
                },
            });
            console.log(res.data.data)
            const data = res.data.data;
            setResumeData(data.result); // Update company data
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
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-title-md2 font-semibold text-black dark:text-white">
                    Chi tiết ứng viên
                </h2>
                <nav>
                    <ol className="flex items-center gap-2">
                        <li>
                            <Link className="font-medium" to="/admin/candidates">
                                Quản lý ứng viên tìm việc /
                            </Link>
                        </li>
                        <li className="font-medium text-primary">Chi tiết ứng viên</li>
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
                                    <label className="mb-2.5 block text-black dark:text-white">Họ và tên</label>
                                    <div className="w-full py-3 px-5 text-black dark:text-white bg-transparent border-[1.5px] border-stroke rounded dark:border-form-strokedark">
                                        {candidatesDetail?.fullName}
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Email</label>
                                    <div className="w-full py-3 px-5 text-black dark:text-white bg-transparent border-[1.5px] border-stroke rounded dark:border-form-strokedark">
                                        {candidatesDetail?.email}
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-4 mb-4.5">
                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Số điện thoại</label>
                                    <div className="w-full py-3 px-5 text-black dark:text-white bg-transparent border-[1.5px] border-stroke rounded dark:border-form-strokedark">
                                        {candidatesDetail?.phone}
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Thành phố </label>
                                    <div className="w-full py-3 px-5 text-black dark:text-white bg-transparent border-[1.5px] border-stroke rounded dark:border-form-strokedark">
                                        {candidatesDetail?.location}
                                    </div>
                                </div>
                            </div>
                            {/* Hàng 2 */}
                            <div className="flex space-x-4 mb-4.5">
                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Trạng thái tìm việc</label>
                                    <div className="w-full py-3 px-5 text-black dark:text-white bg-transparent border-[1.5px] border-stroke rounded dark:border-form-strokedark">
                                        {candidatesDetail?.availability}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Mô hình việc làm</label>
                                    <div className="w-full py-3 px-5 text-black dark:text-white bg-transparent border-[1.5px] border-stroke rounded dark:border-form-strokedark">
                                        {candidatesDetail?.jobType}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Mức lương mong muốn</label>
                                    <div className="w-full py-3 px-5 text-black dark:text-white bg-transparent border-[1.5px] border-stroke rounded dark:border-form-strokedark">
                                        {candidatesDetail?.salary}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Kinh nghiệm</label>
                                    <div className="w-full py-3 px-5 text-black dark:text-white bg-transparent border-[1.5px] border-stroke rounded dark:border-form-strokedark">
                                        {candidatesDetail?.level}
                                    </div>
                                </div>
                            </div>

                            {/* Hàng 3 */}
                            <div className="grid grid-cols-5 gap-4 mb-4.5">
                                <div className="col-span-3">
                                    <label className="mb-2.5 block text-black dark:text-white">Kỹ năng</label>
                                    <div className="w-full py-3 px-5 text-black dark:text-white bg-transparent border-[1.5px] border-stroke rounded dark:border-form-strokedark">
                                        {candidatesDetail?.skills?.length ? candidatesDetail.skills.join(", ") : "Chưa cập nhật"}
                                    </div>

                                </div>
                                <div className="col-span-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Ảnh đại diện</label>
                                    <img
                                        src={candidatesDetail?.avatar || "https://placehold.co/600x400"}
                                        alt="Logo"
                                        className="h-15.5 w-20 rounded-md"
                                    />
                                </div>
                            </div>

                            {/* Hàng 4 */}
                            <div className="flex space-x-4 mb-4.5">
                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Ngày tạo tài khoản</label>
                                    <div className="w-full py-3 px-5 text-black dark:text-white bg-transparent border-[1.5px] border-stroke rounded dark:border-form-strokedark">
                                        {moment(candidatesDetail?.createdAt).format("ddd, DD/MM/YYYY, HH:mm")}
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-4 mb-4.5">
                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">CV ứng viên</label>
                                    <div className="w-full py-3 px-5 text-black dark:text-white bg-transparent border-[1.5px] border-stroke rounded dark:border-form-strokedark">
                                        {candidatesDetail?.cvUrl ? (
                                            <a href={candidatesDetail.cvUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                                                {candidatesDetail.cvUrl}
                                            </a>
                                        ) : (
                                            "Chưa cập nhật"
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="rounded-sm border border-stroke bg-white shadow-default">
                        <div className="py-6 px-4 md:px-6 xl:px-7.5">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xl font-semibold text-black "> Việc làm đã ứng tuyển  </h4>

                            </div>
                        </div>

                        <div className="grid grid-cols-6 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5">
                            <div className="col-span-2 flex items-center">
                                <p className="font-medium">Tên việc làm</p>
                            </div>
                            <div className="col-span-2 hidden items-center sm:flex">
                                <p className="font-medium">Tên công ty</p>
                            </div>

                            <div className="col-span-1 flex items-center">
                                <p className="font-medium">Trạng thái</p>
                            </div>
                            <div className="col-span-1 hidden sm:flex items-center">
                                <p className="font-medium">CV</p>
                            </div>
                            <div className="col-span-2 hidden sm:flex items-center">
                                <p className="font-medium">Ngày tạo</p>
                            </div>
                        </div>
                        <div>
                            {resumeData.map((item) => (
                                <div
                                    className="grid grid-cols-6 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5"
                                    key={item._id}
                                >
                                    <a className="col-span-2 flex items-center" href={`/admin/jobs/${item._id}`}>
                                        <p className="text-sm text-blue-600 ">{item?.jobId?.name}</p>
                                    </a>
                                    <div className="col-span-2 hidden items-center sm:flex">
                                        <p className="text-sm text-black ">{item.companyId?.name}</p>
                                    </div>

                                    <div className="col-span-1 flex items-center">
                                        <p className={`text-sm font-bold px-2 rounded ${getStatusStyle(item?.status)}`}>{item?.status}</p>
                                    </div>
                                    <div className="col-span-1 hidden items-center sm:flex">
                                        {item.cv ? (
                                            <a
                                                href={item.cv}
                                                target="_blank"
                                                className="bg-blue-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-600 transition"
                                            >
                                                Xem CV
                                            </a>
                                        ) : (
                                            <span className="text-gray-400">Chưa có</span>
                                        )}
                                    </div>

                                    <div className="col-span-2 hidden items-center sm:flex">
                                        <p className="text-sm text-black ">{moment(item.createdAt).format("ddd, DD/MM/YYYY, HH:mm")}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="py-6 px-4 md:px-6 xl:px-7.5 border-t border-stroke dark:border-strokedark">
                            <div className="flex items-center justify-between">
                                <h6 className="text-base font-semibold text-black ">Tổng {totalItems} việc làm </h6>
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

export default CandidatesDetail;
