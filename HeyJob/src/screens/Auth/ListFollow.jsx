import React, { useContext, useEffect, useState } from "react";
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

export default function ListFollow({ navigation }) {
    const [company, setCompany] = useState([
    ]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchListFollowing();
    }, []);
    const fetchListFollowing = async () => {
        try {
            const token = await AsyncStorage.getItem("access-token");
            const res = await authApi(token).get(endpoints['following_list']);
            setCompany(res.data);
            console.log(res.data)
        } catch (error) {
            console.error("Error fetching jobs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUnFollow = (userId) => {
        Alert.alert(
            "Bỏ theo dõi",
            "Bạn có chắc muốn bỏ theo dõi công ty?",
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
                            await authApi(token).post(endpoints['unfollow'](userId));
                            fetchListFollowing()

                        } catch (error) {
                            console.error("Error unfollowing:", error);
                            ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại.' });
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };


    const renderItem = ({ item }) => {
        return (
            <TouchableWithoutFeedback key={item.id} onPress={() => navigation.navigate('ProfileEmployer', { employerId: item.id })}>
                <View style={styles.followContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={styles.containerAvatarJob}>
                            <Avatar.Image source={{ uri: item.avatar }} size={36} style={{ backgroundColor: 'white' }} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.nameCompany}>{item.employer.company_name}</Text>
                        </View>
                    </View>
                    <View style={[styleShare.flexBetween, { marginVertical: 10 }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Icon name="business-outline" size={18} />
                            <Text style={{ fontWeight: '500', marginHorizontal: 5 }}>{item.employer.job_count}</Text>
                            <Text>công việc</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Icon name="person-outline" size={18} />
                            <Text style={{ fontWeight: '500', marginHorizontal: 5 }}>{item.employer.followers_count}</Text>
                            <Text>người theo dõi</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.buttonUnfollow} onPress={() => handleUnFollow(item.id)}>
                        <Text style={{ color: white, fontWeight: 500 }}>Đang theo dõi</Text>
                    </TouchableOpacity>
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
                title={'Công ty đã theo dõi'}
                handleLeftIcon={() => { navigation.goBack() }} />
            <View style={{ marginHorizontal: 20, marginTop: 5 }}>
                <Text style={styleShare.titleJobAndName}>Số lượng: {company.length}</Text>
            </View>
            <FlatList
                data={company}
                renderItem={renderItem}
                keyExtractor={item => item.id}
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
    followContainer: {
        backgroundColor: white,
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginTop: 10,
        marginHorizontal: 20
    },
    nameCompany: {
        marginLeft: 10,
        fontWeight: '500',
    },
    buttonUnfollow: {
        alignItems: 'center',
        backgroundColor: bgButton1,
        padding: 8,
        borderRadius: 10,
        zIndex: 999
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

})