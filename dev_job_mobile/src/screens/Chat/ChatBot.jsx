import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Avatar } from "react-native-paper";
import { GiftedChat, Send, Bubble } from "react-native-gifted-chat";
import Icon from "react-native-vector-icons/Ionicons";
import axios from "axios";
import UIHeader from "../../components/UIHeader";
import { mainColor, white } from "../../assets/themes/Color";
import StyleShare from "../../assets/themes/StyleShare";
import { collection, doc, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { storeDb } from "../../assets/config/Key";

export default function ChatBot({ navigation, route }) {
    const { userId } = route.params;
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchMessages = () => {
            const messagesRef = collection(doc(storeDb, 'chatBots', userId), 'messages');
            const messagesQuery = query(messagesRef, orderBy('timestamp', 'desc'));

            const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
                const fetchedMessages = snapshot.docs.map(doc => {
                    const data = doc.data();
                    const textValue = typeof data.text === 'string' ? data.text : (data.text?.response || JSON.stringify(data.text));
                    return {
                        _id: doc.id,
                        text: textValue,
                        createdAt: data.timestamp?.toDate() || new Date(),
                        user: { _id: data.senderId },
                        jobs: data.jobs || [],
                    };
                });
                setMessages(fetchedMessages);
            }, (error) => {
                console.log("Lỗi lấy lịch sử chat:", error);
            });
            return unsubscribe;
        };
        const unsubscribe = fetchMessages();
        return () => unsubscribe();
    }, [userId]);

    const renderFooter = () => {
        if (!loading) return null;
        return <Text style={styles.loadingText}>Chatbot đang nhập...</Text>;
    };

    const handleSend = async (newMessages = []) => {
        setMessages((prev) => GiftedChat.append(prev, newMessages));
        const userMessage = newMessages[0].text;
        setLoading(true);

        try {
            const response = await axios.post("http://192.168.1.120:8001/apip/chat", {
                user_input: userMessage,
                user_id: userId,
            });

            console.log("API response:", response.data);

            if (response.data.status === "success") {
                // Tách response và jobs từ data.response
                const botResponseData = response.data.data.response;
                const botResponse = botResponseData.response || "Không có phản hồi từ chatbot";
                const jobs = botResponseData.jobs || [];

                const botMessage = {
                    _id: Math.random().toString(),
                    text: botResponse,
                    createdAt: new Date(),
                    user: { _id: 2, name: "ChatBot", avatar: require("../../assets/images/happy.png") },
                    jobs: jobs,
                };
                setMessages((prev) => GiftedChat.append(prev, [botMessage]));
                await saveMessageToFirebase(userId, userMessage, botResponse, jobs);
            }
        } catch (error) {
            console.log("Lỗi gọi API:", error);
            const errorMessage = {
                _id: Math.random().toString(),
                text: "Có lỗi xảy ra, vui lòng thử lại!",
                createdAt: new Date(),
                user: { _id: 2, name: "ChatBot", avatar: require("../../assets/images/happy.png") },
                jobs: [],
            };
            setMessages((prev) => GiftedChat.append(prev, [errorMessage]));
        } finally {
            setLoading(false);
        }
    };

    const saveMessageToFirebase = async (userId, userMessage, botResponse, jobs = []) => {
        const chatRef = collection(doc(storeDb, 'chatBots', userId), 'messages');
        try {
            await addDoc(chatRef, {
                senderId: 1,
                text: userMessage,
                timestamp: serverTimestamp(),
            });
            await addDoc(chatRef, {
                senderId: 2,
                text: botResponse,
                jobs: jobs,
                timestamp: serverTimestamp(),
            });
        } catch (error) {
            console.log("Lỗi lưu tin nhắn:", error);
        }
    };

    const renderBubble = (props) => {
        const { currentMessage } = props;

        if (currentMessage.user._id === 2 && currentMessage.jobs && currentMessage.jobs.length > 0) {
            return (
                <View>
                    <Bubble
                        {...props}
                        wrapperStyle={{
                            left: { backgroundColor: '#f0f0f0' },
                            right: { backgroundColor: mainColor },
                        }}
                        textStyle={{
                            left: { color: '#000' },
                            right: { color: white },
                        }}
                    />
                    <View style={styles.jobList}>
                        {currentMessage.jobs.map((job) => (
                            <TouchableOpacity
                                key={job.id}
                                style={styles.jobItem}
                                onPress={() => {
                                    navigation.navigate("JobDetail", { jobId: job.id });
                                }}
                            >
                                <Text style={styles.jobText}>{`${job.title} - ${job.location}`}</Text>
                                <Icon name="chevron-forward" size={20} color={mainColor} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            );
        }
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    left: { backgroundColor: '#f0f0f0' },
                    right: { backgroundColor: mainColor },
                }}
                textStyle={{
                    left: { color: '#000' },
                    right: { color: white },
                }}
            />
        );
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
                renderBubble={renderBubble}
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
    jobList: { paddingHorizontal: 10, paddingBottom: 10 },
    jobItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    jobText: { color: mainColor, fontSize: 16, flex: 1 },
});