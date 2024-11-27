import React, { useCallback, useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import MyContext from "../../config/MyContext";
import { Avatar } from "react-native-paper";
import styleShare from "../../assets/theme/style";
import Icon from "react-native-vector-icons/Ionicons"
import { bgButton1, bgButton2, colorChat, grey, orange, white } from "../../assets/theme/color";
import { GiftedChat, Send } from "react-native-gifted-chat";
import { storeDb } from "../../config/Firebase";
import { addDoc, collection, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';
import * as DocumentPicker from 'expo-document-picker';
import { storage } from "../../config/Firebase";
import { ToastMess } from "../../components/ToastMess";
import { getDownloadURL, ref, uploadBytes, uploadBytesResumable } from "firebase/storage";

export default function ChatDetail({ route, navigation }) {
    const { userInfo } = route.params;
    const [userReceiver, setUserReceiver] = useState()
    const [user, dispatch] = useContext(MyContext)
    const [messages, setMessages] = useState([])
    // tạo chatId
    function generateChatId(userId1, userId2) {
        return [userId1, userId2].sort().join('_');
    }

    async function sendMessage(senderId, receiverId, text, file) {
        const chatId = generateChatId(senderId, receiverId)
        const message = {
            senderId: user.id,
            text,
            file: file ? { url: file.url, name: file.name, size: file.size } : null,
            timestamp: serverTimestamp()
        };
        try {
            // Cập nhật document chính của cuộc trò chuyện
            await setDoc(doc(storeDb, 'chats', chatId), {
                participants: [senderId, receiverId],
                lastMessage: message,
                createdAt: serverTimestamp(),
            }, { merge: true });

            // Lưu tin nhắn vào sub-collection 'messages'
            await addDoc(collection(doc(storeDb, 'chats', chatId), 'messages'), message);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }
    const onSend = (newMessages = []) => {
        const message = newMessages[0];
        sendMessage(user.id, userInfo.id, message.text, message.file ? message.file.url : null);
        setMessages((previousMessages) => GiftedChat.append(previousMessages, newMessages));
    };

    // Hàm để lấy tin nhắn từ Firestore
    const fetchMessages = (chatId) => {
        const messagesRef = collection(doc(storeDb, 'chats', chatId), 'messages');
        const messagesQuery = query(messagesRef, orderBy('timestamp', 'desc'));

        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            const fetchedMessages = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    _id: doc.id, // Sử dụng document ID làm _id
                    text: data.text,
                    createdAt: data.timestamp?.toDate(), // Chuyển đổi Firestore timestamp thành Date
                    user: {
                        _id: data.senderId,
                        name: data.senderId === userInfo.username,
                    },
                    file: data.file || null, // Thêm thông tin file nếu có
                };
            });

            setMessages(fetchedMessages);
        });

        return unsubscribe; // Trả về hàm unsubscribe để dừng lắng nghe khi component unmount
    };


    useEffect(() => {
        getUserInfo()
        const chatId = generateChatId(user.id, userInfo.id);
        const unsubscribe = fetchMessages(chatId);
        return () => unsubscribe(); // Dừng theo dõi khi component unmount
    }, [user.id, userInfo.id]);


    async function getUserInfo() {
        const userDoc = await getDoc(doc(storeDb, 'users', userInfo.id));
        setUserReceiver(userDoc.data())
    }

    const handlerChooseFile = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        });

        if (!result.canceled) {
            try {
                const selectedFile = result.assets[0]; // Lưu file vào biến
                const fileURL = await uploadFileToFirebase(selectedFile);
                const fileData = {
                    url: fileURL,
                    name: selectedFile.name,
                    size: selectedFile.size
                };
                await sendMessage(user.id, userInfo.id, "Đã gửi một file đính kèm", fileData);
                setMessages((previousMessages) => GiftedChat.append(previousMessages, [{
                    _id: Math.random().toString(), // Tạo ID ngẫu nhiên
                    text: "Đã gửi một file đính kèm ",
                    createdAt: new Date(),
                    user: {
                        _id: user.id,
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

    const uploadFileToFirebase = async (file) => {
        const response = await fetch(file.uri); // Lấy file từ URI
        const blob = await response.blob(); // Chuyển file thành blob để upload

        const storageRef = ref(storage, `files/${file.name}`); // Tạo tham chiếu đến Firebase Storage
        // Bắt đầu upload file
        await uploadBytes(storageRef, blob);

        // Lấy URL của file đã upload
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
    };

    return (
        <View style={{ backgroundColor: white, flex: 1 }}>
            <View style={styles.container}>
                <View style={styleShare.flexCenter}>
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

                    {userReceiver && userReceiver.email && (
                        <View>
                            <Text style={styles.name}>{userReceiver.name}</Text>
                            <Text style={styles.email}>{userReceiver.email}</Text>
                        </View>
                    )}

                </View>
                <TouchableOpacity>
                    <Icon size={26} name={"ellipsis-horizontal"} />
                </TouchableOpacity>
            </View>
            <GiftedChat
                messages={messages}
                onSend={newMessages => onSend(newMessages)}
                user={{
                    _id: user.id,
                }}
                renderAvatar={(props) => <Avatar.Image {...props} source={{ uri: userReceiver.avatar }} size={32} />}
                renderSend={props => {
                    return (
                        <Send {...props} >
                            <Icon name="send" size={20} color={bgButton1} style={{ marginRight: 14, marginBottom: 12 }} />
                        </Send>
                    )
                }}
                renderActions={() => {
                    return (
                        <TouchableOpacity style={{ marginBottom: 6, marginLeft: 5 }} onPress={() => handlerChooseFile()}>
                            <Icon name="attach-outline" size={30} color={bgButton1} />
                        </TouchableOpacity>
                    );
                }}
                renderMessage={(props) => {
                    const { currentMessage } = props;

                    return (
                        <View style={{
                            alignSelf: currentMessage.user._id === user.id ? 'flex-end' : 'flex-start',
                            marginHorizontal: 7,
                            marginBottom: 5,
                            marginTop: 2

                        }}>
                            <View style={{
                                backgroundColor: currentMessage.user._id === user.id ? bgButton1 : colorChat,
                                padding: 10,
                                borderRadius: 20,
                                borderBottomRightRadius: currentMessage.user._id === user.id ? 0 : 20, // Người nhận
                                borderTopLeftRadius: currentMessage.user._id === user.id ? 20 : 0, // Người gửi
                                maxWidth: '80%',
                            }}>
                                {currentMessage.file ? (
                                    <TouchableOpacity onPress={() => Linking.openURL(currentMessage.file.url)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                        <Icon name="document" color={currentMessage.user._id === user.id ? 'white' : 'black'} size={24} />
                                        <View>
                                            <Text style={{ fontWeight: 'bold', color: currentMessage.user._id === user.id ? 'white' : 'black', marginLeft: 5 }}>{currentMessage.file.name}</Text>
                                            <Text style={{ color: grey, marginLeft: 5 }}>{currentMessage.file.size} Kb</Text>

                                        </View>


                                    </TouchableOpacity>
                                ) : (

                                    <Text style={{ fontSize: 16, color: currentMessage.user._id === user.id ? 'white' : 'black', }}>{currentMessage.text} </Text>
                                )}
                                <Text style={{
                                    fontSize: 12,
                                    color: currentMessage.user._id === user.id ? 'white' : 'black',
                                    marginTop: 5,
                                    alignSelf: 'flex-end' // Canh giữa bên dưới ô tin nhắn
                                }}>
                                    <Text style={{ color: 'grey' }}>
                                        {currentMessage.createdAt?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {/* Hiển thị giờ và phút */}
                                    </Text>

                                </Text>
                            </View>
                        </View>
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