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

// Định nghĩa type cho SkillOption
type SkillOption = {
    value: string;
    label: string;
};

const EditJobs = () => {
    moment.locale('vi');
    const [skills, setSkills] = useState<SkillOption[]>([]); // Danh sách kỹ năng cho Select
    const [skillValue, setSkillValue] = useState<MultiValue<SkillOption>>([]); // Giá trị đã chọn
    const [jobDetail, setJobDetail] = useState<IJobDetail | null>(null); // Sửa typo setJobetail
    const [loading, setLoading] = useState(false);

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
        fetchJobDetail();
        fetchSkills();
    }, [id]); // Thêm id vào dependency để fetch lại khi id thay đổi

    // Đồng bộ skillValue khi jobDetail thay đổi
    useEffect(() => {
        if (jobDetail?.skills) {
            const initialSkills = jobDetail.skills.map((skill) => ({
                value: skill,
                label: skill,
            }));
            setSkillValue(initialSkills);
        }
    }, [jobDetail]);

    const handleSkillChange = (selectedOptions: MultiValue<SkillOption>) => {
        setSkillValue(selectedOptions);
    };

    const fetchSkills = async () => {
        try {
            const res = await API.get(endpoints['skills'], {
                params: {
                    page: 1,
                    limit: 100,
                }
            });
            const formattedOptions = res?.data.data.result.map((item: any) => ({
                value: item.name,
                label: item.name,
            }));
            setSkills(formattedOptions);
        } catch (error) {
            console.log('Lỗi khi lấy danh sách kỹ năng:', error);
            toast.error('Không thể tải danh sách kỹ năng!');
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
            const { data } = response;
            const location = data.results[0].position;
            return {
                latitude: location.lat,
                longitude: location.lon,
            };
        } catch (error) {
            console.log('Lỗi khi lấy tọa độ:', error);
            return null;
        }
    };

    const toggleActiveStatus = () => {
        if (jobDetail) {
            setJobDetail((prev) => (prev ? { ...prev, isActive: !prev.isActive } : null));
        }
    };

    const fetchJobDetail = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const res = await authApi(token).get(endpoints['jobDetail'](id!));
            setJobDetail(res.data.data);
            console.log(res.data.data);
        } catch (error) {
            console.log('Error fetching job detail:', error);
            toast.error('Không thể tải chi tiết công việc!');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateJobs = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
            const coordinates = jobDetail?.location
                ? await getCoordinatesFromAddress(jobDetail.location)
                : { latitude: jobDetail?.latitude, longitude: jobDetail?.longitude };

            const token = localStorage.getItem('access_token');
            await authApi(token).patch(endpoints['jobDetail'](id!), {
                name: jobDetail?.name,
                level: jobDetail?.level,
                quantity: jobDetail?.quantity,
                salary: jobDetail?.salary,
                jobType: jobDetail?.jobType,
                description: jobDetail?.description,
                skills: skillValue.map((skill) => skill.value), // Lấy mảng các value từ skillValue
                prioritize: jobDetail?.prioritize,
                requirement: jobDetail?.requirement,
                startDate: jobDetail?.startDate,
                endDate: jobDetail?.endDate,
                location: jobDetail?.location,
                latitude: coordinates?.latitude ?? jobDetail?.latitude,
                longitude: coordinates?.longitude ?? jobDetail?.longitude,
                isActive: jobDetail?.isActive,
                isUrgent: jobDetail?.isUrgent,
            });

            toast.success('Cập nhật thành công!', {
                position: 'top-right',
                autoClose: 3000,
            });
            // navigate('/admin/jobs');
        } catch (error) {
            console.log('Error updating job:', error);
            toast.error('Cập nhật thất bại!', {
                position: 'top-right',
                autoClose: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/admin/jobs');
    };

    return (
        <>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-title-md2 font-semibold text-black dark:text-white">
                    Chi tiết tin tuyển dụng
                </h2>
                <nav>
                    <ol className="flex items-center gap-2">
                        <li>
                            <Link className="font-medium" to="/admin/jobs">
                                Quản lý tin tuyển dụng /
                            </Link>
                        </li>
                        <li className="font-medium text-primary">Chi tiết tin tuyển dụng</li>
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
                                        className={`w-full rounded py-3 px-5 text-white ${jobDetail?.isActive ? 'bg-green-500' : 'bg-red-500'
                                            } hover:bg-opacity-90`}
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
                                                    latitude: coordinates?.latitude ?? prev.latitude,
                                                    longitude: coordinates?.longitude ?? prev.longitude,
                                                }
                                                : null
                                        );
                                    }}
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                />
                            </div>

                            <div className="flex space-x-4 mb-4.5">
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
                                    <select
                                        value={jobDetail?.level || ''}
                                        onChange={(e) =>
                                            setJobDetail((prev) => (prev ? { ...prev, level: e.target.value } : null))
                                        }
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    >
                                        {levelOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

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
                                    <Select<SkillOption, true>
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
                                        placeholder="Chọn Kĩ năng liên quan..."
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
                                        {moment(jobDetail?.createdAt).format("ddd, DD/MM/YYYY, HH:mm")}
                                    </div>
                                </div>
                            </div>
                            <div className="flex space-x-4 mb-4.5">
                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Ngày cập nhật</label>
                                    <div className="w-full py-3 px-5 text-black dark:text-white bg-gray-100 border-[1.5px] border-stroke rounded dark:border-form-strokedark">
                                        {moment(jobDetail?.updatedAt).format("ddd, DD/MM/YYYY, HH:mm")}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </form>
                </div>
            )}
        </>
    );
};

export default EditJobs;