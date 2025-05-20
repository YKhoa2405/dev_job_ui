import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, Text, TextInput, ActivityIndicator, TouchableOpacity } from "react-native";
import StyleShare from "../../assets/themes/StyleShare";
import UIHeader from "../../components/UIHeader";
import { bgButton2, grey, mainColor, orange, white } from "../../assets/themes/Color";
import Button from "../../components/Button"
import API, { authApi, endpoints } from "../../assets/config/API";
import Dropdown from "../../components/Dropdown";
import axios from "axios";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DropDownPicker from 'react-native-dropdown-picker';
import { ToastMess } from "../../components/ToastMess";
import { geminiService } from '../../assets/config/GeminiService';
import { Checkbox } from 'react-native-paper';



export default function JobCreate({ navigation, route }) {
    const { companyId } = route.params
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [selectedDateType, setSelectedDateType] = useState(null);
    const [loading, setLoading] = useState(false)
    const [loadingE, setLoadingE] = useState(false)
    const [loadingR, setLoadingR] = useState(false)


    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [skills, setSkills] = useState([]);
    const [open, setOpen] = useState(false);

    const [selectedProvinceId, setSelectedProvinceId] = useState('');
    const [selectedDistrictId, setSelectedDistrictId] = useState('');
    const [selectedWardId, setSelectedWardId] = useState('');
    const [street, setStreet] = useState('')
    const [location, setLocation] = useState('')

    const [name, setName] = useState('')
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [salary, setSalary] = useState('');
    const [level, setLevel] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [jobType, setJobType] = useState('');
    const [city, setCity] = useState('')
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [requirement, setRequirement] = useState('')
    const [description, setDescription] = useState('')
    const [prioritize, setPrioritize] = useState('')
    const [lon, setLon] = useState(0);
    const [lat, setLat] = useState(0);
    const [isUrgent, setIsUrgent] = useState(false);

    const showDatePicker = (dateType) => {
        setSelectedDateType(dateType);  // Set the type of date (start or end) to be selected
        setDatePickerVisibility(true);  // Show the date picker modal
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);  // Hide the date picker modal
    };

    const handleConfirm = (date) => {
        if (selectedDateType === 'start') {
            setStartDate(date);
            setEndDate(null)
        } else if (selectedDateType === 'end') {
            setEndDate(date);
        }
        hideDatePicker();  // Close the date picker modal
    };
    const salaryData = [
        { title: 'Dưới 5 triệu' },
        { title: '10 - 15 triệu' },
        { title: '15 - 20 triệu' },
        { title: '20 - 25 triệu' },
        { title: '30 - 50 triệu' },
        { title: 'Trên 50 triệu' },
        { title: 'Thỏa thuận' }
    ]

    const levelData = [
        { title: 'Intern' },
        { title: 'Fresher' },
        { title: 'Junior' },
        { title: 'Middle' },
        { title: 'Senior' },
        { title: 'Trưởng nhóm' },
        { title: 'Trưởng phòng' },
        { title: 'Director' },
    ]

    const jobTypeData = [
        { title: 'Office' },
        { title: 'Remote' },
        { title: 'Hybrid' },
    ]


    useEffect(() => {
        fetchSkills()
        fetchProvinces();
    }, [])

    useEffect(() => {
        updateLocationDetail();
    }, [selectedProvinceId, selectedDistrictId, selectedWardId, street]);

    const fetchSkills = async (currentPage = 1, limit = 100) => {
        try {
            const res = await API.get(endpoints['skills'], {
                params: {
                    page: currentPage,
                    limit: limit,
                },
            });
            const formattedSkills = res.data.data.result.map(skill => ({
                label: skill.name, // Tên hiển thị
                value: skill.name,  // Giá trị của kỹ năng
            }));
            setSkills(formattedSkills)
        } catch (error) {
            console.log(error)
        }
    };

    const fetchProvinces = async () => {
        try {
            const res = await axios.get('https://esgoo.net/api-tinhthanh/1/0.htm');
            setProvinces(res.data.data || []);
        } catch (error) {
            console.log('Error fetching provinces:', error);
        }
    };

    const fetchDistricts = async (provinceId) => {
        try {
            const response = await axios.get(`https://esgoo.net/api-tinhthanh/2/${provinceId}.htm`);
            if (response.data.error === 0) {
                setDistricts(response.data.data || []);
                setSelectedDistrictId(''); // Reset district and ward selections
                setWards([]);
            }
        } catch (error) {
            console.log('Error fetching districts:', error);
        }
    };

    const fetchWards = async (districtId) => {
        try {
            const response = await axios.get(`https://esgoo.net/api-tinhthanh/3/${districtId}.htm`);
            if (response.data.error === 0) {
                setWards(response.data.data || []);
            }
        } catch (error) {
            console.log('Error fetching wards:', error);
        }
    };

    const getCoordinatesFromAddress = async (address) => {
        try {
            const response = await axios.get('https://atlas.microsoft.com/search/address/json', {
                params: {
                    'api-version': '1.0',
                    'subscription-key': 'FaqJhLIckgPjz6XjhcxZfxsRukcyNyZhHJzRZ8H3eMlo4sISPeilJQQJ99AIACYeBjF6AxJHAAAgAZMPFtxq',
                    query: address
                }
            });

            const { data } = response;
            if (data && data.results && data.results.length > 0) {
                const location = data.results[0].position;
                return {
                    latitude: location.lat,
                    longitude: location.lon
                };
            }
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
        ]
            .filter(Boolean)
            .join(', ');
        setLocation(detail);
        if (detail) {
            const { latitude, longitude } = await getCoordinatesFromAddress(detail);
            setLon(parseFloat(longitude));
            setLat(parseFloat(latitude));
        }
    };

    const handleCreateJob = async () => {
        // Kiểm tra các trường bắt buộc
        if (!name || !location || !city || !salary || !level || !jobType || !quantity || !selectedSkills || !startDate || !endDate || !description || !prioritize || !requirement) {
            ToastMess({ type: 'error', text1: 'Vui lòng không để trống các trường.' });
            return;
        }
        if (startDate >= endDate) {
            ToastMess({ type: 'error', text1: 'Thời gian không hợp lệ.' });
            return;
        }
        if(!lon || !lat) {
            ToastMess({ type: 'error', text1: 'Vui lòng nhập địa chiề.' });
        }
        const jobData = {
            name,
            companyId,
            startDate: startDate,
            endDate: endDate,
            description,
            requirement,
            prioritize,
            location,
            skills: selectedSkills,
            jobType,
            city,
            salary,
            quantity,
            level,
            geoLocation: {
                type: 'Point',
                coordinates: [Number(lon), Number(lat)],
            },
            isUrgent: isUrgent || false,
        };

        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("access_token");
            const res = await authApi(token).post(endpoints['jobs'], jobData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log(res.data)

            // Chỉ hiển thị thông báo thành công nếu request thành công (status 2xx)
            if (res.status === 201 || res.status === 200) {
                ToastMess({ type: 'success', text1: 'Thêm việc làm thành công.' });
                navigation.goBack();
            }

        } catch (error) {
            // Xử lý lỗi từ backend
            if (error.response) {
                const status = error.response.status;
                const message = error.response.data.message || 'Có lỗi xảy ra.';

                if (status === 403) {
                    ToastMess({ type: 'error', text1: message }); // Hiển thị thông báo từ backend
                }
            } else {
                ToastMess({ type: 'error', text1: 'Thêm việc làm thất bại. Vui lòng thử lại.' });
            }
            console.log('Error:', error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateDescription = async () => {
        setLoadingE(true);
        try {
            if (!name || !level || !jobType) {
                ToastMess({ type: 'error', text1: 'Vui lòng nhập đầy đủ thông tin.' });
                return;
            }

            const salaryInfo = salary ? `Mức lương: ${salary}` : 'Mức lương: Thỏa thuận';

            const prompt = `
            Viết mô tả công việc ngắn gọn cho vị trí ${name} 
            cấp độ ${level}, loại hình ${jobType}.
            ${salaryInfo}.
            Số lượng tuyển dụng: ${quantity} người.
            ${selectedSkills.length > 0 ? `Yêu cầu kỹ năng: ${selectedSkills.join(', ')}.` : ''}
            Mô tả ngắn gọn, sử dụng gạch đầu dòng (-). Bỏ tiêu đề, chỉ liệt kê nội dung.
            Tập trung vào mô tả trách nhiệm, yêu cầu công việc và lợi ích.
          `;

            const response = await geminiService(prompt);
            setDescription(response);
            console.log(response);
        } catch (error) {
            console.error('Lỗi khi tạo mô tả công việc:', error);
        } finally {
            setLoadingE(false);
        }
    };

    const handleGenerateRequirements = async () => {
        setLoadingR(true); // Giả định bạn có state loadingR để quản lý trạng thái tải
        try {
            const prompt = `
                Viết yêu cầu ứng viên ngắn gọn cho vị trí ${name || 'công việc này'} 
                cấp độ ${level}, loại hình ${jobType} tại ${city || 'công ty'}.
                ${selectedSkills.length > 0 ? `Kỹ năng cần có: ${selectedSkills.join(', ')}.` : ''}
                Mô tả ngắn gọn, sử dụng gạch đầu dòng (-). Bỏ tiêu đề, chỉ liệt kê nội dung.
                Tập trung vào các yêu cầu:
                - Trình độ học vấn
                - Kinh nghiệm làm việc
                - Kỹ năng chuyên môn
                - Kỹ năng mềm
                - Các phẩm chất cá nhân phù hợp với vị trí
              `;
            const response = await geminiService(prompt);
            setRequirement(response);
        } catch (error) {
            console.log("Lỗi khi tạo yêu cầu ứng viên:", error.response?.data || error.message);
        } finally {
            setLoadingR(false);
        }
    };
    return (
        <View style={StyleShare.container}>
            <UIHeader leftIcon={"arrow-back"}
                handleLeftIcon={() => { navigation.goBack() }}
                title={'Thêm tin tuyển dụng'} />
            <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
                <View style={styles.containerMain}>
                    <Text style={styles.textInput}>Tiêu đề</Text>
                    <TextInput
                        placeholder="Tiêu đề tin tuyển dụng..."
                        onChangeText={setName}
                        value={name}
                        style={styles.introduceInput}
                    />
                    <View>
                        <Text style={styles.textInput}>Địa điểm làm việc</Text>
                        <Dropdown
                            data={provinces.map(province => ({ title: province.full_name, id: province.id }))}
                            onSelect={(item) => {
                                setSelectedProvinceId(item.id);
                                setSelectedDistrictId('');
                                setSelectedWardId('');
                                fetchDistricts(item.id);
                            }}
                            placeholder="Chọn tỉnh/thành phố"
                            buttonStyle={{
                                marginTop: 10,
                                width: '100%',
                                height: 50,
                            }}
                        />

                        <Dropdown
                            data={districts.map(district => ({ title: district.full_name, id: district.id }))}
                            onSelect={(item) => {
                                setSelectedDistrictId(item.id);
                                setSelectedWardId('');
                                fetchWards(item.id);
                            }}
                            placeholder="Chọn quận/huyện"
                            disabled={!selectedProvinceId}
                            buttonStyle={{
                                marginTop: 10,
                                width: '100%',
                                height: 50,
                            }}
                        />

                        <Dropdown
                            data={wards.map(ward => ({ title: ward.full_name, id: ward.id }))}
                            onSelect={(item) => {
                                setSelectedWardId(item.id);
                            }}
                            placeholder="Chọn phường/xã"
                            disabled={!selectedDistrictId}
                            buttonStyle={{
                                marginTop: 10,
                                width: '100%',
                                height: 50,
                            }}
                        />
                        <TextInput
                            style={[styles.introduceInput, { marginTop: 10 }]}
                            placeholder="Tên đường, số công ty, vị trí cụ thể ..."
                            onChangeText={setStreet}
                            multiline={true} />
                    </View>

                    <View style={StyleShare.flexBetween}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.textInput}>Mức lương</Text>
                            <Dropdown
                                data={salaryData}
                                onSelect={(item) => {
                                    setSalary(item.title)
                                }}
                                placeholder="Chọn mức lương"
                                buttonStyle={{
                                    height: 50,
                                }}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 20 }}>
                            <Text style={styles.textInput}>Level</Text>
                            <Dropdown
                                data={levelData}
                                onSelect={(item) => {
                                    setLevel(item.title)
                                }}
                                placeholder="Chọn level"
                                buttonStyle={{
                                    height: 50,
                                }}
                            />
                        </View>
                    </View>

                    <View style={StyleShare.flexBetween}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.textInput}>Loại hình</Text>
                            <Dropdown
                                data={jobTypeData}
                                onSelect={(item) => {
                                    setJobType(item.title)
                                }}
                                placeholder="Chọn loại hình"
                                buttonStyle={{
                                    height: 50,
                                }}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 20 }}>
                            <Text style={styles.textInput}>Số lượng tuyển</Text>
                            <TextInput
                                style={styles.introduceInput}
                                placeholder="Số lượng tuyển..."
                                keyboardType="numeric"
                                maxLength={5}
                                onChangeText={(text) => {
                                    // Chỉ cho phép nhập các ký tự số
                                    const numericValue = text.replace(/[^0-9]/g, '');
                                    setQuantity(numericValue ? parseInt(numericValue) : 0);
                                }}
                                value={quantity ? String(quantity) : ''}
                                multiline={false}
                            />

                        </View>
                    </View>
                    <View>
                        <Text style={styles.textInput}>Kĩ năng</Text>
                        <DropDownPicker
                            open={open} // Trạng thái mở/đóng
                            value={selectedSkills} // Giá trị được chọn
                            items={skills} // Dữ liệu hiển thị
                            setOpen={setOpen} // Hàm thay đổi trạng thái mở/đóng
                            setValue={setSelectedSkills} // Hàm thay đổi giá trị được chọn
                            setItems={setSkills} // Hàm cập nhật dữ liệu nguồn
                            multiple={true} // Cho phép chọn nhiều giá trị
                            min={0} // Số lượng chọn tối thiểu
                            max={10} // Số lượng chọn tối đa
                            placeholder="Chọn kỹ năng" // Placeholder khi chưa chọn
                            searchable={false} // Bật tìm kiếm
                            mode="BADGE" // Hiển thị các mục đã chọn dưới dạng badge
                            badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a"]} // Màu badge
                            listMode={"SCROLLVIEW"}
                            style={{
                                borderWidth: 0,
                                borderColor: white,
                                borderRadius: 10,
                            }}
                            dropDownContainerStyle={{
                                backgroundColor: white, // Màu nền
                                borderWidth: 1,             // Độ dày đường viền
                                borderColor: grey,        // Màu đường viền
                                borderRadius: 10,            // Bo góc
                                maxHeight: 200,             // Giới hạn chiều cao
                            }}
                            textStyle={{
                                fontWeight: '500'
                            }}
                        />
                    </View>
                    <View style={StyleShare.flexBetween}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.textInput}>Ngày bắt đầu</Text>
                            <TouchableOpacity
                                style={styles.introduceInput}
                                onPress={() => showDatePicker('start')}
                            >
                                <Text style={{ fontWeight: '500' }}>
                                    {startDate ? startDate.toLocaleDateString() : 'Chọn ngày bắt đầu'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* End Date */}
                        <View style={{ flex: 1, marginLeft: 20 }}>
                            <Text style={styles.textInput}>Ngày kết thúc</Text>
                            <TouchableOpacity
                                style={styles.introduceInput}
                                onPress={() => showDatePicker('end')}
                            >
                                <Text style={{ fontWeight: '500' }}>
                                    {endDate ? endDate.toLocaleDateString() : 'Chọn ngày kết thúc'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <DateTimePickerModal
                            isVisible={isDatePickerVisible}
                            mode="date"
                            onConfirm={handleConfirm}
                            onCancel={hideDatePicker}
                        />
                    </View>

                    <View style={[StyleShare.flexBetween, { marginTop: 20, marginBottom: 10 }]}>
                        <Text style={{ color: mainColor, fontWeight: 'bold' }}>Mô tả</Text>
                        {loadingE ? (
                            <Text style={{ color: 'grey', fontWeight: 'bold' }}>Đang tải...</Text>
                        ) : (
                            <TouchableOpacity onPress={() => handleGenerateDescription()}>
                                <Text style={{ color: 'grey', fontWeight: 'bold' }}>Gợi ý với AI</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <TextInput
                        style={styles.introduceInput}
                        placeholder="Mô tả về công việc ..."
                        onChangeText={setDescription}
                        multiline={true}
                        numberOfLines={10}
                        value={description}
                        textAlignVertical="top"
                    />
                    <View style={[StyleShare.flexBetween, { marginTop: 20, marginBottom: 10 }]}>
                        <Text style={{ color: mainColor, fontWeight: 'bold' }}>Yêu cầu ứng viên</Text>
                        {loadingR ? (
                            <Text style={{ color: 'grey', fontWeight: 'bold' }}>Đang tải...</Text>
                        ) : (
                            <TouchableOpacity onPress={() => handleGenerateRequirements()}>
                                <Text style={{ color: 'grey', fontWeight: 'bold' }}>Gợi ý với AI</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <TextInput
                        style={styles.introduceInput}
                        placeholder="Yêu cầu công việc dành cho ứng viên ..."
                        onChangeText={setRequirement}
                        multiline={true}
                        numberOfLines={15}
                        textAlignVertical="top"
                        value={requirement}
                    />
                    <Text style={styles.textInput}>Ưu tiên</Text>
                    <TextInput
                        style={styles.introduceInput}
                        placeholder="Ưu tiên tuyển dụng ..."
                        onChangeText={setPrioritize}
                        multiline={true}
                        numberOfLines={15}
                        textAlignVertical="top"
                    />
                    <View style={[StyleShare.flexBetween, { marginTop: 10 }]}>

                        <Text style={{ fontWeight: 'bold', color: mainColor }}>Đánh dấu tin tuyển dụng "Gấp"</Text>
                        <Checkbox
                            status={isUrgent ? "checked" : "unchecked"}
                            onPress={() => setIsUrgent(!isUrgent)}
                            color={mainColor}
                        />
                    </View>
                    <View style={{ marginTop: 20 }}></View>
                    {loading ? (
                        <ActivityIndicator color={orange} size={'large'} />
                    ) : (
                        <Button title={'Đăng'} backgroundColor={mainColor} textColor={white} onPress={() => handleCreateJob()} />
                    )}
                </View>
            </ScrollView>


        </View>
    )
}

const styles = StyleSheet.create({
    containerMain: {
        paddingHorizontal: 20
    },
    textInput: {
        fontWeight: 'bold',
        color: mainColor,
        marginTop: 20,
        marginBottom: 10
    },

    introduceInput: {
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 15,
        backgroundColor: white
    },
})