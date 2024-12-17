import React, { useState, useEffect } from "react";
import { View, Image, Text, FlatList, TouchableOpacity, Alert, TextInput, ActivityIndicator, StyleSheet } from "react-native";
import StyleShare from "../../assets/themes/StyleShare";
import UIHeader from "../../components/UIHeader";
import { Chip } from "react-native-paper";
import Icon from 'react-native-vector-icons/Ionicons';
import AlertBanner from "../../components/AlertBanner";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API, { authApi, endpoints } from "../../assets/config/API";
import moment from "moment";
import Loading from "../../components/Loading";
import Modal from "react-native-modal";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../components/Button";
import { mainColor, white, grey, orange } from "../../assets/themes/Color";
import DropDownPicker from "react-native-dropdown-picker";
import { ToastMess } from "../../components/ToastMess";

export default function Subscribers({ navigation }) {
    const dispatch = useDispatch()
    const user = useSelector((state) => state.user.user)
    const [email, setEmail] = useState(user?.email)
    const [name, setName] = useState(user?.name)
    const [skills, setSkills] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedSkills, setSelectedSkills] = useState([]);

    const [sub, setSub] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setModalVisible] = useState(false);

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    useEffect(() => {
        fetchListSub();
        fetchSkills()
    }, []);

    useEffect(() => {
        setEmail(user?.email || "");
        setName(user?.name || "");
    }, [user]);

    const fetchListSub = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("access_token");
            const res = await authApi(token).get(endpoints['subscribers']);
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
                {
                    text: 'Hủy',
                    style: 'cancel',
                },
                {
                    text: 'Đồng ý',
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem('access_token');
                            await authApi(token).delete(endpoints['subscribersDetail'](subId));
                            setSub(prevSubs => prevSubs.filter(subItem => subItem._id !== subId)); // Use a different variable name for the filter
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

    const handleCreateSubscriber = async () => {
        if (!name || !email || !selectedSkills) {
            ToastMess({ type: 'error', text1: 'Vui lòng không để trống các trường.' });
            return;
        }
        const data = {
            email: email,
            name: name,
            skills: selectedSkills,
        };
        try {
            const token = await AsyncStorage.getItem('access_token');
            await authApi(token).post(endpoints['subscribers'], data);
            fetchListSub()
            setModalVisible(false)
        } catch (error) {
            if (error.response && error.response.status === 400) {
                ToastMess({ type: 'error', text1: 'Người dùng đã tồn tại' });
            }
        }
    };



    const renderItem = ({ item }) => {
        return (
            <View style={StyleShare.jobItemContainer}>
                <View style={StyleShare.flexBetween}>
                    <Text style={StyleShare.titleText16}>{item.email}</Text>
                    <View style={StyleShare.flexCenter}>
                        <TouchableOpacity style={{ zIndex: 999, marginLeft: 10 }} onPress={() => handleDeleteSub(item._id)} >
                            <Icon name="close" size={26} color={'red'} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={StyleShare.technologyContainer}>
                    {Array.isArray(item.skills) && item.skills.length > 0 ? (
                        item.skills.map((skill) => (
                            <Chip key={skill} style={StyleShare.chip}>
                                {skill}
                            </Chip>
                        ))
                    ) : (
                        <Text>No skills available</Text> // Nếu không có kỹ năng nào
                    )}
                </View>
                <View style={StyleShare.flexBetween}>
                    <View style={StyleShare.flexCenter}>
                        <Icon name="time" size={22} color={'grey'} style={{ marginRight: 5 }} />
                        <Text>{moment(item.createdAt).format('DD/MM/YYYY')}</Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={StyleShare.container}>
            <Modal isVisible={isModalVisible} onBackdropPress={toggleModal}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                backdropTransitionInTiming={500}
                backdropTransitionOutTiming={500}>
                <View style={{ paddingHorizontal: 20, borderRadius: 10, backgroundColor: grey }}>
                    <View style={[StyleShare.flexBetween, { marginVertical: 15 }]}>
                        <Text style={StyleShare.titleText20}>Thêm mới thông báo</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)} >
                            <Icon name="close" size={26} color={'red'} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.textInput}>Email</Text>
                    <TextInput
                        placeholder="Email nhận được các thông báo việc làm"
                        onChangeText={setEmail}
                        value={email}
                        style={styles.introduceInput}
                    />

                    <Text style={styles.textInput}>Họ và tên</Text>
                    <TextInput
                        placeholder="Nhập họ và tên"
                        onChangeText={setName}
                        value={name}
                        style={styles.introduceInput}
                    />
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
                    <View style={{ marginTop: 40 }}></View>
                    <Button title={'Đăng ký'} backgroundColor={mainColor} textColor={white} onPress={() => handleCreateSubscriber()} />
                    {/* {loading ? (
                        <ActivityIndicator color={orange} size={'large'} />
                    ) : (
                    )} */}
                </View>
            </Modal>
            <UIHeader
                leftIcon={"arrow-back"}
                rightIcon={'add-circle-outline'}
                title={'Thông báo việc làm qua Email'}
                handleLeftIcon={() => { navigation.goBack() }}
                handleRightIcon={() => { setModalVisible(true); }}
            />
            <View style={{ marginHorizontal: 20, marginTop: 5 }}>
                <AlertBanner message={"Bạn chỉ được tạo tối đa 3 thông báo việc làm."} type={'info'} />
                <AlertBanner message={"Việc làm gửi đến Email của bạn theo kĩ năng !"} type={"success"} />
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
                            <Text style={StyleShare.titleText20}>Bạn chưa có báo việc làm</Text>
                            <Text style={{ padding: 20, textAlign: 'center' }}>Bạn chưa có bất kỳ thông báo việc làm nào, hãy tạo thông báo việc làm để nhận được những việc làm chất lượng</Text>
                        </View>
                    }
                    contentContainerStyle={{ paddingBottom: 40 }}
                />
            )}
        </View>
    );
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
