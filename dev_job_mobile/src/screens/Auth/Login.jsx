import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { mainColor, orange, white } from "../../assets/themes/Color";
import StyleShare from "../../assets/themes/StyleShare";
import Input from "../../components/Input";
import Button from "../../components/Button";

export default function Login({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);


    return (
        <View style={[StyleShare.container, { marginHorizontal: 20, }]}>
            <View style={styles.containerTop}>
                <Text style={StyleShare.titleText30}>Chào mừng trở lại</Text>
                <Text style={styles.desc}>Đăng nhập tài khoản để tìm kiếm công việc mở ước,</Text>
                <Text>công việc theo chuyên môn và nhiều hơn thế nữa</Text>
            </View>
            <View style={styles.containerMain}>
                <Text style={styles.textInput}>Email</Text>
                <Input
                    placeholder="Nhập Email"
                    onChangeText={setEmail}
                    autoCapitalize="none"

                />
                <Text style={styles.textInput}>Mật khẩu</Text>
                <Input
                    placeholder="Nhập mật khẩu"
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
                    <Button
                        title={'Đăng nhập'}
                        backgroundColor={mainColor}
                        textColor={white}
                        onPress={() => handleLogin()}
                    />
                )}

                <View style={StyleShare.lineContainer}>
                    <View style={StyleShare.line}></View>
                    <Text style={StyleShare.lineText}>hoặc đăng nhập bằng</Text>
                    <View style={StyleShare.line}></View>
                </View>
                <View style={StyleShare.flexCenter}>
                    <TouchableOpacity style={styles.optionLoginContainer}>
                        <Image source={require('../../assets/images/google.png')} style={styles.optionImage} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.optionLoginContainer}>
                        <Image source={require('../../assets/images/google.png')} style={styles.optionImage} />
                    </TouchableOpacity>

                </View>
                <View style={StyleShare.flexCenter}>
                    <Text>Bạn chưa có tài khoản ? </Text>
                    <TouchableOpacity onPress={() => { navigation.navigate("Register") }}><Text style={{ fontWeight: '500', color: orange }}>Đăng ký ngay</Text></TouchableOpacity>
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
        color: mainColor,
        marginTop: 15
    },
    optionLoginContainer: {
        alignItems: 'center'
    },
    optionImage: {
        width: 40,
        height: 40,
        marginTop: 10,
        marginBottom: 40,
        marginHorizontal: 40
    }
})