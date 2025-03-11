import { View, Text, TouchableOpacity, TextInput, StyleSheet, Image, FlatList, TouchableWithoutFeedback, ScrollView, ActivityIndicator, ImageBackground } from "react-native";
import StyleShare from "../../assets/themes/StyleShare";
import { bgButton2, mainColor, white, orange } from "../../assets/themes/Color";
import { Avatar, Chip } from "react-native-paper";
import Icon from 'react-native-vector-icons/Ionicons'
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import API, { endpoints } from "../../assets/config/API";
import moment from "moment";

const postData = {
    text: "nguyen khoa mobile developer thu duc hcm city final ho chi minh city open sep -present completed mobile programming modern programming technology database management data structure . . engaged hands-on project team collaboration gaining practical experience real- world application . led team project often appointed team leader group assignment . project heyjob app sep oct job search application developed using react native front end django rest framework api development . mysql used database management . bing map service integrated support nearby search provide direction . integrate firebase implement messaging functionality manage file storage . integrate online payment vnpay . chat app aug sep project team leader messaging application consists three member . developed java using firebase data storage . using firebase database efficient data storage management . firebase storage integrated handle medium file storage . firebase authentication manage user authentication authorization implementing sign-in method including email/password google . share journey apr jun project development allows user create itinerary request join user itinerary developed two member . developed user interface using react native created set apis django rest framework stored data mysql utilized cloudinary image file storage . bing map service integration provides direction . skill programming language javascript python framework react native django flask database mysql tool git firebase figma"
};

export default function HomeClient({ navigation }) {
    const currentUser = useSelector((state) => state.user.user)
    const [jobRecommend, setJobsRecommend] = useState([]);
    const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //     fetchRecommendedJobs();
    // }, []);

    const fetchRecommendedJobs = async () => {
        try {
            const res = await API.post(endpoints['recommend'], postData, {
                headers: {
                    "Content-Type": "application/json"
                }
            }
            );
            console.log(res.data.recommendations);
            setJobsRecommend(res.data.recommendations);  // Lưu danh sách công việc vào state
        } catch (error) {
            console.log("Lỗi khi lấy gợi ý việc làm:", error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => {
        return (
            <TouchableWithoutFeedback onPress={() => navigation.navigate("JobDetail", { jobId: item._id })}>
                <View style={StyleShare.jobItemContainer}>
                    <Text style={StyleShare.titleText16}>{item.name}</Text>
                    <View style={StyleShare.technologyContainer}>
                        <Chip style={StyleShare.chip}>{item.level}</Chip>
                        <Chip style={StyleShare.chip}>{item.city}</Chip>
                        {item.skills.map((skill, index) => (
                            <Chip key={index} style={StyleShare.chip}>
                                {skill}
                            </Chip>
                        ))}
                    </View>
                    <View style={StyleShare.flexBetween}>
                        <View style={StyleShare.flexCenter}>
                            <Icon name="time" size={22} color={'grey'} style={{ marginRight: 5 }} />
                            <Text>{moment(item.endDate).format("DD/MM/YYYY")}</Text>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    };

    return (
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
            <ImageBackground
                source={require("../../assets/images/background.png")}
                style={styles.background}
            >
                <View style={{ flex: 1, marginHorizontal: 20 }}>
                    {/* Phần chào và avatar */}
                    <View style={[StyleShare.flexBetween, { marginTop: 40 }]}>
                        <View>
                            <Text style={[StyleShare.titleText16, { color: white, fontStyle:'italic' }]}>Chào bạn trở lại !</Text>
                        </View>
                        <View style={StyleShare.flexCenter}>
                            <TouchableOpacity onPress={() => navigation.navigate('Chat', { currentUserId: currentUser._id })}>
                                <Icon name="chatbubble-outline" color={white} size={24} style={{ marginRight: 10 }} />
                            </TouchableOpacity>
                            <Avatar.Image size={40} style={{ backgroundColor: 'white' }} />
                        </View>
                    </View>

                    {/* Nút tìm kiếm và bản đồ */}
                    <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <TouchableOpacity onPress={() => navigation.navigate('JobSearch')} style={StyleShare.searchHome}>
                            <Icon name="search" color={mainColor} size={24} style={{ marginRight: 10 }} />
                            <Text>Tìm kiếm việc làm</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.searchMap} onPress={() => navigation.navigate('JobNearBy')}>
                            <Icon name="map" size={20} color={white} />
                        </TouchableOpacity>
                    </View>
                </View>
            </ImageBackground>

            {/* Danh sách các gợi ý và việc làm hấp dẫn */}
            {/* {loading && <ActivityIndicator size="large" color={orange} style={{ marginTop: 20 }} />}
            <View>
                <View>
                    <View style={[StyleShare.flexBetween, { paddingHorizontal: 20, paddingTop: 20 }]}>
                        <Text style={StyleShare.titleText20}>Gợi ý việc làm</Text>
                        <TouchableOpacity style={StyleShare.titleText16} onPress={() => navigation.navigate("JobSuggestions", { title: "Gợi ý việc làm", api: "job_recommned" })}>
                            <Text style={StyleShare.lineText}>Xem tất cả</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={jobRecommend}
                        renderItem={renderItem}
                        keyExtractor={item => item._id}
                        contentContainerStyle={{ paddingBottom: 10 }}
                    />

                </View>
                <View>
                    <View style={[StyleShare.flexBetween, { paddingHorizontal: 20, paddingTop: 20 }]}>
                        <Text style={StyleShare.titleText20}>Việc làm hấp dẫn</Text>
                        <TouchableOpacity style={StyleShare.titleText16} onPress={() => navigation.navigate("JobSuggestions", { title: "Việc làm hấp dẫn", api: "job_salary" })}>
                            <Text style={StyleShare.lineText}>Xem tất cả</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View> */}

        </ScrollView>
    )
}

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
    },

    background: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
        height: 190
    },
    searchMap: {
        padding: 12,
        borderRadius: 10,
        backgroundColor: orange,
        elevation: 2
    },
});
