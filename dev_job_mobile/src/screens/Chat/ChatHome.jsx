import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableWithoutFeedback,
    TouchableOpacity,
    TextInput,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native"; // Thêm useFocusEffect
import UIHeader from "../../components/UIHeader";
import { StyleSheet } from "react-native";
import { mainColor, white } from "../../assets/themes/Color";
import { Avatar } from "react-native-paper";
import moment from "moment";
import Icon from "react-native-vector-icons/Ionicons";
import StyleShare from "../../assets/themes/StyleShare";
import io from "socket.io-client";
import Loading from "../../components/Loading";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi, endpoints } from "../../assets/config/API";

export default function ChatHome({ navigation, route }) {
    const { currentUserId, roleName } = route.params;

    const [searchKeywork, setSearchKeywork] = useState("");
    const [loading, setLoading] = useState(true);
    const [chatRooms, setChatRooms] = useState([]);
    const [socket, setSocket] = useState(null);

    const fetchChatRooms = async () => {
        try {
            const token = await AsyncStorage.getItem("access_token");
            const response = await authApi(token).get(endpoints["chatRooms"](currentUserId));
            setChatRooms(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching chat rooms:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        const socketIo = io("http://192.168.1.120:8000", {
            transports: ["websocket"],
            query: { userId: currentUserId }, // Thêm userId vào query
        });

        socketIo.on("connect", () => {
            console.log("ChatHome: Connected to WebSocket server");
        });

        socketIo.on("connect_error", (error) => {
            console.log("ChatHome: WebSocket connection error:", error);
        });

        socketIo.on("receiveMessage", (data) => {
            console.log("ChatHome: Received message:", data);
            setChatRooms((prevRooms) => {
                // Loại bỏ room cũ để cập nhật room mới lên đầu
                const updatedRooms = prevRooms.filter(
                    (room) => room.id !== `${currentUserId}-${data.senderId}` && room.id !== `${currentUserId}-${data.recipientId}`
                );
                const participantId = data.senderId === currentUserId ? data.recipientId : data.senderId;
                const newRoom = {
                    id: `${currentUserId}-${participantId}`,
                    participants: data.participant || {
                        id: participantId,
                        name: `User ${participantId}`,
                        avatar: "https://example.com/avatar.jpg",
                    },
                    lastMessage: {
                        text: data.message,
                        timestamp: data.timestamp,
                        senderId: data.senderId,
                        fileUrl: data.fileUrl || null,
                        isRead: data.isRead || false,
                    },
                };
                return [newRoom, ...updatedRooms];
            });
        });

        socketIo.on("messageRead", (data) => {
            console.log("ChatHome: Message read:", data);
            setChatRooms((prevRooms) => {
                return prevRooms.map((room) =>
                    room.id === `${currentUserId}-${data.recipientId}`
                        ? { ...room, lastMessage: data.lastMessage }
                        : room
                );
            });
        });

        setSocket(socketIo);
        fetchChatRooms();

        return () => socketIo.disconnect();
    }, [currentUserId]);

    // Gọi fetchChatRooms khi màn hình được focus
    useFocusEffect(
        React.useCallback(() => {
            fetchChatRooms();
        }, [])
    );

    const renderItem = ({ item }) => {
        const isSender = item.lastMessage?.senderId === currentUserId;
        const displayText = item.lastMessage?.fileUrl
            ? "Đã gửi một file đính kèm"
            : item.lastMessage?.text
                ? item.lastMessage.text.length > 25
                    ? item.lastMessage.text.slice(0, 25) + "..."
                    : item.lastMessage.text
                : "No message";

        return (
            <TouchableWithoutFeedback
                onPress={() => {
                    navigation.navigate("ChatSocket", {
                        recipient: {
                            id: item.participants?.id || "unknown",
                            avatar: item.participants?.avatar || "https://via.placeholder.com/60",
                            name: item.participants?.name || "Unknown",
                        },
                        senderId: currentUserId,
                    });
                }}
            >
                <View style={styles.containerChatRoom}>
                    <Avatar.Image
                        source={{ uri: item.participants?.avatar || "https://via.placeholder.com/60" }}
                        size={50}
                        style={styles.avatar}
                    />
                    <View style={styles.chatContent}>
                        <View style={StyleShare.flexBetween}>
                            <Text style={StyleShare.titleText16} numberOfLines={1}>
                                {item.participants?.name?.length > 25
                                    ? item.participants?.name?.slice(0, 25) + "..."
                                    : item.participants?.name || "Unknown"}
                            </Text>
                            <Text style={styles.timestamp}>
                                {item.lastMessage?.timestamp ? moment(item.lastMessage.timestamp).fromNow() : ""}
                            </Text>
                        </View>
                        <View style={[StyleShare.flexBetween, { marginTop: 5 }]}>
                            <Text style={styles.lastMessage} ellipsizeMode="tail" numberOfLines={1}>
                                {isSender ? `Bạn: ${displayText}` : displayText}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <View style={styles.container}>
            <UIHeader
                leftIcon={"arrow-back"}
                handleLeftIcon={() => navigation.goBack()}
                title={"Nhắn tin"}
            />
            <View style={{ marginHorizontal: 10 }}>
                <View style={StyleShare.searchDetail}>
                    <Icon name="search" color={mainColor} size={24} style={{ marginRight: 10 }} />
                    <TextInput
                        style={StyleShare.searchInput}
                        placeholder="Nhập tên người dùng..."
                        value={searchKeywork}
                        onChangeText={(text) => setSearchKeywork(text)}
                        onSubmitEditing={() => {}}
                    />
                </View>

                <FlatList
                    data={chatRooms}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.chatList}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Image source={require("../../assets/images/save.png")} style={StyleShare.imageNullData} />
                            <Text style={StyleShare.titleText20}>Không có tin nhắn nào</Text>
                            <Text style={styles.emptyText}>Bạn chưa có bất kỳ tin nhắn nào, kiểm tra lại sau</Text>
                        </View>
                    }
                />
            </View>
            {roleName === "client" && (
                <TouchableOpacity
                    style={styles.chatBotContainer}
                    onPress={() => navigation.navigate("ChatBot", { senderId: currentUserId })}
                    activeOpacity={0.8}
                >
                    <Avatar.Image
                        source={require("../../assets/images/happy.png")}
                        size={60}
                        style={styles.chatBotAvatar}
                    />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    containerChatRoom: {
        flexDirection: "row",
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
        backgroundColor: white,
        borderRadius: 10,
        marginVertical: 5,
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    avatar: {
        marginEnd: 15,
    },
    chatContent: {
        flex: 1,
        justifyContent: "center",
    },
    timestamp: {
        color: "grey",
        fontSize: 12,
    },
    lastMessage: {
        color: "#666",
        fontSize: 14,
    },
    chatList: {
        paddingBottom: 80,
    },
    emptyContainer: {
        marginTop: 50,
        alignItems: "center",
    },
    emptyText: {
        padding: 20,
        textAlign: "center",
        color: "#666",
        fontSize: 16,
    },
    chatBotContainer: {
        position: "absolute",
        bottom: 20,
        right: 20,
        backgroundColor: white,
        borderRadius: 30,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    chatBotAvatar: {
        marginEnd: 0,
    },
});