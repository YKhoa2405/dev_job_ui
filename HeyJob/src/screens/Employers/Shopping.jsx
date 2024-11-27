import React, { useContext, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, TextInput, Image, ActivityIndicator, ScrollView, FlatList } from "react-native";
import styleShare from "../../assets/theme/style";
import UIHeader from "../../components/UIHeader";
import Icon from "react-native-vector-icons/Ionicons";
import { bgButton1, bgButton2, grey, orange, white } from "../../assets/theme/color";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API, { authApi, endpoints } from "../../config/API";
import * as DocumentPicker from 'expo-document-picker';
import { ToastMess } from "../../components/ToastMess";
import MyContext from "../../config/MyContext";
import * as WebBrowser from 'expo-web-browser';

export default function Shopping({ navigation }) {
    const [user, dispatch] = useContext(MyContext)
    const [loading, setLoading] = useState(true);
    const [service, setService] = useState([]);
    const [urlPay, setUrlPay] = useState(null)

    useEffect(() => {
        handleFetchService()
    }, [])

    const handleFetchService = async () => {
        try {
            const res = await API.get(endpoints['services_list'])
            setService(res.data)
            console.log(res.data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handlePayService = async (amount, serviceId) => {
        try {
            const token = await AsyncStorage.getItem("access-token");
            const response = await authApi(token).post(endpoints['vnpay_post'], {
                amount: amount,
            });
            const url = response.data.payment_url
            setUrlPay(url)
            console.log(url)
            // await WebBrowser.openBrowserAsync(url);
            navigation.navigate('VnPayScreen', { url: url, serviceId: serviceId })
        } catch (error) {
            console.log(error)
            ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại.' });
        }
    }

    const formatVND = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const renderItem = ({ item }) => {
        return (
            <TouchableWithoutFeedback>
                <View style={styles.serviceItemContainer}>
                    <Text style={styleShare.textMainOption}>{item.name}</Text>
                    <Text style={[styleShare.textMainOption, { marginVertical: 5, color: orange }]}>{formatVND(item.price)}</Text>
                    <Text style={{ fontWeight: '500', fontSize: 16 }}>{item.description}</Text>
                    <Text style={{ fontWeight: '500', fontSize: 16, color: 'grey' }}>Thời hạn: <Text style={{ color: orange }}>{item.duration} tháng</Text></Text>

                    <TouchableOpacity style={styles.buttonShopping} onPress={() => handlePayService(item.price, item.id)}>
                        <Text style={{ color: white, fontWeight: 500 }}>Mua ngay</Text>
                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
        )
    };

    if (loading) {
        return <ActivityIndicator style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} size="large" color='orange' />;
    }

    return (
        <View style={styleShare.container}>
            <UIHeader leftIcon={"arrow-back"}
                rightIcon={"ellipsis-horizontal"}
                title={'Mua dịch vụ'}
                handleLeftIcon={() => { navigation.goBack() }} />
            <FlatList
                data={service}
                renderItem={renderItem} />
        </View>
    )
}

const styles = StyleSheet.create({
    serviceItemContainer: {
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: white,
        marginTop: 15,
        marginHorizontal: 20,
    }, buttonShopping: {
        alignItems: 'center',
        backgroundColor: bgButton1,
        padding: 10,
        borderRadius: 10,
        zIndex: 999,
        marginTop: 15
    }

})