import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import styleShare from "../../assets/theme/style";
import InputMain from "../../components/InputMain";
import { bgButton1, bgButton2, orange, white } from "../../assets/theme/color";
import ButtonMain from "../../components/ButtonMain";
import { ToastMess } from "../../components/ToastMess";
import axios from "axios";
import API, { endpoints } from "../../config/API";
export default function ForgotPass({ navigation }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePasswordReset = async () => {
        if (!email) {
            ToastMess({ type: 'error', text1: 'Vui lòng nhập địa chỉ Email.' });
            return
        }
        setLoading(true)
        try {
            let form = new FormData();
            form.append('email', email);
            const response = await API.post(endpoints['send_otp'], form, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                // Thành công
                ToastMess({ type: 'success', text1: 'Vui lòng kiểm tra email của bạn để đặt lại mật khẩu.' });
                navigation.navigate("SendOtp", { email: email });
            }
        } catch (error) {
            // Xử lý các lỗi xảy ra trong quá trình gửi yêu cầu
            if (error.response && error.response.status === 404) {
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
        <View style={[styleShare.container, { paddingHorizontal: 20 }]}>
            <View style={styles.containerTop}>
                <Text style={styleShare.titleText}>Quên mật khẩu?</Text>
                <Text style={styles.desc}>Để đặt lại mật khẩu, bạn cần email để xác thực</Text>
                <Image style={styleShare.imageLogin} source={require("../../assets/images/forgotPass.png")} />
            </View>
            <View>
                <Text style={styles.textInput}>Email</Text>
                <InputMain
                    placeholder="Địa chỉ Email đã đăng ký tài khoản"
                    value={email}
                    onChangeText={setEmail} />
            </View>
            <View style={styles.containerFooter}>
                {loading ? (
                    <ActivityIndicator color={orange} size={'large'} />
                ) : (
                    <ButtonMain title={'Đặt lại mật khẩu'}
                        backgroundColor={bgButton1}
                        textColor={white}
                        onPress={() => handlePasswordReset()} />
                )}
                <ButtonMain title={'Trở về đăng nhập'}
                    backgroundColor={bgButton2}
                    onPress={() => { navigation.navigate("Login") }}
                    textColor={bgButton1} />
            </View>
        </View>
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
        color: bgButton1,
    },
})