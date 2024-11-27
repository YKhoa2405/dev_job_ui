import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions, Image, TouchableWithoutFeedback, TouchableOpacity } from "react-native";
import styleShare from "../../assets/theme/style";
import { Avatar, Chip } from "react-native-paper";
import { bgButton1, bgButton2, grey, orange, white } from "../../assets/theme/color";
import Icon from "react-native-vector-icons/Ionicons"
import MyContext from "../../config/MyContext";
import ReusableModal from "../../components/ReusableModal ";
import API, { authApi, endpoints } from "../../config/API";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { ToastMess } from "../../components/ToastMess";
import ReusableModalId from "../../components/ReusableModelId";

export default function Profile({ navigation }) {
    const [user, dispatch] = useContext(MyContext)
    console.log(user)
    const [province, setProvince] = useState([])
    const [selectExperience, setSelectExperience] = useState('')
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedTechnologies, setSelectedTechnologies] = useState([]);
    const [modalVisible, setModalVisible] = useState({
        // salary: false,
        technology: false,
        experience: false,
        location: false
    });
    const [technologies, setTechnologies] = useState([]);

    const experiences = ['Thực tập sinh', 'Dưới 1 năm', '1 năm', '2 năm', '3 năm', '4 năm', '5 năm', 'Trên 5 năm'];

    useEffect(() => {
        fetchProvince();
        fetchTechnology()
    }, []);
    const fetchProvince = async () => {
        const res = await axios.get('https://esgoo.net/api-tinhthanh/1/0.htm')
        const data = res.data.data;
        const fullNames = data.map(item => item.full_name);
        setProvince(fullNames)
    }

    const fetchTechnology = async () => {
        try {
            const res = await API.get(endpoints['technology']);
            setTechnologies(res.data);
        } catch (error) {
            console.error("Error fetching technology data", error);
        }
    }

    const aboutApp = [
        { id: 1, icon: 'business', title: 'Về HeyJob' },
        { id: 2, icon: 'book', title: 'Điều khoản và dịch vụ' },
        { id: 3, icon: 'call', title: 'Trợ giúp' },
        { id: 4, icon: 'heart-circle-sharp', title: 'Đánh giá ứng dụng' },
    ]

    const manageJob = [
        { id: 1, icon: 'bookmark', title: 'Việc làm đã lưu', },
        { id: 2, icon: 'briefcase', title: 'Việc làm đã ứng tuyển', },
        { id: 3, icon: 'business', title: 'Công ty đã theo dõi', },
    ]

    const handleManageJobClick = (id) => {
        switch (id) {
            case 1:
                navigation.navigate('SaveJob')
                break;
            case 2:
                navigation.navigate('ApplyJob')
                break;
            case 3:
                console.log('Công ty đã theo dõi clicked');
                navigation.navigate('ListFollow')

                break;
            default:
                console.log('Unknown item clicked');
                break;
        }
    };

    const handleLogout = async () => {
        navigation.navigate('Login')
        dispatch({
            'type': 'logout'
        })
    }

    const handleExperienceSelect = (experience) => {
        setSelectExperience(experience);
    };
    const handleProvinceSelect = (province) => {
        setSelectedProvince(province);
    };
    const handleTechnologySelect = (id) => {
        setSelectedTechnologies(prevTechnologies =>
            prevTechnologies.includes(id)
                ? prevTechnologies.filter(item => item !== id) // Bỏ chọn
                : [...prevTechnologies, id] // Thêm ID vào danh sách chọn
        );
    };

    const handleUpdate = async (field, value) => {
        const token = await AsyncStorage.getItem("access-token");
        const formData = new FormData();
        formData.append(field, value);
        try {
            await authApi(token).patch(endpoints['update_seeker'], formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            ToastMess({ type: 'success', text1: 'Cập nhật thông tin thành.' });
            console.log(formData)
        } catch (error) {
            ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại.' });
            console.log(error)
        }
    };

    const handleUpdateTechnology = async () => {
        await handleUpdate('technologies', selectedTechnologies);
        console.log(selectedTechnologies)

    };
    const handleUpdateExperience = async () => {
        await handleUpdate('experience', selectExperience);
    };

    const handleUpdateLocation = async () => {
        await handleUpdate('location', selectedProvince);
    };



    const ManageJobGrid = () => (
        <View style={styles.grid}>
            {manageJob.map((item) => (
                <TouchableWithoutFeedback onPress={() => handleManageJobClick(item.id)} key={item.id}>
                    <View style={styles.gridItem}>
                        <View style={styles.containerAvatarJob}>
                            <Icon name={item.icon} size={20} color={bgButton1}></Icon>
                        </View>
                        <View style={[styleShare.flexBetween, { marginTop: 10 }]}>
                            <Text style={{ paddingRight: 10, fontWeight: '500' }}>{item.title}</Text>
                            {/* <Text style={styleShare.textMainOption}>{item.info}</Text> */}

                        </View>
                    </View>
                </TouchableWithoutFeedback>

            ))}
        </View>
    );
    return (
        <View style={styleShare.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
                <View style={styles.containerTop}>
                    <Avatar.Image
                        source={{ uri: user.avatar }}
                        size={60}
                        style={{ marginLeft: 40, marginRight: 20, backgroundColor: 'white' }}
                    />
                    <View>
                        <Text style={styleShare.titleJobAndName}>{user.username}</Text>
                        <Text >{user.email}</Text>
                    </View>
                </View>
                <View style={styles.containerMain}>
                    <View style={styles.profileItem}>
                        <View style={styleShare.flexBetween}>
                            <View style={styleShare.flexCenter}>
                                <Icon name='sparkles' size={24} color={orange} style={{ marginRight: 15 }} />
                                <Text style={styleShare.titleJobAndName}>Kinh nghiệm làm việc</Text>
                            </View>
                            <TouchableOpacity onPress={() => setModalVisible({ ...modalVisible, experience: true })} >
                                <Icon name="pencil" size={24} color={orange} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.technologyContainer}>
                            {user.seeker.experience ? (
                                <Chip style={styleShare.chip}>{user.seeker.experience}</Chip>
                            ) : (
                                <Text style={styles.defaultText}>Cập nhật kinh ngiệm làm việc</Text>
                            )}
                        </View>
                    </View>
                    {/* <View style={styles.profileItem}>
                        <View style={styleShare.flexBetween}>
                            <View style={styleShare.flexCenter}>
                                <Icon name='location-sharp' size={24} color={orange} style={{ marginRight: 15 }} />
                                <Text style={styleShare.titleJobAndName}>Địa điểm làm việc mong muốn</Text>
                            </View>
                            <TouchableOpacity onPress={() => setModalVisible({ ...modalVisible, location: true })} >
                                <Icon name="pencil" size={24} color={orange} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.technologyContainer}>
                            {user.seeker.location ? (
                                <Chip style={styleShare.chip}>{user.seeker.location}</Chip>
                            ) : (
                                <Text style={styles.defaultText}>Cập nhật địa điểm làm việc</Text>
                            )}
                        </View>
                    </View> */}
                    <View style={styles.profileItem}>
                        <View style={styleShare.flexBetween}>
                            <View style={styleShare.flexCenter}>
                                <Icon name='briefcase' size={24} color={orange} style={{ marginRight: 15 }} />
                                <Text style={styleShare.titleJobAndName}>Kĩ năng</Text>
                            </View>
                            <TouchableOpacity onPress={() => setModalVisible({ ...modalVisible, technology: true })} >
                                <Icon name="pencil" size={24} color={orange} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.technologyContainer}>
                            {user.seeker.technologies && user.seeker.technologies.length > 0 ? (
                                user.seeker.technologies.map(tech => (
                                    <Chip key={tech.id} style={styleShare.chip}>{tech.name}</Chip>
                                ))
                            ) : (
                                <Text style={styles.defaultText}>Cập nhật kĩ năng của bạn</Text>
                            )}
                        </View>
                    </View>
                    <View style={styles.manageJob}>
                        <Text style={[styleShare.titleJobAndName, { marginVertical: 10 }]}>Quản lý việc làm</Text>
                        <ManageJobGrid></ManageJobGrid>
                    </View>
                    <View style={styles.manageJob}>
                        <TouchableWithoutFeedback style={styles.manageJobItem}>
                            <View style={styleShare.flexBetween}>
                                <View style={styleShare.flexCenter}>
                                    <Avatar.Image source={require('../../assets/images/cv.png')} size={50} />
                                    <Text style={{ fontWeight: '500', marginLeft: 15 }}>Hướng dẫn viết CV</Text>
                                </View>
                                <Icon name="chevron-forward-outline" size={24} color={bgButton1} />
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                    <View style={styles.manageJob}>
                        <Text style={[styleShare.titleJobAndName, { marginVertical: 10 }]}>Chính sách và hỗ trợ</Text>
                        {aboutApp.map((item) => (
                            <TouchableWithoutFeedback key={item.id}>
                                <View style={styles.manageJobItem}>
                                    <View style={styleShare.flexBetween}>
                                        <View style={styleShare.flexCenter}>
                                            <Icon name={item.icon} size={24} color={orange} style={{ marginRight: 15 }} />
                                            <Text style={{ fontWeight: '500' }}>{item.title}</Text>
                                        </View>
                                        <Icon name="chevron-forward-outline" size={24} color={bgButton1} />
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>

                        ))}
                    </View>
                    <TouchableOpacity style={styles.manageJob} onPress={() => handleLogout()}>
                        <View style={styleShare.flexCenter}>
                            <Text style={{ fontWeight: '500', fontSize: 16, marginRight: 10, color: 'red' }}>Đăng xuất</Text>
                            <Icon name="exit" size={24} color={'red'} />
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            <ReusableModal
                visible={modalVisible.experience}
                onClose={() => setModalVisible({ ...modalVisible, experience: false })}
                title="Chọn số năm đi làm"
                data={experiences}
                selectedItems={selectExperience ? [selectExperience] : []}
                onItemPress={handleExperienceSelect}
                onComplete={() => {
                    // Gọi hàm update dữ liệu
                    handleUpdateExperience();
                    // Đóng modal sau khi hoàn tất cập nhật
                    setModalVisible({ ...modalVisible, experience: false });
                }}
                singleSelect={true}
            />
            <ReusableModal
                visible={modalVisible.location}
                onClose={() => setModalVisible({ ...modalVisible, location: false })}
                title="Chọn nơi làm việc mong muốn"
                data={province}
                selectedItems={selectedProvince ? [selectedProvince] : []}
                onItemPress={handleProvinceSelect}
                onComplete={() => {
                    // Gọi hàm update dữ liệu
                    handleUpdateLocation();
                    // Đóng modal sau khi hoàn tất cập nhật
                    setModalVisible({ ...modalVisible, location: false });
                }}
                singleSelect={true}
            />
            <ReusableModalId
                visible={modalVisible.technology}
                onClose={() => setModalVisible({ ...modalVisible, technology: false })}
                title="Chọn kĩ năng của bạn"
                data={technologies}
                selectedItems={selectedTechnologies}
                onItemPress={handleTechnologySelect}
                onComplete={() => {
                    handleUpdateTechnology()
                    setModalVisible({ ...modalVisible, technology: false })
                }}
            />
        </View>
    )

}

const styles = StyleSheet.create({
    containerTop: {
        backgroundColor: white,
        marginHorizontal: 20,
        marginTop: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingVertical: 20,
        borderRadius: 10
    },
    containerMain: {
        marginTop: 10
    },
    profileItem: {
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: 10,
        backgroundColor: white
    },
    manageJob: {
        backgroundColor: white,
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginTop: 10
    },
    manageJobItem: {
        paddingVertical: 15
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    gridItem: {
        width: (Dimensions.get('window').width - 50) / 2, // 40 là tổng padding/margin
        padding: 16,
        backgroundColor: grey,
        borderRadius: 8,
        marginBottom: 10
    },
    containerAvatarJob: {
        width: 40,
        height: 40,
        borderRadius: 25,
        backgroundColor: bgButton2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarJob: {
        width: 24,
        height: 24
    },
    technologyContainer: {
        // Container chứa các Chip công nghệ
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10
    },



})