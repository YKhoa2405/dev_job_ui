import { StyleSheet, View, Image, Text, TouchableOpacity, ScrollView, TouchableWithoutFeedback, ActivityIndicator, Linking } from "react-native";
import UIHeader from "../../components/UIHeader";
import { Avatar, Chip } from "react-native-paper";
import Icon from "react-native-vector-icons/Ionicons";
import StyleShare from "../../assets/themes/StyleShare";
import { grey, mainColor, orange, textColor, white } from "../../assets/themes/Color";
import moment from "moment/moment";
import { useDispatch, useSelector } from "react-redux";
import { fetchJobDetail } from "../../redux/slice/jobSlice";
import { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import { authApi, endpoints } from "../../assets/config/API";
import { ToastMess } from "../../components/ToastMess";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function JobDetail({ route, navigation }) {
    const { jobId } = route.params
    const dispatch = useDispatch()
    const jobDetail = useSelector((state) => state.job.jobDetail);
    const status = useSelector((state) => state.job.status);
    const [isSaved, setIsSaved] = useState(false);
    useEffect(() => {
        if (jobId) {
            dispatch(fetchJobDetail(jobId));
            handleCheckSavedJob();
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
            title: 'Kinh nghiệm',
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
        }
    ];

    const handleNavigateToCompany = () => {
        if (jobDetail?.companyId?._id) {
            navigation.navigate('CompanyDetail', { _id: jobDetail.companyId._id });
        }
    };

    const handleSavedJob = async () => {
        try {
            const token = await AsyncStorage.getItem("access_token");
            const res = await authApi(token).post(endpoints['saveJob'], { jobId });
            setIsSaved(true);
            ToastMess({ type: 'success', text1: 'Lưu việc làm thành công.' });
        } catch (error) {
            ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại.' });
        }
    };

    const handleUnsaveJob = async () => {
        try {
            const token = await AsyncStorage.getItem("access_token");
            const res = await authApi(token).delete(endpoints['saveJobDetail'](jobId));

            setIsSaved(false);
            ToastMess({ type: 'success', text1: 'Bỏ lưu việc làm thành công.' });
        } catch (error) {
            ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại.' });
        }
    };

    const handleCheckSavedJob = async () => {
        try {
            const token = await AsyncStorage.getItem("access_token");
            const res = await authApi(token).get(endpoints['checkSavedJob'](jobId));
            setIsSaved(res.data.data.isSaved);
        } catch (error) {
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
                        rightIcon={"flag-outline"}
                        handleLeftIcon={() => { navigation.goBack() }}
                        handleRightIcon={() => navigation.navigate('ReportJob', { jobId: jobId, name: jobDetail?.name })} />
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
                        {jobDetail?.isUrgent && (
                            <Chip
                                style={[StyleShare.chip, { backgroundColor: '#FF4500', marginLeft: 5 }]}
                                icon={() => <Icon name="flame" size={16} color={white} />}
                            >
                                <Text style={{ color: white, fontSize: 12 }}>Gấp</Text>
                            </Chip>
                        )}
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
                                        <View style={[StyleShare.flexCenter, { flexDirection: 'row', flexWrap: 'wrap' }]}>
                                            {jobDetail.skills.map((item, index) => (
                                                <View key={index} style={styles.skillTag}>
                                                    <Text style={{ fontSize: 16, }}>{item}</Text>
                                                </View>
                                            ))}
                                        </View>

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
                    <TouchableOpacity
                        style={StyleShare.buttonSave}
                        onPress={isSaved ? handleUnsaveJob : handleSavedJob}
                    >
                        <Icon
                            name={isSaved ? "bookmarks" : "bookmarks-outline"}
                            color={orange}
                            size={24}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.buttonApply,
                            {
                                backgroundColor:
                                    jobDetail?.isActive === false
                                        ? 'grey' // Màu xám nhạt cho trạng thái dừng tuyển dụng
                                        : jobDetail?.hasApplied
                                            ? 'grey' // Màu xám cho trạng thái đã ứng tuyển
                                            : mainColor // Màu chính cho trạng thái có thể ứng tuyển
                            }
                        ]}
                        onPress={() => {
                            if (jobDetail?.isActive && !jobDetail?.hasApplied) { // Chỉ cho phép nhấn nếu isActive = true và chưa ứng tuyển
                                navigation.navigate('ResumeApply', {
                                    jobId: jobDetail._id,
                                    companyName: jobDetail.companyId.name,
                                    companyId: jobDetail.companyId._id,
                                    jobTitle: jobDetail.name,
                                    location: jobDetail.location,
                                    salary: jobDetail.salary,
                                });
                            }
                        }}
                        disabled={jobDetail?.isActive === false || jobDetail?.hasApplied} // Vô hiệu hóa nếu isActive = false hoặc đã ứng tuyển
                    >
                        <Text style={styles.buttonText}>
                            {jobDetail?.isActive === false
                                ? 'Dừng tuyển dụng'
                                : jobDetail?.hasApplied
                                    ? 'Bạn đã ứng tuyển'
                                    : 'Ứng tuyển ngay'}
                        </Text>
                    </TouchableOpacity>
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

    skillTag: {
        backgroundColor: white,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 10,
        margin: 5,
        borderWidth: 1,
        borderColor: 'grey',
    },
})