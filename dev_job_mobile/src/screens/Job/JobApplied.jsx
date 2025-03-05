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


export default function JobApplied({ navigation }) {
    const [jobs, setJobs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);


    useEffect(() => {
        fetchListResume();
    }, []);
    console.log(jobs)

    const fetchListResume = async (currentPage = 1, limit = 10) => {
        if (currentPage === 1) setLoading(true);
        else setLoadingMore(true);
        try {
            const token = await AsyncStorage.getItem("access_token");
            const res = await authApi(token).get(endpoints['resumeByUser'], {
                params: {
                    page: currentPage,
                    limit: limit,
                },
            });
            const data = res.data.data;
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
            fetchListResume(currentPage + 1);
        }
    };

    const renderItem = ({ item }) => {
        return (
            <TouchableWithoutFeedback>
                <View style={StyleShare.jobItemContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Avatar.Image
                            size={36}
                            source={{ uri: item?.companyId?.avatar }}
                            style={{ backgroundColor: 'white' }}
                        />
                        <View style={{ marginLeft: 10 }}>
                            <Text style={StyleShare.titleText16}>{item?.jobId?.name}</Text>
                            <Text style={{ marginTop: 5, color: 'gray' }}>{item?.companyId?.name}</Text>
                        </View>
                    </View>

                    <View style={StyleShare.technologyContainer}>
                        <Chip style={StyleShare.chip}>{item?.jobId?.salary}</Chip>
                        <Chip style={StyleShare.chip}>{item?.jobId?.level}</Chip>
                        <Chip style={StyleShare.chip}>{moment(item.jobId.createdAt).format('DD/MM/YYYY')}</Chip>
                    </View>


                    <View style={StyleShare.flexBetween}>
                        <View style={StyleShare.flexCenter}>
                            <Icon name="time" size={22} color={'grey'} style={{ marginRight: 5 }} />
                            <Text style={{ color: 'gray' }}>
                                {moment(item.createdAt).fromNow()}
                            </Text>
                        </View>
                        <View>
                            <Text style={StyleShare.titleText16}>{item.status}</Text>
                        </View>
                    </View>
                    <View style={StyleShare.flexBetween}>
                        <TouchableOpacity onPress={() => handleOpenCv(item.cv)}>
                            <View style={[StyleShare.buttonDetailApply]}>
                                <Icon name="document-outline" size={22} />
                                <Text style={{ marginLeft: 5 }}>Xem lại CV</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity >
                            <View style={[StyleShare.buttonDetailApply]}>
                                <Icon name="chatbubble-outline" size={22} />
                                <Text style={{ marginLeft: 5 }}>Gửi tin nhắn</Text>
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
                handleLeftIcon={() => { navigation.goBack() }} />
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
                        onEndReached={loadMoreJobs} // Gọi khi đến cuối danh sách
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