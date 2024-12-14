import React, { useState } from "react";
import { View } from "react-native";
import UIHeader from "../../components/UIHeader";
import { WebView } from 'react-native-webview';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi, endpoints } from "../../assets/config/API";

export default function PaymentScreen({ navigation, route }) {
    const { url, serviceId, companyId } = route.params;
    const [isProcessing, setIsProcessing] = useState(false); // Trạng thái để kiểm soát xử lý trùng lặp

    const handleNavigationStateChange = async (navState) => {
        const { url: newUrl } = navState;

        // Nếu đang xử lý, ngừng lại
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

        console.log(params);

        if (vnp_ResponseCode) {
            setIsProcessing(true); // Đặt trạng thái đang xử lý
            try {
                // Lưu thông tin thanh toán
                const requestParams = new URLSearchParams({
                    companyId,
                    vnp_BankCode,
                    vnp_Amount,
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

                const token = await AsyncStorage.getItem('access_token');
                await authApi(token).post(endpoints['paymentSave'], requestParams, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                });

                // Nếu giao dịch thành công, tạo đơn hàng
                if (vnp_TransactionStatus === '00') {
                    await handleCreateOrder(vnp_Amount);
                }
            } catch (error) {
                console.error('Payment save failed:', error);
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
            params.append('amount', amount);

            const token = await AsyncStorage.getItem('access_token');
            await authApi(token).post(endpoints['order'], params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
        } catch (error) {
            console.error('Order creation failed:', error);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <UIHeader
                leftIcon={"arrow-back"}
                rightIcon={"ellipsis-horizontal"}
                title={'Thanh toán dịch vụ'}
                handleLeftIcon={() => { navigation.goBack(); }}
            />
            <WebView
                style={{ flex: 1 }}
                source={{ uri: url }}
                onNavigationStateChange={handleNavigationStateChange}
            />
        </View>
    );
}
