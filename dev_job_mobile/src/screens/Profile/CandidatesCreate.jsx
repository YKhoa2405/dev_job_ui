import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, Text, TextInput, ActivityIndicator, TouchableOpacity } from "react-native";
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

export default function CandidatesCreate({ navigation, route }) {
    const user = route.params?.user; // Lấy user từ route.params
    const [loading, setLoading] = useState(false);

    const [provinces, setProvinces] = useState([]);
    const [skills, setSkills] = useState([]);
    const [open, setOpen] = useState(false);

    const [selectedProvinceId, setSelectedProvinceId] = useState('');
    const [fullName, setFullName] = useState(user?.name || '');
    const [avatar, setAvatar] = useState('');
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

    const fetchSkills = async (currentPage = 1, limit = 40) => {
        try {
            const res = await API.get(endpoints['skills'], {
                params: { page: currentPage, limit: limit },
            });
            const formattedSkills = res.data.data.result.map(skill => ({
                label: skill.name,
                value: skill.name,
            }));
            setSkills(formattedSkills);
        } catch (error) {
            console.log('Error fetching skills:', error);
        }
    };

    const fetchProvinces = async () => {
        try {
            const res = await axios.get('https://esgoo.net/api-tinhthanh/1/0.htm');
            const provinceList = res.data.data.map(province => ({
                title: province.full_name, // Hiển thị tên tỉnh/thành phố
            }));
            setProvinces(provinceList);
        } catch (error) {
            console.log('Error fetching provinces:', error);
        }
    };



    const fetchCandidateDetail = async () => {
        if (!user?._id) return; // Nếu không có user._id thì bỏ qua
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("access_token");
            const res = await authApi(token).get(endpoints['candidateDetail'](user._id));
            const candidate = res.data.data;

            setFullName(candidate.fullName || user.name || '');
            setPhone(candidate.phone || '');
            setEmail(candidate.email || user.email || '');
            setSelectedProvinceId(candidate.location || '');
            setSelectedSkills(candidate.skills || []);
            setLevel(candidate.level || '');
            setSalary(candidate.salary || '');
            setJobType(candidate.jobType || '');
            setAvailability(candidate.availability || '');
        } catch (error) {
            console.log('Error fetching candidate detail:', error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateCandidate = async () => {
        const candidateData = {
            fullName: fullName || undefined,
            phone: phone || undefined,
            email,
            location: selectedProvinceId || undefined, // location là tên tỉnh
            skills: selectedSkills,
            level: level || undefined,
            salary: salary || undefined,
            jobType: jobType || undefined,
            availability: availability || undefined,
        };

        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("access_token");
            const res = await authApi(token).patch(
                endpoints['candidateDetail'](user._id),
                candidateData,
                {
                    headers: { 'Content-Type': 'application/json' },
                }
            );
            ToastMess({ type: 'success', text1: 'Cập nhật ứng viên thành công.' });
            if (res.data.statusCode === 200) {
                navigation.goBack();
            }
        } catch (error) {
            ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại.' });
            console.log('Error updating candidate:', error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={StyleShare.container}>
            <UIHeader
                leftIcon={"arrow-back"}
                handleLeftIcon={() => navigation.goBack()}
                title={'Chỉnh sửa phần giới thiệu'}
            />
            <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
                <View style={styles.containerMain}>

                    <Text style={styles.textInput}>Họ tên</Text>
                    <TextInput
                        placeholder="Họ tên ứng viên..."
                        onChangeText={setFullName}
                        value={fullName}
                        style={styles.introduceInput}
                    />

                    <Text style={styles.textInput}>Email</Text>
                    <TextInput
                        placeholder="Email ứng viên..."
                        onChangeText={setEmail}
                        value={email}
                        style={styles.introduceInput}
                        keyboardType="email-address"
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
                        defaultValue={selectedProvinceId} // Hiển thị giá trị mặc định
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
                                defaultValue={salary} // Hiển thị giá trị mặc định
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 20 }}>
                            <Text style={styles.textInput}>Level</Text>
                            <Dropdown
                                data={levelData}
                                onSelect={(item) => setLevel(item.title)}
                                placeholder="Chọn level"
                                buttonStyle={{ height: 50 }}
                                defaultValue={level} // Hiển thị giá trị mặc định
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
                                defaultValue={jobType} // Hiển thị giá trị mặc định
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 20 }}>
                            <Text style={styles.textInput}>Trạng thái sẵn sàng</Text>
                            <Dropdown
                                data={availabilityData}
                                onSelect={(item) => setAvailability(item.title)}
                                placeholder="Chọn trạng thái"
                                buttonStyle={{ height: 50 }}
                                defaultValue={availability} // Hiển thị giá trị mặc định
                            />
                        </View>
                    </View>

                    <View style={{ marginTop: 40 }}>
                        {loading ? (
                            <ActivityIndicator color={orange} size={'large'} />
                        ) : (
                            <Button
                                title={'Cập nhật'}
                                backgroundColor={mainColor}
                                textColor={white}
                                onPress={handleUpdateCandidate}
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
});