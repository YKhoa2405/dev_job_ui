import React, { useContext, useEffect, useState } from "react";
import { View, Text, TouchableWithoutFeedback, StyleSheet, ActivityIndicator, FlatList, Image } from "react-native";
import styleShare from "../../assets/theme/style";
import UIHeader from "../../components/UIHeader";
import { bgButton1, orange, white } from "../../assets/theme/color";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API, { authApi, endpoints } from "../../config/API";
import MyContext from "../../config/MyContext";

export default function ServiceList({ navigation }) {
    const [user, dispatch] = useContext(MyContext);
    const [loading, setLoading] = useState(true);
    const [purchasedServices, setPurchasedServices] = useState([]);
    const [serviceDetailsMap, setServiceDetailsMap] = useState({}); // Lưu trữ thông tin dịch vụ


    useEffect(() => {
        fetchPurchasedServices();
    }, []);

    const fetchPurchasedServices = async () => {
        try {
            const token = await AsyncStorage.getItem("access-token");
            const res = await authApi(token).get(endpoints['purchased_services']);
            setPurchasedServices(res.data);

            // Lấy thông tin dịch vụ cho từng dịch vụ đã mua
            const detailsPromises = res.data.map(item => fetchServiceDetails(item.service));
            const details = await Promise.all(detailsPromises);

            // Tạo một bản đồ để lưu thông tin dịch vụ với ID dịch vụ là key
            const detailsMap = details.reduce((acc, curr, index) => {
                acc[res.data[index].service] = curr; // Gắn kết dịch vụ với ID
                return acc;
            }, {});

            setServiceDetailsMap(detailsMap); // Cập nhật bản đồ dịch vụ
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchServiceDetails = async (serviceId) => {
        try {
            const response = await API.get(endpoints['services_detail'](serviceId));
            return response.data;
        } catch (err) {
            console.error(err);
            return null;
        }
    };

    const formatVND = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };
    const renderItem = ({ item }) => {
        const serviceDetails = serviceDetailsMap[item.service]; // Lấy thông tin chi tiết dịch vụ

        return (
            <TouchableWithoutFeedback>
                <View style={styles.serviceItemContainer}>
                    {serviceDetails ? ( // Kiểm tra xem có thông tin dịch vụ hay không
                        <>
                            <Text style={styleShare.textMainOption}>{serviceDetails.name}</Text>
                            <Text style={[styleShare.textMainOption, { marginVertical: 5, color: orange }]}>{formatVND(serviceDetails.price)}</Text>
                            <Text style={{ fontWeight: '500', fontSize: 16 }}>{serviceDetails.description}</Text>
                            <View style={{ marginTop: 10 }}>

                                <Text style={styles.serviceDetail}>Bắt đầu lúc: <Text style={{ color: bgButton1, fontWeight: 'bold' }}>{new Date(item.start_date).toLocaleDateString()}</Text></Text>
                                <Text style={styles.serviceDetail}>Hết hạn lúc: <Text style={{ color: bgButton1, fontWeight: 'bold' }}>{new Date(item.end_date).toLocaleDateString()}</Text></Text>
                            </View>
                        </>
                    ) : (
                        <ActivityIndicator size="small" color='orange' />
                    )}
                </View>
            </TouchableWithoutFeedback>
        );
    };

    if (loading) {
        return <ActivityIndicator style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} size="large" color='orange' />;
    }

    return (
        <View style={styleShare.container}>
            <UIHeader leftIcon={"arrow-back"}
                rightIcon={"ellipsis-horizontal"}
                title={'Dịch vụ của bạn'}
                handleLeftIcon={() => { navigation.goBack() }} />
            <FlatList
                data={purchasedServices}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()} // Cần thiết để chỉ định key
                ListEmptyComponent={
                    <View style={{ marginTop: 50, alignItems: 'center' }}>
                        <Image source={require("../../assets/images/save.png")} style={styleShare.imageNullData} />
                        <Text style={styleShare.textMainOption}>Bạn chưa mua bất kỳ dịch vụ nào</Text>
                        <Text style={{ padding: 20, textAlign: 'center' }}>Bạn chưa có bất kỳ dịch vụ  nào, hãy mua dịch vụ để tăng hiệu quả cho quá trình tuyển dụng</Text>
                    </View>
                }
            />
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
