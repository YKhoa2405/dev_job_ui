import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import StyleShare from "../../assets/themes/StyleShare";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { mainColor, orange, white } from "../../assets/themes/Color";
import UIHeader from "../../components/UIHeader";
import { ToastMess } from "../../components/ToastMess";
import API, { endpoints } from "../../assets/config/API";
import Loading from "../../components/Loading";

export default function RegisterClient({ navigation, route }) {
    const { role } = route.params;
    const [userName, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [passwordAg, setPasswordAg] = useState("");
    const [method, setMethod] = useState("email"); // Mặc định là email
    const [loading, setLoading] = useState(false);


    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const normalizePhoneNumber = (inputPhone) => {
        const digits = inputPhone.replace(/\D/g, ""); // chỉ giữ số
        if (digits.startsWith("0")) {
            return "+84" + digits.slice(1); // thay 0 đầu bằng +84
        } else if (digits.startsWith("84")) {
            return "+84" + digits.slice(2); // loại bỏ 84 đầu (nếu có), thêm lại +84
        } else if (digits.startsWith("8") && digits.length === 9) {
            return "+84" + digits; // nếu là số bắt đầu bằng 8 và đủ 9 số
        } else {
            return "+84" + digits; // fallback: thêm +84 vào đầu
        }
    };

    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
        return passwordRegex.test(password);
    };

    const handleRegister = async () => {
        // Kiểm tra các trường trống
        if (!email || !password || !userName || !passwordAg || !phone) {
            ToastMess({ type: "error", text1: "Vui lòng điền đầy đủ tất cả các trường." });
            return;
        }

        // Xác thực email
        if (!validateEmail(email)) {
            ToastMess({ type: "error", text1: "Email không hợp lệ." });
            return;
        }

        const formattedPhone = normalizePhoneNumber(phone);


        // Xác thực mật khẩu
        if (!validatePassword(password)) {
            ToastMess({
                type: "error",
                text1: "Mật khẩu phải có ít nhất 8 ký tự, gồm số và ký tự đặc biệt.",
            });
            return;
        }

        // Kiểm tra mật khẩu khớp
        if (password !== passwordAg) {
            ToastMess({ type: "error", text1: "Mật khẩu và mật khẩu xác nhận không khớp." });
            return;
        }

        setLoading(true);

        const formRegister = new URLSearchParams();
        formRegister.append("email", email);
        formRegister.append("name", userName);
        formRegister.append("phone", formattedPhone);
        formRegister.append("password", password);
        formRegister.append("method", method); // Thêm trường method

        try {
            const res = await API.post(endpoints["registerUser"], formRegister, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });
            ToastMess({ type: "success", text1: res.data.data.message }); // Điều chỉnh theo cấu trúc phản hồi từ backend
            navigation.navigate("RegisterSendOtp", {
                email,
                password,
                name: userName,
                phone,
                role,
                method, // Truyền method sang màn hình xác minh
            });
        } catch (error) {
            if (error.response && error.response.status === 400) {
                ToastMess({ type: "error", text1: error.response.data.data.message });
                console.log(error.response.data);
            } else {
                ToastMess({ type: "error", text1: "Có lỗi xảy ra. Vui lòng thử lại." });
                console.log(error);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={StyleShare.container}>
            <UIHeader
                leftIcon={"arrow-back"}
                handleLeftIcon={() => navigation.goBack()}
            />
            <ScrollView contentContainerStyle={{ marginHorizontal: 20 }} showsVerticalScrollIndicator={false}>
                <View style={styles.containerTop}>
                    <Text style={StyleShare.titleText30}>Đăng ký tài khoản ứng viên</Text>
                    <Text style={styles.desc}>
                        Đăng ký tài khoản để tìm kiếm công việc mơ ước, công việc theo chuyên môn và nhiều hơn thế nữa
                    </Text>
                </View>
                <View style={styles.containerMain}>
                    <Text style={[styles.textInput, { color: orange }]}>Thông tin đăng nhập</Text>
                    <Text style={styles.textInput}>Họ và tên</Text>
                    <Input
                        placeholder="Họ và tên"
                        onChangeText={setUsername}
                        autoCapitalize="none"
                    />
                    <Text style={styles.textInput}>Email</Text>
                    <Input
                        placeholder="Email"
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                    <Text style={styles.textInput}>Số điện thoại</Text>
                    <Input
                        placeholder="Số điện thoại +84"
                        onChangeText={setPhone}
                        autoCapitalize="none"
                        keyboardType="phone-pad"
                    />
                    <Text style={styles.textInput}>Mật khẩu</Text>
                    <Input
                        placeholder="Mật khẩu"
                        isPassword={true}
                        onChangeText={setPassword}
                        autoCapitalize="none"
                    />
                    <Text style={styles.textInput}>Nhập lại mật khẩu</Text>
                    <Input
                        placeholder="Nhập lại mật khẩu"
                        isPassword={true}
                        onChangeText={setPasswordAg}
                        autoCapitalize="none"
                    />
                    <Text style={styles.textInput}>Phương thức xác minh</Text>
                    <View style={styles.methodContainer}>
                        <TouchableOpacity
                            style={[
                                styles.methodButton,
                                method === "email" ? styles.methodButtonSelected : null,
                            ]}
                            onPress={() => setMethod("email")}
                        >
                            <Text
                                style={[
                                    styles.methodText,
                                    method === "email" ? styles.methodTextSelected : null,
                                ]}
                            >
                                Email
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.methodButton,
                                method === "sms" ? styles.methodButtonSelected : null,
                            ]}
                            onPress={() => setMethod("sms")}
                        >
                            <Text
                                style={[
                                    styles.methodText,
                                    method === "sms" ? styles.methodTextSelected : null,
                                ]}
                            >
                                SMS
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.containerFooter}>
                    {loading ? (
                        <Loading />
                    ) : (
                        <Button
                            title={"Đăng ký"}
                            backgroundColor={mainColor}
                            textColor={white}
                            onPress={handleRegister}
                        />
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    containerTop: {
        marginTop: 20,
        alignItems: "center",
    },
    containerMain: {
        marginTop: 20,
    },
    containerFooter: {
        marginTop: 30,
        marginBottom: 20,
    },
    desc: {
        marginTop: 20,
        textAlign: "center",
    },
    textInput: {
        fontWeight: "bold",
        color: mainColor,
        marginTop: 15,
    },
    methodContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },
    methodButton: {
        flex: 1,
        padding: 10,
        borderWidth: 1,
        borderColor: mainColor,
        borderRadius: 10,
        alignItems: "center",
        marginHorizontal: 5,
    },
    methodButtonSelected: {
        backgroundColor: mainColor,
    },
    methodText: {
        color: mainColor,
        fontWeight: "bold",
    },
    methodTextSelected: {
        color: white,
    },
});