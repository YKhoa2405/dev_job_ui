import React, { useContext, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import UIHeader from "../../components/UIHeader";
import { WebView } from 'react-native-webview';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi, endpoints } from "../../config/API";
import { ToastMess } from "../../components/ToastMess";

export default function VnPayScreen({ navigation, route }) {
    const { url, serviceId } = route.params
    console.log(serviceId)

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

            const vnp_TxnRef = params['vnp_TxnRef'];//
            const vnp_ResponseCode = params['vnp_ResponseCode'];//
            const vnp_PayDate = params['vnp_PayDate'];//
            const vnp_TransactionStatus = params['vnp_TransactionStatus']; //


            // Log các giá trị
            console.log("vnp_PayDate:", vnp_PayDate);
            console.log("vnp_TransactionStatus:", vnp_TransactionStatus);
            console.log("vnp_TransactionNo:", vnp_TxnRef);
            console.log("vnp_ResponseCode:", vnp_ResponseCode);

            if (vnp_ResponseCode != null) {
                try {
                    const token = await AsyncStorage.getItem("access-token");
                    const formData = new FormData();
                    formData.append('vnp_PayDate', vnp_PayDate);
                    formData.append('vnp_TransactionStatus', vnp_TransactionStatus);
                    formData.append('vnp_TransactionNo', vnp_TxnRef);

                    let res = await authApi(token).post(endpoints['purchase'](serviceId), formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });
                    console.log("Thanh toán thành công", res);
                    ToastMess({ type: 'success', text1: 'Thanh toán thành công.' });

                } catch (ex) {
                    console.error(ex);
                    ToastMess({ type: 'error', text1: 'Thanh toán thất bại, vui lòng thử lại.' });
                    

                }

                // setTimeout(() => {
                //     navigation.navigate('Home'); // Chuyển hướng về màn hình Home sau 5 giây
                // }, 5000);
            }
        }
    };
    return (
        <View style={{ flex: 1 }}>
            <UIHeader leftIcon={"arrow-back"}
                rightIcon={"ellipsis-horizontal"}
                title={'Thanh toán hóa đơn'}
                handleLeftIcon={() => { navigation.goBack() }} />
            <WebView
                style={{ flex: 1 }}
                source={{ uri: url }}
                onNavigationStateChange={handleNavigationStateChange}
            />
        </View>
    );
}