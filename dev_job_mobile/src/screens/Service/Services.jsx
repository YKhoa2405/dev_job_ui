import React, { useContext, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, TextInput, Image, ActivityIndicator, ScrollView, FlatList } from "react-native";
import UIHeader from "../../components/UIHeader";
import Icon from "react-native-vector-icons/Ionicons";
import { mainColor, orange, white, textColor } from "../../assets/themes/Color";
import StyleShare from "../../assets/themes/StyleShare";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loading from "../../components/Loading";
import axios from "axios";
import ToastMess from "../../components/ToastMess"
import { authApi, endpoints } from "../../assets/config/API";

export default function Services({ navigation, route }) {
    const { companyId } = route.params
    const [loading, setLoading] = useState(false);
    const [service, setService] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [searchKeywork, setSearchKeywork] = useState('')
    const [url, setUrl] = useState('')
    useEffect(() => {
        fetchListService()
    }, [])

    const fetchListService = async (name = '') => {
        setLoading(true)
        try {
            const token = await AsyncStorage.getItem("access_token");
            const res = await authApi(token).get(endpoints['services'], {
                params: {
                    name: name ? `/${name}/i` : ''
                },
            })
            const data = res.data.data;
            setService(data.result)
            setTotalItems(data.meta.totalItems);
        } catch (error) {
            console.log('thong bao loi', error)
        } finally {
            setLoading(false)
        }
    }

    const handlePayService = async (amount, serviceId, name) => {
        try {
            const token = await AsyncStorage.getItem("access_token");
            const response = await authApi(token).post(endpoints['paymentUrl'], { amount: amount, name: name }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const url = response.data.data
            setUrl(url)
            navigation.navigate('PaymentScreen', { url: url, serviceId: serviceId, companyId: companyId })
        } catch (error) {
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
                <View style={StyleShare.jobItemContainer}>
                    <Text style={StyleShare.titleText20}>{item.name}</Text>
                    <Text style={[StyleShare.titleText20, { marginVertical: 5, color: orange }]}>{formatVND(item.price)}</Text>
                    <Text style={StyleShare.titleText16}>{item.description}</Text>
                    <Text style={{ fontWeight: '500',color: textColor }}>Thời hạn: <Text style={{ color: orange }}>{item.durationDays} ngày</Text></Text>

                    <TouchableOpacity style={styles.buttonServices} onPress={() => handlePayService(item.price, item._id, item.name)}>
                        <Text style={[StyleShare.titleText16,{color:white}]}>Mua ngay</Text>
                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
        )
    };

    return (
        <View style={StyleShare.container}>
            <UIHeader leftIcon={"arrow-back"}
                rightIcon={"ellipsis-horizontal"}
                title={'Mua dịch vụ'}
                handleLeftIcon={() => { navigation.goBack() }} />
            <View style={{ paddingHorizontal: 20, marginBottom: 5 }}>
                <View style={StyleShare.searchDetail}>
                    <Icon name="search" color={mainColor} size={24} style={{ marginRight: 10 }} />
                    <TextInput
                        style={StyleShare.searchInput}
                        placeholder="Tìm kiếm dịch vụ..."
                        value={searchKeywork}
                        onChangeText={(text) => setSearchKeywork(text)}
                        onSubmitEditing={() => {
                            fetchListService(searchKeywork)
                        }}
                    />
                </View>
                <Text style={StyleShare.titleText16}>{totalItems} dịch vụ hiện có</Text>
            </View>
            {loading ? <>
                <Loading />
            </> : <>
                <FlatList
                    data={service}
                    renderItem={renderItem}
                    key={item => item.service._id.toString()}
                    ListEmptyComponent={
                        <View style={{ marginTop: 50, alignItems: 'center' }}>
                            <Image source={require("../../assets/images/save.png")} style={StyleShare.imageNullData} />
                            <Text style={StyleShare.titleText20}>Bạn chưa ứng tuyển việc làm </Text>
                            <Text style={{ padding: 20, textAlign: 'center' }}>Bạn chưa có bất kỳ đơn ứng tuyển nào, hãy ứng tuyển để nhận đươc việc làm mong muốn</Text>
                        </View>
                    }
                    contentContainerStyle={{ paddingBottom: 40 }} />
            </>}
        </View>
    )
}

const styles = StyleSheet.create({

    buttonServices: {
        alignItems: 'center',
        backgroundColor: mainColor,
        padding: 10,
        borderRadius: 10,
        zIndex: 999,
        marginTop: 15
    }

})