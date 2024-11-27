import React from "react";
import { View, StyleSheet } from "react-native";
import UIHeader from "../../components/UIHeader";
import styleShare from "../../assets/theme/style";
import { WebView } from 'react-native-webview';


export default function ViewCV({ navigation, route }) {
    const { cv } = route.params;
    console.log(cv)

    return (
        <View style={styleShare.container}>
            <UIHeader
                leftIcon={"arrow-back"}
                rightIcon={"ellipsis-horizontal"}
                title={'Xem lại CV'}
                handleLeftIcon={() => navigation.goBack()}
            />
            <WebView
                style={{ flex: 1 }}
                source={{ uri: cv }}
            />
        </View>
    );
}

