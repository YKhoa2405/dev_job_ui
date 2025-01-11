import { StyleSheet, View, Image, Text, TouchableOpacity, ScrollView, TouchableWithoutFeedback, ActivityIndicator, Linking } from "react-native";
import UIHeader from "../../components/UIHeader";
import { Avatar } from "react-native-paper";
import Icon from "react-native-vector-icons/Ionicons";
import StyleShare from "../../assets/themes/StyleShare";
import { mainColor, orange, textColor, white } from "../../assets/themes/Color";
import moment from "moment/moment";
import { useDispatch, useSelector } from "react-redux";
import { fetchJobDetail } from "../../redux/slice/jobSlice";
import { useEffect } from "react";
import Loading from "../../components/Loading";
import { authApi, endpoints } from "../../assets/config/API";
import { ToastMess } from "../../components/ToastMess";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function JobDetail({ route, navigation }) {
    const { jobId } = route.params
    const dispatch = useDispatch()
    const jobDetail = useSelector((state) => state.job.jobDetail);
    const status = useSelector((state) => state.job.status);
    useEffect(() => {
        if (jobId) {
            dispatch(fetchJobDetail(jobId));
        }
    }, [jobId, dispatch]);

    const menuItems = [
        {
            id: '1',
            icon: 'briefcase',
            title: 'Loại hình công việc',
            info: jobDetail?.jobType || "N/A",
        },
        {
            id: '4',
            icon: 'checkmark-circle-sharp',
            title: 'Level',
            info: jobDetail?.level || "N/A",
        },
        {
            id: '2',
            icon: 'people-circle-outline',
            title: 'Số lượng',
            info: jobDetail?.quantity || "N/A",
        },
        {
            id: '3',
            icon: 'calendar',
            title: 'Ngày hết hạn',
            info: jobDetail?.endDate ? moment(jobDetail.endDate).format('DD/MM/YYYY') : "N/A",
        },
    ];

    const handleNavigateToCompany = () => {
        if (jobDetail?.companyId?._id) {
            navigation.navigate('CompanyDetail', { _id: jobDetail.companyId._id });
        }
    };

    const handleSavedJob = async () => {
        try {
            const token = await AsyncStorage.getItem("access_token");
            // API gọi để xóa công việc đã lưu
            await authApi(token).post(endpoints['saveJob'], { jobId });
        } catch (error) {
            ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại.' });

            console.log(error);
        }
    };


    return (
        <View style={{ flex: 1 }}>
            {status === 'loading' ? <>
                <Loading />
            </> : <>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
                    <UIHeader leftIcon={"arrow-back"}
                        rightIcon={"ellipsis-horizontal"}
                        handleLeftIcon={() => { navigation.goBack() }} />

                    <View style={styles.containerTop}>
                        <TouchableOpacity style={StyleShare.containerAvatar} onPress={handleNavigateToCompany}>
                            <Avatar.Image
                                source={{ uri: jobDetail?.companyId?.avatar || "https://via.placeholder.com/60" }}
                                size={60}
                                style={{ backgroundColor: 'white' }}
                            />
                        </TouchableOpacity>
                            <Text style={StyleShare.titleText16}>{jobDetail?.name || "N/A"}</Text>
                            <Text>{jobDetail?.companyId?.name || "N/A"}</Text>

                        <View style={styles.descOption}>
                            <View style={styles.descDetail}>
                                <Icon name="cash" size={30} color={mainColor} />
                                <Text style={styles.textDesc}>Mức lương</Text>
                                <Text style={StyleShare.titleText16}>{jobDetail?.salary || "N/A"}</Text>
                            </View>
                            <View style={styles.descDetail}>
                                <Icon name="location-sharp" size={30} color={mainColor} />
                                <Text style={styles.textDesc}>Địa điểm</Text>
                                <Text style={StyleShare.titleText16}>{jobDetail?.city || "N/A"}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.containerMain}>
                        <Text style={StyleShare.titleText20}>Thông tin chung</Text>
                        <View style={{ marginBottom: 20 }}>
                            {menuItems.map((item) => (
                                <View key={item.id} style={styles.infoContainer}>
                                    <Icon name={item.icon} size={26} color={mainColor} />
                                    <View style={styles.infoDesc}>
                                        <Text style={{ color: textColor }}>{item.title}</Text>
                                        <Text style={{ fontWeight: '500', fontSize: 16, marginTop: 3 }}>{item.info}</Text>
                                    </View>
                                </View>
                            ))}
                            {jobDetail?.skills && jobDetail.skills.length > 0 && (
                                <View style={styles.infoContainer}>
                                    <Icon name={'podium'} size={26} color={mainColor} />
                                    <View style={styles.infoDesc}>
                                        <Text style={{ color: textColor }}>Công nghệ</Text>
                                        {jobDetail.skills.map((item, index) => (
                                            <Text key={index} style={{ fontWeight: '500', fontSize: 16, marginTop: 3 }}>{item}</Text>
                                        ))}
                                    </View>
                                </View>
                            )}
                        </View>
                        <View style={{ marginBottom: 20 }}>
                            <Text style={StyleShare.titleText20}>Mô tả công việc</Text>
                            <Text style={{ color: textColor, marginTop: 5 }}>{jobDetail?.description || "N/A"}</Text>
                        </View>
                        <View style={{ marginBottom: 20 }}>
                            <Text style={StyleShare.titleText20}>Yêu cầu ứng viên</Text>
                            <Text style={{ color: textColor, marginTop: 5 }}>{jobDetail?.requirement || "N/A"}</Text>
                        </View>
                        <View style={{ marginBottom: 20 }}>
                            <Text style={StyleShare.titleText20}>Ưu tiên</Text>
                            <Text style={{ color: textColor, marginTop: 5 }}>{jobDetail?.prioritize || "N/A"}</Text>
                        </View>
                        <View style={{ marginBottom: 20 }}>
                            <Text style={StyleShare.titleText20}>Địa chỉ làm việc</Text>
                            <Text style={{ color: textColor, marginTop: 5 }}>{jobDetail?.location || "N/A"}</Text>
                        </View>
                    </View>
                </ScrollView>
                <View style={[StyleShare.bottomBar, StyleShare.flexCenter]}>
                    <View style={StyleShare.buttonSave}>
                        <Icon name="bookmarks" color={orange} size={24} />
                    </View>
                    {/* {jobDetail.is_saved ? (
                ) : (
                    <TouchableOpacity style={StyleShare.buttonSave} onPress={() => handleSaveJob(jobDetail.id)}>
                        <Icon name="bookmarks-outline" color={orange} size={24} />
                    </TouchableOpacity>
                )} */}
                    <TouchableOpacity style={styles.buttonApply} onPress={() => {
                        navigation.navigate('ResumeApply', {
                            jobId: jobDetail._id,
                            companyName: jobDetail.companyId.name,
                            companyId: jobDetail.companyId._id,

                            jobTitle: jobDetail.name,
                            location: jobDetail.location,
                            salary: jobDetail.salary
                        });
                    }}>
                        <Text style={styles.buttonText}>Ứng tuyển ngay</Text>
                    </TouchableOpacity>
                    {/* {jobDetail.is_applied = true ? (
                ) : (
                    <TouchableOpacity style={styles.buttonApply} onPress={() => navigation.navigate('ProfileEmployer', { employerId: jobDetail.employer.id })}>
                        <Text style={styles.buttonText}>Hồ sơ công ty</Text>
                    </TouchableOpacity>
                )} */}

                </View>

            </>}
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
        flexShrink: 1,
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
        backgroundColor: mainColor,
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