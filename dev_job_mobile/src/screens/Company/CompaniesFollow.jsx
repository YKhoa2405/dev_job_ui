import { StyleSheet, View, Text, TouchableWithoutFeedback, Image, TouchableOpacity, FlatList } from "react-native";
import UIHeader from "../../components/UIHeader";
import StyleShare from "../../assets/themes/StyleShare";
import { bgButton2, mainColor, white, orange } from "../../assets/themes/Color";
import Dropdown from "../../components/Dropdown";
import Icon from 'react-native-vector-icons/Ionicons'
import { Avatar, Chip } from "react-native-paper";
import { useEffect, useState } from "react";
import axios from "axios";


export default function CompaniesFollow({ navigation }) {


    const renderItem = ({ item }) => {
        return (
            <TouchableWithoutFeedback>
                <View style={styles.followContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Avatar.Image size={36} style={{ backgroundColor: 'white', marginRight: 5 }} />
                        <View style={{ flex: 1 }}>
                            <Text style={StyleShare.titleText16}>Tên công ty</Text>
                        </View>
                    </View>
                    <View style={[StyleShare.flexBetween, { marginVertical: 10 }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Icon name="business-outline" size={18} />
                            <Text style={{ fontWeight: '500', marginHorizontal: 5 }}>5</Text>
                            <Text>công việc</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Icon name="person-outline" size={18} />
                            <Text style={{ fontWeight: '500', marginHorizontal: 5 }}>10</Text>
                            <Text>người theo dõi</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.buttonUnfollow}>
                        <Text style={{ color: white, fontWeight: 500 }}>Đang theo dõi</Text>
                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
        )
    };

    return (
        <View style={StyleShare.container}>
            <UIHeader leftIcon={"arrow-back"}
                title={'Công ty đã theo dõi'}
                handleLeftIcon={() => { navigation.goBack() }} />
            <View style={{ marginHorizontal: 20, marginTop: 5 }}>
                <Text style={StyleShare.titleText16}>20 công ty</Text>
            </View>
            <FlatList
                // data={jobs}
                renderItem={renderItem}
                // keyExtractor={item => item.job.id.toString()}
                ListEmptyComponent={
                    <View style={{ marginTop: 50, alignItems: 'center' }}>
                        <Image source={require("../../assets/images/save.png")} style={StyleShare.imageNullData} />
                        <Text style={StyleShare.titleText20}>Bạn chưa theo dõi công ty</Text>
                        <Text style={{ padding: 20, textAlign: 'center' }}>Bạn chưa theo dõi bất kỳ công ty nào, hãy theo dõi công ty để nhận được thông báo việc làm mới nhất</Text>
                    </View>
                }
                contentContainerStyle={{ paddingBottom: 40 }}
            />

        </View>
    )
}

const styles = StyleSheet.create({
    followContainer: {
        backgroundColor: white,
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginTop: 10,
        marginHorizontal: 20
    },
    buttonUnfollow: {
        alignItems: 'center',
        backgroundColor: mainColor,
        padding: 8,
        borderRadius: 10,
        zIndex: 999
    },
})