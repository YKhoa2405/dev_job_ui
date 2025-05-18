import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import API, { authApi, endpoints } from '../../common/API';
import { toast } from 'react-toastify';
import Loader from '../../common/Loader';
import { useSearchParams } from 'react-router-dom';
import Select from 'react-select';

interface Province {
    id: string;
    full_name: string;
}

interface Option {
    value: string;
    label: string;
}

const salaryData = [
    { title: 'Dưới 5 triệu' },
    { title: '10 - 15 triệu' },
    { title: '15 - 20 triệu' },
    { title: '20 - 25 triệu' },
    { title: '30 - 50 triệu' },
    { title: 'Trên 50 triệu' },
    { title: 'Thỏa thuận' },
];

const levelData = [
    { title: 'Intern' },
    { title: 'Fresher' },
    { title: 'Junior' },
    { title: 'Middle' },
    { title: 'Senior' },
    { title: 'Trưởng nhóm' },
    { title: 'Trưởng phòng' },
    { title: 'Director' },
];

const jobTypeData = [
    { title: 'Office' },
    { title: 'Remote' },
    { title: 'Hybrid' },
];

const availabilityData = [
    { title: 'Ngay lập tức' },
    { title: '1 tuần' },
    { title: '2 tuần' },
    { title: '1 tháng' },
];

const CreateCandidate = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const userId = searchParams.get('userId');
    const emailUser = searchParams.get('email');
    const name = searchParams.get('name');
    const [loading, setLoading] = useState(false);
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');
    const [skillOptions, setSkillOptions] = useState<Option[]>([]);

    // State cho các trường trong schema
    const [avatar, setAvatar] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [phone, setPhone] = useState<string>('');
    const [location, setLocation] = useState<string>('');
    const [selectedSkills, setSelectedSkills] = useState<Option[]>([]);
    const [level, setLevel] = useState<string>('');
    const [salary, setSalary] = useState<string>('');
    const [jobType, setJobType] = useState<string>('');
    const [availability, setAvailability] = useState<string>('');

    useEffect(() => {
        fetchProvinces();
        fetchSkills();
    }, []);

    useEffect(() => {
        const province = provinces.find((p) => p.id === selectedProvinceId)?.full_name || '';
        setLocation(province);
    }, [selectedProvinceId, provinces]);

    const fetchProvinces = async () => {
        try {
            const res = await axios.get('https://esgoo.net/api-tinhthanh/1/0.htm');
            setProvinces(res.data.data || []);
        } catch (error) {
            console.error('Error fetching provinces:', error);
        }
    };

    const fetchSkills = async () => {
        try {
            const res = await API.get(endpoints['skills'], { params: { page: 1, limit: 100 } });
            const formattedOptions = res.data.data.result.map((item: any) => ({
                value: item.name,
                label: item.name,
            }));
            setSkillOptions(formattedOptions);
        } catch (error) {
            console.error('Error fetching skills:', error);
        }
    };

    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedProvinceId(e.target.value);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File ảnh vượt quá 5MB', { position: 'top-right', autoClose: 3000 });
                return;
            }
            if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
                toast.error('Vui lòng chọn file ảnh (JPEG, PNG, GIF)', { position: 'top-right', autoClose: 3000 });
                return;
            }
            if (avatarPreview) {
                URL.revokeObjectURL(avatarPreview); // Giải phóng URL cũ
            }
            setAvatar(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSkillChange = (selected: Option[]) => {
        setSelectedSkills(selected);
    };

    const handleCreateCandidate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!level || !selectedSkills?.length || !location || !availability || !avatar || !level) {
            toast.error('Vui lòng nhập đầy đủ thông tin!', { position: "top-right", autoClose: 3000 });
            return;
        }
        setLoading(true);
        const candidateData = new FormData();
        candidateData.append('fullName', name || '');
        candidateData.append('email', emailUser || '');
        candidateData.append('phone', phone);
        candidateData.append('location', location);
        selectedSkills.forEach(skill => {
            candidateData.append('skills[]', skill.value);
        });
        candidateData.append('level', level);
        candidateData.append('salary', salary);
        candidateData.append('jobType', jobType);
        candidateData.append('availability', availability);
        candidateData.append('userId', userId || '');
        if (avatar) {
            candidateData.append('avatar', avatar);
        }
        try {
            const token = localStorage.getItem('access_token');
            await authApi(token).post(endpoints['candidatesAdmin'], candidateData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success('Thêm mới ứng viên thành công!', { position: 'top-right', autoClose: 3000 });
            navigate('/admin/candidates');
        } catch (error: any) {
            toast.error('Thêm mới ứng viên thất bại', { position: 'top-right', autoClose: 3000 });
            console.error(error.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-title-md2 font-semibold text-black dark:text-white">Thêm mới ứng viên</h2>
                <nav>
                    <ol className="flex items-center gap-2">
                        <li>
                            <Link className="font-medium" to="/admin/candidates">
                                Quản lý ứng viên tìm việc /
                            </Link>
                        </li>
                        <li className="font-medium text-primary">Thêm mới ứng viên</li>
                    </ol>
                </nav>
            </div>

            {loading ? (
                <Loader />
            ) : (
                <div className="flex flex-col gap-10">
                    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                        <form onSubmit={handleCreateCandidate}>
                            <div className="p-6.5">
                                {/* Full Name, Email */}
                                <div className="flex space-x-4 mb-4.5">
                                    <div className="flex-1">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                            Tên đầy đủ <span className="text-meta-1">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={name || ''}
                                            readOnly
                                            className="w-full rounded border-[1.5px] border-stroke bg-gray-100 py-3 px-5 text-black outline-none transition disabled:cursor-not-allowed dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                            Email <span className="text-meta-1">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={emailUser || ''}
                                            readOnly
                                            className="w-full rounded border-[1.5px] border-stroke bg-gray-100 py-3 px-5 text-black outline-none transition disabled:cursor-not-allowed dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                        />
                                    </div>
                                </div>

                                {/* Avatar */}
                                <div className="mb-4.5">
                                    <label className="mb-2.5 block text-black dark:text-white">Ảnh đại diện <span className="text-meta-1">*</span></label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    />
                                    {avatarPreview && (
                                        <img
                                            src={avatarPreview}
                                            alt="Avatar Preview"
                                            className="mt-2 h-20 w-20 rounded-full object-cover"
                                        />
                                    )}
                                </div>

                                {/* Phone, Location */}
                                <div className="flex space-x-4 mb-4.5">
                                    <div className="flex-1">
                                        <label className="mb-2.5 block text-black dark:text-white">Số điện thoại</label>
                                        <input
                                            type="text"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="Nhập số điện thoại"
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="mb-2.5 block text-black dark:text-white">Địa điểm <span className="text-meta-1">*</span></label>
                                        <select
                                            value={selectedProvinceId}
                                            onChange={handleProvinceChange}
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                        >
                                            <option value="" disabled>
                                                Chọn tỉnh/thành
                                            </option>
                                            {provinces.map((province) => (
                                                <option key={province.id} value={province.id}>
                                                    {province.full_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Skills */}
                                <div className="mb-4.5">
                                    <label className="mb-2.5 block text-black dark:text-white">
                                        Kỹ năng <span className="text-meta-1">*</span>
                                    </label>
                                    <Select
                                        styles={{ control: (base) => ({ ...base, padding: '0.3rem 1.0rem' }) }}
                                        isMulti
                                        options={skillOptions}
                                        value={selectedSkills}
                                        onChange={handleSkillChange}
                                        placeholder="Chọn kỹ năng liên quan..."
                                        closeMenuOnSelect={false}
                                        className="custom-react-select"
                                        classNamePrefix="react-select"
                                        isDisabled={loading}
                                    />
                                </div>

                                {/* Level, Salary */}
                                <div className="flex space-x-4 mb-4.5">
                                    <div className="flex-1">
                                        <label className="mb-2.5 block text-black dark:text-white">Cấp bậc <span className="text-meta-1">*</span></label>
                                        <select
                                            value={level}
                                            onChange={(e) => setLevel(e.target.value)}
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                        >
                                            <option value="" disabled>
                                                Chọn cấp bậc
                                            </option>
                                            {levelData.map((option) => (
                                                <option key={option.title} value={option.title}>
                                                    {option.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <label className="mb-2.5 block text-black dark:text-white">Mức lương</label>
                                        <select
                                            value={salary}
                                            onChange={(e) => setSalary(e.target.value)}
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                        >
                                            <option value="" disabled>
                                                Chọn mức lương
                                            </option>
                                            {salaryData.map((option) => (
                                                <option key={option.title} value={option.title}>
                                                    {option.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Job Type, Availability */}
                                <div className="flex space-x-4 mb-4.5">
                                    <div className="flex-1">
                                        <label className="mb-2.5 block text-black dark:text-white">Loại công việc</label>
                                        <select
                                            value={jobType}
                                            onChange={(e) => setJobType(e.target.value)}
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                        >
                                            <option value="" disabled>
                                                Chọn loại công việc
                                            </option>
                                            {jobTypeData.map((option) => (
                                                <option key={option.title} value={option.title}>
                                                    {option.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                            Thời gian sẵn sàng <span className="text-meta-1">*</span>
                                        </label>
                                        <select
                                            value={availability}
                                            onChange={(e) => setAvailability(e.target.value)}
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                        >
                                            <option value="" disabled>
                                                Chọn thời gian
                                            </option>
                                            {availabilityData.map((option) => (
                                                <option key={option.title} value={option.title}>
                                                    {option.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                                    disabled={loading}
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

export default CreateCandidate;