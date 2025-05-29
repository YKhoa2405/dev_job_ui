import React, { useState, useEffect } from "react";
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from "react-native";
import { Checkbox } from "react-native-paper";
import StyleShare from "../../assets/themes/StyleShare";
import { mainColor, white, grey, orange } from "../../assets/themes/Color";
import UIHeader from "../../components/UIHeader";
import Button from "../../components/Button";
import Dropdown from "../../components/Dropdown";
import DropDownPicker from "react-native-dropdown-picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useDispatch, useSelector } from "react-redux";
import { fetchJobDetail } from "../../redux/slice/jobSlice";
import API, { authApi, endpoints } from "../../assets/config/API";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ToastMess } from "../../components/ToastMess";

export default function EditJob({ navigation, route }) {
    const { jobId } = route.params || {};
    const dispatch = useDispatch();
    const job = useSelector((state) => state.job.jobDetail);
    const [fetching, setFetching] = useState(true);

    // State
    const [name, setName] = useState("");
    const [street, setStreet] = useState("");
    const [salary, setSalary] = useState("");
    const [level, setLevel] = useState("");
    const [jobType, setJobType] = useState("");
    const [quantity, setQuantity] = useState(0);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [open, setOpen] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [dateType, setDateType] = useState("");
    const [description, setDescription] = useState("");
    const [requirement, setRequirement] = useState("");
    const [prioritize, setPrioritize] = useState("");
    const [isUrgent, setIsUrgent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [skills, setSkills] = useState([]);

    // Dropdown data
    const salaryData = [
        { title: "Dưới 5 triệu" },
        { title: "10 - 15 triệu" },
        { title: "15 - 20 triệu" },
        { title: "20 - 25 triệu" },
        { title: "30 - 50 triệu" },
        { title: "Trên 50 triệu" },
        { title: "Thỏa thuận" },
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

    const jobTypeData = [
        { title: "Office" },
        { title: "Remote" },
        { title: "Hybrid" },
    ];

    // Fetch data on mount
    useEffect(() => {
        if (jobId) {
            setFetching(true);
            dispatch(fetchJobDetail(jobId)).finally(() => setFetching(false));
        }
        fetchSkills();
    }, [jobId, dispatch]);

    // Sync state with job detail
    useEffect(() => {
        if (job) {
            setName(job.name || "");
            setStreet(job.location || "");
            setSalary(job.salary || "");
            setLevel(job.level || "");
            setJobType(job.jobType || "");
            setQuantity(job.quantity || 0);
            setSelectedSkills(job.skills || []);
            setStartDate(job.startDate ? new Date(job.startDate) : null);
            setEndDate(job.endDate ? new Date(job.endDate) : null);
            setDescription(job.description || "");
            setRequirement(job.requirement || "");
            setPrioritize(job.prioritize || "");
            setIsUrgent(job.isUrgent || false);
        }
    }, [job]);

    // Fetch skills
    const fetchSkills = async () => {
        try {
            const res = await API.get(endpoints["skills"], {
                params: { page: 1, limit: 100 },
            });
            const formattedSkills = res.data.data.result.map((skill) => ({
                label: skill.name,
                value: skill.name,
            }));
            setSkills(formattedSkills);
        } catch (error) {
            console.log("Error fetching skills:", error);
        }
    };

    // DatePicker handlers
    const showDatePicker = (type) => {
        setDateType(type);
        setDatePickerVisibility(true);
    };
    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };
    const handleConfirm = (date) => {
        if (dateType === "start") setStartDate(date);
        else if (dateType === "end") setEndDate(date);
        hideDatePicker();
    };

    // Save handler
    const handleSaveJob = async () => {
        if (!name || !description || !requirement || !startDate || !endDate || !street || !salary || !level || !jobType || !quantity || !selectedSkills || !prioritize) {
            ToastMess({ type: "error", text1: "Vui lòng điền đầy đủ các trường bắt buộc" });
            return;
        }
        if (startDate >= endDate) {
            ToastMess({ type: 'error', text1: 'Thời gian không hợp lệ.' });
            return;
        }

        Alert.alert(
            "Xác nhận",
            "Bạn có chắc chắn muốn lưu thay đổi?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Lưu",
                    onPress: async () => {
                        setLoading(true);
                        try {
                            const token = await AsyncStorage.getItem("access_token");
                            if (!token) {
                                ToastMess({ type: "error", text1: "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại" });
                                navigation.navigate("Login");
                                return;
                            }

                            const updateJobDto = {
                                name,
                                location: street,
                                salary,
                                level,
                                jobType,
                                quantity,
                                skills: selectedSkills,
                                startDate: startDate ? startDate.toISOString() : null,
                                endDate: endDate ? endDate.toISOString() : null,
                                description,
                                requirement,
                                prioritize,
                                isUrgent,
                            };

                            const res = await authApi(token).patch(endpoints["jobDetail"](jobId), updateJobDto);
                            if (res.status === 200) {
                                ToastMess({ type: "success", text1: "Cập nhật thành công" });
                            }
                        } catch (error) {
                            console.error("Lỗi khi cập nhật job:", error.response?.data || error.message);
                            ToastMess({
                                type: "error",
                                text1: error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại",
                            });
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={StyleShare.container}>
            <UIHeader
                leftIcon={"arrow-back"}
                title={"Chỉnh sửa tin tuyển dụng"}
                handleLeftIcon={() => navigation.goBack()}
            />
            {fetching ? (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size="large" color={orange} />
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
                    <View style={styles.containerMain}>
                        {/* Job Title */}
                        <Text style={[StyleShare.titleText16, { marginBottom: 5 }]}>Tiêu đề</Text>
                        <TextInput
                            placeholder="Tiêu đề tin tuyển dụng..."
                            onChangeText={setName}
                            value={name}
                            style={styles.introduceInput}
                        />

                        {/* Location */}
                        <Text style={styles.textInput}>Địa điểm làm việc</Text>
                        <TextInput
                            style={[styles.introduceInput, { marginTop: 10 }]}
                            placeholder="Tên đường, số công ty, vị trí cụ thể ..."
                            onChangeText={setStreet}
                            value={street}
                            multiline={true}
                        />

                        {/* Salary and Level */}
                        <View style={StyleShare.flexBetween}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.textInput}>Mức lương</Text>
                                <Dropdown
                                    data={salaryData}
                                    onSelect={(item) => setSalary(item.title)}
                                    placeholder="Chọn mức lương"
                                    buttonStyle={{ height: 50 }}
                                    defaultValue={salary}
                                />
                            </View>
                            <View style={{ flex: 1, marginLeft: 20 }}>
                                <Text style={styles.textInput}>Level</Text>
                                <Dropdown
                                    data={levelData}
                                    onSelect={(item) => setLevel(item.title)}
                                    placeholder="Chọn level"
                                    buttonStyle={{ height: 50 }}
                                    defaultValue={level}
                                />
                            </View>
                        </View>

                        {/* Job Type and Quantity */}
                        <View style={StyleShare.flexBetween}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.textInput}>Loại hình</Text>
                                <Dropdown
                                    data={jobTypeData}
                                    onSelect={(item) => setJobType(item.title)}
                                    placeholder="Chọn loại hình"
                                    buttonStyle={{ height: 50 }}
                                    defaultValue={jobType}
                                />
                            </View>
                            <View style={{ flex: 1, marginLeft: 20 }}>
                                <Text style={styles.textInput}>Số lượng tuyển</Text>
                                <TextInput
                                    style={styles.introduceInput}
                                    placeholder="Số lượng tuyển..."
                                    keyboardType="numeric"
                                    maxLength={5}
                                    onChangeText={(text) => {
                                        const numericValue = text.replace(/[^0-9]/g, "");
                                        setQuantity(numericValue ? parseInt(numericValue) : 0);
                                    }}
                                    value={quantity ? String(quantity) : ""}
                                />
                            </View>
                        </View>

                        {/* Skills */}
                        <Text style={styles.textInput}>Kĩ năng</Text>
                        <DropDownPicker
                            open={open}
                            value={selectedSkills}
                            items={skills}
                            setOpen={setOpen}
                            setValue={setSelectedSkills}
                            setItems={setSkills}
                            multiple={true}
                            min={0}
                            max={10}
                            placeholder="Chọn kỹ năng"
                            mode="BADGE"
                            badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a"]}
                            listMode="SCROLLVIEW"
                            searchable={true} // Kích hoạt thanh tìm kiếm
                            searchPlaceholder="Tìm kiếm kỹ năng..." // Văn bản placeholder cho thanh tìm kiếm
                            style={{
                                borderWidth: 0,
                                borderRadius: 10,
                                backgroundColor: white, // Đồng bộ với kiểu của các input khác
                            }}
                            dropDownContainerStyle={{
                                backgroundColor: white,
                                borderWidth: 1,
                                borderColor: grey,
                                borderRadius: 10,
                                maxHeight: 200,
                            }}

                            textStyle={{ fontWeight: "500" }}
                        />

                        {/* Start and End Date */}
                        <View style={StyleShare.flexBetween}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.textInput}>Ngày bắt đầu</Text>
                                <TouchableOpacity
                                    style={styles.introduceInput}
                                    onPress={() => showDatePicker("start")}
                                >
                                    <Text style={{ fontWeight: "500" }}>
                                        {startDate
                                            ? `${startDate.getDate().toString().padStart(2, '0')}/${(startDate.getMonth() + 1)
                                                .toString()
                                                .padStart(2, '0')}/${startDate.getFullYear()}`
                                            : "Chọn ngày bắt đầu"}
                                    </Text>
                                </TouchableOpacity>

                            </View>
                            <View style={{ flex: 1, marginLeft: 20 }}>
                                <Text style={styles.textInput}>Ngày kết thúc</Text>
                                <TouchableOpacity
                                    style={styles.introduceInput}
                                    onPress={() => showDatePicker("end")}
                                >
                                    <Text style={{ fontWeight: "500" }}>
                                        {endDate
                                            ? `${endDate.getDate().toString().padStart(2, '0')}/${(endDate.getMonth() + 1)
                                                .toString()
                                                .padStart(2, '0')}/${endDate.getFullYear()}`
                                            : "Chọn ngày kết thúc"}
                                    </Text>
                                </TouchableOpacity>

                            </View>
                        </View>
                        <DateTimePickerModal
                            isVisible={isDatePickerVisible}
                            mode="date"
                            onConfirm={handleConfirm}
                            onCancel={hideDatePicker}
                        />

                        {/* Description */}
                        <View style={[StyleShare.flexBetween, { marginTop: 20, marginBottom: 10 }]}>
                            <Text style={{ color: mainColor, fontWeight: "bold" }}>Mô tả</Text>
                        </View>
                        <TextInput
                            style={styles.introduceInput}
                            placeholder="Mô tả về công việc ..."
                            onChangeText={setDescription}
                            value={description}
                            multiline={true}
                            numberOfLines={10}
                            textAlignVertical="top"
                        />

                        {/* Requirements */}
                        <View style={[StyleShare.flexBetween, { marginTop: 20, marginBottom: 10 }]}>
                            <Text style={{ color: mainColor, fontWeight: "bold" }}>Yêu cầu ứng viên</Text>
                        </View>
                        <TextInput
                            style={styles.introduceInput}
                            placeholder="Yêu cầu công việc dành cho ứng viên ..."
                            onChangeText={setRequirement}
                            value={requirement}
                            multiline={true}
                            numberOfLines={15}
                            textAlignVertical="top"
                        />

                        {/* Priority */}
                        <Text style={styles.textInput}>Ưu tiên</Text>
                        <TextInput
                            style={styles.introduceInput}
                            placeholder="Ưu tiên tuyển dụng ..."
                            onChangeText={setPrioritize}
                            value={prioritize}
                            multiline={true}
                            numberOfLines={15}
                            textAlignVertical="top"
                        />

                        {/* Urgent Checkbox */}
                        <View style={[StyleShare.flexBetween, { marginTop: 10 }]}>
                            <Text style={{ fontWeight: "bold", color: mainColor }}>
                                Đánh dấu tin tuyển dụng "Gấp"
                            </Text>
                            <Checkbox
                                status={isUrgent ? "checked" : "unchecked"}
                                onPress={() => setIsUrgent(!isUrgent)}
                                color={mainColor}
                            />
                        </View>

                        {/* Save Button */}
                        <View style={{ marginTop: 20 }}>
                            {loading ? (
                                <ActivityIndicator color={orange} size="large" />
                            ) : (
                                <Button
                                    title="Lưu"
                                    backgroundColor={mainColor}
                                    textColor={white}
                                    onPress={handleSaveJob}
                                />
                            )}
                        </View>
                    </View>
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    containerMain: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    textInput: {
        ...StyleShare.titleText16,
        marginTop: 15,
        marginBottom: 5,
    },
    introduceInput: {
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 15,
        backgroundColor: white,
    },
});