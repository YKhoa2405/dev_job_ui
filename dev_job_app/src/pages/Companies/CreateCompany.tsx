import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { authApi, endpoints } from '../../common/API';
import { toast } from 'react-toastify';
import Loader from '../../common/Loader';
import { useSearchParams } from 'react-router-dom';

interface Province {
  id: string;
  full_name: string;
}

interface District {
  id: string;
  full_name: string;
}

interface Ward {
  id: string;
  full_name: string;
}

const CreateCompany = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('');
  const [selectedWardId, setSelectedWardId] = useState<string>('');

  const [name, setName] = useState<string>('');
  const [slogan, setSlogan] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [street, setStreet] = useState<string>('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [businessLicense, setBusinessLicense] = useState<File | null>(null); // New state
  const [website, setWebsite] = useState<string>('');
  const [field, setField] = useState<string>('');
  const [size, setSize] = useState<string>('100-199');
  const [about, setAbout] = useState<string>('');
  const [taxCode, setTaxCode] = useState<string>('');

  const sizeOptions = [
    { value: '100-199', label: '100 - 199' },
    { value: '200-299', label: '200 - 299' },
    { value: '300-399', label: '300 - 399' },
    { value: '400-499', label: '400 - 499' },
    { value: '500+', label: '500+' },
    { value: '1000+', label: '1000+' },
  ];


  useEffect(() => {
    fetchProvinces();
  }, []);

  useEffect(() => {
    updateLocationDetail();
  }, [selectedProvinceId, selectedDistrictId, selectedWardId, street]);

  const fetchProvinces = async () => {
    const res = await axios.get('https://esgoo.net/api-tinhthanh/1/0.htm');
    setProvinces(res.data.data || []);
  };

  const fetchDistricts = async (provinceId: string) => {
    const res = await axios.get<{ data: District[] }>(`https://esgoo.net/api-tinhthanh/2/${provinceId}.htm`);
    if (res.data) {
      setDistricts(res.data.data || []);
      setSelectedDistrictId('');
      setSelectedWardId('');
    }
  };

  const fetchWards = async (districtId: string) => {
    const response = await axios.get(`https://esgoo.net/api-tinhthanh/3/${districtId}.htm`);
    if (response.data.error === 0) {
      setWards(response.data.data || []);
      setSelectedWardId('');
    }
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceId = e.target.value;
    setSelectedProvinceId(provinceId);
    fetchDistricts(provinceId);
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtId = e.target.value;
    setSelectedDistrictId(e.target.value);
    fetchWards(districtId);
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWardId(e.target.value);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'businessLicense') => {
    if (event.target.files && event.target.files.length > 0) {
      if (type === 'avatar') {
        setAvatar(event.target.files[0]);
      } else {
        setBusinessLicense(event.target.files[0]);
      }
    }
  };

  const updateLocationDetail = async () => {
    const province = provinces.find((p) => p.id === selectedProvinceId)?.full_name || '';
    const district = districts.find((d) => d.id === selectedDistrictId)?.full_name || '';
    const ward = wards.find((w) => w.id === selectedWardId)?.full_name || '';

    setCity(province);

    const detail = [street, ward, district, province].filter(Boolean).join(', ');
    setAddress(detail);
  };

  const handleCreateCompany = async (e: any) => {
    e.preventDefault();
    if (!name || !about || !size || !field || !address || !slogan || !website || !taxCode) {
      toast.error('Vui lòng nhập đầy đủ thông tin', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
      });
      return;
    }
    setLoading(true);

    const companyData = new FormData();
    companyData.append('name', name);
    companyData.append('about', about);
    companyData.append('address', address);
    companyData.append('website', website);
    companyData.append('size', size);
    companyData.append('field', field);
    companyData.append('city', city);
    companyData.append('slogan', slogan);
    companyData.append('taxCode', taxCode);
    if (userId) {
      companyData.append('userId', userId);
    }
    if (avatar) {
      companyData.append('avatar', avatar);
    }
    if (businessLicense) {
      companyData.append('businessLicense', businessLicense); // Add businessLicense to FormData
    }

    try {
      const token: any = localStorage.getItem('access_token');
      await authApi(token).post(endpoints['companiesAdmin'], companyData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Thêm mới thành công!', {
        position: 'top-right',
        autoClose: 3000,
      });
      navigate('/admin/companies');
    } catch (error) {
      toast.error('Thêm mới thất bại', {
        position: 'top-right',
        autoClose: 3000,
      });
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Thêm mới công ty
        </h2>
        <nav>
          <ol className="flex items-center gap-2">
            <li>
              <Link className="font-medium" to="/admin/companies">
                Quản lý công ty /
              </Link>
            </li>
            <li className="font-medium text-primary">Thêm mới công ty</li>
          </ol>
        </nav>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="flex flex-col gap-10">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <form onSubmit={handleCreateCompany}>
              <div className="p-6.5">
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Tên công ty <span className="text-meta-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nhập tên công ty"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>
                {/* Hàng 2 */}
                <div className="flex space-x-4 mb-4.5">
                  <div className="flex-1">
                    <label className="mb-2.5 block text-black dark:text-white">
                      Tỉnh thành <span className="text-meta-1">*</span>
                    </label>
                    <select
                      value={selectedProvinceId}
                      onChange={handleProvinceChange}
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    >
                      <option value="" disabled hidden>
                        Chọn tỉnh thành
                      </option>
                      {provinces.map((province) => (
                        <option key={province.id} value={province.id}>
                          {province.full_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1">
                    <label className="mb-2.5 block text-black dark:text-white">
                      Quận huyện <span className="text-meta-1">*</span>
                    </label>
                    <select
                      value={selectedDistrictId}
                      onChange={handleDistrictChange}
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    >
                      <option value="" disabled hidden>
                        Chọn quận huyện
                      </option>
                      {districts.map((district) => (
                        <option key={district.id} value={district.id}>
                          {district.full_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1">
                    <label className="mb-2.5 block text-black dark:text-white">
                      Xã phường <span className="text-meta-1">*</span>
                    </label>
                    <select
                      value={selectedWardId}
                      onChange={handleWardChange}
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    >
                      <option value="" disabled hidden>
                        Chọn xã phường
                      </option>
                      {wards.map((ward) => (
                        <option key={ward.id} value={ward.id}>
                          {ward.full_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="mb-2.5 block text-black dark:text-white">
                      Địa chỉ chi tiết<span className="text-meta-1">*</span>
                    </label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Số nhà, tên đường, ..."
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>
                </div>

                {/* Hàng 1 */}
                <div className="flex space-x-4 mb-4.5">
                  <div className="flex-1">
                    <label className="mb-2.5 block text-black dark:text-white">
                      Logo <span className="text-meta-1">*</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'avatar')}
                      placeholder="Logo công ty"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="mb-2.5 block text-black dark:text-white">
                      Giấy phép kinh doanh <span className="text-meta-1">*</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileChange(e, 'businessLicense')}
                      placeholder="Giấy phép kinh doanh"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="mb-2.5 block text-black dark:text-white">
                      Website <span className="text-meta-1">*</span>
                    </label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="Url website công ty"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="mb-2.5 block text-black dark:text-white">
                      Quy mô <span className="text-meta-1">*</span>
                    </label>
                    <select
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    >
                      <option value="" disabled hidden>
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
                <div className="flex space-x-4 mb-4.5">
                  <div className="flex-1">
                    <label className="mb-2.5 block text-black dark:text-white">
                      Mã số thuế <span className="text-meta-1">*</span>
                    </label>
                    <input
                      type="text"
                      value={taxCode}
                      onChange={(e) => setTaxCode(e.target.value)}
                      placeholder="Nhập mã số thuế"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="mb-2.5 block text-black dark:text-white">
                      Slogan <span className="text-meta-1">*</span>
                    </label>
                    <input
                      type="text"
                      value={slogan}
                      onChange={(e) => setSlogan(e.target.value)}
                      placeholder="Nhập slogan của công ty"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="mb-2.5 block text-black dark:text-white">
                      Lĩnh vực <span className="text-meta-1">*</span>
                    </label>
                    <input
                      type="text"
                      value={field}
                      onChange={(e) => setField(e.target.value)}
                      placeholder="Nhập lĩnh vực hoạt động "
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Giới thiệu
                  </label>
                  <textarea
                    rows={6}
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    placeholder="Giới thiệu về công ty"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                >
                  Thêm mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateCompany;