import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Avatar } from "react-native-paper";
import { GiftedChat, Send } from "react-native-gifted-chat";
import Icon from "react-native-vector-icons/Ionicons";
import axios from "axios";
import UIHeader from "../../components/UIHeader";
import { mainColor, white } from "../../assets/themes/Color";
import StyleShare from "../../assets/themes/StyleShare";

// Import Firebase Firestore
import { collection, doc, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { storeDb } from "../../assets/config/Key";

export default function ChatBot({ navigation, route }) {
    const { userId } = route.params;

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);


    // Lấy lịch sử chat từ Firebase
    useEffect(() => {
        const fetchMessages = () => {
            const messagesRef = collection(doc(storeDb, 'chatBots', userId), 'messages');
            const messagesQuery = query(messagesRef, orderBy('timestamp', 'desc'));

            const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
                const fetchedMessages = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        _id: doc.id,
                        text: data.text,
                        createdAt: data.timestamp?.toDate(),
                        user: { _id: data.senderId },
                    };
                });

                setMessages(fetchedMessages);
            });

            return unsubscribe;
        };

        const unsubscribe = fetchMessages();
        return () => unsubscribe();
    }, [userId]);

    // Hiển thị loading khi bot trả lời
    const renderFooter = () => {
        if (!loading) return null;
        return <Text style={styles.loadingText}>Chatbot đang nhập...</Text>;
    };

    // Xử lý gửi tin nhắn
    const handleSend = async (newMessages = []) => {
        setMessages((prev) => GiftedChat.append(prev, newMessages));

        const userMessage = newMessages[0].text;
        setLoading(true);

        try {
            const response = await axios.post("http://192.168.1.120:8001/apip/chat", {
                user_input: userMessage,
                user_id: userId,
            });

            if (response.data.status === "success") {
                const botMessage = {
                    _id: Math.random().toString(),
                    text: response.data.data.response,
                    createdAt: new Date(),
                    user: { _id: 2, name: "ChatBot", avatar: require("../../assets/images/happy.png") },
                };

                setMessages((prev) => GiftedChat.append(prev, [botMessage]));

                // Lưu tin nhắn vào Firebase
                await saveMessageToFirebase(userId, userMessage, botMessage.text);
            }
        } catch (error) {
            console.log("Lỗi gọi API:", error);
        } finally {
            setLoading(false);
        }
    };

    // Hàm lưu tin nhắn vào Firestore
    const saveMessageToFirebase = async (userId, userMessage, botMessage) => {
        const chatRef = collection(doc(storeDb, 'chatBots', userId), 'messages');

        try {
            await addDoc(chatRef, {
                senderId: 1,
                text: userMessage,
                timestamp: serverTimestamp(),
            });

            await addDoc(chatRef, {
                senderId: 2,
                text: botMessage,
                timestamp: serverTimestamp(),
            });
        } catch (error) {
            console.log("Lỗi lưu tin nhắn vào Firestore:", error);
        }
    };

    return (
        <View style={styles.container}>
            <UIHeader leftIcon={"arrow-back"} title="ChatBot" handleLeftIcon={() => navigation.goBack()} />

            <GiftedChat
                messages={messages}
                onSend={handleSend}
                user={{ _id: 1 }}
                renderChatEmpty={() => (
                    <View style={styles.emptyContainer}>
                        <Avatar.Image source={require("../../assets/images/happy.png")} size={60} style={{ marginBottom: 20 }} />
                        <Text style={StyleShare.titleText20}>Tôi có thể giúp gì cho bạn?</Text>
                    </View>
                )}
                renderSend={(props) => (
                    <Send {...props} containerStyle={styles.sendContainer}>
                        <Icon name="send" size={24} color={mainColor} />
                    </Send>
                )}
                renderFooter={renderFooter}
                placeholder="Nhập tin nhắn..."
                alwaysShowSend
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: white },
    emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
    sendContainer: { justifyContent: "center", alignItems: "center", padding: 10 },
    loadingText: { fontSize: 14, color: 'grey', fontStyle: "italic", padding: 10 },
});
