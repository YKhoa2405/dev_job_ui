import React, { useContext, useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableWithoutFeedback, ActivityIndicator, TouchableOpacity, TextInput } from "react-native";
import styleShare from "../../assets/theme/style";
import UIHeader from "../../components/UIHeader";
import { StyleSheet } from "react-native";
import { Avatar } from "react-native-paper";
import MyContext from "../../config/MyContext";
import { bgButton1, orange, white } from "../../assets/theme/color";
import { collection, doc, getDoc, onSnapshot } from "firebase/firestore";
import { storeDb } from "../../config/Firebase";
import moment from "moment";
import Icon from "react-native-vector-icons/Ionicons"


export default function Chat({ navigation }) {
    const [user, dispatch] = useContext(MyContext);
    const [chatRooms, setChatRooms] = useState([]);
    const [loading, setLoading] = useState(true); // Add loading state
    const [search, setSearch] = useState([]);
    console.log(user.id)


    async function getUserInfo(userId) {
        const userDoc = await getDoc(doc(storeDb, 'users', userId));
        return userDoc.exists() ? userDoc.data() : null;
    }

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(storeDb, 'chats'), async (snapshot) => {
            const rooms = await Promise.all(snapshot.docs.map(async (doc) => {
                const data = doc.data();
                const lastMessage = data.lastMessage || {};
    
                // Kiểm tra nếu user.id tồn tại trong participants
                if (data.participants.includes(user.id)) {
                    // Lấy thông tin chi tiết của những người tham gia từ collection 'users'
                    const participantId = data.participants.find(userId => userId !== user.id); // Lấy ID khác với user.id hiện tại
                    const userInfo = await getUserInfo(String(participantId));
    
                    return {
                        id: doc.id,
                        ...data,
                        lastMessageText: lastMessage.text,
                        lastMessageTimestamp: lastMessage.timestamp,
                        participants: [{
                            id: userInfo.id,
                            name: userInfo.name,
                            avatar: userInfo.avatar,
                        }],
                    };
                } else {
                    return null; // Nếu không phải là participant, trả về null
                }
            }));
    
            // Lọc ra các phòng chat hợp lệ (không null)
            const filteredRooms = rooms.filter(room => room !== null);
            setChatRooms(filteredRooms);
            setLoading(false);
        });
    
        return () => unsubscribe();
    }, [user.id]);



    const renderItem = ({ item }) => {
        const isSender = item.lastMessage.senderId === user.id;
        return (

            <TouchableWithoutFeedback onPress={() => navigation.navigate('ChatDetail', {
                userInfo: {
                    id: item.participants[0].id
                }
            })
            }>
                <View style={styles.containerChatRoom}>
                    <Avatar.Image source={{ uri: item.participants[0].avatar }} size={50} style={{ marginEnd: 15 }} />
                    <View style={{ flex: 1 }}>
                        <View style={styleShare.flexBetween}>
                            <Text style={styleShare.titleJobAndName}>{item.participants[0].name}</Text>
                            <Text style={{ color: 'grey' }}>{item.lastMessageTimestamp ? moment(item.lastMessageTimestamp.toDate()).fromNow() : ''}
                            </Text>
                        </View>
                        <Text style={{ marginTop: 5 }} ellipsizeMode="tail" numberOfLines={1}>{isSender ? `Bạn: ${item.lastMessage.text}` : item.lastMessage.text}</Text>
                    </View>
                </View>
            </TouchableWithoutFeedback >
        )
    };

    return (
        <View style={{ flex: 1 }}>
            <UIHeader title={'Nhắn tin'} />
            <View style={styles.inputContainer}>
                <Icon name="search" color={bgButton1} size={24} style={styles.icSearchChat} />
                <TextInput
                    style={styles.searchChat}
                    // onSubmitEditing={handleSearch}
                    value={search}
                    onChangeText={query => setSearch(query)}
                    placeholder="Nhập từ khóa tìm kiếm ..." />
            </View>
            <View>
                {loading ? ( // Show loading indicator when loading
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={orange} />
                    </View>
                ) : (
                    <FlatList
                        data={chatRooms}
                        keyExtractor={item => item.id}
                        renderItem={renderItem}
                        ListEmptyComponent={
                            <View style={{ marginTop: 50, alignItems: 'center' }}>
                                <Image source={require("../../assets/images/save.png")} style={styleShare.imageNullData} />
                                <Text style={styleShare.textMainOption}>Không có tin nhắn nào </Text>
                                <Text style={{ padding: 20, textAlign: 'center' }}>Bạn chưa có bất kỳ tin nhắn nào, kiểm tra lại sau</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    containerChatRoom: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 10
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    inputContainer: {
        flexDirection: 'row',
        backgroundColor: white,
        borderRadius: 10, padding: 15,
        alignItems: 'center',
        elevation: 2,
        marginBottom: 10,
        marginHorizontal: 20
    },
    searchChat: {
        flex: 1
    },
    icSearchChat: {
        marginRight: 5
    }
});
