import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Text, TouchableOpacity } from 'react-native';
import StyleShare from '../../assets/themes/StyleShare';
import UIHeader from '../../components/UIHeader';
import { grey, mainColor, orange, white } from '../../assets/themes/Color';
import Dropdown from '../../components/Dropdown';
import axios from 'axios';
import Modal from "react-native-modal";
import Icon from 'react-native-vector-icons/Ionicons';
import Button from '../../components/Button';
import { ToastMess } from '../../components/ToastMess';
import API, { endpoints } from '../../assets/config/API';
import DropDownPicker from 'react-native-dropdown-picker';

export default function ResumeInput({ route, navigation }) {
    const [open, setOpen] = useState(false);

    const [name, setName] = useState('');
    const [position, setPosition] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [gender, setGender] = useState('');
    const [dob, setDob] = useState('');
    const [selectedProvinceId, setSelectedProvinceId] = useState('');
    const [selectedDistrictId, setSelectedDistrictId] = useState('');
    const [selectedWardId, setSelectedWardId] = useState('');
    const [githubLink, setGithubLink] = useState('');

    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    const [skills, setSkills] = useState([]); // hứng danh sách kỹ năng từ apiapi
    const [groupSkill, setGroupSkill] = useState('');
    const [skillList, setSkillList] = useState([]);
    const [skillValue, setSkillValue] = useState([]);


    const [isModalSkill, setModalSkill] = useState(false);
    const [isModalEducation, setModalEducation] = useState(false);



    const scrollTo = route.params?.scrollTo;
    const sectionRefs = {
        personalInfo: useRef(null),
        education: useRef(null),
        experience: useRef(null),
        skills: useRef(null),
        projects: useRef(null),
    };
    const scrollViewRef = useRef(null);

    const GenderData = [
        { title: 'Nam ' },
        { title: 'Nữ ' },
        { title: 'Khác' },
    ]

    useEffect(() => {
        if (scrollTo && sectionRefs[scrollTo]) {
            sectionRefs[scrollTo].current.measureLayout(
                scrollViewRef.current,
                (x, y) => {
                    scrollViewRef.current.scrollTo({ x: 0, y, animated: true });
                }
            );
        }
    }, [scrollTo]);

    useEffect(() => {
        fetchProvinces();
        fetchSkills()
    }, [])

    const fetchProvinces = async () => {
        const res = await axios.get('https://esgoo.net/api-tinhthanh/1/0.htm');
        setProvinces(res.data.data || []);
    };

    const fetchDistricts = async (provinceId) => {
        const response = await axios.get(`https://esgoo.net/api-tinhthanh/2/${provinceId}.htm`);
        if (response.data.error === 0) {
            setDistricts(response.data.data || []);
            setSelectedDistrictId(''); // Reset district and ward selections
            setWards([]);
        }
    };

    const fetchWards = async (districtId) => {
        const response = await axios.get(`https://esgoo.net/api-tinhthanh/3/${districtId}.htm`);
        if (response.data.error === 0) {
            setWards(response.data.data || []);
        }
    };

    const fetchSkills = async (currentPage = 1, limit = 40) => {
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

    const handleSaveSkill = () => {
        if (groupSkill.trim() && skillList.length) {
            const newSkillGroup = {
                group: groupSkill,
                skills: skillList
            };
            setSkillValue(prevSkills => [...prevSkills, newSkillGroup]);
            setGroupSkill('');
            setSkillList([]);
            setModalSkill(false);

        } else {
            alert('Vui lòng nhập đầy đủ thông tin.');
        }
    };

    const handleDeleteSkill = (indexToRemove) => {
        setSkillValue(prevSkills =>
            prevSkills.filter((_, index) => index !== indexToRemove)
        );
    };

    return (
        <View style={StyleShare.container}>
            <Modal isVisible={isModalSkill} onBackdropPress={() => setModalSkill(!isModalSkill)}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                backdropTransitionInTiming={500}
                backdropTransitionOutTiming={500}
                style={StyleShare.modalStyle}>

                <View style={StyleShare.modalContent}>
                    <View style={[StyleShare.flexBetween, { marginVertical: 15 }]}>
                        <Text style={StyleShare.titleText20}>Thêm mới kỹ năng</Text>
                        <TouchableOpacity onPress={() => setModalSkill(false)} >
                            <Icon name="close" size={26} color={'red'} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.textInput}>Nhóm kỹ năng <Text style={{ color: 'red' }}>*</Text></Text>
                    <TextInput
                        placeholder="FE, BE, QA, BA, PM, HR, ..."
                        value={groupSkill}
                        onChangeText={setGroupSkill}
                        style={styles.introduceInput}
                    />

                    <Text style={styles.textInput}>Danh sách kỹ năng <Text style={{ color: 'red' }}>*</Text></Text>
                    <DropDownPicker
                        open={open} // Trạng thái mở/đóng
                        items={skills} // Dữ liệu hiển thị
                        setOpen={setOpen} // Hàm thay đổi trạng thái mở/đóng
                        value={skillList} // Giá trị được chọn
                        setValue={setSkillList} // Hàm thay đổi giá trị được chọn
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

                    <View style={{ marginTop: 20 }}></View>
                    <Button title={'Lưu'} backgroundColor={mainColor} textColor={white} onPress={() => handleSaveSkill()} />

                </View>
            </Modal>
            <Modal isVisible={isModalEducation} onBackdropPress={() => setModalEducation(!isModalEducation)}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                backdropTransitionInTiming={500}
                backdropTransitionOutTiming={500}
                style={StyleShare.modalStyle}>

                <View style={StyleShare.modalContent}>
                    <View style={[StyleShare.flexBetween, { marginVertical: 15 }]}>
                        <Text style={StyleShare.titleText20}>Thêm mới trình độ học vấn</Text>
                        <TouchableOpacity onPress={() => setModalEducation(false)} >
                            <Icon name="close" size={26} color={'red'} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.textInput}>Tên trường <Text style={{ color: 'red' }}>*</Text></Text>
                    <TextInput
                        placeholder=""
                        // onChangeText={setEmail}
                        // value={email}
                        style={styles.introduceInput}
                    />
                    <View style={StyleShare.flexBetween}>
                        <View style={{ width: '48%' }}>
                            <Text style={styles.textInput}>Ngày bắt đầu <Text style={{ color: 'red' }}>*</Text></Text>
                            <TextInput
                                placeholder="DD/MM/YYYY"
                                // onChangeText={setName}
                                // value={name}
                                style={styles.introduceInput}
                            />
                        </View>
                        <View style={{ width: '48%' }}>
                            <Text style={styles.textInput}>Ngày kết thúc <Text style={{ color: 'red' }}>*</Text></Text>
                            <TextInput
                                placeholder="DD/MM/YYYY"
                                // onChangeText={setName}
                                // value={name}
                                style={styles.introduceInput}
                            />
                        </View>
                    </View>

                    <Text style={styles.textInput}>Chuyên ngành <Text style={{ color: 'red' }}>*</Text></Text>
                    <TextInput
                        placeholder=""
                        // onChangeText={setEmail}
                        // value={email}
                        style={styles.introduceInput}
                    />

                    <Text style={styles.textInput}>Mô tả </Text>
                    <TextInput
                        placeholder="Nhập mô tả ..."
                        style={[styles.introduceInput, { height: 120, textAlignVertical: 'top' }]}
                        multiline
                        numberOfLines={8}
                    />

                    <View style={{ marginTop: 20 }}></View>
                    <Button title={'Lưu'} backgroundColor={mainColor} textColor={white} />
                </View>
            </Modal>
            <UIHeader
                leftIcon={"arrow-back"}
                title={'Thông tin chung'}
                handleLeftIcon={() => { navigation.goBack() }} />
            <ScrollView showsVerticalScrollIndicator={false} ref={scrollViewRef}>
                <View ref={sectionRefs.personalInfo} style={StyleShare.manageJob}>
                    <Text style={StyleShare.titleText16}>Thông tin cá nhân:</Text>
                    <View style={{ marginTop: 10 }}>
                        <Text style={styles.textInput}>Họ và tên <Text style={{ color: 'red' }}>*</Text></Text>
                        <TextInput
                            style={styles.introduceInput}
                            placeholder="Họ và tên"
                            value={name}
                            onChangeText={setName}
                        />

                        <Text style={styles.textInput}>Vị trí ứng tuyển <Text style={{ color: 'red' }}>*</Text></Text>
                        <TextInput
                            style={styles.introduceInput}
                            placeholder="Vị trí ứng tuyển"
                            value={position}
                            onChangeText={setPosition}
                        />

                        <Text style={styles.textInput}>Email <Text style={{ color: 'red' }}>*</Text></Text>
                        <TextInput
                            style={styles.introduceInput}
                            placeholder="Email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />

                        <Text style={styles.textInput}>Số điện thoại <Text style={{ color: 'red' }}>*</Text></Text>
                        <TextInput
                            style={styles.introduceInput}
                            placeholder="Số điện thoại"
                            keyboardType="phone-pad"
                            value={phone}
                            onChangeText={setPhone}
                        />

                        <Text style={styles.textInput}>Giới tính</Text>
                        <Dropdown
                            data={GenderData}
                            onSelect={(item) => setGender(item.title)}
                            placeholder="Chọn giới tính"
                            buttonStyle={{
                                height: 50,
                                borderWidth: 2,
                                borderColor: grey,
                                with: '100%',
                            }}
                        />

                        <Text style={styles.textInput}>Ngày sinh <Text style={{ color: 'red' }}>*</Text></Text>
                        <TextInput
                            style={styles.introduceInput}
                            placeholder="Ngày sinh (dd/mm/yyyy)"
                            keyboardType="numeric"
                            onChangeText={setDob}
                        />

                        <Text style={styles.textInput}>Địa chỉ <Text style={{ color: 'red' }}>*</Text></Text>
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
                                width: '100%',
                                height: 50,
                                borderColor: grey,
                                borderWidth: 2
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
                                width: '100%',
                                height: 50,
                                borderColor: grey,
                                borderWidth: 2,
                                marginTop: 10
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
                                width: '100%',
                                height: 50,
                                borderColor: grey,
                                borderWidth: 2,
                                marginTop: 10
                            }}
                        />

                        <Text style={styles.textInput}>Github </Text>
                        <TextInput
                            style={styles.introduceInput}
                            placeholder="Link Github"
                            keyboardType="url"  // Nhập URL
                            autoCapitalize="none"
                            value={githubLink}
                            onChangeText={setGithubLink}
                        />
                    </View>

                </View>

                <View ref={sectionRefs.education} style={StyleShare.manageJob}>
                    <Text style={StyleShare.titleText16}>Học vấn <Text style={{ color: 'red' }}>*</Text></Text>
                    <TouchableOpacity style={styles.inputAddNew} onPress={() => { setModalEducation(true) }}>
                        <Text style={{ fontWeight: 'bold', color: orange }}>Thêm mới</Text>
                    </TouchableOpacity>
                </View>

                <View ref={sectionRefs.experience} style={StyleShare.manageJob}>
                    <Text style={StyleShare.titleText16}>Kinh nghiệm làm việc</Text>
                    <TouchableOpacity style={styles.inputAddNew} onPress={() => navigation.navigate('ResumeExperience')}>
                        <Text style={{ fontWeight: 'bold', color: orange }}>Thêm mới</Text>
                    </TouchableOpacity>
                </View>

                <View ref={sectionRefs.skills} style={StyleShare.manageJob}>
                    <Text style={StyleShare.titleText16}>Kỹ năng <Text style={{ color: 'red' }}>*</Text></Text>
                    <View style={{ marginTop: 10 }}>
                        {skillValue.map((item, index) => (
                            <View
                                key={index}
                                style={[StyleShare.flexBetween, { marginBottom: 5 }]}>
                                <Text style={{ flex: 1 }}>{item.group}: {item.skills.join(', ')}</Text>
                                <TouchableOpacity onPress={() => handleDeleteSkill(index)}>
                                    <Icon name="trash-outline" size={20} color="red" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                    <TouchableOpacity style={styles.inputAddNew} onPress={() => { setModalSkill(true) }}>
                        <Text style={{ fontWeight: 'bold', color: orange }}>Thêm mới</Text>
                    </TouchableOpacity>
                </View>

                <View ref={sectionRefs.projects} style={StyleShare.manageJob}>
                    <Text style={StyleShare.titleText16}>Dự án</Text>
                    <TouchableOpacity style={styles.inputAddNew} onPress={() => navigation.navigate('ResumeProject')}>
                        <Text style={{ fontWeight: 'bold', color: orange }}>Thêm mới</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            <TouchableOpacity style={[StyleShare.flexCenter, { backgroundColor: mainColor, padding: 15, marginBottom: 10, marginHorizontal: 20, borderRadius:10 }]} onPress={() => navigation.navigate('ResumeTemlates')}>
                <Text style={[StyleShare.titleText16, { color: 'white' }]}>Xem trước CV</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    textInput: {
        fontWeight: 'bold',
        color: mainColor,
        marginTop: 10,
        marginBottom: 5
    },
    introduceInput: {
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 13,
        backgroundColor: white,
        borderColor: grey,
        borderWidth: 2,
    },
    inputAddNew: {
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        borderColor: orange,
        borderWidth: 1,
        padding: 10,
    }
});
