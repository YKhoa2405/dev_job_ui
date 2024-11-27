import React, { useContext, useEffect, useState } from "react";
import { View, ScrollView, Text, StyleSheet, TouchableWithoutFeedback, Image, ActivityIndicator, FlatList, TouchableOpacity, Linking, Alert } from "react-native";
import styleShare from "../../assets/theme/style";
import UIHeader from "../../components/UIHeader";
import Icon from "react-native-vector-icons/Ionicons"
import moment from "moment";
import 'moment/locale/vi';
import { Chip } from "react-native-paper";
import { bgButton1, bgButton2, grey, orange, white } from "../../assets/theme/color";
import { authApi, endpoints } from "../../config/API";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MyContext from "../../config/MyContext";
import { ToastMess } from "../../components/ToastMess";
import { addDoc, collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { storeDb } from "../../config/Firebase";
import * as WebBrowser from 'expo-web-browser';

export default function CVApplyNew({ navigation }) {
    const [cv, setCv] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, dispatch] = useContext(MyContext)
    const [currentPage, setCurrentPage] = useState(1);

    moment.locale('vi');


    const handleOpenEmail = (email) => {
        Linking.openURL(`mailto:${email}`).catch(err => console.error("Failed to open email:", err));
    };

    const handleOpenCv = async (url) => {
        // Linking.openURL(url).catch(err => console.error("Failed to open URL:", err));
        await WebBrowser.openBrowserAsync(url);
    }

    useEffect(() => {
        fetchApplicationCVNew()
    }, []);

    const sendNotificationToApplicant = async (seekerId, jobId) => {
        try {
            const notifiId = `${seekerId}_${jobId}`;
            const notificationRef = doc(storeDb, 'notifications', notifiId);

            // Thêm hoặc cập nhật một document vào collection 'notifications'
            await setDoc(notificationRef, {
                notifiId: notifiId,
                user_rece: seekerId,
                jobId: jobId,  // ID của bản ghi ứng tuyển
                title: 'Nhà tuyển dụng đã chấp nhận hồ sơ của bạn.',
                message: user.employer.company_name,
                time: serverTimestamp(),
                viewed: false,
                employerId: user.id,
                avatar: user.avatar
            });

            console.log("Notification added successfully.");
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    };

    const fetchApplicationCVNew = async (page = 1) => {
        try {
            const token = await AsyncStorage.getItem("access-token");
            const res = await authApi(token).get(endpoints['apply_list_new'], {
                params: {
                    page: page, // Sử dụng page truyền vào
                },
            });
            setCv(prevJobs => [...prevJobs, ...res.data.results]);
            console.log(res.data);
            if (res.data.next) {
                setCurrentPage(page); // Cập nhật trang hiện tại
            } else {
                setCurrentPage(null); // Không có trang tiếp theo
            }
        } catch (error) {
            console.error("Error fetching jobs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        const nextPage = currentPage + 1; // Tăng trang lên 1
        setCurrentPage(nextPage); // Cập nhật trang hiện tại
        fetchApplicationCVNew(nextPage); // Tải công việc từ trang mới
    };
    const handleUpdateStatus = async (applyId, status, seekerId, jobId) => {
        Alert.alert(
            "Cập nhật đơn ứng tuyển",
            "Bạn có chắc chắn muốn cập nhật trạng thái không?",
            [
                {
                    text: "Hủy",
                    style: "cancel"
                },
                {
                    text: "Đồng ý",
                    onPress: async () => {
                        try {
                            setLoading(true);
                            const token = await AsyncStorage.getItem("access-token");

                            await authApi(token).patch(endpoints['apply_update_status'](applyId), { status: status });
                            ToastMess({ type: 'success', text1: 'Cập nhật thành công.' });
                            sendNotificationToApplicant(seekerId, jobId)

                        } catch (error) {
                            console.log("Error updating status:", error);
                            ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại.' });

                        } finally {
                            setLoading(false);
                        }
                    },
                    style: "destructive"
                }
            ],
            { cancelable: true }
        );
    };



    const renderItem = ({ item }) => {
        const getStatusInfo = (status) => {
            switch (status) {
                case 'PENDING':
                    return { text: 'Chờ xử lý', style: { color: bgButton1 } }; // Màu cho trạng thái chờ xử lý
                case 'CLOSED':
                    return { text: 'Đã từ chối', style: { color: 'red' } }; // Màu cho trạng thái đã từ chối
                case 'OPEN':
                    return { text: 'Đã đồng ý', style: { color: 'green' } }; // Màu cho trạng thái đã đồng ý
                default:
                    return { text: 'Trạng thái không xác định', style: { color: 'gray' } }; // Màu cho trạng thái không xác định
            }
        };
        const statusInfo = getStatusInfo(item.status);
        return (
            <TouchableWithoutFeedback>
                <View style={styles.jobItemContainer}>
                    <View style={styleShare.flexBetween}>
                        <Text style={styleShare.titleJobAndName}>{item.job.title}</Text>
                        {item.status === 'PENDING' ? (
                            <View style={styleShare.flexCenter}>
                                <TouchableOpacity onPress={() => handleUpdateStatus(item.id, 'OPEN', item.seeker_info.id, item.job.id)}>
                                    <Icon name="checkmark-circle-sharp" size={24} color={'green'} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleUpdateStatus(item.id, 'CLOSED', item.seeker_info.id, item.job.id)} style={{ marginLeft: 10 }}>
                                    <Icon name="close-circle-outline" size={24} color={'red'} />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View>
                            </View>
                        )}

                    </View>
                    <View style={{ marginTop: 5 }}>
                        <TouchableOpacity onPress={() => handleOpenEmail(item.seeker_info.email)}>
                            <Text>Email: <Text style={{ color: bgButton1, textDecorationLine: 'underline' }} >{item.email}</Text></Text>


                        </TouchableOpacity>
                        <Text>Họ và tên: <Text style={{ color: bgButton1 }}>{item.name}</Text></Text>
                        <Text>Số điện thoại: <Text style={{ color: bgButton1 }}>{item.phone}</Text></Text>

                    </View>
                    <View style={{ marginVertical: 5 }}>
                        <Text style={{ color: bgButton1, fontWeight: '500' }}>Thư giới thiệu:</Text>

                        <Text>{item.cover_letter}</Text>
                    </View>
                    <View style={styleShare.flexBetween}>
                        <View style={styleShare.flexCenter}>
                            <Icon name="time" size={22} color={'grey'} style={{ marginRight: 5 }} />
                            <Text>{moment(item.created_at).format('DD/MM/YYYY')}</Text>
                        </View>

                        <Text style={[styleShare.titleJobAndName, statusInfo.style]}>
                            {statusInfo.text}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => handleOpenCv(item.cv)}>
                        <View style={[styleShare.buttonDetailApply, { marginTop: 10 }]}>
                            <Icon name="document-outline" size={22} />
                            <Text style={{ marginLeft: 5 }}>Xem CV ứng viên</Text>
                        </View>
                    </TouchableOpacity>
                </View>

            </TouchableWithoutFeedback>
        )
    };

    if (loading) {
        return <ActivityIndicator style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} size="large" color='orange' />;
    }

    return (
        <View style={styleShare.container}>
            <UIHeader leftIcon={"arrow-back"}
                rightIcon={"ellipsis-horizontal"}
                title={'CV ứng tuyển mới'}
                handleLeftIcon={() => { navigation.goBack() }} />
            <FlatList
                data={cv}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                ListEmptyComponent={
                    <View style={{ marginTop: 50, alignItems: 'center' }}>
                        <Image source={require("../../assets/images/save.png")} style={styleShare.imageNullData} />
                        <Text style={styleShare.textMainOption}>Chưa có đơn ứng tuyển mới nào </Text>
                        <Text style={{ padding: 20, textAlign: 'center' }}>Bạn chưa có đơn ứng tuyển nào gần đây, hãy đăng bài tuyển dụng để tìm kiếm ứng viên tìm năng</Text>
                    </View>
                }
                contentContainerStyle={{ paddingBottom: 40, paddingTop: 10 }}
                ListFooterComponent={
                    <View style={{ alignItems: 'center', marginVertical: 20 }}>
                        {currentPage ? (
                            <TouchableOpacity onPress={handleLoadMore} disabled={loading}>
                                <Text style={{ color: bgButton1, fontSize: 16, fontWeight: '500' }}>Xem thêm</Text>
                            </TouchableOpacity>
                        ) : (
                            <Text style={{ color: 'grey', fontSize: 16, fontWeight: 'bold' }}></Text>
                        )}
                    </View>}
            />



        </View>
    )
}

const styles = StyleSheet.create({
    jobItemContainer: {
        backgroundColor: white,
        borderRadius: 20,
        padding: 15,
        backgroundColor: white,
        marginTop: 15,
        marginHorizontal: 20
    },

    technologyContainer: {
        // Container chứa các Chip công nghệ
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10
    },
})