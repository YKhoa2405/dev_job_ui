import React, { useEffect, useState } from "react";
import { View, Image, TouchableOpacity, Text, FlatList, TouchableWithoutFeedback, TextInput, Alert } from "react-native";
import StyleShare from "../../assets/themes/StyleShare";
import UIHeader from "../../components/UIHeader";
import { Avatar, Chip } from "react-native-paper";
import Icon from 'react-native-vector-icons/Ionicons'
import Dropdown from "../../components/Dropdown";
import { mainColor, orange } from "../../assets/themes/Color";
import moment from "moment";
import Loading from "../../components/Loading";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi, endpoints } from "../../assets/config/API";
import { ToastMess } from "../../components/ToastMess";

export default function ResumeByCompany({ navigation, route }) {
    const { companyId } = route.params
    const [resumeData, setResumeData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const [loading, setLoading] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchKeywork, setSearchKeywork] = useState('')
    const [selectedStatus, setSelectedStatus] = useState('');
    const activeData = [
        { title: 'Tất cả', value: null },
        { title: 'Chờ xử lý', value: 'Chờ xử lý' },
        { title: 'Đã xem', value: 'Đã xem' },
        { title: 'Chấp nhận', value: 'Chấp nhận' },
        { title: 'Từ chối', value: 'Từ chối' },
    ];

    useEffect(() => {
        fetchResumeByCompany(1);
    }, [selectedStatus]);

    const fetchResumeByCompany = async (currentPage = 1, limit = 10) => {
        if (currentPage === 1) setLoading(true);
        else setLoadingMore(true);
        const searchQuery = searchKeywork ? `/${searchKeywork}/i` : '';
        try {
            const token = await AsyncStorage.getItem("access_token");
            const res = await authApi(token).get(endpoints['resumeByCompany']('67433ef7c2689cf41f1fae48'), {
                params: {
                    page: currentPage,
                    limit: limit,
                    status: selectedStatus
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
            console.log(data)
        } catch (error) {
            console.log('Error fetching companies:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const loadMoreResume = () => {
        if (currentPage < totalPages && !loadingMore) {
            fetchResumeByCompany(currentPage + 1);
        }
    };

    const renderItem = ({ item }) => {
        return (
            <TouchableWithoutFeedback >
                <View style={StyleShare.jobItemContainer}>
                    <View style={StyleShare.flexBetween}>
                        <Text style={StyleShare.titleText16}>{item.jobId.name}</Text>
                        <View style={StyleShare.flexCenter}>
                            <TouchableOpacity style={{ zIndex: 999, marginLeft: 10 }} onPress={() => handleDeleteJob(item._id)} >
                                <Icon name="close" size={26} color={'red'} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={StyleShare.line}></View>
                    <View style={{ marginVertical: 10 }}>
                        <Text style={{ color: mainColor, marginBottom: 5, fontWeight: '500' }}>{item.name} - {item.phone}</Text>
                        <TouchableOpacity>
                            <Text style={{ color: orange, textDecorationLine: 'underline', fontWeight: '500' }} >{item.email}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={StyleShare.flexBetween}>
                        <View style={StyleShare.flexBetween}>
                            <View style={StyleShare.flexCenter}>
                                <Icon name="time" size={22} color={'grey'} style={{ marginRight: 5 }} />
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
                                                        : gray
                                }]}>{item.status}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity onPress={() => handleOpenCv(item.cv)}>
                        <View style={[StyleShare.buttonDetailApply, { marginTop: 10 }]}>
                            <Icon name="document-outline" size={22} />
                            <Text style={{ marginLeft: 5 }}>Xem hồ sơ ứng viên</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
        );
    };

    return (
        <View style={StyleShare.container}>
            <UIHeader leftIcon={"arrow-back"}
                handleLeftIcon={() => { navigation.goBack() }}
                title={'Quản lý tuyển dụng'} />
            <View style={{ paddingHorizontal: 20, marginBottom: 5 }}>
                <View style={StyleShare.searchDetail}>
                    <Icon name="search" color={mainColor} size={24} style={{ marginRight: 10 }} />
                    <TextInput
                        style={StyleShare.searchInput}
                        placeholder="Tìm kiếm hồ sơ ứng viên..."
                        value={searchKeywork}
                        onChangeText={(text) => setSearchKeywork(text)}
                        onSubmitEditing={() => {
                            fetchJobByCompany(1, 10, searchKeywork)
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
                <View style={{ marginTop: 10 }}>
                    <Text style={StyleShare.titleText16}>{totalItems} hồ sơ ứng tuyển</Text>
                </View>
            </View>
            {loading ? (
                <Loading />
            ) : (
                <FlatList
                    data={resumeData}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 15 }}
                    ListEmptyComponent={
                        <View style={{ marginTop: 50, alignItems: 'center' }}>
                            <Image source={require("../../assets/images/save.png")} style={StyleShare.imageNullData} />
                            <Text style={StyleShare.textMainOption}>Chưa có đơn ứng tuyển mới nào </Text>
                            <Text style={{ padding: 20, textAlign: 'center' }}>Bạn chưa có đơn ứng tuyển nào gần đây, hãy đăng bài tuyển dụng để tìm kiếm ứng viên tìm năng</Text>
                        </View>
                    }
                    onEndReached={loadMoreResume} // Gọi khi đến cuối danh sách
                    onEndReachedThreshold={0.7} // Ngưỡng để kích hoạt loadMore
                    ListFooterComponent={
                        loadingMore ? (
                            <Loading />
                        ) : null
                    }
                />
            )}
        </View>
    )
}