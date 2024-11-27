import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native";
import styleShare from "../../assets/theme/style";
import InputMain from "../../components/InputMain";
import { bgButton1, bgButton2, orange, white } from "../../assets/theme/color";
import ButtonMain from "../../components/ButtonMain";
import { ToastMess } from "../../components/ToastMess";
import * as ImagePicker from 'expo-image-picker';



export default function Register({ navigation }) {
    const [userName, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordAg, setPasswordAg] = useState('');
    const [avatar, setAvatar] = useState(null)


    async function chooseImage() {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        })

        if (!result.canceled) {
            setAvatar(result.assets[0].uri)
        }
    }

    const handleSignUp = async () => {
        if (!email || !password || !userName || !passwordAg || !avatar) {
            ToastMess({ type: 'error', text1: 'Vui lòng không để trống các trường.' });
            return;
        }

        if (password !== passwordAg) {
            ToastMess({ type: 'error', text1: 'Mật khẩu và mật khẩu xác nhận không khớp.' });
            return;
        }


        navigation.navigate('ChooseRole', {
            email,
            password,
            userName,
            avatar
        });
    };

    return (
        <ScrollView style={[styleShare.container, { marginHorizontal: 20 }]} showsVerticalScrollIndicator={false}>
            <View style={styles.containerTop}>
                <Text style={styleShare.titleText}>Đăng ký tài khoản</Text>
                <Text style={styles.desc}>Đăng ký tài khoản để tìm kiếm công việc mở ước,</Text>
                <Text>công việc theo chuyên môn và nhiều hơn thế nữa</Text>
            </View>
            <View style={styles.containerMain}>
                <Text style={styles.textInput}>Họ và tên</Text>
                <InputMain
                    placeholder="Họ và tên"
                    onChangeText={setUsername}
                    autoCapitalize="none"
                />
                <Text style={styles.textInput}>Email</Text>
                <InputMain
                    placeholder="Email"
                    onChangeText={setEmail}
                    autoCapitalize="none"
                />
                <Text style={styles.textInput}>Ảnh đại diện</Text>
                {avatar ? (
                    <TouchableOpacity onPress={chooseImage}>
                        <Image source={{ uri: avatar }} style={styles.imageUpload} />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={chooseImage} style={{ width: '100%', height: 50, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', marginTop: 10, borderRadius: 20 }}>
                        <Text style={{ fontSize: 16 }}>Tải ảnh của bạn</Text>
                    </TouchableOpacity>
                )}

                <Text style={styles.textInput}>Mật khẩu</Text>
                <InputMain
                    placeholder="Mật khẩu"
                    isPassword={true}
                    onChangeText={setPassword}
                    autoCapitalize="none"

                />
                <Text style={styles.textInput}>Nhập lại mật khẩu</Text>
                <InputMain
                    placeholder="Nhập lại mật khẩu"
                    isPassword={true}
                    onChangeText={setPasswordAg}
                    autoCapitalize="none"

                />
            </View>
            <View style={styles.containerFooter}>
                <ButtonMain title={'Đăng ký'}
                    backgroundColor={bgButton1}
                    textColor={white}
                    onPress={() => handleSignUp()} />
                <View style={[styleShare.flexCenter, { marginTop: 30 }]}>
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
        color: bgButton1,
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