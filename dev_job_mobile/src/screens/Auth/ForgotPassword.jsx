import React, { useState } from "react";
import { View, Text, StyleSheet, Image, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform } from "react-native";
import StyleShare from "../../assets/themes/StyleShare";
import { bgButton2, mainColor, orange, white } from "../../assets/themes/Color";
import Input from "../../components/Input";
import Button from "../../components/Button";

import { ToastMess } from "../../components/ToastMess";
import Loading from "../../components/Loading";
import API, { endpoints } from "../../assets/config/API";
export default function ForgotPassword({ navigation }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendCode = async () => {
        if (!email) {
            ToastMess({ type: 'error', text1: 'Vui lòng nhập địa chỉ Email.' });
            return
        }
        setLoading(true)
        try {
            let form = new FormData();
            form.append('email', email);
            await API.post(endpoints['sendCode'], { email }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            ToastMess({ type: 'success', text1: 'Vui lòng kiểm tra email của bạn để đặt lại mật khẩu.' });
            navigation.navigate("SendCode", { email: email });
        } catch (error) {
            // Xử lý các lỗi xảy ra trong quá trình gửi yêu cầu
            if (error.response && error.response.status === 400) {
                ToastMess({ type: 'error', text1: 'Không tìm thấy tài khoản.' });
                console.log(error)

            } else {
                ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại.' });
                console.log(error)
            }
        } finally {
            setLoading(false)
        }


    };
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <ScrollView style={[StyleShare.container, { paddingHorizontal: 20 }]}>
                <View style={styles.containerTop}>
                    <Text style={StyleShare.titleText30}>Quên mật khẩu?</Text>
                    <Text style={styles.desc}>Để đặt lại mật khẩu, bạn cần email để xác thực</Text>
                    <Image style={StyleShare.imageLogin} source={require("../../assets/images/forgotPass.png")} />
                </View>
                <View>
                    <Text style={styles.textInput}>Email</Text>
                    <Input
                        placeholder="Địa chỉ Email đã đăng ký tài khoản"
                        value={email}
                        onChangeText={setEmail} />
                </View>
                <View style={styles.containerFooter}>
                    {loading ? (
                        <Loading />
                    ) : (
                        <Button title={'Đặt lại mật khẩu'}
                            backgroundColor={mainColor}
                            textColor={white}
                            onPress={() => handleSendCode()} />
                    )}
                    <Button title={'Trở về đăng nhập'}
                        backgroundColor={bgButton2}
                        onPress={() => { navigation.navigate("Login") }}
                        textColor={mainColor} />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    containerTop: {
        marginTop: 90,
        alignItems: 'center',
    }
    ,
    containerFooter: {
        marginTop: 30
    },
    textInput: {
        fontWeight: 'bold',
        color: mainColor,
    },
})