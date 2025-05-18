import { useEffect, useState } from 'react';
import API, { authApi, endpoints } from '../../common/API';
import moment from 'moment';
import 'moment/locale/vi';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Loader from '../../common/Loader';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select, { MultiValue } from 'react-select';

// Định nghĩa interface cho Candidate
interface ICandidate {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  salary: string;
  level: string;
  availability: string;
  skills: string[];
  avatar?: string | File;
  createdAt: string;
  updatedAt: string;
}

// Định nghĩa interface cho Province
interface Province {
  id: string;
  full_name: string;
}

// Định nghĩa interface cho Option của react-select
interface Option {
  value: string;
  label: string;
}

// Định nghĩa type cho API response (có thể cải thiện nếu biết cấu trúc chính xác)
interface ApiResponse<T> {
  data: T;
}

const CandidatesEdit = () => {
  moment.locale('vi');
  const [candidatesDetail, setCandidatesDetail] = useState<ICandidate | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<ICandidate | null>(null);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [skills, setSkills] = useState<Option[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { id } = useParams<{ id: string }>(); // id được đảm bảo không undefined
  const navigate = useNavigate();

  // Options cho các select
  const salaryOptions: Option[] = [
    { value: '', label: 'Chọn mức lương' },
    { value: 'Dưới 5 triệu', label: 'Dưới 5 triệu' },
    { value: '10 - 15 triệu', label: '10 - 15 triệu' },
    { value: '15 - 20 triệu', label: '15 - 20 triệu' },
    { value: '20 - 25 triệu', label: '20 - 25 triệu' },
    { value: '30 - 50 triệu', label: '30 - 50 triệu' },
    { value: 'Trên 50 triệu', label: 'Trên 50 triệu' },
    { value: 'Thỏa thuận', label: 'Thỏa thuận' },
  ];

  const levelOptions: Option[] = [
    { value: '', label: 'Chọn level' },
    { value: 'Intern', label: 'Intern' },
    { value: 'Fresher', label: 'Fresher' },
    { value: 'Junior', label: 'Junior' },
    { value: 'Middle', label: 'Middle' },
    { value: 'Senior', label: 'Senior' },
    { value: 'Trưởng nhóm', label: 'Trưởng nhóm' },
    { value: 'Trưởng phòng', label: 'Trưởng phòng' },
    { value: 'Director', label: 'Director' },
  ];

  const availabilityOptions: Option[] = [
    { value: '', label: 'Chọn trạng thái' },
    { value: 'Ngay lập tức', label: 'Ngay lập tức' },
    { value: '1 tuần', label: '1 tuần' },
    { value: '2 tuần', label: '2 tuần' },
    { value: '1 tháng', label: '1 tháng' },
  ];

  useEffect(() => {
    if (id) {
      fetchCandidatesDetail();
      fetchProvinces();
      fetchSkills();
    }
  }, [id]);

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const fetchProvinces = async () => {
    try {
      const res = await axios.get<{ data: Province[] }>('https://esgoo.net/api-tinhthanh/1/0.htm');
      setProvinces(res.data.data || []);
    } catch (error) {
      console.error('Error fetching provinces:', error);
      toast.error('Không thể tải danh sách tỉnh thành', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const fetchSkills = async () => {
    try {
      const res = await API.get(endpoints['skills'], { params: { page: 1, limit: 100 } });
      const formattedOptions: Option[] = res.data.data.result.map((item: { name: string }) => ({
        value: item.name,
        label: item.name,
      }));
      setSkills(formattedOptions);
    } catch (error) {
      console.error('Error fetching skills:', error);
      toast.error('Không thể tải danh sách kỹ năng', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const fetchCandidatesDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No access token found');
      const res = await authApi(token).get<ApiResponse<ICandidate>>(endpoints['candidatesDetail'](id));
      setCandidatesDetail(res.data.data);
      setFormData(res.data.data);
    } catch (error) {
      console.error('Error fetching candidate detail:', error);
      toast.error('Không thể tải thông tin ứng viên', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => (prev ? { ...prev, [name]: value } : null));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File ảnh vượt quá 5MB', { position: 'top-right', autoClose: 3000 });
      return;
    }

    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarPreview(URL.createObjectURL(file));
    setFormData(prev => (prev ? { ...prev, avatar: file } : null));
  };

  const handleSkillChange = (selectedOptions: MultiValue<Option>) => {
    const selectedSkills = selectedOptions.map(option => option.value);
    setFormData(prev => (prev ? { ...prev, skills: selectedSkills } : null));
  };

  const validateForm = (): string | null => {
    if (!formData?.phone || !/^\d{10,11}$/.test(formData.phone))
      return 'Số điện thoại phải có 10-11 chữ số';
    if (!formData?.location) return 'Vui lòng chọn thành phố';
    if (!formData?.salary) return 'Vui lòng chọn mức lương';
    if (!formData?.level) return 'Vui lòng chọn level';
    if (!formData?.availability) return 'Vui lòng chọn trạng thái tìm việc';
    if (!Array.isArray(formData?.skills) || formData.skills.length === 0)
      return 'Vui lòng chọn ít nhất một kỹ năng';
    return null;
  };

  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError, {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No access token found');

      const data = new FormData();
      if (formData) {
        data.append('fullName', formData.fullName || '');
        data.append('email', formData.email || '');
        data.append('phone', formData.phone || '');
        data.append('location', formData.location || '');
        data.append('salary', formData.salary || '');
        data.append('level', formData.level || '');
        data.append('availability', formData.availability || '');
        formData.skills.forEach(skill => {
          data.append('skills[]', skill);
        });
        if (formData.avatar instanceof File) {
          data.append('avatar', formData.avatar);
        }
      }

      const res = await authApi(token).patch<ApiResponse<ICandidate>>(
        endpoints['candidatesDetail'](id!),
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setCandidatesDetail(res.data.data);
      toast.success('Cập nhật ứng viên thành công!', {
        position: 'top-right',
        autoClose: 3000,
      });
      navigate('/admin/candidates');
    } catch (error: any) {
      console.error('Error updating candidate:', error);
      toast.error('Cập nhật ứng viên thất bại', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/candidates');
  };

  const selectedSkills: Option[] = formData?.skills
    ? skills.filter(skill => formData.skills.includes(skill.value))
    : [];

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Chỉnh sửa ứng viên
        </h2>
        <nav>
          <ol className="flex items-center gap-2">
            <li>
              <Link className="font-medium" to="/admin/candidates">
                Quản lý ứng viên tìm việc /
              </Link>
            </li>
            <li className="font-medium text-primary">Chỉnh sửa ứng viên</li>
          </ol>
        </nav>
      </div>

      {loading && <Loader />}

      <div className="flex flex-col gap-10">
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="p-6.5">
            <div className="flex justify-end mb-4">
              <div className="space-x-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90"
                  disabled={loading}
                >
                  Lưu
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-opacity-90"
                  disabled={loading}
                >
                  Hủy
                </button>
              </div>
            </div>

            <div className="flex space-x-4 mb-4.5">
              <div className="flex-1">
                <label className="mb-2.5 block text-black dark:text-white">Họ và tên</label>
                <input
                  name="fullName"
                  value={formData?.fullName || ''}
                  className="w-full py-3 px-5 border-[1.5px] border-stroke rounded dark:border-form-strokedark"
                  disabled={loading}
                  readOnly
                />
              </div>
              <div className="flex-1">
                <label className="mb-2.5 block text-black dark:text-white">Email</label>
                <input
                  name="email"
                  value={formData?.email || ''}
                  className="w-full py-3 px-5 border-[1.5px] border-stroke rounded dark:border-form-strokedark"
                  disabled={loading}
                  readOnly
                />
              </div>
            </div>

            <div className="flex space-x-4 mb-4.5">
              <div className="flex-1">
                <label className="mb-2.5 block text-black dark:text-white">Số điện thoại</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData?.phone || ''}
                  onChange={handleInputChange}
                  className="w-full py-3 px-5 border-[1.5px] border-stroke rounded dark:border-form-strokedark"
                  disabled={loading}
                />
              </div>
              <div className="flex-1">
                <label className="mb-2.5 block text-black dark:text-white">Thành phố</label>
                <select
                  name="location"
                  value={formData?.location || ''}
                  onChange={handleInputChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  disabled={loading}
                >
                  <option value="" disabled>
                    Chọn tỉnh thành
                  </option>
                  {provinces.map(province => (
                    <option key={province.id} value={province.full_name}>
                      {province.full_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex space-x-4 mb-4.5">
              <div className="flex-1">
                <label className="mb-2.5 block text-black dark:text-white">Trạng thái tìm việc</label>
                <select
                  name="availability"
                  value={formData?.availability || ''}
                  onChange={handleInputChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  disabled={loading}
                >
                  {availabilityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="mb-2.5 block text-black dark:text-white">Mức lương mong muốn</label>
                <select
                  name="salary"
                  value={formData?.salary || ''}
                  onChange={handleInputChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  disabled={loading}
                >
                  {salaryOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="mb-2.5 block text-black dark:text-white">Kinh nghiệm</label>
                <select
                  name="level"
                  value={formData?.level || ''}
                  onChange={handleInputChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  disabled={loading}
                >
                  {levelOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-4 mb-4.5">
              <div className="col-span-3">
                <label className="mb-2.5 block text-black dark:text-white">Kỹ năng</label>
                <Select
                  styles={{
                    control: base => ({
                      ...base,
                      padding: '0.3rem 1.0rem',
                    }),
                  }}
                  isMulti
                  options={skills}
                  value={selectedSkills}
                  onChange={handleSkillChange}
                  placeholder="Chọn Kĩ năng liên quan..."
                  closeMenuOnSelect={false}
                  className="custom-react-select"
                  classNamePrefix="react-select"
                  isDisabled={loading}
                />
              </div>
              <div className="col-span-1">
                <label className="mb-2.5 block text-black dark:text-white">Ảnh đại diện</label>
                <label htmlFor="avatar-upload" className="cursor-pointer block w-20 h-20">
                  <img
                    src={avatarPreview || formData?.avatar || 'https://placehold.co/100x100'}
                    alt="Avatar"
                    className="h-20 w-20 rounded-full object-cover border border-dashed border-gray-300 hover:opacity-80 transition"
                  />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex space-x-4 mb-4.5">
              <div className="flex-1">
                <label className="mb-2.5 block text-black dark:text-white">Ngày tạo</label>
                <div className="w-full py-3 px-5 text-black dark:text-white bg-gray-100 border-[1.5px] border-stroke rounded dark:border-form-strokedark">
                  {moment(candidatesDetail?.createdAt).format('ddd, DD/MM/YYYY, HH:mm')}
                </div>
              </div>
            </div>
            <div className="flex space-x-4 mb-4.5">
              <div className="flex-1">
                <label className="mb-2.5 block text-black dark:text-white">Ngày cập nhật</label>
                <div className="w-full py-3 px-5 text-black dark:text-white bg-gray-100 border-[1.5px] border-stroke rounded dark:border-form-strokedark">
                  {moment(candidatesDetail?.updatedAt).format('ddd, DD/MM/YYYY, HH:mm')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CandidatesEdit;