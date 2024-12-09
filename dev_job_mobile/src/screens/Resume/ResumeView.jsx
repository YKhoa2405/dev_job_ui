import React, { useState } from 'react';
import { StyleSheet, Dimensions, View, Text, ScrollView, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import UIHeader from '../../components/UIHeader';
import StyleShare from '../../assets/themes/StyleShare';
import Dropdown from '../../components/Dropdown';
import moment from "moment/moment";
import { grey, mainColor, orange, white } from '../../assets/themes/Color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, endpoints } from '../../assets/config/API';
import { ToastMess } from '../../components/ToastMess';


export default function ResumeView({ route, navigation }) {
    const [loading, setLoading] = useState(true);
    const { resumeDetail, onUpdate  } = route.params;
    const [selectedStatus, setSelectedStatus] = useState(resumeDetail.status);

    const googleDocsUrl = `https://docs.google.com/gview?embedded=true&url=${resumeDetail.cv}`;
    const activeData = [
        { title: 'Chờ xử lý', value: 'Chờ xử lý' },
        { title: 'Đã xem', value: 'Đã xem' },
        { title: 'Chấp nhận', value: 'Chấp nhận' },
        { title: 'Từ chối', value: 'Từ chối' },
    ];

    return (
        <View style={StyleShare.container}>
            <UIHeader
                leftIcon={"arrow-back"}
                title={''}
                handleLeftIcon={() => { navigation.goBack() }} />
            <ScrollView>
                <View style={{ paddingHorizontal: 20 }}>
                    <View style={StyleShare.flexBetween}>
                        <Text style={StyleShare.titleText20}>Thông tin ứng viên</Text>
                        <Dropdown
                            data={activeData}
                            onSelect={async (item) => {
                                if (item.value === selectedStatus) return; // Không gọi API nếu trạng thái không đổi

                                Alert.alert(
                                    'Cập nhật hồ sơ',
                                    'Xác nhận thay đổi trạng thái của hồ sơ ứng tuyển này?',
                                    [
                                        { text: 'Hủy', style: 'cancel' },
                                        {
                                            text: 'Đồng ý',
                                            onPress: async () => {
                                                try {
                                                    setLoading(true);
                                                    const token = await AsyncStorage.getItem('access_token');
                                                    await authApi(token).patch(endpoints['resumeDetail'](resumeDetail._id), {
                                                        status: item.value,
                                                    });

                                                    setSelectedStatus(item.value); // Cập nhật trạng thái cục bộ
                                                    ToastMess({ type: 'success', text1: 'Cập nhật thành công' });
                                                } catch (error) {
                                                    ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại' });
                                                    console.error(error);
                                                } finally {
                                                    setLoading(false);
                                                }
                                            },
                                        },
                                    ],
                                    { cancelable: true }
                                );
                            }}
                            value={selectedStatus}
                            placeholder={resumeDetail.status}
                        />

                    </View>

                    <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontWeight: '500', opacity: 0.7, marginRight: 10 }}>Họ và tên : </Text>
                        <Text style={StyleShare.titleText16}>{resumeDetail.name}</Text>
                    </View>
                    <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontWeight: '500', opacity: 0.7, marginRight: 10 }}>Email : </Text>
                        <Text style={StyleShare.titleText16}>{resumeDetail.email}</Text>
                    </View>
                    <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontWeight: '500', opacity: 0.7, marginRight: 10 }}>Số điện thoại : </Text>
                        <Text style={StyleShare.titleText16}>{resumeDetail.phone}</Text>
                    </View>
                    <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontWeight: '500', opacity: 0.7, marginRight: 10 }}>Ngày ứng tuyển : </Text>
                        <Text style={StyleShare.titleText16}>{moment(resumeDetail.createdAt).format('DD/MM/YYYY')}</Text>
                    </View>

                    <Text style={[StyleShare.titleText20, { marginBottom: 10, marginTop: 20 }]}>CV ứng viên</Text>
                </View>
                <WebView
                    source={{ uri: googleDocsUrl }}
                    style={styles.webview}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    scalesPageToFit={true}
                />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    webview: {
        flex: 1,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    }
});

