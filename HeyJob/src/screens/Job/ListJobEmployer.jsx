import React, { useContext, useEffect, useReducer, useState } from "react";
import { View, ScrollView, Text, StyleSheet, TouchableWithoutFeedback, Image, ActivityIndicator, FlatList, TouchableOpacity, Alert } from "react-native";
import styleShare from "../../assets/theme/style";
import UIHeader from "../../components/UIHeader";
import Icon from "react-native-vector-icons/Ionicons"
import moment from "moment";
import 'moment/locale/vi';
import { Chip } from "react-native-paper";
import { bgButton1, bgButton2, orange, white } from "../../assets/theme/color";
import { authApi, endpoints } from "../../config/API";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ToastMess } from "../../components/ToastMess";
import MyContext from "../../config/MyContext";
import JobReducer, { initialState } from "../../reducer/JobReducer";

export default function ListJobEmployer({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [jobs, dispatch] = useReducer(JobReducer, initialState)
    const [currentPage, setCurrentPage] = useState(1);

    moment.locale('vi');

    const fetchJobEmployer = async (page) => {
        try {
            const token = await AsyncStorage.getItem("access-token");
            const res = await authApi(token).get(endpoints['job_employer_current'], {
                params: {
                    page: page, // Sử dụng page truyền vào
                },
            });

            const jobs = res.data.results;
            const totalItems = res.data.count;
            const next = res.data.next;
            // Dispatch dữ liệu sau khi fetch thành công
            dispatch({ type: 'FETCH_JOBS_SUCCESS', payload: { jobs, totalItems, next } });
            // console.log(res.data);
            // dispatch({ type: 'FETCH_JOBS_SUCCESS', payload: res.data });
            console.log(res.data);
        } catch (error) {
            console.log("Error fetching jobs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        const nextPage = currentPage + 1; // Tăng trang lên 1
        setCurrentPage(nextPage); // Cập nhật trang hiện tại
        fetchJobEmployer(nextPage); // Tải công việc từ trang mới
    };

    useEffect(() => {
        fetchJobEmployer(); // Gọi hàm fetch khi component mount
    }, []);

    const handleDeleteJob = async (jobId) => {
        Alert.alert(
            "Xóa tin tuyển dụng",
            "Bạn có chắc muốn xóa tin tuyển dụng này?",
            [
                {
                    text: "Hủy",
                    style: "cancel"
                },
                {
                    text: "Xóa",
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem("access-token");
                            await authApi(token).delete(endpoints['jobs_detail'](jobId));
                            console.log(jobId)
                            dispatch({ type: 'DELETE_JOB_SUCCESS', payload: jobId });
                            ToastMess({ type: 'success', text1: 'Xóa tin tuyển dụng thành công.' });

                        } catch (error) {
                            console.log(error)
                            console.log(jobId)

                        }
                    },
                    style: "destructive"
                }
            ],
            { cancelable: true }
        );
    };

    const handleUpdateActiveJob = async (jobId) => {
        Alert.alert(
            "Ngừng tuyển dụng",
            "Xác định tin tuyển dụng hết hiệu lực?",
            [
                {
                    text: "Hủy",
                    style: "cancel"
                },
                {
                    text: "Đồng ý",
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem("access-token");
                            await authApi(token).patch(endpoints['jobs_detail'](jobId), { is_active: false });
                            dispatch({ type: 'UPDATE_ACTIVE_JOBS', payload: jobId });
                            ToastMess({ type: 'success', text1: 'Cập nhật thành công.' });
                        } catch (error) {
                            console.log(error)
                        }
                    },
                    style: "destructive"
                }
            ],
            { cancelable: true }
        );
    };

    const renderItem = ({ item }) => {
        return (
            <View>
                <View style={styles.jobItemContainer}>
                    <View style={styleShare.flexBetween}>
                        <Text style={styleShare.titleJobAndName}>{item.title}</Text>
                        <View style={styleShare.flexCenter}>
                            <TouchableOpacity style={{ zIndex: 999 }} onPress={() => handleDeleteJob(item.id)}>
                                <Icon name="trash-outline" size={24} color={'red'} />
                            </TouchableOpacity>
                            {item.is_active ? <TouchableOpacity style={{ zIndex: 999 }} onPress={() => handleUpdateActiveJob(item.id)}>
                                <Icon name="notifications-circle" size={24} style={{ marginLeft: 10 }} color={orange} />
                            </TouchableOpacity>
                                : <View style={{ zIndex: 999 }}>
                                    <Icon name="notifications-off-circle" size={24} style={{ marginLeft: 10 }} color={bgButton1} />
                                </View>}
                        </View>
                    </View>
                    <View style={styles.technologyContainer}>
                        <Chip style={styleShare.chip}>{item.location}</Chip>
                        <Chip style={styleShare.chip}>{item.salary}</Chip>
                        {item.technologies.map((tech, index) => (
                            <Chip key={index} style={styleShare.chip}>
                                {tech.name}
                            </Chip>
                        ))}
                    </View>
                    <View style={styleShare.flexBetween}>
                        <View>
                            <Text>Đăng lúc {moment(item.created_at).format('DD/MM/YYYY')}</Text>
                            <Text>Hết hạn vào {moment(item.expiration_date).format('DD/MM/YYYY')}</Text>
                        </View>
                        <View>
                            {item.is_active ? <Text style={[styleShare.titleJobAndName, { color: orange }]}>Đang hoạt động</Text>
                                : <Text style={[styleShare.titleJobAndName, { color: bgButton1 }]}>Hết hạn</Text>}
                        </View>
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
                title={'Chiến dịch tuyển dụng'}
                handleLeftIcon={() => { navigation.goBack() }} />
            <View style={{ marginHorizontal: 20, marginTop: 5 }}>
                <Text style={styleShare.titleJobAndName}>Số lượng: {jobs.jobs.length}</Text>
            </View>
            <FlatList
                data={jobs.jobs}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                ListEmptyComponent={
                    <View style={{ marginTop: 50, alignItems: 'center' }}>
                        <Image source={require("../../assets/images/save.png")} style={styleShare.imageNullData} />
                        <Text style={styleShare.textMainOption}>Bạn chưa có bài tuyển dụng nào</Text>
                        <Text style={{ padding: 20, textAlign: 'center' }}>Bạn không có bất kỳ bài tuyển dụng nào, hãy đăng bài tuyển dụng để tìm kiếm ứng viên tiềm năng</Text>
                    </View>
                }
                contentContainerStyle={{ paddingBottom: 20, paddingTop: 10 }}
                ListFooterComponent={
                    jobs.next ? (
                        <View style={{ alignItems: 'center', marginVertical: 20 }}>
                            <TouchableOpacity onPress={handleLoadMore} disabled={loading}>
                                <Text style={{ color: bgButton1, fontSize: 16, fontWeight: '500' }}>
                                    Xem thêm
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View>
                        </View>
                    )
                }
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

    technologyContainer: {
        // Container chứa các Chip công nghệ
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10
    },
})