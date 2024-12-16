import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import StyleShare from "../../assets/themes/StyleShare";
import { grey, mainColor, orange, white } from "../../assets/themes/Color";



export default function ChooseRole({ navigation }) {
    return (
        <View style={StyleShare.container}>
            <View style={styles.containerTop}>
                <Text style={StyleShare.titleText30}>Chào bạn</Text>
                <Text style={{ fontWeight: '500', color: 'grey', marginTop: 10 }}>Bạn hãy dành ra vài giây để xác nhận thông tin nhé!</Text>

                <View style={StyleShare.lineContainer}>
                    <View style={[StyleShare.line, { backgroundColor: 'white' }]}></View>
                </View>

                <Text style={{ marginTop: 10, fontSize: 16, textAlign: 'center',fontWeight: '400' }}>Để tối ưu tốt nhất cho trải nghiệm của bạn với <Text style={StyleShare.titleText16}>HeyJob</Text>,vui lòng lựa chọn nhóm phù hợp với bạn.</Text>
            </View>
            <View style={styles.containerMain}>
                <View style={styles.optionChoose}>
                    <Image source={require("../../assets/images/division.png")} style={styles.imageChoose} />
                    <TouchableOpacity style={styles.btnChoose} onPress={() => navigation.navigate('RegisterCompany',{role:'nha tuyen dung'})}>
                        <Text style={{ color: white, fontWeight: '500' }}>Nhà tuyển dụng</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.optionChoose}>
                    <Image source={require("../../assets/images/businessman.png")} style={styles.imageChoose} />
                    <TouchableOpacity style={styles.btnChoose} onPress={() => navigation.navigate('RegisterClient',{role:'NORMAL_USER'})}>
                        <Text style={{ color: white, fontWeight: '500' }}>Ứng viên tìm việc</Text>
                    </TouchableOpacity>
                </View>
            </View>
                <View style={[StyleShare.flexCenter, { marginTop: 40 }]}>
                    <Text>Bạn đã có tài khoản ? </Text>
                    <TouchableOpacity><Text style={{ fontWeight: '500', color: orange }} onPress={() => navigation.navigate('Login')}>Đăng nhập ngay</Text></TouchableOpacity>
                </View>
        </View>
    )
}

const styles = StyleSheet.create({
    containerTop: {
        marginTop: 90,
        alignItems: 'center',
        marginHorizontal: 20
    },
    containerMain: {
        marginHorizontal: 10,
        marginTop: 40,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    optionChoose: {
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 40,
        flex: 1,
        margin: 10,
        backgroundColor: white,
        elevation: 2
    },
    imageChoose: {
        width: 100,
        height: 100,
        resizeMode: 'center'
    },
    btnChoose: {
        backgroundColor: mainColor,
        borderRadius: 15,
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginTop: 30
    }
})