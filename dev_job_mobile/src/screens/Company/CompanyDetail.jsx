import { StyleSheet, View, Text, Image, TouchableOpacity, TouchableWithoutFeedback, ActivityIndicator, Linking, FlatList, ScrollView } from "react-native";
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
    const [companyDetail, setCompanyDetail] = useState('');
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

        } finally {
            setLoading(false);
        }
    };

    const handleFollowToggle = async () => {
        try {
            const token = await AsyncStorage.getItem("access_token");
            if (saved) {
                // Nếu đang theo dõi, gọi API hủy theo dõi
                await authApi(token).delete(endpoints['followDetail'](_id));
            } else {
                // Nếu chưa theo dõi, gọi API theo dõi
                await authApi(token).post(endpoints['follows'], { companyId: _id });
            }

            setSaved(!saved);
        } catch (err) {
            ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại.' });

        } finally {
            setLoading(false);
        }
    };


    const handleOpenWebsite = (url) => {
        // Ensure the URL has http:// or https://
        const formattedUrl = url.startsWith("http") ? url : `https://${url}`;
        Linking.openURL(formattedUrl)
    };

    const fetchCompanyDetail = async () => {

        try {
            const token = AsyncStorage.getItem("access_token");
            const res = await authApi(token).get(endpoints['companiesDetail'](_id));
            setCompanyDetail(res.data.data);
        } catch (error) {
            console.log('Error fetching company detail:', error);
        }
    };

    const ProfileTab1 = () => (
        <ScrollView contentContainerStyle={{ paddingBottom: 20, backgroundColor: 'white', paddingHorizontal: 20 }}>
            <Text style={[StyleShare.titleText16, { marginTop: 10 }]}>Giới thiệu công ty</Text>
            <Text style={{ color: textColor, marginTop: 5 }}>{companyDetail.about}</Text>
            <Text style={[StyleShare.titleText16, { marginTop: 10 }]}>Lĩnh vực hoạt động</Text>
            <Text style={{ color: textColor, marginTop: 5 }}>{companyDetail.field}</Text>
            <Text style={[StyleShare.titleText16, { marginTop: 10 }]}>Website</Text>
            <TouchableOpacity onPress={() => handleOpenWebsite(companyDetail.website)}>
                <Text style={{ color: orange, marginTop: 5 }}>{companyDetail.website}</Text>
            </TouchableOpacity>
            <Text style={[StyleShare.titleText16, { marginTop: 10 }]}>Địa chỉ công ty</Text>
            <Text style={{ color: textColor, marginTop: 5 }}>{companyDetail.address}</Text>
            <TouchableOpacity style={StyleShare.buttonDetailApply} onPress={() => handleLocationPress()}>
                <Text style={{ color: textColor, marginTop: 5 }}><Text style={{ fontWeight: '500', color: mainColor }}>Xem địa chỉ trên Map</Text></Text>
            </TouchableOpacity>
        </ScrollView>
    );
    const ProfileTab2 = () => {
        const [jobData, setJobData] = useState([]);
        const [currentPage, setCurrentPage] = useState(1);
        const [totalPages, setTotalPages] = useState(1);
        const [totalItems, setTotalItems] = useState(0);

        const [loading, setLoading] = useState(false)
        const [loadingMore, setLoadingMore] = useState(false);

        useEffect(() => {
            fetchJobByCompany(1);
        }, []);

        const fetchJobByCompany = async (currentPage = 1, limit = 10) => {
            if (currentPage === 1) setLoading(true);
            else setLoadingMore(true);
            try {
                const token = await AsyncStorage.getItem("access_token");
                const res = await authApi(token).get(endpoints['jobsByCompany'](_id), {
                    params: {
                        page: currentPage,
                        limit: limit,
                    },
                });
                const data = res.data.data;
                if (currentPage === 1) {
                    setJobData(data.result);
                } else {
                    setJobData((prev) => [...prev, ...data.result]);
                }
                setCurrentPage(data.meta.currentPage);
                setTotalPages(data.meta.totalPages);
                setTotalItems(data.meta.totalItems);
            } catch (error) {
                console.log('Error fetching companies:', error);
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

        const renderItem = ({ item }) => {
            return (
                <TouchableWithoutFeedback onPress={() => navigation.navigate("JobDetail", { jobId: item._id })}>
                    <View style={StyleShare.jobItemContainer}>
                        <View style={{ flex: 1 }}>
                            <Text style={StyleShare.titleText16} numberOfLines={2}>{item?.name}</Text>
                        </View>

                        <View style={StyleShare.technologyContainer}>
                            <Chip style={StyleShare.chip}>{item.level}</Chip>
                            <Chip style={StyleShare.chip}>{item.city}</Chip>
                            {item.skills.map((skill, index) => (
                                <Chip key={index} style={StyleShare.chip}>
                                    {skill}
                                </Chip>
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
        };



        return (
            <View style={{ flex: 1 }}>
                {loading ? (
                    <ActivityIndicator style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} size="large" color='orange' />
                ) : (
                    <FlatList
                        data={jobData}
                        renderItem={renderItem}
                        keyExtractor={item => item._id}
                        ListEmptyComponent={
                            <View style={{ marginTop: 50, alignItems: 'center' }}>
                                <Image source={require("../../assets/images/save.png")} style={StyleShare.imageNullData} />
                                <Text style={StyleShare.titleText16}>Hiện tại chưa có tin tuyển dụng nào</Text>
                                <Text style={{ padding: 20, textAlign: 'center' }}>Công ty hiện tại chưa có tin tuyển dụng nào, hãy quay lại lần sau để cập nhật</Text>
                            </View>
                        }
                        onEndReached={loadMoreJobs} // Gọi khi đến cuối danh sách
                        onEndReachedThreshold={0.7} // Ngưỡng để kích hoạt loadMore
                        ListFooterComponent={
                            loadingMore ? (
                                <Loading />
                            ) : null
                        }
                        contentContainerStyle={{ paddingBottom: 40, paddingTop: 10 }}
                    />
                )}
            </View>
        );

    };

    return (
        <View style={StyleShare.container}>
            <UIHeader leftIcon={"arrow-back"}
                handleLeftIcon={() => { navigation.goBack() }} />
            {loading ? <>
                <Loading /></> : <>
                <View style={styles.containerTop}>
                    <View style={StyleShare.containerAvatar}>
                        <Avatar.Image source={{ uri: companyDetail?.avatar }} size={60}  />
                    </View>
                    <Text style={StyleShare.titleText16}>{companyDetail.name}</Text>
                    <Text style={{ marginTop: 5, textAlign: 'center' }}>{companyDetail.slogan}</Text>

                    <View style={[StyleShare.flexBetween, { marginTop: 10 }]}>
                        <View style={[StyleShare.flexCenter, { flex: 1 }]}>
                            <Icon name="people-outline" size={18} />
                            <Text style={{ marginLeft: 5, fontSize: 12, fontWeight: '500' }}>{companyDetail.followers} người theo dõi</Text>
                        </View>
                        <View style={[StyleShare.flexCenter, { flex: 1 }]}>
                            <Icon name="business-outline" size={18} />
                            <Text style={{ marginLeft: 5, fontSize: 12, fontWeight: '500' }}>{companyDetail.size} nhân viên</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.containerMain}>
                    <View style={[StyleShare.flexCenter, { marginHorizontal: 20 }]}>
                        <TouchableOpacity style={{ marginRight: 20 }} onPress={() => handleFollowToggle()}>
                            <View style={[
                                StyleShare.buttonDetailApply,
                                { backgroundColor: saved ? orange : '#FFF' }
                            ]}>
                                <Icon name={saved ? "checkmark-circle-outline" : "add-circle-outline"} style={{ color: saved ? '#FFF' : '#000' }} size={22} />
                                <Text style={{ marginLeft: 5, color: saved ? '#FFF' : '#000' }}>
                                    {saved ? "Đang theo dõi" : "Theo dõi công ty"}
                                </Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => navigation.navigate("ChatSocket", {
                                recipient: {
                                    id: companyDetail.userId,
                                    avatar: companyDetail?.avatar,
                                    name: companyDetail?.name,
                                }, senderId: user._id
                            })}>
                            <View style={[StyleShare.buttonDetailApply, { backgroundColor: white }]}>
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
            </>}
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