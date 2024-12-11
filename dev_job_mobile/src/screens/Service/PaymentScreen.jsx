import React, { useContext, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import UIHeader from "../../components/UIHeader";
import { WebView } from 'react-native-webview';
import { ToastMess } from "../../components/ToastMess";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi, endpoints } from "../../assets/config/API";
import axios from "axios";

export default function PaymentScreen({ navigation, route }) {
    const { url, serviceId, companyId } = route.params

    const handleNavigationStateChange = async (navState) => {
        const { url: newUrl } = navState;

        // Phân tích URL để lấy thông tin
        const urlParts = newUrl.split('?');
        if (urlParts.length > 1) {
            const queryParams = urlParts[1].split('&');
            const params = {};
            queryParams.forEach((param) => {
                const parts = param.split('=');
                params[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
            });
            // Lấy các giá trị cần thiết từ params
            const vnp_BankCode = params['vnp_BankCode']
            const vnp_Amount = params['vnp_Amount']
            const vnp_PayDate = params['vnp_PayDate'];
            const vnp_OrderInfo = params['vnp_OrderInfo']
            const vnp_TxnRef = params['vnp_TxnRef'];
            const vnp_TransactionStatus = params['vnp_TransactionStatus'];
            const vnp_ResponseCode = params['vnp_ResponseCode'];


            if (vnp_ResponseCode != null) {
                try {
                    // Tạo body theo định dạng x-www-form-urlencoded
                    const params = new URLSearchParams();
                    params.append('companyId', companyId);
                    params.append('serviceId', serviceId);
                    params.append('vnp_BankCode', vnp_BankCode);
                    params.append('vnp_Amount', vnp_Amount);
                    params.append('vnp_PayDate', vnp_PayDate);
                    params.append('vnp_OrderInfo', vnp_OrderInfo);
                    params.append('vnp_TransactionStatus', vnp_TransactionStatus);
                    params.append('vnp_TxnRef', vnp_TxnRef);

                    const token = await AsyncStorage.getItem("access-token");
                    await authApi(token).post(endpoints['paymentSave'], params, {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                    });

                    ToastMess({ type: 'success', text1: 'Thanh toán thành công.' });

                } catch (ex) {
                    console.error(ex);
                    ToastMess({ type: 'error', text1: 'Thanh toán thất bại, vui lòng thử lại.' });


                }

                // setTimeout(() => {
                //     navigation.navigate('HomeEmployer'); // Chuyển hướng về màn hình Home sau 5 giây
                // }, 5000);
            }
        }
    };
    return (
        <View style={{ flex: 1 }}>
            <UIHeader leftIcon={"arrow-back"}
                rightIcon={"ellipsis-horizontal"}
                title={'Thanh toán dịch vụ'}
                handleLeftIcon={() => { navigation.goBack() }} />
            <WebView
                style={{ flex: 1 }}
                source={{ uri: url }}
                onNavigationStateChange={handleNavigationStateChange}
            />
        </View>
    );
}