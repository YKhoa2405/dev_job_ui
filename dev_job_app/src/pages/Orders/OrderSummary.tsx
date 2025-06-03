import { ChevronLeft, ChevronRight, CircleCheckBigIcon, CircleX, Search, History } from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { useEffect, useState, useCallback } from 'react';
import { authApi, endpoints } from '../../common/API';
import { toast } from 'react-toastify';
import Loading from '../../common/Loader/Loading';
import { Link } from 'react-router-dom';
import { IOrderSummary } from '../../types/order';
import { usePermissions } from '../../hooks/usePermissions';


const OrderSummary = () => {
    const [companiesData, setCompaniesData] = useState<IOrderSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalSpentAll, setTotalSpentAll] = useState(0);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [sort, setSort] = useState('-totalSpent'); // Mặc định giảm dần theo totalSpent
    const { hasPermission } = usePermissions();

    const displayOptions = [
        { value: 5, label: '5 mục' },
        { value: 10, label: '10 mục' },
        { value: 20, label: '20 mục' },
        { value: 50, label: '50 mục' },
        { value: 100, label: '100 mục' },
    ];

    const fetchCompanies = useCallback(async (page = 1, pageSize = limit, sortValue = sort) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const params: any = {
                page,
                limit: pageSize,
                sort: sortValue,
            };

            if (searchKeyword) {
                params.companyName = searchKeyword;
            }

            const res = await authApi(token).get(endpoints['orderSummary'], { params });
            const { result, meta } = res.data.data;
            setCompaniesData(result);
            setCurrentPage(meta.currentPage);
            setLimit(meta.pageSize);
            setTotalItems(meta.totalItems);
            setTotalPages(meta.totalPages);
            setTotalSpentAll(meta.totalSpentAll);
        } catch (error) {
            console.error('Error fetching companies:', error);
            toast.error('Không thể tải danh sách công ty!');
        } finally {
            setLoading(false);
        }
    }, [searchKeyword, sort]);

    const handleSearch = useCallback(() => {
        setCurrentPage(1);
        fetchCompanies(1, limit, sort);
    }, [fetchCompanies, limit, sort]);

    const handlePrevClick = () => {
        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
            fetchCompanies(currentPage - 1, limit, sort);
        }
    };

    const handleNextClick = () => {
        if (currentPage < totalPages) {
            setCurrentPage((prev) => prev + 1);
            fetchCompanies(currentPage + 1, limit, sort);
        }
    };

    const handleLimitChange = (newLimit: number) => {
        setLimit(newLimit);
        setCurrentPage(1);
        fetchCompanies(1, newLimit, sort);
    };

    const handleSortChange = (newSort: string) => {
        setSort(newSort);
        setCurrentPage(1);
        fetchCompanies(1, limit, newSort);
    };

    useEffect(() => {
        fetchCompanies(currentPage, limit, sort);
    }, [fetchCompanies]);

    return (
        <>
            <Breadcrumb pageName="Tổng hợp doanh thu" />
            <div className="flex flex-col gap-8">
                <div className="rounded-sm border border-stroke bg-white shadow-default">
                    <div className="grid grid-cols-4 gap-x-6 py-3 px-2 md:px-6 xl:px-7.5">
                        <div className="col-span-1 hidden items-center sm:flex">
                            <p className="font-medium mr-2 whitespace-nowrap">Doanh thu</p>
                            <select
                                value={sort}
                                onChange={(e) => handleSortChange(e.target.value)}
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter"
                            >
                                <option value="-totalSpent">Giảm dần</option>
                                <option value="totalSpent">Tăng dần</option>
                            </select>
                        </div>
                        <div className="col-span-3 flex items-center relative">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2">
                                <Search size={20} />
                            </div>
                            <input
                                type="text"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                placeholder="Nhập tên công ty..."
                                className="w-full bg-transparent pl-9 pr-4 text-black focus:outline-none"
                            />
                            <button
                                onClick={handleSearch}
                                className="absolute right-0 top-1/2 -translate-y-1/2 bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 focus:outline-none"
                            >
                                Tìm kiếm
                            </button>
                        </div>
                    </div>
                </div>

                <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
                    <div className="mb-6 flex items-center justify-between">
                        <h4 className="text-xl font-semibold text-black dark:text-white">Danh sách doanh thu theo công ty</h4>
                        <h6 className="text-base font-semibold text-green-600 dark:text-white">
                            Tổng doanh thu: {totalSpentAll.toLocaleString('vi-VN')} VNĐ
                        </h6>
                    </div>

                    <div className="grid grid-cols-5 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-5 md:px-6 2xl:px-7.5">
                        <div className="col-span-1 flex items-center">
                            <p className="font-medium">Tên công ty</p>
                        </div>
                        <div className="col-span-1 flex items-center">
                            <p className="font-medium">Tổng đơn hàng</p>
                        </div>
                        <div className="col-span-1 flex items-center">
                            <p className="font-medium">Tổng tiền</p>
                        </div>
                        <div className="col-span-1 flex items-center">
                            <p className="font-medium">Trạng thái</p>
                        </div>
                        <div className="col-span-1 flex items-center">
                        </div>
                    </div>

                    {loading ? (
                        <Loading />
                    ) : (
                        <div>
                            {companiesData.map((item, index) => (
                                <div
                                    className="grid grid-cols-5 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-5 md:px-6 2xl:px-7.5"
                                    key={index}
                                >
                                    <div className="col-span-1 flex items-center">
                                        <Link to={`/admin/companies/${item.companyId}/detail`}>
                                            <p className="text-sm text-blue-600 dark:text-white cursor-pointer hover:underline">
                                                {item.companyName}
                                            </p>
                                        </Link>
                                    </div>
                                    <div className="col-span-1 flex items-center">
                                        <p className="text-sm text-black dark:text-white">{item.totalOrders}</p>
                                    </div>
                                    <div className="col-span-1 flex items-center">
                                        <p className="text-sm text-green-600 dark:text-white">{item.totalSpent.toLocaleString('vi-VN')}</p>
                                    </div>
                                    <div className="col-span-1 flex items-center">
                                        <p className="text-sm text-black">
                                            {item.companyStatus ? (
                                                <CircleCheckBigIcon size={20} color="green" />
                                            ) : (
                                                <CircleX size={20} color="red" />
                                            )}
                                        </p>
                                    </div>
                                    <div className="col-span-1 flex items-center">
                                        {hasPermission('683bcac0b0844882a0ba037e') && (
                                            <Link
                                                to={`${item.companyId}/transactions`}
                                                className="flex items-center gap-1 text-sm text-white bg-blue-500 px-3 py-1 rounded hover:bg-blue-600 transition"
                                            >
                                                <History size={16} />
                                                Lịch sử giao dịch
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="py-6 px-4 md:px-6 xl:px-7.5 border-t border-stroke dark:border-strokedark">
                        <div className="flex items-center justify-between">
                            <h6 className="text-base font-semibold text-black dark:text-white">
                                Tổng {totalItems} công ty
                            </h6>
                            <div className="flex items-center justify-center gap-4">
                                <select
                                    value={limit}
                                    onChange={(e) => handleLimitChange(Number(e.target.value))}
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
                                <p
                                    className="font-medium text-black dark:text-white mx-4"
                                    style={{ width: '100px', textAlign: 'center' }}
                                >
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
            </div>
        </>
    );
};

export default OrderSummary;