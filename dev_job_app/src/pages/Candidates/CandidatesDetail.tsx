import { useEffect, useState } from 'react';
import { authApi, endpoints } from '../../common/API';
import moment from 'moment';
import "moment/locale/vi";
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';

import { IJobList } from '../../types/job';
import Loader from '../../common/Loader';
import { ICandidate } from '../../types/candidates';

const CandidatesDetail = () => {
    moment.locale("vi");
    const [candidatesDetail, setCandidatesDetail] = useState<ICandidate | null>();
    const [jobData, setJobData] = useState<IJobList[]>([]);
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

    // useEffect(() => {
    //     fetchJobByCompany(currentPage, limit)
    // }, [limit, currentPage]);

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
                                    <label className="mb-2.5 block text-black dark:text-white">Mức lương mong muốn</label>
                                    <div className="w-full py-3 px-5 text-black dark:text-white bg-transparent border-[1.5px] border-stroke rounded dark:border-form-strokedark">
                                        {candidatesDetail?.salary}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Level</label>
                                    <div className="w-full py-3 px-5 text-black dark:text-white bg-transparent border-[1.5px] border-stroke rounded dark:border-form-strokedark">
                                        {candidatesDetail?.level}
                                    </div>
                                </div>
                            </div>

                            {/* Hàng 3 */}
                            <div className="grid grid-cols-5 gap-4 mb-4.5">
                                <div className="col-span-3">
                                    <label className="mb-2.5 block text-black dark:text-white">Mô hình làm việc</label>
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


                </div>
            )}
        </>
    );
};

export default CandidatesDetail;
