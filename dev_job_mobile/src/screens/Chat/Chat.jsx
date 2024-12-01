
import { View, Text, FlatList, Image, TouchableWithoutFeedback, ActivityIndicator, TouchableOpacity, TextInput } from "react-native";

import UIHeader from "../../components/UIHeader";
import { StyleSheet } from "react-native";
import { mainColor, orange, white } from "../../assets/themes/Color";
import { Avatar } from "react-native-paper";
import moment from "moment";
import Icon from "react-native-vector-icons/Ionicons"
import { useState } from "react";
import StyleShare from "../../assets/themes/StyleShare";
import Loading from "../../components/Loading";

export default function Chat({ navigation }) {
    const [searchKeywork, setSearchKeywork] = useState('')
    const [loading, setLoading] = useState(false)
    const chatRooms=[
        1,2
    ]

    const renderItem = ({ item }) => {
        return (
            <TouchableWithoutFeedback onPress={()=>navigation.navigate('ChatDetail')}>
                <View style={styles.containerChatRoom}>
                    <Avatar.Image  size={50} style={{ marginEnd: 15 }} />
                    <View style={{ flex: 1 }}>
                        <View style={StyleShare.flexBetween}>
                            <Text style={StyleShare.titleText16}>Name</Text>
                            <Text style={{ color: 'grey' }}>
                                16h60
                            </Text>
                        </View>
                        <Text style={{ marginTop: 5 }} ellipsizeMode="tail" numberOfLines={1}>Tin han cuoi</Text>
                    </View>
                </View>
            </TouchableWithoutFeedback >
        )
    };

    return (
        <View style={{ flex: 1 }}>
            <UIHeader title={'Nhắn tin'} />
            <View style={{paddingHorizontal:20}}>
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
                    <Loading/>
                ) : (
                    <FlatList
                        data={chatRooms}
                        // keyExtractor={item => item.id}
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