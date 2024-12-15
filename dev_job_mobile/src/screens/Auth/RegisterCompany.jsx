import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native";
import StyleShare from "../../assets/themes/StyleShare";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { mainColor, orange, white } from "../../assets/themes/Color";
import UIHeader from "../../components/UIHeader";



export default function RegisterClient({ navigation, route }) {
    const { role } = route.params
    const [userName, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordAg, setPasswordAg] = useState('');
    const [avatar, setAvatar] = useState(null)


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
                    <Text style={[styles.textInput, { color: orange }]}>Thông tin công ty</Text>
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

                    />
                </View>
                <View style={styles.containerFooter}>
                    <Button title={'Đăng ký'}
                        backgroundColor={mainColor}
                        textColor={white}
                        onPress={() => handleSignUp()} />
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