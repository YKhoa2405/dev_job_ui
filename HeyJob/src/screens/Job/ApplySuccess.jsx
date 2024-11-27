import React from "react";
import { StyleSheet, View, Image, Text, Linking } from "react-native";
import styleShare from "../../assets/theme/style";
import { bgButton1, bgButton2, white } from "../../assets/theme/color";
import ButtonMain from "../../components/ButtonMain";
export default function ({ navigation, route }) {
    // const { cv } = route.params
    const handleOpenCv = (url) => {
        Linking.openURL(url).catch(err => console.error("Failed to open URL:", err));
    }
    return (
        <View style={{ flex: 1, paddingHorizontal: 20 }}>
            <View style={styles.containerMain}>
                <Image source={require('../../assets/images/excellence.png')} style={styleShare.imageNullData} />
                <Text style={styleShare.textMainOption}>Ứng tuyển thành công</Text>
                <Text style={{ marginTop: 20 }}>Xin chúc mừng, đơn đăng ký của bạn đã được gửi</Text>
            </View>

            <ButtonMain title={'Trở về trang chủ'}
                backgroundColor={bgButton1}
                onPress={() => { navigation.navigate("Home") }}
                textColor={white} />

        </View>
    )
}

const styles = StyleSheet.create({

    containerMain: {
        alignItems: 'center',
        marginBottom: 100,
        marginTop: 100
    },
    fileImage: {
        width: 50,
        height: 50,
    }
})