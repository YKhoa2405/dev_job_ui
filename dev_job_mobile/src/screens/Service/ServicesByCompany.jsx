import React, { useEffect, useState } from "react";
import { View, Text, TouchableWithoutFeedback, StyleSheet, ActivityIndicator, FlatList, Image } from "react-native";
import UIHeader from "../../components/UIHeader";
import StyleShare from "../../assets/themes/StyleShare";
import { mainColor, orange, white } from "../../assets/themes/Color";
import { authApi, endpoints } from "../../assets/config/API";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loading from "../../components/Loading";
import moment from "moment";

export default function ServicesByCompany({ navigation, route }) {
    const { companyId } = route.params
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
            const res = await authApi(token).get(endpoints['paymentByCompany']('67433ef7c2689cf41f1fae48'));
            console.log(res.data)
            setServices(res.data.data.result);
            setMeta(res.data.data.meta);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };



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
                    <Text style={StyleShare.titleText20}>{item.serviceId.name}</Text>
                    <Text style={[StyleShare.titleText20, { marginVertical: 5, color: orange }]}>{formatVND(item.serviceId.price)}</Text>
                    <Text style={{ fontWeight: '500', fontSize: 16 }}>Thời hạn: {item.serviceId.durationDays} ngày</Text>

                    <View style={{ marginTop: 10 }}>
                        <Text style={{ fontWeight: '500', fontSize: 16, color: 'grey' }}>Ngày áp dụng: <Text style={{ color: orange, fontWeight: '500' }}>{moment(item.vnp_PayDate, "YYYYMMDDHHmmss").format("DD-MM-YYYY")}</Text></Text>
                    </View>

                </View>
            </TouchableWithoutFeedback>
        );
    };


    return (
        <View style={StyleShare.container}>
            <UIHeader leftIcon={"arrow-back"}
                rightIcon={"ellipsis-horizontal"}
                title={'Dịch vụ của bạn'}
                handleLeftIcon={() => { navigation.goBack() }} />
            {loading ? <>
                <Loading />
            </> : <>
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
