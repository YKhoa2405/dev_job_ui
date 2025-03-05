import React, { useContext, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TouchableWithoutFeedback, Image, ActivityIndicator } from "react-native";
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
import { useDispatch, useSelector } from "react-redux";

export default function JobSearchResult({ navigation, route }) {

    const { searchKeywork } = route.params;
    const [level, setLevel] = useState('')
    const [salary, setSalary] = useState('')
    const [jobType, setJobType] = useState('')
    const [selectedProvinceId, setSelectedProvinceId] = useState('');
    const [provinces, setProvinces] = useState([]);

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
        const searchQuery = searchKeywork ? `/${searchKeywork}/i` : '';
        try {
            const token = await AsyncStorage.getItem("access_token");
            const res = await authApi(token).get(endpoints['jobsByClient'], {
                params: {
                    page: currentPage,
                    limit: limit,
                    // name: searchQuery,
                    // level: level,
                    // salary: salary,
                    // jobType: jobType,
                    // city: selectedProvinceId,
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
        <TouchableWithoutFeedback key={item._id} onPress={() => { navigation.navigate('JobDetail', { jobId: item._id }) }}>
            <View style={StyleShare.jobItemContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Avatar.Image source={{ uri: item.companyId.avatar || 'https://example.com/default-avatar.png' }} size={50} style={{ backgroundColor: 'white', marginRight: 5 }} />
                    <View>
                        <Text style={StyleShare.titleText16}>{item.name}</Text>
                        <Text style={{ marginTop: 5 }}>{item.companyId.name}</Text>
                    </View>
                </View>
                <View style={StyleShare.technologyContainer}>
                    <Chip style={StyleShare.chip}>{item.city}</Chip>
                    <Chip style={StyleShare.chip}>{item.level}</Chip>
                    {item.skills.map((s, index) => (
                        <Chip key={index} style={StyleShare.chip}>
                            {s}
                        </Chip>
                    ))}
                </View>
                <View style={StyleShare.flexBetween}>
                    <View style={StyleShare.flexCenter}>
                        <Icon name="time" size={22} color={'grey'} style={{ marginRight: 5 }} />

                        {/* <Text>Đã thêm: {moment(item.created_at).fromNow()}</Text> */}
                        <Text>{moment(item.endDate).format('DD/MM/YYYY')}</Text>
                    </View>
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
                handleLeftIcon={() => { navigation.navigate('JobSearch') }} />
            <View style={{ flex: 1 }}>
                <View style={{ marginHorizontal: 20 }}>
                    <View style={[StyleShare.flexBetween, { marginBottom: 10 }]}>
                        <TouchableOpacity onPress={() => navigation.navigate('JobSearch')} style={StyleShare.searchHome}>
                            <Icon name="search" color={mainColor} size={24} style={{ marginRight: 10 }} />
                            <Text>{searchKeywork}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.searchMap} onPress={() => setModalVisible(true)}>
                            <Icon name="options" size={20} color={white} />
                        </TouchableOpacity>
                    </View>
                </View>
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
                        onEndReached={loadMoreJobs} // Gọi khi đến cuối danh sách
                        onEndReachedThreshold={0.7} // Ngưỡng để kích hoạt loadMore
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