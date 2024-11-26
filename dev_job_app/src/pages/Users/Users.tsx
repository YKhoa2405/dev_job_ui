import { ChevronLeft, ChevronRight, CircleCheckBigIcon, CircleX, Eye, Pencil, Plus, Search, TrashIcon } from 'lucide-react';
import { IUserList } from '../../types/user';
import API, { authApi, endpoints } from '../../common/API';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { Fragment, useEffect, useState } from 'react';
import moment from "moment";
import "moment/locale/vi"; // Đảm bảo ngôn ngữ tiếng Việt được import
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import Loading from '../../common/Loader/Loading';
import { Dialog, Transition } from '@headlessui/react';

const Users = () => {
  moment.locale("vi");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const closeModal = () => setIsOpen(false);
  const openModal = () => setIsOpen(true);

  const [roleData, setRoleData] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');

  const [userData, setUserData] = useState<IUserList[]>([]);
  const [currentPage, setCurrentPage] = useState(1); // To store current page
  const [totalPages, setTotalPages] = useState(1); // To store total number of pages
  const [totalItems, setTotalItems] = useState(0);
  const [limit, setLimit] = useState(10);
  const [searchKeyword, setSearchKeyword] = useState<string>('')

  const displayOptions = [
    { value: 5, label: '5 mục' },
    { value: 10, label: '10 mục' },
    { value: 20, label: '20 mục' },
    { value: 50, label: '50 mục' },
    { value: 100, label: '100 mục' },
  ];

  useEffect(() => {
    fetchListUser(currentPage, limit);
  }, [limit, currentPage]);

  useEffect(() => {
    fetchListRole()
  }, []);

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
    fetchListUser(1, 10, searchKeyword);
  };

  const fetchListRole = async () => {
    try {
      const token: any = localStorage.getItem("access_token");
      const res = await authApi(token).get(endpoints['roles'])
      setRoleData(res.data.data.result)
      console.log(roleData)
    } catch (error) {
      console.log(error)
    }
  }

  const fetchListUser = async (currentPage = 1, limit = 10, email = '') => {
    const searchQuery = email ? `/${email}/i` : '';
    setLoading(true)
    try {
      const token: any = localStorage.getItem("access_token");
      const res = await authApi(token).get(endpoints['listUsers'], {
        params: {
          page: currentPage,
          limit: limit,
          email: searchQuery,
        },
      });
      const data = res.data.data;
      setUserData(data.result);
      setCurrentPage(data.meta.currentPage);
      setTotalPages(data.meta.totalPages);
      setTotalItems(data.meta.totalItems);

      console.log(data.result)
    } catch (error) {
      console.log('error', error);
    } finally { setLoading(false) }
  };

  const handleCreateUser = async () => {
    if (
      !name || !email || !role || !password
    ) {
      toast.error('Vui lòng nhập đầy đủ thông tin!', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const userData = new URLSearchParams();
    userData.append('name', name);
    userData.append('email', email);
    userData.append('password', password);
    userData.append('role', role);

    try {
      const response = await API.post(endpoints['users'], userData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.status === 201) {
        toast.success('Thêm người dùng thành công!', {
          position: "top-right",
          autoClose: 3000,
        });
        closeModal()
      }
    } catch (error) {
      toast.error('Thêm mới người dùng thất bại!', {
        position: "top-right",
        autoClose: 3000,
      });
    }
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
        fetchListUser()
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

      <Breadcrumb pageName="Quản lý người dùng" />
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          {/* Overlay */}
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
              <Dialog.Panel className="w-full max-w-3xl h-auto bg-white rounded-lg shadow-xl p-6">
                {/* Header */}
                <Dialog.Title
                  as="h3"
                  className="text-lg font-semibold leading-6 text-gray-900">
                  Thêm mới quyền hạn
                </Dialog.Title>

                {/* Body */}
                <div className="mt-4">
                  <div className="flex space-x-4 mb-4.5">
                    <div className="flex-1">
                      <label className="mb-2.5 block text-black dark:text-white">Email <span className="text-meta-1">*</span></label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Nhập Email người dùng"
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                    </div>

                    <div className="flex-1">
                      <label className="mb-2.5 block text-black dark:text-white">Mật khẩu <span className="text-meta-1">*</span></label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Nhập mật khẩu người dùng"
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4 mb-4.5">
                    <div className="flex-1">
                      <label className="mb-2.5 block text-black dark:text-white">Tên tài khoản <span className="text-meta-1">*</span></label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nhập tên tài khoản ..."
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                    </div>

                    <div className="flex-1">
                      <label className="mb-2.5 block text-black dark:text-white">Vai trò <span className="text-meta-1">*</span></label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
                        <option value="" disabled>
                          Chọn Role
                        </option>
                        {roleData.map((item) => (
                          <option key={item._id} value={item._id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                </div>

                {/* Footer */}
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition">Hủy
                  </button>
                  <button
                    onClick={() => handleCreateUser()}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">Xác nhận
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      <div className="flex flex-col gap-8">
        <div className="rounded-sm border border-stroke bg-white shadow-default">
          <div className="py-3 px-2 md:px-6 xl:px-7.5">
            <div className="relative flex items-center">
              <div className="absolute left-0 top-1/2 -translate-y-1/2">
                <Search size={20} />
              </div>

              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Nhập Email người dùng..."
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
            <h4 className="text-xl font-semibold text-black dark:text-white">
              Danh sách người dùng
            </h4>
            <button
              onClick={openModal}
              className="inline-flex items-center justify-center gap-2.5 bg-primary py-2 px-5 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 rounded-md">
              <Plus size={20} />
              Thêm mới
            </button>
          </div>

          <div className="grid grid-cols-6 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5">
            <div className="col-span-2 flex items-center">
              <p className="font-medium">Id</p>
            </div>
            <div className="col-span-2 hidden items-center sm:flex">
              <p className="font-medium">Email</p>
            </div>
            <div className="col-span-1 hidden items-center sm:flex">
              <p className="font-medium">Trạng thái</p>
            </div>
            <div className="col-span-2 hidden items-center sm:flex">
              <p className="font-medium">Role</p>
            </div>
            <div className="col-span-1 hidden items-center sm:flex">
              <p className="font-medium">Hành động</p>
            </div>
          </div>

          {loading ? (
            <Loading />
          ) : (
            <div>
              {userData.map((item) => (
                <div
                  className="grid grid-cols-6 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5"
                  key={item._id}
                >
                  <div className="col-span-2 flex items-center">
                    <p className="text-sm text-blue-600 dark:text-white">
                      {item._id}
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
                        {item.isDeleted ? (
                          <CircleX size={20} color="red" />
                        ) : (
                          <CircleCheckBigIcon size={20} color="green" />
                        )}</p>
                    </p>
                  </div>
                  <div className="col-span-2 hidden items-center sm:flex ">
                    {item.role.name}
                  </div>


                  <div className="col-span-1 hidden items-center sm:flex ">
                    <div className="flex items-center space-x-3.5">
                      <button className="hover:text-primary">
                        <Eye size={20} />
                      </button>
                      <button onClick={() => handleDeleteUser(item._id)} className="hover:text-red-500">
                        <TrashIcon size={20} />
                      </button>
                      <button className="hover:text-primary">
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
              <h6 className="text-base font-semibold text-black dark:text-white">Tổng {totalItems} người dùng </h6>
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

export default Users;
