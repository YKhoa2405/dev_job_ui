import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, Text, TextInput, ActivityIndicator, TouchableOpacity } from "react-native";
import StyleShare from "../../assets/themes/StyleShare";
import UIHeader from "../../components/UIHeader";
import { mainColor, orange, white } from "../../assets/themes/Color";
import Button from "../../components/Button"
import API, { endpoints } from "../../assets/config/API";
import Dropdown from "../../components/Dropdown";
import axios from "axios";
import DateTimePickerModal from "react-native-modal-datetime-picker";


export default function JobCreate({ navigation }) {
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [selectedDateType, setSelectedDateType] = useState(null);
    const [loading, setLoading] = useState(false)
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [skills, setSkills] = useState([]);

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

    const fetchSkills = async (currentPage = 1, limit = 40) => {
        try {
            const res = await API.get(endpoints['skills'], {
                params: {
                    page: currentPage,
                    limit: limit,
                },
            });
            setSkills(res.data.data.result)
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
            } else {

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

    const handleCreateJob = async () => {
        if (!name ||
            !requirement ||
            !description ||
            !prioritize ||
            !location ||
            !jobType ||
            !salary ||
            !city ||
            !level ||
            !quantity ||
            !selectedSkills) {
            // ToastMess({ type: 'error', text1: 'Vui lòng không để trống các trường.' });
            return;
        }

        setLoading(true);

        const jobData = {
            name,
            startDate: startDate,
            endDate: endDate,
            description,
            requirement,
            prioritize,
            location,
            skills: skills,
            jobType,
            city,
            salary,
            quantity,
            level,
            latitude: lat,
            longitude: lon,
        };

        console.log(jobData)
    };
    return (
        <View style={StyleShare.container}>
            <UIHeader leftIcon={"arrow-back"}
                handleLeftIcon={() => { navigation.goBack() }}
                title={'Thêm tin tuyển dụng'} />
            {loading ? (
                <ActivityIndicator style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} size="large" color='orange' />
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
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
                            <Dropdown
                                data={skills.map(skill => ({ title: skill.name }))}
                                onSelect={(item) => {
                                    setSelectedSkills
                                }}
                                placeholder="Chọn kỹ năng"
                                buttonStyle={{
                                    width: '100%',
                                    height: 50,
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

                        <Text style={styles.textInput}>Mô tả công việc</Text>
                        <TextInput
                            style={styles.introduceInput}
                            placeholder="Mô tả về công việc ..."
                            onChangeText={setDescription}
                            multiline={true}
                            numberOfLines={7}
                            textAlignVertical="top"
                        />
                        <Text style={styles.textInput}>Yêu cầu ứng viên</Text>
                        <TextInput
                            style={styles.introduceInput}
                            placeholder="Yêu cầu công việc dành cho ứng viên ..."
                            onChangeText={setRequirement}
                            multiline={true}
                            numberOfLines={7}
                            textAlignVertical="top"
                        />
                        <Text style={styles.textInput}>Ưu tiên</Text>
                        <TextInput
                            style={styles.introduceInput}
                            placeholder="Ưu tiên tuyển dụng ..."
                            onChangeText={setPrioritize}
                            multiline={true}
                            numberOfLines={7}
                            textAlignVertical="top"
                        />
                        <View style={{ marginTop: 20 }}></View>
                        {loading ? (
                            <ActivityIndicator color={orange} size={'large'} />
                        ) : (
                            <Button title={'Đăng'} backgroundColor={mainColor} textColor={white} onPress={() => handleCreateJob()} />
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
        color: mainColor,
        marginTop: 20,
        marginBottom: 5
    },

    introduceInput: {
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 15,
        backgroundColor: white
    },
})