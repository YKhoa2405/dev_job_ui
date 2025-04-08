import React from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import StyleShare from "../../assets/themes/StyleShare";
import { mainColor, orange, textColor, white } from "../../assets/themes/Color";


export default function Wellcome({ navigation }) {
    return (
        <View style={styles.container}>
            <Image style={StyleShare.imageLogin} source={require("../../assets/images/wellcome.png")} />
            <View>
                <Text style={styles.desc}>Tìm kiếm</Text>
                <Text style={styles.descMain}>Công Việc Mơ Ước</Text>
                <Text style={styles.desc}>Của Bạn Ở Đây</Text>
                <View style={{ marginTop: 20 }}>
                    <Text style={{ fontSize: 14, color: textColor, lineHeight: 25 }}>Khám phá tất cả các công việc thú vị nhất dựa trên sở thích và chuyên ngành học của bạn.</Text>
                </View>
            </View>
            <TouchableOpacity style={styles.butonNext} onPress={() => { navigation.navigate("Login") }} >
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
    }, butonNext: {
        width: 60,
        height: 60,
        backgroundColor: mainColor,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,

    }
})
