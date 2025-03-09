import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Linking, FlatList } from "react-native";
import StyleShare from "../../assets/themes/StyleShare";
import { mainColor, bgButton2, grey, orange, textColor, white } from "../../assets/themes/Color";
import { Avatar } from "react-native-paper";
import UIHeader from "../../components/UIHeader";
import Icon from "react-native-vector-icons/Ionicons";
import Loading from "../../components/Loading";
import moment from "moment";
import { authApi, endpoints } from "../../assets/config/API";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ToastMess } from "../../components/ToastMess";

export default function CandidatesProfile({ navigation, route }) {
    const [loading, setLoading] = useState(false);
    const [candidate, setCandidate] = useState(null);
    const userId = route.params?.userId;

    // Dữ liệu CV mẫu từ bạn cung cấp (thay bằng dữ liệu thực tế từ API nếu cần)
    const cvData = [
        {
            "__v": 0,
            "_id": "67cc645accf6839aa30a5875",
            "createdAt": "2025-03-08T15:38:02.413Z",
            "deletedAt": null,
            "isDeleted": false,
            "isPimary": false,
            "name": "1739115114538_CV_Nguyen_y_khoa.pdf",
            "updatedAt": "2025-03-08T15:38:02.413Z",
            "url": "https://bucket-searchjob.s3.amazonaws.com/1741448280891_1739115114538_CV_Nguyen_y_khoa.pdf",
            "userIdId": "67cc4c6e25c2f36f76249451"
        },
        {
            "__v": 0,
            "_id": "67cc6496ccf6839aa30a587d",
            "createdAt": "2025-03-08T15:39:02.729Z",
            "deletedAt": null,
            "isDeleted": false,
            "isPimary": false,
            "name": "2024 - TB Nop BC TTTN K12425.pdf",
            "updatedAt": "2025-03-08T15:39:02.729Z",
            "url": "https://bucket-searchjob.s3.ap-southeast-2.amazonaws.com/1741448341548_2024%20-%20TB%20Nop%20BC%20TTTN%20K12425.pdf",
            "userIdId": "67cc4c6e25c2f36f76249451"
        }
    ];

    useEffect(() => {
        fetchCandidateDetail();
    }, []);

    const fetchCandidateDetail = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("access_token");
            const res = await authApi(token).get(endpoints['candidateDetail'](userId));
            setCandidate(res.data.data);
        } catch (error) {
            console.log('Error fetching candidate:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditPress = () => {
        navigation.navigate('CandidatesCreate', { user });
    };

    const handleChatPress = () => {
        ToastMess({ type: 'info', text1: 'Chức năng nhắn tin đang phát triển.' });
    };

    const handleOpenPhone = (phone) => {
        if (phone) Linking.openURL(`tel:${phone}`);
    };

    const handleOpenEmail = (email) => {
        if (email) Linking.openURL(`mailto:${email}`);
    };

    const handleOpenCV = (url) => {
        if (url) Linking.openURL(url);
    };

    const renderCVItem = ({ item }) => (
        <TouchableOpacity
            style={styles.cvItem}
            onPress={() => navigation.navigate('ResumeClientView', { pdfUri: item.url })}
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
    );

    return (
        <View style={StyleShare.container}>
            <UIHeader
                leftIcon={"arrow-back"}
                title={'Thông tin ứng viên'}
                handleLeftIcon={() => navigation.goBack()}
            />
            {loading ? (
                <Loading />
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 20 }}>
                    <View style={styles.containerTop}>
                        <View style={StyleShare.containerAvatar}>
                            <Avatar.Image
                                source={{ uri: candidate?.avatar || 'https://via.placeholder.com/60' }}
                                size={60}
                                style={{ backgroundColor: white }}
                            />
                        </View>
                        <Text style={StyleShare.titleText16}>{candidate?.fullName || 'Không có tên'}</Text>
                        <Text style={{ marginTop: 5, textAlign: 'center' }}>{candidate?.email || 'Không có email'}</Text>

                        <View style={[StyleShare.flexBetween, { marginTop: 10 }]}>
                            <View style={[StyleShare.flexCenter, { flex: 1 }]}>
                                <Icon name="call-outline" size={18} />
                                <Text style={{ marginLeft: 5, fontSize: 12, fontWeight: '500' }}>
                                    {candidate?.phone || 'N/A'}
                                </Text>
                            </View>
                            <View style={[StyleShare.flexCenter, { flex: 1 }]}>
                                <Icon name="briefcase-outline" size={18} />
                                <Text style={{ marginLeft: 5, fontSize: 12, fontWeight: '500' }}>
                                    {candidate?.jobType || 'N/A'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.containerMain}>
                        <View style={[StyleShare.flexCenter, { marginHorizontal: 20 }]}>
                            {candidate?.email && (
                                <TouchableOpacity onPress={handleOpenEmail}>
                                    <View style={[StyleShare.buttonDetailApply, { backgroundColor: white, marginRight: 10 }]}>
                                        <Icon name="mail-outline" size={22} />
                                        <Text style={{ marginLeft: 5 }}>Gửi email</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity onPress={handleChatPress}>
                                <View style={[StyleShare.buttonDetailApply, { backgroundColor: white, marginLeft: 10 }]}>
                                    <Icon name="chatbubble-outline" size={22} />
                                    <Text style={{ marginLeft: 5 }}>Nhắn tin</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View style={{ marginTop: 10 }}>
                            <Text style={[StyleShare.titleText16, { marginTop: 15 }]}>Địa điểm</Text>
                            <Text style={{ color: textColor, marginTop: 5 }}>{candidate?.location || 'Không có'}</Text>

                            <Text style={[StyleShare.titleText16, { marginTop: 15 }]}>Kỹ năng</Text>
                            <Text style={{ color: textColor, marginTop: 5 }}>
                                {candidate?.skills?.length > 0 ? candidate.skills.join(', ') : 'Không có'}
                            </Text>

                            <Text style={[StyleShare.titleText16, { marginTop: 15 }]}>Cấp độ</Text>
                            <Text style={{ color: textColor, marginTop: 5 }}>{candidate?.level || 'Không có'}</Text>

                            <Text style={[StyleShare.titleText16, { marginTop: 15 }]}>Mức lương mong muốn</Text>
                            <Text style={{ color: textColor, marginTop: 5 }}>{candidate?.salary || 'Không có'}</Text>

                            <Text style={[StyleShare.titleText16, { marginTop: 15 }]}>Loại công việc</Text>
                            <Text style={{ color: textColor, marginTop: 5 }}>{candidate?.jobType || 'Không có'}</Text>

                            <Text style={[StyleShare.titleText16, { marginTop: 15 }]}>Trạng thái sẵn sàng</Text>
                            <Text style={{ color: textColor, marginTop: 5 }}>{candidate?.availability || 'Không có'}</Text>

                            <Text style={[StyleShare.titleText16, { marginTop: 15 }]}>CV ứng viên</Text>
                            {cvData.length > 0 ? (
                                <FlatList
                                    data={cvData}
                                    renderItem={renderCVItem}
                                    keyExtractor={(item) => item._id}
                                    scrollEnabled={false}
                                    style={{ marginTop: 5 }}
                                />
                            ) : (
                                <Text style={{ color: textColor, marginTop: 5 }}>Không có CV</Text>
                            )}

                            <Text style={[StyleShare.titleText16, { marginTop: 10 }]}>Ngày tạo tài khoản</Text>
                            <Text style={{ color: textColor, marginTop: 5 }}>
                                {candidate?.createdAt ? moment(candidate.createdAt).format("DD/MM/YYYY") : 'Không có'}
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    containerTop: {
        alignItems: 'center',
        backgroundColor: white,
        marginTop: 25,
        paddingTop: 45,
        paddingBottom: 15,
        paddingHorizontal: 20,
    },
    containerMain: {
        flex: 1,
        paddingHorizontal: 20,
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