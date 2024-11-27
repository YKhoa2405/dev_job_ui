import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, Text, TextInput, ActivityIndicator, TouchableOpacity } from "react-native";
import { Picker } from '@react-native-picker/picker';
import styleShare from "../../assets/theme/style";
import UIHeader from "../../components/UIHeader";
import { bgButton1, orange, white } from "../../assets/theme/color";
import ButtonMain from "../../components/ButtonMain";
import InputMain from "../../components/InputMain";
import ReusableModal from "../../components/ReusableModal ";
import Icon from "react-native-vector-icons/Ionicons"
import API, { authApi, endpoints } from "../../config/API";
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ToastMess } from "../../components/ToastMess";
import axios from "axios";
import { azuze_map_primary_key_api } from "../../config/Key";
import ReusableModalId from "../../components/ReusableModelId";

export default function AddPost({ navigation }) {
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvinceId, setSelectedProvinceId] = useState('');
    const [selectedDistrictId, setSelectedDistrictId] = useState('');
    const [selectedWardId, setSelectedWardId] = useState('');
    const [street, setStreet] = useState('');
    const [locationDetail, setLocationDetail] = useState('');
    const [location, setLocation] = useState()
    const [lon, setLon] = useState(0)
    const [lat, setLat] = useState(0)

    const [modalVisible, setModalVisible] = useState({
        salary: false,
        technology: false,
        experience: false,
    });
    const [title, setTitle] = useState('')
    const [selectedSalary, setSelectedSalary] = useState(null)
    const [selectExperience, setSelectExperience] = useState('')
    const [selectedTechnologies, setSelectedTechnologies] = useState([]);
    const [description, setDescription] = useState('')
    const [expirationDate, setExpirationDate] = useState(new Date());
    const [requirements, setRequirements] = useState('')
    const [quantity, setQuantity] = useState(null)


    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(false);

    const [technologies, setTechnologies] = useState([]);
    const salaries = ['Dưới 5 triệu', '10 - 15  triệu', '15 - 20 triệu', '20 - 25 triệu', '25 - 30 triệu', '30 - 50 triệu', 'Trên 50 triệu', 'Thỏa thuận'];
    const experiences = ['Không yêu cầu', 'Thực tập sinh', 'Dưới 1 năm', '1 năm', '2 năm', '3 năm', '4 năm', '5 năm', 'Trên 5 năm'];

    useEffect(() => {
        fetchTechnology();
        fetchProvinces();
    }, []);
    useEffect(() => {
        updateLocationDetail();
    }, [selectedProvinceId, selectedDistrictId, selectedWardId, street]);

    const fetchProvinces = async () => {
        try {
            const res = await axios.get('https://esgoo.net/api-tinhthanh/1/0.htm');
            setProvinces(res.data.data || []);
        } catch (error) {
            console.log('Error fetching provinces:', error);
        }
    };

    const getCoordinatesFromAddress = async (address) => {
        try {
            const response = await axios.get('https://atlas.microsoft.com/search/address/json', {
                params: {
                    'api-version': '1.0',
                    'subscription-key': azuze_map_primary_key_api,
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
            } else {

            }

        } catch (error) {
            console.log(error);
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

    const updateLocationDetail = async () => {
        const province = provinces.find(p => p.id === selectedProvinceId)?.full_name || '';
        const district = districts.find(d => d.id === selectedDistrictId)?.full_name || '';
        const ward = wards.find(w => w.id === selectedWardId)?.full_name || '';

        setLocation(province)

        const detail = [
            street,
            ward,
            district,
            province
        ]
            .filter(Boolean) // Remove empty or undefined values
            .join(', ');
        setLocationDetail(detail);
        if (detail) {
            try {
                const { latitude, longitude } = await getCoordinatesFromAddress(detail);
                setLon(parseFloat(longitude));
                setLat(parseFloat(latitude));
            } catch (error) {
                console.log(error)
            }
        } else {
            console.log('Detail is null or empty');
        }
    };

    const fetchTechnology = async () => {
        try {
            const res = await API.get(endpoints['technology']);
            setTechnologies(res.data);
        } catch (error) {
            console.log("Error fetching technology data", error);
        }
    }

    const handleSalarySelect = (salary) => {
        setSelectedSalary(salary);
        setModalVisible({ ...modalVisible, salary: false });
    };

    const handleExperienceSelect = (experience) => {
        setSelectExperience(experience);
        setModalVisible({ ...modalVisible, experience: false });
    };


    const handleTechnologySelect = (id) => {
        setSelectedTechnologies(prevTechnologies =>
            prevTechnologies.includes(id)
                ? prevTechnologies.filter(item => item !== id) // Bỏ chọn
                : [...prevTechnologies, id] // Thêm ID vào danh sách chọn
        );
    };

    const onChange = (event, selectedDate) => {
        if (selectedDate) {
            setExpirationDate(selectedDate); // Cập nhật ngày đã chọn
        }
        setShowDatePicker(false); // Ẩn picker sau khi chọn
    };

    const handlePostJob = async () => {
        if (!title || !selectedProvinceId || !selectedSalary || !selectExperience || !selectedTechnologies.length || !description || !expirationDate) {
            ToastMess({ type: 'error', text1: 'Vui lòng không để trống các trường.' });
            return;
        }

        setLoading(true);

        const jobData = {
            title,
            location: location,
            location_detail: locationDetail,
            salary: selectedSalary,
            experience: selectExperience,
            description,
            requirements,
            expiration_date: expirationDate,
            technologies: selectedTechnologies,
            quantity,
            latitude: lat,
            longitude: lon,
        };

        try {
            const token = await AsyncStorage.getItem("access-token");
            await authApi(token).post(endpoints['jobs'], jobData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            ToastMess({ type: 'success', text1: 'Đăng tin tuyển dụng thành công.' });
            navigation.goBack()

        } catch (error) {
            ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại.' });
            console.log(error)
        } finally {
            setLoading(false);
        }
    };


    return (
        <View style={styleShare.container}>
            <UIHeader leftIcon={"arrow-back"}
                handleLeftIcon={() => { navigation.goBack() }}
                title={'Đăng tin tuyển dụng'} />
            {loading ? (
                <ActivityIndicator style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} size="large" color='orange' />
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.containerMain}>
                        <Text style={styles.textInput}>Tiêu đề</Text>
                        <TextInput
                            placeholder="Tiêu đề tin tuyển dụng"
                            onChangeText={setTitle}
                            style={styles.introduceInput}
                        />
                        <View>
                            <Text style={styles.textInput}>Địa điểm làm việc</Text>

                            <Picker
                                selectedValue={selectedProvinceId}
                                onValueChange={(itemValue) => {
                                    setSelectedProvinceId(itemValue);
                                    fetchDistricts(itemValue);
                                }}
                                style={styles.inputSelect}
                            >
                                <Picker.Item label="Chọn tỉnh/thành" value="" />
                                {provinces.map((province) => (
                                    <Picker.Item key={province.id} label={province.full_name} value={province.id} />
                                ))}
                            </Picker>
                            <Picker
                                selectedValue={selectedDistrictId}
                                onValueChange={(itemValue) => {
                                    setSelectedDistrictId(itemValue);
                                    fetchWards(itemValue);
                                }}
                                style={styles.inputSelect}
                                enabled={!!selectedProvinceId}
                            >
                                <Picker.Item label="Chọn quận/huyện" value="" />
                                {districts.map((district) => (
                                    <Picker.Item key={district.id} label={district.full_name} value={district.id} />
                                ))}
                            </Picker>
                            <Picker
                                selectedValue={selectedWardId}
                                onValueChange={setSelectedWardId}
                                style={styles.inputSelect}
                                enabled={!!selectedDistrictId}
                            >
                                <Picker.Item label="Chọn phường/xã" value="" />
                                {wards.map((ward) => (
                                    <Picker.Item key={ward.id} label={ward.full_name} value={ward.id} />
                                ))}
                            </Picker>
                            <View style={styleShare.flexCenter}>

                            </View>
                        </View>
                        <TextInput
                            style={styles.inputSelect}
                            placeholder="Tên đường, số công ty, vị trí cụ thể ..."
                            onChangeText={setStreet}
                            multiline={true} />


                        <View style={styleShare.flexBetween}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.textInput}>Mức lương</Text>
                                <TouchableOpacity onPress={() => setModalVisible({ ...modalVisible, salary: true })} >
                                    <View style={styles.inputSelect}>
                                        <Text>{selectedSalary ? selectedSalary : "Chọn mức lương"}</Text>
                                        <Icon name="chevron-down" size={22} color="orange" />
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <Text style={styles.textInput}>Kinh nghiệm</Text>
                                <TouchableOpacity onPress={() => setModalVisible({ ...modalVisible, experience: true })} >

                                    <View style={styles.inputSelect}>
                                        <Text>{selectExperience ? selectExperience : "Kinh nghiệm"}</Text>
                                        <Icon name="chevron-down" size={22} color="orange" />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <ReusableModal
                            visible={modalVisible.salary}
                            onClose={() => setModalVisible({ ...modalVisible, salary: false })}
                            title="Chọn mức lương"
                            data={salaries}
                            selectedItems={selectedSalary ? [selectedSalary] : []}
                            onItemPress={handleSalarySelect}
                            onComplete={() => setModalVisible({ ...modalVisible, salary: false })}
                            singleSelect={true}
                        />
                        <ReusableModal
                            visible={modalVisible.experience}
                            onClose={() => setModalVisible({ ...modalVisible, experience: false })}
                            title="Chọn kinh nghiệm yêu cầu"
                            data={experiences}
                            selectedItems={selectExperience ? [selectExperience] : []}
                            onItemPress={handleExperienceSelect}
                            onComplete={() => setModalVisible({ ...modalVisible, experience: false })}
                            singleSelect={true}
                        />

                        <Text style={styles.textInput}>Công nghệ</Text>
                        <TouchableOpacity onPress={() => setModalVisible({ ...modalVisible, technology: true })}>
                            <View style={styles.inputSelect}>
                                <Text>{selectedTechnologies.length > 0 ? selectedTechnologies.join(', ') : "Chọn công nghệ"}</Text>
                                <Icon name="chevron-down" size={22} color="orange" />
                            </View>
                        </TouchableOpacity>

                        <ReusableModalId
                            visible={modalVisible.technology}
                            onClose={() => setModalVisible({ ...modalVisible, technology: false })}
                            title="Chọn công nghệ"
                            data={technologies}
                            selectedItems={selectedTechnologies}
                            onItemPress={handleTechnologySelect}
                            onComplete={() => setModalVisible({ ...modalVisible, technology: false })}
                        />

                        <View style={styleShare.flexBetween}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.textInput}>Thời gian hết hạn</Text>
                                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                                    <View style={styles.inputSelect}>
                                        <Text>{expirationDate ? expirationDate.toLocaleDateString() : "Chọn ngày hết hạn"} </Text>
                                        <Icon name="chevron-down" size={22} color="orange" />
                                    </View >
                                </TouchableOpacity>
                            </View>
                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <Text style={styles.textInput}>Số lượng tuyển</Text>
                                <TextInput
                                    style={styles.introduceInput}
                                    placeholder="Số lượng tuyển"
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

                        {/* Hiển thị DateTimePicker */}
                        {showDatePicker && (
                            <DateTimePicker
                                value={expirationDate}
                                mode="date" // Chọn ngày. Có thể là 'date' hoặc 'time'
                                display="default"
                                onChange={onChange} // Cập nhật giá trị khi người dùng chọn ngày
                                onClose={() => setShowDatePicker(false)} // Đóng picker sau khi chọn
                            />
                        )}
                        <Text style={styles.textInput}>Mô tả</Text>
                        <TextInput
                            style={styles.introduceInput}
                            placeholder="Mô tả về công việc ..."
                            onChangeText={setDescription}
                            multiline={true}
                            numberOfLines={7}
                            textAlignVertical="top"
                        />
                        <Text style={styles.textInput}>Yêu cầu</Text>
                        <TextInput
                            style={styles.introduceInput}
                            placeholder="Ghi ra yêu cầu công việc dành cho ứng viên ..."
                            onChangeText={setRequirements}
                            multiline={true}
                            numberOfLines={7}
                            textAlignVertical="top"
                        />
                        <View style={{ marginTop: 20 }}></View>
                        {loading ? (
                            <ActivityIndicator color={orange} size={'large'} />
                        ) : (
                            <ButtonMain title={'Đăng'} backgroundColor={bgButton1} textColor={white} onPress={() => handlePostJob()} />
                        )}
                    </View>
                </ScrollView>
            )}

        </View>
    )
}

const styles = StyleSheet.create({
    containerMain: {
        paddingHorizontal: 20
    },
    textInput: {
        fontWeight: 'bold',
        color: bgButton1,
        marginTop: 20
    },
    inputSelect: {
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderRadius: 10,
        backgroundColor: white,
        marginTop: 10,
        opacity: 0.8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    introduceInput: {
        borderRadius: 10,
        marginTop: 5,
        padding: 10,
        backgroundColor: white
    },
})