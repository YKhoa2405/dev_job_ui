import { ChevronLeft, ChevronRight, Pencil, Plus, Search, TrashIcon } from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { Fragment, useEffect, useState, useCallback } from 'react';
import API, { authApi, endpoints } from '../../common/API';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { ISkill } from '../../types/skills';
import Loading from '../../common/Loader/Loading';
import { Dialog, Transition } from '@headlessui/react';

const Skills = () => {
  const [skillData, setSkillData] = useState<ISkill[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit, setLimit] = useState(10);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchCate, setSearchCate] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);

  // State cho modal thêm mới
  const [isOpenAdd, setIsOpenAdd] = useState(false);
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>('');

  // State cho modal chỉnh sửa
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [editSkill, setEditSkill] = useState<ISkill | null>(null);

  const displayOptions = [
    { value: 5, label: '5 mục' },
    { value: 10, label: '10 mục' },
    { value: 20, label: '20 mục' },
    { value: 50, label: '50 mục' },
    { value: 100, label: '100 mục' },
  ];

  const categoryOptions = [
    { value: 'frontend', label: 'Frontend' },
    { value: 'backend', label: 'Backend' },
    { value: 'fullstack', label: 'Full Stack' },
    { value: 'devops', label: 'DevOps' },
    { value: 'cloud', label: 'Cloud Computing' },
    { value: 'ai', label: 'AI & Machine Learning' },
    { value: 'mobile', label: 'Mobile Development' },
    { value: 'database', label: 'Database Administration' },
    { value: 'uxui', label: 'UX/UI Design' },
    { value: 'security', label: 'Cyber Security' },
  ];

  useEffect(() => {
    fetchListSkill(currentPage, limit);
  }, [currentPage, limit, searchCate]);

  const fetchListSkill = useCallback(
    async (page = 1, limit = 10, name = '') => {
      setLoading(true);
      const searchQuery = name ? `/${name}/i` : '';
      try {
        const res = await API.get(endpoints['skills'], {
          params: {
            page,
            limit,
            name: searchQuery,
            category: searchCate,
          },
        });
        const data = res.data.data;
        setSkillData(data.result);
        setCurrentPage(data.meta.currentPage);
        setTotalPages(data.meta.totalPages);
        setTotalItems(data.meta.totalItems);
      } catch (error) {
        console.log('Error fetching Skills:', error);
        toast.error('Không thể tải danh sách công nghệ!');
      } finally {
        setLoading(false);
      }
    },
    [searchCate]
  );

  const handleSearch = useCallback(() => {
    fetchListSkill(1, limit, searchKeyword);
  }, [searchKeyword, limit, fetchListSkill]);

  const handlePrevClick = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextClick = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleCreateSkill = useCallback(async () => {
    setLoadingModal(true);
    if (!name) {
      toast.error('Vui lòng nhập tên công nghệ!', {
        position: 'top-right',
        autoClose: 3000,
      });
      setLoadingModal(false);
      return;
    }
    console.log(name)
    try {
      const response = await API.post(endpoints['skills'], { name, category });
      console.log(response);
      if (response.status === 201) {
        toast.success('Thêm mới thành công!', {
          position: 'top-right',
          autoClose: 3000,
        });
        setSkillData((prev) => [...prev, response.data.data]); // Thêm skill mới vào danh sách
        setName('');
        setCategory('');
        setIsOpenAdd(false);
      }
    } catch (error) {
      toast.error('Thêm mới thất bại!', {
        position: 'top-right',
        autoClose: 3000,
      });
      console.log(error);
    } finally {
      setLoadingModal(false);
    }
  }, [name, category]);

  const handleDeleteSkills = useCallback(
    async (id: string) => {
      try {
        const result = await Swal.fire({
          title: 'Bạn có chắc chắn?',
          text: 'Thông tin về công nghệ này sẽ bị xóa!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Có, xóa!',
          cancelButtonText: 'Hủy',
        });

        if (result.isConfirmed) {
          const token = localStorage.getItem('access_token');
          await authApi(token).delete(endpoints['skillsDetail'](id));
          setSkillData((prev) => prev.filter((skill) => skill._id !== id)); // Xóa skill khỏi danh sách
          toast.success('Xóa thành công!', {
            position: 'top-right',
            autoClose: 3000,
          });
        }
      } catch (error) {
        toast.error('Có lỗi xảy ra!', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    },
    []
  );

  const handleUpdateSkill = useCallback(async () => {
    if (!editSkill?.name) {
      toast.error('Vui lòng nhập tên công nghệ!', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }
    setLoadingModal(true);
    try {
      const token = localStorage.getItem('access_token');
      await authApi(token).patch(endpoints['skillsDetail'](editSkill._id), editSkill);
      setSkillData((prev) =>
        prev.map((skill) => (skill._id === editSkill._id ? { ...skill, ...editSkill } : skill))
      ); // Cập nhật skill trong danh sách
      toast.success('Cập nhật thành công!', {
        position: 'top-right',
        autoClose: 3000,
      });
      setIsOpenEdit(false);
    } catch (error) {
      toast.error('Cập nhật thất bại!', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setLoadingModal(false);
    }
  }, [editSkill]);

  const openEditModal = (skill: ISkill) => {
    setEditSkill(skill);
    setIsOpenEdit(true);
  };

  const closeEditModal = () => {
    setIsOpenEdit(false);
    setEditSkill(null);
  };

  return (
    <>
      <Breadcrumb pageName="Quản lý công nghệ" />

      {/* Modal Thêm mới */}
      <Transition appear show={isOpenAdd} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsOpenAdd(false)}>
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
              <Dialog.Panel className="w-full max-w-3xl bg-white rounded-lg shadow-xl p-6">
                <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                  Thêm công nghệ
                </Dialog.Title>
                <div className="mt-4">
                  {loadingModal ? (
                    <Loading />
                  ) : (
                    <div className="grid grid-cols-4 gap-4 mb-4.5">
                      <div className="col-span-3">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Tên công nghệ <span className="text-meta-1">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Nhập tên công nghệ ..."
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="mb-2.5 block text-black dark:text-white">Danh mục</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        >
                          {categoryOptions.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setIsOpenAdd(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleCreateSkill}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  >
                    Xác nhận
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Modal Chỉnh sửa */}
      <Transition appear show={isOpenEdit} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeEditModal}>
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
              <Dialog.Panel className="w-full max-w-3xl bg-white rounded-lg shadow-xl p-6">
                <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                  Chỉnh sửa công nghệ
                </Dialog.Title>
                <div className="mt-4">
                  {loadingModal ? (
                    <Loading />
                  ) : (
                    <div className="grid grid-cols-4 gap-4 mb-4.5">
                      <div className="col-span-3">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Tên công nghệ <span className="text-meta-1">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Nhập tên công nghệ ..."
                          value={editSkill?.name || ''}
                          onChange={(e) =>
                            setEditSkill((prev) =>
                              prev ? { ...prev, name: e.target.value } : null
                            )
                          }
                          className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="mb-2.5 block text-black dark:text-white">Danh mục</label>
                        <select
                          value={editSkill?.category || ''}
                          onChange={(e) =>
                            setEditSkill((prev) =>
                              prev ? { ...prev, category: e.target.value } : null
                            )
                          }
                          className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        >
                          {categoryOptions.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={closeEditModal}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleUpdateSkill}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  >
                    Xác nhận
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      <div className="flex flex-col gap-8">
        <div className="rounded-sm border border-stroke bg-white shadow-default">
          <div className="grid grid-cols-4 gap-x-6 py-3 px-2 md:px-6 xl:px-7.5">
            <div className="col-span-1 hidden items-center sm:flex">
              <p className="font-medium mr-2 whitespace-nowrap">Nhóm</p>
              <select
                value={searchCate}
                onChange={(e) => setSearchCate(e.target.value)}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter"
              >
                <option value="">Tất cả</option>
                {categoryOptions.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
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
                placeholder="Nhập tên công nghệ..."
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

        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="py-6 px-4 md:px-6 xl:px-7.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xl font-semibold text-black dark:text-white">
                Danh sách công nghệ tuyển dụng
              </h4>
              <button
                onClick={() => setIsOpenAdd(true)}
                type="button"
                className="inline-flex items-center justify-center gap-2.5 bg-primary py-2 px-5 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 rounded-md"
              >
                <Plus size={20} />
                Thêm mới
              </button>
            </div>
          </div>

          <div className="grid grid-cols-6 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5">
            <div className="col-span-2 flex items-center">
              <p className="font-medium">Mã công nghệ</p>
            </div>
            <div className="col-span-2 hidden items-center sm:flex">
              <p className="font-medium">Tên công nghệ</p>
            </div>
            <div className="col-span-2 hidden items-center sm:flex">
              <p className="font-medium">Nhóm</p>
            </div>
            <div className="col-span-1 hidden sm:flex items-center">
              <p className="font-medium">Phổ biến</p>
            </div>
            <div className="col-span-1 hidden sm:flex items-center">
              <p className="font-medium">Hành động</p>
            </div>
          </div>

          {loading ? (
            <Loading />
          ) : (
            <div>
              {skillData.map((item) => (
                <div
                  className="grid grid-cols-6 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5"
                  key={item._id}
                >
                  <div className="col-span-2 hidden items-center sm:flex">
                    <p className="text-sm text-blue-600">{item._id}</p>
                  </div>
                  <div className="col-span-2 hidden items-center sm:flex">
                    <p className="text-sm text-black">{item.name}</p>
                  </div>
                  <div className="col-span-2 hidden items-center sm:flex">
                    <p className="text-sm text-black">{item.category}</p>
                  </div>
                  <div className="col-span-1 hidden items-center sm:flex">
                    <p className="text-sm text-black">{item.popularity}</p>
                  </div>
                  <div className="col-span-1 hidden sm:flex items-center">
                    <div className="flex items-center space-x-3.5">
                      <button
                        onClick={() => handleDeleteSkills(item._id)}
                        className="hover:text-red-500"
                      >
                        <TrashIcon size={20} />
                      </button>
                      <button
                        onClick={() => openEditModal(item)}
                        className="hover:text-primary"
                      >
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
              <h6 className="text-base font-semibold text-black dark:text-white">
                Tổng {totalItems} công nghệ
              </h6>
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
                  className="font-medium text-black dark:text-white mx-4"
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

export default Skills;