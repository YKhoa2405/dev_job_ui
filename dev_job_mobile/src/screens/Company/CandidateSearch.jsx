import React, { useContext, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TouchableWithoutFeedback, Image, ActivityIndicator, SafeAreaViewBase } from "react-native";
import Icon from "react-native-vector-icons/Ionicons"
import { mainColor, bgButton2, grey, orange, white } from "../../assets/themes/Color";
import { Searchbar, Chip, Avatar } from "react-native-paper";
import moment from "moment";
import StyleShare from "../../assets/themes/StyleShare";
import Dropdown from "../../components/Dropdown";
import { authApi, endpoints } from "../../assets/config/API";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loading from "../../components/Loading";
import UIHeader from "../../components/UIHeader";
import Modal from "react-native-modal";
import axios from "axios";
import Button from "../../components/Button";

export default function CandidateSearch({ navigation, route }) {
    const [provinces, setProvinces] = useState([]);
    const [level, setLevel] = useState(null)
    const [salary, setSalary] = useState(null)
    const [jobType, setJobType] = useState(null)
    const [selectedProvinceId, setSelectedProvinceId] = useState('');
    const [availability, setAvailability] = useState(null);

    const [jobData, setJobData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const [loading, setLoading] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false);
    const [isModalVisible, setModalVisible] = useState(false);

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

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

    const availabilityData = [
        { title: 'Ngay lập tức' },
        { title: '1 tuần' },
        { title: '2 tuần' },
        { title: '1 tháng' },
    ];

    useEffect(() => {
        fetchProvinces();
        fetchListJob();
    }, [])

    const fetchProvinces = async () => {
        try {
            const res = await axios.get('https://esgoo.net/api-tinhthanh/1/0.htm');
            setProvinces(res.data.data || []);
        } catch (error) {
            console.log('Error fetching provinces:', error);
        }
    };

    const fetchListJob = async (currentPage = 1, limit = 10) => {
        if (currentPage === 1) setLoading(true);
        else setLoadingMore(true);
        try {
            const token = await AsyncStorage.getItem("access_token");

            const res = await authApi(token).get(endpoints['candidates'], {
                params: {
                    page: currentPage,
                    limit: limit,
                    level: level,
                    salary: salary,
                    jobType: jobType,
                    location: selectedProvinceId,
                    availability: availability,
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
            console.log(data)
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
        <TouchableWithoutFeedback key={item._id} onPress={() => { navigation.navigate('CandidatesProfile', { userId: item.userId }) }}>
            <View style={StyleShare.jobItemContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Avatar.Image source={{ uri: item.avatar || 'https://via.placeholder.com/60' }} size={50} style={{ backgroundColor: 'white', marginRight: 5 }} />
                    <View>
                        <Text style={StyleShare.titleText16}>{item.fullName}</Text>
                        <Text style={{ marginTop: 5 }}>{item.email}</Text>
                    </View>
                </View>
                <View style={StyleShare.technologyContainer}>
                    <Chip style={StyleShare.chip}>{item.jobType}</Chip>
                    <Chip style={StyleShare.chip}>{item.location}</Chip>
                    {item.skills.map((s, index) => (
                        <Chip key={index} style={StyleShare.chip}>
                            {s}
                        </Chip>
                    ))}
                </View>
            </View>
        </TouchableWithoutFeedback>
    );


    return (
        <View style={StyleShare.container}>
            <Modal isVisible={isModalVisible} onBackdropPress={toggleModal}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                backdropTransitionInTiming={500}
                backdropTransitionOutTiming={500}
                style={StyleShare.modalStyle}>
                <View style={StyleShare.modalContent}>
                    <View style={[StyleShare.flexBetween, { marginVertical: 15 }]}>
                        <Text style={StyleShare.titleText20}>Bộ lọc ứng viên</Text>
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
                    <Text style={StyleShare.titleText16}>Địa điểm</Text>
                    <Dropdown
                        data={provinces.map(province => ({ title: province.full_name, id: province.id }))}
                        onSelect={(item) => {
                            setSelectedProvinceId(item.title);
                        }}
                        placeholder="Chọn địa điểm"
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

                    <Text style={StyleShare.titleText16}>Trạng thái tìm việc</Text>
                    <Dropdown
                        data={availabilityData}
                        onSelect={(item) => {
                            setAvailability(item.title);
                        }}
                        placeholder="Chọn trạng thái"
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
                </View>
            </Modal>
            <UIHeader
                leftIcon={"arrow-back"}
                title={'Tìm kiếm ứng viên'}
                rightIcon={"options"}
                handleRightIcon={() => setModalVisible(true)}
                handleLeftIcon={() => { navigation.goBack() }} />
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
                        ListEmptyComponent={
                            <View style={{ marginTop: 50, alignItems: 'center' }}>
                                <Image source={require("../../assets/images/save.png")} style={StyleShare.imageNullData} />
                                <Text style={StyleShare.titleText20}>Không có kết qủa tìm kiếm</Text>
                                <Text style={{ padding: 20, textAlign: 'center' }}>Bạn hãy thử thay đổi từ khóa hoặc loại bỏ bớt tiêu chí lọc và thử lại </Text>
                            </View>
                        }
                        onEndReached={loadMoreJobs}
                        onEndReachedThreshold={0.7}
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

const styles = StyleSheet.create({
    searchMap: {
        padding: 12,
        borderRadius: 10,
        backgroundColor: orange,
        elevation: 2
    },
})