import React, { useEffect, useState } from 'react';
import { authApi, endpoints } from '../../common/API';
import moment from 'moment';
import 'moment/locale/vi';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import Loader from '../../common/Loader';
import { useParams } from 'react-router-dom';
import { ICompanyDetail } from '../../types/company';

const EditCompanies = () => {
  moment.locale('vi');
  const [companyDetail, setCompanyDetail] = useState<ICompanyDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [businessLicenseFile, setBusinessLicenseFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [businessLicensePreview, setBusinessLicensePreview] = useState<string | null>(null);
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  const sizeOptions = [
    { value: '100-199', label: '100 - 199' },
    { value: '200-299', label: '200 - 299' },
    { value: '300-399', label: '300 - 399' },
    { value: '400-499', label: '400 - 499' },
    { value: '500+', label: '500+' },
    { value: '1000+', label: '1000+' },
  ];

  useEffect(() => {
    fetchCompanyDetail();
  }, [id]);

  const fetchCompanyDetail = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await authApi(token).get(endpoints['companiesDetail'](id!));
      setCompanyDetail(res.data.data);
      setAvatarPreview(res.data.data.avatar || 'https://placehold.co/100x100');
      setBusinessLicensePreview(res.data.data.businessLicenseUrl || null);
      console.log(res.data.data);
    } catch (error) {
      console.log('Error fetching company detail:', error);
      navigate('/admin/companies');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCompanyDetail((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'businessLicense') => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      // Kiểm tra kích thước file (tối đa 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File vượt quá 5MB', {
          position: 'top-right',
          autoClose: 3000,
        });
        return;
      }
      // Kiểm tra định dạng file
      const allowedTypes =
        type === 'avatar'
          ? ['image/jpeg', 'image/png', 'image/gif']
          : ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error(
          type === 'avatar'
            ? 'Vui lòng chọn file ảnh (JPEG, PNG, GIF)'
            : 'Vui lòng chọn file ảnh hoặc PDF',
          {
            position: 'top-right',
            autoClose: 3000,
          },
        );
        return;
      }
      if (type === 'avatar') {
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
      } else {
        setBusinessLicenseFile(file);
        setBusinessLicensePreview(URL.createObjectURL(file));
      }
    }
  };

  const toggleActiveStatus = () => {
    setCompanyDetail((prev) => (prev ? { ...prev, isApproved: !prev.isApproved } : null));
  };

  const validateForm = () => {
    if (!companyDetail?.name) return 'Tên công ty không được để trống';
    if (!companyDetail?.address) return 'Địa chỉ công ty không được để trống';
    if (!companyDetail?.field) return 'Lĩnh vực hoạt động không được để trống';
    if (!companyDetail?.website || !/^https?:\/\/.+/.test(companyDetail.website))
      return 'Website không hợp lệ (phải bắt đầu bằng http:// hoặc https://)';
    if (!companyDetail?.taxCode) return 'Mã số thuế không được để trống';
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
      const formData = new FormData();
      formData.append('name', companyDetail?.name || '');
      formData.append('slogan', companyDetail?.slogan || '');
      formData.append('size', companyDetail?.size || '');
      formData.append('address', companyDetail?.address || '');
      formData.append('field', companyDetail?.field || '');
      formData.append('website', companyDetail?.website || '');
      formData.append('isApproved', companyDetail?.isApproved ? 'true' : 'false');
      formData.append('about', companyDetail?.about || '');
      formData.append('taxCode', companyDetail?.taxCode || '');
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      if (businessLicenseFile) {
        formData.append('businessLicense', businessLicenseFile);
      }

      const res = await authApi(token).patch(endpoints['companiesDetail'](id!), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setCompanyDetail(res.data.data);
      toast.success('Cập nhật công ty thành công!', {
        position: 'top-right',
        autoClose: 3000,
      });
      navigate('/admin/companies');
    } catch (error) {
      toast.error('Cập nhật công ty thất bại', {
        position: 'top-right',
        autoClose: 3000,
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/companies');
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Chỉnh sửa công ty
        </h2>
        <nav>
          <ol className="flex items-center gap-2">
            <li>
              <Link className="font-medium" to="/admin/companies">
                Quản lý công ty /
              </Link>
            </li>
            <li className="font-medium text-primary">Chỉnh sửa công ty</li>
          </ol>
        </nav>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="flex flex-col gap-10">
          <form
            className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark"
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
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

              {/* Hàng 1 */}
              <div className="flex space-x-4 mb-4.5">
                <div className="flex-1">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Tên công ty <span className="text-meta-1">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={companyDetail?.name || ''}
                    onChange={handleInputChange}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    disabled={loading}
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-2.5 block text-black dark:text-white">Slogan</label>
                  <input
                    type="text"
                    name="slogan"
                    value={companyDetail?.slogan || ''}
                    onChange={handleInputChange}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    disabled={loading}
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-2.5 block text-black dark:text-white">Quy mô công ty</label>
                  <select
                    name="size"
                    value={companyDetail?.size || ''}
                    onChange={handleInputChange}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    disabled={loading}
                  >
                    <option value="" disabled>
                      Chọn quy mô
                    </option>
                    {sizeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Hàng 2 */}
              <div className="flex space-x-4 mb-4.5">
                <div className="flex-1">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Địa chỉ công ty <span className="text-meta-1">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={companyDetail?.size || ''}
                    onChange={handleInputChange}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    disabled={loading}
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Lĩnh vực hoạt động <span className="text-meta-1">*</span>
                  </label>
                  <input
                    type="text"
                    name="field"
                    value={companyDetail?.field || ''}
                    onChange={handleInputChange}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Hàng 3 */}
              <div className="grid grid-cols-5 gap-4 mb-4.5">
                <div className="col-span-3">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Website <span className="text-meta-1">*</span>
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={companyDetail?.website || ''}
                    onChange={handleInputChange}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    disabled={loading}
                  />
                </div>
                <div className="col-span-1">
                  <label className="mb-2.5 block text-black dark:text-white">Logo</label>
                  <label htmlFor="avatar-upload" className="cursor-pointer block w-20 h-20">
                    <img
                      src={avatarPreview || 'https://placehold.co/100x100'}
                      alt="Company Logo"
                      className="h-20 w-20 rounded-full object-cover border border-dashed border-gray-300 hover:opacity-80 transition"
                    />
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'avatar')}
                    className="hidden"
                    disabled={loading}
                  />
                </div>
                <div className="col-span-1">
                  <label className="mb-2.5 block text-black dark:text-white">Trạng thái</label>
                  <button
                    type="button"
                    onClick={toggleActiveStatus}
                    className={`w-full rounded py-3 px-5 text-white ${
                      companyDetail?.isApproved ? 'bg-green-500' : 'bg-red-500'
                    } hover:bg-opacity-90`}
                    disabled={loading}
                  >
                    {companyDetail?.isApproved ? 'Hoạt động' : 'Dừng hoạt động'}
                  </button>
                </div>
              </div>

              {/* Hàng 4: Mã số thuế và Giấy phép kinh doanh */}
              <div className="flex space-x-4 mb-4.5">
                <div className="flex-1">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Mã số thuế <span className="text-meta-1">*</span>
                  </label>
                  <input
                    type="text"
                    name="taxCode"
                    value={companyDetail?.taxCode || ''}
                    onChange={handleInputChange}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    disabled={loading}
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-2.5 block text-black dark:text-white">Giấy phép kinh doanh</label>
                  <label htmlFor="business-license-upload" className="cursor-pointer block w-full">
                    {businessLicensePreview ? (
                      <div className="flex items-center gap-2">
                        <span className="truncate">{businessLicensePreview}</span>
                      </div>
                    ) : (
                      <div className="h-12 w-full rounded border border-dashed border-gray-300 flex items-center justify-center text-gray-500">
                        Chọn file
                      </div>
                    )}
                  </label>
                  <input
                    id="business-license-upload"
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileChange(e, 'businessLicense')}
                    className="hidden"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Hàng 5: Giới thiệu */}
              <div className="flex space-x-4 mb-4.5">
                <div className="flex-1">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Giới thiệu <span className="text-meta-1">*</span>
                  </label>
                  <textarea
                    name="about"
                    value={companyDetail?.about || ''}
                    onChange={handleInputChange}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    rows={4}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default EditCompanies;