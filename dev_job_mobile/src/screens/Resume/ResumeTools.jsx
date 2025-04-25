
import { View, Text, ActivityIndicator, TouchableOpacity, TextInput, Alert, ScrollView, Share } from "react-native";
import UIHeader from "../../components/UIHeader";
import { StyleSheet } from "react-native";
import { bgButton2, grey, mainColor, orange, textColor, white } from "../../assets/themes/Color";
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
import Modal from 'react-native-modal';
import * as FileSystem from 'expo-file-system';

export default function ResumeTools({ navigation }) {
    const dispatch = useDispatch()
    const { cvData, status } = useSelector((state) => state.cv);
    const user = useSelector((state) => state.user.user)
    const [loading, setLoading] = useState(false)
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedCv, setSelectedCv] = useState(null);

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    useEffect(() => {
        dispatch(fetchListCvByUser(user?._id));
    }, [dispatch]);


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
            console.log(processed);
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

    const handleShare = async () => {
        const result = await Share.share({
            message: `Xem CV của tôi: ${selectedCv.url}`,
            title: "Chia sẻ CV",
            url: selectedCv.url,
        });
    };

    const handleSetPrimary = async (cvId) => {
        try {
            const token = await AsyncStorage.getItem('access_token');
            await authApi(token).patch(endpoints['cvDetail'](cvId), {
                isPrimary: true
            });
            dispatch(fetchListCvByUser(user?._id));
            setModalVisible(false)
        } catch (error) {
            ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại' });

        }
        dispatch(fetchListCvByUser(user?._id));
    }

    const handleDownloadFile = async (cvUrl) => {
        try {
            const fileName = cvUrl.split('/').pop();
            const fileUri = `${FileSystem.documentDirectory}${fileName}`;

            const { uri } = await FileSystem.downloadAsync(cvUrl, fileUri);

            setTimeout(() => {
                ToastMess({ type: 'success', text1: 'Tải xuống thành công.' });
            }, 500);
            setModalVisible(false)

        } catch (error) {
            console.log(error);
            ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại.' });

        }
    };

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
                            setModalVisible(false);
                        } catch (error) {
                            ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại' });
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };



    return (
        <View style={{ flex: 1 }}>
            <Modal
                isVisible={isModalVisible}
                onBackdropPress={toggleModal}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                backdropTransitionInTiming={500}
                backdropTransitionOutTiming={500}
                style={StyleShare.modalStyle}
            >
                <View style={styles.modalContent}>
                    <View style={[StyleShare.flexBetween, { marginVertical: 15 }]}>
                        <Text style={StyleShare.titleText20}>Tùy chọn </Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Icon name="close" size={26} color={'red'} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        style={styles.optionItem}
                        onPress={() => handleSetPrimary(selectedCv._id)}
                        disabled={selectedCv?.isPrimary}
                    >
                        <Icon name={selectedCv?.isPrimary ? "star" : "star-outline"} size={20} color={orange} />
                        <Text
                            style={[
                                styles.optionText,
                                selectedCv?.isPrimary ? styles.disabledText : null
                            ]}
                        >
                            {selectedCv?.isPrimary ? 'CV chính' : 'Đặt làm CV chính'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.optionItem}
                        onPress={() => handleDownloadFile(selectedCv.url)}
                    >
                        <Icon name="download-outline" size={20} color={textColor} />
                        <Text style={styles.optionText}>Tải xuống</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.optionItem}
                        onPress={() => handleShare()}
                    >
                        <Icon name="share-social-outline" size={20} color={textColor} />
                        <Text style={styles.optionText}>Chia sẻ</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.optionItem}
                        onPress={() => handleDeleteCvByUser(selectedCv._id)}
                    >
                        <Icon name="trash-outline" size={20} color="red" />
                        <Text style={[styles.optionText, { color: 'red' }]}>Xóa</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
            <UIHeader
                title={'Quản lý CV'} />
            <ScrollView style={{ marginHorizontal: 20 }} showsVerticalScrollIndicator={false}>
                <View style={styles.containerCreateResume}>
                    <View style={[StyleShare.flexCenter, { marginBottom: 10 }]} onPress={() => navigation.navigate('ResumeApply')}>
                        <Avatar.Image source={require('../../assets/images/cv.png')} size={50} style={{ marginRight: 10 }} />
                        <View style={{ flex: 1 }}>
                            <Text style={StyleShare.titleText16}>Tạo mới CV</Text>
                            <Text style={{ fontSize: 14, color: textColor, }} >
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
                            <Text style={{ fontSize: 14, color: textColor, }} >
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
                                            <View style={StyleShare.flexBetween}>
                                                <Text style={{ color: textColor, fontSize: 12 }}>
                                                    Tạo: {moment(item.createdAt).format("DD/MM/YYYY")}
                                                </Text>
                                                {item.isPrimary && (
                                                    <Icon name={"star"} size={20} color={orange} />
                                                )}
                                            </View>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => {
                                                setSelectedCv(item);
                                                setModalVisible(true);
                                            }}
                                            style={{ padding: 8 }}
                                        >
                                            <Icon name="ellipsis-vertical" size={18} color={textColor} />
                                        </TouchableOpacity>
                                    </TouchableOpacity>
                                ))}
                            </>
                        ) : <></>}
                    </View>
                </View>
            </ScrollView>
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
    modalContent: {
        backgroundColor: white,
        padding: 20,
        borderTopLeftRadius: 10,   // Bo góc phía trên
        borderTopRightRadius: 10,  // Bo góc phía trên
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

    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: grey,
    },
    optionText: {
        marginLeft: 15,
        color: textColor,
    },
    disabledText: {
        color: textColor,
    },
});