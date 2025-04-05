import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import UIHeader from "../../components/UIHeader";
import Loading from "../../components/Loading";
import StyleShare from "../../assets/themes/StyleShare";
import { textColor, white } from "../../assets/themes/Color";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi, endpoints } from "../../assets/config/API";
import { ToastMess } from "../../components/ToastMess";

const Notification = ({ navigation, route }) => {
  const { userId } = route.params;
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchNotifications = async (page = 1, limit = 20) => {
    if (page === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const token = await AsyncStorage.getItem("access_token");
      const res = await authApi(token).get(endpoints['notificationsByUser'](userId), {
        params: { page, limit },
      });
      const data = res.data.data;
      if (page === 1) {
        setNotifications(data.result);
      } else {
        setNotifications((prev) => [...prev, ...data.result]);
      }
      setCurrentPage(data.meta.currentPage);
      setTotalPages(data.meta.totalPages);
      setTotalItems(data.meta.totalItems);
    } catch (error) {
      console.log("Error fetching notifications:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  const loadMoreNotifications = () => {
    if (currentPage < totalPages && !loadingMore) {
      fetchNotifications(currentPage + 1);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      await authApi(token).patch(endpoints['notificationDetail'](notificationId), { isRead: true });

      // Cập nhật state cục bộ
      setNotifications((prev) =>
        prev.map((item) =>
          item._id === notificationId ? { ...item, isRead: true } : item
        )
      );
    } catch (error) {
      console.log("Error marking notification as read:", error);
    }
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationItem, item.isRead ? styles.read : styles.unread]}
      onPress={() => handleNotificationPress(item)}
    >
      <Text style={StyleShare.titleText16}>{item.title}</Text>
      <Text style={styles.message}>{item.message}</Text>
      <Text style={styles.time}>
        {new Date(item.createdAt).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  const handleNotificationPress = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id); // Đánh dấu đã đọc nếu chưa đọc
    }

    // Chuyển hướng dựa trên loại thông báo
    if (notification.type === 'NEW_JOB') {
      navigation.navigate('JobDetail', { jobId: notification.data.jobId });
    } else if (notification.type === 'NEW_APPLICATION') {
      navigation.navigate('ResumeByJob', { jobId: notification.data.jobId });
    }
  };

  const handleDeleteAllNotifications = async () => {
    Alert.alert(
      "Xóa tất cả thông báo",
      "Bạn có chắc chắn muốn xóa tất cả thông báo không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đồng ý",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("access_token");
              await authApi(token).delete(endpoints['notificationsByUser'](userId));
              setNotifications([]);
              setTotalItems(0);
              ToastMess({ type: "success", text1: "Đã xóa tất cả thông báo thành công" });
            } catch (error) {
              ToastMess({ type: "error", text1: "Có lỗi xảy ra, vui lòng thử lại" });
              console.log(error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={StyleShare.container}>
      <UIHeader
        leftIcon={"arrow-back"}
        rightIcon={"flash-off-outline"}
        title={"Thông báo"}
        handleLeftIcon={() => navigation.goBack()}
        handleRightIcon={handleDeleteAllNotifications}
      />
      {loading ? (
        <Loading />
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item._id} // Sử dụng _id làm key
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Image
                source={require("../../assets/images/save.png")}
                style={StyleShare.imageNullData}
              />
              <Text style={StyleShare.titleText20}>Không có thông báo nào</Text>
              <Text style={{ padding: 20, textAlign: 'center' }}>
                BẠn chưa có bất kỳ thông báo nào, hãy quay lại sau.
              </Text>
            </View>
          }
          onEndReached={loadMoreNotifications}
          onEndReachedThreshold={0.7}
          ListFooterComponent={loadingMore ? <Loading /> : null}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 10,
  },
  notificationItem: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
  },
  read: {
    backgroundColor: white,
  },
  unread: {
    backgroundColor: "#e0f7fa",
  },
  message: {
    fontSize: 14,
    color: textColor,
    marginTop: 5,
  },
  time: {
    fontSize: 12,
    color: "#999",
    marginTop: 5,
  },
  emptyContainer: {
    marginTop: 50,
    alignItems: "center",
  },
});

export default Notification;