import { ChevronLeft, ChevronRight, CircleCheckBigIcon, CircleX, Search, X } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { authApi, endpoints } from '../../common/API';
import { toast } from 'react-toastify';
import Loading from '../../common/Loader/Loading';
import { Link, useParams } from 'react-router-dom';
import moment from 'moment';
import 'moment/locale/vi';
import { ITransaction } from '../../types/order';

const OrderTransactions = () => {
    moment.locale('vi');
    const [transactions, setTransactions] = useState<ITransaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const { companyId } = useParams<{ companyId: string }>();

    const displayOptions = [
        { value: 5, label: '5 mục' },
        { value: 10, label: '10 mục' },
        { value: 20, label: '20 mục' },
        { value: 50, label: '50 mục' },
        { value: 100, label: '100 mục' },
    ];
    const statusOptions = [
        { value: 'all', label: 'Tất cả' },
        { value: 'Success', label: 'Thành công' },
        { value: 'Failed', label: 'Thất bại' },
    ];

    const fetchTransactions = useCallback(
        async (page = 1, pageSize = limit, transactionNo = '', status = 'all') => {
            setLoading(true);
            try {
                const token = localStorage.getItem('access_token');
                const params: any = {
                    page,
                    limit: pageSize,
                };
                if (transactionNo) params.vnp_TransactionNo = transactionNo;
                if (status !== 'all') params.vnp_TransactionStatus = status;

                const res = await authApi(token).get(endpoints['orderTransactions'](companyId!), {
                    params,
                });
                const { result, meta } = res.data.data;
                setTransactions(result);
                setCurrentPage(meta.currentPage || 1);
                setLimit(meta.pageSize);
                setTotalItems(meta.totalItems);
                setTotalPages(meta.totalPages);
            } catch (error) {
                console.error('Error fetching transactions:', error);
                toast.error('Không thể tải lịch sử giao dịch!');
            } finally {
                setLoading(false);
            }
        },
        [companyId] // Only depend on companyId
    );

    const handleSearch = () => {
        setCurrentPage(1);
        fetchTransactions(1, limit, searchKeyword, statusFilter);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const clearSearch = () => {
        setSearchKeyword('');
        setCurrentPage(1);
        fetchTransactions(1, limit, '', statusFilter);
    };

    useEffect(() => {
        // Only fetch when currentPage or limit changes, or on initial load
        fetchTransactions(currentPage, limit, searchKeyword, statusFilter);
    }, [currentPage, limit, fetchTransactions]); // Removed searchKeyword and statusFilter from dependencies

    const handlePrevClick = () => {
        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
        }
    };

    const handleNextClick = () => {
        if (currentPage < totalPages) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    const handleLimitChange = (newLimit: number) => {
        setLimit(newLimit);
        setCurrentPage(1);
        fetchTransactions(1, newLimit, searchKeyword, statusFilter);
    };

    const handleStatusFilterChange = (newStatus: string) => {
        setStatusFilter(newStatus);
        setCurrentPage(1);
        fetchTransactions(1, limit, searchKeyword, newStatus);
    };

    const formatOrderInfo = (orderInfo: string) => decodeURIComponent(orderInfo.replace(/\+/g, ' '));
    const formatPayDate = (payDate: string) =>
        moment(payDate, 'YYYYMMDDHHmmss').format('ddd, DD/MM/YYYY, HH:mm');

    return (
        <>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-title-md2 font-semibold text-black dark:text-white">
                    Lịch sử giao dịch
                </h2>
                <nav>
                    <ol className="flex items-center gap-2">
                        <li>
                            <Link className="font-medium" to="/admin/summary">
                                Tổng hợp doanh thu /
                            </Link>
                        </li>
                        <li className="font-medium text-primary">Lịch sử giao dịch</li>
                    </ol>
                </nav>
            </div>
            <div className="flex flex-col gap-8">
                <div className="rounded-sm border border-stroke bg-white shadow-default">
                    <div className="grid grid-cols-4 gap-x-6 py-3 px-2 md:px-6 xl:px-7.5">
                        <div className="col-span-1 hidden items-center sm:flex">
                            <p className="font-medium mr-2 whitespace-nowrap">Trạng thái</p>
                            <select
                                value={statusFilter}
                                onChange={(e) => handleStatusFilterChange(e.target.value)}
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary"
                            >
                                {statusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
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
                                onKeyDown={handleKeyDown}
                                placeholder="Nhập mã giao dịch..."
                                className="w-full bg-transparent pl-9 pr-12 text-black focus:outline-none"
                            />
                            {searchKeyword && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    <X size={20} />
                                </button>
                            )}
                            <button
                                onClick={handleSearch}
                                disabled={loading}
                                className={`absolute right-0 top-1/2 -translate-y-1/2 bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 focus:outline-none ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Tìm kiếm
                            </button>
                        </div>
                    </div>
                </div>
                <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    <div className="grid grid-cols-6 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-7 md:px-6 2xl:px-7.5">
                        <div className="col-span-1 flex items-center">
                            <p className="font-medium">Mã GD</p>
                        </div>
                        <div className="col-span-2 flex items-center">
                            <p className="font-medium">Gói dịch vụ</p>
                        </div>
                        <div className="col-span-1 flex items-center">
                            <p className="font-medium">Số tiền (VND)</p>
                        </div>
                        <div className="col-span-1 flex items-center">
                            <p className="font-medium">Ngày thanh toán</p>
                        </div>
                        <div className="col-span-1 flex items-center">
                            <p className="font-medium">Trạng thái</p>
                        </div>
                        <div className="col-span-1 flex items-center">
                            <p className="font-medium">Người thực hiện</p>
                        </div>
                    </div>

                    {loading ? (
                        <Loading />
                    ) : (
                        <div>
                            {transactions.length === 0 ? (
                                <div className="py-4 text-center text-sm text-black dark:text-white">
                                    Không có giao dịch nào
                                </div>
                            ) : (
                                transactions.map((item) => (
                                    <div
                                        className="grid grid-cols-6 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-7 md:px-6 2xl:px-7.5"
                                        key={item._id}
                                    >
                                        <div className="col-span-1 flex items-center">
                                            <p className="text-sm text-black dark:text-white">{item.vnp_TransactionNo}</p>
                                        </div>
                                        <div className="col-span-2 flex items-center">
                                            <p className="text-sm text-black dark:text-white">{formatOrderInfo(item.vnp_OrderInfo)}</p>
                                        </div>
                                        <div className="col-span-1 flex items-center">
                                            <p className="text-sm text-green-600 dark:text-white">
                                                {(Number(item.vnp_Amount)).toLocaleString('vi-VN')}
                                            </p>
                                        </div>
                                        <div className="col-span-1 flex items-center">
                                            <p className="text-sm text-black dark:text-white">{formatPayDate(item.vnp_PayDate)}</p>
                                        </div>
                                        <div className="col-span-1 flex items-center">
                                            <p className="text-sm text-black">
                                                {item.vnp_TransactionStatus === 'Success' ? (
                                                    <CircleCheckBigIcon size={20} color="green" />
                                                ) : (
                                                    <CircleX size={20} color="red" />
                                                )}
                                            </p>
                                        </div>
                                        <div className="col-span-1 flex items-center">
                                            <p className="text-sm text-black dark:text-white">{item.createBy?.email || 'N/A'}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    <div className="py-6 px-4 md:px-6 xl:px-7.5 border-t border-stroke dark:border-strokedark">
                        <div className="flex items-center justify-between">
                            <h6 className="text-base font-semibold text-black dark:text-white">
                                Tổng {totalItems} giao dịch
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

export default OrderTransactions;