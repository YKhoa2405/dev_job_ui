import React, { useEffect, useState } from "react";
import { View, Image, TouchableOpacity, Text, FlatList, TouchableWithoutFeedback, TextInput } from "react-native";
import StyleShare from "../../assets/themes/StyleShare";
import UIHeader from "../../components/UIHeader";
import { Avatar, Chip } from "react-native-paper";
import Icon from 'react-native-vector-icons/Ionicons'
import { mainColor, white, textColor } from "../../assets/themes/Color";
import Dropdown from "../../components/Dropdown";
import Modal from "react-native-modal";
import Button from "../../components/Button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi, endpoints } from "../../assets/config/API";
import Loading from "../../components/Loading";
import moment from 'moment';


export default function JobSuggestions({ navigation, route }) {
    const { title, api } = route.params;
    console.log(api)
    const [searchKeywork, setSearchKeywork] = useState('')
    const [isModalVisible, setModalVisible] = useState(false);
    const [level, setLevel] = useState(null)
    const [salary, setSalary] = useState(null)
    const [jobType, setJobType] = useState(null)
    const [jobData, setJobData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [limit, setLimit] = useState(10);

    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const levelData = [
        { title: 'Intern' },
        { title: 'Fresher' },
        { title: 'Junior' },
        { title: 'Middle' },
        { title: 'Senior' },
        { title: 'Trưởng nhóm' },
        { title: 'Trưởng phòng' },
        { title: 'Director' },
    ]

    const salaryData = [
        { title: 'Dưới 5 triệu' },
        { title: '10 - 15 triệu' },
        { title: '15 - 20 triệu' },
        { title: '20 - 25 triệu' },
        { title: '30 - 50 triệu' },
        { title: 'Trên 50 triệu' },
        { title: 'Thỏa thuận' }
    ]

    const jobTypeData = [
        { title: 'Office' },
        { title: 'Remote' },
        { title: 'Hybrid' },
    ]

    useEffect(() => {
        fetchListJob(currentPage, limit)
    }, [api])

    const fetchListJob = async (currentPage = 1, limit = 10, name = "") => {
        const searchQuery = name ? `/${name}/i` : '';
        if (currentPage === 1) setLoading(true);
        else setLoadingMore(true);
        try {
            const token = await AsyncStorage.getItem("access_token");
            const res = await authApi(token).get(endpoints[api], {
                params: {
                    isUrgent: true,
                    page: currentPage,
                    limit: limit,
                    name: searchQuery,
                    level: level,
                    salary: salary,
                    jobType: jobType
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
            console.log(data.result)
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

    const applyFilters = () => {
        // Gọi API với các tham số đã chọn
        fetchListJob(1, 10);
        // Đóng modal
        setModalVisible(false);
    };

    const renderItem = ({ item }) => (
        <TouchableWithoutFeedback onPress={() => navigation.navigate('JobDetail', { jobId: item._id })}>
            <View style={[StyleShare.jobItemContainer]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Avatar.Image
                        size={50}
                        source={{ uri: item?.companyId.avatar || 'https://via.placeholder.com/60' }}
                    />
                    <View style={{ marginLeft: 10, flex: 1 }}>
                        <Text style={StyleShare.titleText16} numberOfLines={2}>
                            {item?.name}
                        </Text>
                        <Text style={{ marginTop: 5, color: textColor }}>{item?.companyId.name}</Text>
                    </View>
                </View>

                <View style={StyleShare.technologyContainer}>
                    <Chip style={StyleShare.chip}>{item?.level}</Chip>
                    <Chip style={StyleShare.chip}>{item?.salary}</Chip>

                    {item.isUrgent && (
                        <Chip style={[StyleShare.chip, { backgroundColor: 'red' }]} textStyle={{ color: 'white' }}>
                            GẤP
                        </Chip>
                    )}
                </View>

                <View style={StyleShare.flexBetween}>
                    <View style={StyleShare.flexCenter}>
                        <Icon name="time" size={20} color={textColor} style={{ marginRight: 5 }} />
                        <Text style={{ color: textColor }}>
                            {moment(item.endDate).fromNow()}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );

    return (
        <View style={StyleShare.container}>
            <Modal isVisible={isModalVisible} onBackdropPress={() => setModalVisible(false)}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                backdropTransitionInTiming={500}
                backdropTransitionOutTiming={500}
                style={StyleShare.modalStyle}>
                <View style={StyleShare.modalContent}>
                    <View style={[StyleShare.flexBetween, { marginVertical: 15 }]}>
                        <Text style={StyleShare.titleText20}>Bộ lọc việc làm</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)} >
                            <Icon name="close" size={26} color={'red'} />
                        </TouchableOpacity>
                    </View>


                    <Text style={StyleShare.titleText16}>Level</Text>
                    <Dropdown
                        data={levelData}
                        onSelect={(item) => {
                            setLevel(item.title)
                        }}
                        placeholder="Chọn Level"
                        buttonStyle={{
                            marginTop: 10,
                            width: '100%',
                            height: 50,
                            marginBottom: 20
                        }}
                    />

                    <Text style={StyleShare.titleText16}>Loại hình</Text>
                    <Dropdown
                        data={jobTypeData}
                        onSelect={(item) => {
                            setJobType(item.title)
                        }}
                        placeholder="Chọn loại hình"
                        buttonStyle={{
                            marginTop: 10,
                            width: '100%',
                            height: 50,
                            marginBottom: 20
                        }}
                    />
                    <Text style={StyleShare.titleText16}>Mức lương</Text>
                    <Dropdown
                        data={salaryData}
                        onSelect={(item) => {
                            setSalary(item.title)
                        }}
                        placeholder="Chọn mức lương"
                        buttonStyle={{
                            marginTop: 10,
                            width: '100%',
                            height: 50,
                            marginBottom: 20
                        }}
                    />



                    <Button
                        title={'Áp dụng'}
                        backgroundColor={mainColor}
                        textColor={white}
                        onPress={applyFilters}
                    />
                    {/* <Button
                        title={'Đặt lại'}
                        backgroundColor={bgButton2}
                        textColor={'black'}
                        onPress={resetFilters}
                    /> */}
                </View>
            </Modal>
            <UIHeader
                leftIcon={"arrow-back"}
                title={title}
                rightIcon={"options"}
                handleRightIcon={() => setModalVisible(true)}
                handleLeftIcon={() => { navigation.goBack() }} />
            <View style={{ paddingHorizontal: 20, marginBottom: 5 }}>
                <View style={StyleShare.searchDetail}>
                    <Icon name="search" color={mainColor} size={24} style={{ marginRight: 10 }} />
                    <TextInput
                        style={StyleShare.searchInput}
                        placeholder="Tìm kiếm tin tuyển dụng..."
                        value={searchKeywork}
                        onChangeText={(text) => setSearchKeywork(text)}
                        onSubmitEditing={() => {
                            fetchListJob(1, 10, searchKeywork)
                        }}
                    />
                </View>
                <View style={{ marginTop: 10 }}>
                    {/* <Text style={StyleShare.titleText16}>{totalItems} việc làm</Text> */}
                </View>
            </View>


            <View style={{ flex: 1 }}>
                {loading ? (
                    <Loading />
                ) : (
                    <FlatList
                        data={jobData}
                        keyExtractor={(item) => item._id}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 15 }}
                        onEndReached={loadMoreJobs}
                        onEndReachedThreshold={0.7}
                        ListEmptyComponent={
                            <View style={{ marginTop: 50, alignItems: 'center' }}>
                                <Image source={require("../../assets/images/save.png")} style={StyleShare.imageNullData} />
                                <Text style={StyleShare.titleText20}>Không có tin tuyển dụng nào hiển thịthị</Text>
                                <Text style={{ padding: 20, textAlign: 'center' }}>Hiện tại chưa có tin tuyển dụng nào phù hợp, hãy quay lại sau nhé.</Text>
                            </View>
                        }
                        ListFooterComponent={
                            loadingMore ? (
                                <Loading />
                            ) : null
                        }
                    />
                )}
            </View>

        </View>
    )
}