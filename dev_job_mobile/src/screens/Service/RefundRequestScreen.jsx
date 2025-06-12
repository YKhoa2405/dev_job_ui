import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import UIHeader from '../../components/UIHeader';
import { grey, orange, white, green, textColor, mainColor } from '../../assets/themes/Color';
import StyleShare from '../../assets/themes/StyleShare';
import { authApi, endpoints } from '../../assets/config/API';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loading from '../../components/Loading';
import moment from 'moment';
import { ToastMess } from '../../components/ToastMess';

const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
};

const RefundRequestScreen = ({ navigation, route }) => {
    const { payment } = route.params;
    const [order, setOrder] = useState(null);
    const [refundReason, setRefundReason] = useState('');
    const [loading, setLoading] = useState(false);
    const fetchOrder = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('access_token');
            const res = await authApi(token).get(endpoints['orderDetailByCompany'](payment.companyId, payment.serviceId));
            setOrder(res.data.data);
        } catch (error) {
            console.error('Fetch order error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [payment.companyId, payment.serviceId]);

    const canRequestRefund =
        payment.vnp_TransactionStatus === 'Success' &&
        order?.isActive === true

    const daysSinceStart = order ? moment().diff(moment(order.startDate), 'days') : Infinity;
    const isWithinRefundPeriod = daysSinceStart <= 7;

    const submitRefundRequest = async () => {
        if (!canRequestRefund) {
            ToastMess({ type: 'error', text1: 'Giao dịch hoặc đơn hàng không hợp lệ để hoàn tiền' });
            return;
        }

        if (!isWithinRefundPeriod) {
            ToastMess({ type: 'error', text1: 'Đã quá thời gian cho phép hoàn tiền (7 ngày)' });
            return;
        }

        if (order.remainingUses === 0) {
            ToastMess({ type: 'error', text1: 'Dịch vụ này đã sử dụng, không thể hoàn tiền' });
            return;
        }

        if (!refundReason) {
            ToastMess({ type: 'error', text1: 'Vui lý nhập lý do hoàn tiền' });
            return;
        }

        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('access_token');
            const refundData = {
                vnp_TmnCode: payment.vnp_TmnCode,
                vnp_TxnRef: payment.vnp_TxnRef,
                vnp_Amount: parseInt(payment.vnp_Amount), // Đảm bảo là number
                vnp_TransactionDate: payment.vnp_PayDate,
                vnp_TransactionNo: payment.vnp_TransactionNo,
                vnp_TransactionType: '02', // Hoàn tiền toàn bộ
                vnp_CreateDate: moment().format('YYYYMMDDHHmmss'),
                vnp_IpAddr: '127.0.0.1', // Có thể lấy IP thực từ thiết bị
                vnp_Command: 'refund',
                vnp_Version: '2.1.0',
                refundReason,
                companyId: payment.companyId, // Thêm từ Payment
                serviceId: payment.serviceId, // Thêm từ Payment
            };

            const res = await authApi(token).post(endpoints['paymentRefunt'], refundData);
            if (res.data.vnp_ResponseCode === '00') {
                Alert.alert('Thành công', 'Yêu cầu hoàn tiền đã được gửi', [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);
            } else {
                Alert.alert('Lỗi', `Không thể gửi yêu cầu hoàn tiền: ${res.data.vnp_ResponseCode}`);
            }
        } catch (error) {
            console.error('Refund error:', error);
            ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại' });

        } finally {
            setLoading(false);
        }
    };

    const refundPolicies = [
        'Yêu cầu hoàn tiền chỉ được xử lý trong vòng 7 ngày kể từ ngày bắt đầu dịch vụ.',
        'Dịch vụ nếu có số lượt yêu cầu chưa được sử dụng.',
        'Giao dịch phải ở trạng thái "Success" và đơn hàng đang hoạt động.',
        'Lý do hoàn tiền phải được cung cấp rõ ràng và hợp lệ.',
        'Thời gian xử lý hoàn tiền có thể mất từ 5-7 ngày làm việc.',
    ];

    return (
        <View style={StyleShare.container}>
            <UIHeader
                leftIcon={'arrow-back'}
                title={'Yêu cầu hoàn tiền'}
                handleLeftIcon={() => navigation.goBack()}
            />
            {loading || !order ? (
                <Loading />
            ) : (
                <View style={StyleShare.container}>
                    <Text style={[StyleShare.titleText20, { paddingHorizontal: 20 }]}>Thông tin giao dịch</Text>
                    <View style={StyleShare.jobItemContainer}>
                        <Text style={styles.infoText}>Mã giao dịch: {payment.vnp_TransactionNo}</Text>
                        <Text style={styles.infoText}>
                            Số tiền: <Text style={{ color: green }}>{formatVND(payment.vnp_Amount)}</Text>
                        </Text>
                        <Text style={styles.infoText}>
                            Dịch vụ: {(payment.vnp_OrderInfo).replace(/\+/g, ' ')}
                        </Text>
                        {order.remainingUses != null && (
                            <Text style={styles.infoText}>
                                Số lượt còn lại: <Text style={{ fontWeight: 'bold' }}>{order?.remainingUses}</Text>
                            </Text>
                        )}
                        <Text style={styles.infoText}>
                            Trạng thái đơn hàng:{' '}
                            <Text style={{ fontWeight: 'bold', color: order?.isActive ? 'green' : 'red' }}>
                                {order?.isActive ? 'Đang hoạt động' : 'Dừng hoạt động'}
                            </Text>
                        </Text>


                        <Text style={styles.infoText}>
                            Ngày bắt đầu: {moment(order?.startDate).format('DD-MM-YYYY')}
                        </Text>
                    </View>

                    {/* Phần quy định hoàn tiền */}
                    <Text style={[StyleShare.titleText20, { paddingHorizontal: 20, paddingTop: 20 }]}>
                        Quy định hoàn tiền
                    </Text>
                    <View style={[StyleShare.jobItemContainer, { marginHorizontal: 20, padding: 15 }]}>
                        {refundPolicies.map((policy, index) => (
                            <Text key={index} style={[styles.infoText, { marginBottom: 10 }]}>
                                • {policy}
                            </Text>
                        ))}
                    </View>

                    <Text style={[StyleShare.titleText20, { padding: 20 }]}>Lý do hoàn tiền</Text>
                    <TextInput
                        style={[StyleShare.searchInput, { height: 100, textAlignVertical: 'top', paddingHorizontal: 20 }]}
                        placeholder="Nhập lý do hoàn tiền"
                        value={refundReason}
                        onChangeText={setRefundReason}
                        multiline
                    />

                    <TouchableOpacity
                        style={[StyleShare.buttonDetailApply, { backgroundColor: mainColor, margin: 20 }]}
                        onPress={submitRefundRequest}
                        disabled={loading || !canRequestRefund || !isWithinRefundPeriod}
                    // disabled={loading || !canRequestRefund || !refundReason}

                    >
                        <Text style={{ fontWeight: '500', color: white }}>
                            {loading ? 'Đang xử lý...' : 'Gửi yêu cầu'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    infoText: {
        fontWeight: '500',
        color: textColor,
        marginVertical: 5,
    },
});

export default RefundRequestScreen;