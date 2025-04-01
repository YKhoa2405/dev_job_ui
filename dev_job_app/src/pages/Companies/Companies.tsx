import { ChevronLeft, ChevronRight, CircleCheckBigIcon, CircleX, Eye, Pencil, Plus, Search, TrashIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ICompanyList } from '../../types/company';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { useEffect, useState } from 'react';
import API, { authApi, endpoints } from '../../common/API';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import Loading from '../../common/Loader/Loading';

const Companies = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [approved, setApproved] = useState('')

  const [companyData, setCompanyData] = useState<ICompanyList[]>([]);
  const [currentPage, setCurrentPage] = useState(1); // To store current page
  const [totalPages, setTotalPages] = useState(1); // To store total number of pages
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
    fetchListCompany(currentPage, limit);
  }, [currentPage, limit, approved]);

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

  const handleSearch = () => {
    fetchListCompany(1, 10, searchKeyword);
  };


  const fetchListCompany = async (currentPage = 1, limit = 10, name = '') => {
    try {
      setLoading(true)
      const searchQuery = name ? `/${name}/i` : '';

      console.log(searchQuery)
      const res = await API.get(endpoints['companies'], { // Update the endpoint as needed
        params: {
          page: currentPage,
          limit: limit,
          name: searchQuery,
          isApproved: approved
        },
      });
      const data = res.data.data;
      console.log(data.result)
      setCompanyData(data.result); // Update company data
      setCurrentPage(data.meta.currentPage); // Update the current page from API response
      setTotalPages(data.meta.totalPages); // Update the total pages from API response
      setTotalItems(data.meta.totalItems); // Update the total pages from API response

    } catch (error) {
      console.log('Error fetching companies:', error);
    } finally { setLoading(false) }
  };



  const handleDeleteCompany = async (id: string) => {
    try {
      const result = await Swal.fire({
        title: 'Bạn có chắc chắn?',
        text: 'Thông tin về công ty và các tin tuyển dụng liên quan sẽ bị xóa!',
        icon: 'warning',
        showCancelButton: true, // Hiển thị nút "Hủy"
        confirmButtonColor: '#3085d6', // Màu nút "Yes"
        cancelButtonColor: '#d33', // Màu nút "No"
        confirmButtonText: 'Có, xóa!', // Nội dung nút "Yes"
        cancelButtonText: 'Hủy', // Nội dung nút "No"
      });

      if (result.isConfirmed) {
        const token: any = localStorage.getItem("access_token");
        await authApi(token).delete(endpoints['companiesDetail'](id));

        toast.success('Xóa thông tin thành công!', {
          position: "top-right",
          autoClose: 3000,
        });
        fetchListCompany()
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
      <Breadcrumb pageName="Quản lý công ty" />
      <div className="flex flex-col gap-8">
        <div className="rounded-sm border border-stroke bg-white shadow-default">
          <div className="grid grid-cols-4 gap-x-6 py-3 px-2 md:px-6 xl:px-7.5">
            <div className="col-span-1 hidden items-center sm:flex">
              <p className="font-medium mr-2 whitespace-nowrap">Trạng thái</p>
              <select
                value={approved}
                onChange={(e) => setApproved(e.target.value)}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter "
              >
                <option value="">Tất cả</option>
                <option value="false" >Chưa xét duyệt</option>
                <option value="true">Đã xét duyệt</option>

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
                placeholder="Nhập tên công ty..."
                className="w-full bg-transparent pl-9 pr-4 text-black focus:outline-none"
              />

              {/* Search Button */}
              <button
                onClick={() => handleSearch()}
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
              <h4 className="text-xl font-semibold text-black ">Danh sách công ty</h4>
              <Link
                to="create"
                className="inline-flex items-center justify-center gap-2.5 bg-primary py-2 px-5 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 rounded-md">
                <Plus size={20} />
                Thêm mới
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-8 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5">
            <div className="col-span-2 flex items-center">
              <p className="font-medium">Tên công ty</p>
            </div>
            <div className="col-span-2 hidden items-center sm:flex">
              <p className="font-medium">Địa chỉ</p>
            </div>
            <div className="col-span-2 flex items-center">
              <p className="font-medium">Website</p>
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
              {companyData.map((item) => (
                <div
                  className="grid grid-cols-8 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5"
                  key={item._id}
                >
                  <div className="col-span-2 flex items-center">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <img src={item.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      </div>

                      <p className="text-sm text-blue-600 ">{item.name}</p>
                    </div>
                  </div>
                  <div className="col-span-2 hidden items-center sm:flex">
                    <p className="text-sm text-black ">{item.city}</p>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <a
                      href={item.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 "
                    >
                      {item.website}
                    </a>
                  </div>
                  <div className="col-span-1 flex items-center">
                    <p className="text-sm text-black ">
                      {item.isApproved ? (
                        <CircleCheckBigIcon size={20} color="green" />
                      ) : (
                        <CircleX size={20} color="red" />
                      )}</p>
                  </div>
                  <div className="col-span-1 hidden sm:flex items-center">
                    <div className="flex items-center space-x-3.5">
                      <Link className="hover:text-primary" to={`${item._id}/detail`}>
                        <Eye size={20} />
                      </Link>
                      <button onClick={() => handleDeleteCompany(item._id)} className="hover:text-red-500">
                        <TrashIcon size={20} />
                      </button>
                      <Link className="hover:text-primary" to={`${item._id}/edit`}>
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
              <h6 className="text-base font-semibold text-black ">Tổng {totalItems} công ty </h6>
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

export default Companies;
