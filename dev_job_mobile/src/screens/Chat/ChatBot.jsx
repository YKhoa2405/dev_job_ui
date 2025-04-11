import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Avatar } from "react-native-paper";
import { GiftedChat, Send, Bubble } from "react-native-gifted-chat";
import Icon from "react-native-vector-icons/Ionicons";
import axios from "axios";
import UIHeader from "../../components/UIHeader";
import { grey, mainColor, white } from "../../assets/themes/Color";
import StyleShare from "../../assets/themes/StyleShare";
import { collection, doc, query, orderBy, onSnapshot, addDoc, serverTimestamp, limit } from "firebase/firestore";
import { storeDb } from "../../assets/config/Key";
import { debounce } from "lodash"; // Install lodash for debouncing

// Memoized Bubble component to prevent unnecessary re-renders
const MemoizedBubble = React.memo(({ ...props }) => {
    const { currentMessage } = props;

    if (currentMessage.user._id === 2 && currentMessage.jobs && currentMessage.jobs.length > 0) {
        return (
            <View>
                <Bubble
                    {...props}
                    wrapperStyle={{
                        left: { backgroundColor: "#f0f0f0" },
                        right: { backgroundColor: mainColor },
                    }}
                    textStyle={{
                        left: { color: "#000" },
                        right: { color: white },
                    }}
                />
                <View style={styles.jobList}>
                    {currentMessage.jobs.map((job) => (
                        <TouchableOpacity
                            key={job.id}
                            style={styles.jobItem}
                            onPress={() => {
                                props.navigation.navigate("JobDetail", { jobId: job.id });
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
                left: { backgroundColor: "#f0f0f0" },
                right: { backgroundColor: mainColor },
            }}
            textStyle={{
                left: { color: "#000" },
                right: { color: white },
            }}
        />
    );
});

export default function ChatBot({ navigation, route }) {
    const { userId } = route.params;
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch messages from Firestore with pagination
    useEffect(() => {
        const messagesRef = collection(doc(storeDb, "chatBots", userId), "messages");
        const messagesQuery = query(messagesRef, orderBy("timestamp", "desc"), limit(50)); // Limit to 50 messages

        const unsubscribe = onSnapshot(
            messagesQuery,
            (snapshot) => {
                const fetchedMessages = snapshot.docs.map((doc) => {
                    const data = doc.data();
                    const textValue = typeof data.text === "string" ? data.text : (data.text?.response || JSON.stringify(data.text));
                    return {
                        _id: doc.id,
                        text: textValue,
                        createdAt: data.timestamp?.toDate() || new Date(),
                        user: { _id: data.senderId },
                        jobs: data.jobs || [],
                    };
                });
                setMessages(fetchedMessages);
                setInitialLoading(false);
            },
            (error) => {
                console.log("Lỗi lấy lịch sử chat:", error);
                setError("Không thể tải lịch sử chat. Vui lòng thử lại.");
                setInitialLoading(false);
            }
        );

        return () => unsubscribe();
    }, [userId]);

    // Debounced API call to prevent rapid firing
    const debouncedSend = useCallback(
        debounce(async (userMessage) => {
            setLoading(true);
            try {
                const response = await axios.post("http://192.168.1.120:8001/apip/chat", {
                    user_input: userMessage,
                    user_id: userId,
                });

                if (response.data.status === "success") {
                    const botResponseData = response.data.data.response;
                    const botResponse = botResponseData.response || "Không có phản hồi từ chatbot";
                    const jobs = botResponseData.jobs || [];

                    const botMessage = {
                        _id: Math.random().toString(),
                        text: botResponse,
                        createdAt: new Date(),
                        user: { _id: 2, name: "ChatBot", avatar: require("../../assets/images/happy.png") },
                        jobs,
                    };
                    setMessages((prev) => GiftedChat.append(prev, [botMessage]));
                    await saveMessageToFirebase(userId, userMessage, botResponse, jobs);
                }
            } catch (error) {
                console.log("Lỗi gọi API:", error);
                setError("Có lỗi xảy ra, vui lòng thử lại!");
            } finally {
                setLoading(false);
            }
        }, 500),
        [userId]
    );

    const handleSend = useCallback(
        (newMessages = []) => {
            setMessages((prev) => GiftedChat.append(prev, newMessages));
            debouncedSend(newMessages[0].text);
        },
        [debouncedSend]
    );

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

        }
    };

    const saveMessageToFirebase = async (userId, userMessage, botResponse, jobs = []) => {
        const chatRef = collection(doc(storeDb, "chatBots", userId), "messages");
        try {
            await addDoc(chatRef, {
                senderId: 1,
                text: userMessage,
                timestamp: serverTimestamp(),
            });
            await addDoc(chatRef, {
                senderId: 2,
                text: botResponse,
                jobs,
                timestamp: serverTimestamp(),
            });
        } catch (error) {
            console.log("Lỗi lưu tin nhắn:", error);
            setError("Không thể lưu tin nhắn.");
        }
    };

    const renderFooter = useCallback(() => {
        if (!loading) return null;
        return (
            <View style={styles.footerContainer}>
                <ActivityIndicator size="small" color={mainColor} />
                <Text style={styles.loadingText}>Chatbot đang trả lời...</Text>
            </View>
        );
    }, [loading]);

    const renderEmptyChat = useCallback(() => (
        <View style={styles.emptyContainer}>
            <Avatar.Image source={require("../../assets/images/happy.png")} size={60} style={{ marginBottom: 20 }} />
            <Text style={StyleShare.titleText20}>Tôi có thể giúp gì cho bạn?</Text>
        </View>
    ), []);

    // Skeleton loading for initial fetch
    const renderSkeleton = () => (
        <View style={styles.skeletonContainer}>
            {[...Array(3)].map((_, index) => (
                <View key={index} style={styles.skeletonBubble}>
                    <View style={styles.skeletonAvatar} />
                    <View style={styles.skeletonText} />
                </View>
            ))}
        </View>
    );

    return (
        <View style={styles.container}>
            <UIHeader
                rightIcon={"ellipsis-horizontal-sharp"}
                leftIcon={"arrow-back"}
                title="ChatBot"
                handleLeftIcon={() => navigation.goBack()} />
            <View style={{
                borderBottomWidth: 1,
                borderColor: grey,
            }}></View>
            {error && <Text style={styles.errorText}>{error}</Text>}
            {initialLoading ? (
                renderSkeleton()
            ) : (
                <GiftedChat
                    messages={messages}
                    onSend={handleSend}
                    user={{ _id: 1 }}
                    renderChatEmpty={renderEmptyChat}
                    renderSend={(props) => (
                        <Send {...props} containerStyle={styles.sendContainer}>
                            <Icon name="send" size={24} color={mainColor} />
                        </Send>
                    )}
                    renderFooter={renderFooter}
                    renderBubble={(props) => <MemoizedBubble {...props} navigation={navigation} />}
                    placeholder="Nhập tin nhắn..."
                    alwaysShowSend
                    renderActions={() => (
                        <TouchableOpacity style={{ marginBottom: 6, marginLeft: 5 }} onPress={() => handleChooseFile()}>
                            <Icon name="attach-outline" size={30} color='grey' />
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: white },
    emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
    sendContainer: { justifyContent: "center", alignItems: "center", padding: 10 },
    footerContainer: { flexDirection: "row", alignItems: "center", padding: 10 },
    loadingText: { fontSize: 14, color: "grey", fontStyle: "italic", marginLeft: 10 },
    jobList: { paddingHorizontal: 10, paddingBottom: 10 },
    jobItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    jobText: { color: mainColor, fontSize: 16, flex: 1 },
    errorText: { color: "red", textAlign: "center", padding: 10 },
    skeletonContainer: { flex: 1, padding: 10 },
    skeletonBubble: { flexDirection: "row", marginVertical: 10 },
    skeletonAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#ddd" },
    skeletonText: { flex: 1, height: 20, backgroundColor: "#ddd", marginLeft: 10, borderRadius: 10 },
});