import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { ICvDetail } from '../../types/cv';
import { authApi, endpoints } from '../../common/API';
import moment from 'moment';
import "moment/locale/vi";
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import Loader from '../../common/Loader';
import { useParams } from 'react-router-dom';
import { Navigate } from 'react-router-dom';


const EditResumes = () => {
    moment.locale("vi");
    const [resumeDetail, setResumeDetail] = useState<ICvDetail | null>(null);
    const [status, setStatus] = useState(resumeDetail?.status || "");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const { id } = useParams<{ id?: string }>();

    const statusOptions = [
        { value: 'pending', label: 'Chờ xử lý' },
        { value: 'reviewed', label: 'Đã xem' },
        { value: 'accepted', label: 'Chấp nhận' },
        { value: 'rejected', label: 'Từ chối' },
    ];

    useEffect(() => {
        fetchResumeDetail();
    }, []);

    const fetchResumeDetail = async () => {
        setLoading(true)
        try {
            const token: any = localStorage.getItem("access_token");
            const res = await authApi(token).get(endpoints['resumeDetail'](id!));
            setResumeDetail(res.data.data)
        } catch (error) {
            console.log('Error fetching resume:', error);
        } finally { setLoading(false) }
    }

    const handleUpdateResume = async (e: { preventDefault: () => void; }) => {
        console.log(status)
        e.preventDefault(); // Ngăn chặn form reload mặc định
        try {
            const token: any = localStorage.getItem("access_token");
            await authApi(token).patch(endpoints['resumeDetail'](id!), {
                status: status,
            });
            toast.success('Cập nhật thành công!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: false,
                progress: undefined,
            });
            navigate("/admin/resumes");
        } catch (error) {
            console.log('Error fetching resume:', error);
            toast.error('Cập nhật thất bại!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: false,
                progress: undefined,
            });
        }
    }



    return (
        <>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-title-md2 font-semibold text-black dark:text-white">
                    Chi tiết CV
                </h2>
                <nav>
                    <ol className="flex items-center gap-2">
                        <li>
                            <Link className="font-medium" to="/admin/resumes">
                                Quản lý CV /
                            </Link>
                        </li>
                        <li className="font-medium text-primary">Chi tiết CV</li>
                    </ol>
                </nav>
            </div>

            {loading ? (
                <Loader />

            ) : (
                <div className="flex flex-col gap-10">
                    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                        <div className="p-6.5">
                            <div className="flex space-x-4 mb-4.5">
                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Email <span className="text-meta-1">*</span></label>
                                    <div className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white">
                                        {resumeDetail?.email}
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Họ và tên <span className="text-meta-1">*</span></label>
                                    <div className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white">
                                        {resumeDetail?.name}
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Số điện thoại <span className="text-meta-1">*</span></label>
                                    <div className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black ">
                                        {resumeDetail?.phone}
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-4 mb-4.5">
                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Tiêu đề việc làm <span className="text-meta-1">*</span></label>
                                    <div className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white">
                                        {resumeDetail?.jobId.name}
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Tên công ty <span className="text-meta-1">*</span></label>
                                    <div className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white">
                                        {resumeDetail?.companyId.name}
                                    </div>
                                </div>
                            </div>

                            {/* Hàng 1 */}
                            <div className="flex space-x-4 mb-4.5">
                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">CV <span className="text-meta-1">*</span></label>
                                    <button
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent bg-gray-200 py-3 px-5 text-black "
                                        onClick={() => window.open(resumeDetail?.cv, '_blank')}
                                    >
                                        Xem CV
                                    </button>

                                </div>
                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Ngày tạo <span className="text-meta-1">*</span></label>
                                    <div className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white">
                                        {moment(resumeDetail?.createdAt).format("ddd, DD/MM/YYYY, HH:mm")}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <label className="mb-2.5 block text-black dark:text-white">Trạng thái </label>
                                    <select
                                        value={status || resumeDetail?.status} // Nếu status chưa được chọn, lấy giá trị từ resumeDetail.status
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    >
                                        <option value="" disabled hidden>Chọn trạng thái</option>
                                        {statusOptions.map(option => (
                                            <option key={option.value} value={option.label}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>

                                </div>
                            </div>

                            <button
                                onClick={handleUpdateResume}
                                className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                            >
                                Cập nhật
                            </button>
                        </div>
                        <form >
                        </form>
                    </div>
                </div>
            )
            }
        </>
    );
};

export default EditResumes;


