import { StyleSheet, View, Text, Image, TouchableOpacity, TouchableWithoutFeedback, ActivityIndicator, Linking, FlatList, ScrollView, Platform } from "react-native";
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

    const checkFollowStatus = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("access_token");
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
            const token = await AsyncStorage.getItem("access_token");
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
        const formattedUrl = url.startsWith("http") ? url : `https://${url}`;
        Linking.openURL(formattedUrl).catch(() => {
            ToastMess({ type: 'error', text1: 'Không thể mở website.' });
        });
    };

    const handleLocationPress = async () => {
        const address = companyDetail?.address;
        const encodedAddress = encodeURIComponent(address);
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
        const supported = await Linking.canOpenURL(mapUrl);

        if (supported) {
            await Linking.openURL(mapUrl);
        } else {
            ToastMess({ type: 'error', text1: 'Không thể mở bản đồ.' });
        }
    };

    const fetchCompanyDetail = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("access_token");
            const res = await authApi(token).get(endpoints['companiesDetail'](_id));
            setCompanyDetail(res.data.data);
        } catch (error) {
            console.error('Error fetching company detail:', error);
            ToastMess({ type: 'error', text1: 'Không thể tải thông tin công ty.' });
        } finally {
            setLoading(false);
        }
    };

    const ProfileTab1 = () => (
        <ScrollView contentContainerStyle={{ paddingBottom: 20, backgroundColor: 'white', paddingHorizontal: 20 }}>
            <Text style={[StyleShare.titleText16, { marginTop: 10 }]}>Giới thiệu công ty</Text>
            <Text style={{ color: textColor, marginTop: 5 }}>{companyDetail?.about || 'Chưa có thông tin.'}</Text>
            <Text style={[StyleShare.titleText16, { marginTop: 10 }]}>Lĩnh vực hoạt động</Text>
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
        </ScrollView>
    );

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
                const token = await AsyncStorage.getItem("access_token");
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
                            <Chip style={[StyleShare.chip, { backgroundColor: 'red' }]} textStyle={{ color: 'white' }}>
                                GẤP
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
});