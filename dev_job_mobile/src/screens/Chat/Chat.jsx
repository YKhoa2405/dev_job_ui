import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableWithoutFeedback,
  TouchableOpacity,
  TextInput,
} from "react-native";
import UIHeader from "../../components/UIHeader";
import { StyleSheet } from "react-native";
import { mainColor, orange, white } from "../../assets/themes/Color";
import { Avatar } from "react-native-paper";
import moment from "moment";
import Icon from "react-native-vector-icons/Ionicons";
import StyleShare from "../../assets/themes/StyleShare";
import { onSnapshot, collection, getDoc, doc } from "firebase/firestore";
import { storeDb } from "../../assets/config/Key";
import Loading from "../../components/Loading";

export default function Chat({ navigation, route }) {
  const { currentUserId } = route.params;
  const [searchKeywork, setSearchKeywork] = useState("");
  const [loading, setLoading] = useState(true);
  const [chatRooms, setChatRooms] = useState([]);

  async function getListUserReceiver(userId) {
    const userDoc = await getDoc(doc(storeDb, "users", userId));
    return userDoc.exists() ? userDoc.data() : null;
  }

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(storeDb, "chatRooms"), async (snapshot) => {
      const rooms = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          const lastMessage = data.lastMessage || {};

          if (data.participants.includes(currentUserId)) {
            const participantId = data.participants.find((receiverId) => receiverId !== currentUserId);
            const userReceiver = await getListUserReceiver(participantId);
            return {
              id: doc.id,
              ...data,
              lastMessageText: lastMessage.text,
              lastMessageTimestamp: lastMessage.timestamp,
              participants: [
                {
                  id: userReceiver.id,
                  email: userReceiver.email,
                  name: userReceiver.name,
                  avatar: userReceiver.avatar,
                },
              ],
            };
          } else {
            return null;
          }
        })
      );

      const filteredRooms = rooms.filter((room) => room !== null);
      setChatRooms(filteredRooms);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  const renderItem = ({ item }) => {
    const isSender = item.lastMessage.senderId === currentUserId;
    return (
      <TouchableWithoutFeedback
        onPress={() =>
          navigation.navigate("ChatDetail", {
            userReceiver: {
              id: item.participants[0].id,
              avatar: item.participants[0].avatar,
              name: item.participants[0].name,
              email: item.participants[0].email,
            },
            currentUserId: currentUserId,
          })
        }
      >
        <View style={styles.containerChatRoom}>
          <Avatar.Image source={{ uri: item.participants[0].avatar }} size={50} style={styles.avatar} />
          <View style={styles.chatContent}>
            <View style={StyleShare.flexBetween}>
              <Text style={StyleShare.titleText16} numberOfLines={1}>
                {item.participants[0].name.length > 25
                  ? item.participants[0].name.slice(0, 25) + "..."
                  : item.participants[0].name}
              </Text>
              <Text style={styles.timestamp}>
                {item.lastMessageTimestamp ? moment(item.lastMessageTimestamp.toDate()).fromNow() : ""}
              </Text>
            </View>
            <Text style={styles.lastMessage} ellipsizeMode="tail" numberOfLines={1}>
              {isSender ? `Bạn: ${item.lastMessage.text}` : item.lastMessage.text}
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  return (
    <View style={styles.container}>
      <UIHeader
        leftIcon={"arrow-back"}
        handleLeftIcon={() => navigation.goBack()}
        title={"Nhắn tin"}
      />
      <View style={{ paddingHorizontal: 20 }}>
        <View style={StyleShare.searchDetail}>
          <Icon name="search" color={mainColor} size={24} style={{ marginRight: 10 }} />
          <TextInput
            style={StyleShare.searchInput}
            placeholder="Nhập tên người dùng..."
            value={searchKeywork}
            onChangeText={(text) => setSearchKeywork(text)}
            onSubmitEditing={() => navigation.navigate("JobSearch", { query: searchKeywork })}
          />
        </View>
      </View>

      {loading ? (
        <Loading />
      ) : (
        <FlatList
          data={chatRooms}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.chatList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Image source={require("../../assets/images/save.png")} style={StyleShare.imageNullData} />
              <Text style={StyleShare.titleText20}>Không có tin nhắn nào</Text>
              <Text style={styles.emptyText}>Bạn chưa có bất kỳ tin nhắn nào, kiểm tra lại sau</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.chatBotContainer}
        onPress={() => navigation.navigate("ChatBot", { userId: currentUserId })}
        activeOpacity={0.8}
      >
        <Avatar.Image
          source={require("../../assets/images/happy.png")}
          size={60}
          style={styles.chatBotAvatar}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerChatRoom: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: white,
    borderRadius: 10,
    marginHorizontal: 10,
    marginVertical: 5,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatar: {
    marginEnd: 15,
  },
  chatContent: {
    flex: 1,
    justifyContent: "center",
  },
  timestamp: {
    color: "grey",
    fontSize: 12,
  },
  lastMessage: {
    marginTop: 5,
    color: "#666",
    fontSize: 14,
  },
  chatList: {
    paddingBottom: 80, // Để không bị che bởi chatBotContainer
  },
  emptyContainer: {
    marginTop: 50,
    alignItems: "center",
  },
  emptyText: {
    padding: 20,
    textAlign: "center",
    color: "#666",
    fontSize: 16,
  },
  chatBotContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: white,
    borderRadius: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  chatBotAvatar: {
    marginEnd: 0,
  },
});