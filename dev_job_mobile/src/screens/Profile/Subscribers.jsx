import React, { useState, useEffect } from "react";
import { View, Image, Text, FlatList, TouchableOpacity, Alert, TextInput, StyleSheet } from "react-native";
import StyleShare from "../../assets/themes/StyleShare";
import UIHeader from "../../components/UIHeader";
import { Chip } from "react-native-paper";
import Icon from 'react-native-vector-icons/Ionicons';
import AlertBanner from "../../components/AlertBanner";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API, { authApi, endpoints } from "../../assets/config/API";
import moment from "moment";
import Modal from "react-native-modal";
import Button from "../../components/Button";
import { mainColor, white, grey } from "../../assets/themes/Color";
import DropDownPicker from "react-native-dropdown-picker";
import { ToastMess } from "../../components/ToastMess";
import Loading from "../../components/Loading";

export default function Subscribers({ navigation, route }) {
    const { user } = route?.params;
    const [email, setEmail] = useState(user?.email || "");
    const [name, setName] = useState(user?.name || "");
    const [skills, setSkills] = useState([]);
    const [openSkills, setOpenSkills] = useState(false);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [openSchedule, setOpenSchedule] = useState(false);
    const [notificationSchedule, setNotificationSchedule] = useState("daily"); // Giá trị mặc định
    const [sub, setSub] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setModalVisible] = useState(false);

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    // Danh sách tùy chọn lịch trình
    const [scheduleOptions, setScheduleOptions] = useState([
        { label: "Mỗi ngày", value: "daily" },
        { label: "Thứ 4 hàng tuần", value: "wednesday" },
        { label: "Thứ 7 hàng tuần", value: "saturday" },
    ]);

    useEffect(() => {
        fetchListSub();
        fetchSkills();
    }, []);

    useEffect(() => {
        setEmail(user?.email || "");
        setName(user?.name || "");
    }, [user]);

    const fetchListSub = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("access_token");
            const res = await authApi(token).get(endpoints['subscribersUser']);
            const data = res.data.data;
            setSub(data.result);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSub = async (subId) => {
        Alert.alert(
            'Hủy thông báo việc làm qua Email',
            'Bạn có chắc chắn muốn hủy thông báo này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Đồng ý',
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem('access_token');
                            await authApi(token).delete(endpoints['subscribersDetail'](subId));
                            setSub(prevSubs => prevSubs.filter(subItem => subItem._id !== subId));
                        } catch (error) {
                            ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại' });
                            console.log(error);
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const fetchSkills = async (currentPage = 1, limit = 100) => {
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
            console.log(error);
        }
    };

    const handleCreateSubscriber = async () => {
        if (!name || !email || !selectedSkills.length || !notificationSchedule) {
            ToastMess({ type: 'error', text1: 'Vui lòng không để trống các trường.' });
            return;
        }
        const data = {
            email: email,
            name: name,
            skills: selectedSkills,
            notificationSchedule: notificationSchedule, // Thêm trường mới
        };
        console.log(data);
        try {
            const token = await AsyncStorage.getItem('access_token');
            await authApi(token).post(endpoints['subscribers'], data);
            fetchListSub();
            setModalVisible(false);
            setSelectedSkills([]); // Reset sau khi tạo
            setNotificationSchedule("daily"); // Reset về mặc định
        } catch (error) {
            ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại' });
            console.log(error.message.errors);
        }
    };

    const renderItem = ({ item }) => {
        const scheduleText = scheduleOptions.find(opt => opt.value === item.notificationSchedule)?.label || "Không xác định";
        return (
            <View style={StyleShare.jobItemContainer}>
                <View style={StyleShare.flexBetween}>
                    <Text style={StyleShare.titleText16}>{item.email}</Text>
                    <TouchableOpacity style={{ zIndex: 999, marginLeft: 10 }} onPress={() => handleDeleteSub(item._id)}>
                        <Icon name="close" size={26} color={'red'} />
                    </TouchableOpacity>
                </View>
                <View style={StyleShare.technologyContainer}>
                    {Array.isArray(item.skills) && item.skills.length > 0 ? (
                        item.skills.map((skill) => (
                            <Chip key={skill} style={StyleShare.chip}>
                                {skill}
                            </Chip>
                        ))
                    ) : (
                        <Text>No skills available</Text>
                    )}
                </View>
                <View style={StyleShare.flexBetween}>
                    <View style={StyleShare.flexCenter}>
                        <Icon name="time" size={22} color={'grey'} style={{ marginRight: 5 }} />
                        <Text>{moment(item.createdAt).format('DD/MM/YYYY')}</Text>
                    </View>
                    <Text style={{ color: mainColor, fontWeight: 'bold' }}>{scheduleText}</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={StyleShare.container}>
            <Modal
                isVisible={isModalVisible}
                onBackdropPress={toggleModal}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                backdropTransitionInTiming={500}
                backdropTransitionOutTiming={500}
                style={StyleShare.modalStyle}
            >
                <View style={StyleShare.modalContent}>
                    <View style={[StyleShare.flexBetween, { marginVertical: 15 }]}>
                        <Text style={StyleShare.titleText20}>Thêm mới thông báo</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Icon name="close" size={26} color={'red'} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.textInput}>Email <Text style={{ color: 'red' }}>*</Text></Text>
                    <TextInput
                        placeholder="Email nhận thông báo việc làm"
                        onChangeText={setEmail}
                        value={email}
                        style={styles.introduceInput}
                    />
                    <Text style={styles.textInput}>Họ và tên <Text style={{ color: 'red' }}>*</Text></Text>
                    <TextInput
                        placeholder="Nhập họ và tên"
                        onChangeText={setName}
                        value={name}
                        style={styles.introduceInput}
                    />
                    <Text style={styles.textInput}>Kỹ năng <Text style={{ color: 'red' }}>*</Text></Text>
                    <DropDownPicker
                        open={openSkills}
                        value={selectedSkills}
                        items={skills}
                        setOpen={setOpenSkills}
                        setValue={setSelectedSkills}
                        setItems={setSkills}
                        multiple={true}
                        min={0}
                        max={10}
                        placeholder="Chọn kỹ năng"
                        searchable={true}
                        searchPlaceholder="Tìm kiếm kỹ năng..." // Văn bản placeholder cho thanh tìm kiếm
                        mode="BADGE"
                        badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a"]}
                        listMode="SCROLLVIEW"
                        style={{
                            borderWidth: 0,
                            borderColor: white,
                            borderRadius: 10,
                        }}
                        dropDownContainerStyle={{
                            backgroundColor: white,
                            borderWidth: 1,
                            borderColor: grey,
                            borderRadius: 10,
                            maxHeight: 200,
                        }}
                        textStyle={{ fontWeight: '500' }}
                        zIndex={2000} // Đảm bảo không bị chồng lấn bởi DropDownPicker khác
                    />
                    <Text style={styles.textInput}>Lịch nhận thông báo <Text style={{ color: 'red' }}>*</Text></Text>
                    <DropDownPicker
                        open={openSchedule}
                        value={notificationSchedule}
                        items={scheduleOptions}
                        setOpen={setOpenSchedule}
                        setValue={setNotificationSchedule}
                        setItems={setScheduleOptions}
                        placeholder="Chọn lịch nhận thông báo"
                        listMode="SCROLLVIEW"


                        style={{
                            borderWidth: 0,
                            borderColor: white,
                            borderRadius: 10,
                        }}
                        dropDownContainerStyle={{
                            backgroundColor: white,
                            borderWidth: 1,
                            borderColor: grey,
                            borderRadius: 10,
                            maxHeight: 150,
                        }}
                        textStyle={{ fontWeight: '500' }}
                        zIndex={1000}
                    />

                    <View style={{ marginTop: 20 }} />
                    <Button
                        title={'Đăng ký'}
                        backgroundColor={mainColor}
                        textColor={white}
                        onPress={handleCreateSubscriber}
                    />
                </View>
            </Modal>
            <UIHeader
                leftIcon={"arrow-back"}
                rightIcon={'add-circle-outline'}
                title={'Thông báo việc làm qua Email'}
                handleLeftIcon={() => navigation.goBack()}
                handleRightIcon={() => setModalVisible(true)}
            />
            <View style={{ marginHorizontal: 20, marginTop: 5 }}>
                <AlertBanner message={"Bạn chỉ được tạo tối đa 3 thông báo việc làm."} type={'info'} />
                <AlertBanner message={"Việc làm gửi đến Email của bạn theo kỹ năng!"} type={"success"} />
            </View>
            {loading ? (
                <Loading />
            ) : (
                <FlatList
                    data={sub}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    ListEmptyComponent={
                        <View style={{ marginTop: 50, alignItems: 'center' }}>
                            <Image source={require("../../assets/images/save.png")} style={StyleShare.imageNullData} />
                            <Text style={StyleShare.titleText20}>Bạn chưa có thông báo việc làm</Text>
                            <Text style={{ padding: 20, textAlign: 'center' }}>
                                Bạn chưa có bất kỳ thông báo việc làm nào, hãy tạo thông báo để nhận việc làm chất lượng!
                            </Text>
                        </View>
                    }
                    contentContainerStyle={{ paddingBottom: 40 }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    textInput: {
        fontWeight: 'bold',
        color: mainColor,
        marginTop: 20,
        marginBottom: 5,
    },
    introduceInput: {
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 15,
        backgroundColor: white,
    },
});