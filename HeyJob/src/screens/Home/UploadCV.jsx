import React, { useContext, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, TextInput, Image, ActivityIndicator, ScrollView } from "react-native";
import styleShare from "../../assets/theme/style";
import UIHeader from "../../components/UIHeader";
import Icon from "react-native-vector-icons/Ionicons";
import { bgButton1, bgButton2, grey, orange, white } from "../../assets/theme/color";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi, endpoints } from "../../config/API";
import * as DocumentPicker from 'expo-document-picker';
import { ToastMess } from "../../components/ToastMess";
import MyContext from "../../config/MyContext";

export default function UploadCV({ navigation, route }) {
    const { jobId } = route.params
    const [user, dispatch] = useContext(MyContext)
    const [name, setName] = useState('')
    const [email, setEmail] = useState(user.email)
    const [phone, setPhone] = useState('')

    const [coverLetter, setCoverLetter] = useState('')
    const [cv, setCV] = useState(null);
    const [loading, setLoading] = useState(false);


    const handleUploadFile = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        });
        console.log(result)

        if (!result.canceled) {
            setCV(result.assets[0]); // Đảm bảo bạn sử dụng assets[0] vì DocumentPicker trả về một mảng
        } else {
            ToastMess({ type: 'error', text1: 'Chỉ hỗ trợ định dạng pdf, docx' })
        }
    };

    const renderFileImage = (mimeType) => {
        if (mimeType === 'application/pdf') {
            return require('../../assets/images/pdf.png');
        } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            return require('../../assets/images/google-docs.png');
        } else {
            return null;
        }
    };


    const handleApply = async () => {
        if (!cv || !coverLetter || !email || !phone || !name) {
            ToastMess({ type: 'error', text1: 'Vui lòng không để trống các trường' })
            return;
        }
        setLoading(true)
        const formData = new FormData();
        formData.append('cover_letter', coverLetter);
        formData.append('cv', {
            uri: cv.uri,
            type: cv.mimeType,
            name: cv.name,
        });
        formData.append('email', email);
        formData.append('phone', phone);
        formData.append('name', name);

        console.log(formData)

        try {
            const token = await AsyncStorage.getItem("access-token");
            await authApi(token).post(endpoints['apply'](jobId), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            navigation.navigate('ApplySuccess')

        } catch (error) {
            console.error('Lỗi khi gửi đơn xin việc:', error);
        } finally {
            setLoading(false)
        }
    }


    return (
        <View style={styleShare.container}>
            <UIHeader leftIcon={"arrow-back"}
                rightIcon={"ellipsis-horizontal"}
                title={'Ứng tuyển'}
                handleLeftIcon={() => { navigation.goBack() }} />
            <ScrollView style={styles.containerMain}>
                <Text style={styleShare.titleJobAndName}>CV ứng tuyển</Text>
                {!cv ? (
                    <TouchableWithoutFeedback onPress={handleUploadFile}>
                        <View style={styles.uploadBox}>
                            <Icon name="cloud-upload" size={30} color="orange" />
                            <Text style={styles.title}>Nhấn để tải lên</Text>
                            <Text style={styles.supportText}>Hỗ trợ định dạng .doc, .docx, pdf</Text>
                        </View>
                    </TouchableWithoutFeedback>
                ) : (
                    <TouchableWithoutFeedback onPress={handleUploadFile}>
                        <View style={styles.uploadBoxCV}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Image source={renderFileImage(cv.mimeType)} style={styles.fileImage} />
                                <View>
                                    <Text>{cv.name}</Text>
                                    <Text style={{ color: 'grey' }}>{cv.size / 1000} kb</Text>
                                </View>
                            </View>
                            <View style={styles.containerInputUpload}>
                                <Text>Họ và tên</Text>
                                <TextInput
                                    placeholder="Nhập họ và tên"
                                    value={name} // Liên kết giá trị với state
                                    onChangeText={(text) => setName(text)} // Cập nhật state khi người dùng nhập dữ liệu
                                    style={styles.inputUploadCV}
                                />
                                <Text>Email</Text>
                                <TextInput
                                    placeholder="Nhập địa chỉ Email"
                                    value={email} // Liên kết giá trị với state
                                    onChangeText={(text) => setEmail(text)} // Cập nhật state khi người dùng nhập dữ liệu
                                    style={styles.inputUploadCV}
                                    keyboardType="email-address" // Hiển thị bàn phím dành cho địa chỉ email
                                    autoCapitalize="none" // Không tự động viết hoa chữ cái đầu tiên
                                />
                                <Text>Số điện thoại</Text>
                                <TextInput
                                    placeholder="Nhập số điện thoại"
                                    value={phone} // Liên kết giá trị với state
                                    onChangeText={(text) => setPhone(text)} // Cập nhật state khi người dùng nhập dữ liệu
                                    style={styles.inputUploadCV}
                                    keyboardType="phone-pad" // Hiển thị bàn phím dành cho số điện thoại
                                />
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                )}

                <Text style={styleShare.titleJobAndName}>Thư giới thiệu</Text>
                <TextInput
                    style={styles.introduceInput}
                    placeholder="Viết giới thiệu ngắn gọn về bản thân (điểm mạnh, điểm yếu) và ghi rõ mong muốn, lý do làm việc tại công ty"
                    multiline={true}
                    numberOfLines={8}
                    onChangeText={t => setCoverLetter(t)}
                    textAlignVertical="top" />
                <Text style={styleShare.titleJobAndName}>Lưu ý</Text>

                <Text style={{ marginTop: 10, lineHeight: 24 }}><Text style={{ fontWeight: '500', color: orange }}>HeyJob</Text> khuyên tất cả các bạn hãy luôn cẩn trọng trong quá trình tìm việc và chủ động nghiên cứu về thông tin công ty, vị trí việc làm trước khi ứng tuyển.
                    Ứng viên cần có trách nhiệm với hành vi ứng tuyển của mình. Nếu bạn gặp phải tin tuyển dụng hoặc nhận được liên lạc đáng ngờ của nhà tuyển dụng, hãy báo cáo ngay cho <Text style={{ fontWeight: '500', color: orange }}>HeyJob</Text> qua email <Text style={{ fontWeight: '500', color: orange }}>nykhoa2405@gmail.com</Text> để được hỗ trợ kịp thời.</Text>

            </ScrollView>
            <View style={[styleShare.bottomBar, styleShare.flexCenter]}>
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
    containerMain: {
        marginHorizontal: 20,
        marginTop: 10
    },
    buttonApply: {
        backgroundColor: bgButton1,
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
        height: 180,
        borderWidth: 2,
        borderColor: bgButton2,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        marginTop: 20,
        marginBottom: 30,
        backgroundColor: white
    },
    uploadBoxCV: {
        borderWidth: 1,
        borderColor: bgButton2,
        borderRadius: 10,
        marginTop: 20,
        marginBottom: 30,
        backgroundColor: white,
        padding: 10
    },
    introduceInput: {
        borderWidth: 1,
        borderColor: grey,
        borderRadius: 20,
        marginTop: 10,
        marginBottom: 30,
        padding: 10,
        backgroundColor: white
    },
    fileImage: {
        width: 50,
        height: 50,
    },
    containerInputUpload: {
        backgroundColor: grey,
        padding: 10,
        borderRadius: 10,
        marginTop: 10
    },
    inputUploadCV: {
        backgroundColor: white,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginTop: 5,
        marginBottom: 10,
        borderRadius: 5
    }

})