import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import API, { authApi, endpoints } from '../../common/API';
import { toast } from 'react-toastify';



const CreateService = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState<number>()
    const [durationDays, setDurationDays] = useState<number>()


    const handleCreateService = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        if (
            !name || !description || !price || !durationDays
        ) {
            toast.error('Vui lòng nhập đầy đủ thông tin!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: false,
                progress: undefined,
            });
            return;
        }
        const serviceData = {
            name, price, description, durationDays, isActive: true
        }
        try {
            const token: any = localStorage.getItem("access_token");
            await authApi(token).post(endpoints['services'], serviceData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            toast.success('Thêm mới thành công!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: false,
                progress: undefined,
            });
            navigate('/admin/services');
        } catch (error) {
            toast.error('Thêm mới thất bại!', {
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
                    Thêm mới dịch vụ
                </h2>
                <nav>
                    <ol className="flex items-center gap-2">
                        <li>
                            <Link className="font-medium" to="/admin/services">
                                Quản lý dịch vụ /
                            </Link>
                        </li>
                        <li className="font-medium text-primary">Thêm mới dịch vụ</li>
                    </ol>
                </nav>
            </div>

            <div className="flex flex-col gap-10">
                <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    <form onSubmit={handleCreateService}>
                        <div className="p-6.5">
                            <div className="mb-4.5">
                                <label className="mb-2.5 block text-black dark:text-white">Tên dịch vụ <span className="text-meta-1">*</span></label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Nhập tiêu đề dịch vụ"
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                />
                            </div>
                            <div className="flex space-x-4 mb-4.5">
                                {/* Giá dịch vụ */}
                                <div className="flex-[2]">
                                    <label className="mb-2.5 block text-black dark:text-white">
                                        Giá dịch vụ <span className="text-meta-1">*</span>
                                    </label>
                                    <input
                                        type="number" // Chỉ nhận số
                                        min="0" // Ngăn giá trị âm
                                        value={price}
                                        onChange={(e) => setPrice(Number(e.target.value))}
                                        placeholder="Nhập số tiền (VND) ..."
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    />
                                </div>

                                {/* Thời hạn hiệu lực */}
                                <div className="flex-[2]">
                                    <label className="mb-2.5 block text-black dark:text-white">
                                        Thời hạn hiệu lực <span className="text-meta-1">*</span>
                                    </label>
                                    <input
                                        type="number" // Chỉ nhận số
                                        min="0" // Ngăn giá trị âm
                                        value={durationDays}
                                        onChange={(e) => setDurationDays(Number(e.target.value))}
                                        placeholder="Nhập thời hạn hiệu lực (ngày) ..."
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="mb-2.5 block text-black dark:text-white">Mô tả <span className="text-meta-1">*</span></label>
                                <textarea
                                    rows={6}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Mô tả về chức năng của dịch vụ"
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                ></textarea>
                            </div>

                            <button type="submit" className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90">
                                Thêm mới
                            </button>
                            {/* {loading ? (
                                <div className="flex justify-center items-center p-3">
                                    <Loader/>
                                </div>
                            ) : (
                            )} */}
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default CreateService;
