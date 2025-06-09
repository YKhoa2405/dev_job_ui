import { useEffect, useState } from 'react';
import API, { authApi, endpoints } from '../../common/API';
import moment from 'moment';
import 'moment/locale/vi';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import Loader from '../../common/Loader';
import { useParams } from 'react-router-dom';
import { IJobDetail } from '../../types/job';
import Select, { MultiValue } from 'react-select';
import axios from 'axios';
import { azuze_map_primary_key_api } from '../../common/KEY';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Định nghĩa type cho SkillOption và LevelOption
type Option = {
  value: string;
  label: string;
};

const EditJobs = () => {
  moment.locale('vi');
  const [skills, setSkills] = useState<Option[]>([]);
  const [skillValue, setSkillValue] = useState<MultiValue<Option>>([]);
  const [levelValue, setLevelValue] = useState<MultiValue<Option>>([]); // Thêm state cho level
  const [jobDetail, setJobDetail] = useState<IJobDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit, setLimit] = useState(5);

  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  const salaryOptions = [
    { value: '', label: 'Chọn mức lương' },
    { value: 'Dưới 5 triệu', label: 'Dưới 5 triệu' },
    { value: '10 - 15 triệu', label: '10 - 15 triệu' },
    { value: '15 - 20 triệu', label: '15 - 20 triệu' },
    { value: '20 - 25 triệu', label: '20 - 25 triệu' },
    { value: '30 - 50 triệu', label: '30 - 50 triệu' },
    { value: 'Trên 50 triệu', label: 'Trên 50 triệu' },
    { value: 'Thỏa thuận', label: 'Thỏa thuận' },
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

  const jobTypeOptions = [
    { value: '', label: 'Chọn loại hình' },
    { value: 'Office', label: 'Office' },
    { value: 'Remote', label: 'Remote' },
    { value: 'Hybrid', label: 'Hybrid' },
  ];

  const displayOptions = [
    { value: 5, label: '5 mục' },
    { value: 10, label: '10 mục' },
    { value: 20, label: '20 mục' },
    { value: 50, label: '50 mục' },
    { value: 100, label: '100 mục' },
  ];

  useEffect(() => {
    fetchJobDetail();
    fetchSkills();
    fetchReportsByJob();
  }, [id, currentPage, limit]);

  useEffect(() => {
    if (jobDetail?.skills) {
      const initialSkills = jobDetail.skills.map((skill) => ({
        value: skill,
        label: skill,
      }));
      setSkillValue(initialSkills);
    }
    if (jobDetail?.level) {
      const initialLevels = Array.isArray(jobDetail.level)
        ? jobDetail.level.map((level) => ({
          value: level,
          label: level,
        }))
        : [];
      setLevelValue(initialLevels);
    }
  }, [jobDetail]);

  const fetchReportsByJob = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await authApi(token).get(endpoints['reportByJob'](id!), {
        params: {
          page: currentPage,
          limit: limit,
        },
      });
      const data = res.data.data;
      setReportData(data.result);
      setCurrentPage(data.meta.currentPage);
      setTotalPages(data.meta.totalPages);
      setTotalItems(data.meta.totalItems);
    } catch (error) {
      toast.error('Không thể tải danh sách báo cáo!', { position: 'top-right', autoClose: 3000 });
    }
  };

  const reclassifyReport = async (id: string, updates: { category?: string; isGoodForTraining?: boolean }) => {
    try {
      const token = localStorage.getItem('access_token');
      await authApi(token).patch(endpoints['reportDetail'](id), updates);
      toast.success('Cập nhật báo cáo thành công!', { position: 'top-right', autoClose: 3000 });
      fetchReportsByJob();
    } catch (error) {
      toast.error('Cập nhật báo cáo thất bại!', { position: 'top-right', autoClose: 3000 });
    }
  };

  const handleSkillChange = (selectedOptions: MultiValue<Option>) => {
    setSkillValue(selectedOptions);
  };

  const handleLevelChange = (selectedOptions: MultiValue<Option>) => {
    setLevelValue(selectedOptions);
    setJobDetail((prev) =>
      prev ? { ...prev, level: selectedOptions.map((option) => option.value) } : null
    );
  };

  const fetchSkills = async () => {
    try {
      const res = await API.get(endpoints['skills'], {
        params: {
          page: 1,
          limit: 100,
        },
      });
      const formattedOptions = res.data.data.result.map((item: any) => ({
        value: item.name,
        label: item.name,
      }));
      setSkills(formattedOptions);
    } catch (error) {
      toast.error('Không thể tải danh sách kỹ năng!', { position: 'top-right', autoClose: 3000 });
    }
  };

  const getCoordinatesFromAddress = async (locationDetail: string) => {
    try {
      const response = await axios.get('https://atlas.microsoft.com/search/address/json', {
        params: {
          'api-version': '1.0',
          'subscription-key': azuze_map_primary_key_api,
          query: locationDetail,
        },
      });
      const location = response.data.results[0]?.position;
      return {
        latitude: location?.lat ?? null,
        longitude: location?.lon ?? null,
      };
    } catch (error) {
      return null;
    }
  };

  const toggleActiveStatus = () => {
    setJobDetail((prev) => (prev ? { ...prev, isActive: !prev.isActive } : null));
  };

  const fetchJobDetail = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await authApi(token).get(endpoints['jobDetail'](id!));
      setJobDetail(res.data.data);
    } catch (error) {
      toast.error('Không thể tải chi tiết công việc!', { position: 'top-right', autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateJobs = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!jobDetail) return;

    setLoading(true);
    try {
      const coordinates = jobDetail.location
        ? await getCoordinatesFromAddress(jobDetail.location)
        : null;

      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Không tìm thấy token');

      await authApi(token).patch(endpoints['jobDetail'](id!), {
        name: jobDetail.name,
        level: levelValue.map((level) => level.value), // Gửi mảng level
        quantity: jobDetail.quantity,
        salary: jobDetail.salary,
        jobType: jobDetail.jobType,
        description: jobDetail.description,
        skills: skillValue.map((skill) => skill.value),
        prioritize: jobDetail.prioritize,
        requirement: jobDetail.requirement,
        startDate: jobDetail.startDate,
        endDate: jobDetail.endDate,
        location: jobDetail.location,
        geoLocation: coordinates
          ? { type: 'Point', coordinates: [coordinates.longitude, coordinates.latitude] }
          : jobDetail.geoLocation,
        isActive: jobDetail.isActive,
        isUrgent: jobDetail.isUrgent,
      });

      toast.success('Cập nhật công việc thành công!', { position: 'top-right', autoClose: 3000 });
      navigate('/admin/jobs');
    } catch (error) {
      toast.error('Cập nhật công việc thất bại!', { position: 'top-right', autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/jobs');
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
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Chỉnh sửa tin tuyển dụng
        </h2>
        <nav>
          <ol className="flex items-center gap-2">
            <li>
              <Link className="font-medium" to="/admin/jobs">
                Quản lý tin tuyển dụng /
              </Link>
            </li>
            <li className="font-medium text-primary">Chỉnh sửa tin tuyển dụng</li>
          </ol>
        </nav>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="flex flex-col gap-10">
          <form
            onSubmit={handleUpdateJobs}
            className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark"
          >
            <div className="p-6.5">
              <div className="flex justify-end mb-4">
                <div className="space-x-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90"
                    disabled={loading}
                  >
                    Lưu
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-opacity-90"
                    disabled={loading}
                  >
                    Hủy
                  </button>
                </div>
              </div>

              <div className="mb-4.5 flex items-center">
                <div className="flex-[4]">
                  <label className="mb-2.5 block text-black dark:text-white">Tiêu đề</label>
                  <input
                    type="text"
                    placeholder="Nhập tiêu đề tin tuyển dụng"
                    value={jobDetail?.name || ''}
                    onChange={(e) =>
                      setJobDetail((prev) => (prev ? { ...prev, name: e.target.value } : null))
                    }
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>
                <div className="flex-[1] pl-4">
                  <label className="mb-2.5 block text-black dark:text-white">Trạng thái</label>
                  <button
                    type="button"
                    onClick={toggleActiveStatus}
                    className={`w-full rounded py-3 px-5 text-white ${jobDetail?.isActive ? 'bg-green-500' : 'bg-red-500'} hover:bg-opacity-90`}
                  >
                    {jobDetail?.isActive ? 'Hoạt động' : 'Dừng hoạt động'}
                  </button>
                </div>
              </div>

              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">Địa chỉ làm việc</label>
                <input
                  type="text"
                  placeholder="Nhập địa điểm làm việc"
                  value={jobDetail?.location || ''}
                  onChange={async (e) => {
                    const newLocation = e.target.value;
                    setJobDetail((prev) => (prev ? { ...prev, location: newLocation } : null));
                    const coordinates = await getCoordinatesFromAddress(newLocation);
                    setJobDetail((prev) =>
                      prev
                        ? {
                          ...prev,
                          geoLocation: coordinates
                            ? { type: 'Point', coordinates: [coordinates.longitude, coordinates.latitude] }
                            : prev.geoLocation,
                        }
                        : null
                    );
                  }}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              <div className='flex space-x-4 mb-4.5'>
                <div className="flex-1">
                  <label className="mb-2.5 block text-black dark:text-white">Mức lương</label>
                  <select
                    value={jobDetail?.salary || ''}
                    onChange={(e) =>
                      setJobDetail((prev) => (prev ? { ...prev, salary: e.target.value } : null))
                    }
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  >
                    {salaryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1">
                  <label className="mb-2.5 block text-black dark:text-white">Level</label>
                  <Select<Option, true>
                    styles={{
                      control: (base) => ({
                        ...base,
                        padding: '0.3rem 1.0rem',
                      }),
                    }}
                    isMulti
                    value={levelValue}
                    options={levelOptions}
                    onChange={handleLevelChange}
                    placeholder="Chọn level..."
                    closeMenuOnSelect={false}
                    className="custom-react-select"
                    classNamePrefix="react-select"
                    isLoading={loading}
                  />
                </div>
              </div>
              <div className="flex space-x-4 mb-4.5">

                <div className="flex-1">
                  <label className="mb-2.5 block text-black dark:text-white">Số lượng</label>
                  <input
                    type="number"
                    placeholder="Nhập số lượng"
                    value={jobDetail?.quantity || ''}
                    onChange={(e) =>
                      setJobDetail((prev) =>
                        prev ? { ...prev, quantity: Number(e.target.value) } : null
                      )
                    }
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>

                <div className="flex-1">
                  <label className="mb-2.5 block text-black dark:text-white">Loại hình</label>
                  <select
                    value={jobDetail?.jobType || ''}
                    onChange={(e) =>
                      setJobDetail((prev) => (prev ? { ...prev, jobType: e.target.value } : null))
                    }
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  >
                    {jobTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex space-x-4 mb-4.5">
                <div className="flex-1">
                  <label className="mb-2.5 block text-black dark:text-white">Kĩ năng</label>
                  <Select<Option, true>
                    styles={{
                      control: (base) => ({
                        ...base,
                        padding: '0.3rem 1.0rem',
                      }),
                    }}
                    isMulti
                    value={skillValue}
                    options={skills}
                    onChange={handleSkillChange}
                    placeholder="Chọn kỹ năng liên quan..."
                    closeMenuOnSelect={false}
                    className="custom-react-select"
                    classNamePrefix="react-select"
                    isLoading={loading}
                  />
                </div>

                <div className="flex-1">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Thuộc công ty <span className="text-meta-1">*</span>
                  </label>
                  <div className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
                    {jobDetail?.companyId.name || 'Không xác định'}
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 mb-4.5">
                <div className="flex-1">
                  <label className="mb-2.5 block text-black dark:text-white">Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={
                      jobDetail?.startDate
                        ? new Date(jobDetail.startDate).toISOString().split('T')[0]
                        : ''
                    }
                    onChange={(e) =>
                      setJobDetail((prev) =>
                        prev ? { ...prev, startDate: new Date(e.target.value) } : null
                      )
                    }
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>

                <div className="flex-1">
                  <label className="mb-2.5 block text-black dark:text-white">Ngày kết thúc</label>
                  <input
                    type="date"
                    value={
                      jobDetail?.endDate
                        ? new Date(jobDetail.endDate).toISOString().split('T')[0]
                        : ''
                    }
                    onChange={(e) =>
                      setJobDetail((prev) =>
                        prev ? { ...prev, endDate: new Date(e.target.value) } : null
                      )
                    }
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="mb-2.5 block text-black dark:text-white">Mô tả</label>
                <textarea
                  rows={4}
                  placeholder="Mô tả công việc ..."
                  value={jobDetail?.description || ''}
                  onChange={(e) =>
                    setJobDetail((prev) => (prev ? { ...prev, description: e.target.value } : null))
                  }
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                ></textarea>
              </div>

              <div className="mb-6">
                <label className="mb-2.5 block text-black dark:text-white">Yêu cầu</label>
                <textarea
                  rows={4}
                  placeholder="Yêu cầu công việc dành cho ứng viên ..."
                  value={jobDetail?.requirement || ''}
                  onChange={(e) =>
                    setJobDetail((prev) => (prev ? { ...prev, requirement: e.target.value } : null))
                  }
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                ></textarea>
              </div>

              <div className="mb-6">
                <label className="mb-2.5 block text-black dark:text-white">Ưu tiên</label>
                <textarea
                  rows={3}
                  placeholder="Ưu tiên cho ứng viên ..."
                  value={jobDetail?.prioritize || ''}
                  onChange={(e) =>
                    setJobDetail((prev) => (prev ? { ...prev, prioritize: e.target.value } : null))
                  }
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                ></textarea>
              </div>

              <div className="mb-6 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hotJob"
                  checked={jobDetail?.isUrgent || false}
                  onChange={(e) =>
                    setJobDetail((prev) => (prev ? { ...prev, isUrgent: e.target.checked } : null))
                  }
                  className="h-5 w-5 cursor-pointer accent-primary"
                />
                <label htmlFor="hotJob" className="text-black dark:text-white cursor-pointer">
                  Tin tuyển dụng Gấp
                </label>
              </div>

              <div className="flex space-x-4 mb-4.5">
                <div className="flex-1">
                  <label className="mb-2.5 block text-black dark:text-white">Ngày tạo</label>
                  <div className="w-full py-3 px-5 text-black dark:text-white bg-gray-100 border-[1.5px] border-stroke rounded dark:border-form-strokedark">
                    {moment(jobDetail?.createdAt).format('ddd, DD/MM/YYYY, HH:mm')}
                  </div>
                </div>
              </div>
              <div className="flex space-x-4 mb-4.5">
                <div className="flex-1">
                  <label className="mb-2.5 block text-black dark:text-white">Ngày cập nhật</label>
                  <div className="w-full py-3 px-5 text-black dark:text-white bg-gray-100 border-[1.5px] border-stroke rounded dark:border-form-strokedark">
                    {moment(jobDetail?.updatedAt).format('ddd, DD/MM/YYYY, HH:mm')}
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* Phần danh sách báo cáo liên quan */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mt-10">
            <div className="py-6 px-4 md:px-6 xl:px-7.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xl font-semibold text-black">Báo cáo liên quan</h4>
              </div>
            </div>

            <div className="grid grid-cols-9 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-9 md:px-6 2xl:px-7.5">
              <div className="col-span-2 flex items-center">
                <p className="font-medium">Người báo cáo</p>
              </div>
              <div className="col-span-2 hidden items-center sm:flex">
                <p className="font-medium">Lý do</p>
              </div>
              <div className="col-span-2 flex items-center">
                <p className="font-medium">Phân loại</p>
              </div>
              <div className="col-span-2 hidden sm:flex items-center">
                <p className="font-medium">Hành động</p>
              </div>
              <div className="col-span-1 flex items-center">
                <p className="font-medium">Dữ liệu tốt</p>
              </div>
            </div>

            <div>
              {reportData.length === 0 ? (
                <div className="py-4 px-4 text-center text-gray-500">
                  Không có báo cáo nào cho tin tuyển dụng này.
                </div>
              ) : (
                reportData.map((item) => (
                  <div
                    className="grid grid-cols-9 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-9 md:px-6 2xl:px-7.5"
                    key={item._id}
                  >
                    <div className="col-span-2 flex items-center">
                      <p className="text-sm text-blue-600">{item.email}</p>
                    </div>
                    <div className="col-span-2 hidden items-center sm:flex">
                      <p className="text-sm text-black truncate">{item.reason || 'Không có'}</p>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <p
                        className={`text-sm ${item.category === 'Lừa đảo'
                          ? 'text-red-500'
                          : item.category === 'Nội dung không phù hợp'
                            ? 'text-yellow-500'
                            : item.category === 'Ứng xử không chuyên nghiệp'
                              ? 'text-purple-500'
                              : 'text-gray-500'
                          }`}
                      >
                        {item.category}
                      </p>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <select
                        defaultValue=""
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value) {
                            reclassifyReport(item._id, { category: value });
                          }
                        }}
                        className="text-sm text-black border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="" disabled hidden>
                          Gắn nhãn lại
                        </option>
                        <option value="Lừa đảo">Lừa đảo</option>
                        <option value="Nội dung không phù hợp">Nội dung không phù hợp</option>
                        <option value="Ứng xử không chuyên nghiệp">Ứng xử không chuyên nghiệp</option>
                      </select>
                    </div>
                    <div className="col-span-1 flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={item.isGoodForTraining || false}
                        onChange={() =>
                          reclassifyReport(item._id, { isGoodForTraining: !item.isGoodForTraining })
                        }
                        className="h-5 w-5 cursor-pointer accent-primary"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="py-6 px-4 md:px-6 xl:px-7.5 border-t border-stroke dark:border-strokedark">
              <div className="flex items-center justify-between">
                <h6 className="text-base font-semibold text-black">Tổng {totalItems} báo cáo</h6>
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
                    className={`inline-flex items-center justify-center gap-2 bg-primary py-1.5 px-4 text-center font-medium text-white hover:bg-opacity-90 rounded-md ${currentPage === 1 ? 'cursor-not-allowed bg-gray-300' : ''
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
                    className={`inline-flex items-center justify-center gap-2 bg-primary py-1.5 px-4 text-center font-medium text-white hover:bg-opacity-90 rounded-md ${currentPage === totalPages ? 'cursor-not-allowed bg-gray-300' : ''
                      }`}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditJobs;