import { ChevronLeft, ChevronRight, Pencil, TrashIcon } from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { Fragment, useEffect, useState } from 'react';
import { IResumeList, IResumeDetail } from '../../types/resume';
import { authApi, endpoints } from '../../common/API';
import Loading from '../../common/Loader/Loading';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { Dialog, Transition } from '@headlessui/react';
import moment from 'moment';


const Resumes = () => {
  const [resumeData, setResumeData] = useState<IResumeList[]>([]);
  const [currentPage, setCurrentPage] = useState(1); // To store current page
  const [totalPages, setTotalPages] = useState(1); // To store total number of pages
  const [totalItems, setTotalItems] = useState(0);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState('')
  const [statusUpdate, setStatusUpdate] = useState('')

  const [loading, setLoading] = useState(false)
  const [loadingModal, setLoadingModal] = useState(false)


  const [isOpen, setIsOpen] = useState(false);  // Để điều khiển modal
  const [resumeDetail, setResumeDetail] = useState<IResumeDetail | null>(null);


  const openModal = (id: string) => {
    fetchResumeDetail(id);  // Lấy chi tiết item theo ID
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setResumeDetail(null);  // Reset lại chi tiết
  };


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

  const fetchResumeDetail = async (id: string) => {
    setLoadingModal(true)
    try {
      const token: any = localStorage.getItem("access_token");
      const res = await authApi(token).get(endpoints['resumeDetail'](id));
      setResumeDetail(res.data.data)
    } catch (error) {
      console.log('Error fetching resume:', error);
    } finally { setLoadingModal(false) }
  }

  const handleUpdateResume = async (id: string) => {
    try {
      const token: any = localStorage.getItem("access_token");
      await authApi(token).patch(endpoints['resumeDetail'](id), {
        status: statusUpdate,
      });
      toast.success('Cập nhật thành công!', {
        position: "top-right",
        autoClose: 3000,
      });
      closeModal()
      fetchListResume()
    } catch (error) {
      console.log('Error fetching resume:', error);
      toast.error('Cập nhật thất bại!', {
        position: "top-right",
        autoClose: 3000,

      });
    }
  }

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
      <Breadcrumb pageName="Quản lý hồ sơ ứng tuyển" />
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl h-auto bg-white rounded-lg shadow-xl p-6">
                {/* Header */}
                <Dialog.Title
                  as="h3"
                  className="text-lg font-semibold leading-6 text-gray-900">
                  Chi tiết hồ sơ ứng tuyển
                </Dialog.Title>

                {/* Body */}
                <div className="mt-4">
                  {loadingModal ? (
                    <Loading />
                  ) : (
                    <div>
                      <div className="p-6.5">
                        <div className="flex space-x-4 mb-4.5">
                          <div className="flex-1">
                            <label className="mb-2.5 block text-black dark:text-white">Email <span className="text-meta-1">*</span></label>
                            <div className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white">
                              {resumeDetail?.email}
                            </div>
                          </div>

                          <div className="flex-1">
                            <label className="mb-2.5 block text-black dark:text-white">Họ và tên <span className="text-meta-1">*</span></label>
                            <div className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white">
                              {resumeDetail?.name}
                            </div>
                          </div>

                          <div className="flex-1">
                            <label className="mb-2.5 block text-black dark:text-white">Số điện thoại <span className="text-meta-1">*</span></label>
                            <div className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black ">
                              {resumeDetail?.phone}
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-4 mb-4.5">
                          <div className="flex-1">
                            <label className="mb-2.5 block text-black dark:text-white">Tiêu đề việc làm <span className="text-meta-1">*</span></label>
                            <div className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white">
                              {resumeDetail?.jobId.name}
                            </div>
                          </div>

                          <div className="flex-1">
                            <label className="mb-2.5 block text-black dark:text-white">Tên công ty <span className="text-meta-1">*</span></label>
                            <div className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white">
                              {resumeDetail?.companyId.name}
                            </div>
                          </div>
                        </div>

                        {/* Hàng 1 */}
                        <div className="flex space-x-4 mb-4.5">
                          <div className="flex-1">
                            <label className="mb-2.5 block text-black dark:text-white">CV <span className="text-meta-1">*</span></label>
                            <button
                              className="w-full rounded border-[1.5px] border-stroke bg-transparent bg-blue-600 py-3 px-5 text-white "
                              onClick={() => window.open(resumeDetail?.cv, '_blank')}
                            >
                              Xem CV
                            </button>

                          </div>
                          <div className="flex-1">
                            <label className="mb-2.5 block text-black dark:text-white">Ngày tạo <span className="text-meta-1">*</span></label>
                            <div className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white">
                              {moment(resumeDetail?.createdAt).format("ddd, DD/MM/YYYY, HH:mm")}
                            </div>
                          </div>
                          <div className="flex-1">
                            <label className="mb-2.5 block text-black dark:text-white">Trạng thái </label>
                            <select
                              value={statusUpdate || resumeDetail?.status}
                              onChange={(e) => setStatusUpdate(e.target.value)}
                              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            >
                              <option value="" disabled hidden>Chọn trạng thái </option>
                              {statusOptions.map(option => (
                                <option key={option.value} value={option.label}>
                                  {option.label}
                                </option>
                              ))}
                            </select>

                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition">Hủy
                  </button>
                  <button
                    onClick={() => handleUpdateResume(resumeDetail?._id || '')}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">Xác nhận
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
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
                <option value="">Tất cả</option>
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
              Danh sách hồ sơ ứng tuyển
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
                      <button type='button' className="hover:text-primary" onClick={() => openModal(item._id)}>
                        <Pencil size={20} />
                      </button>
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
