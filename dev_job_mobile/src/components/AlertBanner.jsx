import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const AlertBanner = ({ message, type }) => {
    const getIconAndColor = (type) => {
        switch (type) {
            case "success":
                return { icon: "checkmark-circle", color: "#4caf50" }; // Ionicons: checkmark-circle
            case "error":
                return { icon: "close-circle", color: "#f44336" }; // Ionicons: close-circle
            case "warning":
                return { icon: "warning", color: "#ff9800" }; // Ionicons: warning
            case "info":
                return { icon: "information-circle-outline", color: "#2196f3" }; // Ionicons: help-circle
            default:
                return { icon: "information-circle", color: "#2196f3" }; // Mặc định dùng Ionicons: information-circle
        }
    };

    const { icon, color } = getIconAndColor(type);

    return (
        <View style={styles.banner}>
            {/* Màu nền bên trái */}
            <View style={[styles.leftBar, { backgroundColor: color }]} />
            {/* Nội dung thông báo */}
            <View style={styles.content}>
                <Icon name={icon} size={20} color={color} style={styles.icon} />
                <Text style={styles.message}>{message}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    banner: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 5,
        overflow: "hidden", // Giữ bo góc
        backgroundColor: "#f9f9f9", // Màu nền mặc định
        elevation:2,
        marginBottom:10
    },
    leftBar: {
        width: 5, // Thanh màu bên trái
    },
    content: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
    },
    icon: {
        marginRight: 10, // Khoảng cách giữa icon và text
    },
    message: {
        fontSize: 14,
        fontWeight: "500",
        color: "#333", // Màu chữ chính
    },
});

export default AlertBanner;
