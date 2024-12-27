
import { View, Text, FlatList, Image, TouchableWithoutFeedback, ActivityIndicator, TouchableOpacity, TextInput } from "react-native";

import UIHeader from "../../components/UIHeader";
import { StyleSheet } from "react-native";
import { mainColor, orange, white } from "../../assets/themes/Color";
import { Avatar } from "react-native-paper";
import moment from "moment";
import Icon from "react-native-vector-icons/Ionicons"
import { useState, useEffect } from "react";
import StyleShare from "../../assets/themes/StyleShare";
import { onSnapshot, collection, getDoc, doc } from "firebase/firestore";
import { storeDb } from "../../assets/config/Firebase";

export default function Chat({ navigation, route }) {
    const { currentUserId } = route.params;
    const [searchKeywork, setSearchKeywork] = useState('')
    const [loading, setLoading] = useState(true)
    const [chatRooms, setChatRooms] = useState([]);
    
    async function getListUserReceiver(userId) {
        const userDoc = await getDoc(doc(storeDb, 'users', userId));
        return userDoc.exists() ? userDoc.data() : null;
    }

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(storeDb, 'chatRooms'), async (snapshot) => {
            const rooms = await Promise.all(snapshot.docs.map(async (doc) => {
                const data = doc.data();
                const lastMessage = data.lastMessage || {};

                // Kiểm tra nếu user.id tồn tại trong participants
                if (data.participants.includes(currentUserId)) {
                    // Lấy thông tin chi tiết của những người tham gia từ collection 'users'
                    const participantId = data.participants.find(receiverId => receiverId !== currentUserId); // Lấy ID khác với user.id hiện tại

                    const userReceiver = await getListUserReceiver(participantId);
                    return {
                        id: doc.id,
                        ...data,
                        lastMessageText: lastMessage.text,
                        lastMessageTimestamp: lastMessage.timestamp,
                        participants: [{
                            id: userReceiver.id,
                            email: userReceiver.email,
                            name: userReceiver.name,
                            avatar: userReceiver.avatar,
                        }],
                    };
                } else {
                    return null; // Nếu không phải là participant, trả về null
                }
            }));
            console.log(rooms)

            // Lọc ra các phòng chat hợp lệ (không null)
            const filteredRooms = rooms.filter(room => room !== null);
            setChatRooms(filteredRooms);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUserId]);

    const renderItem = ({ item }) => {
        const isSender = item.lastMessage.senderId === currentUserId;
        return (
            <TouchableWithoutFeedback onPress={() => navigation.navigate("ChatDetail", {
                userReceiver: {
                    id: item.participants[0].id,
                    avatar: item.participants[0].avatar,
                    name: item.participants[0].name,
                    email: item.participants[0].email,
                },
                currentUserId: currentUserId,
            })}>
                <View style={styles.containerChatRoom}>
                    <Avatar.Image source={{ uri: item.participants[0].avatar }} size={50} style={{ marginEnd: 15 }} />
                    <View style={{ flex: 1 }}>
                        <View style={StyleShare.flexBetween}>
                            <Text style={StyleShare.titleText16}>
                                {item.participants[0].name.length > 25
                                    ? item.participants[0].name.slice(0, 25) + "..."
                                    : item.participants[0].name}
                            </Text>
                            <Text style={{ color: 'grey' }}>{item.lastMessageTimestamp ? moment(item.lastMessageTimestamp.toDate()).fromNow() : ''} </Text>

                        </View>
                        <Text style={{ marginTop: 5 }} ellipsizeMode="tail" numberOfLines={1}>{isSender ? `Bạn: ${item.lastMessage.text}` : item.lastMessage.text}</Text>

                    </View>
                </View>
            </TouchableWithoutFeedback >
        )
    };

    return (
        <View style={{ flex: 1 }}>
            <UIHeader
                leftIcon={"arrow-back"}
                handleLeftIcon={() => { navigation.goBack() }}
                title={'Nhắn tin'} />
            <View style={{ paddingHorizontal: 20 }}>
                <View style={StyleShare.searchDetail}>
                    <Icon name="search" color={mainColor} size={24} style={{ marginRight: 10 }} />
                    <TextInput
                        style={StyleShare.searchInput}
                        placeholder="Nhập tên người dùng..."
                        value={searchKeywork}
                        onChangeText={(text) => setSearchKeywork(text)}
                        onSubmitEditing={() => navigation.navigate('JobSearch', { query: searchContent })}
                    />
                </View>

            </View>
            <View>
                {loading ? (
                    <ActivityIndicator color={orange} size={'large'} />
                ) : (
                    <FlatList
                        data={chatRooms}
                        keyExtractor={item => item.id}
                        renderItem={renderItem}
                        ListEmptyComponent={
                            <View style={{ marginTop: 50, alignItems: 'center' }}>
                                <Image source={require("../../assets/images/save.png")} style={StyleShare.imageNullData} />
                                <Text style={StyleShare.titleText20}>Không có tin nhắn nào </Text>
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