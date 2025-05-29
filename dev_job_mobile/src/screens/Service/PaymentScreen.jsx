import React, { useState } from "react";
import { View, Alert } from "react-native";
import UIHeader from "../../components/UIHeader";
import { WebView } from 'react-native-webview';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi, endpoints } from "../../assets/config/API";
import { ToastMess } from "../../components/ToastMess";

export default function PaymentScreen({ navigation, route }) {
    const { url, serviceId, companyId } = route.params;
    const [isProcessing, setIsProcessing] = useState(false); // Trạng thái để kiểm soát xử lý trùng lặp
    const [processedTxnRef, setProcessedTxnRef] = useState(null); // Lưu trữ vnp_TxnRef đã xử lý

    const handleNavigationStateChange = async (navState) => {
        const { url: newUrl } = navState;

        // Nếu đang xử lý, bỏ qua
        if (isProcessing) return;

        // Validate URL
        if (!newUrl.includes('?')) return;

        // Parse URL query parameters
        const params = {};
        const queryParams = newUrl.split('?')[1]?.split('&');
        queryParams.forEach((param) => {
            const [key, value] = param.split('=');
            params[decodeURIComponent(key)] = decodeURIComponent(value);
        });

        const {
            vnp_BankCode,
            vnp_Amount,
            vnp_PayDate,
            vnp_OrderInfo,
            vnp_TxnRef,
            vnp_TransactionStatus,
            vnp_BankTranNo,
            vnp_CardType,
            vnp_ResponseCode,
            vnp_TmnCode,
            vnp_TransactionNo,
        } = params;

        // Kiểm tra nếu giao dịch đã được xử lý
        if (vnp_TxnRef && vnp_TxnRef === processedTxnRef) {
            console.log('Giao dịch đã được xử lý:', vnp_TxnRef);
            return;
        }

        if (vnp_ResponseCode) {
            setIsProcessing(true); // Đặt trạng thái đang xử lý
            try {
                // Kiểm tra token
                const token = await AsyncStorage.getItem('access_token');
                // Kiểm tra các tham số bắt buộc
                if (!vnp_TransactionStatus || !vnp_TxnRef) {
                    ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại.' });
                    return;
                }
                const amountInVND = parseInt(vnp_Amount) / 100;
                // Lưu thông tin thanh toán
                const requestParams = new URLSearchParams({
                    companyId,
                    vnp_BankCode,
                    vnp_Amount: amountInVND,
                    vnp_PayDate,
                    vnp_OrderInfo,
                    vnp_TransactionStatus,
                    vnp_TxnRef,
                    vnp_BankTranNo,
                    vnp_CardType,
                    vnp_ResponseCode,
                    vnp_TmnCode,
                    vnp_TransactionNo,
                });

                await authApi(token).post(endpoints['paymentSave'], requestParams, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                });

                // Đánh dấu giao dịch đã xử lý
                setProcessedTxnRef(vnp_TxnRef);

                // Tạo đơn hàng nếu thanh toán thành công
                await handleCreateOrder(vnp_Amount);
            } catch (error) {
                ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại.' });
            } finally {
                setIsProcessing(false); // Hoàn tất xử lý
            }
        }
    };

    const handleCreateOrder = async (amount) => {
        try {

            const params = new URLSearchParams();
            params.append('companyId', companyId);
            params.append('serviceId', serviceId);
            params.append('amount', amount.toString());

            const token = await AsyncStorage.getItem('access_token');

            await authApi(token).post(endpoints['order'], params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });
        } catch (error) {
            console.log('Error creating order:', error);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <UIHeader
                leftIcon={"arrow-back"}
                rightIcon={"ellipsis-horizontal"}
                handleLeftIcon={() => { navigation.goBack(); }}
            />
            <WebView
                style={{ flex: 1 }}
                source={{ uri: url }}
                onNavigationStateChange={handleNavigationStateChange}
                onError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    console.log('WebView error:', nativeEvent);
                    Alert.alert('Lỗi', 'Không thể tải trang thanh toán. Vui lòng kiểm tra kết nối mạng.');
                }}
            />
        </View>
    );
}