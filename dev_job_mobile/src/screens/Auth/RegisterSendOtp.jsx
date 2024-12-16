import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, ScrollView } from "react-native";
import StyleShare from "../../assets/themes/StyleShare";
import { mainColor, orange, white } from "../../assets/themes/Color";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { ToastMess } from "../../components/ToastMess";
import API, { endpoints } from "../../assets/config/API";
import UIHeader from "../../components/UIHeader";
export default function RegisterSendOtp({ navigation, route }) {
    const { email, password, name, role } = route.params;
    const [loading, setLoading] = useState(false);
    const [otp, setOtp] = useState();

    const handleVerify = async () => {
        if (!otp) {
            ToastMess({ type: 'error', text1: 'Vui lòng điền đầy đủ thông tin.' });
            return;
        }
        setLoading(true);
        try {
            await API.post(
                endpoints['verify'], // URL endpoint
                { name, email, password }, // Body JSON
                {
                    params: {
                        code: otp, // Query parameter
                        roleName: role, // Query parameter
                    },
                    headers: {
                        "Content-Type": "application/json", // Header
                    },
                }
            );


            ToastMess({ type: 'success', text1: 'Đăng ký tài khoản thành công.' });
            navigation.navigate("Login");
        } catch (error) {
            if (error.response) {
                if (error.response.status === 400) {
                    ToastMess({ type: 'error', text1: 'Mã OTP không hợp lệ hoặc đã hết hạn.' });
                    console.log(error)

                }
            } else {
                ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại.' });
                console.log(error)
            }
        } finally {
            setLoading(false);
        }

    };

    return (
        <View style={StyleShare.container}>
            <UIHeader
                leftIcon={"arrow-back"}
                handleLeftIcon={() => { navigation.goBack() }}
            />
            <ScrollView style={{ paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
                <View style={styles.containerTop}>
                    <Text style={StyleShare.titleText30}>Hoàn tất đăng ký tài khoản</Text>
                    <Text style={styles.desc}>Vui lòng kiểm tra Email để kích hoạt tài khoản</Text>
                    <Image style={StyleShare.imageLogin} source={require("../../assets/images/otp.png")} />
                </View>
                <View>
                    <Text style={styles.textInput}>Mã OTP</Text>
                    <Input
                        placeholder="Mã gồm 6 chữ số được gửi về Email"
                        value={otp}
                        onChangeText={setOtp} />
                </View>
                <View style={styles.containerFooter}>
                    {loading ? (
                        <ActivityIndicator color={orange} size={'large'} />
                    ) : (
                        <Button title={'Xác nhận'}
                            backgroundColor={mainColor}
                            textColor={white}
                            onPress={() => handleVerify()} />
                    )}
                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    containerTop: {
        marginTop: 20,
        alignItems: 'center',
    }
    ,
    containerFooter: {
        marginTop: 30
    },
    textInput: {
        fontWeight: 'bold',
        color: mainColor,
        marginTop: 15
    },
    imageSentOtp: {
        width: 300,
        height: 300,
        resizeMode: 'center',
    },
    desc: {
        textAlign: 'center',
        marginTop: 20
    }
})