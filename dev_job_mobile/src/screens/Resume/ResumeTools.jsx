
import { View, Text, FlatList, Image, TouchableWithoutFeedback, ActivityIndicator, TouchableOpacity, TextInput, Alert } from "react-native";
import UIHeader from "../../components/UIHeader";
import { StyleSheet } from "react-native";
import { mainColor, orange, white } from "../../assets/themes/Color";
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
import { authApi, endpoints } from "../../assets/config/API";
import { fetchListCvByUser } from "../../redux/slice/cvSLice";

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
                await authApi(token).post(endpoints['uploadCV'], formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                dispatch(fetchListCvByUser(user?._id));
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
                        onPress={()=>navigation.navigate('ResumeInput')}
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
                                {cvData.map((cv) => (
                                    <TouchableOpacity key={cv._id} style={styles.cvContainer} onPress={() => navigation.navigate('ResumeClientView', { pdfUri: cv.url })}>
                                        <View style={StyleShare.flexBetween}>
                                            <Text style={StyleShare.titleText16}>
                                                {cv.name.length > 32
                                                    ? cv.name.slice(0, 32) + "..."
                                                    : cv.name}
                                            </Text>
                                            <TouchableOpacity onPress={() => handleDeleteCvByUser(cv._id)} style={{ zIndex: 999 }}>
                                                <Icon name="trash-outline" size={22} color={'red'} />
                                            </TouchableOpacity>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                                            <Icon name="time-outline" size={18} />
                                            <Text style={{ marginHorizontal: 5 }}>{moment(cv.createdAt).format('DD/MM/YYYY')}</Text>
                                        </View>

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
    cvContainer: {
        borderRadius: 5,
        marginBottom: 15,
        padding: 10,
        backgroundColor: white,
        elevation: 2
    },
});