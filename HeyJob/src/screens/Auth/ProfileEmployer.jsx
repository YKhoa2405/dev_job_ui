import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity, TouchableWithoutFeedback, ActivityIndicator, Linking, FlatList } from "react-native";
import { bgButton1, bgButton2, grey, orange, textColor, white } from "../../assets/theme/color";
import { Avatar, Chip, IconButton } from "react-native-paper";
import styleShare from "../../assets/theme/style";
import UIHeader from "../../components/UIHeader";
import Icon from "react-native-vector-icons/Ionicons";
import MyContext from "../../config/MyContext";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi, endpoints } from "../../config/API";
import moment from "moment";
import { ToastMess } from "../../components/ToastMess";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { storeDb } from "../../config/Firebase";



export default function ProfileEmployer({ navigation, route }) {
    const { employerId } = route.params
    const Tab = createMaterialTopTabNavigator();
    const [loading, setLoading] = useState(true);
    const [employer, setEmployer] = useState('');
    const [user, dispatch] = useContext(MyContext)


    useEffect(() => {
        fetchEmployerDetail()
        // fetchJobsByEmployer()
    }, [])
    const handleOpenEmail = (email) => {
        Linking.openURL(`mailto:${email}`).catch(err => console.error("Failed to open email:", err));
    };
    const fetchEmployerDetail = async () => {
        const token = await AsyncStorage.getItem("access-token");
        const res = await authApi(token).get(endpoints['employer_detail'](employerId));
        setEmployer(res.data)
        setLoading(false)

    }

    const sendNotificationFollow = async () => {
        try {
            const notifiId = `${employerId}_${user.id}`;
            const notificationRef = doc(storeDb, 'notifications', notifiId);

            // Thêm hoặc cập nhật một document vào collection 'notifications'
            await setDoc(notificationRef, {
                notifiId: notifiId,
                seekerId: user.id,
                type: 'Follow',
                title: 'đã theo dõi công ty.',
                message: user.username,
                time: serverTimestamp(),
                viewed: false,
                user_rece: employerId,
                avatar: 'https://res.cloudinary.com/dsbebvfff/image/upload/w_1000,c_fill,ar_1:1,g_auto,r_max,bo_5px_solid_black,b_rgb:262c35/v1725551994/cbvu237ir12k7pjdytar.png'
            });

            console.log("Notification added successfully.");
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    };

    const handleFollow = async () => {
        try {
            const token = await AsyncStorage.getItem("access-token");
            const res = await authApi(token).post(endpoints['follow'](employerId));

            // Kiểm tra phản hồi và hiển thị thông báo tương ứng
            if (res.status === 200 || res.status === 201) {
                ToastMess({ type: 'success', text1: 'Theo dõi thành công.' });
                sendNotificationFollow()
            } else {
                ToastMess({ type: 'error', text1: 'Có lỗi xảy ra khi theo dõi.' });
            }
        } catch (error) {
            setLoading(false);
            ToastMess({ type: 'error', text1: 'Có lỗi xảy ra. Vui lòng thử lại.' });
            console.error('Lỗi khi theo dõi:', error);
        }
    };

    const handleLocationPress = () => {
        const address = encodeURIComponent(employer.employer.address);
        const url = `https://www.google.com/maps/search/?api=1&query=${address}`; // Google Maps

        Linking.canOpenURL(url)
            .then((supported) => {
                if (supported) {
                    return Linking.openURL(url);
                } else {
                    console.log("Don't know how to open URI: " + url);
                }
            })
            .catch((err) => console.error('An error occurred', err));
    };



    if (loading) {
        return <ActivityIndicator style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} size="large" color='orange' />;
    }

    const renderItem = ({ item }) => {
        return (
            <TouchableWithoutFeedback key={item.id} onPress={() => { navigation.navigate('JobDetail', { jobId: item.id }) }}>
                <View style={styles.jobItemContainer}>
                    {item.is_saved ?
                        <View style={styles.btnSave}>
                            <Icon name="bookmark" size={26} color={orange} />
                        </View> :
                        <View style={styles.btnSave}>
                            <Icon name="bookmark-outline" size={26} />
                        </View>
                    }
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={styles.containerAvatarJob}>
                            <Avatar.Image source={{ uri: item.employer.avatar }} size={36} style={{ backgroundColor: 'white' }} />
                        </View>
                        <View>
                            <Text style={styleShare.titleJobAndName}>{item.title}</Text>
                            <Text style={{ marginTop: 5 }}>{item.employer.employer.company_name}</Text>
                        </View>
                    </View>
                    <View style={styleShare.technologyContainer}>
                        <Chip style={styleShare.chip}>{item.location}</Chip>
                        <Chip style={styleShare.chip}>{`${item.salary} VND`}</Chip>
                        <Chip style={styleShare.chip}>{item.experience}</Chip>
                        {item.technologies.map((tech, index) => (
                            <Chip key={index} style={styleShare.chip}>
                                {tech.name}
                            </Chip>
                        ))}
                    </View>
                    <View style={styleShare.flexBetween}>
                        <View style={styleShare.flexCenter}>
                            <Icon name="time" size={22} color={'grey'} style={{ marginRight: 5 }} />
                            <Text>{moment(item.expiration_date).format('DD/MM/YYYY')}</Text>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        )
    };

    const ProfileTab1 = () => (
        <View style={{ paddingHorizontal: 20, backgroundColor: white, flex: 1 }}>
            <Text style={[styleShare.titleJobAndName, { marginTop: 10 }]}>Giới thiệu công ty</Text>
            <Text style={{ color: textColor, marginTop: 5 }}>{employer.employer.description}</Text>
            <Text style={[styleShare.titleJobAndName, { marginTop: 10 }]}>Website</Text>
            <TouchableOpacity onPress={() => handleOpenWebsite(employer.employer.website)}>
                <Text style={{ color: orange, marginTop: 5 }}>{employer.employer.website}</Text>
            </TouchableOpacity>
            <Text style={[styleShare.titleJobAndName, { marginTop: 10 }]}>Email</Text>
            <TouchableOpacity onPress={() => handleOpenEmail(employer.email)}>
                <Text style={{ color: orange, marginTop: 5 }}>{employer.email}</Text>
            </TouchableOpacity>
            <Text style={[styleShare.titleJobAndName, { marginTop: 10 }]}>Địa chỉ công ty</Text>
            <Text style={{ color: textColor, marginTop: 5 }}>{employer.employer.address}</Text>
            <TouchableOpacity style={styleShare.buttonDetailApply} onPress={() => handleLocationPress()}>
                <Text style={{ color: textColor, marginTop: 5 }}><Text style={{ fontWeight: '500', color: bgButton1 }}>Xem địa chỉ trên Map</Text></Text>
            </TouchableOpacity>
        </View>
    );
    const ProfileTab2 = () => {
        const [loading, setLoading] = useState(true);
        const [jobs, setJobs] = useState([]);

        (
            useEffect(() => {
                const fetchJobs = async () => {
                    try {
                        const token = await AsyncStorage.getItem("access-token");
                        const res = await authApi(token).get(endpoints['job_by_employer'](employerId));
                        setJobs(res.data);
                    } catch (error) {
                        console.error('Error fetching jobs:', error);
                    } finally {
                        setLoading(false);
                    }
                };

                fetchJobs();
            }, [employerId])
        );

        return (
            <View style={{ flex: 1 }}>
                {loading ? (
                    <ActivityIndicator style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} size="large" color='orange' />
                ) : (
                    <FlatList
                        data={jobs}
                        renderItem={renderItem}
                        keyExtractor={item => item.id.toString()}
                        ListEmptyComponent={
                            <View style={{ marginTop: 50, alignItems: 'center' }}>
                                <Image source={require("../../assets/images/save.png")} style={styleShare.imageNullData} />
                                <Text style={styleShare.textMainOption}>Hiện tại chưa có tin tuyển dụng nào</Text>
                                <Text style={{ padding: 20, textAlign: 'center' }}>Công ty hiện tại chưa có tin tuyển dụng nào, hãy quay lại lần sau để cập nhật</Text>
                            </View>
                        }
                        contentContainerStyle={{ paddingBottom: 40, paddingTop: 10 }}
                    />
                )}
            </View>
        );

    };


    return (
        <View style={styleShare.container}>
            <UIHeader leftIcon={"arrow-back"}
                handleLeftIcon={() => { navigation.goBack() }} />

            <View style={styles.containerTop}>
                <View style={styleShare.containerAvatar}>
                    <Avatar.Image source={{ uri: employer.avatar }} size={60} style={{ backgroundColor: 'white' }} />
                </View>
                <Text style={styleShare.titleJobAndName}>{employer.employer.company_name}</Text>
                <View style={[styleShare.flexBetween, { marginTop: 10 }]}>
                    <View style={[styleShare.flexCenter, { flex: 1 }]}>
                        <Icon name="people-outline" size={18} />
                        <Text style={{ marginLeft: 5, fontSize: 12, fontWeight: '500' }}>{employer.employer.followers_count} người theo dõi</Text>
                    </View>
                    <View style={[styleShare.flexCenter, { flex: 1 }]}>
                        <Icon name="business-outline" size={18} />
                        <Text style={{ marginLeft: 5, fontSize: 12, fontWeight: '500' }}>{employer.employer.size} nhân viên</Text>
                    </View>
                </View>
            </View>
            <View style={styles.containerMain}>
                <View style={[styleShare.flexCenter, { marginHorizontal: 20 }]}>
                    <TouchableOpacity onPress={() => handleFollow()} style={{ marginRight: 20 }}>
                        <View style={[styleShare.buttonDetailApply, { backgroundColor: white }]}>
                            <Icon name="add-circle-outline" size={22} />
                            <Text style={{ marginLeft: 5 }}>Theo dõi công ty</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate("ChatDetail", {
                        userInfo: {
                            id: String(employer.id),
                        }
                    })}>
                        <View style={[styleShare.buttonDetailApply, { backgroundColor: white }]}>
                            <Icon name="chatbubble-outline" size={22} />
                            <Text style={{ marginLeft: 5 }}>Nhắn tin</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 1, marginTop: 10 }}>
                    <Tab.Navigator
                        screenOptions={{
                            tabBarActiveTintColor: orange, // Color of the selected tab
                            tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold' }, // Style for tab labels
                            tabBarIndicatorStyle: { backgroundColor: orange }, // Style for the indicator of the selected tab
                            tabBarStyle: { backgroundColor: grey },
                        }}>
                        <Tab.Screen name="Giới thiệu công ty" component={ProfileTab1} />
                        <Tab.Screen name={'Tin tuyển dụng'} component={ProfileTab2} />
                    </Tab.Navigator>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    containerTop: {
        alignItems: 'center',
        backgroundColor: white,
        marginTop: 25,
        paddingTop: 45,
        paddingBottom: 15,
        paddingHorizontal: 20
    },
    containerMain: {
        flex: 1
    },
    containerAvatarJob: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: bgButton2,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15
    },
    avatarJob: {
        width: 30,
        height: 30
    },
    btnSave: {
        position: 'absolute',
        top: 20,
        right: 20,
        opacity: 0.8,
        zIndex: 999
    },
    jobItemContainer: {
        backgroundColor: white,
        borderRadius: 20,
        padding: 20,
        backgroundColor: white,
        marginTop: 10,
        marginHorizontal: 20
    },

})
