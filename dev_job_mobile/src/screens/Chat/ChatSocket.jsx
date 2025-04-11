import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Avatar } from "react-native-paper";
import Icon from "react-native-vector-icons/Ionicons";
import { GiftedChat, Send } from "react-native-gifted-chat";
import StyleShare from "../../assets/themes/StyleShare";
import { bgNotifi, grey, mainColor, white } from "../../assets/themes/Color";
import io from "socket.io-client";
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi, endpoints } from "../../assets/config/API";

const fetchMessages = async (senderId, recipientId) => {
    const token = await AsyncStorage.getItem("access_token");
    const response = await authApi(token).get(endpoints['getMessages'](senderId, recipientId));
    const data = response.data.data;
    return data.map((msg) => ({
        _id: msg._id,
        text: msg.message,
        createdAt: new Date(msg.timestamp),
        user: { _id: msg.senderId },
        file: msg.fileUrl || null,
    }));
};

export default function ChatSocket({ route, navigation }) {
    const { recipient, senderId } = route.params;
    const [messages, setMessages] = useState([]);
    const [socket, setSocket] = useState(null);
    // console.log(recipient, senderId)

    useEffect(() => {
        const socketIo = io("http://192.168.1.120:8000", { transports: ["websocket"] });
        socketIo.on("receiveMessage", (data) => {
            const newMessage = {
                _id: data._id, // Dùng _id từ server
                text: data.message,
                createdAt: new Date(data.timestamp),
                user: { _id: data.senderId },
                file: data.fileUrl || null,
            };
            setMessages((prev) => {
                // Thay thế tin nhắn tạm thời bằng tin nhắn từ server
                const updatedMessages = prev.map((msg) =>
                    msg._id === data.tempId ? { ...newMessage, _id: data._id } : msg
                );
                if (!updatedMessages.some((msg) => msg._id === data._id)) {
                    return GiftedChat.append(updatedMessages, [newMessage]);
                }
                return updatedMessages;
            });
        });

        setSocket(socketIo);

        const loadMessages = async () => {
            const oldMessages = await fetchMessages(senderId, recipient?.id);
            setMessages(oldMessages.reverse());
        };
        loadMessages();

        return () => socketIo.disconnect();
    }, [senderId, recipient?.id]);

    const onSend = useCallback((newMessages = []) => {
        const tempId = Math.random().toString(36).substring(7); // Tạo tempId duy nhất
        const message = {
            ...newMessages[0],
            _id: tempId, // Gán tempId cho tin nhắn
        };

        if (socket) {
            socket.emit("sendMessage", {
                senderId: senderId,
                recipientId: recipient?.id,
                message: message.text || "",
                fileUrl: message.file || null,
                tempId, // Gửi tempId để đồng bộ
            });
        }

        // Thêm tin nhắn tạm thời với tempId
        setMessages((prev) => GiftedChat.append(prev, [message]));
    }, [socket, senderId, recipient?.id]);

    const handleChooseFile = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: [
                'application/pdf',                                             // PDF
                'application/msword',                                          // .doc
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
                'image/jpeg',                                                  // JPG
                'image/jpg',
                'image/png',
                'image/heic',                                                  // iOS HEIC
            ],
            copyToCacheDirectory: true,
        });
        if (!result.canceled) {
            const fileData = result.assets[0];
            const formData = new FormData();
            formData.append("file", {
                uri: fileData.uri,
                name: fileData.name,
                type: fileData.mimeType,
            });
            try {

                const token = await AsyncStorage.getItem("access_token");
                const response = await authApi(token).post(endpoints['chatUploadFile'], formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                const fileUrl = response.data.data.fileUrl

                const newMessage = {
                    _id: Math.random().toString(36).substring(7),
                    text: "",
                    createdAt: new Date(),
                    user: { _id: senderId },
                    file: fileUrl,
                };
                onSend([newMessage]);
            } catch (error) {
                console.log("Upload error:", error.response?.data || error.message);
            }
        }
    };

    return (
        <View style={{ backgroundColor: white, flex: 1 }}>
            <View style={styles.container}>
                <View style={StyleShare.flexCenter}>
                    {/* <TouchableOpacity onPress={() => navigation.navigate("ChatHome",{currentUserId: senderId})}>
                        <Icon size={26} name="arrow-back" />
                    </TouchableOpacity> */}
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icon size={26} name="arrow-back" />
                    </TouchableOpacity>
                    <Avatar.Image
                        size={40}
                        source={{ uri: recipient?.avatar }}
                        style={{ marginLeft: 10, marginRight: 5 }}
                    />

                    <View>
                        <Text style={StyleShare.titleText16}>
                            {recipient?.name}
                        </Text>
                    </View>
                </View>
            </View>
            <GiftedChat
                messages={messages}
                onSend={onSend}
                user={{ _id: senderId }}
                renderAvatar={(props) =>
                    recipient?.avatar ? <Avatar.Image {...props} source={{ uri: recipient?.avatar }} size={32} /> : null
                }
                renderSend={(props) => (
                    <Send {...props}>
                        <Icon name="send" size={20} color={mainColor} style={{ marginRight: 14, marginBottom: 12 }} />
                    </Send>
                )}
                renderMessage={(props) => {
                    const { currentMessage } = props;
                    return (
                        <View
                            style={{
                                alignSelf: currentMessage?.user?._id === senderId ? "flex-end" : "flex-start",
                                marginHorizontal: 7,
                                marginBottom: 5,
                                marginTop: 2,
                            }}
                        >
                            <View
                                style={{
                                    backgroundColor: currentMessage?.user?._id === senderId ? mainColor : bgNotifi,
                                    padding: 10,
                                    borderRadius: 20,
                                    borderBottomRightRadius: currentMessage?.user?._id === senderId ? 0 : 20,
                                    borderTopLeftRadius: currentMessage?.user?._id === senderId ? 20 : 0,
                                    maxWidth: "80%",
                                }}
                            >
                                {currentMessage.file ? (
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate('ResumeClientView', { pdfUri: currentMessage.file })}
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            maxWidth: '90%', // giới hạn chiều ngang
                                        }}
                                    >
                                        <Icon
                                            name="document"
                                            color={currentMessage?.user?._id === senderId ? "white" : "black"}
                                            size={24}
                                        />
                                        <Text
                                            style={{
                                                color: currentMessage?.user?._id === senderId ? "white" : "black",
                                                marginLeft: 5,
                                                flexShrink: 1, // cho phép text co lại trong container
                                            }}
                                            numberOfLines={1} // chỉ hiện 1 dòng
                                            ellipsizeMode="middle" // hoặc "tail"
                                        >
                                            {currentMessage.file.split("/").pop()}
                                        </Text>
                                    </TouchableOpacity>

                                ) : (
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            color: currentMessage?.user?._id === senderId ? "white" : "black",
                                        }}
                                    >
                                        {currentMessage.text}
                                    </Text>
                                )}
                                <Text style={{ color: "grey", fontSize: 12, textAlign: "right", marginTop: 5 }}>
                                    {currentMessage.createdAt?.toLocaleString([], { hour: "2-digit", minute: "2-digit" })}
                                </Text>
                            </View>
                        </View>
                    );
                }}
                renderActions={() => (
                    <TouchableOpacity style={{ marginBottom: 6, marginLeft: 5 }} onPress={() => handleChooseFile()}>
                        <Icon name="attach-outline" size={30} color='grey' />
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderColor: grey,
    },
    email: {
        marginLeft: 5,
        fontSize: 14,
        color: "grey",
    },
});