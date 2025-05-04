import { useState } from 'react';
import { authApi, endpoints } from '../../common/API';
import { Link, useNavigate } from 'react-router-dom';
import Loader from '../../common/Loader';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select, { SingleValue } from 'react-select';
import moment from 'moment';
import 'moment/locale/vi';

interface Option {
  value: string;
  label: string;
}

interface NotificationForm {
  title: string;
  content: string;
  recipientGroups: string[];
}

const NotificationCreate = () => {
  moment.locale('vi');
  const [formData, setFormData] = useState<NotificationForm>({
    title: '',
    content: '',
    recipientGroups: [],
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const recipientOptions: Option[] = [
    { value: 'all', label: 'Tất cả' },
    { value: 'candidate', label: 'Ứng viên (Candidate)' },
    { value: 'company', label: 'Công ty (Company)' },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRecipientChange = (selectedOption: SingleValue<Option>) => {
    if (!selectedOption) {
      setFormData((prev) => ({ ...prev, recipientGroups: [] }));
      return;
    }
    setFormData((prev) => ({ ...prev, recipientGroups: [selectedOption.value] }));
  };

  const validateForm = () => {
    if (!formData.title) return 'Tiêu đề không được để trống';
    if (!formData.content) return 'Nội dung không được để trống';
    if (formData.recipientGroups.length === 0)
      return 'Vui lòng chọn một nhóm người nhận';
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
      // Nếu chọn "all", gửi cả "candidate" và "company"
      const payload = {
        ...formData,
        recipientGroups:
          formData.recipientGroups.includes('all')
            ? ['candidate', 'company']
            : formData.recipientGroups,
        type: 'system', // Giả định type là 'system' cho thông báo admin, có thể thay đổi
        message: formData.content, // Ánh xạ content sang message
      };
      await authApi(token).post(endpoints['notificationCreateAdmin'], payload);
      toast.success('Gửi thông báo thành công!', {
        position: 'top-right',
        autoClose: 3000,
      });
      navigate('/admin/notifications');
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Gửi thông báo thất bại', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/notifications');
  };

  const selectedRecipient = recipientOptions.find((option) =>
    formData.recipientGroups.includes(option.value),
  );

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Tạo thông báo mới
        </h2>
        <nav>
          <ol className="flex items-center gap-2">
            <li>
              <Link className="font-medium" to="/admin/notifications">
                Quản lý thông báo /
              </Link>
            </li>
            <li className="font-medium text-primary">Tạo thông báo</li>
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

            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">Tiêu đề</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full py-3 px-5 border-[1.5px] border-stroke rounded dark:border-form-strokedark"
                placeholder="Nhập tiêu đề thông báo"
                disabled={loading}
              />
            </div>

            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">Nội dung</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                className="w-full py-3 px-5 border-[1.5px] border-stroke rounded dark:border-form-strokedark"
                placeholder="Nhập nội dung thông báo"
                rows={5}
                disabled={loading}
              />
            </div>

            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Nhóm người nhận
              </label>
              <Select
                styles={{
                  control: (base) => ({
                    ...base,
                    padding: '0.3rem 1.0rem',
                    borderRadius: '0.375rem',
                    border: '1.5px solid #e5e7eb',
                    backgroundColor: 'transparent',
                    color: '#000',
                    '&:hover': {
                      borderColor: '#3b82f6',
                    },
                  }),
                  menu: (base) => ({
                    ...base,
                    backgroundColor: '#fff',
                    color: '#000',
                  }),
                  option: (base, { isFocused }) => ({
                    ...base,
                    backgroundColor: isFocused ? '#f3f4f6' : '#fff',
                    color: '#000',
                  }),
                }}
                options={recipientOptions}
                value={selectedRecipient}
                onChange={handleRecipientChange}
                placeholder="Chọn nhóm người nhận..."
                isClearable
                isDisabled={loading}
              />
            </div>

            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">Ngày tạo</label>
              <div className="w-full py-3 px-5 text-black dark:text-white bg-gray-100 border-[1.5px] border-stroke rounded dark:border-form-strokedark">
                {moment().format('ddd, DD/MM/YYYY, HH:mm')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationCreate;