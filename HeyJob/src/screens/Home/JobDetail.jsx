import React, { useEffect, useState } from "react";
import { StyleSheet, View, Image, Text, TouchableOpacity, ScrollView, TouchableWithoutFeedback, ActivityIndicator, Linking } from "react-native";
import styleShare from "../../assets/theme/style";
import UIHeader from "../../components/UIHeader";
import { bgButton1, bgButton2, bgImage, grey, orange, textColor, white } from "../../assets/theme/color";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi, endpoints } from "../../config/API";
import moment from "moment";
import { ToastMess } from "../../components/ToastMess";
import { Avatar } from "react-native-paper";

export default function JobDetail({ navigation, route }) {
    const { jobId } = route.params
    const [jobDetail, setJobDetail] = useState('')
    const [loading, setLoading] = useState(true);



    useEffect(() => {
        fetchJobDetail()
    }, [])

    const menuItems = [
        { id: 1, icon: 'sparkles', title: 'Kinh nghiệm', info: jobDetail.experience },
        { id: 3, icon: 'people', title: 'Số lượng tuyển', info: jobDetail.quantity },
        { id: 6, icon: 'stopwatch', title: 'Hạn nộp hồ sơ', info: moment(jobDetail.expiration_date).format('DD/MM/YYYY') },
    ];

    const fetchJobDetail = async () => {
        const token = await AsyncStorage.getItem("access-token");
        const res = await authApi(token).get(endpoints['jobs_detail'](jobId));
        setJobDetail(res.data)
        console.log(res.data)
        setLoading(false)
    }

    const handleLocationPress = () => {
        const address = encodeURIComponent(jobDetail.location_detail);
        const url = `https://www.google.com/maps/search/?api=1&query=${address}`; // Google Maps

        // Nếu muốn mở Apple Maps trên iOS, dùng URL sau:
        // const url = `http://maps.apple.com/?q=${address}`;

        Linking.canOpenURL(url)
            .then((supported) => {
                if (supported) {
                    return Linking.openURL(url);
                } else {
                    console.log("Don't know how to open URI: " + url);
                }
            })
            .catch((err) => console.error('An error occurred', err));
    };

    const handleSaveJob = async (jobId) => {
        try {
            const token = await AsyncStorage.getItem("access-token");
            await authApi(token).post(endpoints['save_job'], { job_id: jobId });
            ToastMess({ type: 'success', text1: 'Lưu việc làm thành công.' });
            fetchJobDetail()


        } catch (error) {
            console.error("Lỗi khi lưu công việc:", error);
            ToastMess({ type: 'error', text1: 'Không thể lưu công việc. Vui lòng thử lại.' });
        }
    }

    if (loading) {
        return <ActivityIndicator style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} size="large" color='orange' />;
    }

    return (
        <View style={{ flex: 1 }}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
                <UIHeader leftIcon={"arrow-back"}
                    rightIcon={"ellipsis-horizontal"}
                    handleLeftIcon={() => { navigation.goBack() }} />
                <View style={styles.containerTop}>
                    <TouchableOpacity style={styleShare.containerAvatar} onPress={() => navigation.navigate('ProfileEmployer', { employerId: jobDetail.employer.id })}>
                        <Avatar.Image source={{ uri: jobDetail.employer.avatar }} size={60} style={{ backgroundColor: 'white' }} />
                    </TouchableOpacity>
                    <Text style={styleShare.titleJobAndName}>{jobDetail.title}</Text>
                    <Text >{jobDetail.employer.employer.company_name}</Text>
                    <View style={styles.descOption}>
                        <View style={styles.descDetail}>
                            <Icon name="cash" size={30} color={bgButton1} />
                            <Text style={styles.textDesc}>Mức lương</Text>
                            <Text style={styleShare.titleJobAndName}>{jobDetail.salary}</Text>
                        </View>
                        <View style={styles.descDetail}>
                            <Icon name="location-sharp" size={30} color={bgButton1} />
                            <Text style={styles.textDesc}>Địa điểm</Text>
                            <Text style={styleShare.titleJobAndName}>{jobDetail.location}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.containerMain}>
                    <Text style={styleShare.textMainOption}>Thông tin chung</Text>
                    <View style={{ marginBottom: 20 }}>
                        {menuItems.map((item) => (
                            <View key={item.id} style={styles.infoContainer}>
                                <Icon name={item.icon} size={26} color={bgButton1} />
                                <View style={styles.infoDesc}>
                                    <Text style={{ color: textColor }}>{item.title}</Text>
                                    <Text style={{ fontWeight: '500', fontSize: 16, marginTop: 3 }}>{item.info}</Text>
                                </View>
                            </View>
                        ))}
                        <View style={styles.infoContainer}>
                            <Icon name={'podium'} size={26} color={bgButton1} />
                            <View style={styles.infoDesc}>
                                <Text style={{ color: textColor }}>Công nghệ</Text>
                                {jobDetail.technologies.map((tech, index) => (
                                    <Text key={index} style={{ fontWeight: '500', fontSize: 16, marginTop: 3 }}>{tech.name}</Text>
                                ))}
                            </View>
                        </View>
                    </View>
                    <View style={{ marginBottom: 20 }}>
                        <Text style={styleShare.textMainOption}>Mô tả công việc</Text>
                        <Text style={{ color: textColor, marginTop: 5 }}>{jobDetail.description}</Text>
                    </View>
                    <View style={{ marginBottom: 20 }}>
                        <Text style={styleShare.textMainOption}>Yêu cầu ứng viên</Text>
                        <Text style={{ color: textColor, marginTop: 5 }}>{jobDetail.requirements}</Text>
                    </View>
                    <View style={{ marginBottom: 20 }}>
                        <Text style={styleShare.textMainOption}>Địa chỉ làm việc</Text>
                        <Text style={{ color: textColor, marginTop: 5 }}>{jobDetail.location_detail}</Text>
                    </View>
                    <View style={{ marginBottom: 20 }}>
                        <TouchableOpacity style={styleShare.buttonDetailApply} onPress={() => handleLocationPress()}>
                            <Text style={{ color: textColor, marginTop: 5 }}><Text style={{ fontWeight: '500', color: bgButton1 }}>Xem địa chỉ trên Map</Text></Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
            <View style={[styleShare.bottomBar, styleShare.flexCenter]}>
                {jobDetail.is_saved ? (
                    <View style={styleShare.buttonSave}>
                        <Icon name="bookmarks" color={orange} size={24} />
                    </View>
                ) : (
                    <TouchableOpacity style={styleShare.buttonSave} onPress={() => handleSaveJob(jobDetail.id)}>
                        <Icon name="bookmarks-outline" color={orange} size={24} />
                    </TouchableOpacity>
                )}
                {jobDetail.is_applied = true ? (
                    <TouchableOpacity style={styles.buttonApply} onPress={() => { navigation.navigate('UploadCV', { jobId: jobDetail.id }) }}>
                        <Text style={styles.buttonText}>Ứng tuyển ngay</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.buttonApply} onPress={() => navigation.navigate('ProfileEmployer', { employerId: jobDetail.employer.id })}>
                        <Text style={styles.buttonText}>Hồ sơ công ty</Text>
                    </TouchableOpacity>
                )}

            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    containerTop: {
        alignItems: 'center',
        backgroundColor: white,
        borderRadius: 20,
        marginHorizontal: 20,
        marginTop: 30,
        paddingTop: 45,
        paddingHorizontal: 20,
        flexShrink:1
    }
    , descOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',

    },
    descDetail: {
        alignItems: 'center',
        padding: 20
    }, textDesc: {
        marginTop: 10,
        marginBottom: 5
    },
    containerMain: {
        paddingHorizontal: 20,
        marginTop: 10,
        paddingTop: 10,
        backgroundColor: white
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12
    },
    infoDesc: {
        marginLeft: 20
    },
    buttonApply: {
        backgroundColor: bgButton1,
        padding: 12,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
        width: '80%',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: "500",
        color: white
    },


})