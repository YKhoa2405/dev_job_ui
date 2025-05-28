import React, { useEffect, useState } from "react";
import { View, Image, TouchableOpacity, Text, FlatList, TouchableWithoutFeedback, StyleSheet, Alert } from "react-native";
import StyleShare from "../../assets/themes/StyleShare";
import UIHeader from "../../components/UIHeader";
import { Avatar, Chip } from "react-native-paper";
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi, endpoints } from "../../assets/config/API";
import { orange, textColor, white } from "../../assets/themes/Color";
import Loading from "../../components/Loading";
import moment from "moment";
import { ToastMess } from "../../components/ToastMess";

export default function JobSaved({ navigation }) {
    const [jobs, setJobs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [limit, setLimit] = useState(10);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchListSaveJob(currentPage, limit);
    }, [currentPage]);

    const fetchListSaveJob = async (currentPage = 1, limit = 10) => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("access_token");
            const res = await authApi(token).get(endpoints['saveJob'], {
                params: {
                    page: currentPage,
                    limit: limit,
                }
            });
            const data = res.data.data;
            setJobs(data.result);
            setCurrentPage(data.meta.currentPage);
            setTotalPages(data.meta.totalPages);
            setTotalItems(data.meta.totalItems);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSavedJob = async (saveJobId) => {
        try {
            const token = await AsyncStorage.getItem("access_token");
            const res = await authApi(token).delete(endpoints['saveJobDetail'](saveJobId));
            if (res.data.statusCode === 200) {
                setJobs(prevJobs => prevJobs.filter(job => job?.jobId?._id !== saveJobId));
                setTotalItems(prevTotalItems => prevTotalItems - 1);
            }

        } catch (error) {
            ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại.' });
            console.log(error);
        }
    };

    const handleDeleteManySavedJob = async () => {
        Alert.alert(
            'Xóa tất cả việc làm đã lưu', // Tiêu đề của cảnh báo
            'Bạn có chắc chắn muốn xóa tất cả các việc làm đã lưu không?', // Mô tả
            [
                {
                    text: 'Hủy',
                    style: 'cancel',
                },
                {
                    text: 'Đồng ý',
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem("access_token");
                            const res = await authApi(token).delete(endpoints['deleteAllSaveJob']);
                            if (res.data.statusCode === 200) {
                                setJobs([]);
                                setTotalItems(0)
                                ToastMess({ type: 'success', text1: 'Bỏ lưu việc làm thành công.' });
                            }

                        } catch (error) {
                            ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại.' });

                            console.log(error);
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    }

    const renderItem = ({ item }) => {
        const companyName = item?.jobId?.companyId && Array.isArray(item?.jobId?.companyId)
            ? item?.jobId?.companyId[0]?.name
            : item?.jobId?.companyId?.name;

        return (
            <TouchableWithoutFeedback onPress={() => navigation.navigate('JobDetail', { jobId: item?.jobId?._id })}>
                <View style={StyleShare.jobItemContainer}>
                    <View style={StyleShare.flexCenter}>
                        <Avatar.Image size={50} style={{ backgroundColor: 'white' }} source={{ uri: item?.jobId?.companyId?.avatar || 'https://via.placeholder.com/60' }} />
                        <View style={{ marginLeft: 10, flex: 1 }}>
                            <Text style={StyleShare.titleText16} numberOfLines={2}>
                                {item?.jobId?.name}
                            </Text>
                            <Text style={{ marginTop: 5, color: textColor }}>{companyName || 'Tên công ty'}</Text>
                        </View>
                        <TouchableOpacity onPress={() => handleDeleteSavedJob(item?.jobId?._id)}>
                            <Icon name="bookmark" size={26} color={orange} />
                        </TouchableOpacity>
                    </View>

                    <View style={StyleShare.technologyContainer}>
                        <Chip style={StyleShare.chip}>{item?.jobId?.city || 'N/A'}</Chip>
                        <Chip style={StyleShare.chip}>{item?.jobId?.level || 'N/A'}</Chip>
                        {item?.jobId?.skills.map((skill, index) => (
                            <Chip key={index} style={StyleShare.chip}>
                                {skill || 'N/A'}
                            </Chip>
                        ))}
                        {item?.isUrgent && (
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
                            <Text>{moment(item?.endDate).format("DD/MM/YYYY")}</Text>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    };

    return (
        <View style={StyleShare.container}>
            <UIHeader
                leftIcon={"arrow-back"}
                title={'Việc làm đã lưu'}
                rightIcon={'flash-off-outline'}
                handleLeftIcon={() => { navigation.goBack() }}
                handleRightIcon={() => handleDeleteManySavedJob()}
            />
            {loading ? (
                <Loading />
            ) : (
                <>
                    <View style={{ marginHorizontal: 20, marginTop: 5 }}>
                        <Text style={StyleShare.titleText16}>{totalItems} việc làm</Text>
                    </View>
                    <FlatList
                        data={jobs}
                        renderItem={renderItem}
                        keyExtractor={item => item._id}
                        ListEmptyComponent={
                            <View style={{ marginTop: 50, alignItems: 'center' }}>
                                <Image source={require("../../assets/images/save.png")} style={StyleShare.imageNullData} />
                                <Text style={StyleShare.titleText20}>Bạn chưa lưu việc làm nào</Text>
                                <Text style={{ padding: 20, textAlign: 'center' }}>
                                    Bạn chưa lưu bất kỳ việc làm nào, hãy lưu việc làm để có thể dễ dàng ứng tuyển sau này
                                </Text>
                            </View>
                        }
                        contentContainerStyle={{ paddingBottom: 40 }}
                    />
                </>
            )}
        </View>
    );
}