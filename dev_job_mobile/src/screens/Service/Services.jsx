import React, { useContext, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, TextInput, Image, ActivityIndicator, ScrollView, FlatList } from "react-native";
import UIHeader from "../../components/UIHeader";
import Icon from "react-native-vector-icons/Ionicons";
import { mainColor, bgButton2, grey, orange, white } from "../../assets/themes/Color";
import StyleShare from "../../assets/themes/StyleShare";
import API, { authApi, endpoints } from "../../assets/config/API";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loading from "../../components/Loading";

export default function Services({ navigation }) {
    const [loading, setLoading] = useState(false);
    const [service, setService] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [searchKeywork, setSearchKeywork] = useState('')
    useEffect(() => {
        fetchListService()
    }, [])

    const fetchListService = async (name = '') => {
        setLoading(true)
        try {
            const token = await AsyncStorage.getItem("access_token");
            console.log(token)
            const res = await authApi(token).get(endpoints['services'], {
                params: {
                    name: name ? `/${name}/i` : ''
                },
            })
            const data = res.data.data;
            setService(data.result)
            setTotalItems(data.meta.totalItems);
            console.log(data.result)
        } catch (error) {
            console.log('thong bao loi', error)
        } finally {
            setLoading(false)
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
                    <Text style={{ fontWeight: '500', fontSize: 16 }}>{item.description}</Text>
                    <Text style={{ fontWeight: '500', fontSize: 16, color: 'grey' }}>Thời hạn: <Text style={{ color: orange }}>{item.durationDays} ngày</Text></Text>

                    <TouchableOpacity style={styles.buttonServices} onPress={() => handlePayService(item.price, item.id)}>
                        <Text style={{ color: white, fontWeight: 500 }}>Mua ngay</Text>
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