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
    const { role } = route.params
    const [userName, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordAg, setPasswordAg] = useState('');
    const [avatar, setAvatar] = useState(null)
    const [loading, setLoading] = useState(false)

    async function handleChooseImage() {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaType.IMAGE,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        })

        if (!result.canceled) {
            setAvatar(result.assets[0].uri)
        }
    }

    const handleRegister = async () => {
        if (!email || !password || !userName || !passwordAg) {
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
        // if (avatar) {
        //     const uriParts = avatar.split('.');
        //     const fileType = uriParts[uriParts.length - 1];  // Lấy phần mở rộng file

        //     formRegister.append('avatar', {
        //         uri: avatar,
        //         name: `avatar.${fileType}`,
        //         type: `image/${fileType}`,
        //     });
        // }
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
                ToastMess({ type: 'error', text1: 'Người dùng đã tồn tại' });
            } else {
                ToastMess({ type: 'error', text1: 'Đã xảy ra lỗi. Vui lòng thử lại.' });
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
            <ScrollView contentContainerStyle={{ marginHorizontal: 20 }} showsVerticalScrollIndicator={false}>
                <View style={styles.containerTop}>
                    <Text style={StyleShare.titleText30}>Đăng ký tài khoản ứng viên</Text>
                    <Text style={styles.desc}>Đăng ký tài khoản để tìm kiếm công việc mở ước,công việc theo chuyên môn và nhiều hơn thế nữa</Text>
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
                    />

                    {/* <Text style={styles.textInput}>Ảnh đại diện</Text>
                    {avatar ? (
                        <TouchableOpacity onPress={handleChooseImage}>
                            <Image source={{ uri: avatar }} style={styles.imageUpload} />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={handleChooseImage} style={{ width: '100%', height: 50, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', marginTop: 10, borderRadius: 10 }}>
                            <Text style={{ fontSize: 16 }}>Tải ảnh của bạn</Text>
                        </TouchableOpacity>
                    )} */}

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
                    {loading ? <>
                        <Loading /></> : <>
                        <Button title={'Đăng ký'}
                            backgroundColor={mainColor}
                            textColor={white}
                            onPress={() => handleRegister()} />
                    </>}
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