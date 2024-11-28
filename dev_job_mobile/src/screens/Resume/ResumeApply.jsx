import React, { useState } from "react"
import { View, Text, TouchableOpacity, TouchableWithoutFeedback, Image, TextInput, ScrollView, StyleSheet } from "react-native"
import StyleShare from "../../assets/themes/StyleShare"
import UIHeader from "../../components/UIHeader"
import { bgButton2, grey, mainColor, white, orange } from "../../assets/themes/Color"
import Icon from 'react-native-vector-icons/Ionicons'


export default function ResumeApply({ navigation }) {
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [yourCV, setYourCV] = useState([])

    const renderFileImage = (mimeType) => {
        if (mimeType === 'application/pdf') {
            return require('../../assets/images/pdf.png');
        } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            return require('../../assets/images/google-docs.png');
        } else {
            return null;
        }
    };
    return (
        <View style={StyleShare.container}>
            <UIHeader leftIcon={"arrow-back"}
                rightIcon={"ellipsis-horizontal"}
                title={'Ứng tuyển'}
                handleLeftIcon={() => { navigation.goBack() }} />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
                <View style={{ paddingHorizontal: 20, backgroundColor: white, paddingVertical: 10 }}>
                    <Text style={[StyleShare.titleText20, { marginTop: 5 }]}>Tên việc làm</Text>
                    <Text style={StyleShare.titleText16}>Tee ncong ty</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                        <Icon name="location-outline" size={18} />
                        <Text style={{ fontWeight: '500', marginHorizontal: 5 }}>10</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                        <Icon name="cash-outline" size={18} />
                        <Text style={{ fontWeight: '500', marginHorizontal: 5 }}>10</Text>
                    </View>
                </View>
                <TouchableWithoutFeedback>
                    <View style={styles.uploadBox}>
                        <Icon name="cloud-upload" size={30} color="orange" />
                        <Text style={StyleShare.titleText16}>Nhấn để tải lên</Text>
                        <Text style={styles.supportText}>Hỗ trợ định dạng .doc, .docx, pdf</Text>
                    </View>
                </TouchableWithoutFeedback>

                <View style={styles.selectCvContainer}>
                    <Text style={StyleShare.titleText16}>Chọn CV của bạn</Text>
                    {/* CV */}
                    {yourCV ? <>
                        <View style={{ alignItems: 'center' }}>
                            <Image source={require("../../assets/images/denied.png")} style={{ marginVertical: 20 }} />
                            <Text>Chưa có CV nào, hãy tải lên CV của bạn</Text>
                        </View>
                    </> : <>
                        <TouchableOpacity style={styles.cvContainer}>
                            <View style={StyleShare.flexBetween}>
                                <Text style={StyleShare.titleText16}>Tên CV</Text>
                                <Icon name="radio-button-off" size={20} color={'grey'} />
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                                <Icon name="time-outline" size={18} />
                                <Text style={{ marginHorizontal: 5 }}>24/5/2003</Text>
                            </View>
                        </TouchableOpacity>

                    </>}

                </View>

                <View style={styles.uploadBoxCV}>
                    <Text style={StyleShare.titleText16}>Thông tin</Text>

                    <View style={{ marginTop: 20 }}>
                        <Text>Họ và tên</Text>
                        <TextInput
                            placeholder="Nhập họ và tên"
                            value={name}
                            onChangeText={(text) => setName(text)}
                            style={styles.inputUploadCV}
                        />
                        <Text>Email</Text>
                        <TextInput
                            placeholder="Nhập địa chỉ Email"
                            value={email}
                            onChangeText={(text) => setEmail(text)}
                            style={styles.inputUploadCV}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <Text>Số điện thoại</Text>
                        <TextInput
                            placeholder="Nhập số điện thoại"
                            value={phone}
                            onChangeText={(text) => setPhone(text)}
                            style={styles.inputUploadCV}
                            keyboardType="phone-pad"
                        />
                    </View>
                </View>
                <View style={{ paddingHorizontal: 20, paddingVertical:10, backgroundColor:white }}>
                    <Text style={StyleShare.titleText16}>Lưu ý</Text>

                    <Text style={{ marginTop: 10, lineHeight: 24 }}><Text style={{ fontWeight: '500', color: orange }}>DevJob</Text> khuyên tất cả các bạn hãy luôn cẩn trọng trong quá trình tìm việc và chủ động nghiên cứu về thông tin công ty, vị trí việc làm trước khi ứng tuyển.
                        Ứng viên cần có trách nhiệm với hành vi ứng tuyển của mình. Nếu bạn gặp phải tin tuyển dụng hoặc nhận được liên lạc đáng ngờ của nhà tuyển dụng, hãy báo cáo ngay cho <Text style={{ fontWeight: '500', color: orange }}>DevJob</Text> qua email <Text style={{ fontWeight: '500', color: orange }}>nykhoa2405@gmail.com</Text> để được hỗ trợ kịp thời.</Text>
                </View>

            </ScrollView>
            <View style={[StyleShare.bottomBar, StyleShare.flexCenter]}>
                {loading ? (
                    <ActivityIndicator color={orange} size={'large'} />
                ) : (
                    <TouchableOpacity style={styles.buttonApply} onPress={() => handleApply()}>
                        <Text style={styles.buttonText}>Ứng tuyển</Text>
                    </TouchableOpacity>
                )}
            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    buttonApply: {
        backgroundColor: mainColor,
        padding: 12,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
        width: '100%',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: "500",
        color: white
    },
    uploadBox: {
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        backgroundColor: white
    },
    cvContainer: {
        borderRadius: 8,
        borderColor: bgButton2,
        borderWidth: 2,
        marginTop: 10,
        padding: 10
    },
    selectCvContainer: {
        marginTop: 20,
        backgroundColor: white,
        paddingHorizontal: 20,
        paddingVertical: 10
    },
    uploadBoxCV: {
        marginVertical: 20,
        backgroundColor: white,
        paddingHorizontal: 20,
        paddingVertical: 10
    },

    fileImage: {
        width: 50,
        height: 50,
    },
    inputUploadCV: {
        borderWidth: 1,
        borderColor: bgButton2,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginTop: 5,
        marginBottom: 10,
        borderRadius: 10
    }

})