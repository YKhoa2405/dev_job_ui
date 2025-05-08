import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { mainColor, orange, white } from "../../assets/themes/Color";
import StyleShare from "../../assets/themes/StyleShare";
import Input from "../../components/Input";
import Button from "../../components/Button";
import API, { endpoints } from "../../assets/config/API";
import { ToastMess } from "../../components/ToastMess";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from 'react-redux';
import { loginSuccess } from "../../redux/slice/userSlice";
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { github_client_id } from "../../assets/config/Key";

WebBrowser.maybeCompleteAuthSession();

export default function Login({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false); // For email/password login
    const dispatch = useDispatch();

    const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'devjob',
        path: 'auth',
    });

    const [request, response, promptAsync] = AuthSession.useAuthRequest(
        {
            clientId: github_client_id,
            redirectUri,
            scopes: ['user:email'],
        },
        { authorizationEndpoint: 'https://github.com/login/oauth/authorize' }
    );

    useEffect(() => {
        if (response?.type === 'success') {
            const { code } = response.params;
            handleGithubCallback(code);
        } else if (response?.type === 'error') {
            ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại' });
        }
    }, [response]);

    const handleGithubCallback = async (code) => {
        try {
            const res = await API.get(endpoints['githubCallback'](code), {
                headers: {
                    Accept: 'application/json',
                },
            });
            const { access_token, _id, email, name, role, avatar } = res.data.data;

            // Create user object for consistency
            const user = {
                _id,
                email,
                name,
                role,
                avatar: avatar || 'https://via.placeholder.com/100',
            };

            await AsyncStorage.setItem("access_token", access_token);
            dispatch(loginSuccess({ user }));

            const roleName = role.name;
            if (roleName === 'NORMAL_USER') {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'MainTab', params: { screen: 'HomeClient' } }],
                });
            }
        } catch (error) {
            ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại' });
        }
    };

    const handleLoginGithub = async () => {
        try {
            await promptAsync();
        } catch (error) {
            ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại' });
        }
    };

    const handleLogin = async () => {
        setLoading(true);
        try {
            let header = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
            let data = {
                // username: email || '2151050202khoa@ou.edu.vn',
                username: 'nykhoa2405@gmail.com',
                password: password || '123456',
            };
            let res = await API.post(endpoints['login'], data, { headers: header });
            const { access_token, _id, email, name, role, avatar } = res.data.data;

            const user = {
                _id,
                email,
                name,
                role,
                avatar: avatar || 'https://via.placeholder.com/100',
            };

            await AsyncStorage.setItem("access_token", access_token);
            dispatch(loginSuccess({ user }));

            const roleName = role.name;
            if (roleName === 'NORMAL_USER') {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'MainTab', params: { screen: 'HomeClient' } }],
                });
            } else if (roleName === 'EMPLOYER_USER') {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'HomeCompany' }],
                });
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                ToastMess({ type: 'error', text1: 'Email hoặc mật khẩu không chính xác' });
            } else {
                ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại' });
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
                    <TouchableOpacity
                        style={styles.optionLoginContainer}
                        onPress={handleLoginGithub}
                    >
                        <Image
                            source={require('../../assets/images/github.png')}
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