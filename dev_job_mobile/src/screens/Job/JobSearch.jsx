import React, { useContext, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TouchableWithoutFeedback, TextInput } from "react-native";
import Icon from "react-native-vector-icons/Ionicons"
import { bgButton1, bgButton2, grey, mainColor, white } from "../../assets/themes/Color";
import StyleShare from "../../assets/themes/StyleShare";


export default function JobSearch({ navigation }) {

    return (
        <View style={[StyleShare.container, { marginHorizontal: 20 }]}>
            <View style={[StyleShare.flexBetween, { marginTop: 30, marginBottom: 10 }]}>
                <Icon name="arrow-back" size={26} color={mainColor} onPress={() => navigation.goBack()} />

                <TextInput
                    style={StyleShare.searchHome}
                    // onSubmitEditing={handleSearch}
                    // value={searchQuery}
                    // onChangeText={query => setSearchQuery(query)}
                    placeholder="Nhập từ khóa để tìm kiếm ..." />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    recentSearchItem: {
        paddingVertical: 15,
        flexDirection: 'row',
        alignItems: 'center'
    },
    jobTitle: {
        marginLeft: 10
    },

})