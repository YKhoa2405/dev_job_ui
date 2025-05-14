import React, { useEffect, useState } from "react";
import { View, Image, TouchableOpacity, Text, FlatList, TouchableWithoutFeedback } from "react-native";
import StyleShare from "../../assets/themes/StyleShare";
import UIHeader from "../../components/UIHeader";
import { Avatar, Chip } from "react-native-paper";
import Icon from 'react-native-vector-icons/Ionicons'
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi, endpoints } from "../../assets/config/API";
import Loading from "../../components/Loading";
import moment from "moment";
import { grey, mainColor, textColor } from "../../assets/themes/Color";


export default function JobApplied({ navigation }) {
    const [jobs, setJobs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        fetchResumeByCandidate();
    }, []);

    // Lấy danh sách các việc làm mà ứng viên đã ứng tuyển
    const fetchResumeByCandidate = async (currentPage = 1, limit = 10) => {
        if (currentPage === 1) setLoading(true);
        else setLoadingMore(true);
        try {
            const token = await AsyncStorage.getItem("access_token");
            console.log(token)
            const res = await authApi(token).get(endpoints['resumeByCandidate'], {
                params: {
                    page: currentPage,
                    limit: limit,
                },
            });
            const data = res.data.data;
            console.log(data)
            if (currentPage === 1) {
                setJobs(data.result);
            } else {
                setJobs((prev) => [...prev, ...data.result]);
            }
            setCurrentPage(data.meta.currentPage);
            setTotalPages(data.meta.totalPages);
            setTotalItems(data.meta.totalItems);
        } catch (error) {
            console.log('Error fetching jobs:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const loadMoreJobs = () => {
        if (currentPage < totalPages && !loadingMore) {
            fetchResumeByCandidate(currentPage + 1);
        }
    };

    const renderItem = ({ item }) => {
        return (
            <TouchableWithoutFeedback onPress={() => navigation.navigate('JobDetail', { jobId: item?.jobId?._id })}>
                <View style={StyleShare.jobItemContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Avatar.Image
                            size={50}
                            source={{ uri: item?.companyId?.avatar }}
                        />
                        <View style={{ marginLeft: 10, flex: 1 }}>
                            <Text numberOfLines={2} style={StyleShare.titleText16}>{item?.jobId?.name} </Text>

                            <Text style={{ marginTop: 5, color: textColor }}>{item?.companyId?.name}</Text>
                        </View>
                    </View>
                    <View style={StyleShare.technologyContainer}>
                        <Chip style={StyleShare.chip}>{item.jobId.city || 'N/A'}</Chip>
                        <Chip style={StyleShare.chip}>{item.jobId.level || 'N/A'}</Chip>

                        {item.jobId.skills.map((s, index) => (
                            <Chip key={index} style={StyleShare.chip}>
                                {s || 'N/A'}
                            </Chip>
                        ))}
                        {item.jobId.isUrgent && (
                            <Chip style={[StyleShare.chip, { backgroundColor: 'red' }]} textStyle={{ color: 'white' }}>
                                GẤP
                            </Chip>
                        )}
                    </View>

                    <View style={StyleShare.flexBetween}>
                        <View style={StyleShare.flexCenter}>
                            <Icon name="time" size={20} color={textColor} style={{ marginRight: 5 }} />
                            <Text style={{ color: textColor }}>
                                {moment(item.createdAt).fromNow()}
                            </Text>
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
                    <View style={StyleShare.flexBetween}>
                        <TouchableOpacity onPress={() => navigation.navigate('ResumeClientView', { pdfUri: item?.url })}
                        >
                            <View style={[StyleShare.buttonDetailApply]} >
                                <Icon name="document-outline" size={20} />
                                <Text style={{ marginLeft: 5 }}>Xem lại CV</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.navigate('PrepareScreen', { job: item })}
                        >
                            <View style={[StyleShare.buttonDetailApply]} >
                                <Icon name="trophy-outline" size={20} />
                                <Text style={{ marginLeft: 5 }}>Luyện phỏng vấn</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    };


    return (
        <View style={StyleShare.container}>
            <UIHeader
                leftIcon={"arrow-back"}
                title={'Việc làm đã ứng tuyển'}
                handleLeftIcon={() => { navigation.navigate("MainTab", { "screen": "Profile" }) }} />
            {loading ? (
                <Loading />
            ) : (
                <>
                    <FlatList
                        data={jobs}
                        renderItem={renderItem}
                        keyExtractor={item => item._id}
                        ListEmptyComponent={
                            <View style={{ marginTop: 50, alignItems: 'center' }}>
                                <Image source={require("../../assets/images/save.png")} style={StyleShare.imageNullData} />
                                <Text style={StyleShare.titleText20}>Bạn chưa ứng tuyển việc làm </Text>
                                <Text style={{ padding: 20, textAlign: 'center' }}>Bạn chưa có bất kỳ đơn ứng tuyển nào, hãy ứng tuyển để nhận đươc việc làm mong muốn</Text>
                            </View>
                        }
                        contentContainerStyle={{ paddingBottom: 40 }}
                        onEndReached={loadMoreJobs}
                        onEndReachedThreshold={0.7} // Ngưỡng để kích hoạt loadMore
                        ListFooterComponent={
                            loadingMore ? (
                                <Loading />
                            ) : null
                        }
                    />
                </>
            )}


        </View>
    )
}