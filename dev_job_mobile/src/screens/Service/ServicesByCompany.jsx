import React, { useEffect, useState } from "react";
import { View, Text, TouchableWithoutFeedback, StyleSheet, ActivityIndicator, FlatList, Image, TextInput } from "react-native";
import UIHeader from "../../components/UIHeader";
import StyleShare from "../../assets/themes/StyleShare";
import { grey, mainColor, orange, white } from "../../assets/themes/Color";
import { authApi, endpoints } from "../../assets/config/API";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loading from "../../components/Loading";
import moment from "moment";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Icon from 'react-native-vector-icons/Ionicons'



export default function ServicesByCompany({ navigation, route }) {
    const Tab = createMaterialTopTabNavigator();
    const { companyId } = route.params

    const Tab1 = () => {
        const [loading, setLoading] = useState(false);
        const [services, setServices] = useState([]);
        const [meta, setMeta] = useState('');

        useEffect(() => {
            fetchServicesByCompany()
        }, [companyId])

        const fetchServicesByCompany = async () => {
            setLoading(true)
            try {
                const token = await AsyncStorage.getItem("access_token");
                const res = await authApi(token).get(endpoints['orderByCompany']('67433ef7c2689cf41f1fae48'));
                console.log(res.data)
                setServices(res.data.data.result);
                setMeta(res.data.data.meta);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        const renderItem = ({ item }) => {
            return (
                <View style={StyleShare.jobItemContainer}>
                    <Text style={StyleShare.titleText20}>{item.serviceId.name}</Text>
                    <Text style={[StyleShare.titleText20, { marginVertical: 5, color: orange }]}>{formatVND(item.serviceId.price)}</Text>
                    <Text style={{ fontWeight: '500', fontSize: 16 }}>Thời hạn: {item.serviceId.durationDays} ngày</Text>

                    <View style={{ marginTop: 10 }}>
                        <Text style={{ fontWeight: '500', fontSize: 16, color: 'grey' }}>Ngày áp dụng: <Text style={{ color: orange, fontWeight: '500' }}>{moment(item.createdAt, "YYYYMMDDHHmmss").format("DD-MM-YYYY")}</Text></Text>
                    </View>

                </View>
            );
        };


        return (
            <View style={{ flex: 1 }}>
                {loading ? <>
                    <Loading />
                </> : <>
                    <View style={{ marginTop: 10, marginHorizontal: 20 }}>
                    </View>
                    <View style={StyleShare.jobItemContainer}>
                        <Text style={{ fontWeight: '500', color: 'grey' }}>Tổng chi: <Text style={{ color: '#28a745' }}>
                            {formatVND(meta.totalAmount / 100)}
                        </Text></Text>
                        <Text style={{ fontWeight: '500', color: 'grey' }}>Dịch vụ áp dụng: <Text style={{ color: '#28a745' }}>
                            {meta.totalItems}
                        </Text></Text>

                    </View>
                    <FlatList
                        data={services}
                        renderItem={renderItem}
                        keyExtractor={(item) => item._id}
                        ListEmptyComponent={
                            <View style={{ marginTop: 50, alignItems: 'center' }}>
                                <Image source={require("../../assets/images/save.png")} style={StyleShare.imageNullData} />
                                <Text style={StyleShare.titleText20}>Bạn chưa mua bất kỳ dịch vụ nào</Text>
                                <Text style={{ padding: 20, textAlign: 'center' }}>Bạn chưa có bất kỳ dịch vụ  nào, hãy mua dịch vụ để tăng hiệu quả cho quá trình tuyển dụng</Text>
                            </View>
                        }
                    />
                </>}
            </View>
        );

    };


    const Tab2 = () => {
        const [paymentData, setPaymentData] = useState([]);
        const [currentPage, setCurrentPage] = useState(1);
        const [totalPages, setTotalPages] = useState(1);
        const [totalItems, setTotalItems] = useState(0);

        const [loading, setLoading] = useState(false)
        const [loadingMore, setLoadingMore] = useState(false);
        const [searchKeywork, setSearchKeywork] = useState('')

        useEffect(() => {
            fetchListPayment(1);
        }, []);

        const renderItem = ({ item }) => {
            return (
                <TouchableWithoutFeedback>
                    <View style={StyleShare.jobItemContainer}>
                        <View style={StyleShare.flexBetween}>
                            <Text style={{ fontWeight: '500', color: 'grey', fontSize: 14 }}>{moment(item.vnp_PayDate, "YYYYMMDDHHmmss").format("DD-MM-YYYY HH:mm")}</Text>
                            <Text
                                style={{
                                    fontWeight: '500',
                                    fontSize: 14,
                                    color: item.vnp_TransactionStatus === 'Success' ? '#28a745' : '#dc3545' // màu xanh cho thành công, đỏ cho thất bại
                                }}
                            >
                                {item.vnp_TransactionStatus === 'Success' ? 'Thành công' : 'Thất bại'}
                            </Text>
                        </View>
                        <View style={{ marginTop: 10 }}>
                            <Text style={StyleShare.titleText16}>{(item.vnp_OrderInfo).replace(/\+/g, ' ')}</Text>
                            <Text style={{ fontWeight: '500', color: 'grey' }}>Mã giao dịch:{item.vnp_TransactionNo}</Text>
                            <Text style={{ fontWeight: '500', color: 'grey' }}>Số tiền:
                                <Text style={{ color: '#28a745' }}>
                                    {formatVND(item.vnp_Amount / 100)}
                                </Text>
                            </Text>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            );
        };

        const fetchListPayment = async (currentPage = 1, limit = 10) => {
            console.log(endpoints['paymentByCompany'](companyId))
            if (currentPage === 1) setLoading(true);
            else setLoadingMore(true);
            const searchQuery = searchKeywork ? `/${searchKeywork}/i` : '';
            try {
                const token = await AsyncStorage.getItem("access_token");
                const res = await authApi(token).get(endpoints['paymentByCompany'](companyId), {
                    params: {
                        page: currentPage,
                        limit: limit,
                        vnp_TransactionNo: searchKeywork,
                    },
                });
                const data = res.data.data;
                console.log('payment', data.result)
                if (currentPage === 1) {
                    setPaymentData(data.result);
                } else {
                    setPaymentData((prev) => [...prev, ...data.result]);
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

        const loadingMorePayment = () => {
            if (currentPage < totalPages && !loadingMore) {
                fetchListPayment(currentPage + 1);
            }
        };



        return (
            <View style={{ flex: 1, marginTop: 10 }}>
                <View style={{ paddingHorizontal: 20, marginBottom: 5 }}>
                    <View style={StyleShare.searchDetail}>
                        <Icon name="search" color={mainColor} size={24} style={{ marginRight: 10 }} />
                        <TextInput
                            style={StyleShare.searchInput}
                            placeholder="Tìm kiếm giao dịch (mã giao dịch) ..."
                            value={searchKeywork}
                            onChangeText={(text) => setSearchKeywork(text)}
                            onSubmitEditing={() => {
                                fetchListPayment(1, 10, searchKeywork)
                            }}
                        />
                    </View>
                </View>
                {loading ? (
                    <Loading />
                ) : (
                    <FlatList
                        data={paymentData}
                        keyExtractor={(item) => item._id}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 15 }}
                        ListEmptyComponent={
                            <View style={{ marginTop: 50, alignItems: 'center' }}>
                                <Image source={require("../../assets/images/save.png")} style={StyleShare.imageNullData} />
                                <Text style={StyleShare.titleText20}>Bạn chưa có bất kỳ giao dịch nào nào</Text>
                                <Text style={{ padding: 20, textAlign: 'center' }}>Bạn chưa có bất kỳ giao dịch nào, hãy mua dịch vụ để tăng hiệu quả cho quá trình tuyển dụng</Text>
                            </View>
                        }
                        onEndReached={loadingMorePayment} // Gọi khi đến cuối danh sách
                        onEndReachedThreshold={0.7} // Ngưỡng để kích hoạt loadMore
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



    const formatVND = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };



    return (
        <View style={StyleShare.container}>
            <UIHeader leftIcon={"arrow-back"}
                rightIcon={"ellipsis-horizontal"}
                title={'Dịch vụ của bạn'}
                handleLeftIcon={() => { navigation.goBack() }} />

            <View style={{ flex: 1 }}>
                <Tab.Navigator
                    screenOptions={{
                        tabBarActiveTintColor: orange, // Color of the selected tab
                        tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold' }, // Style for tab labels
                        tabBarIndicatorStyle: { backgroundColor: orange }, // Style for the indicator of the selected tab
                        tabBarStyle: { backgroundColor: grey },
                    }}>
                    <Tab.Screen name="Dịch vụ đã áp dụng" component={Tab1} />
                    <Tab.Screen name={'Lịch sử giao dịch'} component={Tab2} />
                </Tab.Navigator>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    serviceItemContainer: {
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: white,
        marginTop: 15,
        marginHorizontal: 20,
    },
});
