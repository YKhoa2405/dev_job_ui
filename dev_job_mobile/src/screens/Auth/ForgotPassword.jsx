import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import StyleShare from "../../assets/themes/StyleShare";
import { bgButton2, mainColor, white } from "../../assets/themes/Color";
import Input from "../../components/Input";
import Button from "../../components/Button";
export default function ForgotPassword({ navigation }) {
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
        <View style={[StyleShare.container, { paddingHorizontal: 20 }]}>
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
                    <ActivityIndicator color={orange} size={'large'} />
                ) : (
                    <Button title={'Đặt lại mật khẩu'}
                        backgroundColor={mainColor}
                        textColor={white}
                        onPress={() => handlePasswordReset()} />
                )}
                <Button title={'Trở về đăng nhập'}
                    backgroundColor={bgButton2}
                    onPress={() => { navigation.navigate("Login") }}
                    textColor={mainColor} />
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
        color: mainColor,
    },
})