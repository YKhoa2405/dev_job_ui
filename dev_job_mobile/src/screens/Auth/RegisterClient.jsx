import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native";
import StyleShare from "../../assets/themes/StyleShare";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { mainColor, orange, white } from "../../assets/themes/Color";
import UIHeader from "../../components/UIHeader";
import * as ImagePicker from 'expo-image-picker';
import { ToastMess } from "../../components/ToastMess";
import API, { endpoints } from "../../assets/config/API";
import Loading from "../../components/Loading";

export default function RegisterClient({ navigation, route }) {
    const { role } = route.params;
    const [userName, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [passwordAg, setPasswordAg] = useState('');
    const [loading, setLoading] = useState(false);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone) => {
        // Chấp nhận: bắt đầu bằng 0 hoặc +84, theo sau là các đầu số hợp lệ, 9 chữ số
        const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;
        return phoneRegex.test(phone);
    };

    const validatePassword = (password) => {
        // Password must be at least 8 characters, include a number and a special character
        const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
        return passwordRegex.test(password);
    };

    const handleRegister = async () => {
        // Check for empty fields
        if (!email || !password || !userName || !passwordAg || !phone) {
            ToastMess({ type: 'error', text1: 'Vui lòng điền đầy đủ tất cả các trường.' });
            return;
        }

        // Validate email
        if (!validateEmail(email)) {
            ToastMess({ type: 'error', text1: 'Email không hợp lệ.' });
            return;
        }

        // Validate phone number
        if (!validatePhone(phone)) {
            ToastMess({ type: 'error', text1: 'Số điện thoại không hợp lệ.' });
            return;
        }

        // Validate password
        if (!validatePassword(password)) {
            ToastMess({ type: 'error', text1: 'Mật khẩu có ít nhất 8 ký tự, gồm số và ký tự đặc biệt.' });
            return;
        }

        // Check if passwords match
        if (password !== passwordAg) {
            ToastMess({ type: 'error', text1: 'Mật khẩu và mật khẩu xác nhận không khớp.' });
            return;
        }

        setLoading(true);

        const formRegister = new URLSearchParams();
        formRegister.append('email', email);
        formRegister.append('name', userName);
        formRegister.append('phone', phone);
        formRegister.append('password', password);
        console.log(formRegister);
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
                phone: phone,
                role: role,
            });

        } catch (error) {
            if (error.response && error.response.status === 400) {
                ToastMess({ type: 'error', text1: error.response.data.message });
                console.log(error.response.data);
            } else {
                ToastMess({ type: 'error', text1: 'Có lỗi xảy ra. Vui lòng thử lại.' });
                console.log(error);
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
            <ScrollView contentContainerStyle={{ marginHorizontal: 20 }} showsVerticalScrollIndicator={false}>
                <View style={styles.containerTop}>
                    <Text style={StyleShare.titleText30}>Đăng ký tài khoản ứng viên</Text>
                    <Text style={styles.desc}>
                        Đăng ký tài khoản để tìm kiếm công việc mơ ước, công việc theo chuyên môn và nhiều hơn thế nữa
                    </Text>
                </View>
                <View style={styles.containerMain}>
                    <Text style={[styles.textInput, { color: orange }]}>Thông tin đăng nhập</Text>
                    <Text style={styles.textInput}>Họ và tên</Text>
                    <Input
                        placeholder="Họ và tên"
                        onChangeText={setUsername}
                        autoCapitalize="none"
                    />
                    <Text style={styles.textInput}>Email</Text>
                    <Input
                        placeholder="Email"
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                    <Text style={styles.textInput}>Số điện thoại</Text>
                    <Input
                        placeholder="Số điện thoại +84"
                        onChangeText={setPhone}
                        autoCapitalize="none"
                        keyboardType="phone-pad"
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
                </View>
                <View style={styles.containerFooter}>
                    {loading ? (
                        <Loading />
                    ) : (
                        <Button
                            title={'Đăng ký'}
                            backgroundColor={mainColor}
                            textColor={white}
                            onPress={handleRegister}
                        />
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    containerTop: {
        marginTop: 20,
        alignItems: 'center',
    },
    containerMain: {
        marginTop: 20,
    },
    containerFooter: {
        marginTop: 30,
    },
    desc: {
        marginTop: 20,
        textAlign: 'center',
    },
    textInput: {
        fontWeight: 'bold',
        color: mainColor,
        marginTop: 15,
    },
    imageUpload: {
        marginTop: 10,
        width: 60,
        height: 60,
        resizeMode: 'cover',
        borderRadius: 100,
        borderWidth: 1,
    },
});