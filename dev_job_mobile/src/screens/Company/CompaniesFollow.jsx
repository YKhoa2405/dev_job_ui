import { StyleSheet, View, Text, TouchableWithoutFeedback, Image, TouchableOpacity, FlatList, Alert } from "react-native";
import UIHeader from "../../components/UIHeader";
import StyleShare from "../../assets/themes/StyleShare";
import { bgButton2, mainColor, white, orange } from "../../assets/themes/Color";
import Dropdown from "../../components/Dropdown";
import Icon from 'react-native-vector-icons/Ionicons'
import { Avatar, Chip } from "react-native-paper";
import { useEffect, useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi, endpoints } from "../../assets/config/API";
import Loading from "../../components/Loading";


export default function CompaniesFollow({ navigation }) {
    const [companies, setCompanies] = useState([])
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const [loading, setLoading] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        fetchListFollow();
    }, [])

    const fetchListFollow = async (currentPage = 1, limit = 10) => {
        if (currentPage === 1) setLoading(true);
        else setLoadingMore(true);
        try {
            const token = await AsyncStorage.getItem("access_token");
            const res = await authApi(token).get(endpoints['follows'], {
                params: {
                    page: currentPage,
                    limit: limit,
                },
            });
            const data = res.data.data;
            if (currentPage === 1) {
                setCompanies(data.result);
            } else {
                setCompanies((prev) => [...prev, ...data.result]);
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

    const handleUnFollow = async (companyId) => {
        Alert.alert(
            'Bỏ theo dõi',
            'Khi bỏ theo dõi bạn sẽ không nhận được thông tin tuyển dụng của công ty này nữa?',
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
                            const res = await authApi(token).delete(endpoints['followDetail'](companyId));
                            console.log(res.data)
                            if (res.data.statusCode === 200) {
                                setCompanies(prevJobs => prevJobs.filter(c => c.companyId._id !== companyId));
                                setTotalItems(prevTotalItems => prevTotalItems - 1);
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

    };

    const loadMoreJobs = () => {
        if (currentPage < totalPages && !loadingMore) {
            fetchJobByCompany(currentPage + 1);
        }
    };

    const renderItem = ({ item }) => {
        return (
            <TouchableWithoutFeedback key={item._id} onPress={() => { navigation.navigate('CompanyDetail', { _id: item.companyId._id }) }}>
                <View style={StyleShare.jobItemContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Avatar.Image source={{ uri: item.companyId.avatar || 'https://example.com/default-avatar.png' }} size={50} style={{  marginRight: 5 }} />
                        <View>
                            <Text style={StyleShare.titleText16}>{item.companyId.name}</Text>
                            <Text style={{ marginTop: 5 }}>{item.companyId.slogan}</Text>
                        </View>
                    </View>
                    <View style={[StyleShare.flexBetween, { marginVertical: 10 }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Icon name="business-outline" size={18} />
                            <Text style={{ marginLeft: 5, fontSize: 12, fontWeight: '500' }}>{item.companyId.size} người theo dõi</Text>

                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Icon name="person-outline" size={18} />
                            <Text style={{ marginLeft: 5, fontSize: 12, fontWeight: '500' }}>{item.companyId.followers} người theo dõi</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.buttonUnfollow} onPress={() => handleUnFollow(item.companyId._id)}>
                        <Text style={{ color: white, fontWeight: 500 }}>Đang theo dõi</Text>
                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
        )
    };

    return (
        <View style={StyleShare.container}>
            <UIHeader leftIcon={"arrow-back"}
                title={'Công ty đang theo dõi'}
                handleLeftIcon={() => { navigation.goBack() }} />
            <View style={{ paddingHorizontal: 20, marginBottom: 5 }}>
                <Text style={StyleShare.titleText16}>{totalItems} công ty</Text>
            </View>
            {loading ? (
                <Loading />
            ) : (
                <FlatList
                    data={companies}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 15 }}
                    ListEmptyComponent={
                        <View style={{ marginTop: 50, alignItems: 'center' }}>
                            <Image source={require("../../assets/images/save.png")} style={StyleShare.imageNullData} />
                            <Text style={StyleShare.titleText20}>Bạn chưa theo dõi công ty</Text>
                            <Text style={{ padding: 20, textAlign: 'center' }}>Bạn chưa theo dõi bất kỳ công ty nào, hãy theo dõi công ty để nhận được thông báo việc làm mới nhất</Text>
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
    )
}

const styles = StyleSheet.create({

    buttonUnfollow: {
        alignItems: 'center',
        backgroundColor: mainColor,
        padding: 8,
        borderRadius: 10,
        zIndex: 999
    },
})