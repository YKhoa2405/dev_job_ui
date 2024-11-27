import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, ScrollView } from "react-native";
import styleShare from "../../assets/theme/style";
import InputMain from "../../components/InputMain";
import { bgButton1, bgButton2, orange, white } from "../../assets/theme/color";
import ButtonMain from "../../components/ButtonMain";
import { ToastMess } from "../../components/ToastMess";
import axios from "axios";
import API, { endpoints } from "../../config/API";
export default function SendOtp({ navigation, route }) {

    const { email } = route.params;
    const [loading, setLoading] = useState(false);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordAg, setNewPasswordAg] = useState('');

    const handleResetPassword = async () => {
        if (!email || !otp || !newPassword || !newPasswordAg) {
            ToastMess({ type: 'error', text1: 'Vui lòng điền đầy đủ thông tin.' });
            return;
        }
        if (newPassword !== newPasswordAg) {
            ToastMess({ type: 'error', text1: 'Mật khẩu và mật khẩu xác nhận không khớp.' });
            return;
        }

        setLoading(true);
        try {
            let form = new FormData();
            form.append('email', email);
            form.append('otp', otp);
            form.append('new_password', newPassword);
            console.log(form)
            const response = await API.post(endpoints['reset-password'], form, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                ToastMess({ type: 'success', text1: 'Đổi mật khẩu thành công.' });
                navigation.navigate("Login"); // Điều hướng đến màn hình đăng nhập
            }
        } catch (error) {
            if (error.response) {
                if (error.response.status === 400) {
                    ToastMess({ type: 'error', text1: 'Mã OTP không hợp lệ hoặc đã hết hạn.' });
                    console.log(error)

                } else {
                    ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại.' });
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
        <ScrollView style={[styleShare.container, { paddingHorizontal: 20 }]} showsVerticalScrollIndicator={false}>

            <View style={styles.containerTop}>
                <Text style={styleShare.titleText}>Đổi mật khẩu?</Text>
                <Text style={styles.desc}>Chúng tôi đã gửi mã đặt lại mật khẩu tới địa chỉ Email</Text>
                <Text style={styles.desc}>{email}</Text>
                <Image style={styles.imageSentOtp} source={require("../../assets/images/otp.png")} />
            </View>
            <View>
                <Text style={styles.textInput}>Mã OTP</Text>
                <InputMain
                    placeholder="Mã gồm 4 chữ số được gửi về Email"
                    value={otp}
                    onChangeText={setOtp} />
                <Text style={styles.textInput}>Nhập mật khẩu mới</Text>
                <InputMain
                    placeholder="Nhập mật khẩu mới của bạn"
                    value={newPassword}
                    isPassword={true}
                    onChangeText={setNewPassword} />
                <Text style={styles.textInput}>Nhập lại mật khẩu mới</Text>
                <InputMain
                    placeholder="Nhập lại mật khẩu"
                    value={newPasswordAg}
                    isPassword={true}
                    onChangeText={setNewPasswordAg} />
            </View>
            <View style={styles.containerFooter}>
                {loading ? (
                    <ActivityIndicator color={orange} size={'large'} />
                ) : (
                    <ButtonMain title={'Xác nhận'}
                        backgroundColor={bgButton1}
                        textColor={white}
                        onPress={() => handleResetPassword()} />
                )}
            </View>
        </ScrollView>
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
        marginTop: 15
    },
    imageSentOtp: {
        width: 250,
        height: 250,
        marginTop: 20,
        marginBottom: 10,
        resizeMode: 'center',

    }
})