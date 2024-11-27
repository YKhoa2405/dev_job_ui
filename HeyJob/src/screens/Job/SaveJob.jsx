import React, { useContext, useEffect, useReducer, useState } from "react";
import { View, ScrollView, Text, StyleSheet, TouchableWithoutFeedback, Image, ActivityIndicator, FlatList, TouchableOpacity, Alert } from "react-native";
import styleShare from "../../assets/theme/style";
import UIHeader from "../../components/UIHeader";
import Icon from "react-native-vector-icons/Ionicons"
import moment from "moment";
import 'moment/locale/vi';
import { Avatar, Chip } from "react-native-paper";
import { bgButton2, orange, white } from "../../assets/theme/color";
import { authApi, endpoints } from "../../config/API";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ToastMess } from "../../components/ToastMess";
import MyContext from "../../config/MyContext";
import JobReducer, { initialState } from "../../reducer/JobReducer";

export default function SaveJob({ navigation }) {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    // const [state, dispatch] = useReducer(JobReducer, initialState)

    moment.locale('vi');
    useEffect(() => {
        fetchSaveJob(); // Gọi hàm fetch khi component mount
    }, []);
    const fetchSaveJob = async () => {
        try {
            const token = await AsyncStorage.getItem("access-token");
            const res = await authApi(token).get(endpoints['save_job']);
            setJobs(res.data);
            // dispatch({ type: 'FETCH_JOBS_SUCCESS', payload: res.data });

        } catch (error) {
            console.error("Error fetching jobs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUnsaveJob = async (jobId) => {
        try {
            const token = await AsyncStorage.getItem("access-token");
            
            // dispatch({ type: 'UNSAVE_JOB_SUCCESS', payload: jobId });
            ToastMess({ type: 'success', text1: 'Đã bỏ lưu việc làm.' });
            fetchSaveJob()

        } catch (error) {
            console.error("Error fetching jobs:", error);
        } finally {
            setLoading(false);
        }
    }




    const renderItem = ({ item }) => {
        return (
            <TouchableWithoutFeedback key={item.id} onPress={() => { navigation.navigate('JobDetail', { jobId: item.job.id }) }}>
                <View style={styles.jobItemContainer}>
                    <TouchableOpacity style={styles.btnSave} onPress={() => handleUnsaveJob(item.job.id)}>
                        <Icon name="bookmark" size={26} color={orange} />
                    </TouchableOpacity>
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

                            {/* <Text>Đã thêm: {moment(item.created_at).fromNow()}</Text> */}
                            <Text>{moment(item.job.expiration_date).format('DD/MM/YYYY')}</Text>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>

        )
    };

    if (loading) {
        return <ActivityIndicator style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} size="large" color='orange' />;
    }

    return (
        <View style={styleShare.container}>
            <UIHeader leftIcon={"arrow-back"}
                rightIcon={"ellipsis-horizontal"}
                title={'Việc làm đã lưu'}
                handleLeftIcon={() => { navigation.goBack() }} />
            <View style={{ marginHorizontal: 20, marginTop:5 }}>
                <Text style={styleShare.titleJobAndName}>Số lượng: {jobs.length}</Text>
            </View>
            <FlatList
                data={jobs}
                renderItem={renderItem}
                keyExtractor={item => item.job.id.toString()}
                ListEmptyComponent={
                    <View style={{ marginTop: 50, alignItems: 'center' }}>
                        <Image source={require("../../assets/images/save.png")} style={styleShare.imageNullData} />
                        <Text style={styleShare.textMainOption}>Bạn chưa có bài tuyển dụng nào</Text>
                        <Text style={{ padding: 20, textAlign: 'center' }}>Bạn không có bất kỳ bài tuyển dụng nào, hãy đăng bài tuyển dụng để tìm kiếm ứng viên tiềm năng</Text>
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