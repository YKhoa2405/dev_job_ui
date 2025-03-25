import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Image,
    FlatList,
    TouchableWithoutFeedback,
    ScrollView,
    ActivityIndicator,
    ImageBackground,
    Dimensions,
} from 'react-native';
import StyleShare from '../../assets/themes/StyleShare';
import { bgButton2, mainColor, white, orange, textColor } from '../../assets/themes/Color';
import { Avatar, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import API, { authApi, endpoints } from '../../assets/config/API';
import moment from 'moment';
import { fetchPrimaryCvByUser } from '../../redux/slice/cvSLice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ToastMess } from '../../components/ToastMess';
import axios from 'axios';
import Loading from '../../components/Loading';

const { width } = Dimensions.get('window');
export default function HomeClient({ navigation }) {

    const dispatch = useDispatch();
    const { primaryCv, primaryStatus } = useSelector((state) => state.cv);
    const currentUser = useSelector((state) => state.user.user);
    const [loading, setLoading] = useState(true);
    const [jobRecommendList, setJobRecommendList] = useState([]);
    const [jobUrgentList, setJobUrgentList] = useState([]);


    // Dữ liệu mẫu (8 item cho mỗi danh sách)
    const jobRecommend = [
        { _id: '1', name: 'Nhân Viên Chăm Sóc Khách Hàng (Admission Officer)', company: 'Trung Tâm Anh Ngữ ILA', salary: '8-10 triệu', city: 'Hà Nội', endDate: '2025-04-01', logo: 'https://via.placeholder.com/50' },
        { _id: '2', name: 'Chuyên Viên Marketing - Advertising', company: 'Công Ty Cổ Phần Đông Tây MB', salary: '10-15 triệu', city: 'Hà Nội', endDate: '2025-05-01', logo: 'https://via.placeholder.com/50' },
        { _id: '3', name: 'Leader Content Marketing (Lương 12-18 Triệu)', company: 'Công Ty TNHH Hồng Lam Nghiêp', salary: '12-18 triệu', city: 'Hà Nội', endDate: '2025-06-01', logo: 'https://via.placeholder.com/50' },
        { _id: '4', name: 'Nhân Viên Kinh Doanh/Nhân Viên Tư Vấn', company: 'Công Ty TNHH Thương Mại PAND', salary: '10-20 triệu', city: 'Hà Nội', endDate: '2025-07-01', logo: 'https://via.placeholder.com/50' },
        { _id: '5', name: 'Chuyên Viên AI', company: 'VinAI', salary: '30-40 triệu', city: 'Hà Nội', endDate: '2025-08-01', logo: 'https://via.placeholder.com/50' },
        { _id: '6', name: 'Lập trình viên Fullstack', company: 'Tiki', salary: '25-35 triệu', city: 'Remote', endDate: '2025-09-01', logo: 'https://via.placeholder.com/50' },
        { _id: '7', name: 'Kỹ sư Blockchain', company: 'Axon', salary: '35-45 triệu', city: 'TP.HCM', endDate: '2025-10-01', logo: 'https://via.placeholder.com/50' },
        { _id: '8', name: 'Chuyên viên Data', company: 'FPT', salary: '20-30 triệu', city: 'Hà Nội', endDate: '2025-11-01', logo: 'https://via.placeholder.com/50' },
    ];

    // useEffect(() => {
    //     if (currentUser?._id) {
    //         dispatch(fetchPrimaryCvByUser(currentUser._id));
    //     }
    // }, [dispatch, currentUser]);
    // console.log(primaryStatus)
    // useEffect(() => {
    //     if (primaryStatus === 'succeeded' && primaryCv?.processedText) {
    //         fetchRecommendedJobs(primaryCv.processedText);
    //     }
    // }, [primaryStatus, primaryCv]);

    useEffect(() => {
        fetchJobUrgent();
    }, []);

    const fetchJobUrgent = async () => {
        setLoading(true)
        try {
            const token = await AsyncStorage.getItem("access_token");
            const res = await authApi(token).get(endpoints['jobs'], {
                params: {
                    page: 1,
                    limit: 9,
                    isUrgent: true
                }
            });
            console.log(res.data.data.result)
            setJobUrgentList(res.data.data.result || []); // Đảm bảo luôn là mảng
        } catch (error) {
            console.log('Lỗi khi lấy gợi ý việc làm:', error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };


    const fetchRecommendedJobs = async (text) => {
        if (!text || typeof text !== 'string') {
            console.log('Dữ liệu đầu vào không hợp lệ:', text);
            setLoading(false);
            return;
        }

        setLoading(true);
        const payload = { text }; // Đóng gói thành { text: text }
        console.log('Gửi dữ liệu:', payload);
        try {
            const res = await API.post(endpoints['recommend'], payload, {
                headers: { 'Content-Type': 'application/json' },
            });
            setJobRecommendList(res.data.recommendations || []); // Đảm bảo luôn là mảng
            console.log('Danh sách việc làm gợi ý:', res.data.recommendations);
        } catch (error) {
            console.log('Lỗi khi lấy gợi ý việc làm:', error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    // Chia danh sách thành các trang (mỗi trang 4 item)
    const chunkArray = (array, chunkSize) => {
        const result = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            result.push(array.slice(i, i + chunkSize));
        }
        return result;
    };

    const jobRecommendPages = chunkArray(jobRecommendList, 3);
    const jobUgrentPages = chunkArray(jobUrgentList, 3);

    const renderItem = ({ item }) => (
        <TouchableWithoutFeedback onPress={() => navigation.navigate('JobDetail', { jobId: item._id })}>
            <View style={[StyleShare.jobItemContainer]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Avatar.Image
                        size={50}
                        source={{ uri: item?.companyId.logo || 'https://via.placeholder.com/60' }}
                        style={{ backgroundColor: 'white' }}
                    />
                    <View style={{ marginLeft: 10, flex: 1 }}>
                        <Text style={StyleShare.titleText16} numberOfLines={2}>
                            {item?.name}
                        </Text>
                        <Text style={{ marginTop: 5, color: textColor }}>{item?.companyId.name}</Text>
                    </View>
                </View>

                <View style={StyleShare.technologyContainer}>
                    <Chip style={StyleShare.chip}>{item?.level}</Chip>
                    <Chip style={StyleShare.chip}>{item?.salary}</Chip>

                    {item.isUrgent && (
                        <Chip style={[StyleShare.chip, { backgroundColor: 'red' }]} textStyle={{ color: 'white' }}>
                            GẤP
                        </Chip>
                    )}
                </View>

                <View style={StyleShare.flexBetween}>
                    <View style={StyleShare.flexCenter}>
                        <Icon name="time" size={20} color={textColor} style={{ marginRight: 5 }} />
                        <Text style={{ color: textColor }}>
                            {moment(item.endDate).fromNow()}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );

    const renderPage = ({ item }) => (
        <View style={styles.pageContainer}>
            <FlatList
                data={item}
                renderItem={renderItem}
                keyExtractor={(job) => job._id}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );

    return (
        <ScrollView
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
        >
            <ImageBackground
                source={require('../../assets/images/background.png')}
                style={styles.background}
            >
                <View style={{ flex: 1, marginHorizontal: 20 }}>
                    <View style={[StyleShare.flexBetween, { marginTop: 40 }]}>
                        <View>
                            <Text style={[StyleShare.titleText16, { color: white, fontStyle: 'italic' }]}>
                                Chào bạn trở lại!
                            </Text>
                        </View>
                        <View style={StyleShare.flexCenter}>
                            <TouchableOpacity onPress={() => navigation.navigate('Chat', { currentUserId: currentUser?._id })}>
                                <Icon name='chatbubble' color={white} size={24} style={{ marginRight: 10 }} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <TouchableOpacity onPress={() => navigation.navigate('JobSearch')} style={StyleShare.searchHome}>
                            <Icon name='search' color={mainColor} size={24} style={{ marginRight: 10 }} />
                            <Text>Tìm kiếm việc làm</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.searchMap} onPress={() => navigation.navigate('JobNearBy')}>
                            <Icon name='map' size={20} color={white} />
                        </TouchableOpacity>
                    </View>
                </View>
            </ImageBackground>
            {loading ? (
                <Loading/>
            ) : (
                <View>
                    {/* Gợi ý việc làm */}
                    <View style={{ marginTop: 20 }}>
                        <View style={[StyleShare.flexBetween, { marginHorizontal: 20 }]}>
                            <Text style={StyleShare.titleText20}>Việc làm Gấp</Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('JobSuggestions', { title: 'Việc làm gấp', api: 'jobs' })}
                            >
                                <Text style={StyleShare.lineText}>Xem tất cả</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={jobUgrentPages}
                            renderItem={renderPage}
                            keyExtractor={(page, index) => `page-${index}`}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            snapToInterval={width}
                            decelerationRate='fast'
                            pagingEnabled

                        />
                    </View>

                    {/* Việc làm hấp dẫn */}
                    <View style={{ marginTop: 30 }}>
                        <View style={[StyleShare.flexBetween, { marginHorizontal: 20 }]}>
                            <Text style={StyleShare.titleText20}>Gợi ý việc làm</Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('JobSuggestions', { title: 'Gợi ý việc làm', api: 'job_recommend' })}
                            >
                                <Text style={StyleShare.lineText}>Xem tất cả</Text>
                            </TouchableOpacity>
                        </View>
                        {/* <FlatList
                        data={jobUgrentPages}
                        renderItem={renderPage}
                        keyExtractor={(page, index) => `page-${index}`}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        snapToInterval={width}
                        decelerationRate='fast'
                        pagingEnabled
    
                    /> */}
                    </View>
                </View>
            )}

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
        height: 190,
    },
    searchMap: {
        padding: 12,
        borderRadius: 10,
        backgroundColor: orange,
        elevation: 2,
    },
    pageContainer: {
        width: width, // Mỗi trang chiếm toàn bộ chiều ngang màn hình
    },
});

