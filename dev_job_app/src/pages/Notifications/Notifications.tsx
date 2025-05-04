import { ChevronLeft, ChevronRight, CircleCheckBigIcon, CircleX, Eye, Plus, Search, TrashIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { useEffect, useState } from 'react';
import API, { authApi, endpoints } from '../../common/API';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import Loading from '../../common/Loader/Loading';

interface INotification {
  _id: string;
  title: string;
  content: string;
  recipientGroups: string[];
  channel: string;
  scheduledTime?: string;
  isSent: boolean;
  createdAt: string;
}

const Notifications = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [status, setStatus] = useState('');

  const [notificationData, setNotificationData] = useState<INotification[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);

  const displayOptions = [
    { value: 5, label: '5 mục' },
    { value: 10, label: '10 mục' },
    { value: 20, label: '20 mục' },
    { value: 50, label: '50 mục' },
    { value: 100, label: '100 mục' },
  ];

  useEffect(() => {
    fetchListNotifications(currentPage, limit);
  }, [currentPage, limit, status]);

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
    fetchListNotifications(1, limit, searchKeyword);
  };

  const fetchListNotifications = async (page = 1, limit = 10, title = '') => {
    try {
      setLoading(true);
      const searchQuery = title ? `/${title}/i` : '';
      const res = await API.get(endpoints['notifications'], {
        params: {
          page,
          limit,
          title: searchQuery,
          isSent: status,
        },
      });
      const data = res.data.data;
      setNotificationData(data.result);
      setCurrentPage(data.meta.currentPage);
      setTotalPages(data.meta.totalPages);
      setTotalItems(data.meta.totalItems);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Không thể tải danh sách thông báo', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      const result = await Swal.fire({
        title: 'Bạn có chắc chắn?',
        text: 'Thông báo sẽ bị xóa vĩnh viễn!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Có, xóa!',
        cancelButtonText: 'Hủy',
      });

      if (result.isConfirmed) {
        const token = localStorage.getItem('access_token');
        await authApi(token).delete(endpoints['notificationDetail'](id));
        toast.success('Xóa thông báo thành công!', {
          position: 'top-right',
          autoClose: 3000,
        });
        fetchListNotifications(currentPage, limit);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Xóa thông báo thất bại!', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };


  return (
    <>
      <Breadcrumb pageName="Quản lý thông báo" />
      <div className="flex flex-col gap-8">
        <div className="rounded-sm border border-stroke bg-white shadow-default">
          <div className="grid grid-cols-4 gap-x-6 py-3 px-2 md:px-6 xl:px-7.5">
            <div className="col-span-1 hidden items-center sm:flex">
              <p className="font-medium mr-2 whitespace-nowrap">Trạng thái</p>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter"
              >
                <option value="">Tất cả</option>
                <option value="false">Chưa gửi</option>
                <option value="true">Đã gửi</option>
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
                placeholder="Nhập tiêu đề thông báo..."
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

        <div className="rounded-sm border border-stroke bg-white shadow-default">
          <div className="py-6 px-4 md:px-6 xl:px-7.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xl font-semibold text-black">Danh sách thông báo</h4>
              <Link
                to="create"
                className="inline-flex items-center justify-center gap-2.5 bg-primary py-2 px-5 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 rounded-md"
              >
                <Plus size={20} />
                Thêm mới
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-8 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5">
            <div className="col-span-2 flex items-center">
              <p className="font-medium">Tiêu đề</p>
            </div>
            <div className="col-span-2 flex items-center">
              <p className="font-medium">Nhóm người nhận</p>
            </div>
            <div className="col-span-2 flex items-center">
              <p className="font-medium">Kênh gửi</p>
            </div>
            <div className="col-span-1 flex items-center">
              <p className="font-medium">Trạng thái</p>
            </div>
            <div className="col-span-1 hidden sm:flex items-center">
              <p className="font-medium">Hành động</p>
            </div>
          </div>
          {loading ? (
            <Loading />
          ) : (
            <div>
              {notificationData.map((item) => (
                <div
                  className="grid grid-cols-8 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5"
                  key={item._id}
                >
                  <div className="col-span-2 flex items-center">
                    <p className="text-sm text-blue-600">{item.title}</p>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <p className="text-sm text-black">
                      {item.recipientGroups.includes('all')
                        ? 'Tất cả'
                        : item.recipientGroups.join(', ')}
                    </p>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <p className="text-sm text-black">{item.channel}</p>
                  </div>
                  <div className="col-span-1 flex items-center">
                    <p className="text-sm text-black">
                      {item.isSent ? (
                        <CircleCheckBigIcon size={20} color="green" />
                      ) : (
                        <CircleX size={20} color="red" />
                      )}
                    </p>
                  </div>
                  <div className="col-span-1 hidden sm:flex items-center">
                    <div className="flex items-center space-x-3.5">
                      <Link className="hover:text-primary" to={`${item._id}/detail`}>
                        <Eye size={20} />
                      </Link>
                      <button
                        onClick={() => handleDeleteNotification(item._id)}
                        className="hover:text-red-500"
                      >
                        <TrashIcon size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="py-6 px-4 md:px-6 xl:px-7.5 border-t border-stroke dark:border-strokedark">
            <div className="flex items-center justify-between">
              <h6 className="text-base font-semibold text-black">Tổng {totalItems} thông báo</h6>
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
                <button
                  onClick={handlePrevClick}
                  disabled={currentPage === 1}
                  className={`inline-flex items-center justify-center gap-2 bg-primary py-1.5 px-4 text-center font-medium text-white hover:bg-opacity-90 rounded-md ${
                    currentPage === 1 ? 'cursor-not-allowed bg-gray-300' : ''
                  }`}
                >
                  <ChevronLeft size={18} />
                </button>
                <p
                  className="font-medium text-black mx-4"
                  style={{ width: '100px', textAlign: 'center' }}
                >
                  {currentPage} / {totalPages} trang
                </p>
                <button
                  onClick={handleNextClick}
                  disabled={currentPage === totalPages}
                  className={`inline-flex items-center justify-center gap-2 bg-primary py-1.5 px-4 text-center font-medium text-white hover:bg-opacity-90 rounded-md ${
                    currentPage === totalPages ? 'cursor-not-allowed bg-gray-300' : ''
                  }`}
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

export default Notifications;