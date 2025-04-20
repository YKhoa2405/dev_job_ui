import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { mainColor, orange, white } from "../../assets/themes/Color";
import StyleShare from "../../assets/themes/StyleShare";
import Input from "../../components/Input";
import Button from "../../components/Button";
import API, { endpoints } from "../../assets/config/API";
import { ToastMess } from "../../components/ToastMess";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess, logout } from "../../redux/slice/userSlice";
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import axios from 'axios';
import { github_client_id } from "../../assets/config/Key";

// Hoàn tất phiên xác thực
WebBrowser.maybeCompleteAuthSession();

export default function Login({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user.user);

    // Cấu hình redirect URI cho deep linking
    const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'devjob',
        path: 'auth',
    });

    // Cấu hình yêu cầu OAuth
    const [request, response, promptAsync] = AuthSession.useAuthRequest(
        {
            clientId: github_client_id,
            redirectUri,
            scopes: ['user:email'],
        },
        { authorizationEndpoint: 'https://github.com/login/oauth/authorize' }
    );

    useEffect(() => {
        if (user) {
            const role = user.role?.name;
            console.log('User role:', role);
            if (role === 'NORMAL_USER') {
                navigation.navigate('MainTab');
            } else if (role === 'EMPLOYER_USER') {
                navigation.navigate('HomeCompany');
            } else {
                console.warn('Unknown role:', role);
                ToastMess({ type: 'error', text1: 'Vai trò không hợp lệ' });
                dispatch(logout());
            }
        }
    }, [user]);

    useEffect(() => {
        // Xử lý phản hồi từ GitHub OAuth
        if (response?.type === 'success') {
            const { code } = response.params;
            handleGitHubCallback(code);
        } else if (response?.type === 'error') {
            ToastMess({ type: 'error', text1: 'Đăng nhập GitHub thất bại' });
        }
    }, [response]);

    // Hàm xử lý đăng nhập GitHub
    const handleLoginGithub = async () => {
        if (!request) {
            ToastMess({ type: 'error', text1: 'Đang tải cấu hình GitHub...' });
            return;
        }
        try {
            await promptAsync();
        } catch (error) {
            console.error('GitHub login error:', error);
            ToastMess({ type: 'error', text1: 'Lỗi khi khởi động đăng nhập GitHub' });
        }
    };

    // Hàm gửi code đến backend và nhận JWT
    const handleGitHubCallback = async (code) => {
        try {
            const response = await axios.get('http://192.168.1.120:8000/auth/github/callback', {
                params: { code },
            });
            const { accessToken, user } = response.data;

            // Lưu token và thông tin người dùng
            await AsyncStorage.setItem("access_token", accessToken);
            dispatch(loginSuccess({ user }));
        } catch (error) {
            console.error('GitHub callback error:', error);
            ToastMess({ type: 'error', text1: 'Lỗi khi xác thực GitHub' });
        }
    };

    // Hàm xử lý đăng nhập bằng email/mật khẩu
    const handleLogin = async () => {
        setLoading(true);
        try {
            let header = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
            let data = {
                // username: email || '2151050202khoa@ou.edu.vn',
                username: email || 'nguyenykhoa2405@gmail.com',

                password: password || '123456',
            };
            let res = await API.post(endpoints['login'], data, { headers: header });
            const { access_token, ...user } = res.data.data;
            await AsyncStorage.setItem("access_token", access_token);

            dispatch(loginSuccess({ user }));
        } catch (error) {
            if (error.response && error.response.status === 400) {
                ToastMess({ type: 'error', text1: 'Email hoặc mật khẩu không chính xác' });
            } else {
                ToastMess({ type: 'error', text1: 'Có lỗi xảy ra khi đăng nhập' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[StyleShare.container, { marginHorizontal: 20 }]}>
            <View style={styles.containerTop}>
                <Text style={StyleShare.titleText30}>Chào mừng trở lại</Text>
                <Text style={styles.desc}>Đăng nhập tài khoản để tìm kiếm công việc mơ ước,</Text>
                <Text>công việc theo chuyên môn và nhiều hơn thế nữa</Text>
            </View>
            <View style={styles.containerMain}>
                <Text style={styles.textInput}>Email</Text>
                <Input
                    placeholder="Nhập Email"
                    onChangeText={setEmail}
                    value={email}
                    autoCapitalize="none"
                />
                <Text style={styles.textInput}>Mật khẩu</Text>
                <Input
                    placeholder="Nhập mật khẩu"
                    isPassword={true}
                    onChangeText={setPassword}
                    value={password}
                    autoCapitalize="none"
                />
                <View style={{ alignItems: "flex-end" }}>
                    <TouchableOpacity onPress={() => navigation.navigate("ForgotPasswork")}>
                        <Text style={styles.textInput}>Quên mật khẩu ?</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.containerFooter}>
                {loading ? (
                    <ActivityIndicator color={orange} size={'large'} />
                ) : (
                    <Button
                        title={'Đăng nhập'}
                        backgroundColor={mainColor}
                        textColor={white}
                        onPress={handleLogin}
                    />
                )}

                <View style={StyleShare.lineContainer}>
                    <View style={[StyleShare.line, { backgroundColor: white }]}></View>
                    <Text style={StyleShare.lineText}>hoặc đăng nhập bằng</Text>
                    <View style={[StyleShare.line, { backgroundColor: white }]}></View>
                </View>
                <View style={StyleShare.flexCenter}>
                    <TouchableOpacity style={styles.optionLoginContainer} onPress={handleLoginGithub}>
                        <Image
                            source={require('../../assets/images/github.png')}
                            style={styles.optionImage}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.optionLoginContainer}>
                        <Image
                            source={require('../../assets/images/google.png')}
                            style={styles.optionImage}
                        />
                    </TouchableOpacity>
                </View>
                <View style={StyleShare.flexCenter}>
                    <Text>Bạn chưa có tài khoản ? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate("ChooseRole")}>
                        <Text style={{ fontWeight: '500', color: orange }}>Đăng ký ngay</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    containerTop: {
        marginTop: 90,
        alignItems: 'center',
    },
    containerMain: {
        marginTop: 30,
    },
    containerFooter: {
        marginTop: 30,
    },
    desc: {
        marginTop: 20,
    },
    textInput: {
        fontWeight: 'bold',
        color: mainColor,
        marginTop: 15,
    },
    optionLoginContainer: {
        alignItems: 'center',
    },
    optionImage: {
        width: 40,
        height: 40,
        marginTop: 10,
        marginBottom: 40,
        marginHorizontal: 40,
    },
});