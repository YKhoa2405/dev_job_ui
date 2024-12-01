import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, ScrollView } from "react-native";
import StyleShare from "../../assets/themes/StyleShare";
import { mainColor, orange, white } from "../../assets/themes/Color";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { ToastMess } from "../../components/ToastMess";
import API, { endpoints } from "../../assets/config/API";
export default function SendCode({ navigation, route }) {

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
            await API.post(endpoints['changePassword'], { email, code: otp, newPassword }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            ToastMess({ type: 'success', text1: 'Đổi mật khẩu thành công.' });
            navigation.navigate("Login");
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
        <ScrollView style={[StyleShare.container, { paddingHorizontal: 20 }]} showsVerticalScrollIndicator={false}>

            <View style={styles.containerTop}>
                <Text style={StyleShare.titleText30}>Đổi mật khẩu?</Text>
                <Text style={styles.desc}>Chúng tôi đã gửi mã đặt lại mật khẩu tới địa chỉ Email</Text>
                {/* <Text style={styles.desc}>{email}</Text> */}
                <Image style={styles.imageSentOtp} source={require("../../assets/images/otp.png")} />
            </View>
            <View>
                <Text style={styles.textInput}>Mã OTP</Text>
                <Input
                    placeholder="Mã gồm 4 chữ số được gửi về Email"
                    value={otp}
                    onChangeText={setOtp} />
                <Text style={styles.textInput}>Nhập mật khẩu mới</Text>
                <Input
                    placeholder="Nhập mật khẩu mới của bạn"
                    value={newPassword}
                    isPassword={true}
                    onChangeText={setNewPassword} />
                <Text style={styles.textInput}>Nhập lại mật khẩu mới</Text>
                <Input
                    placeholder="Nhập lại mật khẩu"
                    value={newPasswordAg}
                    isPassword={true}
                    onChangeText={setNewPasswordAg} />
            </View>
            <View style={styles.containerFooter}>
                {loading ? (
                    <ActivityIndicator color={orange} size={'large'} />
                ) : (
                    <Button title={'Xác nhận'}
                        backgroundColor={mainColor}
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
        color: mainColor,
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