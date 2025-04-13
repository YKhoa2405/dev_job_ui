import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Linking } from "react-native";
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
import axios from 'axios';
import { github_client_id } from "../../assets/config/Key";

export default function Login({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user.user);

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

        // Lắng nghe redirect từ backend qua custom URI scheme
        const handleOpenURL = (event) => {
            const { url } = event;
            console.log('Received URL:', url);
            const token = new URL(url).searchParams.get('token');

            if (token) {
                handleGithubCallback(token);
            } else {
                ToastMess({ type: 'error', text1: 'Không nhận được token' });
                setLoading(false);
            }
        };

        // Lưu subscription từ addEventListener
        const subscription = Linking.addEventListener('url', handleOpenURL);

        // Cleanup bằng subscription.remove()
        return () => {
            subscription.remove();
        };
    }, [user]);

    const handleGithubCallback = async (token) => {
        try {
            // Gọi API backend để lấy thông tin user với token
            const response = await axios.get(
                `http://192.168.1.120:8000/auth/verify-token?token=${token}`,
                { timeout: 10000 }
            );

            console.log('Backend Response:', response.data);

            const { user } = response.data;

            if (user.role?.name !== 'NORMAL_USER') {
                throw new Error('Chỉ người dùng thông thường (NORMAL_USER) được phép đăng nhập bằng GitHub');
            }

            await AsyncStorage.setItem("access_token", token);
            dispatch(
                loginSuccess({
                    user,
                })
            );
        } catch (error) {
            console.error('Lỗi xử lý GitHub callback:', error.response?.data || error.message);
            ToastMess({
                type: 'error',
                text1: error.message || 'Có lỗi xảy ra khi đăng nhập GitHub',
            });
            setLoading(false);
        }
    };

    const handleLoginGithub = async () => {
        setLoading(true);
        try {
            const clientId = github_client_id;
            const redirectUri = 'http://192.168.1.120:8000/auth/github/callback';
            const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`;

            console.log('Auth URL:', authUrl);

            const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

            console.log('WebBrowser Result:', result);

            if (result.type !== 'success') {
                ToastMess({ type: 'error', text1: 'Đăng nhập GitHub bị hủy hoặc thất bại' });
                setLoading(false);
            }
        } catch (error) {
            console.error('Lỗi đăng nhập GitHub:', error.response?.data || error.message);
            ToastMess({
                type: 'error',
                text1: error.message || 'Có lỗi xảy ra khi đăng nhập GitHub',
            });
            setLoading(false);
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
                // password: password,
                // username: 'nguyenykhoali2003@gmail.com',
                username: 'nykhoa2405@gmail.com',

                password: '123456',
            };
            let res = await API.post(endpoints['login'], data, { headers: header });
            const { access_token, ...user } = res.data.data;
            await AsyncStorage.setItem("access_token", access_token);

            dispatch(
                loginSuccess({
                    user,
                })
            );
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