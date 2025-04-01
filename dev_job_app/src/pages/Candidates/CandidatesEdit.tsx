import { useEffect, useState } from 'react';
import API, { authApi, endpoints } from '../../common/API';
import moment from 'moment';
import "moment/locale/vi";
import { Link, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import Loader from '../../common/Loader';
import { ICandidate } from '../../types/candidates';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select, { MultiValue } from 'react-select';

interface Province {
    id: string;
    full_name: string;
}

interface Option {
    value: string;
    label: string;
}

const CandidatesEdit = () => {
    moment.locale("vi");
    const [candidatesDetail, setCandidatesDetail] = useState<ICandidate | null>(null);
    const [formData, setFormData] = useState<ICandidate | null>(null);
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [skills, setSkills] = useState<Option[]>([]);
    const [loading, setLoading] = useState(false);
    const { id } = useParams<{ id?: string }>();
    const navigate = useNavigate();

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

    const availabilityOptions = [
        { value: '', label: 'Chọn trạng thái' },
        { value: 'Ngay lập tức', label: 'Ngay lập tức' },
        { value: '1 tuần', label: '1 tuần' },
        { value: '2 tuần', label: '2 tuần' },
        { value: '1 tháng', label: '1 tháng' },
    ];

    useEffect(() => {
        fetchCandidatesDetail();
        fetchProvinces();
        fetchSkills();
    }, [id]);

    const fetchProvinces = async () => {
        try {
            const res = await axios.get('https://esgoo.net/api-tinhthanh/1/0.htm');
            setProvinces(res.data.data || []);
        } catch (error) {
            console.error('Error fetching provinces:', error);
            toast.error('Không thể tải danh sách tỉnh thành', {
                position: "top-right",
                autoClose: 3000,
            });
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
            toast.error('Không thể tải danh sách kỹ năng', {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    const fetchCandidatesDetail = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("access_token");
            if (!token) throw new Error("No access token found");
            const res = await authApi(token).get(endpoints['candidatesDetail'](id!));
            setCandidatesDetail(res.data.data);
            setFormData(res.data.data);
            console.log(res.data.data);
        } catch (error) {
            console.error('Error fetching candidate detail:', error);
            toast.error('Không thể tải thông tin ứng viên', {
                position: "top-right",
                autoClose: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleSkillChange = (selectedOptions: MultiValue<Option>) => {
        const selectedSkills = selectedOptions.map(option => option.value);
        setFormData(prev => prev ? { ...prev, skills: selectedSkills } : null);
    };

    const validateForm = () => {
        if (!formData?.fullName) return "Họ và tên không được để trống";
        if (!formData?.email || !/\S+@\S+\.\S+/.test(formData.email)) return "Email không hợp lệ";
        if (!formData?.phone || !/^\d{10,11}$/.test(formData.phone)) return "Số điện thoại phải có 10-11 chữ số";
        if (!formData?.location) return "Vui lòng chọn thành phố";
        if (!formData?.salary) return "Vui lòng chọn mức lương";
        if (!formData?.level) return "Vui lòng chọn level";
        if (!formData?.availability) return "Vui lòng chọn trạng thái tìm việc";
        if (!formData?.skills || formData.skills.length === 0) return "Vui lòng chọn ít nhất một kỹ năng";
        return null;
    };

    const handleSave = async () => {
        const validationError = validateForm();
        if (validationError) {
            toast.error(validationError, {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("access_token");
            if (!token) throw new Error("No access token found");
            const res = await authApi(token).patch(endpoints['candidatesDetail'](id!), formData);
            setCandidatesDetail(res.data.data);
            toast.success('Cập nhật ứng viên thành công!', {
                position: "top-right",
                autoClose: 3000,
            });
            // navigate('/admin/candidates');
        } catch (error) {
            console.error('Error updating candidate:', error);
            toast.error('Cập nhật ứng viên thất bại', {
                position: "top-right",
                autoClose: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/admin/candidates');
    };

    const selectedSkills = skills.filter(skill => formData?.skills?.includes(skill.value));

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
                                    onChange={handleInputChange}
                                    className="w-full py-3 px-5 border-[1.5px] border-stroke rounded dark:border-form-strokedark"
                                    disabled={loading}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="mb-2.5 block text-black dark:text-white">Email</label>
                                <input
                                    name="email"
                                    value={formData?.email || ''}
                                    onChange={handleInputChange}
                                    className="w-full py-3 px-5 border-[1.5px] border-stroke rounded dark:border-form-strokedark"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="flex space-x-4 mb-4.5">
                            <div className="flex-1">
                                <label className="mb-2.5 block text-black dark:text-white">Số điện thoại</label>
                                <input
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
                                    <option value="" disabled>Chọn tỉnh thành</option>
                                    {provinces.map((province) => (
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
                                    {availabilityOptions.map((option) => (
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
                                    {salaryOptions.map((option) => (
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
                                    {levelOptions.map((option) => (
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
                                        control: (base) => ({
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
                                <img
                                    src={formData?.avatar || "https://placehold.co/600x400"}
                                    alt="Avatar"
                                    className="h-15.5 w-20 rounded-md"
                                />
                                <input
                                    type="text"
                                    name="avatar"
                                    value={formData?.avatar || ''}
                                    onChange={handleInputChange}
                                    className="mt-2 w-full py-1 px-2 border-[1.5px] border-stroke rounded dark:border-form-strokedark"
                                    placeholder="URL ảnh mới"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="flex space-x-4 mb-4.5">
                            <div className="flex-1">
                                <label className="mb-2.5 block text-black dark:text-white">Ngày tạo</label>
                                <div className="w-full py-3 px-5 text-black dark:text-white bg-gray-100 border-[1.5px] border-stroke rounded dark:border-form-strokedark">
                                    {moment(candidatesDetail?.createdAt).format("ddd, DD/MM/YYYY, HH:mm")}
                                </div>
                            </div>
                        </div>
                        <div className="flex space-x-4 mb-4.5">
                            <div className="flex-1">
                                <label className="mb-2.5 block text-black dark:text-white">Ngày cập nhật</label>
                                <div className="w-full py-3 px-5 text-black dark:text-white bg-gray-100 border-[1.5px] border-stroke rounded dark:border-form-strokedark">
                                    {moment(candidatesDetail?.updatedAt).format("ddd, DD/MM/YYYY, HH:mm")}
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