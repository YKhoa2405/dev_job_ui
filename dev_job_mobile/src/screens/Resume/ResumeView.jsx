import React, { useState } from 'react';
import { StyleSheet, Dimensions, View, Text, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import UIHeader from '../../components/UIHeader';
import StyleShare from '../../assets/themes/StyleShare';
import Dropdown from '../../components/Dropdown';
import moment from "moment/moment";
import { grey, orange, white } from '../../assets/themes/Color';


export default function ResumeView({ route, navigation }) {
    const [loading, setLoading] = useState(true);
    const { resumeDetail } = route.params;
    console.log(resumeDetail)
    const [selectedStatus, setSelectedStatus] = useState(resumeDetail.status);

    const googleDocsUrl = `https://docs.google.com/gview?embedded=true&url=${resumeDetail.cv}`;
    const activeData = [
        { title: 'Chờ xử lý', value: 'Chờ xử lý' },
        { title: 'Đã xem', value: 'Đã xem' },
        { title: 'Chấp nhận', value: 'Chấp nhận' },
        { title: 'Từ chối', value: 'Từ chối' },
    ];
    return (
        <View style={styles.container}>
            <UIHeader
                leftIcon={"arrow-back"}
                title={''}
                handleLeftIcon={() => { navigation.goBack() }} />
            <ScrollView>
                <View style={{ paddingHorizontal: 20 }}>
                    <View style={StyleShare.flexBetween}>
                        <Text style={StyleShare.titleText20}>Thông tin chung</Text>
                        <Dropdown
                            data={activeData}
                            onSelect={(item) => {
                                setSelectedStatus(item.value);
                            }}
                            value={selectedStatus}
                            placeholder={resumeDetail.status}
                            buttonStyle={{

                                backgroundColor: grey
                            }
                            }
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
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    webview: {
        flex: 1,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    }
});

