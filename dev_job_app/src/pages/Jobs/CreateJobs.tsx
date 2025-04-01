import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import API, { authApi, endpoints } from '../../common/API';
import { toast } from 'react-toastify';
import { ICompanyList } from '../../types/company';
import Select, { MultiValue } from 'react-select';
import { azuze_map_primary_key_api } from '../../common/KEY';
import Loader from '../../common/Loader';
import { IJobDetail } from '../../types/job'; // Assuming this is where IJobDetail is defined

interface Province {
    id: string;
    full_name: string;
}

interface Option {
    value: string;
    label: string;
}

const CreateJobs = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<Province[]>([]);
    const [wards, setWards] = useState<Province[]>([]);
    const [skills, setSkills] = useState<Option[]>([]);
    const [companies, setCompanies] = useState<ICompanyList[]>([]);

    const [jobData, setJobData] = useState<Partial<IJobDetail>>({
        name: '',
        companyId: { _id: '', name: '' },
        startDate: new Date(),
        endDate: new Date(),
        salary: '',
        level: '',
        quantity: 1,
        jobType: '',
        city: '',
        skills: [],
        requirement: '',
        description: '',
        prioritize: '',
        location: '',
        latitude: 0,
        longitude: 0,
        isUrgent: false
    });
    const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');
    const [selectedDistrictId, setSelectedDistrictId] = useState<string>('');
    const [selectedWardId, setSelectedWardId] = useState<string>('');
    const [street, setStreet] = useState<string>('');

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
        // Custom debounce implementation
        const timer = setTimeout(() => {
            updateLocationDetail();
        }, 500);
        return () => clearTimeout(timer);
    }, [selectedProvinceId, selectedDistrictId, selectedWardId, street]);

    const fetchProvinces = async () => {
        try {
            const res = await axios.get('https://esgoo.net/api-tinhthanh/1/0.htm');
            setProvinces(res.data.data || []);
        } catch (error) {
            console.error('Error fetching provinces:', error);
            toast.error('Không thể tải danh sách tỉnh thành', { position: "top-right", autoClose: 3000 });
        }
    };

    const fetchDistricts = async (provinceId: string) => {
        try {
            const res = await axios.get<{ data: Province[] }>(`https://esgoo.net/api-tinhthanh/2/${provinceId}.htm`);
            setDistricts(res.data.data || []);
            setSelectedDistrictId('');
            setSelectedWardId('');
            setWards([]);
        } catch (error) {
            console.error('Error fetching districts:', error);
        }
    };

    const fetchWards = async (districtId: string) => {
        try {
            const res = await axios.get(`https://esgoo.net/api-tinhthanh/3/${districtId}.htm`);
            if (res.data.error === 0) {
                setWards(res.data.data || []);
                setSelectedWardId('');
            }
        } catch (error) {
            console.error('Error fetching wards:', error);
        }
    };

    const fetchSkills = async () => {
        try {
            const res = await API.get(endpoints['skills'], { params: { page: 1, limit: 100 } });
            const formattedOptions = res.data.data.result.map((item: any) => ({
                value: item.name,
                label: item.name,
            }));
            setSkills(formattedOptions);
        } catch (error) {
            console.error('Error fetching skills:', error);
            toast.error('Không thể tải danh sách kỹ năng', { position: "top-right", autoClose: 3000 });
        }
    };

    const fetchCompany = async () => {
        try {
            const token = localStorage.getItem("access_token");
            if (!token) throw new Error("No access token found");
            const res = await authApi(token).get(endpoints['companies']);
            setCompanies(res.data.data.result);
        } catch (error) {
            console.error('Error fetching companies:', error);
            toast.error('Không thể tải danh sách công ty', { position: "top-right", autoClose: 3000 });
        }
    };

    const handleProvinceChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const provinceId = e.target.value;
        setSelectedProvinceId(provinceId);
        fetchDistricts(provinceId);
    }, []);

    const handleDistrictChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const districtId = e.target.value;
        setSelectedDistrictId(districtId);
        fetchWards(districtId);
    }, []);

    const handleSkillChange = useCallback((selected: MultiValue<Option>) => {
        if (selected && selected.length > 0) {
            setJobData(prev => ({ ...prev, skills: selected.map(option => option.value) as [] }));
        } else {
            setJobData(prev => ({ ...prev, skills: [] }));
        }
    }, []);

    const getCoordinatesFromAddress = async (locationDetail: string) => {
        try {
            const response = await axios.get('https://atlas.microsoft.com/search/address/json', {
                params: {
                    'api-version': '1.0',
                    'subscription-key': azuze_map_primary_key_api,
                    query: locationDetail,
                },
            });
            const { data } = response;
            const location = data.results[0]?.position;
            return {
                latitude: location?.lat || 0,
                longitude: location?.lon || 0,
            };
        } catch (error) {
            console.error('Error fetching coordinates:', error);
            return { latitude: 0, longitude: 0 };
        }
    };

    const updateLocationDetail = async () => {
        const province = provinces.find(p => p.id === selectedProvinceId)?.full_name || '';
        const district = districts.find(d => d.id === selectedDistrictId)?.full_name || '';
        const ward = wards.find(w => w.id === selectedWardId)?.full_name || '';
        const detail = [street, ward, district, province].filter(Boolean).join(', ');

        setJobData(prev => ({
            ...prev,
            city: province,
            location: detail,
        }));

        if (detail) {
            const { latitude, longitude } = await getCoordinatesFromAddress(detail);
            setJobData(prev => ({
                ...prev,
                latitude,
                longitude,
            }));
        }
    };

    const handleCreateJob = async (e: React.FormEvent) => {
        e.preventDefault();
        const { name, companyId, salary, level, quantity, jobType, city, skills, requirement, description, location, startDate, endDate, isUrgent } = jobData;

        if (!name || !companyId?._id || !salary || !level || !quantity || !jobType || !city || !skills?.length || !requirement || !description || !location) {
            toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc!', { position: "top-right", autoClose: 3000 });
            return;
        }

        if (startDate >= endDate) {
            toast.error('Ngày bắt đầu phải trước ngày kết thúc!', { position: "top-right", autoClose: 3000 });
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("access_token");
            if (!token) throw new Error("No access token found");

            const payload = {
                ...jobData,
                companyId: jobData.companyId?._id, // Send only the ID
            };

            await authApi(token).post(endpoints['jobs'], payload, {
                headers: { 'Content-Type': 'application/json' },
            });

            toast.success('Thêm mới tin tuyển dụng thành công!', { position: "top-right", autoClose: 3000 });
            navigate('/admin/jobs');
        } catch (error) {
            console.error('Error creating job:', error);
            toast.error('Thêm mới tin tuyển dụng thất bại', { position: "top-right", autoClose: 3000 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-title-md2 font-semibold text-black dark:text-white">
                    Thêm tin tuyển dụng
                </h2>
                <nav>
                    <ol className="flex items-center gap-2">
                        <li><Link className="font-medium" to="/admin/jobs">Quản lý tin tuyển dụng /</Link></li>
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
                                    <label className="mb-2.5 block text-black dark:text-white">Tiêu đề <span className="text-meta-1">*</span></label>
                                    <input
                                        type="text"
                                        placeholder="Nhập tiêu đề tin tuyển dụng"
                                        value={jobData.name}
                                        onChange={(e) => setJobData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                        disabled={loading}
                                    />
                                </div>

                                <div className="flex space-x-4 mb-4.5">
                                    <div className="flex-1">
                                        <label className="mb-2.5 block text-black dark:text-white">Mức lương <span className="text-meta-1">*</span></label>
                                        <select
                                            value={jobData.salary}
                                            onChange={(e) => setJobData(prev => ({ ...prev, salary: e.target.value }))}
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                            disabled={loading}
                                        >
                                            {salaryOptions.map(option => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <label className="mb-2.5 block text-black dark:text-white">Level <span className="text-meta-1">*</span></label>
                                        <select
                                            value={jobData.level}
                                            onChange={(e) => setJobData(prev => ({ ...prev, level: e.target.value }))}
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                            disabled={loading}
                                        >
                                            {levelOptions.map(option => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <label className="mb-2.5 block text-black dark:text-white">Số lượng <span className="text-meta-1">*</span></label>
                                        <input
                                            type="number"
                                            placeholder="Nhập số lượng"
                                            value={jobData.quantity}
                                            onChange={(e) => setJobData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="mb-2.5 block text-black dark:text-white">Loại hình <span className="text-meta-1">*</span></label>
                                        <select
                                            value={jobData.jobType}
                                            onChange={(e) => setJobData(prev => ({ ...prev, jobType: e.target.value }))}
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                            disabled={loading}
                                        >
                                            {jobTypeOptions.map(option => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex space-x-4 mb-4.5">
                                    <div className="flex-1">
                                        <label className="mb-2.5 block text-black dark:text-white">Tỉnh thành <span className="text-meta-1">*</span></label>
                                        <select
                                            value={selectedProvinceId}
                                            onChange={handleProvinceChange}
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                            disabled={loading}
                                        >
                                            <option value="" disabled>Chọn tỉnh thành</option>
                                            {provinces.map(province => (
                                                <option key={province.id} value={province.id}>{province.full_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <label className="mb-2.5 block text-black dark:text-white">Quận huyện <span className="text-meta-1">*</span></label>
                                        <select
                                            value={selectedDistrictId}
                                            onChange={handleDistrictChange}
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                            disabled={loading || !selectedProvinceId}
                                        >
                                            <option value="" disabled>Chọn quận huyện</option>
                                            {districts.map(district => (
                                                <option key={district.id} value={district.id}>{district.full_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <label className="mb-2.5 block text-black dark:text-white">Xã phường <span className="text-meta-1">*</span></label>
                                        <select
                                            value={selectedWardId}
                                            onChange={(e) => setSelectedWardId(e.target.value)}
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                            disabled={loading || !selectedDistrictId}
                                        >
                                            <option value="" disabled>Chọn xã phường</option>
                                            {wards.map(ward => (
                                                <option key={ward.id} value={ward.id}>{ward.full_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <label className="mb-2.5 block text-black dark:text-white">Địa chỉ chi tiết <span className="text-meta-1">*</span></label>
                                        <input
                                            type="text"
                                            placeholder="Số nhà, tên đường, ..."
                                            value={street}
                                            onChange={(e) => setStreet(e.target.value)}
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div className="flex space-x-4 mb-4.5">
                                    <div className="flex-1">
                                        <label className="mb-2.5 block text-black dark:text-white">Kỹ năng <span className="text-meta-1">*</span></label>
                                        <Select
                                            styles={{ control: (base) => ({ ...base, padding: '0.3rem 1.0rem' }) }}
                                            isMulti
                                            options={skills}
                                            value={skills.filter(skill => jobData.skills?.includes(skill.value))}
                                            onChange={handleSkillChange}
                                            placeholder="Chọn kỹ năng liên quan..."
                                            closeMenuOnSelect={false}
                                            className="custom-react-select"
                                            classNamePrefix="react-select"
                                            isDisabled={loading}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="mb-2.5 block text-black dark:text-white">Thuộc công ty <span className="text-meta-1">*</span></label>
                                        <select
                                            value={jobData.companyId?._id || ''}
                                            onChange={(e) => {
                                                const selectedCompany = companies.find(c => c._id === e.target.value);
                                                setJobData(prev => ({
                                                    ...prev,
                                                    companyId: selectedCompany ? { _id: selectedCompany._id, name: selectedCompany.name } : { _id: '', name: '' },
                                                }));
                                            }}
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                            disabled={loading}
                                        >
                                            <option value="" disabled>Chọn công ty</option>
                                            {companies.map(company => (
                                                <option key={company._id} value={company._id}>{company.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex space-x-4 mb-4.5">
                                    <div className="flex-1">
                                        <label className="mb-2.5 block text-black dark:text-white">Ngày bắt đầu <span className="text-meta-1">*</span></label>
                                        <input
                                            type="date"
                                            value={jobData.startDate?.toISOString().split('T')[0]}
                                            onChange={(e) => setJobData(prev => ({ ...prev, startDate: new Date(e.target.value) }))}
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="mb-2.5 block text-black dark:text-white">Ngày kết thúc <span className="text-meta-1">*</span></label>
                                        <input
                                            type="date"
                                            value={jobData.endDate?.toISOString().split('T')[0]}
                                            onChange={(e) => setJobData(prev => ({ ...prev, endDate: new Date(e.target.value) }))}
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div className="mb-6 flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="urgentJob"
                                        checked={jobData.isUrgent}
                                        onChange={(e) => setJobData(prev => ({ ...prev, isUrgent: e.target.checked }))}
                                        className="h-5 w-5 cursor-pointer accent-primary"
                                        disabled={loading}
                                    />
                                    <label htmlFor="urgentJob" className="text-black dark:text-white cursor-pointer">
                                        Tin tuyển dụng Gấp
                                    </label>
                                </div>


                                <div className="mb-6">
                                    <label className="mb-2.5 block text-black dark:text-white">Mô tả <span className="text-meta-1">*</span></label>
                                    <textarea
                                        rows={4}
                                        placeholder="Mô tả công việc ..."
                                        value={jobData.description}
                                        onChange={(e) => setJobData(prev => ({ ...prev, description: e.target.value }))}
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                        disabled={loading}
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="mb-2.5 block text-black dark:text-white">Yêu cầu <span className="text-meta-1">*</span></label>
                                    <textarea
                                        rows={4}
                                        placeholder="Yêu cầu công việc dành cho ứng viên ..."
                                        value={jobData.requirement}
                                        onChange={(e) => setJobData(prev => ({ ...prev, requirement: e.target.value }))}
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                        disabled={loading}
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="mb-2.5 block text-black dark:text-white">Ưu tiên</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Ưu tiên cho ứng viên (nếu có)..."
                                        value={jobData.prioritize}
                                        onChange={(e) => setJobData(prev => ({ ...prev, prioritize: e.target.value }))}
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                        disabled={loading}
                                    />
                                </div>

                                <div className="flex justify-end gap-2">
                                    <button
                                        type="submit"
                                        className="flex justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:bg-opacity-50"
                                        disabled={loading}
                                    >
                                        Thêm mới
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/admin/jobs')}
                                        className="flex justify-center rounded bg-gray-500 p-3 font-medium text-white hover:bg-opacity-90 disabled:bg-opacity-50"
                                        disabled={loading}
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </>
    );
};

export default CreateJobs;