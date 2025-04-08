import React, { useState, useEffect } from "react";
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Image,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import StyleShare from "../../assets/themes/StyleShare";
import { mainColor, bgButton2, grey, textColor, white, orange } from "../../assets/themes/Color";
import UIHeader from "../../components/UIHeader";
import Icon from "react-native-vector-icons/Ionicons";
import { fetchCompanyByUser } from "../../redux/slice/companySlice";
import Button from "../../components/Button";
import Loading from "../../components/Loading";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi, endpoints } from "../../assets/config/API";
import { ToastMess } from "../../components/ToastMess";
import Dropdown from "../../components/Dropdown";
import * as ImagePicker from "expo-image-picker"; // Thêm expo-image-picker

export default function EditCompany({ navigation }) {
    const dispatch = useDispatch();
    const { companyByUser, loading } = useSelector((state) => state.company);

    const sizeData = [
        { title: "100 - 199" },
        { title: "200 - 299" },
        { title: "300 - 399" },
        { title: "400 - 499" },
        { title: "500+" },
        { title: "1000+" },
    ];

    const [formData, setFormData] = useState({
        name: "",
        slogan: "",
        about: "",
        field: "",
        website: "",
        address: "",
        size: "",
        avatar: "", // URI hoặc URL của avatar
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null); // Xem trước avatar

    useEffect(() => {
        dispatch(fetchCompanyByUser());
    }, [dispatch]);

    useEffect(() => {
        if (companyByUser) {
            setFormData({
                name: companyByUser.name || "",
                slogan: companyByUser.slogan || "",
                about: companyByUser.about || "",
                field: companyByUser.field || "",
                website: companyByUser.website || "",
                address: companyByUser.address || "",
                size: companyByUser.size || "",
                avatar: companyByUser.avatar || "",
            });
            setAvatarPreview(companyByUser.avatar || null); // Hiển thị avatar hiện tại
        }
    }, [companyByUser]);

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // Hàm chọn ảnh từ thư viện
    const handleUpdateAvatar = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            ToastMess({ type: "error", text1: "Cần cấp quyền truy cập thư viện ảnh!" });
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1], // Tỷ lệ 1:1
            quality: 1,
            maxWidth: 500,
            maxHeight: 500,
        });

        if (!result.canceled) {
            const uri = result.assets[0].uri;
            setAvatarPreview(uri); // Cập nhật xem trước
            setFormData((prev) => ({ ...prev, avatar: uri })); // Lưu URI vào formData
        }
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            ToastMess({ type: "error", text1: "Tên công ty không được để trống" });
            return;
        }
        setIsSubmitting(true);
        try {
            const token = await AsyncStorage.getItem("access_token");
            const payload = new FormData();

            // Thêm các trường văn bản vào payload
            Object.keys(formData).forEach((key) => {
                if (key !== "avatar") {
                    payload.append(key, formData[key]);
                }
            });

            // Thêm avatar nếu có thay đổi
            if (formData.avatar && formData.avatar !== companyByUser.avatar) {
                payload.append("avatar", {
                    uri: formData.avatar,
                    type: "image/jpeg", // Giả định là JPEG
                    name: "avatar.jpg",
                });
            }

            const res = await authApi(token).patch(endpoints["companiesDetail"](companyByUser._id), payload, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (res.status === 200) {
                ToastMess({ type: "success", text1: "Cập nhật thông tin thành công" });
                dispatch(fetchCompanyByUser());
                navigation.goBack();
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật công ty:", error);
            const errorMessage = error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại";
            ToastMess({ type: "error", text1: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={StyleShare.container}>
            <UIHeader
                leftIcon={"arrow-back"}
                title={"Chỉnh sửa thông tin công ty"}
                handleLeftIcon={() => navigation.goBack()}
            />

            {loading ? (
                <Loading />
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 20 }}>
                    <View style={styles.containerMain}>
                        {/* Avatar */}
                        <Text style={[StyleShare.titleText16, { marginBottom: 5 }]}>Logo</Text>
                        <View style={styles.avatarContainer}>
                            {avatarPreview ? (
                                <Image source={{ uri: avatarPreview }} style={styles.avatarImage} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Icon name="camera-outline" size={30} color={grey} />
                                </View>
                            )}
                            <TouchableOpacity style={styles.updateAvatarButton} onPress={handleUpdateAvatar}>
                                <Text style={styles.updateAvatarText}>Cập nhật Logo</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Tên công ty */}
                        <Text style={styles.label}>Tên công ty</Text>
                        <TextInput
                            style={styles.introduceInput}
                            value={formData.name}
                            onChangeText={(text) => handleInputChange("name", text)}
                            placeholder="Nhập tên công ty"
                        />

                        {/* Slogan */}
                        <Text style={styles.label}>Slogan</Text>
                        <TextInput
                            style={styles.introduceInput}
                            value={formData.slogan}
                            onChangeText={(text) => handleInputChange("slogan", text)}
                            placeholder="Nhập slogan"
                        />

                        {/* Quy mô công ty */}
                        <Text style={styles.label}>Quy mô công ty</Text>
                        <Dropdown
                            data={sizeData}
                            onSelect={(item) => {
                                handleInputChange("size", item.title);
                            }}
                            placeholder="Chọn số lượng nhân viên"
                            buttonStyle={{
                                marginTop: 10,
                                width: "100%",
                                height: 50,
                            }}
                            defaultValue={formData.size}
                        />

                        {/* Giới thiệu công ty */}
                        <Text style={styles.label}>Giới thiệu công ty</Text>
                        <TextInput
                            style={[styles.introduceInput, { height: 100, textAlignVertical: "top" }]}
                            value={formData.about}
                            onChangeText={(text) => handleInputChange("about", text)}
                            placeholder="Nhập giới thiệu công ty"
                            multiline
                        />

                        {/* Lĩnh vực hoạt động */}
                        <Text style={styles.label}>Lĩnh vực hoạt động</Text>
                        <TextInput
                            style={styles.introduceInput}
                            value={formData.field}
                            onChangeText={(text) => handleInputChange("field", text)}
                            placeholder="Nhập lĩnh vực hoạt động"
                        />

                        {/* Website */}
                        <Text style={styles.label}>Website</Text>
                        <TextInput
                            style={styles.introduceInput}
                            value={formData.website}
                            onChangeText={(text) => handleInputChange("website", text)}
                            placeholder="Nhập URL website"
                            keyboardType="url"
                        />

                        {/* Địa chỉ công ty */}
                        <Text style={styles.label}>Địa chỉ công ty</Text>
                        <TextInput
                            style={styles.introduceInput}
                            value={formData.address}
                            onChangeText={(text) => handleInputChange("address", text)}
                            placeholder="Nhập địa chỉ công ty"
                        />

                        <View style={{ marginTop: 30 }}>
                            {isSubmitting ? <Loading /> : (

                                <Button
                                    title={isSubmitting ? "" : "Lưu"}
                                    onPress={handleSave}
                                    disable={isSubmitting}
                                    backgroundColor={mainColor}
                                    textColor={white}
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
    },
    label: {
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
    avatarContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
    },
    avatarImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginRight: 15,
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: bgButton2,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },
    updateAvatarButton: {
        backgroundColor: mainColor,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
    },
    updateAvatarText: {
        color: white,
        fontSize: 14,
        fontWeight: "500",
    },
});