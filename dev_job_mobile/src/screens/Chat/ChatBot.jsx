import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GiftedChat, Bubble, Send, Avatar } from 'react-native-gifted-chat';
import { View, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { mainColor } from '../../assets/themes/Color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, endpoints } from '../../assets/config/API';
import UIHeader from '../../components/UIHeader';
import Loading from '../../components/Loading';
import debounce from 'lodash.debounce'; // Thêm lodash để debounce
import StysleShare from '../../assets/themes/StyleShare';

const fetchMessages = async (senderId, recipientId) => {
    const token = await AsyncStorage.getItem("access_token");
    const response = await authApi(token).get(endpoints['getMessages'](senderId, recipientId));
    const data = response.data.data;
    return data.map((msg) => ({
        _id: msg._id,
        text: msg.message,
        createdAt: new Date(msg.timestamp),
        user: {
            _id: msg.senderId,
            name: msg.senderId === senderId ? 'You' : 'ChatBot',
            avatar: msg.senderId === senderId ? null : require('../../assets/images/happy.png'),
        },
    }));
};

export default function ChatBot({ navigation, route }) {
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { senderId } = route.params;
    const recipientId = 'chatbot'.toString();

    // Tối ưu hóa fetchMessages với useCallback
    const loadMessages = useCallback(async () => {
        try {
            setIsLoading(true);
            const fetchedMessages = await fetchMessages(senderId, recipientId);
            setMessages(fetchedMessages.reverse());
        } catch (error) {
            console.log('Error fetching messages:', error);
        } finally {
            setIsLoading(false);
        }
    }, [senderId, recipientId]);

    // Tải tin nhắn khi component mount
    useEffect(() => {
        loadMessages();
    }, [loadMessages]);

    // Tối ưu hóa onSend với debounce
    const debouncedSendMessage = useMemo(
        () =>
            debounce(async (message, callback) => {
                try {
                    const response = await authApi().post(endpoints['chatbot'], {
                        userId: senderId.toString(),
                        message,
                    });

                    const botMessage = {
                        _id: Math.random().toString(36).substring(7),
                        text: response.data.data.response,
                        createdAt: new Date(),
                        user: {
                            _id: 'chatbot',
                            name: 'ChatBot',
                            avatar: require('../../assets/images/happy.png'),
                        },
                    };

                    callback(botMessage);
                } catch (error) {
                    console.log('Error sending message:', error);
                    const errorMessage = {
                        _id: Math.random().toString(36).substring(7),
                        text: 'Đã có lỗi xảy ra. Vui lòng thử lại!',
                        createdAt: new Date(),
                        user: {
                            _id: 'chatbot',
                            name: 'ChatBot',
                            avatar: require('../../assets/images/happy.png'),
                        },
                    };
                    callback(errorMessage);
                }
            }, 500), // Debounce 500ms
        [senderId]
    );

    // Xử lý gửi tin nhắn
    const onSend = useCallback(
        (newMessages = []) => {
            // Thêm tin nhắn người dùng vào danh sách
            setMessages((previousMessages) => GiftedChat.append(previousMessages, newMessages));
            setIsTyping(true);

            const message = newMessages[0].text;

            debouncedSendMessage(message, (botMessage) => {
                setMessages((previousMessages) => GiftedChat.append(previousMessages, [botMessage]));
                setIsTyping(false);
            });
        },
        [debouncedSendMessage]
    );

    // Tùy chỉnh giao diện bong bóng tin nhắn
    const renderBubble = useCallback(
        (props) => (
            <Bubble
                {...props}
                wrapperStyle={{
                    right: {
                        backgroundColor: mainColor,
                        padding: 8,
                    },
                    left: {
                        backgroundColor: '#E5E5EA',
                        padding: 8,
                    },
                }}
                textStyle={{
                    right: {
                        color: '#FFF',
                    },
                    left: {
                        color: '#000',
                    },
                }}
            />
        ),
        [mainColor]
    );

    // Tùy chỉnh nút gửi
    const renderSend = useCallback(
        (props) => (
            <Send {...props}>
                <View style={styles.sendButton}>
                    <Ionicons name="send" size={24} color={mainColor} />
                </View>
            </Send>
        ),
        [mainColor]
    );

    // Tùy chỉnh giao diện avatar (chỉ hiển thị cho chatbot)
    const renderAvatar = useCallback((props) => {
        if (props.currentMessage.user._id === senderId) {
            return null;
        }
        return (
            <Avatar
                {...props}
                containerStyle={{
                    left: { marginRight: 8 },
                }}
                imageStyle={{
                    left: { width: 36, height: 36, borderRadius: 18 },
                }}
            />
        );
    }, [senderId]);

    // Hiển thị loading khi tải tin nhắn
    if (isLoading) {
        return <Loading />;
    }

    return (
        <View style={styles.container}>
            <UIHeader
                leftIcon={'arrow-back'}
                rightIcon={'ellipsis-horizontal'}
                handleLeftIcon={() => navigation.goBack()}
                title={'Chatbot'}
            />
            <GiftedChat
                messages={messages}
                onSend={onSend}
                user={{
                    _id: senderId,
                    name: 'You',
                }}
                renderBubble={renderBubble}
                renderSend={renderSend}
                renderAvatar={renderAvatar}
                placeholder="Nhập câu hỏi của bạn..."
                showAvatarForEveryMessage={true}
                isTyping={isTyping}
                // Giới hạn số lượng tin nhắn hiển thị ban đầu
                maxMessagesToRender={50}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    sendButton: {
        marginBottom: 10,
        marginRight: 10,
    },
});