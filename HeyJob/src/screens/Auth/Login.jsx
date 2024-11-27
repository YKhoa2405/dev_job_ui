import React, { useContext, useState } from "react";
import MyContext from "../../config/MyContext";
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import styleShare from "../../assets/theme/style";
import InputMain from "../../components/InputMain";
import { bgButton1, bgButton2, orange, white } from "../../assets/theme/color";
import ButtonMain from "../../components/ButtonMain";
import { ToastMess } from "../../components/ToastMess";
import { client_id_api, client_secret_api, clinet_id_google } from "../../config/Key";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API, { authApi, endpoints } from "../../config/API";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { storeDb } from "../../config/Firebase";

export default function Login({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [user, dispatch] = useContext(MyContext)

    async function saveUserToFirestore(id, email, username, avatar, role) {
        try {
            const userDoc = doc(storeDb, "users", id.toString()); // Đảm bảo ID là chuỗi
            const docSnap = await getDoc(userDoc);

            if (!docSnap.exists()) {
                // Lưu thông tin người dùng mới
                await setDoc(userDoc, {
                    id: id.toString(),
                    name: username || 'Unknown User', // Cung cấp giá trị mặc định
                    email: email || '',
                    role: role || '',
                    avatar: avatar || '',
                });
            } else {
                // Cập nhật thông tin người dùng
                await setDoc(userDoc, {
                    id: id.toString(),
                    name: username || 'Unknown User',
                    email: email || '',
                    role: role || '',
                    avatar: avatar || '',
                }, { merge: true });
            }
        } catch (error) {
            console.error('Error saving user:', error);
        }
    }

    const handleLogin = async () => {
        if (!email || !password) {
            ToastMess({ type: 'error', text1: 'Vui lòng không để trống các trường.' });
            return;
        }

        setLoading(true)
        try {
            let header = {
                'Content-Type': 'application/x-www-form-urlencoded' // Change Content-Type
            };
            let data = {
                username: email,
                password: password,
                client_id: client_id_api,
                client_secret: client_secret_api,
                grant_type: "password",
            };
            let res = await API.post(endpoints["login"], data, { headers: header });
            await AsyncStorage.setItem("access-token", res.data.access_token)

            let user = await authApi(res.data.access_token).get(endpoints['current_user']);
            console.log(user.data)

            dispatch({
                'type': 'login',
                'payload': user.data
            })
            if (user.data.role == 'Ung vien') {
                navigation.navigate('MainTab')
                await saveUserToFirestore(user.data.id, user.data.email, user.data.username, user.data.avatar, user.data.role);

            } else {
                navigation.navigate('EmployerTab')
                await saveUserToFirestore(user.data.id, user.data.email, user.data.employer.company_name, user.data.avatar, user.data.role);
            }


        } catch (error) {

            if (error.response && error.response.status === 400) {
                ToastMess({ type: 'error', text1: 'Email hoặc mật khẩu không chính xác' })
            }
            console.log(error)
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styleShare.container, { marginHorizontal: 20 }]}>
            <View style={styles.containerTop}>
                <Text style={styleShare.titleText}>Chào mừng trở lại</Text>
                <Text style={styles.desc}>Đăng nhập tài khoản để tìm kiếm công việc mở ước,</Text>
                <Text>công việc theo chuyên môn và nhiều hơn thế nữa</Text>
            </View>
            <View style={styles.containerMain}>
                <Text style={styles.textInput}>Tên tài khoản</Text>
                <InputMain
                    placeholder="Tên tài khoản"
                    onChangeText={setEmail}
                    autoCapitalize="none"

                />
                <Text style={styles.textInput}>Mật khẩu</Text>
                <InputMain
                    placeholder="Mật khẩu"
                    isPassword={true}
                    onChangeText={setPassword}
                    autoCapitalize="none"
                />
                <View style={{ alignItems: "flex-end" }}>
                    <TouchableOpacity onPress={() => { navigation.navigate("ForgotPass") }}>
                        <Text style={styles.textInput}>Quên mật khẩu ?</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.containerFooter}>
                {loading ? (
                    <ActivityIndicator color={orange} size={'large'} />
                ) : (
                    <ButtonMain
                        title={'Đăng nhập'}
                        backgroundColor={bgButton1}
                        textColor={white}
                        onPress={() => handleLogin()}
                    />
                )}

                <View style={styleShare.lineContainer}>
                    <View style={styleShare.line}></View>
                    {/* <Text style={styleShare.lineText}>hoặc đăng nhập bằng</Text> */}
                    <View style={styleShare.line}></View>
                </View>
                {/* <TouchableOpacity style={styles.optionLoginContainer}>
                    <Image source={require('../../assets/images/google.png')} style={styles.optionImage} />
                </TouchableOpacity> */}
                <View style={styleShare.flexCenter}>
                    <Text>Bạn chưa có tài khoản ? </Text>
                    <TouchableOpacity onPress={() => { navigation.navigate("Register") }}><Text style={{ fontWeight: '500', color: orange }} onPress={() => navigation.navigate('Register')}>Đăng ký ngay</Text></TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    containerTop: {
        marginTop: 90,
        alignItems: 'center',
    }
    , containerMain: {
        marginTop: 30
    },
    containerFooter: {
        marginTop: 30
    }
    , desc: {
        marginTop: 20
    }, textInput: {
        fontWeight: 'bold',
        color: bgButton1,
        marginTop: 15
    },
    optionLoginContainer: {
        alignItems: 'center'
    },
    optionImage: {
        width: 40,
        height: 40,
        marginTop: 10,
        marginBottom: 40
    }
})