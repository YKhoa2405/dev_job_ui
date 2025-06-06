import {
    StyleSheet,
    View,
    Text,
    Image,
    TouchableOpacity,
    TouchableWithoutFeedback,
    ActivityIndicator,
    Linking,
    ScrollView,
    FlatList,
    TextInput,
} from "react-native";
import StyleShare from "../../assets/themes/StyleShare";
import { mainColor, bgButton2, grey, orange, textColor, white } from "../../assets/themes/Color";
import { Avatar, Chip } from "react-native-paper";
import UIHeader from "../../components/UIHeader";
import Icon from "react-native-vector-icons/Ionicons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi, endpoints } from "../../assets/config/API";
import Loading from "../../components/Loading";
import moment from "moment";
import { ToastMess } from "../../components/ToastMess";
import { useSelector } from "react-redux";
import Input from "../../components/Input";

export default function CompanyDetail({ navigation, route }) {
    const { _id } = route.params;
    const [loading, setLoading] = useState(true);
    const [companyDetail, setCompanyDetail] = useState(null);
    const [saved, setSaved] = useState(false);
    const user = useSelector((state) => state.user.user);
    const Tab = createMaterialTopTabNavigator();

    useEffect(() => {
        fetchCompanyDetail();
        checkFollowStatus();
    }, [_id]);

    const getToken = async () => await AsyncStorage.getItem("access_token");

    const fetchCompanyDetail = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const res = await authApi(token).get(endpoints['companiesDetail'](_id));
            setCompanyDetail(res.data.data);
        } catch (error) {
            console.error('Error fetching company detail:', error);
            ToastMess({ type: 'error', text1: 'Không thể tải thông tin công ty.' });
        } finally {
            setLoading(false);
        }
    };

    const checkFollowStatus = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const res = await authApi(token).get(endpoints['followSaved'](_id));
            setSaved(res.data.data.saved);
        } catch (error) {
            console.error('Error checking follow status:', error);
            ToastMess({ type: 'error', text1: 'Không thể kiểm tra trạng thái theo dõi.' });
        } finally {
            setLoading(false);
        }
    };

    const handleFollowToggle = async () => {
        try {
            const token = await getToken();
            if (saved) {
                await authApi(token).delete(endpoints['followDetail'](_id));
                ToastMess({ type: 'success', text1: 'Đã hủy theo dõi.' });
            } else {
                await authApi(token).post(endpoints['follows'], { companyId: _id });
                ToastMess({ type: 'success', text1: 'Đã theo dõi công ty.' });
            }
            setSaved(!saved);
        } catch (err) {
            ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại.' });
        }
    };

    const handleOpenWebsite = (url) => {
        if (!url) return;
        const formattedUrl = url.match(/^(https?:\/\/)/) ? url : `https://${url}`;
        Linking.openURL(formattedUrl).catch(() => {
            ToastMess({ type: 'error', text1: 'Không thể mở website.' });
        });
    };

    const handleLocationPress = async () => {
        const address = companyDetail?.address;
        if (!address) return;
        const encodedAddress = encodeURIComponent(address);
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
        const supported = await Linking.canOpenURL(mapUrl);
        if (supported) {
            await Linking.openURL(mapUrl);
        } else {
            ToastMess({ type: 'error', text1: 'Không thể mở bản đồ.' });
        }
    };

    const ProfileTab1 = () => {
        const [reviews, setReviews] = useState([]);
        const [rating, setRating] = useState(0);
        const [comment, setComment] = useState("");
        const [submitting, setSubmitting] = useState(false);

        useEffect(() => {
            fetchReviews();
        }, []);

        const fetchReviews = async () => {
            try {
                const token = await getToken();
                const res = await authApi(token).get(endpoints['reviewsCompany'](_id));
                setReviews(res.data.data);
            } catch (error) {
                console.error('Error fetching reviews:', error);
                ToastMess({ type: 'error', text1: 'Không thể tải đánh giá.' });
            }
        };

        const handleSubmitReview = async () => {
            if (rating < 1 || rating > 5) {
                ToastMess({ type: 'error', text1: 'Vui lòng chọn số sao từ 1 đến 5.' });
                return;
            }
            if (!comment.trim()) {
                ToastMess({ type: 'error', text1: 'Vui lòng nhập bình luận.' });
                return;
            }
            setSubmitting(true);

            try {
                const token = await getToken();
                await authApi(token).post(endpoints['reviews'], {
                    rating,
                    comment,
                    companyId: _id,
                });
                await Promise.all([fetchReviews(), fetchCompanyDetail()]); // Sync with server

                ToastMess({ type: 'success', text1: 'Đánh giá đã được gửi.' });
                setRating(0);
                setComment("");
            } catch (error) {
                ToastMess({ type: 'error', text1: error.response?.data?.message || 'Không thể gửi đánh giá.' });
            } finally {
                setSubmitting(false);
            }
        };

        const handleDeleteReview = async (reviewId) => {
            try {
                const token = await getToken();
                await authApi(token).delete(endpoints['deleteReview'](reviewId), {
                    data: { companyId: _id }
                });
                ToastMess({ type: 'success', text1: 'Đã xóa đánh giá.' });
                await Promise.all([fetchReviews(), fetchCompanyDetail()]); // Sync with server
            } catch (error) {
                ToastMess({ type: 'error', text1: error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.' });
            }
        };


        const renderStars = (rating, editable = false, onStarPress = null) => {
            const stars = [];
            for (let i = 1; i <= 5; i++) {
                stars.push(
                    <TouchableOpacity
                        key={i}
                        onPress={() => editable && onStarPress(i)}
                        disabled={!editable}
                        accessibilityLabel={`Chọn ${i} sao`}
                        accessibilityRole="button"
                    >
                        <Icon
                            name={i <= rating ? "star" : "star-outline"}
                            size={editable ? 24 : 16}
                            color={orange}
                            style={{ marginRight: editable ? 5 : 2 }}
                        />
                    </TouchableOpacity>
                );
            }
            return stars;
        };

        const renderReviewItem = (item) => (
            <View key={item._id} style={styles.reviewItemContainer}>
                <View style={StyleShare.flexBetween}>
                    <View style={StyleShare.flexCenter}>
                        <View >
                            <Text style={StyleShare.titleText16}>{item.user?.name || 'Ẩn danh'}</Text>
                            <View style={StyleShare.flexCenter}>
                                {renderStars(item.rating)}
                                <Text style={{ marginLeft: 5, fontSize: 12, color: textColor }}>
                                    {moment(item.createdAt).format("DD/MM/YYYY HH:mm")}
                                </Text>
                            </View>
                        </View>
                    </View>
                    {item.user?._id === user._id && (
                        <TouchableOpacity
                            onPress={() => handleDeleteReview(item._id)}
                            accessibilityLabel="Xóa đánh giá"
                            accessibilityRole="button"
                        >
                            <Icon name="trash-outline" size={20} color={'red'} />
                        </TouchableOpacity>
                    )}
                </View>
                <Text style={{ color: textColor, marginTop: 5, fontSize: 14 }}>
                    {item.comment || 'Không có đánh giá nào.'}
                </Text>
            </View>
        );

        return (
            <ScrollView>
                <View style={styles.containerProfileTab1}>
                    <Text style={[StyleShare.titleText16, { marginTop: 20 }]}>Giới thiệu công ty</Text>
                    <Text style={{ color: textColor, marginTop: 5 }}>{companyDetail?.about || 'Chưa có thông tin.'}</Text>

                    <Text style={[StyleShare.titleText16, { marginTop: 20 }]}>Đánh giá công ty</Text>
                    <View style={[{ marginTop: 5, alignItems: 'flex-start' }]}>
                        <View style={StyleShare.flexCenter}>
                            {renderStars(Math.round(companyDetail?.averageRating || 0))}
                            <Text style={{ marginLeft: 5, fontSize: 14, fontWeight: '500' }}>
                                {companyDetail?.averageRating?.toFixed(1) || 0} ({companyDetail?.reviewCount || 0} lượt đánh giá)
                            </Text>
                        </View>
                    </View>
                    <Text style={[StyleShare.titleText16, { marginTop: 20 }]}>Lĩnh vực hoạt động</Text>
                    <Text style={{ color: textColor, marginTop: 5 }}>{companyDetail?.field || 'Chưa có thông tin.'}</Text>

                    <Text style={[StyleShare.titleText16, { marginTop: 10 }]}>Website</Text>
                    <TouchableOpacity onPress={() => handleOpenWebsite(companyDetail?.website)}>
                        <Text style={{ color: orange, marginTop: 5 }}>{companyDetail?.website || 'Chưa có website.'}</Text>
                    </TouchableOpacity>

                    <Text style={[StyleShare.titleText16, { marginTop: 10 }]}>Địa chỉ công ty</Text>
                    <Text style={{ color: textColor, marginTop: 5 }}>{companyDetail?.address || 'Chưa có địa chỉ.'}</Text>
                    <TouchableOpacity style={StyleShare.buttonDetailApply} onPress={handleLocationPress}>
                        <Text style={{ fontWeight: '500', color: mainColor }}>Xem địa chỉ trên Map</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.containerProfileTab1}>
                    <Text style={StyleShare.titleText16}>Gửi đánh giá của bạn</Text>
                    <View style={styles.reviewForm}>
                        <View style={[StyleShare.flexCenter, { marginVertical: 10 }]}>
                            {renderStars(rating, true, setRating)}
                        </View>
                        <Input
                            placeholder="Nhập nội dung của bạn..."
                            value={comment}
                            onChangeText={setComment}
                            multiline
                            numberOfLines={4}
                            maxLength={500}
                            accessibilityLabel="Nhập nội dung đánh giá"
                        />
                        <Text style={{ color: textColor, fontSize: 12, marginVertical: 5 }}>
                            {comment.length}/500
                        </Text>
                        <TouchableOpacity
                            style={[StyleShare.buttonDetailApply, { backgroundColor: submitting ? grey : orange }]}
                            onPress={handleSubmitReview}
                            disabled={submitting}
                            accessibilityLabel="Gửi đánh giá"
                            accessibilityRole="button"
                        >
                            <Text style={{ color: white, fontWeight: '500' }}>
                                {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.containerProfileTab1}>
                    <Text style={StyleShare.titleText16}>Danh sách đánh giá</Text>
                    {reviews?.length > 0 ? (
                        <View style={{ marginTop: 10 }}>
                            {reviews.map((item) => renderReviewItem(item))}
                        </View>
                    ) : (
                        <Text style={{ color: textColor, marginTop: 5 }}>Chưa có đánh giá nào.</Text>
                    )}

                </View>

            </ScrollView>
        );
    };

    const ProfileTab2 = () => {
        const [jobData, setJobData] = useState([]);
        const [currentPage, setCurrentPage] = useState(1);
        const [totalPages, setTotalPages] = useState(1);
        const [totalItems, setTotalItems] = useState(0);
        const [loading, setLoading] = useState(false);
        const [loadingMore, setLoadingMore] = useState(false);

        useEffect(() => {
            fetchJobByCompany(1);
        }, []);

        const fetchJobByCompany = async (page = 1, limit = 10) => {
            if (page === 1) setLoading(true);
            else setLoadingMore(true);
            try {
                const token = await getToken();
                const res = await authApi(token).get(endpoints['jobsByCompany'](_id), {
                    params: { page, limit },
                });
                const data = res.data.data;
                if (page === 1) {
                    setJobData(data.result);
                } else {
                    setJobData((prev) => [...prev, ...data.result]);
                }
                setCurrentPage(data.meta.currentPage);
                setTotalPages(data.meta.totalPages);
                setTotalItems(data.meta.totalItems);
            } catch (error) {
                console.error('Error fetching jobs:', error);
                ToastMess({ type: 'error', text1: 'Không thể tải danh sách công việc.' });
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        };

        const loadMoreJobs = () => {
            if (currentPage < totalPages && !loadingMore) {
                fetchJobByCompany(currentPage + 1);
            }
        };

        const renderItem = ({ item }) => (
            <TouchableWithoutFeedback onPress={() => navigation.navigate("JobDetail", { jobId: item._id })}>
                <View style={StyleShare.jobItemContainer}>
                    <View style={{ flex: 1 }}>
                        <Text style={StyleShare.titleText16} numberOfLines={2}>{item?.name}</Text>
                    </View>
                    <View style={StyleShare.technologyContainer}>
                        <Chip style={StyleShare.chip}>{item.city}</Chip>
                        <Chip style={StyleShare.chip}>{item.level}</Chip>
                        {item.skills?.map((skill, index) => (
                            <Chip key={index} style={StyleShare.chip}>{skill}</Chip>
                        ))}
                        {item.isUrgent && (
                            <Chip
                                style={[StyleShare.chip, { backgroundColor: '#FF4500', marginLeft: 5 }]}
                                icon={() => <Icon name="flame" size={16} color={white} />}
                            >
                                <Text style={{ color: white, fontSize: 12 }}>Gấp</Text>
                            </Chip>
                        )}
                    </View>
                    <View style={StyleShare.flexBetween}>
                        <View style={StyleShare.flexCenter}>
                            <Icon name="time" size={22} color={'grey'} style={{ marginRight: 5 }} />
                            <Text>{moment(item.endDate).format("DD/MM/YYYY")}</Text>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );

        return (
            <View style={{ flex: 1 }}>
                {loading ? (
                    <ActivityIndicator style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} size="large" color={orange} />
                ) : (
                    <FlatList
                        data={jobData}
                        renderItem={renderItem}
                        keyExtractor={(item) => item._id}
                        ListEmptyComponent={
                            <View style={{ marginTop: 50, alignItems: 'center' }}>
                                <Image source={require("../../assets/images/save.png")} style={StyleShare.imageNullData} />
                                <Text style={StyleShare.titleText16}>Hiện tại chưa có tin tuyển dụng nào</Text>
                                <Text style={{ padding: 20, textAlign: 'center' }}>
                                    Công ty hiện tại chưa có tin tuyển dụng nào, hãy quay lại lần sau để cập nhật
                                </Text>
                            </View>
                        }
                        onEndReached={loadMoreJobs}
                        onEndReachedThreshold={0.7}
                        ListFooterComponent={loadingMore ? <Loading /> : null}
                        contentContainerStyle={{ paddingBottom: 40, paddingTop: 10 }}
                    />
                )}
            </View>
        );
    };

    if (!companyDetail) {
        return <Loading />;
    }

    return (
        <View style={StyleShare.container}>
            <UIHeader leftIcon={"arrow-back"} handleLeftIcon={() => navigation.goBack()} />
            {loading ? (
                <Loading />
            ) : (
                <>
                    <View style={styles.containerTop}>
                        <View style={StyleShare.containerAvatar}>
                            <Avatar.Image
                                source={{ uri: companyDetail?.avatar || 'https://via.placeholder.com/60' }}
                                size={60}
                            />
                        </View>
                        <Text style={StyleShare.titleText16}>{companyDetail.name}</Text>
                        <Text style={{ marginTop: 5, textAlign: 'center' }}>{companyDetail.slogan}</Text>
                        <View style={[StyleShare.flexBetween, { marginTop: 10 }]}>
                            <View style={[StyleShare.flexCenter, { flex: 1 }]}>
                                <Icon name="people-outline" size={18} />
                                <Text style={{ marginLeft: 5, fontSize: 12, fontWeight: '500' }}>
                                    {companyDetail.followers || 0} người theo dõi
                                </Text>
                            </View>
                            <View style={[StyleShare.flexCenter, { flex: 1 }]}>
                                <Icon name="business-outline" size={18} />
                                <Text style={{ marginLeft: 5, fontSize: 12, fontWeight: '500' }}>
                                    {companyDetail.size || 'N/A'} nhân viên
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.containerMain}>
                        <View style={[StyleShare.flexCenter, { marginHorizontal: 20 }]}>
                            <TouchableOpacity style={{ marginRight: 20 }} onPress={handleFollowToggle}>
                                <View
                                    style={[
                                        StyleShare.buttonDetailApply,
                                        { backgroundColor: saved ? orange : '#FFF' },
                                    ]}
                                >
                                    <Icon
                                        name={saved ? "checkmark-circle-outline" : "add-circle-outline"}
                                        style={{ color: saved ? '#FFF' : '#000' }}
                                        size={22}
                                    />
                                    <Text style={{ marginLeft: 5, color: saved ? '#FFF' : '#000' }}>
                                        {saved ? "Đang theo dõi" : "Theo dõi công ty"}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() =>
                                    navigation.navigate("ChatSocket", {
                                        recipient: {
                                            id: companyDetail.userId,
                                            avatar: companyDetail?.avatar,
                                            name: companyDetail?.name,
                                        },
                                        senderId: user._id,
                                    })
                                }
                            >
                                <View style={[StyleShare.buttonDetailApply, { backgroundColor: white }]}>
                                    <Icon name="chatbubble-outline" size={22} />
                                    <Text style={{ marginLeft: 5 }}>Nhắn tin</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{ flex: 1, marginTop: 10 }}>
                            <Tab.Navigator
                                screenOptions={{
                                    tabBarActiveTintColor: orange,
                                    tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold' },
                                    tabBarIndicatorStyle: { backgroundColor: orange },
                                    tabBarStyle: { backgroundColor: grey },
                                }}
                            >
                                <Tab.Screen name="Giới thiệu công ty" component={ProfileTab1} />
                                <Tab.Screen name="Tin tuyển dụng" component={ProfileTab2} />
                            </Tab.Navigator>
                        </View>
                    </View>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    containerTop: {
        alignItems: 'center',
        backgroundColor: white,
        marginTop: 25,
        paddingTop: 45,
        paddingBottom: 15,
        paddingHorizontal: 20,
    },
    containerMain: {
        flex: 1,
    },
    containerAvatarJob: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: bgButton2,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    avatarJob: {
        width: 30,
        height: 30,
    },
    btnSave: {
        position: 'absolute',
        top: 20,
        right: 20,
        opacity: 0.8,
        zIndex: 999,
    },
    jobItemContainer: {
        backgroundColor: white,
        borderRadius: 20,
        padding: 20,
        marginTop: 10,
        marginHorizontal: 20,
    },
    reviewItemContainer: {
        backgroundColor: white,
        borderRadius: 10,
        padding: 15,
        marginTop: 10,
        borderWidth: 1,
        borderColor: grey,
    },
    containerProfileTab1: {
        backgroundColor: white,
        padding: 20,
        marginBottom: 20,
    },
    reviewForm: {
        backgroundColor: white,
        padding: 15,
        borderRadius: 10,
        marginTop: 10,
        borderWidth: 1,
        borderColor: grey,
    },

});