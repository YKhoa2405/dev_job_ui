import React, { useContext, useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, ActivityIndicator, TouchableWithoutFeedback } from "react-native";
import styleShare from "../../assets/theme/style";
import UIHeader from "../../components/UIHeader";
import { bgButton1, bgButton2, bgNotifi, white } from "../../assets/theme/color";
import moment from "moment";
import { Avatar } from "react-native-paper";
import MyContext from "../../config/MyContext";
import { storeDb } from "../../config/Firebase";
import { collection, doc, getDoc, getDocs, orderBy, query, where, querySnapshot, updateDoc, deleteDoc } from "firebase/firestore";
import { ToastMess } from "../../components/ToastMess";
export default function Notification({ navigation }) {
    const [user, dispatch] = useContext(MyContext)
    const [loading, setLoading] = useState(true);
    const [notifi, setNotifi] = useState([]);
    console.log(user)

    useEffect(() => {
        fetchNotifications();
    }, []);

    const formatRelativeTime = (timestamp) => {
        if (!timestamp) return '';

        const now = new Date();
        const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
        const difference = now - date; // Khoảng cách thời gian tính bằng mili giây

        const minutes = Math.floor(difference / (1000 * 60));
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));

        if (days > 0) {
            return `${days} ngày trước`;
        } else if (hours > 0) {
            return `${hours} giờ trước`;
        } else if (minutes > 0) {
            return `${minutes} phút trước`;
        } else {
            return 'Vừa mới';
        }
    };

    const handleSeenNotifi = async (jobId) => {
        const notifiId = `${user.id}_${jobId}`;
        const notificationRef = doc(storeDb, 'notifications', notifiId);

        try {
            await updateDoc(notificationRef, {
                viewed: true
            });
            console.log("Notification marked as viewed.");

            // Điều hướng đến chi tiết công việc
            navigation.navigate('JobDetail', { jobId: jobId });
            fetchNotifications()
        } catch (error) {
            console.error("Error updating notification: ", error);
        }
    };

    const markAllNotificationsAsRead = async () => {
        try {
            // Tạo tham chiếu đến collection 'notifications'
            const notificationsRef = collection(storeDb, 'notifications');

            // Tạo truy vấn để lấy tất cả các thông báo cho seekerId cụ thể
            const q = query(notificationsRef, where('user_rece', '==', user.id), where('viewed', '==', false));

            // Thực hiện truy vấn
            const querySnapshot = await getDocs(q);

            // Cập nhật tất cả các thông báo là đã đọc
            const updatePromises = querySnapshot.docs.map(docSnapshot => {
                const docRef = doc(storeDb, 'notifications', docSnapshot.id);
                return updateDoc(docRef, { viewed: true });
            });

            // Chờ tất cả các cập nhật hoàn tất
            await Promise.all(updatePromises);

            ToastMess({ type: 'success', text1: 'Đánh dấu tất cả thông báo đã đọc.' });
            fetchNotifications()

        } catch (error) {
            console.error("Error marking all notifications as read: ", error);
        } finally {
            setLoading(false)
        }
    };

    const handleDeleteNotifi = async (jobId) => {
        const notifiId = `${user.id}_${jobId}`;
        const notificationRef = doc(storeDb, 'notifications', notifiId);

        try {
            await deleteDoc(notificationRef, {
                viewed: true
            });
            fetchNotifications()
        } catch (error) {
            console.error("Error updating notification: ", error);
        } finally {
            setLoading(false)
        }
    };

    const fetchNotifications = async () => {
        try {
            const notificationsRef = collection(storeDb, 'notifications');

            const q = query(notificationsRef, where('user_rece', '==', user.id), orderBy('time', 'desc'));
            const querySnapshot = await getDocs(q);

            // Ánh xạ dữ liệu document thành một mảng
            const notificationsList = querySnapshot.docs.map(doc => ({
                id: doc.id,  // Lưu cả id của document
                ...doc.data()
            }));

            // Cập nhật state với danh sách thông báo
            setNotifi(notificationsList);
            console.log(notifi)
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <ActivityIndicator style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} size="large" color='orange' />;
    }

    const renderItem = ({ item }) => (
        <TouchableWithoutFeedback onPress={() => handleSeenNotifi(item.jobId)}>
            <View>
                <View style={[styles.notification, item.viewed && styles.viewedNotification]}>
                    <View style={{ marginEnd: 15 }}>
                        <Avatar.Image source={{uri:item.avatar}} size={40} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styleShare.titleJobAndName} ellipsizeMode="tail" numberOfLines={2}>{item.title}</Text>
                        <Text style={{ marginTop: 5 }} ellipsizeMode="tail" numberOfLines={2}>{item.message}</Text>
                        <View style={[styleShare.flexBetween, { marginTop: 10, flex: 1 }]}>
                            <Text style={{ color: 'grey' }}>{formatRelativeTime(item.time)}</Text>
                            <TouchableOpacity onPress={() => handleDeleteNotifi(item.jobId)}>
                                <Text style={{ color: 'red', fontWeight: '500' }}>Xóa</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );

    return (
        <View style={styleShare.container}>
            <UIHeader title={'Thông báo'}
                rightIcon={'checkmark-done-outline'}
                handleRightIcon={() => markAllNotificationsAsRead()} />
            <View>
                <FlatList
                    data={notifi} // Dữ liệu sẽ hiển thị
                    keyExtractor={item => item.id} // Khoá duy nhất cho mỗi item
                    renderItem={renderItem} // Hàm hiển thị mỗi item
                    ListEmptyComponent={
                        <View style={{ marginTop: 50, alignItems: 'center' }}>
                            <Image source={require("../../assets/images/save.png")} style={styleShare.imageNullData} />
                            <Text style={styleShare.textMainOption}>Không có thông báo nào </Text>
                            <Text style={{ padding: 20, textAlign: 'center' }}>Bạn chưa có bất kỳ thông báo nào, kiểm tra lại sau</Text>
                        </View>
                    }
                />
            </View>
        </View>
    )

}

const styles = StyleSheet.create({
    notification: {
        backgroundColor: bgNotifi,
        paddingHorizontal: 18,
        paddingVertical: 10,
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: 'white'
    },

    viewedNotification: {
        backgroundColor: white
    }
})