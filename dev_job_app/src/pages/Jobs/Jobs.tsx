import { ChevronLeft, ChevronRight, CircleCheckBigIcon, CircleX, Pencil, Plus, Search, TrashIcon } from 'lucide-react';

import { Link } from 'react-router-dom';
import { IJobList } from '../../types/job';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { useEffect, useState } from 'react';
import { authApi, endpoints } from '../../common/API';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import Loading from '../../common/Loader/Loading';


const Jobs = () => {
  const [jobData, setJobData] = useState<IJobList[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit, setLimit] = useState(10);
  const [level, setLevel] = useState('')
  const [salary, setSalary] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState<string>('')

  console.log(level)

  const displayOptions = [
    { value: 5, label: '5 mục' },
    { value: 10, label: '10 mục' },
    { value: 20, label: '20 mục' },
    { value: 50, label: '50 mục' },
    { value: 100, label: '100 mục' },
  ];

  const levelOptions = [
    { value: 'Intern', label: 'Intern' },
    { value: 'Fresher', label: 'Fresher' },
    { value: 'Junior', label: 'Junior' },
    { value: 'Middle', label: 'Middle' },
    { value: 'Senior', label: 'Senior' },
    { value: 'Trưởng nhóm', label: 'Trưởng nhóm' },
    { value: 'Trưởng phòng', label: 'Trưởng phòng' },
    { value: 'Director', label: 'Director' },
  ];

  const salaryOptions = [
    { value: '1', label: 'Dưới 5 triệu' },
    { value: '2', label: '10 - 15  triệu' },
    { value: '3', label: '15 - 20 triệu' },
    { value: '4', label: '20 - 25 triệu' },
    { value: '5', label: '30 - 50 triệu' },
    { value: '6', label: 'Trên 50 triệu' },
    { value: '7', label: 'Thỏa thuận' },
  ];

  useEffect(() => {
    fetchListJob(currentPage, limit, '', salary, level);
  }, [currentPage, salary, level,limit]);

  const fetchListJob = async (currentPage = 1, limit = 10, name = '', salary = '', level = '') => {
    setLoading(true)
    const searchQuery = {
      name: name ? `/${name}/i` : '',
      salary: salary ? salary : '',
      level: level ? level : ''
    };
    try {
      const token: any = localStorage.getItem("access_token");
      const res = await authApi(token).get(endpoints['jobs'], {
        params: {
          page: currentPage,
          limit: limit,
          name: searchQuery.name,  // Add name filter
          salary: searchQuery.salary,  // Add salary filter
          level: searchQuery.level,  // Add level filter
        },
      });
      const data = res.data.data;
      setJobData(data.result); // Update company data
      setCurrentPage(data.meta.currentPage); // Update the current page from API response
      setTotalPages(data.meta.totalPages); // Update the total pages from API response
      setTotalItems(data.meta.totalItems); // Update the total pages from API response

    } catch (error) {
      console.log('Error fetching companies:', error);
    } finally {
      setLoading(false)
    }
  };

  const handleDeleteJob = async (id: string) => {
    try {
      const result = await Swal.fire({
        title: 'Bạn có chắc chắn?',
        text: 'Thông tin về tin tuyển dụng và các CV liên quan cũng sẽ bị xóa!',
        icon: 'warning',
        showCancelButton: true, // Hiển thị nút "Hủy"
        confirmButtonColor: '#3085d6', // Màu nút "Yes"
        cancelButtonColor: '#d33', // Màu nút "No"
        confirmButtonText: 'Có, xóa!', // Nội dung nút "Yes"
        cancelButtonText: 'Hủy', // Nội dung nút "No"
      });

      if (result.isConfirmed) {
        const token: any = localStorage.getItem("access_token");
        await authApi(token).delete(endpoints['jobDetail'](id));

        toast.success('Xóa thông tin thành công!', {
          position: "top-right",
          autoClose: 3000,
        });
        fetchListJob()
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra!', {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleSearch = () => {
    fetchListJob(1, 10, searchKeyword);
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
      <Breadcrumb pageName="Quản lý tin tuyển dụng" />

      <div className="flex flex-col gap-8">
        <div className="rounded-sm border border-stroke bg-white shadow-default">
          <div className="grid grid-cols-5 gap-x-6 py-3 px-2 md:px-6 xl:px-7.5">
            {/* Cột 1: Level */}
            <div className="col-span-1 hidden items-center sm:flex">
              <p className="font-medium mr-2">Level</p>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter "
              >
                <option value="" >Tất cả</option>

                {levelOptions.map(option => (
                  <option key={option.value} value={option.label}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Cột 3: Chọn một option khác */}
            <div className="col-span-1 hidden items-center sm:flex">
              <p className="font-medium mr-2">Lương</p>
              <select
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter "
              >
                <option value="" >Tất cả</option>
                {salaryOptions.map(s => (
                  <option key={s.value} value={s.label}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Cột 2: Tìm kiếm */}
            <div className="col-span-3 flex items-center relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2">
                <Search size={20} />
              </div>
              <input
                type="text"
                placeholder="Nhập tiêu đề tin tuyển dụng..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full bg-transparent pl-9 pr-4 text-black focus:outline-none"
              />
              <button onClick={() => handleSearch()} className="absolute right-0 top-1/2 -translate-y-1/2 bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 focus:outline-none">
                Tìm kiếm
              </button>
            </div>

          </div>
        </div>
        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">

          <div className="mb-6 flex items-center justify-between">
            <h4 className="text-xl font-semibold text-black ">
              Danh sách tin tuyển dụng
            </h4>
            <Link
              to="create"
              className="inline-flex items-center justify-center gap-2.5 bg-primary py-2 px-5 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 rounded-md">
              <Plus size={20} />
              Thêm mới
            </Link>
          </div>


          <div className="grid grid-cols-7 border-t border-stroke py-4.5 px-4  sm:grid-cols-7 md:px-6 2xl:px-7.5">
            <div className="col-span-2 flex items-center">
              <p className="font-medium">Tiêu đề</p>
            </div>
            <div className="col-span-2 items-center sm:flex hidden">
              <p className="font-medium">Công ty</p>
            </div>
            <div className="col-span-1 hidden items-center sm:flex">
              <p className="font-medium">Level</p>
            </div>
            <div className="col-span-1 flex items-center">
              <p className="font-medium">Trạng thái</p>
            </div>
            <div className="col-span-1 flex items-center">
              <p className="font-medium">Hành động</p>
            </div>
          </div>
          {loading ? (
            <Loading />
          ) : (
            <div>
              {jobData.map((item, key) => (
                <div
                  className="grid grid-cols-7 border-t border-stroke py-4.5 px-4 sm:grid-cols-7 md:px-6 2xl:px-7.5"
                  key={key}
                >
                  <div className="col-span-2 flex items-center">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <p className="text-sm text-blue-600 ">
                        {item.name}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-2 hidden items-center sm:flex">
                    <p className="text-sm text-black ">
                      {item.companyId.name}
                    </p>
                  </div>

                  <div className="col-span-1 hidden items-center sm:flex">
                    <p className="text-sm text-black ">
                      {item.level}
                    </p>
                  </div>
                  <div className="col-span-1 flex items-center ">
                    {item.isActive ? (
                      <CircleCheckBigIcon size={20} color="green" />
                    ) : (
                      <CircleX size={20} color="red" />
                    )}
                  </div>


                  <div className="col-span-1 flex items-center">
                    <div className="flex items-center space-x-3.5">
                      <div className="hover:text-primary">
                      </div>
                      <Link className="hover:text-primary" to={`${item._id}`}>
                        <Pencil size={20} />
                      </Link>
                      <button onClick={() => handleDeleteJob(item._id)} className="hover:text-red-500">
                        <TrashIcon size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="py-6 px-4 md:px-6 xl:px-7.5 border-t border-stroke ">
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
    </>
  );
};

export default Jobs;
