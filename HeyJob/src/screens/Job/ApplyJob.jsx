import React, { useContext, useEffect, useState } from "react";
import { View, ScrollView, Text, StyleSheet, TouchableWithoutFeedback, Image, ActivityIndicator, FlatList, TouchableOpacity, Alert, Linking } from "react-native";
import styleShare from "../../assets/theme/style";
import UIHeader from "../../components/UIHeader";
import Icon from "react-native-vector-icons/Ionicons"
import moment from "moment";
import 'moment/locale/vi';
import { Avatar, Chip } from "react-native-paper";
import { bgButton1, bgButton2, grey, orange, white } from "../../assets/theme/color";
import { authApi, endpoints } from "../../config/API";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ButtonMain from "../../components/ButtonMain";

export default function ApplyJob({ navigation }) {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    moment.locale('vi');
    useEffect(() => {
        fetchApplyJob(); // Gọi hàm fetch khi component mount
    }, []);
    const fetchApplyJob = async () => {
        try {
            const token = await AsyncStorage.getItem("access-token");
            const res = await authApi(token).get(endpoints['apply_list_seeker']);
            setJobs(res.data);
            console.log(res.data)
        } catch (error) {
            console.error("Error fetching jobs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCv = (url) => {
        Linking.openURL(url).catch(err => console.error("Failed to open URL:", err));
    }


    const renderItem = ({ item }) => {
        const getStatusInfo = (status) => {
            switch (status) {
                case 'PENDING':
                    return { text: 'Chờ xử lý', style: { color: bgButton1 } }; // Màu cho trạng thái chờ xử lý
                case 'CLOSED':
                    return { text: 'Đã từ chối', style: { color: 'red' } }; // Màu cho trạng thái đã từ chối
                case 'OPEN':
                    return { text: 'Đã đồng ý', style: { color: 'green' } }; // Màu cho trạng thái đã đồng ý
                default:
                    return { text: 'Trạng thái không xác định', style: { color: 'gray' } }; // Màu cho trạng thái không xác định
            }
        };
        const statusInfo = getStatusInfo(item.status);
        return (
            <View key={item.id}>
                <View style={styles.jobItemContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={styles.containerAvatarJob}>
                            <Avatar.Image source={{ uri: item.job.employer.avatar }} size={36} style={{ backgroundColor: 'white' }} />
                        </View>
                        <View>
                            <Text style={styleShare.titleJobAndName}>{item.job.title}</Text>
                            <Text style={{ marginTop: 5 }}>{item.job.employer.employer.company_name}</Text>
                        </View>
                    </View>
                    <View style={styleShare.technologyContainer}>
                        <Chip style={styleShare.chip}>{item.job.location}</Chip>
                        <Chip style={styleShare.chip}>{`${item.job.salary} VND`}</Chip>
                        <Chip style={styleShare.chip}>{item.job.experience}</Chip>
                        {item.job.technologies.map((tech, index) => (
                            <Chip key={index} style={styleShare.chip}>
                                {tech.name}
                            </Chip>
                        ))}
                    </View>
                    <View style={styleShare.flexBetween}>
                        <View style={styleShare.flexCenter}>
                            <Icon name="time" size={22} color={'grey'} style={{ marginRight: 5 }} />
                            <Text>{moment(item.job.create_date).format('DD/MM/YYYY')}</Text>
                        </View>
                        <Text style={[styleShare.titleJobAndName, statusInfo.style]}>
                            {statusInfo.text}
                        </Text>
                    </View>
                    <View>
                        <TouchableOpacity onPress={() => handleOpenCv(item.cv)}>
                            <View style={styleShare.buttonDetailApply}>
                                <Icon name="document-outline" size={22} />
                                <Text style={{ marginLeft: 5 }}>Xem lại CV</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

        )
    };

    if (loading) {
        return <ActivityIndicator style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} size="large" color='orange' />;
    }

    return (
        <View style={styleShare.container}>
            <UIHeader leftIcon={"arrow-back"}
                rightIcon={"ellipsis-horizontal"}
                title={'Việc làm đã ứng tuyển'}
                handleLeftIcon={() => { navigation.goBack() }} />
            <View style={{ marginHorizontal: 20, marginTop: 5 }}>
                <Text style={styleShare.titleJobAndName}>Số lượng: {jobs.length}</Text>
            </View>
            <FlatList
                data={jobs}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                keyExtractor={item => item.job.id.toString()}
                ListEmptyComponent={
                    <View style={{ marginTop: 50, alignItems: 'center' }}>
                        <Image source={require("../../assets/images/save.png")} style={styleShare.imageNullData} />
                        <Text style={styleShare.textMainOption}>Bạn chưa ứng tuyển việc làm nào</Text>
                        <Text style={{ padding: 20, textAlign: 'center' }}>Hãy tích cực ứng tuyển để có cơ hội tìm được việc làm tiềm năng</Text>
                    </View>
                }
                contentContainerStyle={{ paddingBottom: 40 }}
            />

        </View>
    )
}

const styles = StyleSheet.create({
    jobItemContainer: {
        backgroundColor: white,
        borderRadius: 20,
        padding: 20,
        backgroundColor: white,
        marginTop: 15,
        marginHorizontal: 20
    },

    containerAvatarJob: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: bgButton2,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15
    },
    avatarJob: {
        width: 30,
        height: 30
    },
    btnSave: {
        position: 'absolute',
        top: 20,
        right: 20,
        opacity: 0.8,
        zIndex: 999
    },

})