import { ChevronLeft, ChevronRight, Eye, Pencil, Search, TrashIcon } from 'lucide-react';
import { authApi, endpoints } from '../../common/API';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { useEffect, useState } from 'react';
import moment from "moment";
import "moment/locale/vi"; // Đảm bảo ngôn ngữ tiếng Việt được import
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import Loading from '../../common/Loader/Loading';
import { ICandidate } from '../../types/candidates';
import { Link } from 'react-router-dom';

const Candidates = () => {
    moment.locale("vi");
    const [loading, setLoading] = useState(false);


    const [candidateData, setcandidateData] = useState<ICandidate[]>([]);
    const [currentPage, setCurrentPage] = useState(1); // To store current page
    const [totalPages, setTotalPages] = useState(1); // To store total number of pages
    const [totalItems, setTotalItems] = useState(0);
    const [level, setLevel] = useState('')
    const [limit, setLimit] = useState(10);
    const [searchKeyword, setSearchKeyword] = useState<string>('')

    const displayOptions = [
        { value: 5, label: '5 mục' },
        { value: 10, label: '10 mục' },
        { value: 20, label: '20 mục' },
        { value: 50, label: '50 mục' },
        { value: 100, label: '100 mục' },
    ];

    const levelOptions = [
        { value: '', label: 'Tất cả' },
        { value: 'Intern', label: 'Intern' },
        { value: 'Fresher', label: 'Fresher' },
        { value: 'Junior', label: 'Junior' },
        { value: 'Middle', label: 'Middle' },
        { value: 'Senior', label: 'Senior' },
        { value: 'Trưởng nhóm', label: 'Trưởng nhóm' },
        { value: 'Trưởng phòng', label: 'Trưởng phòng' },
        { value: 'Director', label: 'Director' },
    ];

    useEffect(() => {
        fetchListCandidats(currentPage, limit);
    }, [limit, currentPage, level]);


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

    const handleSearch = () => {
        fetchListCandidats(1, 10, searchKeyword);
    };


    const fetchListCandidats = async (currentPage = 1, limit = 10, email = '') => {
        const searchQuery = email ? `/${email}/i` : '';
        setLoading(true)
        try {
            const token = localStorage.getItem('access_token');
            const res = await authApi(token).get(endpoints['candidates'], {
                params: {
                    page: currentPage,
                    limit: limit,
                    email: searchQuery,
                    level: level
                },
            });
            const data = res.data.data;
            console.log(data)
            setcandidateData(data.result);
            setCurrentPage(data.meta.currentPage);
            setTotalPages(data.meta.totalPages);
            setTotalItems(data.meta.totalItems);

            console.log(data.result)
        } catch (error) {
            console.log('error', error);
        } finally { setLoading(false) }
    };

    const handleDeleteUser = async (id: string) => {
        try {
            const result = await Swal.fire({
                title: 'Bạn có chắc chắn?',
                text: 'Người dùng này sẽ bị xóa!',
                icon: 'warning',
                showCancelButton: true, // Hiển thị nút "Hủy"
                confirmButtonColor: '#3085d6', // Màu nút "Yes"
                cancelButtonColor: '#d33', // Màu nút "No"
                confirmButtonText: 'Có, xóa!', // Nội dung nút "Yes"
                cancelButtonText: 'Hủy', // Nội dung nút "No"
            });

            if (result.isConfirmed) {
                const token: any = localStorage.getItem("access_token");
                await authApi(token).delete(endpoints['userDetail'](id));

                toast.success('Xóa thông tin thành công!', {
                    position: "top-right",
                    autoClose: 3000,
                });
                fetchListCandidats()
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra!', {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };


    return (
        <>
            <Breadcrumb pageName="Quản lý ứng viên tìm việc" />

            <div className="flex flex-col gap-8">
                <div className="rounded-sm border border-stroke bg-white shadow-default">
                    <div className="grid grid-cols-4 gap-x-6 py-3 px-2 md:px-6 xl:px-7.5">
                        <div className="col-span-1 hidden items-center sm:flex">
                            <p className="font-medium mr-2 whitespace-nowrap">Kinh nghiệm</p>
                            <select
                                value={level}
                                onChange={(e) => setLevel(e.target.value)}
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter "
                            >
                                {levelOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-3 flex items-center relative">
                            {/* Icon Search */}
                            <div className="absolute left-0 top-1/2 -translate-y-1/2">
                                <Search size={20} />
                            </div>

                            {/* Input Search */}
                            <input
                                type="text"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                placeholder="Nhập Email người dùng..."
                                className="w-full bg-transparent pl-9 pr-4 text-black focus:outline-none"
                            />

                            {/* Search Button */}
                            <button onClick={() => handleSearch()} className="absolute right-0 top-1/2 -translate-y-1/2 bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 focus:outline-none">
                                Tìm kiếm
                            </button>
                        </div>
                    </div>

                </div>
                <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
                    <div className="mb-6 flex items-center justify-between">
                        <h4 className="text-xl font-semibold text-black dark:text-white">
                            Danh sách ứng viên
                        </h4>
                    </div>

                    <div className="grid grid-cols-7 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-7 md:px-6 2xl:px-7.5">
                        <div className="col-span-2 flex items-center">
                            <p className="font-medium">Họ và tên</p>
                        </div>
                        <div className="col-span-2 hidden items-center sm:flex">
                            <p className="font-medium">Email</p>
                        </div>
                        <div className="col-span-1 hidden items-center sm:flex">
                            <p className="font-medium">Trạng thái</p>
                        </div>
                        <div className="col-span-1 hidden items-center sm:flex">
                            <p className="font-medium">Kinh nghiệm</p>
                        </div>
                        <div className="col-span-1 hidden items-center sm:flex">
                            <p className="font-medium">Hành động</p>
                        </div>
                    </div>

                    {loading ? (
                        <Loading />
                    ) : (
                        <div>
                            {candidateData.map((item) => (
                                <div
                                    className="grid grid-cols-7 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-7 md:px-6 2xl:px-7.5"
                                    key={item._id}
                                >
                                    <div className="col-span-2 flex items-center">
                                        <p className="text-sm text-blue-600 dark:text-white">
                                            {item.fullName}
                                        </p>
                                    </div>
                                    <div className="col-span-2 hidden items-center sm:flex">
                                        <p className="text-sm text-black dark:text-white">
                                            {item.email}
                                        </p>
                                    </div>
                                    <div className="col-span-1 hidden items-center sm:flex">
                                        <p className="text-sm text-black dark:text-white">
                                            <p className="text-sm text-black dark:text-white">
                                                {item.availability}</p>
                                        </p>
                                    </div>
                                    <div className="col-span-1 hidden items-center sm:flex ">
                                        {item.level}
                                    </div>

                                    <div className="col-span-1 hidden items-center sm:flex ">
                                        <div className="flex items-center space-x-3.5">
                                            <Link className="hover:text-primary" to={`${item.userId}/detail`}>
                                                <Eye size={20} />
                                            </Link>
                                            <button onClick={() => handleDeleteUser(item._id)} className="hover:text-red-500">
                                                <TrashIcon size={20} />
                                            </button>
                                            <Link className="hover:text-primary" to={`${item.userId}/edit`}>
                                                <Pencil size={20} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="py-6 px-4 md:px-6 xl:px-7.5 border-t border-stroke dark:border-strokedark">
                        <div className="flex items-center justify-between">
                            <h6 className="text-base font-semibold text-black dark:text-white">Tổng {totalItems} ứng viên </h6>
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
                                <p className="font-medium text-black dark:text-white mx-4" style={{ width: '100px', textAlign: 'center' }}>
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
        </>
    );
};

export default Candidates;
