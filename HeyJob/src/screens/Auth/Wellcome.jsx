import React from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity } from "react-native";
import { bgButton1, orange, white } from "../../assets/theme/color";
import Icon from "react-native-vector-icons/MaterialIcons";
import styleShare from "../../assets/theme/style";


export default function Wellcome({ navigation }) {
    return (
        <View style={styles.container}>
            <Image style={styleShare.imageLogin} source={require("../../assets/images/pic_wellcome.png")} />
            <View>
                <Text style={styles.desc}>Tìm kiếm</Text>
                <Text style={styles.descMain}>Công Việc Mơ Ước</Text>
                <Text style={styles.desc}>Của Bạn Ở Đây</Text>
            </View>
            <View style={{ marginTop: 20 }}>
                <Text style={{ fontSize: 14 }}>Khám phá tất cả các công việc thú vị nhất dựa trên sở thích và chuyên ngành học của bạn.</Text>
            </View>
            <TouchableOpacity style={styles.butonNext} onPress={() => { navigation.navigate("Login") }}>
                <Icon name="arrow-forward" size={30} color={"white"} />
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        backgroundColor: white
    }
    , desc: {
        fontWeight: 'bold',
        fontSize: 40,
    },
    descMain: {
        fontWeight: 'bold',
        fontSize: 40,
        color: orange,
        marginVertical: -3
    }, butonNext: {
        width: 60,
        height: 60,
        backgroundColor: bgButton1,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,

    }
})
