import React, { useEffect, useState } from "react";
import {
    View,
    Image,
    TouchableOpacity,
    Text,
    FlatList,
    TouchableWithoutFeedback,
    TextInput,
    Alert,
    StyleSheet,
} from "react-native";
import StyleShare from "../../assets/themes/StyleShare";
import UIHeader from "../../components/UIHeader";
import { Chip } from "react-native-paper";
import Icon from "react-native-vector-icons/Ionicons";
import Dropdown from "../../components/Dropdown";
import { bgButton2, green, grey, mainColor, orange, textColor, white } from "../../assets/themes/Color";
import moment from "moment";
import Loading from "../../components/Loading";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi, endpoints } from "../../assets/config/API";
import { ToastMess } from "../../components/ToastMess";
import Modal from "react-native-modal";
import Button from "../../components/Button";

export default function JobByCompany({ navigation, route }) {
    const { companyId } = route.params;
    const [jobData, setJobData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const [level, setLevel] = useState(null);
    const [salary, setSalary] = useState(null);
    const [jobType, setJobType] = useState(null);
    const [active, setActive] = useState(null);

    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchKeywork, setSearchKeywork] = useState("");
    const [isModalVisible, setModalVisible] = useState(false);
    const [isModalOption, setModalOption] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null); // Lưu job được chọn để hiển thị tùy chọn

    const activeData = [
        { title: "Tất cả", value: null },
        { title: "Hoạt động", value: true },
        { title: "Dừng hoạt động", value: false },
    ];

    const levelData = [
        { title: "Intern" },
        { title: "Fresher" },
        { title: "Junior" },
        { title: "Middle" },
        { title: "Senior" },
        { title: "Trưởng nhóm" },
        { title: "Trưởng phòng" },
        { title: "Director" },
    ];

    const salaryData = [
        { title: "Dưới 5 triệu" },
        { title: "10 - 15 triệu" },
        { title: "15 - 20 triệu" },
        { title: "20 - 25 triệu" },
        { title: "30 - 50 triệu" },
        { title: "Trên 50 triệu" },
        { title: "Thỏa thuận" },
    ];

    const jobTypeData = [
        { title: "Office" },
        { title: "Remote" },
        { title: "Hybrid" },
    ];

    useEffect(() => {
        fetchJobByCompany();
    }, []);

    const fetchJobByCompany = async (currentPage = 1, limit = 10) => {
        if (currentPage === 1) setLoading(true);
        else setLoadingMore(true);
        const searchQuery = searchKeywork ? `/${searchKeywork}/i` : "";
        try {
            const token = await AsyncStorage.getItem("access_token");
            const res = await authApi(token).get(endpoints["jobsByCompany"](companyId), {
                params: {
                    page: currentPage,
                    limit: limit,
                    name: searchQuery,
                    isActive: active,
                    level: level,
                    salary: salary,
                    jobType: jobType,
                },
            });
            const data = res.data.data;
            if (currentPage === 1) {
                setJobData(data.result);
            } else {
                setJobData((prev) => [...prev, ...data.result]);
            }
            setCurrentPage(data.meta.currentPage);
            setTotalPages(data.meta.totalPages);
            setTotalItems(data.meta.totalItems);
        } catch (error) {
            console.log("Error fetching jobs:", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleDeleteJob = async (jobId) => {
        Alert.alert(
            "Xóa tin tuyển dụng",
            "Tất cả hồ sơ ứng tuyển liên quan cũng bị xóa?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Đồng ý",
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem("access_token");
                            await authApi(token).delete(endpoints["jobDetail"](jobId));
                            ToastMess({ type: "success", text1: "Xóa tin tuyển dụng thành công" });
                            setJobData((prevJobs) => prevJobs.filter((job) => job._id !== jobId));
                            setTotalItems((prevTotalItems) => prevTotalItems - 1);
                        } catch (error) {
                            ToastMess({ type: "error", text1: "Có lỗi xảy ra, vui lòng thử lại" });
                            console.log(error);
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const handleUpdateActiveJob = async (jobId) => {
        Alert.alert(
            "Cập nhật trạng thái",
            "Xác nhận dừng tuyển dụng trước thời hạn với tin tuyển dụng này?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Đồng ý",
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem("access_token");
                            await authApi(token).patch(endpoints["jobDetail"](jobId), { isActive: false });
                            ToastMess({ type: "success", text1: "Cập nhật trạng thái thành công" });
                            setJobData((prevJobs) =>
                                prevJobs.map((job) => (job._id === jobId ? { ...job, isActive: false } : job))
                            );
                        } catch (error) {
                            ToastMess({ type: "error", text1: "Có lỗi xảy ra, vui lòng thử lại" });
                            console.log(error);
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const loadMoreJobs = () => {
        if (currentPage < totalPages && !loadingMore) {
            fetchJobByCompany(currentPage + 1);
        }
    };

    const applyFilters = () => {
        fetchJobByCompany(1, 10);
        setModalVisible(false);
    };

    const resetFilters = () => {
        setLevel(null);
        setSalary(null);
        setJobType(null);
        setActive(null);
        fetchJobByCompany(1, 10);
        setModalVisible(false);
    };

    const renderItem = ({ item }) => {
        return (
            <TouchableWithoutFeedback onPress={() => navigation.navigate("ResumeByJob", { jobId: item?._id })}>
                <View style={StyleShare.jobItemContainer}>
                    <View style={StyleShare.flexBetween}>
                        <View style={{ flex: 1 }}>
                            <Text style={StyleShare.titleText16} numberOfLines={2}>{item?.name}</Text>
                        </View>
                        <View style={StyleShare.flexCenter}>
                            <TouchableOpacity
                                style={{ zIndex: 999, marginLeft: 10 }}
                                onPress={() => {
                                    setSelectedJob(item); // Lưu job được chọn
                                    setModalOption(true); // Mở modal tùy chọn
                                }}
                            >
                                <Icon name="ellipsis-vertical" size={20} color={textColor} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={StyleShare.technologyContainer}>
                        <Chip style={StyleShare.chip}>{item?.city}</Chip>
                        <Chip style={StyleShare.chip}>{item?.level}</Chip>
                        {item?.skills?.map((s, index) => (
                            <Chip key={index} style={StyleShare.chip}>{s}</Chip>
                        ))}
                        {item?.isUrgent && (
                            <Chip style={[StyleShare.chip, { backgroundColor: "red" }]} textStyle={{ color: "white" }}>
                                GẤP
                            </Chip>
                        )}
                    </View>
                    <View style={StyleShare.flexBetween}>
                        <View style={StyleShare.flexBetween}>
                            <View style={StyleShare.flexCenter}>
                                <Icon name="time" size={22} color={"grey"} style={{ marginRight: 5 }} />
                                <Text>{moment(item?.endDate).format("DD/MM/YYYY")}</Text>
                            </View>
                        </View>
                        <View>
                            {item.isActive ? (
                                <Text style={[StyleShare.titleText16, { color: green }]}>Đang hoạt động</Text>
                            ) : (
                                <Text style={[StyleShare.titleText16, { color: "red" }]}>Hết hạn</Text>
                            )}
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    };

    return (
        <View style={StyleShare.container}>
            {/* Modal Bộ lọc */}
            <Modal
                isVisible={isModalVisible}
                onBackdropPress={() => setModalVisible(false)}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                backdropTransitionInTiming={500}
                backdropTransitionOutTiming={500}
                style={StyleShare.modalStyle}
            >
                <View style={StyleShare.modalContent}>
                    <View style={[StyleShare.flexBetween, { marginVertical: 15 }]}>
                        <Text style={StyleShare.titleText20}>Bộ lọc tuyển dụng</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Icon name="close" size={26} color={"red"} />
                        </TouchableOpacity>
                    </View>

                    <Text style={StyleShare.titleText16}>Trạng thái</Text>
                    <Dropdown
                        data={activeData}
                        onSelect={(item) => setActive(item.value)}
                        placeholder="Chọn trạng thái"
                        buttonStyle={{ marginTop: 10, width: "100%", height: 50, marginBottom: 20 }}
                    />

                    <Text style={StyleShare.titleText16}>Level</Text>
                    <Dropdown
                        data={levelData}
                        onSelect={(item) => setLevel(item.title)}
                        placeholder="Chọn Level"
                        buttonStyle={{ marginTop: 10, width: "100%", height: 50, marginBottom: 20 }}
                    />

                    <Text style={StyleShare.titleText16}>Mức lương</Text>
                    <Dropdown
                        data={salaryData}
                        onSelect={(item) => setSalary(item.title)}
                        placeholder="Chọn mức lương"
                        buttonStyle={{ marginTop: 10, width: "100%", height: 50, marginBottom: 20 }}
                    />

                    <Text style={StyleShare.titleText16}>Loại hình</Text>
                    <Dropdown
                        data={jobTypeData}
                        onSelect={(item) => setJobType(item.title)}
                        placeholder="Chọn loại hình"
                        buttonStyle={{ marginTop: 10, width: "100%", height: 50, marginBottom: 20 }}
                    />

                    <Button title={"Áp dụng"} backgroundColor={mainColor} textColor={white} onPress={applyFilters} />
                    <Button
                        title={"Đặt lại"}
                        backgroundColor={bgButton2}
                        textColor={"black"}
                        onPress={resetFilters}
                        style={{ marginTop: 10 }}
                    />
                </View>
            </Modal>

            {/* Modal Tùy chọn */}
            <Modal
                isVisible={isModalOption}
                onBackdropPress={() => setModalOption(false)}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                backdropTransitionInTiming={500}
                backdropTransitionOutTiming={500}
                style={StyleShare.modalStyle}
            >
                <View style={styles.modalContent}>
                    <View style={[StyleShare.flexBetween, { marginVertical: 15 }]}>
                        <Text style={StyleShare.titleText20}>Tùy chọn</Text>
                        <TouchableOpacity onPress={() => setModalOption(false)}>
                            <Icon name="close" size={26} color={"red"} />
                        </TouchableOpacity>
                    </View>
                    {selectedJob?.isActive && ( // Chỉ hiển thị nếu job đang hoạt động
                        <TouchableOpacity
                            style={styles.optionItem}
                            onPress={() => {
                                if (selectedJob) {
                                    handleUpdateActiveJob(selectedJob._id);
                                    setModalOption(false);
                                }
                            }}
                        >
                            <Icon name="pause-circle-outline" size={20} color={textColor} />
                            <Text style={styles.optionText}>Dừng tuyển dụng</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={styles.optionItem}
                        onPress={() => {
                            if (selectedJob) {
                                navigation.navigate("EditJob", { jobId: selectedJob._id });
                                setModalOption(false);
                            }
                        }}
                    >
                        <Icon name="pencil-outline" size={20} color={textColor} />
                        <Text style={styles.optionText}>Chỉnh sửa tin tuyển dụng</Text>
                    </TouchableOpacity>



                    <TouchableOpacity
                        style={styles.optionItem}
                        onPress={() => {
                            if (selectedJob) {
                                handleDeleteJob(selectedJob._id);
                                setModalOption(false);
                            }
                        }}
                    >
                        <Icon name="trash-outline" size={20} color="red" />
                        <Text style={[styles.optionText, { color: "red" }]}>Xóa tin tuyển dụng</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            <UIHeader
                leftIcon={"arrow-back"}
                title={"Chiến dịch tuyển dụng"}
                rightIcon={"options"}
                handleRightIcon={() => setModalVisible(true)}
                handleLeftIcon={() => navigation.goBack()}
            />
            <View style={{ paddingHorizontal: 20, marginBottom: 5 }}>
                <View style={StyleShare.searchDetail}>
                    <Icon name="search" color={mainColor} size={24} style={{ marginRight: 10 }} />
                    <TextInput
                        style={StyleShare.searchInput}
                        placeholder="Tìm kiếm tin tuyển dụng..."
                        value={searchKeywork}
                        onChangeText={(text) => setSearchKeywork(text)}
                        onSubmitEditing={() => fetchJobByCompany(1, 10)}
                    />
                </View>
                <View style={{ marginTop: 10 }}>
                    <Text style={StyleShare.titleText16}>{totalItems} việc làm</Text>
                </View>
            </View>
            {loading ? (
                <Loading />
            ) : (
                <FlatList
                    data={jobData}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 15 }}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    ListEmptyComponent={
                        <View style={{ marginTop: 50, alignItems: "center" }}>
                            <Image source={require("../../assets/images/save.png")} style={StyleShare.imageNullData} />
                            <Text style={StyleShare.titleText20}>Chưa có tin tuyển dụng</Text>
                            <Text style={{ padding: 20, textAlign: "center" }}>
                                Công ty chưa có tin tuyển dụng nào, hãy thêm tin để bắt đầu tuyển dụng.
                            </Text>
                        </View>
                    }
                    onEndReached={loadMoreJobs}
                    onEndReachedThreshold={0.7}
                    ListFooterComponent={loadingMore ? <Loading /> : null}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    modalContent: {
        backgroundColor: white,
        padding: 20,
        borderTopLeftRadius: 10,   // Bo góc phía trên
        borderTopRightRadius: 10,  // Bo góc phía trên
    },
    optionItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: grey,
    },
    optionText: {
        marginLeft: 15,
        color: textColor,
        fontSize: 16,
    },
});