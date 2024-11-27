import React, { useContext, useEffect, useReducer, useState } from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Image, FlatList, TouchableWithoutFeedback, ScrollView, ActivityIndicator } from "react-native";
import styleShare from "../../assets/theme/style";
import { bgButton1, bgButton2, bgNotifi, grey, orange, white } from "../../assets/theme/color";
import Icon from "react-native-vector-icons/Ionicons"
import { Avatar, Chip, Searchbar } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi, endpoints } from "../../config/API";
import moment from "moment";
import { ToastMess } from "../../components/ToastMess";
import MyContext from "../../config/MyContext";
import JobReducer, { initialState } from "../../reducer/JobReducer";

export default function Home({ navigation }) {
    const [jobRecommend, setJobRecommned] = useState([])
    const [jobSalary, setJobSalary] = useState([])
    const [loading, setLoading] = useState(true)
    const [user, dispatch] = useContext(MyContext)
    // const [jobSalary, dispatch_job] = useReducer(JobReducer, initialState)


    useEffect(() => {
        fetchJobRecommned()
        fetchJobHighSalary()
    }, []);

    const fetchJobRecommned = async () => {
        const token = await AsyncStorage.getItem("access-token");
        const res = await authApi(token).get(endpoints['job_recommned'], {
            params: {
                page: 1
            },
        });
        setJobRecommned(res.data.results)
        setLoading(false)
    }

    const fetchJobHighSalary = async () => {
        const token = await AsyncStorage.getItem("access-token");
        const res = await authApi(token).get(endpoints['job_salary'], {
            params: {
                page: 1
            },
        });
        console.log(res.data)
        setJobSalary(res.data.results)
        setLoading(false)
    }

    const handleSaveJob = async (jobId) => {
        try {
            const token = await AsyncStorage.getItem("access-token");
            await authApi(token).post(endpoints['save_job'], { job_id: jobId });
            ToastMess({ type: 'success', text1: 'Lưu việc làm thành công.' });


        } catch (error) {
            ToastMess({ type: 'error', text1: 'Không thể lưu công việc. Vui lòng thử lại.' });
        }
    }

    if (loading) {
        return <ActivityIndicator style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} size="large" color='orange' />;
    }

    return (
        <View style={styleShare.container}>
            <View style={[styleShare.flexBetween, { marginHorizontal: 20, marginTop: 30 }]}>
                <View>
                    <Text style={styleShare.titleJobAndName}>Xin chào, {user.username}</Text>
                </View>
                <Avatar.Image source={{ uri: user.avatar }} size={36} style={{ backgroundColor: 'white' }} />
            </View>
            <View style={{ marginHorizontal: 20, marginVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <TouchableOpacity onPress={() => navigation.navigate('JobSearch')} style={styleShare.searchHome}>
                    <Icon name="search" color={bgButton1} size={24} style={{ marginRight: 10 }} />
                    <Text>Tìm kiếm việc làm</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.searchMap} onPress={() => navigation.navigate('SearchJobMap')}>
                    <Icon name="map" size={20} color={orange} />
                </TouchableOpacity>
            </View>
            <ScrollView style={styles.headerMain} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
                <View>
                    <View style={styleShare.flexBetween}>
                        <Text style={styleShare.textMainOption}>Gợi ý việc làm phù hợp</Text>
                        <TouchableOpacity style={styleShare.textMainOption} onPress={() => navigation.navigate("ViewAll", { title: "Gợi ý việc làm phù hợp", api: "job_recommned" })}>
                            <Text style={styleShare.lineText}>Xem tất cả</Text>
                        </TouchableOpacity>
                    </View>
                    {jobRecommend.map((item) => (
                        <TouchableWithoutFeedback key={item.id} onPress={() => { navigation.navigate('JobDetail', { jobId: item.id }) }}>
                            <View style={styles.jobItemContainer}>
                                {item.is_saved ?
                                    <View style={styles.btnSave}>
                                        <Icon name="bookmark" size={26} color={orange} />
                                    </View> :
                                    <TouchableOpacity style={styles.btnSave} onPress={() => handleSaveJob(item.id)}>
                                        <Icon name="bookmark-outline" size={26} />
                                    </TouchableOpacity>
                                }
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
                                    {item.technologies.map((tech, index) => (
                                        <Chip key={index} style={styleShare.chip}>
                                            {tech.name}
                                        </Chip>
                                    ))}
                                </View>
                                <View style={styleShare.flexBetween}>
                                    <View style={styleShare.flexCenter}>
                                        <Icon name="time" size={22} color={'grey'} style={{ marginRight: 5 }} />

                                        {/* <Text>Đã thêm: {moment(item.created_at).fromNow()}</Text> */}
                                        <Text>{moment(item.expiration_date).format('DD/MM/YYYY')}</Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    ))}

                </View>
                <View style={{ marginTop: 40 }}>
                    <View style={styleShare.flexBetween}>
                        <Text style={styleShare.textMainOption}>Việc làm hấp dẫn</Text>
                        <TouchableOpacity style={styleShare.textMainOption} onPress={() => navigation.navigate("ViewAll", { title: "Việc làm hấp dẫn", api: "job_salary" })}>
                            <Text style={styleShare.lineText}>Xem tất cả</Text>
                        </TouchableOpacity>
                    </View>
                    {jobSalary.map((item) => (
                        <TouchableWithoutFeedback key={item.id} onPress={() => { navigation.navigate('JobDetail', { jobId: item.id }) }}>
                            <View style={styles.jobItemContainer}>
                                {item.is_saved ?
                                    <View style={styles.btnSave}>
                                        <Icon name="bookmark" size={26} color={orange} />
                                    </View> :
                                    <TouchableOpacity style={styles.btnSave} onPress={() => handleSaveJob(item.id)}>
                                        <Icon name="bookmark-outline" size={26} />
                                    </TouchableOpacity>
                                }
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
                                    {item.technologies.map((tech, index) => (
                                        <Chip key={index} style={styleShare.chip}>
                                            {tech.name}
                                        </Chip>
                                    ))}
                                </View>
                                <View style={styleShare.flexBetween}>
                                    <View style={styleShare.flexCenter}>
                                        <Icon name="time" size={22} color={'grey'} style={{ marginRight: 5 }} />

                                        {/* <Text>Đã thêm: {moment(item.created_at).fromNow()}</Text> */}
                                        <Text>{moment(item.expiration_date).format('DD/MM/YYYY')}</Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    ))}

                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({

    headerMain: {
        padding: 20,
    },
    jobItemContainer: {
        backgroundColor: white,
        borderRadius: 20,
        padding: 20,
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
    infoJobContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10
    },

    searchMap: {
        padding: 10,
        borderRadius: 10,
        backgroundColor: 'white',
        elevation: 2
    }

})