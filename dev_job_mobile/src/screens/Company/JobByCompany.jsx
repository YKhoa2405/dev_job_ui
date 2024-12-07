import React, { useEffect, useState } from "react";
import { View, Image, TouchableOpacity, Text, FlatList, TouchableWithoutFeedback, TextInput } from "react-native";
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



export default function JobByCompany({ navigation }) {
    const [jobData, setJobData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [limit, setLimit] = useState(10);
    const [loading, setLoading] = useState(false)
    const [searchKeywork, setSearchKeywork] = useState('')
    const [selectedStatus, setSelectedStatus] = useState(null);

    useEffect(() => {
        fetchJobByCompany(currentPage, limit, '');
    }, [currentPage]);

    const fetchJobByCompany = async (currentPage = 1, limit = 10, name = '') => {
        setLoading(true)
        const searchQuery = {
            name: name ? `/${name}/i` : '',
        };
        console.log(searchQuery)
        try {
            const token = await AsyncStorage.getItem("access_token");
            const res = await authApi(token).get(endpoints['jobsByCompany']('67433ef7c2689cf41f1fae48'), {
                params: {
                    page: currentPage,
                    limit: limit,
                    name: searchQuery.name,
                },
            });
            const data = res.data.data;
            setJobData(data.result); // Update company data
            setCurrentPage(data.meta.currentPage); // Update the current page from API response
            setTotalPages(data.meta.totalPages); // Update the total pages from API response
            setTotalItems(data.meta.totalItems); // Update the total pages from API response
            console.log(data.result)
        } catch (error) {
            console.log('Error fetching companies:', error);
        } finally {
            setLoading(false)
        }
    };


    const activeData = [
        { title: 'Hoạt động', value: true },
        { title: 'Dừng hoạt động', value: false },
    ];

    const renderItem = ({ item }) => {
        return (
            <TouchableWithoutFeedback>
                <View style={StyleShare.jobItemContainer}>
                    <View style={StyleShare.flexBetween}>
                        <Text style={StyleShare.titleText16}>{item.name}</Text>
                        <TouchableOpacity style={{ zIndex: 999 }} >
                            <Icon name="notifications-circle" size={24} style={{ marginLeft: 10 }} color={orange} />
                        </TouchableOpacity>
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
                        <View style={StyleShare.flexBetween}>
                            <View style={StyleShare.flexCenter}>
                                <Icon name="time" size={22} color={'grey'} style={{ marginRight: 5 }} />
                                <Text>{moment(item.endDate).format("DD/MM/YYYY")}</Text>
                            </View>
                        </View>
                        <View>
                            {item.isActive ? <Text style={[StyleShare.titleText16, { color: orange }]}>Đang hoạt động</Text>
                                : <Text style={[StyleShare.titleText16, { color: mainColor }]}>Hết hạn</Text>}
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
                title={'Quản lý  tuyển dụng'}
                rightIcon={'flash-off-outline'}
                // handleRightIcon={}
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
                            fetchJobByCompany(1, 10, searchKeywork)
                        }}
                    />
                </View>
                <View>
                    <Dropdown
                        data={activeData}
                        onSelect={(item) => {
                            setSelectedStatus(item.value); // Lưu giá trị true/false
                        }}
                        value={
                            selectedStatus !== null
                                ? activeData.find((item) => item.value === selectedStatus)?.title
                                : null
                        }
                        placeholder="Chọn trạng thái"
                    />
                </View>
                <View style={{ marginTop: 10 }}>
                    <Text style={StyleShare.titleText16}>{totalItems} việc làm</Text>
                </View>
            </View>
            {loading ? (
                <Loading />
            ) : (
                <FlatList
                    data={jobData}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    ListEmptyComponent={
                        <View style={{ marginTop: 50, alignItems: 'center' }}>
                            <Image source={require("../../assets/images/save.png")} style={StyleShare.imageNullData} />
                            <Text style={StyleShare.titleText20}>Bạn chưa ứng tuyển việc làm </Text>
                            <Text style={{ padding: 20, textAlign: 'center' }}>Bạn chưa có bất kỳ đơn ứng tuyển nào, hãy ứng tuyển để nhận đươc việc làm mong muốn</Text>
                        </View>
                    }
                />
            )}
        </View>
    )
}