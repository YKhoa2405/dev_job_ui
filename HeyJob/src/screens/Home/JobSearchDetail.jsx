import React, { useContext, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TouchableWithoutFeedback, Image, ActivityIndicator } from "react-native";
import styleShare from "../../assets/theme/style";
import Icon from "react-native-vector-icons/Ionicons"
import { bgButton1, bgButton2, grey, orange, white } from "../../assets/theme/color";
import { Searchbar, Chip, Avatar } from "react-native-paper";
import { authApi, endpoints } from "../../config/API";
import axios from "axios";
import MyContext from "../../config/MyContext";
import ReusableModal from "../../components/ReusableModal ";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";

export default function JobSearchDetail({ navigation, route }) {

    const [loading, setLoading] = useState(false);
    const { searchContent } = route.params
    const [user, dispatch] = useContext(MyContext)
    const [province, setProvince] = useState("")
    const [selectExperience, setSelectExperience] = useState(user.seeker.experience)
    const [selectedProvince, setSelectedProvince] = useState(user.seeker.location);
    const [selectedSalary, setSelectedSalary] = useState('')

    const salaries = ['Dưới 5 triệu', '10 - 15  triệu', '15 - 20 triệu', '20 - 25 triệu', '25 - 30 triệu', '30 - 50 triệu', 'Trên 50 triệu', 'Thỏa thuận'];
    const experiences = ['Không yêu cầu', 'Thực tập sinh', 'Dưới 1 năm', '1 năm', '2 năm', '3 năm', '4 năm', '5 năm', 'Trên 5 năm'];
    const [modalVisible, setModalVisible] = useState({
        salary: false,
        // technology: false,
        experience: false,
        location: false
    });
    const buildSearchUrl = (searchContent, experience, location, salary) => {
        return `/jobs/search/?title=${encodeURIComponent(searchContent || '')}&experience=${encodeURIComponent(experience || '')}&location=${encodeURIComponent(location || '')}&salary=${encodeURIComponent(salary || '')}`;
    };

    const searchUrl = buildSearchUrl(searchContent, selectExperience, selectedProvince, selectedSalary);
    const [recentJobs, setRecentJobs] = useState([]);


    useEffect(() => {
        fetchSearchJob();
    }, [searchContent, selectedProvince, selectExperience, selectedSalary]);

    useEffect(() => {
        fetchProvince();
    }, []);


    const fetchProvince = async () => {
        const res = await axios.get('https://esgoo.net/api-tinhthanh/1/0.htm')
        const data = res.data.data;
        const fullNames = data.map(item => item.full_name);
        setProvince(fullNames)
    }

    const fetchSearchJob = async () => {
        const token = await AsyncStorage.getItem("access-token");
        try {
            setLoading(true);
            // const response = await authApi(token).get(endpoints['search_job'], {
            //     params: {
            //         title: searchContent,
            //         location: selectedProvince,
            //         experience: selectExperience,
            //         salary: selectedSalary
            //     }
            // });
            const response = await authApi(token).get(searchUrl);
            console.log(searchUrl)
            setRecentJobs(response.data);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProvinceSelect = (province) => {
        setSelectedProvince(province);
        setModalVisible({ ...modalVisible, location: false });
    };
    const handleSalarySelect = (salary) => {
        setSelectedSalary(salary);
        setModalVisible({ ...modalVisible, salary: false });
    };
    const handleExperienceSelect = (experience) => {
        setSelectExperience(experience);
        setModalVisible({ ...modalVisible, experience: false });
    };

    const renderSearchJobItem = ({ item }) => (
        <TouchableWithoutFeedback key={item.id} onPress={() => { navigation.navigate('JobDetail', { jobId: item.id }) }}>
            <View style={styles.jobItemContainer}>
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
    );

    if (loading) {
        return <ActivityIndicator style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} size="large" color='orange' />;
    }


    return (
        <View style={[styleShare.container, { marginHorizontal: 20 }]}>
            <View style={styles.containerTop}>
                <Icon name="arrow-back" size={26} color={bgButton1} onPress={() => navigation.goBack()} />
                <TouchableOpacity style={[styleShare.flexCenter, { marginLeft: 10 }]} onPress={() => setModalVisible({ ...modalVisible, location: true })}>
                    <Icon name="location" size={20} color={orange} onPress={() => navigation.goBack()} />
                    <Text style={styles.textLocation}>{selectedProvince ? selectedProvince : user.seeker.location}</Text>
                    <Icon name="chevron-down-outline" size={20} color={orange} />
                </TouchableOpacity>
            </View>
            <View style={styles.containerMain}>
                <TouchableOpacity onPress={() => navigation.navigate('JobSearch')} style={styles.searchDetail}>
                    <Icon name="search" color={bgButton1} size={24} style={{ marginRight: 10 }} />
                    <Text>{searchContent}</Text>
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
                    <TouchableOpacity style={styles.optionSearch} onPress={() => setModalVisible({ ...modalVisible, experience: true })}>
                        <Text>{selectExperience ? selectExperience : 'Kinh nghiệm'}</Text>
                        <Icon name="chevron-down-outline" size={20} color={orange} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.optionSearch} onPress={() => setModalVisible({ ...modalVisible, salary: true })}>
                        <Text>{selectedSalary ? selectedSalary : 'Chọn mức lương'}</Text>
                        <Icon name="chevron-down-outline" size={20} color={orange} />
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={recentJobs}
                    renderItem={renderSearchJobItem}
                    keyExtractor={item => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                    style={styles.containerflat}
                    ListEmptyComponent={
                        <View style={{ marginTop: 50, alignItems: 'center' }}>
                            <Image source={require("../../assets/images/save.png")} style={styleShare.imageNullData} />
                            <Text style={styleShare.textMainOption}>Không có kết qủa tìm kiếm</Text>
                            <Text style={{ padding: 20, textAlign: 'center' }}>Bạn hãy thử thay đổi từ khóa hoặc loại bỏ bớt tiêu chí lọc và thử lại </Text>
                        </View>
                    }
                />
            </View>
            <ReusableModal
                visible={modalVisible.location}
                onClose={() => setModalVisible({ ...modalVisible, location: false })}
                title="Chọn nơi làm việc mong muốn"
                data={province}
                selectedItems={selectedProvince ? [selectedProvince] : []}
                onItemPress={handleProvinceSelect}
                onComplete={() => {
                    setModalVisible({ ...modalVisible, location: false });
                    fetchSearchJob()
                }}
                singleSelect={true}
            />
            <ReusableModal
                visible={modalVisible.salary}
                onClose={() => setModalVisible({ ...modalVisible, salary: false })}
                title="Chọn nơi làm việc mong muốn"
                data={salaries}
                selectedItems={selectedSalary ? [selectedSalary] : []}
                onItemPress={handleSalarySelect}
                onComplete={() => {
                    setModalVisible({ ...modalVisible, salary: false });
                    fetchSearchJob()
                }}
                singleSelect={true}
            />
            <ReusableModal
                visible={modalVisible.experience}
                onClose={() => setModalVisible({ ...modalVisible, experience: false })}
                title="Chọn Kinh nghiệm"
                data={experiences} // Example data
                selectedItems={selectExperience ? [selectExperience] : []}
                onItemPress={handleExperienceSelect} // Gọi hàm khi chọn item
                onComplete={() => {
                    setModalVisible({ ...modalVisible, experience: false });
                    fetchSearchJob()
                }} // Đóng modal và thực hiện tìm kiếm
                singleSelect={true}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    recentSearchItem: {
        paddingVertical: 15,
        flexDirection: 'row',
        alignItems: 'center'
    },
    jobTitle: {
        marginLeft: 10
    }, containerTop: {
        flexDirection: 'row',
        marginTop: 30,
        marginBottom: 10,
        alignItems: 'center'
    },
    textLocation: {
        fontWeight: '500',
        marginHorizontal: 5
    },
    optionSearch: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 5,
        marginRight: 10,
        borderRadius: 20,
        backgroundColor: white,
        justifyContent: 'flex-start',
        elevation: 3
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
    infoJobContainer: {
        paddingTop: 20,
        paddingRight: 10,
        flexDirection: 'row',
        justifyContent: 'center'
    },
    containerflat: {
        paddingTop: 10,
        paddingBottom: 20
    },
    searchDetail: {
        flexDirection: 'row',
        backgroundColor: white,
        width: '100%',
        borderRadius: 10, padding: 10,
        alignItems: 'center',
        elevation: 2,
        marginBottom: 10
    }
})