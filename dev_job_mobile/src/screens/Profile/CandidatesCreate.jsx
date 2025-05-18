import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, Text, TextInput, ActivityIndicator, TouchableOpacity, Image } from "react-native";
import StyleShare from "../../assets/themes/StyleShare";
import UIHeader from "../../components/UIHeader";
import { grey, mainColor, orange, white } from "../../assets/themes/Color";
import Button from "../../components/Button";
import API, { authApi, endpoints } from "../../assets/config/API";
import Dropdown from "../../components/Dropdown";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DropDownPicker from 'react-native-dropdown-picker';
import { ToastMess } from "../../components/ToastMess";
import * as ImagePicker from 'expo-image-picker';

export default function CandidatesCreate({ navigation, route }) {
    const user = route.params?.user;
    const [loading, setLoading] = useState(false);
    const [isNewCandidate, setIsNewCandidate] = useState(true); // Flag to track if creating or updating

    const [provinces, setProvinces] = useState([]);
    const [skills, setSkills] = useState([]);
    const [open, setOpen] = useState(false);

    const [selectedProvinceId, setSelectedProvinceId] = useState('');
    const [fullName, setFullName] = useState(user?.name || '');
    const [avatar, setAvatar] = useState(user?.avatar || '');
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState(user?.email || '');
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [level, setLevel] = useState('');
    const [salary, setSalary] = useState('');
    const [jobType, setJobType] = useState('');
    const [availability, setAvailability] = useState('');

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

    useEffect(() => {
        fetchSkills();
        fetchProvinces();
        fetchCandidateDetail();
    }, []);

    const fetchSkills = async (currentPage = 1, limit = 100) => {
        const res = await API.get(endpoints['skills'], {
            params: { page: currentPage, limit: limit },
        });
        const formattedSkills = res.data.data.result.map(skill => ({
            label: skill.name,
            value: skill.name,
        }));
        setSkills(formattedSkills);
    };

    const fetchProvinces = async () => {
        const res = await axios.get('https://esgoo.net/api-tinhthanh/1/0.htm');
        const provinceList = res.data.data.map(province => ({
            title: province.full_name,
        }));
        setProvinces(provinceList);
    };
    const fetchCandidateDetail = async () => {
        if (!user?._id) return;
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("access_token");
            const res = await authApi(token).get(endpoints['candidateDetail'](user._id));
            const candidate = res.data.data;
            console.log(candidate);
            if (candidate) {
                setIsNewCandidate(false); // Candidate exists, so we're updating
                setFullName(candidate.fullName || user.name || '');
                setPhone(candidate.phone || '');
                setEmail(candidate.email || user.email || '');
                setSelectedProvinceId(candidate.location || '');
                setSelectedSkills(candidate.skills || []);
                setLevel(candidate.level || '');
                setSalary(candidate.salary || '');
                setJobType(candidate.jobType || '');
                setAvailability(candidate.availability || '');
                setAvatar(candidate.avatar || '');
                setAvatarPreview(candidate.avatar || '');
            } else {
                setIsNewCandidate(true); // No candidate data, so we're creating
            }
        } catch (error) {
            setIsNewCandidate(true); // If fetch fails, assume no candidate exists
            console.log('Error fetching candidate detail:', error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateAvatar = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            ToastMess({ type: 'error', text1: 'Cần cấp quyền truy cập thư viện ảnh!' });
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
            maxWidth: 500,
            maxHeight: 500,
        });

        if (!result.canceled) {
            const uri = result.assets[0].uri;
            setAvatar(uri);
            setAvatarPreview(uri);
        }
    };

    const handleSaveCandidate = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("access_token");
            const formData = new FormData();

            // Append text fields
            formData.append('fullName', fullName || '');
            formData.append('phone', phone || '');
            formData.append('email', email || '');
            formData.append('location', selectedProvinceId || '');
            formData.append('level', level || '');
            formData.append('salary', salary || '');
            formData.append('jobType', jobType || '');
            formData.append('availability', availability || '');

            // Append skills as individual entries
            selectedSkills.forEach((skill) => {
                formData.append('skills[]', skill);
            });

            // Append avatar if selected
            if (avatar && avatar.startsWith('file://')) {
                const fileName = avatar.split('/').pop();
                formData.append('avatar', {
                    uri: avatar,
                    name: fileName || 'avatar.jpg',
                    type: 'image/jpeg',
                });
            }

            let res;
            if (isNewCandidate) {
                // Create new candidate
                res = await authApi(token).post(
                    endpoints['candidates'], // Assume this endpoint exists
                    formData,
                    {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    }
                );
                console.log(res)
            } else {
                // Update existing candidate
                res = await authApi(token).patch(
                    endpoints['candidateDetail'](user._id),
                    formData,
                    {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    }
                );
            }
            ToastMess({ type: 'success', text1: 'Cập nhật hồ sơ thành công.' });
            if (res.data.statusCode === 200) {
                navigation.goBack();
            }
        } catch (error) {
            ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại.' });
            console.log('Error:', error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={StyleShare.container}>
            <UIHeader
                leftIcon={"arrow-back"}
                handleLeftIcon={() => navigation.goBack()}
                title={isNewCandidate ? 'Tạo hồ sơ ứng viên' : 'Chỉnh sửa phần giới thiệu'}
            />
            <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
                <View style={styles.containerMain}>
                    {/* Avatar Section */}
                    <Text style={styles.textInput}>Ảnh đại diện</Text>
                    <TouchableOpacity onPress={handleUpdateAvatar} style={styles.avatarContainer}>
                        {avatarPreview ? (
                            <Image source={{ uri: avatarPreview }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarPlaceholderText}>Chọn ảnh</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <Text style={styles.textInput}>Họ tên</Text>
                    <TextInput
                        placeholder="Họ tên ứng viên..."
                        onChangeText={setFullName}
                        value={fullName}
                        style={styles.introduceInput}
                        editable={false}
                    />

                    <Text style={styles.textInput}>Email</Text>
                    <TextInput
                        placeholder="Email ứng viên..."
                        onChangeText={setEmail}
                        value={email}
                        style={styles.introduceInput}
                        keyboardType="email-address"
                        editable={false}
                    />

                    <Text style={styles.textInput}>Số điện thoại</Text>
                    <TextInput
                        placeholder="Số điện thoại..."
                        onChangeText={setPhone}
                        value={phone}
                        style={styles.introduceInput}
                        keyboardType="phone-pad"
                    />

                    <Text style={styles.textInput}>Địa điểm</Text>
                    <Dropdown
                        data={provinces}
                        onSelect={(item) => setSelectedProvinceId(item.title)}
                        placeholder="Chọn tỉnh/thành phố"
                        buttonStyle={{ width: '100%', height: 50 }}
                        defaultValue={selectedProvinceId}
                    />

                    <Text style={styles.textInput}>Kỹ năng</Text>
                    <DropDownPicker
                        open={open}
                        value={selectedSkills}
                        items={skills}
                        setOpen={setOpen}
                        setValue={setSelectedSkills}
                        setItems={setSkills}
                        multiple={true}
                        min={0}
                        max={10}
                        placeholder="Chọn kỹ năng"
                        searchable={false}
                        mode="BADGE"
                        badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a"]}
                        listMode={"SCROLLVIEW"}
                        style={{ borderWidth: 0, borderColor: white, borderRadius: 10 }}
                        dropDownContainerStyle={{
                            backgroundColor: white,
                            borderWidth: 1,
                            borderColor: grey,
                            borderRadius: 10,
                            maxHeight: 200,
                        }}
                        textStyle={{ fontWeight: '500' }}
                    />

                    <View style={StyleShare.flexBetween}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.textInput}>Mức lương</Text>
                            <Dropdown
                                data={salaryData}
                                onSelect={(item) => setSalary(item.title)}
                                placeholder="Chọn mức lương"
                                buttonStyle={{ height: 50 }}
                                defaultValue={salary}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 20 }}>
                            <Text style={styles.textInput}>Level</Text>
                            <Dropdown
                                data={levelData}
                                onSelect={(item) => setLevel(item.title)}
                                placeholder="Chọn level"
                                buttonStyle={{ height: 50 }}
                                defaultValue={level}
                            />
                        </View>
                    </View>

                    <View style={StyleShare.flexBetween}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.textInput}>Loại hình công việc</Text>
                            <Dropdown
                                data={jobTypeData}
                                onSelect={(item) => setJobType(item.title)}
                                placeholder="Chọn loại hình"
                                buttonStyle={{ height: 50 }}
                                defaultValue={jobType}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 20 }}>
                            <Text style={styles.textInput}>Trạng thái sẵn sàng</Text>
                            <Dropdown
                                data={availabilityData}
                                onSelect={(item) => setAvailability(item.title)}
                                placeholder="Chọn trạng thái"
                                buttonStyle={{ height: 50 }}
                                defaultValue={availability}
                            />
                        </View>
                    </View>

                    <View style={{ marginTop: 40 }}>
                        {loading ? (
                            <ActivityIndicator color={orange} size={'large'} />
                        ) : (
                            <Button
                                title={isNewCandidate ? 'Tạo hồ sơ' : 'Cập nhật'}
                                backgroundColor={mainColor}
                                textColor={white}
                                onPress={handleSaveCandidate}
                            />
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    containerMain: {
        paddingHorizontal: 20,
    },
    textInput: {
        fontWeight: 'bold',
        color: mainColor,
        marginTop: 20,
        marginBottom: 10,
    },
    introduceInput: {
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 15,
        backgroundColor: white,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: mainColor,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: grey,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: mainColor,
    },
    avatarPlaceholderText: {
        color: mainColor,
        fontWeight: '500',
    },
});