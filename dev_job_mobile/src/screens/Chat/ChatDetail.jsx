import React, { useCallback, useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { Avatar } from "react-native-paper";
import Icon from "react-native-vector-icons/Ionicons"
import { GiftedChat, Send } from "react-native-gifted-chat";
import StyleShare from "../../assets/themes/StyleShare";
import { grey, mainColor, white } from "../../assets/themes/Color";

export default function ChatDetail({ route, navigation }) {
    const [messages, setMessages] = useState([])


    return (
        <View style={{ backgroundColor: white, flex: 1 }}>
            <View style={styles.container}>
                <View style={StyleShare.flexCenter}>
                    <TouchableOpacity onPress={() => { navigation.goBack() }}>
                        <Icon size={26} name={"arrow-back"} />
                    </TouchableOpacity>

                    {/* {userReceiver && userReceiver.avatar && (
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
                    )} */}

                </View>
                <TouchableOpacity>
                    <Icon size={26} name={"ellipsis-horizontal"} />
                </TouchableOpacity>
            </View>
            <GiftedChat/>
            
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