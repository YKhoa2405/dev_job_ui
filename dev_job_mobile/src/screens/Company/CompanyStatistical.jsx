import React from "react";
import { View } from "react-native";
import UIHeader from "../../components/UIHeader";
import StyleShare from "../../assets/themes/StyleShare";

export default function CompanyStatistical({navigation}) {
    return (
        <View style={StyleShare.container}>
            <UIHeader leftIcon={"arrow-back"}
                handleLeftIcon={() => { navigation.goBack() }}
                title={'Thống kê tuyển dụng'} />
        </View>
    )
}