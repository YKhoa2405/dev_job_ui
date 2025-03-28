import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native";
import StyleShare from "../../assets/themes/StyleShare";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { mainColor, orange, white } from "../../assets/themes/Color";
import UIHeader from "../../components/UIHeader";
import { ToastMess } from "../../components/ToastMess";
import Loading from "../../components/Loading";
import API, { endpoints } from "../../assets/config/API";



export default function RegisterClient({ navigation, route }) {
    const { role } = route.params
    const [userName, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordAg, setPasswordAg] = useState('');
    const [loading, setLoading] = useState(false)

    const handleRegister = async () => {
        if (!email || !password || !passwordAg) {
            ToastMess({ type: 'error', text1: 'Vui lòng không để trống các trường.' });
            return;
        }

        if (password !== passwordAg) {
            ToastMess({ type: 'error', text1: 'Mật khẩu và mật khẩu xác nhận không khớp.' });
            return;
        }
        setLoading(true);

        const formRegister = new URLSearchParams();
        formRegister.append('email', email);
        formRegister.append('name', userName);
        formRegister.append('password', password);
        try {
            const res = await API.post(endpoints['registerUser'], formRegister, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            ToastMess({ type: 'success', text1: res.data.data.message });
            navigation.navigate("RegisterSendOtp", {
                email: email,
                password: password,
                name: userName,
                role: role,
            });

        } catch (error) {
            if (error.response && error.response.status === 400) {
                ToastMess({ type: 'error', text1: error.response.data.message });
                console.log(error.response.data)
            } else {
                ToastMess({ type: 'error', text1: 'Đã xảy ra lỗi. Vui lòng thử lại.' });
                console.log(error)
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={StyleShare.container} showsVerticalScrollIndicator={false}>
            <UIHeader
                leftIcon={"arrow-back"}
                handleLeftIcon={() => { navigation.goBack() }}
            />
            <View style={{ marginHorizontal: 20 }}>
                <View style={styles.containerTop}>
                    <Text style={StyleShare.titleText30}>Đăng ký tài khoản </Text>
                    <Text style={StyleShare.titleText30}>Nhà Tuyển Dụng </Text>

                    <Text style={styles.desc}>Đăng ký tài khoản để tuyển dụng các lập trình viên hàng đầu của DevJob</Text>
                </View>
                <View style={styles.containerMain}>
                    <Text style={[styles.textInput, { color: orange }]}>Thông tin đăng nhập</Text>
                    <Text style={styles.textInput}>Họ và tên</Text>
                    <Input
                        placeholder="Tên của HR hoặc người đăng ký tài khoản"
                        onChangeText={setUsername}
                        autoCapitalize="none"
                    />
                    <Text style={styles.textInput}>Email</Text>
                    <Input
                        placeholder="Sử dụng Email của công ty"
                        onChangeText={setEmail}
                        autoCapitalize="none"
                    />
                    <Text style={styles.textInput}>Mật khẩu</Text>
                    <Input
                        placeholder="Mật khẩu"
                        isPassword={true}
                        onChangeText={setPassword}
                        autoCapitalize="none"
                    />
                    <Text style={styles.textInput}>Nhập lại mật khẩu</Text>
                    <Input
                        placeholder="Nhập lại mật khẩu"
                        isPassword={true}
                        onChangeText={setPasswordAg}
                        autoCapitalize="none"
                    />
                    {/* <Text style={[styles.textInput, { color: orange }]}>Thông tin công ty</Text>
                    <Text style={styles.textInput}>Tên công ty</Text>
                    <Input
                        placeholder="Nhập tên công ty đăng ký kinh doanh"

                    />
                    <Text style={styles.textInput}>Mã số thuế</Text>
                    <Input
                        placeholder="Nhập mã số thuế "

                    />
                    <Text style={styles.textInput}>Website công ty</Text>
                    <Input
                        placeholder="Nhập website công ty"

                    />
                    <Text style={styles.textInput}>Quy mô công ty</Text>
                    <Input
                        placeholder="Nhập số lượng nhân viên công ty"
                        keyboardType="numeric"
                    />
                    <Text style={styles.textInput}>Lĩnh vực hoạt động</Text>
                    <Input
                        placeholder="Nhập lĩnh vực hoạt động"

                    />
                    <Text style={styles.textInput}>Giới thiệu công ty</Text>
                    <Input
                        placeholder="Nhập giới thiệu về công ty"

                    /> */}
                </View>
                <View style={styles.containerFooter}>
                    {loading ? <>
                        <Loading /></> : <>
                        <Button title={'Đăng ký'}
                            backgroundColor={mainColor}
                            textColor={white}
                            onPress={() => handleRegister()} />
                    </>}
                </View>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    containerTop: {
        marginTop: 20,
        alignItems: 'center',
    }
    , containerMain: {
        marginTop: 20,
    },
    containerFooter: {
        marginTop: 30
    }
    , desc: {
        marginTop: 20,
        textAlign: 'center'
    }, textInput: {
        fontWeight: 'bold',
        color: mainColor,
        marginTop: 15
    },
    imageUpload: {
        marginTop: 10,
        width: 60,
        height: 60,
        resizeMode: 'cover',
        borderRadius: 100,
        borderWidth: 1
    },
})