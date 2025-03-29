import React, { useEffect, useState } from "react"
import { View, Text, TouchableOpacity, TouchableWithoutFeedback, Image, TextInput, ScrollView, StyleSheet, ActivityIndicator } from "react-native"
import StyleShare from "../../assets/themes/StyleShare"
import UIHeader from "../../components/UIHeader"
import { bgButton2, grey, mainColor, white, orange, textColor } from "../../assets/themes/Color"
import Icon from 'react-native-vector-icons/Ionicons'
import { useDispatch, useSelector } from "react-redux"
import { fetchListCvByUser } from "../../redux/slice/cvSLice"
import moment from "moment"
import Loading from "../../components/Loading"
import * as DocumentPicker from 'expo-document-picker';
import { ToastMess } from "../../components/ToastMess";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi, endpoints } from "../../assets/config/API";

export default function ResumeApply({ navigation, route }) {
    const { jobId, companyName, jobTitle, location, salary, companyId } = route.params;

    const dispatch = useDispatch()
    const user = useSelector((state) => state.user.user)
    const [loading, setLoading] = useState(false)
    const [loadingUpload, setLoadingUpload] = useState(false)

    const [name, setName] = useState(user.name)
    const [email, setEmail] = useState(user.email)
    const [phone, setPhone] = useState('')
    const [selectCvUrl, setSelectCvUrl] = useState('');

    const { cvData, status } = useSelector((state) => state.cv);
    useEffect(() => {
        if (user._id) {
            dispatch(fetchListCvByUser(user?._id));
        }
    }, [dispatch]);

    const handleUploadCV = async () => {
        setLoadingUpload(true)
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            });

            if (!result.canceled) {
                const cv = result.assets[0];

                const formData = new FormData();
                formData.append('name', cv.name);
                formData.append('url', {
                    uri: cv.uri,
                    name: cv.name,
                    type: cv.mimeType
                });

                const token = await AsyncStorage.getItem('access_token');
                await authApi(token).post(endpoints['uploadCV'], formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                dispatch(fetchListCvByUser(user?._id));
            }
        } catch (error) {
            ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại' });

        } finally { setLoadingUpload(false) }
    };

    const handleApplyJob = async () => {
        if (!companyId || !jobId || !name || !phone || !email || !selectCvUrl) {
            ToastMess({ type: 'error', text1: 'Vui lòng nhập đầy đủ thông tin.' });
            return;
        }

        const formData = new FormData();
        formData.append('companyId', companyId);
        formData.append('jobId', jobId);
        formData.append('name', name);
        formData.append('phone', phone);
        formData.append('email', email);
        formData.append('cv', selectCvUrl);
        setLoading(true)
        try {
            const token = await AsyncStorage.getItem('access_token');
            const res = await authApi(token).post(endpoints['resumeApply'], formData, {
                headers: { 'Content-Type': 'application/json' },
            });
            if (res.data.statusCode === 201) {
                navigation.navigate('CongratsScreen', {
                    jobTitle: jobTitle,
                    companyName: companyName,
                });
            }
        } catch (error) {
            ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại' });
            console.log(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <View style={StyleShare.container}>
            <UIHeader leftIcon={"arrow-back"}
                rightIcon={"ellipsis-horizontal"}
                title={'Ứng tuyển'}
                handleLeftIcon={() => { navigation.goBack() }} />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
                <View style={{ paddingHorizontal: 20, backgroundColor: white, paddingVertical: 10 }}>
                    <Text style={[StyleShare.titleText20, { marginVertical: 5, marginLeft: 3 }]}>{jobTitle}</Text>
                    <Text style={StyleShare.titleText16}>{companyName}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                        <Icon name="location-outline" size={18} />
                        <Text style={{ fontWeight: '500', marginHorizontal: 5 }}>{location}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                        <Icon name="cash-outline" size={18} />
                        <Text style={{ fontWeight: '500', marginHorizontal: 5 }}>{salary}</Text>
                    </View>
                </View>
                {loadingUpload ? <>
                    <View style={styles.uploadBox}>
                        <Loading />
                    </View>
                </> : <>
                    <TouchableWithoutFeedback onPress={() => handleUploadCV()}>
                        <View style={styles.uploadBox}>
                            <Icon name="cloud-upload" size={30} color="orange" />
                            <Text style={StyleShare.titleText16}>Nhấn để tải lên</Text>
                            <Text style={styles.supportText}>Hỗ trợ định dạng .doc, .docx, pdf</Text>
                        </View>
                    </TouchableWithoutFeedback>
                </>}

                <View style={styles.selectCvContainer}>
                    <Text style={StyleShare.titleText16}>Chọn CV của bạn</Text>
                    {status === 'loading' ? (

                        <Loading />
                    ) : cvData && cvData.length > 0 ? (
                        <>
                            {cvData.map((cv) => (
                                <TouchableOpacity style={[
                                    styles.cvContainer,
                                    selectCvUrl === cv.url && styles.selectedCv // Thêm hiệu ứng chọn
                                ]} key={cv._id} onPress={() => setSelectCvUrl(cv.url)}>
                                    <Text style={{ color: textColor, fontWeight: '500' }}>{cv.name}</Text>
                                    <View style={StyleShare.flexBetween}>
                                        <Text style={{ color: textColor, fontSize: 12 }}>
                                            Tạo: {moment(cv.createdAt).format("DD/MM/YYYY")}
                                        </Text>
                                        {cv.isPrimary && (
                                            <Icon name={"star"} size={20} color={orange} />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </>
                    ) : (
                        // Hiển thị khi không có CV
                        <View style={{ alignItems: 'center' }}>
                            <Image source={require("../../assets/images/denied.png")} style={{ marginVertical: 20 }} />
                            <Text>Chưa có CV nào, hãy tải lên CV của bạn</Text>
                        </View>
                    )}


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
                <View style={{ paddingHorizontal: 20, paddingVertical: 10, backgroundColor: white }}>
                    <Text style={StyleShare.titleText16}>Lưu ý</Text>

                    <Text style={{ marginTop: 10, lineHeight: 24 }}><Text style={{ fontWeight: '500', color: orange }}>DevJob</Text> khuyên tất cả các bạn hãy luôn cẩn trọng trong quá trình tìm việc và chủ động nghiên cứu về thông tin công ty, vị trí việc làm trước khi ứng tuyển.
                        Ứng viên cần có trách nhiệm với hành vi ứng tuyển của mình. Nếu bạn gặp phải tin tuyển dụng hoặc nhận được liên lạc đáng ngờ của nhà tuyển dụng, hãy báo cáo ngay cho <Text style={{ fontWeight: '500', color: orange }}>DevJob</Text> qua email <Text style={{ fontWeight: '500', color: orange }}>nykhoa2405@gmail.com</Text> để được hỗ trợ kịp thời.</Text>
                </View>

            </ScrollView>
            <View style={[StyleShare.bottomBar, StyleShare.flexCenter]}>
                {loading ? (
                    <ActivityIndicator color={orange} size={'large'} />
                ) : (
                    <TouchableOpacity style={styles.buttonApply} onPress={() => handleApplyJob()}>
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
        marginVertical: 5,
        backgroundColor: white,
        marginVertical: 5,
        padding: 10,
        borderColor: bgButton2,
        borderWidth: 1,
    },

    selectCvContainer: {
        marginTop: 20,
        backgroundColor: white,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderColor: orange,
    },
    selectedCv: {
        backgroundColor: '#FFF8E1', // Nhấn mạnh CV được chọn
        borderColor: orange
    },
    uploadBoxCV: {
        marginVertical: 20,
        backgroundColor: white,
        paddingHorizontal: 20,
        paddingVertical: 10
    },

    inputUploadCV: {
        borderWidth: 1,
        borderColor: bgButton2,
        paddingHorizontal: 10,
        paddingVertical: 10,
        marginTop: 5,
        marginBottom: 10,
        borderRadius: 10
    }

})