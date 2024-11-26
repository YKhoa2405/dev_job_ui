import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { ICvDetail } from '../../types/cv';
import API, { authApi, endpoints } from '../../common/API';
import moment from 'moment';
import "moment/locale/vi";
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import Loader from '../../common/Loader';
import { useParams } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { ICompanyDetail } from '../../types/company';
import { IJobDetail } from '../../types/job';
import Select, { MultiValue } from 'react-select';
import axios from 'axios';
import { azuze_map_primary_key_api } from '../../common/KEY';

interface Option {
    value: string; // name
    label: string; // name
}

const EditJobs = () => {
    moment.locale("vi");
    const [skills, setSkills] = useState<Option[]>([]); // Danh sách kỹ năng cho Select
    const [jobDetail, setJobetail] = useState<IJobDetail | null>();
    const [loading, setLoading] = useState(false);

    const [name, setName] = useState(jobDetail?.name || "")
    const [location, setLocation] = useState(jobDetail?.location || "");
    const navigate = useNavigate();

    const { id } = useParams<{ id?: string }>();

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

    const skillValue = jobDetail?.skills.map((skill) => ({
        value: skill,
        label: skill
    }));

    useEffect(() => {
        fetchJobDetail();
        fetchSkills()
    }, []);

    const fetchSkills = async () => {
        try {
            const res = await API.get(endpoints['skills']);
            const formattedOptions = res.data.data.map((item: any) => ({
                value: item.name,
                label: item.name,
            }));
            setSkills(formattedOptions)
        } catch (error) {
            console.log(error)
        }
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

    const toggleActiveStatus = () => {
        if (jobDetail) {
            setJobetail(prev => prev ? { ...prev, isActive: !prev.isActive } : null);
        }

    };

    const fetchJobDetail = async () => {
        setLoading(true)
        try {
            const token: any = localStorage.getItem("access_token");
            const res = await authApi(token).get(endpoints['jobDetail'](id!));
            setJobetail(res.data.data)

        } catch (error) {
            console.log('Error fetching resume:', error);
        } finally { setLoading(false) }
    }

    const handleUpdateJobs = async (e: { preventDefault: () => void; }) => {
        setLoading(true)
        e.preventDefault(); // Ngăn chặn form reload mặc định
        try {
            const coordinates = jobDetail?.location
                ? await getCoordinatesFromAddress(jobDetail.location)
                : { latitude: jobDetail?.latitude, longitude: jobDetail?.longitude };

            const token: any = localStorage.getItem("access_token");
            await authApi(token).patch(endpoints['jobDetail'](id!), {
                name: jobDetail?.name,
                level: jobDetail?.level,
                quantity: jobDetail?.quantity,
                salary: jobDetail?.salary,
                jobType: jobDetail?.jobType,
                description: jobDetail?.description,
                prioritize: jobDetail?.prioritize,
                requirement: jobDetail?.requirement,
                startDate: jobDetail?.startDate,
                endDate: jobDetail?.endDate,
                location: jobDetail?.location,
                latitude: coordinates?.latitude,
                longitude: coordinates?.longitude,
                isActive: jobDetail?.isActive

            });
            toast.success('Cập nhật thành công!', {
                position: "top-right",
                autoClose: 3000,
            });
            navigate("/admin/jobs");
        } catch (error) {
            console.log('Error updating company:', error);
            toast.error('Cập nhật thất bại!', {
                position: "top-right",
                autoClose: 3000,
            });
        } finally {
            setLoading(false)
        }
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
                    <form onSubmit={handleUpdateJobs} className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                        <div className="p-6.5 ">
                            <div className="mb-4.5 flex items-center">
                                <div className="flex-[4]">
                                    <label className="mb-2.5 block text-black dark:text-white">
                                        Tiêu đề
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Nhập tiêu đề tin tuyển dụng"
                                        value={jobDetail?.name}
                                        onChange={(e) =>
                                            setJobetail((prev) => prev ? { ...prev, name: e.target.value } : null)
                                        }
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    />
                                </div>

                                {/* Cột còn lại chiếm 1/5 */}
                                <div className="flex-[1] pl-4">
                                    <label className="mb-2.5 block text-black dark:text-white">
                                        Trạng thái
                                    </label>
                                    <button
                                        type="button"

                                        onClick={toggleActiveStatus}
                                        className={`w-full rounded py-3 px-5 text-white ${jobDetail?.isActive ? 'bg-green-500' : 'bg-red-500'} hover:bg-opacity-90`}>
                                        {jobDetail?.isActive ? 'Hoạt động' : 'Dừng hoạt động'}
                                    </button>
                                </div>
                            </div>

                            <div className="mb-4.5">
                                <label className="mb-2.5 block text-black dark:text-white">
                                    Địa chỉ làm việc
                                </label>
                                <input
                                    type="text"
                                    placeholder="Nhập tiêu đề tin tuyển dụng"
                                    value={jobDetail?.location}
                                    onChange={async (e) => {
                                        setJobetail((prev) => (prev ? { ...prev, location: e.target.value } : prev));

                                        // Lấy tọa độ mới khi location thay đổi
                                        const coordinates = await getCoordinatesFromAddress(e.target.value);
                                        setJobetail((prev) =>
                                            prev
                                                ? { ...prev, latitude: coordinates?.latitude, longitude: coordinates?.longitude }
                                                : prev
                                        );
                                    }}
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                />
                            </div>

                            {/* Hàng 1 */}
                            <div className="flex space-x-4 mb-4.5">
                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Mức lương</label>
                                    <select
                                        value={jobDetail?.salary}
                                        onChange={(e) =>
                                            setJobetail((prev) => prev ? { ...prev, salary: e.target.value } : null)
                                        }
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
                                        {salaryOptions.map(option => (
                                            <option key={option.value} value={option.label}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Level </label>
                                    <select
                                        value={jobDetail?.level}
                                        onChange={(e) =>
                                            setJobetail((prev) => prev ? { ...prev, level: e.target.value } : null)
                                        }
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
                                        {levelOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Số lượng </label>
                                    <input
                                        type="number"
                                        placeholder="Nhập số lượng"
                                        value={jobDetail?.quantity}
                                        onChange={(e) =>
                                            setJobetail((prev) => prev ? { ...prev, quantity: Number(e.target.value) } : null)
                                        }
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Loại hình </label>
                                    <select
                                        value={jobDetail?.jobType}
                                        onChange={(e) =>
                                            setJobetail((prev) => prev ? { ...prev, jobType: e.target.value } : null)
                                        }
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
                                    <label className="mb-2.5 block text-black dark:text-white">
                                        Kĩ năng
                                    </label>

                                    <Select
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                padding: '0.3rem 1.0rem', // Thay đổi padding tại đây
                                            }),
                                        }}
                                        isMulti
                                        value={skillValue}
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
                                    <div className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
                                        {jobDetail?.companyId.name}
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-4 mb-4.5">
                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">
                                        Ngày bắt đầu
                                    </label>
                                    <input
                                        type="date"
                                        value={
                                            jobDetail?.startDate
                                                ? new Date(jobDetail.startDate).toISOString().split("T")[0]
                                                : ""
                                        }
                                        onChange={(e) =>
                                            setJobetail((prev) => prev ? { ...prev, startDate: new Date(e.target.value) } : null)
                                        }
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    />
                                </div>

                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">
                                        Ngày kết thúc
                                    </label>
                                    <input
                                        type="date"
                                        value={
                                            jobDetail?.endDate
                                                ? new Date(jobDetail.endDate).toISOString().split("T")[0]
                                                : ""
                                        }
                                        onChange={(e) =>
                                            setJobetail((prev) => prev ? { ...prev, endDate: new Date(e.target.value) } : null)
                                        }
                                        placeholder="Nhập địa điểm làm việc"
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="mb-2.5 block text-black dark:text-white">Mô tả</label>

                                <textarea
                                    rows={4}
                                    placeholder="Mô tả công việc ..."
                                    value={jobDetail?.description}
                                    onChange={(e) =>
                                        setJobetail((prev) => prev ? { ...prev, description: e.target.value } : null)
                                    }
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                ></textarea>
                            </div>

                            <div className="mb-6">
                                <label className="mb-2.5 block text-black dark:text-white">Yêu cầu</label>

                                <textarea
                                    rows={4}
                                    placeholder="Yêu cầu công việc dành cho ứng viên ..."
                                    value={jobDetail?.requirement}
                                    onChange={(e) =>
                                        setJobetail((prev) => prev ? { ...prev, requirement: e.target.value } : null)
                                    }
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
                                    value={jobDetail?.prioritize}
                                    onChange={(e) =>
                                        setJobetail((prev) => prev ? { ...prev, prioritize: e.target.value } : null)
                                    }
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                ></textarea>
                            </div>

                            <button type='submit' className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90">
                                Cập nhật
                            </button>
                        </div>
                    </form>

                </div>
            )
            }
        </>
    );
};

export default EditJobs;


