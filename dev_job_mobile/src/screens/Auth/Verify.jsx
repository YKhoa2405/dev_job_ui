import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, ScrollView } from "react-native";
import StyleShare from "../../assets/themes/StyleShare";
import { mainColor, orange, white } from "../../assets/themes/Color";
import Input from "../../components/Input";
import Button from "../../components/Button";
export default function Verify({ navigation, route }) {

    // const { email } = route.params;
    const [loading, setLoading] = useState(false);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordAg, setNewPasswordAg] = useState('');



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