import { ChevronLeft, ChevronRight, Eye, Pencil, Plus, TrashIcon } from 'lucide-react';

import { Link } from 'react-router-dom';
import { IJobList } from '../../types/job';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { useEffect, useState } from 'react';
import EditResumes from './EditResumes';
import { ICvList } from '../../types/cv';
import { authApi, endpoints } from '../../common/API';
import Loading from '../../common/Loader/Loading';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';


const Resumes = () => {
  const [resumeData, setResumeData] = useState<ICvList[]>([]);
  const [currentPage, setCurrentPage] = useState(1); // To store current page
  const [totalPages, setTotalPages] = useState(1); // To store total number of pages
  const [totalItems, setTotalItems] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)


  const displayOptions = [
    { value: 5, label: '5 mục' },
    { value: 10, label: '10 mục' },
    { value: 20, label: '20 mục' },
    { value: 50, label: '50 mục' },
    { value: 100, label: '100 mục' },
  ];

  const statusOptions = [
    { value: 'Chờ xử lý', label: 'Chờ xử lý' },
    { value: 'Đã xem', label: 'Đã xem' },
    { value: 'Chấp nhận', label: 'Chấp nhận' },
    { value: 'Từ chối', label: 'Từ chối' },
  ];

  const openModal = (id: string) => {
    setSelectedResumeId(id); // Lưu ID của resume được chọn
    setIsModalOpen(true); // Mở modal
  };

  const closeModal = () => {
    setSelectedResumeId(null); // Xóa ID khi đóng modal
    setIsModalOpen(false);
  };

  useEffect(() => {
    fetchListResume(currentPage, limit, status);
  }, [currentPage, status]);

  const fetchListResume = async (currentPage = 1, limit = 10, status = '') => {
    setLoading(true)
    try {
      const token: any = localStorage.getItem("access_token");
      const res = await authApi(token).get(endpoints['resume'], { // Update the endpoint as needed
        params: {
          page: currentPage,
          limit: limit,
          status: status,
        },
      });
      console.log(res.data.data)
      const data = res.data.data;
      setResumeData(data.result); // Update company data
      setCurrentPage(data.meta.currentPage); // Update the current page from API response
      setTotalPages(data.meta.totalPages); // Update the total pages from API response
      setTotalItems(data.meta.totalItems); // Update the total pages from API response

    } catch (error) {
      console.log('Error fetching resume:', error);
    } finally {
      setLoading(false)
    }
  };

  const handleDeleteResume = async (id: string) => {
    try {
      const result = await Swal.fire({
        title: 'Bạn có chắc chắn?',
        text: 'Thông tin về đơn ứng tuyển này sẽ bị xóa!',
        icon: 'warning',
        showCancelButton: true, // Hiển thị nút "Hủy"
        confirmButtonColor: '#3085d6', // Màu nút "Yes"
        cancelButtonColor: '#d33', // Màu nút "No"
        confirmButtonText: 'Có, xóa!', // Nội dung nút "Yes"
        cancelButtonText: 'Hủy', // Nội dung nút "No"
      });

      if (result.isConfirmed) {
        const token: any = localStorage.getItem("access_token");
        await authApi(token).delete(endpoints['resumeDetail'](id));

        toast.success('Xóa thông tin thành công!', {
          position: "top-right",
          autoClose: 3000,
        });
        fetchListResume()
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra!', {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handlePrevClick = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Handler to go to the next page
  const handleNextClick = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <>
      <Breadcrumb pageName="Quản lý CV" />
      <div className="flex flex-col gap-10">
        <div className="rounded-sm border border-stroke bg-white shadow-default">
          <div className="grid grid-cols-6 gap-x-6 py-3 px-2 md:px-6 xl:px-7.5">
            {/* Cột 1: Level */}
            <div className="col-span-2 hidden items-center sm:flex">
              <p className="font-medium mr-2 whitespace-nowrap">Trạng thái</p>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter "
              >
                <option value="" disabled>Chọn trạng thái</option>
                {statusOptions.map(option => (
                  <option key={option.value} value={option.label}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>



          </div>
        </div>
        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <div className="mb-6 flex items-center justify-between">
            <h4 className="text-xl font-semibold text-black dark:text-white">
              Danh sách CV
            </h4>
          </div>

          <div className="grid grid-cols-6 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5">
            <div className="col-span-2 flex items-center">
              <p className="font-medium">Id</p>
            </div>
            <div className="col-span-1 flex items-center">
              <p className="font-medium">Trạng thái</p>
            </div>
            <div className="col-span-2 hidden items-center sm:flex">
              <p className="font-medium">Tin tuyển dụng</p>
            </div>
            <div className="col-span-2 hidden items-center sm:flex">
              <p className="font-medium">Công ty</p>
            </div>
            <div className="col-span-1 flex items-center">
              <p className="font-medium">Hành động</p>
            </div>
          </div>
          {loading ? (
            <Loading />
          ) : (
            <div>
              {resumeData.map((item) => (
                <div
                  className="grid grid-cols-6 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5"
                  key={item._id}
                >
                  <div className="col-span-2 flex items-center">
                    <p className="text-sm text-blue-600 dark:text-white">
                      {item._id}
                    </p>
                  </div>
                  <div className="col-span-1 flex items-center">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <p
                        className={`text-sm font-bold px-2  rounded ${item.status === 'Chờ xử lý'
                          ? 'text-yellow-600 bg-yellow-100 dark:bg-yellow-700 dark:text-yellow-300'
                          : item.status === 'Đã xem'
                            ? 'text-blue-600 bg-blue-100 dark:bg-blue-700 dark:text-blue-300'
                            : item.status === 'Chấp nhận'
                              ? 'text-green-600 bg-green-100 dark:bg-green-700 dark:text-green-300'
                              : 'text-red-600 bg-red-100 dark:bg-red-700 dark:text-red-300'
                          }`}
                      >
                        {item.status}
                      </p>

                    </div>
                  </div>
                  <div className="col-span-2 hidden items-center sm:flex">
                    <p className="text-sm text-black dark:text-white">
                      {item.jobId.name}
                    </p>
                  </div>
                  <div className="col-span-2 hidden items-center sm:flex">
                    <p className="text-sm text-black dark:text-white">
                      {item.companyId.name}
                    </p>
                  </div>
                  <div className="col-span-1 flex items-center">
                    <div className="flex items-center space-x-3.5">
                      <div className="hover:text-primary">
                      </div>
                      <button onClick={() => handleDeleteResume(item._id)} className="hover:text-red-600">
                        <TrashIcon size={20} />
                      </button>
                      <Link className="hover:text-primary" to={`${item._id}`}>
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
              <h6 className="text-base font-semibold text-black dark:text-white">Tổng {totalItems} CV </h6>
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

export default Resumes;
