import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import API, { authApi, endpoints } from '../../common/API';
import { toast } from 'react-toastify';
import { ICompanyList } from '../../types/company';
import Select, { MultiValue } from 'react-select';
import { azuze_map_primary_key_api } from '../../common/KEY';
import Loader from '../../common/Loader';

interface Province {
    id: string;
    full_name: string;
}

interface Option {
    value: string; // name
    label: string; // name
}


const CreateJobs = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false);

    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<Province[]>([]);
    const [wards, setWards] = useState<Province[]>([]);
    const [skills, setSkills] = useState<Option[]>([]);
    const [companies, setCompanies] = useState<ICompanyList[]>([]);

    const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');
    const [selectedDistrictId, setSelectedDistrictId] = useState<string>('');
    const [selectedWardId, setSelectedWardId] = useState('');
    const [street, setStreet] = useState('')
    const [location, setLocation] = useState('')

    const [name, setName] = useState('')
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [salary, setSalary] = useState('');
    const [level, setLevel] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [jobType, setJobType] = useState('');
    const [city, setCity] = useState('')
    const [selectedSkills, setSelectedSkills] = useState<MultiValue<Option>>([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [requirement, setRequirement] = useState('')
    const [description, setDescription] = useState('')
    const [prioritize, setPrioritize] = useState('')
    const [lon, setLon] = useState<number>(0);
    const [lat, setLat] = useState<number>(0);


    const salaryOptions = [
        { value: '', label: 'Chọn mức lương' },
        { value: '1', label: 'Dưới 5 triệu' },
        { value: '2', label: '10 - 15  triệu' },
        { value: '3', label: '15 - 20 triệu' },
        { value: '4', label: '20 - 25 triệu' },
        { value: '5', label: '30 - 50 triệu' },
        { value: '6', label: 'Trên 50 triệu' },
        { value: '7', label: 'Thỏa thuận' },
    ];


    const levelOptions = [
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

    const jobTypeOptions = [
        { value: '', label: 'Chọn loại hình' },
        { value: 'Office', label: 'Office' },
        { value: 'Remote', label: 'Remote' },
        { value: 'Hybrid', label: 'Hybrid' },
    ];


    useEffect(() => {
        fetchProvinces();
        fetchSkills();
        fetchCompany();
    }, []);

    useEffect(() => {
        updateLocationDetail();
    }, [selectedProvinceId, selectedDistrictId, selectedWardId, street]);


    const fetchSkills = async () => {
        try {
            const res = await API.get(endpoints['skills']);
            console.log(res.data.data)
            const formattedOptions = res.data.data.result.map((item: any) => ({
                value: item.name,
                label: item.name,
            }));
            setSkills(formattedOptions)
        } catch (error) {
            console.log(error)
        }
    };

    const fetchCompany = async () => {
        try {
            const token: any = localStorage.getItem("access_token");
            const res = await authApi(token).get(endpoints['companies'])
            setCompanies(res.data.data.result)
        } catch (error) {
            console.log(error)
        }
    }

    const fetchProvinces = async () => {
        const res = await axios.get('https://esgoo.net/api-tinhthanh/1/0.htm');
        setProvinces(res.data.data || []);
    };

    const fetchDistricts = async (provinceId: string) => {
        const res = await axios.get<{ data: Province[] }>(`https://esgoo.net/api-tinhthanh/2/${provinceId}.htm`);
        if (res.data) {
            setDistricts(res.data.data || []);
            setSelectedDistrictId('');
            setSelectedWardId('')
        }
    };

    const fetchWards = async (districtId: string) => {
        const response = await axios.get(`https://esgoo.net/api-tinhthanh/3/${districtId}.htm`);
        if (response.data.error === 0) {
            setWards(response.data.data || []);
            setSelectedWardId('')
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
        fetchWards(districtId)
    };


    const handleSkillChange = (selected: MultiValue<Option>) => {
        setSelectedSkills(selected);
    };

    const getCoordinatesFromAddress = async (locationDetail: string) => {
        try {
            const response = await axios.get('https://atlas.microsoft.com/search/address/json', {
                params: {
                    'api-version': '1.0',
                    'subscription-key': azuze_map_primary_key_api,
                    query: locationDetail
                }
            });
            const { data } = response;
            const location = data.results[0].position;
            return {
                latitude: location.lat,
                longitude: location.lon
            };
        } catch (error) {
            console.log(error);
        }
    };

    const updateLocationDetail = async () => {
        const province = provinces.find(p => p.id === selectedProvinceId)?.full_name || '';
        const district = districts.find(d => d.id === selectedDistrictId)?.full_name || '';
        const ward = wards.find(w => w.id === selectedWardId)?.full_name || '';

        setCity(province)

        const detail = [
            street,
            ward,
            district,
            province
        ].filter(Boolean).join(', ');

        setLocation(detail);
        if (detail) {
            try {
                const { latitude, longitude } = await getCoordinatesFromAddress(detail) || {};
                setLon(Number(longitude));
                setLat(Number(latitude));
            } catch (error) {
                console.log(error)
            }
        } else {
            console.log('Detail is null or empty');
        }
    };

    const handleCreateJob = async (e: any) => {
        e.preventDefault();
        if (
            !name ||
            !requirement ||
            !description ||
            !prioritize ||
            !location ||
            !jobType ||
            !salary ||
            !city ||
            !level ||
            !quantity ||
            !selectedSkills
        ) {
            toast.error('Vui lòng nhập đầy đủ thông tin!', {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        const jobData = {
            name,
            companyId: selectedCompany,
            startDate: startDate,
            endDate: endDate,
            description,
            requirement,
            prioritize,
            location,
            skills: selectedSkills.map(option => option.label),
            jobType,
            city,
            salary,
            quantity,
            level,
            latitude: lat,
            longitude: lon,
        };

        if (startDate >= endDate) {
            toast.error('Thời gian không hợp lệ!', {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        setLoading(true)

        try {
            const token: any = localStorage.getItem("access_token");
            await authApi(token).post(endpoints['jobs'], jobData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            toast.success('Thêm mới thành công!', {
                position: "top-right",
                autoClose: 3000,
            });
            navigate('/admin/jobs')

        } catch (error) {
            toast.error('Thêm mới thất bại thất bại', {
                position: "top-right",
                autoClose: 3000,
            });
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-title-md2 font-semibold text-black dark:text-white">
                    Thêm tin tuyển dụng
                </h2>
                <nav>
                    <ol className="flex items-center gap-2">
                        <li>
                            <Link className="font-medium" to="/admin/jobs">
                                Quản lý tin tuyển dụng /
                            </Link>
                        </li>
                        <li className="font-medium text-primary">Thêm tin tuyển dụng</li>
                    </ol>
                </nav>
            </div>

            <div className="flex flex-col gap-10">
                {loading ? (
                    <Loader />
                ) : (
                    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                        <form onSubmit={handleCreateJob}>
                            <div className="p-6.5">
                                <div className="mb-4.5">
                                    <label className="mb-2.5 block text-black dark:text-white">
                                        Tiêu đề <span className="text-meta-1">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Nhập tiêu đề tin tuyển dụng"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    />
                                </div>

                                {/* Hàng 1 */}
                                <div className="flex space-x-4 mb-4.5">
                                    <div className="flex-1">
                                        <label className="mb-2.5 block text-black dark:text-white">Mức lương <span className="text-meta-1">*</span></label>
                                        <select
                                            value={salary}
                                            onChange={(e) => setSalary(e.target.value)}
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
                                            {salaryOptions.map(option => (
                                                <option key={option.value} value={option.label}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex-1">
                                        <label className="mb-2.5 block text-black dark:text-white">Level <span className="text-meta-1">*</span></label>
                                        <select
                                            value={level}
                                            onChange={(e) => setLevel(e.target.value)}
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
                                            {levelOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex-1">
                                        <label className="mb-2.5 block text-black dark:text-white">Số lượng <span className="text-meta-1">*</span></label>
                                        <input
                                            type="number"
                                            placeholder="Nhập số lượng"
                                            value={quantity}
                                            onChange={(e) => setQuantity(Number(e.target.value))}
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="mb-2.5 block text-black dark:text-white">Loại hình <span className="text-meta-1">*</span></label>
                                        <select
                                            value={jobType}
                                            onChange={(e) => setJobType(e.target.value)}
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
                                            {jobTypeOptions.map(option => (
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
                                        <label className="mb-2.5 block text-black dark:text-white">Tỉnh thành <span className="text-meta-1">*</span></label>
                                        <select
                                            value={selectedProvinceId}
                                            onChange={handleProvinceChange}
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">

                                            <option value="" disabled hidden>Chọn tỉnh thành</option>
                                            {provinces.map((province) => (
                                                <option key={province.id} value={province.id}>
                                                    {province.full_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex-1">
                                        <label className="mb-2.5 block text-black dark:text-white">Quận huyện <span className="text-meta-1">*</span></label>
                                        <select
                                            value={selectedDistrictId}
                                            onChange={handleDistrictChange}
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">

                                            <option value="" disabled hidden>Chọn quận huyện</option>
                                            {districts.map((district) => (
                                                <option key={district.id} value={district.id}>
                                                    {district.full_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex-1">
                                        <label className="mb-2.5 block text-black dark:text-white">Xã phường <span className="text-meta-1">*</span></label>
                                        <select
                                            value={selectedWardId}
                                            onChange={(e) => setSelectedWardId(e.target.value)}
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">

                                            <option value="" disabled hidden>Chọn xã phường</option>
                                            {wards.map((ward) => (
                                                <option key={ward.id} value={ward.id}>
                                                    {ward.full_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <label className="mb-2.5 block text-black dark:text-white">Địa chỉ chi tiết<span className="text-meta-1">*</span></label>
                                        <input
                                            type="text"
                                            placeholder="Số nhà, tên đường, ..."
                                            value={street}
                                            onChange={(e) => setStreet(e.target.value)}
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                        />
                                    </div>
                                </div>
                                <div className="flex space-x-4 mb-4.5">
                                    <div className="flex-1">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                            Kĩ năng <span className="text-meta-1">*</span>
                                        </label>

                                        <Select
                                            styles={{
                                                control: (base) => ({
                                                    ...base,
                                                    padding: '0.3rem 1.0rem', // Thay đổi padding tại đây
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
                                        />

                                    </div>

                                    <div className="flex-1">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                            Thuộc công ty <span className="text-meta-1">*</span>
                                        </label>
                                        <select
                                            value={selectedCompany}
                                            onChange={(e) => setSelectedCompany(e.target.value)} // Cập nhật công ty khi người dùng chọn
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                        >
                                            <option value="" disabled hidden>Chọn công ty</option>
                                            {companies.map((company) => (
                                                <option key={company._id} value={company._id}>
                                                    {company.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex space-x-4 mb-4.5">
                                    <div className="flex-1">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                            Ngày bắt đầu <span className="text-meta-1">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={startDate.toISOString().split('T')[0]}
                                            onChange={(e) => setStartDate(new Date(e.target.value))}
                                            placeholder="Nhập địa điểm làm việc"
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                            Ngày kết thúc <span className="text-meta-1">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={endDate.toISOString().split('T')[0]}
                                            onChange={(e) => setEndDate(new Date(e.target.value))}
                                            placeholder="Nhập địa điểm làm việc"
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                        />
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="mb-2.5 block text-black dark:text-white">Mô tả <span className="text-meta-1">*</span></label>

                                    <textarea
                                        rows={4}
                                        placeholder="Mô tả công việc ..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    ></textarea>
                                </div>

                                <div className="mb-6">
                                    <label className="mb-2.5 block text-black dark:text-white">Yêu cầu <span className="text-meta-1">*</span></label>

                                    <textarea
                                        rows={4}
                                        placeholder="Yêu cầu công việc dành cho ứng viên ..."
                                        value={requirement}
                                        onChange={(e) => setRequirement(e.target.value)}
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    ></textarea>
                                </div>
                                <div className="mb-6">
                                    <label className="mb-2.5 block text-black dark:text-white">
                                        Ưu tiên
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="Type your message"
                                        value={prioritize}
                                        onChange={(e) => setPrioritize(e.target.value)}
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    ></textarea>
                                </div>

                                <button type='submit' className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90">
                                    Thêm mới
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </>
    );
};

export default CreateJobs;
