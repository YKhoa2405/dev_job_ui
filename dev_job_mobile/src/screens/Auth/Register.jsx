import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native";
import StyleShare from "../../assets/themes/StyleShare";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { mainColor, orange, white } from "../../assets/themes/Color";



export default function Register({ navigation }) {
    const [userName, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordAg, setPasswordAg] = useState('');
    const [avatar, setAvatar] = useState(null)



    return (
        <ScrollView style={[StyleShare.container, { marginHorizontal: 20 }]} showsVerticalScrollIndicator={false}>
            <View style={styles.containerTop}>
                <Text style={StyleShare.titleText30}>Đăng ký tài khoản</Text>
                <Text style={styles.desc}>Đăng ký tài khoản để tìm kiếm công việc mở ước,</Text>
                <Text>công việc theo chuyên môn và nhiều hơn thế nữa</Text>
            </View>
            <View style={styles.containerMain}>
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
                <Button title={'Đăng ký'}
                    backgroundColor={mainColor}
                    textColor={white}
                    onPress={() => handleSignUp()} />
                <View style={[StyleShare.flexCenter, { marginTop: 30 }]}>
                    <Text>Bạn đã có tài khoản ? </Text>
                    <TouchableOpacity><Text style={{ fontWeight: '500', color: orange }} onPress={() => navigation.navigate('Login')}>Đăng nhập ngay</Text></TouchableOpacity>
                </View>
            </View>
        </ScrollView>
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
    imageUpload: {
        marginTop: 10,
        width: 60,
        height: 60,
        resizeMode: 'cover',
        borderRadius: 100,
        borderWidth: 1
    },
})