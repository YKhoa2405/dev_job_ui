import React, { useEffect, useState } from "react"
import { View, Text, TouchableOpacity, TouchableWithoutFeedback, Image, TextInput, ScrollView, FlatList } from "react-native"
import StyleShare from "../../assets/themes/StyleShare"
import UIHeader from "../../components/UIHeader"
import { grey, mainColor, white, orange, textColor, green, bgButton2 } from "../../assets/themes/Color"
import Icon from 'react-native-vector-icons/Ionicons'
import { useDispatch, useSelector } from "react-redux"
import moment from "moment"
import Loading from "../../components/Loading"
import { ToastMess } from "../../components/ToastMess";
import Dropdown from "../../components/Dropdown";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi, endpoints } from "../../assets/config/API";
import { fetchJobDetail } from "../../redux/slice/jobSlice"
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Button from "../../components/Button"
import { Avatar, Chip } from "react-native-paper"
import Modal from "react-native-modal"
import { Linking } from "react-native"
import { fetchCompanyByUser } from "../../redux/slice/companySlice"

export default function ResumeByJob({ navigation, route }) {
    const { jobId } = route.params;

    const Tab = createMaterialTopTabNavigator();

    const ProfileTab1 = () => {
        const [modalVisible, setModalVisible] = useState(false);
        const [loading, setLoading] = useState(false);
        const [candidates, setCandidates] = useState([]);
        const dispatch = useDispatch()
        const jobDetail = useSelector((state) => state.job.jobDetail);

        const status = useSelector((state) => state.job.status);
        useEffect(() => {
            if (jobId) {
                dispatch(fetchJobDetail(jobId));
            }
        }, [dispatch, jobId]);

        const fetchMatchingCandidates = async () => {
            setLoading(true);
            try {
                const token = await AsyncStorage.getItem("access_token");
                const params = {
                    companyId: jobDetail.companyId._id,
                    location: jobDetail.city || null,
                    // skills: jobDetail.skills?.length > 0 ? jobDetail.skills.join(',') : null,
                    // level: jobDetail.level || null,
                    // salary: jobDetail.salary || null,
                    // jobType: jobDetail.jobType || null,
                };
                const res = await authApi(token).get(endpoints['candidates'], { params });
                setCandidates(res.data.data.result || []);
            } catch (error) {
                console.log('Error fetching candidates:', error);
            } finally {
                setLoading(false);
            }
        };

        const renderCandidateItem = ({ item }) => (
            <TouchableWithoutFeedback key={item._id} onPress={() => { navigation.navigate('CandidatesProfile', { userId: item.userId }) }}>
                <View style={{
                    backgroundColor: white,
                    borderRadius: 10,
                    padding: 20,
                    marginBottom: 10,
                    elevation: 2
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Avatar.Image
                            source={{ uri: item?.avatar || 'https://via.placeholder.com/60' }}
                            size={50}
                            style={{ backgroundColor: 'white', marginRight: 5 }}
                        />
                        <View>
                            <Text style={StyleShare.titleText16}>{item?.fullName || 'Chưa cập nhật họ tên'}</Text>
                            <Text style={{ marginTop: 5 }}>{item?.email || 'Chưa cập nhật email'}</Text>
                        </View>
                    </View>
                    <View style={StyleShare.technologyContainer}>
                        <Chip style={StyleShare.chip}>{item?.jobType || 'Chưa cập nhật loại công việc'}</Chip>
                        <Chip style={StyleShare.chip}>{item?.location || 'Chưa cập nhật địa điểm'}</Chip>
                        {Array.isArray(item?.skills) && item?.skills?.length > 0 ?
                            item?.skills?.map((s, index) => (
                                <Chip key={index} style={StyleShare.chip}>
                                    {s}
                                </Chip>
                            )) :
                            <Chip style={StyleShare.chip}>Chưa cập nhật kỹ năng</Chip>
                        }
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );

        return (
            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10 }}>
                {status === 'loading' ? <Loading /> : jobDetail ? (
                    <View>
                        <Text style={StyleShare.titleText20}>{jobDetail?.name}</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 20, alignItems: 'center' }}>
                            <View style={{ flex: 1 }}>
                                <Text style={StyleShare.titleText16}>Loại hình công việc</Text>
                                <Text style={{ color: textColor, marginTop: 5 }}>{jobDetail.jobType}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={StyleShare.titleText16}>Level</Text>
                                <Text style={{ color: textColor, marginTop: 5 }}>{jobDetail.level}</Text>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                            <View style={{ flex: 1 }}>
                                <Text style={StyleShare.titleText16}>Mức lương</Text>
                                <Text style={{ color: textColor, marginTop: 5 }}>{jobDetail.salary}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={StyleShare.titleText16}>Số lượng tuyển</Text>
                                <Text style={{ color: textColor, marginTop: 5 }}>{jobDetail.quantity}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                            <View style={{ flex: 1 }}>
                                <Text style={StyleShare.titleText16}>Ngày hết hạn</Text>
                                <Text style={{ color: textColor, marginTop: 5 }}>{moment(jobDetail?.endDate).format('DD/MM/YYYY')}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={StyleShare.titleText16}>Kĩ năng</Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 }}>
                                    {jobDetail?.skills?.map((item, index) => (
                                        <Text
                                            key={index}
                                            style={{
                                                fontWeight: '500',
                                                color: textColor
                                            }}>
                                            {item}{index < jobDetail.skills.length - 1 ? ', ' : ''}
                                        </Text>
                                    ))}
                                </View>
                            </View>
                        </View>

                        <View style={{ marginBottom: 10 }}>
                            <Text style={StyleShare.titleText16}>Mô tả công việc</Text>
                            <Text style={{ color: textColor, marginTop: 5 }}>{jobDetail.description}</Text>
                        </View>
                        <View style={{ marginBottom: 10 }}>
                            <Text style={StyleShare.titleText16}>Yêu cầu ứng viên</Text>
                            <Text style={{ color: textColor, marginTop: 5 }}>{jobDetail.requirement}</Text>
                        </View>
                        <View style={{ marginBottom: 10 }}>
                            <Text style={StyleShare.titleText16}>Ưu tiên</Text>
                            <Text style={{ color: textColor, marginTop: 5 }}>{jobDetail.prioritize}</Text>
                        </View>
                        <View style={{ marginBottom: 10 }}>
                            <Text style={StyleShare.titleText16}>Địa chỉ làm việc</Text>
                            <Text style={{ color: textColor, marginTop: 5 }}>{jobDetail.location}</Text>
                        </View>
                        <View style={{ marginBottom: 10 }}>
                            <Text style={StyleShare.titleText16}>Trạng thái</Text>
                            {jobDetail.isActive ? <Text style={[StyleShare.titleText16, { color: green, marginTop: 5 }]}>Đang hoạt động</Text>
                                : <Text style={[StyleShare.titleText16, { color: 'red', marginTop: 5 }]}>Hết hạn</Text>}
                        </View>
                        <View style={{ marginTop: 20 }}>
                            {loading ? (
                                <Loading />
                            ) : (
                                <Button
                                    title={'Tìm nhanh ứng viên phù hợp'}
                                    backgroundColor={mainColor}
                                    textColor={white}
                                    onPress={() => {
                                        fetchMatchingCandidates().then(() => setModalVisible(true));
                                    }}
                                />
                            )}

                            <Modal
                                isVisible={modalVisible}
                                onBackdropPress={() => setModalVisible(false)}
                                animationIn="slideInUp"
                                animationOut="slideOutDown"
                                backdropTransitionInTiming={500}
                                backdropTransitionOutTiming={500}
                                style={StyleShare.modalStyle}
                            >
                                <View style={StyleShare.modalContent}>
                                    <View style={[StyleShare.flexBetween, { marginVertical: 15 }]}>
                                        <Text style={StyleShare.titleText20}>Ứng viên phù hợp</Text>
                                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                                            <Icon name="close" size={26} color={'red'} />
                                        </TouchableOpacity>
                                    </View>
                                    {candidates.length > 0 ? (
                                        <FlatList
                                            data={candidates}
                                            renderItem={renderCandidateItem}
                                            keyExtractor={(item) => item?._id}
                                            showsVerticalScrollIndicator={false}
                                        />
                                    ) : (
                                        <Text style={{ color: textColor }}>
                                            Không tìm thấy ứng viên phù hợp
                                        </Text>
                                    )}
                                </View>
                            </Modal>
                        </View>
                    </View>
                ) : (
                    <Text style={{ textAlign: 'center' }}>Không có dữ liệu</Text>
                )}


            </ScrollView>
        )
    }

    const ProfileTab2 = () => {
        const dispatch = useDispatch()
        const { companyByUser } = useSelector((state) => state.company);
        const [resumeData, setResumeData] = useState([]);
        const [currentPage, setCurrentPage] = useState(1);
        const [totalPages, setTotalPages] = useState(1);
        const [totalItems, setTotalItems] = useState(0);
        const [searchKeywork, setSearchKeywork] = useState('');

        const [loading, setLoading] = useState(false)
        const [loadingMore, setLoadingMore] = useState(false);
        const [selectedStatus, setSelectedStatus] = useState('');
        const activeData = [
            { title: 'Tất cả', value: null },
            { title: 'Chờ xử lý', value: 'Chờ xử lý' },
            { title: 'Đã xem', value: 'Đã xem' },
            { title: 'Chấp nhận', value: 'Chấp nhận' },
            { title: 'Từ chối', value: 'Từ chối' },
        ];

        useEffect(() => {
            fetchResumeByJob(1);
        }, [selectedStatus]);

        useEffect(() => {
            dispatch(fetchCompanyByUser());
        }, [])

        const fetchResumeByJob = async (currentPage = 1, limit = 10, keywork = '') => {
            if (currentPage === 1) setLoading(true);
            else setLoadingMore(true);
            try {
                const searchKeywork = keywork ? `/${keywork}/i` : '';

                const token = await AsyncStorage.getItem("access_token");
                const res = await authApi(token).get(endpoints['resumeByJob'](jobId), {
                    params: {
                        page: currentPage,
                        limit: limit,
                        status: selectedStatus,
                        name: searchKeywork
                    },
                });
                const data = res.data.data;
                if (currentPage === 1) {
                    setResumeData(data.result);
                } else {
                    setResumeData((prev) => [...prev, ...data.result]);
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

        const loadMoreResume = () => {
            if (currentPage < totalPages && !loadingMore) {
                fetchResumeByJob(currentPage + 1);
            }
        };

        const renderItem = ({ item }) => {
            return (
                <TouchableWithoutFeedback onPress={() => navigation.navigate("ResumeView", { resumeDetail: item })}>
                    <View style={StyleShare.jobItemContainer}>
                        <View style={{ marginVertical: 10 }}>
                            <Text style={{ color: mainColor, marginBottom: 5, fontWeight: '500' }}>{item.name} - {item.phone}</Text>
                            <Text style={{ color: mainColor, fontWeight: '500' }} >{item.email}</Text>
                        </View>

                        <View style={StyleShare.flexBetween}>
                            <View style={StyleShare.flexBetween}>
                                <View style={StyleShare.flexCenter}>
                                    <Icon name="time" size={20} color={textColor} style={{ marginRight: 5 }} />
                                    <Text>{moment(item.createdAt).format("DD/MM/YYYY")}</Text>
                                </View>
                            </View>
                            <View>
                                <Text
                                    style={[StyleShare.titleText16,
                                    {
                                        color:
                                            item.status === 'Chờ xử lý' ? mainColor
                                                : item.status === 'Đã xem' ? 'blue'
                                                    : item.status === 'Chấp nhận' ? 'green'
                                                        : item.status === 'Từ chối' ? 'red'
                                                            : grey
                                    }]}>{item.status}
                                </Text>
                            </View>
                        </View>
                        <View style={[StyleShare.flexBetween, { zIndex: 9999 }]}>
                            <TouchableOpacity
                                onPress={() => navigation.navigate("ChatSocket", {
                                    recipient: {
                                        id: item?._id,
                                        avatar: item?.avatar,
                                        name: item?.name,
                                    }, senderId: companyByUser?.userId
                                })}>
                                <View style={[StyleShare.buttonDetailApply]}>
                                    <Text>Nhắn tin</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleOpenPhone(item.phone)}>
                                <View style={[StyleShare.buttonDetailApply]}>
                                    <Text>Gọi điện</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleOpenEmail(item.email)}>
                                <View style={[StyleShare.buttonDetailApply]}>
                                    <Text>Gửi Mail</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>

            );
        };

        const handleOpenEmail = (email) => {
            if (email) Linking.openURL(`mailto:${email}`);
        };

        const handleOpenPhone = (phone) => {
            if (phone) Linking.openURL(`tel:${phone}`);
        };

        return (
            <View style={{ flex: 1 }}>
                <View style={{ paddingHorizontal: 20, marginBottom: 5 }}>
                    <View style={{ marginTop: 10 }}>
                        <View style={StyleShare.searchDetail}>
                            <Icon name="search" color={mainColor} size={24} style={{ marginRight: 10 }} />
                            <TextInput
                                style={StyleShare.searchInput}
                                placeholder="Nhập tên ứng viên..."
                                value={searchKeywork}
                                onChangeText={(text) => setSearchKeywork(text)}
                                onSubmitEditing={() => {
                                    fetchResumeByJob(1, 10, searchKeywork)
                                }}
                            />
                        </View>
                        <Dropdown
                            data={activeData}
                            onSelect={(item) => {
                                setSelectedStatus(item.value);
                            }}
                            value={
                                selectedStatus !== null
                                    ? activeData.find((item) => item.value === selectedStatus)?.title
                                    : null
                            }
                            placeholder="Trạng thái hồ sơ"
                        />
                    </View>
                </View>
                {loading ? (
                    <Loading />
                ) : (
                    <FlatList
                        extraData={resumeData}
                        data={resumeData}
                        keyExtractor={(item) => item._id}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 15 }}
                        ListEmptyComponent={
                            <View style={{ marginTop: 50, alignItems: 'center' }}>
                                <Image source={require("../../assets/images/save.png")} style={StyleShare.imageNullData} />
                                <Text style={StyleShare.titleText20}>Chưa có đơn ứng tuyển mới nào </Text>
                                <Text style={{ padding: 20, textAlign: 'center' }}>Chưa có đơn ứng tuyển nào cho việc làm này, hãy đăng bài tuyển dụng để tìm kiếm ứng viên tìm năng</Text>
                            </View>
                        }
                        onEndReached={loadMoreResume}
                        onEndReachedThreshold={0.7}
                        ListFooterComponent={
                            loadingMore ? (
                                <Loading />
                            ) : null
                        }
                    />
                )}
            </View>
        );

    };

    return (
        <View style={StyleShare.container}>
            <UIHeader
                leftIcon={"arrow-back"}
                title={'Chi tiết tuyển dụng'}
                handleLeftIcon={() => { navigation.goBack() }} />
            <View style={{ flex: 1 }}>
                <Tab.Navigator
                    screenOptions={{
                        tabBarActiveTintColor: orange, // Color of the selected tab
                        tabBarLabelStyle: { fontSize: 16, fontWeight: 'bold' }, // Style for tab labels
                        tabBarIndicatorStyle: { backgroundColor: orange }, // Style for the indicator of the selected tab
                        tabBarStyle: { backgroundColor: grey },
                    }}>
                    <Tab.Screen name="Chi tiết tin tuyển dụng" component={ProfileTab1} />
                    <Tab.Screen name={'Hồ sơ ứng tuyển'} component={ProfileTab2} />
                </Tab.Navigator>
            </View>
        </View>
    )
}

