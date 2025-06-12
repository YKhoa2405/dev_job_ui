import React, { useEffect, useState, useCallback, memo } from "react";
import { View, Text, TouchableWithoutFeedback, StyleSheet, FlatList, Image, TextInput, TouchableOpacity, Alert } from "react-native";
import UIHeader from "../../components/UIHeader";
import StyleShare from "../../assets/themes/StyleShare";
import { grey, mainColor, orange, white, green, textColor } from "../../assets/themes/Color";
import { authApi, endpoints } from "../../assets/config/API";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loading from "../../components/Loading";
import moment from "moment";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Icon from 'react-native-vector-icons/Ionicons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
};

// Memoized Components
const ServiceItem = memo(({ item, navigation, companyId }) => (

    <View style={StyleShare.jobItemContainer}>
        <Text style={StyleShare.titleText20}>{item.serviceId.name}</Text>
        <Text style={[StyleShare.titleText20, { marginVertical: 5, color: orange }]}>
            {formatVND(item.amount)}
        </Text>
        {item?.remainingUses != null && (
            <Text style={{ color: textColor }}>
                Số lượt còn lại: <Text style={{ fontWeight: 'bold' }}>{item.remainingUses}</Text>
            </Text>
        )}
        <View style={StyleShare.flexBetween}>
            <Text style={{ color: textColor }}>
                Ngày hết hạn: <Text style={{ fontWeight: 'bold' }}>
                    {moment(item.endDate, "YYYYMMDDHHmmss").format("DD-MM-YYYY")}
                </Text>
            </Text>
            <Text style={[StyleShare.titleText16, { color: item.isActive ? green : 'red' }]}>
                {item.isActive ? 'Đang hoạt động' : 'Hết hạn'}
            </Text>
        </View>
        {!item.isActive && (
            <TouchableOpacity
                style={StyleShare.buttonDetailApply}
                onPress={() => navigation.navigate('Services', { companyId })}
            >
                <Text style={{ fontWeight: '500' }}>Gia hạn dịch vụ</Text>
            </TouchableOpacity>
        )}
    </View>
));

const PaymentItem = memo(({ item, navigation }) => {
    const canRequestRefund = item.vnp_TransactionStatus === 'Success';

    return (
        <TouchableWithoutFeedback>
            <View style={StyleShare.jobItemContainer}>
                <View style={StyleShare.flexBetween}>
                    <Text style={{ fontWeight: '500', color: textColor }}>
                        {moment(item.vnp_PayDate, "YYYYMMDDHHmmss").format("DD-MM-YYYY HH:mm")}
                    </Text>
                    <Text
                        style={{
                            fontWeight: '500',
                            color: item.vnp_TransactionStatus === 'Success' ? green : '#dc3545',
                        }}
                    >
                        {item.vnp_TransactionStatus === 'Success' ? 'Thành công' : 'Thất bại'}
                    </Text>
                </View>
                <View style={{ marginTop: 10 }}>
                    <Text style={StyleShare.titleText16}>
                        {(item.vnp_OrderInfo).replace(/\+/g, ' ')}
                    </Text>
                    <Text style={{ fontWeight: '500', color: textColor, marginVertical: 5 }}>
                        Mã giao dịch: {item.vnp_TransactionNo}
                    </Text>
                    <Text style={{ fontWeight: '500', color: textColor }}>
                        Số tiền: <Text style={{ color: green }}>{formatVND(item.vnp_Amount)}</Text>
                    </Text>
                </View>
                {/* {canRequestRefund && (
                    <TouchableOpacity
                        style={[StyleShare.buttonDetailApply, { marginTop: 10, backgroundColor: mainColor }]}
                        onPress={() => navigation.navigate('RefundRequestScreen', { payment: item })}
                    >
                        <Text style={{ fontWeight: '500', color: white }}>Yêu cầu hoàn tiền</Text>
                    </TouchableOpacity>
                )} */}
            </View>
        </TouchableWithoutFeedback>
    );
});

export default function ServicesByCompany({ navigation, route }) {
    const Tab = createMaterialTopTabNavigator();
    const { companyId } = route.params;

    const Tab1 = () => {
        const [loading, setLoading] = useState(false);
        const [services, setServices] = useState([]);
        const [meta, setMeta] = useState({});

        const fetchServicesByCompany = useCallback(async () => {
            setLoading(true);
            try {
                const token = await AsyncStorage.getItem("access_token");
                const res = await authApi(token).get(endpoints['orderByCompany'](companyId));
                setServices(res.data.data.result || []);
                setMeta(res.data.data.meta || {});
            } catch (error) {
                console.error('Fetch services error:', error);
            } finally {
                setLoading(false);
            }
        }, [companyId]);

        useEffect(() => {
            fetchServicesByCompany();
        }, [fetchServicesByCompany]);

        return (
            <View style={{ flex: 1 }}>
                {loading ? <Loading /> : (
                    <>
                        <View style={{ marginTop: 10, marginHorizontal: 20 }} />
                        <View style={StyleShare.jobItemContainer}>
                            <Text style={{ fontWeight: '500', color: textColor }}>
                                Tổng chi: <Text style={{ color: green }}>{formatVND(meta.totalAmount || 0)}</Text>
                            </Text>
                            <Text style={{ fontWeight: '500', color: textColor }}>
                                Dịch vụ áp dụng: <Text style={{ color: green }}>{meta.totalItems || 0}</Text>
                            </Text>
                        </View>
                        <FlatList
                            data={services}
                            renderItem={({ item }) => <ServiceItem item={item} navigation={navigation} companyId={companyId} />}
                            keyExtractor={(item) => item._id}
                            initialNumToRender={10}
                            maxToRenderPerBatch={10}
                            windowSize={5}
                            ListEmptyComponent={
                                <View style={{ marginTop: 50, alignItems: 'center' }}>
                                    <Image source={require("../../assets/images/save.png")} style={StyleShare.imageNullData} />
                                    <Text style={StyleShare.titleText20}>Bạn chưa mua bất kỳ dịch vụ nào</Text>
                                    <Text style={{ padding: 20, textAlign: 'center' }}>
                                        Bạn chưa có bất kỳ dịch vụ nào, hãy mua dịch vụ để tăng hiệu quả cho quá trình tuyển dụng
                                    </Text>
                                </View>
                            }
                        />
                    </>
                )}
            </View>
        );
    };

    const Tab2 = () => {
        const [paymentData, setPaymentData] = useState([]);
        const [currentPage, setCurrentPage] = useState(1);
        const [totalPages, setTotalPages] = useState(1);
        const [loading, setLoading] = useState(false);
        const [loadingMore, setLoadingMore] = useState(false);
        const [searchKeyword, setSearchKeyword] = useState('');

        const fetchListPayment = useCallback(async (page = 1, limit = 10) => {
            const isFirstPage = page === 1;
            isFirstPage ? setLoading(true) : setLoadingMore(true);

            try {
                const token = await AsyncStorage.getItem("access_token");
                const searchQuery = searchKeyword ? `/${searchKeyword}/i` : '';
                const res = await authApi(token).get(endpoints['paymentByCompany'](companyId), {
                    params: { page, limit, vnp_TransactionNo: searchQuery },
                });

                const data = res.data.data;
                setPaymentData(prev => isFirstPage ? data.result : [...prev, ...data.result]);
                setCurrentPage(data.meta.currentPage);
                setTotalPages(data.meta.totalPages);
            } catch (error) {
                console.error('Fetch payments error:', error);
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        }, [companyId, searchKeyword]);

        useEffect(() => {
            fetchListPayment(1);
        }, [fetchListPayment]);

        const loadMorePayment = useCallback(() => {
            if (currentPage < totalPages && !loadingMore) {
                fetchListPayment(currentPage + 1);
            }
        }, [currentPage, totalPages, loadingMore, fetchListPayment]);

        const exportToCSV = async () => {
            try {
                const csvContent = [
                    'Ngày giao dịch,Trạng thái,Thông tin,Mã giao dịch,Số tiền',
                    ...paymentData.map(item =>
                        `${moment(item.vnp_PayDate, "YYYYMMDDHHmmss").format("DD-MM-YYYY HH:mm")},${item.vnp_TransactionStatus === 'Success' ? 'Thành công' : 'Thất bại'},${(item.vnp_OrderInfo).replace(/\+/g, ' ')},${item.vnp_TransactionNo},${item.vnp_Amount / 100}`
                    )
                ].join('\n');

                const fileUri = `${FileSystem.documentDirectory}transactions_${companyId}.csv`;
                await FileSystem.writeAsStringAsync(fileUri, csvContent);
                await Sharing.shareAsync(fileUri);
            } catch (error) {
                console.error('Export error:', error);
            }
        };

        return (
            <View style={{ flex: 1, marginTop: 10 }}>
                <View style={{ paddingHorizontal: 20, marginBottom: 5 }}>
                    <View style={StyleShare.searchDetail}>
                        <Icon name="search" color={mainColor} size={24} style={{ marginRight: 10 }} />
                        <TextInput
                            style={StyleShare.searchInput}
                            placeholder="Tìm kiếm giao dịch (mã giao dịch)"
                            value={searchKeyword}
                            onChangeText={setSearchKeyword}
                            onSubmitEditing={() => fetchListPayment(1)}
                        />
                    </View>
                    <TouchableOpacity
                        style={[StyleShare.buttonDetailApply, { marginTop: 10, backgroundColor: orange }]}
                        onPress={exportToCSV}
                    >
                        <Text style={{ fontWeight: '500', color: 'white' }}>Xuất file CSV</Text>
                    </TouchableOpacity>
                </View>
                {loading ? <Loading /> : (
                    <>

                        <FlatList
                            data={paymentData}
                            keyExtractor={(item) => item._id}
                            renderItem={({ item }) => <PaymentItem item={item} navigation={navigation} />}
                            initialNumToRender={10}
                            maxToRenderPerBatch={10}
                            windowSize={5}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 15 }}
                            onEndReached={loadMorePayment}
                            onEndReachedThreshold={0.7}
                            ListEmptyComponent={
                                <View style={{ marginTop: 50, alignItems: 'center' }}>
                                    <Image source={require("../../assets/images/save.png")} style={StyleShare.imageNullData} />
                                    <Text style={StyleShare.titleText20}>Bạn chưa có bất kỳ giao dịch nào</Text>
                                    <Text style={{ padding: 20, textAlign: 'center' }}>
                                        Bạn chưa có bất kỳ giao dịch nào, hãy mua dịch vụ để tăng hiệu quả cho quá trình tuyển dụng
                                    </Text>
                                </View>
                            }
                            ListFooterComponent={loadingMore && <Loading />}
                        />
                    </>

                )}
            </View>
        );
    };

    const Tab3 = () => {
        const [refundRequests, setRefundRequests] = useState([]);
        const [loading, setLoading] = useState(false);

        const fetchRefundRequests = useCallback(async () => {
            setLoading(true);
            try {
                const token = await AsyncStorage.getItem('access_token');
                const res = await authApi(token).get(endpoints['refundRequests'](companyId));
                setRefundRequests(res.data.data.result || []);
            } catch (error) {
                console.log('Fetch refund requests error:', error);
            } finally {
                setLoading(false);
            }
        }, [companyId]);

        useEffect(() => {
            fetchRefundRequests();
        }, [fetchRefundRequests]);

        return (
            <View style={{ flex: 1, marginTop: 10 }}>
                {loading ? <Loading /> : (
                    <FlatList
                        data={refundRequests}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => (
                            <View style={StyleShare.jobItemContainer}>
                                <Text style={{ fontWeight: '500', color: textColor }}>
                                    Mã giao dịch: {item.vnp_TxnRef}
                                </Text>
                                <Text style={{ fontWeight: '500', color: textColor, marginVertical: 5 }}>
                                    Ngày yêu cầu: {moment(item.createdAt).format('DD-MM-YYYY HH:mm')}
                                </Text>
                                <Text style={{ fontWeight: '500', color: textColor }}>
                                    Số tiền: <Text style={{ color: green }}>{formatVND(item.vnp_Amount)}</Text>
                                </Text>
                                <Text style={{ fontWeight: '500', color: textColor, marginVertical: 5 }}>
                                    Lý do: {item.refundReason}
                                </Text>
                                <Text
                                    style={{
                                        fontWeight: '500',
                                        color:
                                            item.refundStatus === 'Success' ? green :
                                                item.refundStatus === 'Failed' ? '#dc3545' : orange,
                                    }}
                                >
                                    Trạng thái: {item.refundStatus === 'Success' ? 'Thành công' : item.refundStatus === 'Failed' ? 'Thất bại' : 'Đang xử lý'}
                                </Text>
                            </View>
                        )}
                        ListEmptyComponent={
                            <View style={{ marginTop: 50, alignItems: 'center' }}>
                                <Image source={require('../../assets/images/save.png')} style={StyleShare.imageNullData} />
                                <Text style={StyleShare.titleText20}>Chưa có yêu cầu hoàn tiền</Text>
                            </View>
                        }
                    />
                )}
            </View>
        );
    };

    return (
        <View style={StyleShare.container}>
            <UIHeader
                leftIcon={"arrow-back"}

                title={'Dịch vụ của bạn'}
                handleLeftIcon={() => navigation.goBack()}
            />
            <View style={{ flex: 1 }}>
                <Tab.Navigator
                    screenOptions={{
                        tabBarActiveTintColor: orange,
                        tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold' },
                        tabBarIndicatorStyle: { backgroundColor: orange },
                        tabBarStyle: { backgroundColor: grey },
                    }}
                >
                    <Tab.Screen name="Dịch vụ đã áp dụng" component={Tab1} />
                    <Tab.Screen name="Lịch sử giao dịch" component={Tab2} />
                    {/* <Tab.Screen name="Yêu cầu hoàn tiền" component={Tab3} /> */}
                </Tab.Navigator>
            </View>
        </View>
    );
}
