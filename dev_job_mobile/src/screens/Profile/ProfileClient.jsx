import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions, Image, TouchableWithoutFeedback, TouchableOpacity, FlatList, ActivityIndicator, Alert, ImageBackground } from "react-native";
import StyleShare from "../../assets/themes/StyleShare";
import { bgButton2, grey, mainColor, white, orange } from "../../assets/themes/Color";
import { Avatar } from "react-native-paper";
import Icon from "react-native-vector-icons/Ionicons"
import Button from "../../components/Button";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slice/userSlice";
import * as DocumentPicker from 'expo-document-picker';
import { ToastMess } from "../../components/ToastMess";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi, endpoints } from "../../assets/config/API";
import { fetchListCvByUser } from "../../redux/slice/cvSLice";
import moment from "moment";
import 'moment/locale/vi';

export default function Profile({ navigation }) {
    const dispatch = useDispatch()
    const user = useSelector((state) => state.user.user)
    const [loading, setLoading] = useState(false)

    const { cvData, status } = useSelector((state) => state.cv);
    useEffect(() => {
        dispatch(fetchListCvByUser(user?._id));
    }, [dispatch]);

    const aboutApp = [
        { id: 1, icon: 'business', title: 'Về HeyJob' },
        { id: 2, icon: 'book', title: 'Điều khoản và dịch vụ' },
        { id: 3, icon: 'call', title: 'Trợ giúp' },
        { id: 4, icon: 'heart-circle-sharp', title: 'Đánh giá ứng dụng' },
    ]

    const manageJob = [
        { id: 1, icon: 'bookmark', title: 'Việc làm đã lưu', },
        { id: 2, icon: 'briefcase', title: 'Việc làm đã ứng tuyển', },
        { id: 3, icon: 'business', title: 'Công ty đang theo dõi', },
    ]

    const handleManageJobClick = (id) => {
        switch (id) {
            case 1:
                navigation.navigate('JobSaved')
                break;
            case 2:
                navigation.navigate('JobApplied')
                break;
            case 3:
                navigation.navigate('CompaniesFollow')
                break;
            default:
                break;
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        navigation.navigate('AuthStack')
    };

    const ManageJobGrid = () => (
        <View style={styles.grid}>
            {manageJob.map((item) => (
                <TouchableWithoutFeedback onPress={() => handleManageJobClick(item.id)} key={item.id}>
                    <View style={styles.gridItem}>
                        <View style={styles.containerAvatarJob}>
                            <Icon name={item.icon} size={20} color={mainColor}></Icon>
                        </View>
                        <View style={[StyleShare.flexBetween, { marginTop: 10 }]}>
                            <Text style={{ paddingRight: 10, fontWeight: '500' }}>{item.title}</Text>
                            {/* <Text style={StyleShare.textMainOption}>{item.info}</Text> */}

                        </View>
                    </View>
                </TouchableWithoutFeedback>

            ))}
        </View>
    );


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
                ToastMess({ type: 'success', text1: 'Tải lên thành công' });
            } else {
                ToastMess({ type: 'error', text1: 'Chỉ hỗ trợ định dạng pdf, docx' });
            }
        } catch (error) {
            ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại' });
        } finally {
            setLoading(false);
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
        <View style={StyleShare.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
                <View style={styles.containerTop}>
                    <Avatar.Image
                        source={{ uri: user?.avatar }}
                        size={60}
                        style={{ marginLeft: 40, marginRight: 20, backgroundColor: white }}
                    />
                    <View>
                        <Text style={StyleShare.titleText16}>{user?.name}</Text>
                        <Text >{user?.email}</Text>
                    </View>
                </View>
                <View style={styles.containerMain}>
                    <View style={styles.manageJob}>
                        <Text style={[StyleShare.titleText16, { marginVertical: 10 }]}>CV của bạn</Text>
                        <Text style={[{ marginBottom: 30 }]}>Tải lên CV để chúng tôi hiển thị những việc làm phù hợp với bạn và dễ dàng ứng tuyển sau này </Text>
                        {/* CV */}
                        {cvData && cvData.length > 0 ? (
                            <>
                                {cvData.map((cv) => (
                                    <View key={cv._id} style={styles.cvContainer}>
                                        <View style={StyleShare.flexBetween}>
                                            <Text style={StyleShare.titleText16}>{cv.name}</Text>
                                            <TouchableOpacity onPress={() => handleDeleteCvByUser(cv._id)}>
                                                <Icon name="trash-outline" size={20} color={'red'} />
                                            </TouchableOpacity>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                                            <Icon name="time-outline" size={18} />
                                            <Text style={{ marginHorizontal: 5 }}>{moment(cv.createdAt).format('DD/MM/YYYY')}</Text>
                                        </View>
                                        <TouchableOpacity style={styles.previewCV} onPress={() => navigation.navigate('CvView', { cvUrl: cv.url })}>
                                            <Text style={StyleShare.titleText16}>Xem CV</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </>
                        ) : <></>}


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
                </View>
                <View style={styles.containerMain}>
                    <View style={styles.manageJob}>
                        <Text style={[StyleShare.titleText16, { marginVertical: 10 }]}>Quản lý việc làm</Text>
                        <ManageJobGrid></ManageJobGrid>
                    </View>
                    <View style={styles.manageJob}>
                        <TouchableWithoutFeedback style={styles.manageJobItem}>
                            <View style={StyleShare.flexBetween}>
                                <View style={StyleShare.flexCenter}>
                                    <Avatar.Image source={require('../../assets/images/cv.png')} size={50} />
                                    <Text style={{ fontWeight: '500', marginLeft: 15 }}>Hướng dẫn viết CV</Text>
                                </View>
                                <Icon name="chevron-forward-outline" size={24} color={mainColor} />
                            </View>
                        </TouchableWithoutFeedback>

                    </View>
                    <View style={styles.manageJob}>
                        <Text style={[StyleShare.titleText16, { marginVertical: 10 }]}>Cài đặt và cấu hình</Text>
                        <TouchableWithoutFeedback onPress={() => navigation.navigate('Subscribers')}>
                            <View style={styles.manageJobItem}>
                                <View style={StyleShare.flexBetween}>
                                    <View style={StyleShare.flexCenter}>
                                        <Icon name="mail" size={24} color={orange} style={{ marginRight: 15 }} />
                                        <Text style={{ fontWeight: '500' }}>Thông báo việc làm qua Email</Text>
                                    </View>
                                    <Icon name="chevron-forward-outline" size={24} color={mainColor} />
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                    <View style={styles.manageJob}>
                        <Text style={[StyleShare.titleText16, { marginVertical: 10 }]}>Chính sách và hỗ trợ</Text>
                        {aboutApp.map((item) => (
                            <TouchableWithoutFeedback key={item.id}>
                                <View style={styles.manageJobItem}>
                                    <View style={StyleShare.flexBetween}>
                                        <View style={StyleShare.flexCenter}>
                                            <Icon name={item.icon} size={24} color={orange} style={{ marginRight: 15 }} />
                                            <Text style={{ fontWeight: '500' }}>{item.title}</Text>
                                        </View>
                                        <Icon name="chevron-forward-outline" size={24} color={mainColor} />
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>

                        ))}
                    </View>
                    <TouchableOpacity style={styles.manageJob} onPress={() => handleLogout()}>
                        <View style={StyleShare.flexCenter}>
                            <Text style={{ fontWeight: '500', fontSize: 16, marginRight: 10, color: 'red' }}>Đăng xuất</Text>
                            <Icon name="exit" size={24} color={'red'} />
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    )

}

const styles = StyleSheet.create({
    containerTop: {
        backgroundColor: white,
        marginHorizontal: 20,
        marginTop: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingVertical: 20,
        borderRadius: 10
    },
    containerMain: {
        marginTop: 10
    },
    manageJob: {
        backgroundColor: white,
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginTop: 10
    },
    manageJobItem: {
        paddingVertical: 15
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    gridItem: {
        width: (Dimensions.get('window').width - 50) / 2,
        padding: 16,
        backgroundColor: grey,
        borderRadius: 8,
        marginBottom: 10
    },
    containerAvatarJob: {
        width: 40,
        height: 40,
        borderRadius: 25,
        backgroundColor: bgButton2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarJob: {
        width: 24,
        height: 24
    },
    technologyContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10
    },

    cvContainer: {
        borderRadius: 8,
        borderColor: bgButton2,
        borderWidth: 2,
        marginBottom: 10,
        padding: 10
    },
    previewCV: {
        marginTop: 10,
        borderRadius: 8,
        borderColor: bgButton2,
        borderWidth: 2,
        paddingVertical: 5,
        justifyContent: 'center',
        alignItems: 'center'
    }


})