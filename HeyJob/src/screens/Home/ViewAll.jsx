import React, { useContext, useEffect, useReducer, useState } from "react";
import { View, ScrollView, Text, StyleSheet, TouchableWithoutFeedback, Image, ActivityIndicator, FlatList, TouchableOpacity, Alert } from "react-native";
import styleShare from "../../assets/theme/style";
import UIHeader from "../../components/UIHeader";
import Icon from "react-native-vector-icons/Ionicons"
import moment from "moment";
import 'moment/locale/vi';
import { Avatar, Chip } from "react-native-paper";
import { bgButton1, bgButton2, orange, white } from "../../assets/theme/color";
import { authApi, endpoints } from "../../config/API";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ToastMess } from "../../components/ToastMess";
import MyContext from "../../config/MyContext";
import JobReducer, { initialState } from "../../reducer/JobReducer";

export default function ViewAll({ navigation, route }) {
    const { title, api } = route.params;
    // const [loading, setLoading] = useState(true);
    // const [jobs, setJobs] = useState([])
    const [currentPage, setCurrentPage] = useState(1);
    const [{ jobs, loading, next }, dispatch] = useReducer(JobReducer, initialState);
    useEffect(() => {
        fetchJob();
    }, []);

    const fetchJob = async (page = 1) => {
        dispatch({ type: 'FETCH_JOBS_REQUEST' }); // Bắt đầu loading
        try {
            const token = await AsyncStorage.getItem("access-token");
            const res = await authApi(token).get(endpoints[api], {
                params: { page },
            });

            dispatch({
                type: 'FETCH_JOBS_SUCCESS',
                payload: {
                    jobs: res.data.results,
                    totalItems: res.data.count,
                    next: res.data.next ? page + 1 : null,
                    page: page, // Truyền page để biết là trang đầu hay trang tiếp theo
                }
            });
        } catch (error) {
            console.error('Error fetching jobs:', error);
            dispatch({ type: 'FETCH_JOBS_FAILURE', payload: error.message });
        }
    };


    const handleLoadMore = () => {
        if (next) {
            fetchJob(next);
        }
    };

    const handleSaveJob = async (jobId) => {
        try {
            const token = await AsyncStorage.getItem("access-token");
            const res = await authApi(token).post(endpoints['save_job'], { job_id: jobId });

            dispatch({ type: 'SAVE_JOB_SUCCESS', payload: { job_id: jobId } });
            ToastMess({ type: 'success', text1: 'Lưu việc làm thành công.' });
        } catch (error) {
            console.log(error);
            ToastMess({ type: 'error', text1: 'Có lỗi xảy ra. Vui lòng thử lại.' });
        }
    };

    const renderItem = ({ item }) => (
        <TouchableWithoutFeedback key={item.id} onPress={() => { navigation.navigate('JobDetail', { jobId: item.id }) }}>
            <View style={styles.jobItemContainer}>
                {item.is_saved ? (
                    <View style={styles.btnSave}>
                        <Icon name="bookmark" size={26} color={orange} />
                    </View>
                ) : (
                    <TouchableOpacity style={styles.btnSave} onPress={() => handleSaveJob(item.id)}>
                        <Icon name="bookmark-outline" size={26} />
                    </TouchableOpacity>
                )}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={styles.containerAvatarJob}>
                        <Avatar.Image source={{ uri: item.employer.avatar }} size={36} style={{ backgroundColor: 'white' }} />
                    </View>
                    <View>
                        <Text style={styleShare.titleJobAndName}>{item.title}</Text>
                        <Text style={{ marginTop: 5 }}>{item.employer.employer.company_name}</Text>
                    </View>
                </View>
                <View style={styleShare.technologyContainer}>
                    <Chip style={styleShare.chip}>{item.location}</Chip>
                    <Chip style={styleShare.chip}>{`${item.salary} VND`}</Chip>
                    <Chip style={styleShare.chip}>{item.experience}</Chip>
                    {item.technologies.map((tech) => (
                        <Chip key={tech.id} style={styleShare.chip}> {/* Assuming tech.id is unique */}
                            {tech.name}
                        </Chip>
                    ))}
                </View>
                <View style={styleShare.flexBetween}>
                    <View style={styleShare.flexCenter}>
                        <Icon name="time" size={22} color={'grey'} style={{ marginRight: 5 }} />
                        <Text>{moment(item.expiration_date).format('DD/MM/YYYY')}</Text>
                    </View>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );


    return (
        <View style={styleShare.container}>
            <UIHeader leftIcon={"arrow-back"}
                rightIcon={"ellipsis-horizontal"}
                title={title}
                handleLeftIcon={() => { navigation.goBack() }} />
            {loading ? (
                <ActivityIndicator style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} size="large" color='orange' />
            ) : (
                <FlatList
                    data={jobs}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    ListEmptyComponent={
                        <View style={{ marginTop: 50, alignItems: 'center' }}>
                            <Image source={require("../../assets/images/save.png")} style={styleShare.imageNullData} />
                            <Text style={styleShare.textMainOption}>Không có việc làm nào </Text>
                            <Text style={{ padding: 20, textAlign: 'center' }}>Không có việc làm nào phù hợp, vui lòng quay lại kiểm ra sau này</Text>
                        </View>
                    }
                    contentContainerStyle={{ paddingBottom: 40, paddingTop: 10 }}
                    ListFooterComponent={
                        <View style={{ alignItems: 'center', marginVertical: 20 }}>
                            {next  ? (
                                <TouchableOpacity onPress={handleLoadMore} disabled={loading}>
                                    <Text style={{ color: bgButton1, fontSize: 16, fontWeight: '500' }}>
                                        Xem thêm
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                <Text style={{ color: 'grey', fontSize: 16, fontWeight: 'bold' }}>Đã xem hết</Text>
                            )}
                        </View>}
                />
            )}


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
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10
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
    btnSave: {
        position: 'absolute',
        top: 20,
        right: 20,
        opacity: 0.8,
        zIndex: 999
    },
})