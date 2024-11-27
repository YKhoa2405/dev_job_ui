import React, { useContext, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, TextInput, Image, ActivityIndicator, ScrollView, FlatList } from "react-native";
import styleShare from "../../assets/theme/style";
import UIHeader from "../../components/UIHeader";
import Icon from "react-native-vector-icons/Ionicons";
import { bgButton1, bgButton2, grey, orange, white } from "../../assets/theme/color";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi, endpoints } from "../../config/API";
import * as DocumentPicker from 'expo-document-picker';
import { ToastMess } from "../../components/ToastMess";
import MyContext from "../../config/MyContext";
import ButtonMain from "../../components/ButtonMain";

export default function UploadBusinessDocument({ navigation }) {
    const [loading, setLoading] = useState(false);
    const [document, setDocument] = useState(null)

    const handleUploadFile = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        });
        console.log(result)

        if (!result.canceled) {
            setDocument(result.assets[0]); // Đảm bảo bạn sử dụng assets[0] vì DocumentPicker trả về một mảng
        } else {
            ToastMess({ type: 'error', text1: 'Chỉ hỗ trợ định dạng pdf' })
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

    const handleUpdateDocument = async () => {
        const token = await AsyncStorage.getItem("access-token");
        const formData = new FormData();
        formData.append('business_document', {
            uri: document.uri,
            type: document.mimeType,
            name: document.name,
        });
        setLoading(true)
        try {

            await authApi(token).patch(endpoints['update_employer'], formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            ToastMess({ type: 'success', text1: 'Cập nhật thông tin thành công.' });
            navigation.navigate('HomeEmployers')

        } catch (error) {
            ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại.' });
        } finally {
            setLoading(false)
        }
    }


    return (
        <View style={styleShare.container}>
            <UIHeader leftIcon={"arrow-back"}
                rightIcon={"ellipsis-horizontal"}
                title={'Đăng tải giầy tờ'}
                handleLeftIcon={() => { navigation.goBack() }} />
            <ScrollView style={styles.containerMain} contentContainerStyle={{ paddingBottom: 20 }}>
                <Text style={styleShare.titleJobAndName}>Thông tin Giấy đăng ký doanh nghiệp</Text>
                {!document ? (
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
                                <Image source={renderFileImage(document.mimeType)} style={styles.fileImage} />
                                <View>
                                    <Text>{document.name}</Text>
                                    <Text style={{ color: 'grey' }}>{document.size / 1000} kb</Text>
                                </View>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                )}
                <Text style={styleShare.titleJobAndName}>Hình ảnh minh họa</Text>
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                    <Image source={require("../../assets/images/employer_document1.jpg")} style={styles.imageDocument} />
                    <Text>Mặt trước</Text>
                    <Image source={require("../../assets/images/employer_document2.jpg")} style={styles.imageDocument} />
                    <Text>Mặt sau</Text>
                </View>
                <View>
                    {loading ? (
                        <ActivityIndicator color={orange} size={'large'} />
                    ) : (<ButtonMain
                        title={'Cập nhật'}
                        backgroundColor={bgButton1}
                        textColor={white}
                        onPress={() => handleUpdateDocument()}
                    />
                    )}

                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    containerMain: {
        paddingHorizontal: 20
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
    fileImage: {
        width: 50,
        height: 50,
    },
    imageDocument: {
        resizeMode: 'center',
        width: '100%',
        height: 450,
        marginTop: 15,
        marginBottom: 5,
        borderWidth: 1,
        borderColor: grey
    }

})