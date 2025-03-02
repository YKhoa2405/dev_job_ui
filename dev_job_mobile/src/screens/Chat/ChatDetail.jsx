import React, { useCallback, useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { Avatar } from "react-native-paper";
import Icon from "react-native-vector-icons/Ionicons"
import { GiftedChat, Send } from "react-native-gifted-chat";
import StyleShare from "../../assets/themes/StyleShare";
import { colorChat, grey, mainColor, white } from "../../assets/themes/Color";
import { addDoc, collection, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, setDoc } from "firebase/firestore";
import { storeDb } from "../../assets/config/Key";
import * as DocumentPicker from 'expo-document-picker';
import { ToastMess } from "../../components/ToastMess";
import axios from "axios";
import { endpoints } from "../../assets/config/API";


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
        const formData = new FormData();
        const selectedFile = result.assets[0]; // Lưu file vào biến
        console.log('selectedFile', selectedFile)

        if (selectedFile && selectedFile.uri) {
            formData.append('file', {
                uri: selectedFile.uri, // Đảm bảo URI hợp lệ (sử dụng 'file://' nếu là React Native)
                type: selectedFile.mimeType || 'application/octet-stream', // Đảm bảo loại tệp hợp lệ
                name: selectedFile.fileName || selectedFile.name, // Tên tệp hợp lệ
            });


            try {
                const response = await axios.post('http://192.168.1.120:8000/files/uploadChat', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data', // Đảm bảo Content-Type đúng
                    },
                });

                if (response.status === 201) {
                    const fileUrl = response.data.data.url; // Lấy đường dẫn trả về từ phản hồi API
                    console.log('fileUrl', fileUrl)
                    await sendMessage(userReceiver.id, "Đã gửi một file đính kèm", fileUrl);
                    setMessages((previousMessages) => GiftedChat.append(previousMessages, [{
                        _id: Math.random().toString(), // Tạo ID ngẫu nhiên
                        text: "Đã gửi một file đính kèm ",
                        createdAt: new Date(),
                        user: {
                            _id: currentUserId,
                        },
                        file: fileUrl // Gửi file đính kèm
                    }]));
                }
            } catch (error) {
                console.error('Có lỗi xảy ra:', error);
            }
        } else {
            console.log('Không có tệp nào được chọn');
        }
    };


    async function sendMessage(receiverId, text, file) {
        const chatId = generateChatId(currentUserId, receiverId)
        const message = {
            senderId: currentUserId,
            text: text || "",
            file: file || null,
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

                renderAvatar={(props) => (
                    userReceiver && userReceiver.avatar  (
                        <Avatar.Image {...props} source={{ uri: userReceiver.avatar }} size={32} />
                    ) 
                )}

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
                                {currentMessage.file ? (
                                    <TouchableOpacity onPress={() => Linking.openURL(currentMessage.file)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                        <Icon name="document" color={currentMessage.user._id === currentUserId ? 'white' : 'black'} size={24} />
                                        <View>
                                            <Text style={{ fontWeight: 'bold', color: currentMessage.user._id === currentUserId ? 'white' : 'black', marginLeft: 5 }}>{currentMessage.file}</Text>
                                        </View>


                                    </TouchableOpacity>
                                ) : (

                                    <Text style={{ fontSize: 16, color: currentMessage.user._id === currentUserId ? 'white' : 'black', }}>{currentMessage.text} </Text>
                                )}

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