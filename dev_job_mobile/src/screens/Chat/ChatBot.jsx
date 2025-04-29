import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GiftedChat, Bubble, Send, Avatar, InputToolbar } from 'react-native-gifted-chat';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { mainColor } from '../../assets/themes/Color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, endpoints } from '../../assets/config/API';
import UIHeader from '../../components/UIHeader';
import Loading from '../../components/Loading';
import debounce from 'lodash.debounce';
import * as DocumentPicker from 'expo-document-picker';
import StysleShare from '../../assets/themes/StyleShare';

const fetchMessages = async (senderId, recipientId) => {
  const token = await AsyncStorage.getItem('access_token');
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
    file: msg.fileUrl ? { name: msg.fileUrl.split('/').pop(), url: msg.fileUrl } : null, // Hiển thị tệp nếu có
  }));
};

export default function ChatBot({ navigation, route }) {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const { senderId } = route.params;
  const recipientId = 'chatbot'.toString();

  // Tải tin nhắn
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

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Chọn tệp bằng DocumentPicker
  const pickDocument = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/png', 'image/jpeg'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile({
          uri: file.uri,
          name: file.name,
          type: file.mimeType,
          size: file.size,
        });
      }
    } catch (error) {
      console.log('Error picking document:', error);
    }
  }, []);

  // Gửi tin nhắn và tệp (nếu có)
  const debouncedSendMessage = useMemo(
    () =>
      debounce(async (message, file, callback) => {
        try {
          const formData = new FormData();
          formData.append('userId', senderId.toString());
          formData.append('message', message);

          if (file) {
            formData.append('cvFile', {
              uri: file.uri,
              name: file.name,
              type: file.type,
            });
          }

          const response = await authApi().post(endpoints['chatbot'], formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
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
            file: response.data.data.fileUrl ? { name: response.data.data.fileUrl.split('/').pop(), url: response.data.data.fileUrl } : null,
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
      }, 500),
    [senderId]
  );

  const onSend = useCallback(
    (newMessages = []) => {
      const userMessage = newMessages[0];
      const messageWithFile = {
        ...userMessage,
        file: selectedFile ? { name: selectedFile.name } : null,
      };

      // Thêm tin nhắn người dùng vào danh sách
      setMessages((previousMessages) => GiftedChat.append(previousMessages, [messageWithFile]));
      setIsTyping(true);

      debouncedSendMessage(userMessage.text, selectedFile, (botMessage) => {
        setMessages((previousMessages) => GiftedChat.append(previousMessages, [botMessage]));
        setIsTyping(false);
        setSelectedFile(null); // Xóa tệp đã chọn sau khi gửi
      });
    },
    [debouncedSendMessage, selectedFile]
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
        renderCustomView={() => {
          if (props.currentMessage.file) {
            return (
              <View style={styles.fileContainer}>
                <Text style={styles.fileText}>Tệp: {props.currentMessage.file.name}</Text>
              </View>
            );
          }
          return null;
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
 
  // Tùy chỉnh avatar
  const renderAvatar = useCallback(
    (props) => {
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
    },
    [senderId]
  );

  // Tùy chỉnh InputToolbar để thêm nút chọn tệp
  const renderInputToolbar = useCallback(
    (props) => (
      <InputToolbar
        {...props}
        containerStyle={styles.inputToolbar}
        renderActions={() => (
          <TouchableOpacity style={styles.attachButton} onPress={pickDocument}>
            <Ionicons name="attach" size={24} color={mainColor} />
            {selectedFile && (
              <Text style={styles.selectedFileText} numberOfLines={1}>
                {selectedFile.name}
              </Text>
            )}
          </TouchableOpacity>
        )}
      />
    ),
    [pickDocument, selectedFile, mainColor]
  );

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
        renderInputToolbar={renderInputToolbar}
        placeholder="Nhập câu hỏi của bạn..."
        showAvatarForEveryMessage={true}
        isTyping={isTyping}
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
  inputToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  selectedFileText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#555',
    maxWidth: 100,
  },
  fileContainer: {
    padding: 5,
  },
  fileText: {
    fontSize: 12,
    color: '#007AFF',
  },
});