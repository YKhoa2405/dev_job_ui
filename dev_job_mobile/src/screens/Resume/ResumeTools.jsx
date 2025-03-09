
import { View, Text, FlatList, Image, TouchableWithoutFeedback, ActivityIndicator, TouchableOpacity, TextInput, Alert } from "react-native";
import UIHeader from "../../components/UIHeader";
import { StyleSheet } from "react-native";
import { bgButton2, mainColor, orange, textColor, white } from "../../assets/themes/Color";
import { Avatar } from "react-native-paper";
import moment from "moment";
import Icon from "react-native-vector-icons/Ionicons"
import { useState, useEffect } from "react";
import StyleShare from "../../assets/themes/StyleShare";
import Button from "../../components/Button";
import { useDispatch, useSelector } from "react-redux";
import { ToastMess } from "../../components/ToastMess";
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from "@react-native-async-storage/async-storage";
import API, { authApi, endpoints } from "../../assets/config/API";
import { fetchListCvByUser } from "../../redux/slice/cvSLice";
import axios from "axios";

export default function ResumeTools({ navigation }) {
    const dispatch = useDispatch()
    const { cvData, status } = useSelector((state) => state.cv);
    const user = useSelector((state) => state.user.user)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        dispatch(fetchListCvByUser(user?._id));
    }, [dispatch]);

    const handleDeleteCvByUser = async (cvId) => {
        Alert.alert(
            'Xác nhận xóa',
            'Bạn có chắc chắn muốn xóa CV này không?',
            [
                {
                    text: 'Hủy',
                    style: 'cancel',
                },
                {
                    text: 'Đồng ý',
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem('access_token');
                            await authApi(token).delete(endpoints['cvByUser'](cvId));
                            dispatch(fetchListCvByUser(user?._id)); // Cập nhật danh sách CV
                        } catch (error) {
                            ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại' });
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const handleUploadCV = async () => {
        setLoading(true);
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
                const res = await authApi(token).post(endpoints['uploadCV'], formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                dispatch(fetchListCvByUser(user?._id));
                if (res.data.data.url) {
                    await handScanCV(res.data.data.url, res.data.data._id);
                }

            } else {
                ToastMess({ type: 'error', text1: 'Chỉ hỗ trợ định dạng pdf, docx' });
            }

        } catch (error) {
            ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại' });
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handScanCV = async (pdfUrl, cvId) => {
        try {
            const res = await API.post(endpoints['scanCV'],
                { pdf_url: pdfUrl },  // Gửi dữ liệu vào body JSON
                { headers: { 'Content-Type': 'application/json' } }  // Định dạng JSON
            );
            const processed = res.data.processed_text;
            if (processed) {
                const token = await AsyncStorage.getItem('access_token');
                await authApi(token).patch(endpoints['cvDetail'](cvId), {
                    processedText: processed,
                });
            }
        } catch (error) {
            console.log('Error:', error.response?.data || error.message);
        }
    };




    return (
        <View style={{ flex: 1 }}>
            <UIHeader
                title={'Quản lý CV'} />
            <View style={{ marginHorizontal: 20 }}>
                <View style={styles.containerCreateResume}>
                    <View style={[StyleShare.flexCenter, { marginBottom: 10 }]} onPress={() => navigation.navigate('ResumeApply')}>
                        <Avatar.Image source={require('../../assets/images/cv.png')} size={50} style={{ marginRight: 10 }} />
                        <View style={{ flex: 1 }}>
                            <Text style={StyleShare.titleText16}>Tạo mới CV</Text>
                            <Text style={{ fontSize: 14, color: '#666', }} >
                                Trải nghiệm công cụ tạo CV online của chúng tôi để tạo một bản CV chuyên nghiệp, đẹp mắt chỉ trong vài phút, giúp bạn tự tin ứng tuyển vào các vị trí yêu thích.
                            </Text>
                        </View>
                    </View>
                    <Button
                        title={'Tạo mới CV'}
                        backgroundColor={mainColor}
                        textColor={white}
                        onPress={() => navigation.navigate('ResumeInput')}
                    />
                </View>

                <View style={styles.containerCreateResume}>
                    <View style={[StyleShare.flexCenter, { marginBottom: 10 }]} onPress={() => navigation.navigate('ResumeApply')}>
                        <Avatar.Image source={require('../../assets/images/resume.png')} size={50} style={{ marginRight: 10 }} />
                        <View style={{ flex: 1 }}>
                            <Text style={StyleShare.titleText16}>Tải lên CV</Text>
                            <Text style={{ fontSize: 14, color: '#666', }} >
                                Tải lên CV sẵn có để chúng tôi phân tích và gợi ý những công việc phù hợp nhất với kỹ năng, kinh nghiệm, và sở thích của bạn
                            </Text>
                        </View>
                    </View>
                    {loading ? <>
                        <ActivityIndicator color={orange} size={'large'} />
                    </> : <>
                        <Button
                            title={'Tải lên CV mới'}
                            backgroundColor={mainColor}
                            textColor={white}
                            onPress={() => handleUploadCV()}
                        />
                    </>}
                </View>
                <View>
                    <Text style={StyleShare.titleText16}>Cv của bạn</Text>
                    <View style={{ marginTop: 15 }}>
                        {cvData && cvData.length > 0 ? (
                            <>
                                {cvData.map((item) => (
                                    <TouchableOpacity
                                        style={styles.cvItem}
                                        onPress={() => navigation.navigate('ResumeClientView', { pdfUri: item.url })}
                                        key={item._id}
                                    >
                                        <Icon name="document-outline" size={20} color={mainColor} />
                                        <View style={{ marginLeft: 10, flex: 1 }}>
                                            <Text style={{ color: textColor, fontWeight: '500' }}>{item.name}</Text>
                                            <Text style={{ color: 'grey', fontSize: 12 }}>
                                                Tạo: {moment(item.createdAt).format("DD/MM/YYYY")}
                                            </Text>
                                        </View>
                                        {item.isPimary && (
                                            <Text style={{ color: orange, fontSize: 12, fontWeight: 'bold' }}>Chính</Text>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </>
                        ) : <></>}
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    containerCreateResume: {
        paddingHorizontal: 10,
        paddingTop: 10,
        backgroundColor: white,
        borderRadius: 10,
        elevation: 3,
        marginBottom: 20
    },
    cvItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: white,
        padding: 10,
        borderRadius: 8,
        marginVertical: 5,
        borderWidth: 1,
        borderColor: bgButton2,
    },
});