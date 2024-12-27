import React, { useCallback, useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { Avatar } from "react-native-paper";
import Icon from "react-native-vector-icons/Ionicons"
import { GiftedChat, Send } from "react-native-gifted-chat";
import StyleShare from "../../assets/themes/StyleShare";
import { colorChat, grey, mainColor, white } from "../../assets/themes/Color";
import { addDoc, collection, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, setDoc } from "firebase/firestore";
import { storeDb } from "../../assets/config/Firebase";
import * as DocumentPicker from 'expo-document-picker';
import { ToastMess } from "../../components/ToastMess";


export default function ChatDetail({ route, navigation }) {
    // id người nhận tin nhắn
    const { userReceiver, currentUserId } = route.params;
    const [messages, setMessages] = useState([])


    function generateChatId(userId1, userId2) {
        return [userId1, userId2].sort().join('_');
    }

    const handlerChooseFile = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        });

        if (!result.canceled) {
            try {
                const selectedFile = result.assets[0]; // Lưu file vào biến
                const fileURL = selectedFile.uri; // Lấy URL file
                const fileData = {
                    url: fileURL,
                    name: selectedFile.name,
                    size: selectedFile.size
                };
                await sendMessage(userReceiver.id, "Đã gửi một file đính kèm", fileData);
                setMessages((previousMessages) => GiftedChat.append(previousMessages, [{
                    _id: Math.random().toString(), // Tạo ID ngẫu nhiên
                    text: "Đã gửi một file đính kèm ",
                    createdAt: new Date(),
                    user: {
                        _id: currentUserId,
                    },
                    file: fileData
                }]));

            } catch (error) {
                ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại.' });
                console.log(error)
            }
        } else {
            ToastMess({ type: 'error', text1: 'Chỉ hỗ trợ định dạng pdf, docx' })
        }
    };

    async function sendMessage(receiverId, text, file) {
        const chatId = generateChatId(currentUserId, receiverId)
        const message = {
            senderId: currentUserId,
            text: text || "",
            file: file ? { url: file.url, name: file.name, size: file.size } : null,
            timestamp: serverTimestamp()
        };
        try {
            // Cập nhật document chính của cuộc trò chuyện
            await setDoc(
                doc(storeDb, 'chatRooms', chatId), {
                participants: [currentUserId, receiverId],
                lastMessage: message,
                createdAt: serverTimestamp(),
            }, { merge: true });

            // Lưu tin nhắn vào sub-collection 'messages'
            await addDoc(collection(doc(storeDb, 'chatRooms', chatId), 'messages'), message);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }

    const onSend = (newMessages = []) => {
        const message = newMessages[0];
        sendMessage(userReceiver.id, message.text, message.file ? message.file.url : null);
        setMessages((previousMessages) => GiftedChat.append(previousMessages, newMessages));
    };

    const fetchMessages = (chatId) => {
        const messagesRef = collection(doc(storeDb, 'chatRooms', chatId), 'messages');
        const messagesQuery = query(messagesRef, orderBy('timestamp', 'desc'));

        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            const fetchedMessages = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    _id: doc.id, // Sử dụng document ID làm _id
                    text: data.text,
                    createdAt: data.timestamp?.toDate(),
                    user: {
                        _id: data.senderId,
                    },
                    file: data.file || null,
                };
            });

            setMessages(fetchedMessages);
        });
        return unsubscribe; // Trả về hàm unsubscribe để dừng lắng nghe khi component unmount
    };

    useEffect(() => {
        const chatId = generateChatId(currentUserId, userReceiver.id);
        const unsubscribe = fetchMessages(chatId);
        return () => unsubscribe(); // Dừng theo dõi khi component unmount
    }, [currentUserId, userReceiver.id]);


    return (
        <View style={{ backgroundColor: white, flex: 1 }}>
            <View style={styles.container}>
                <View style={StyleShare.flexCenter}>
                    <TouchableOpacity onPress={() => { navigation.goBack() }}>
                        <Icon size={26} name={"arrow-back"} />
                    </TouchableOpacity>

                    {userReceiver && userReceiver.avatar && (
                        <Avatar.Image
                            size={40}
                            source={{ uri: userReceiver.avatar }}
                            style={{ marginLeft: 10, marginRight: 5 }}
                        />
                    )}

                    {userReceiver && userReceiver.name && (
                        <View>
                            <Text style={StyleShare.titleText16}>
                                {userReceiver.name.length > 30
                                    ? userReceiver.name.slice(0, 30) + "..."
                                    : userReceiver.name}
                            </Text>
                            <Text style={styles.email}>{userReceiver.email}</Text>
                        </View>
                    )}

                </View>
            </View>
            <GiftedChat
                messages={messages}
                onSend={newMessages => onSend(newMessages)}
                user={{
                    _id: currentUserId,
                }}
                renderAvatar={(props) => <Avatar.Image {...props} source={{ uri: userReceiver.avatar }} size={32} />}

                renderSend={props => {
                    return (
                        <Send {...props} >
                            <Icon name="send" size={20} color={mainColor} style={{ marginRight: 14, marginBottom: 12 }} />
                        </Send>
                    )
                }}
                renderMessage={(props) => {
                    const { currentMessage } = props; // Lấy thông tin tin nhắn hiện tại

                    return (
                        <View
                            style={{
                                alignSelf: currentMessage.user._id === currentUserId ? 'flex-end' : 'flex-start',
                                marginHorizontal: 7,
                                marginBottom: 5,
                                marginTop: 2,
                            }}
                        >
                            <View
                                style={{
                                    backgroundColor: currentMessage.user._id === currentUserId ? mainColor : colorChat,
                                    padding: 10,
                                    borderRadius: 20,
                                    borderBottomRightRadius: currentMessage.user._id === currentUserId ? 0 : 20, // Người nhận
                                    borderTopLeftRadius: currentMessage.user._id === currentUserId ? 20 : 0, // Người gửi
                                    maxWidth: '80%',
                                }}
                            >
                                {/* Hiển thị nội dung tin nhắn */}
                                {currentMessage.text ? (
                                    <Text style={{ color: currentMessage.user._id === currentUserId ? white : 'black' }}>
                                        {currentMessage.text}
                                    </Text>
                                ) : null}

                                {/* Hiển thị file đính kèm nếu có */}
                                {currentMessage.file ? (
                                    <TouchableOpacity onPress={() => Linking.openURL(currentMessage.file.url)}>
                                        <Text style={{ color: mainColor, marginTop: 5 }}>
                                            {currentMessage.file.name || "File đính kèm"}
                                        </Text>
                                    </TouchableOpacity>
                                ) : null}

                                {/* Hiển thị thời gian */}
                                <Text style={{ color: 'grey', fontSize: 10, textAlign: 'right', marginTop: 5, }}>
                                    {currentMessage.createdAt?.toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                        </View>
                    );
                }}


                renderActions={() => {
                    return (
                        <TouchableOpacity style={{ marginBottom: 6, marginLeft: 5 }} onPress={() => handlerChooseFile()}>
                            <Icon name="attach-outline" size={30} color={mainColor} />
                        </TouchableOpacity>
                    );
                }}
            />

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderColor: grey
    },
    name: {
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 5
    },
    email: {
        marginLeft: 5,
        fontSize: 14,
        color: 'grey'
    }
}

)