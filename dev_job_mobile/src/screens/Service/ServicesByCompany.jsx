import React, { useContext, useEffect, useState } from "react";
import { View, Text, TouchableWithoutFeedback, StyleSheet, ActivityIndicator, FlatList, Image } from "react-native";
import UIHeader from "../../components/UIHeader";
import StyleShare from "../../assets/themes/StyleShare";
import { white } from "../../assets/themes/Color";

export default function ServicesByCompany({ navigation }) {
    const [loading, setLoading] = useState(false);
    const [purchasedServices, setPurchasedServices] = useState([]);
    const [serviceDetailsMap, setServiceDetailsMap] = useState({}); // Lưu trữ thông tin dịch vụ

    const formatVND = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };
    const renderItem = ({ item }) => {

        return (
            <TouchableWithoutFeedback>

            </TouchableWithoutFeedback>
        );
    };

    if (loading) {
        return <ActivityIndicator style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} size="large" color='orange' />;
    }

    return (
        <View style={StyleShare.container}>
            <UIHeader leftIcon={"arrow-back"}
                rightIcon={"ellipsis-horizontal"}
                title={'Dịch vụ của bạn'}
                handleLeftIcon={() => { navigation.goBack() }} />
            <FlatList
                // data={purchasedServices}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()} // Cần thiết để chỉ định key
                ListEmptyComponent={
                    <View style={{ marginTop: 50, alignItems: 'center' }}>
                        <Image source={require("../../assets/images/save.png")} style={StyleShare.imageNullData} />
                        <Text style={StyleShare.titleText20}>Bạn chưa mua bất kỳ dịch vụ nào</Text>
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
