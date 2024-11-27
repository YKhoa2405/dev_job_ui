import React, { useContext, useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { bgButton1 } from "../assets/theme/color";

const UIHeader = ({ title, leftIcon, rightIcon, handleLeftIcon, handleRightIcon }) => {

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={handleLeftIcon}>
                <Icon name={leftIcon} size={26} color={bgButton1} />
            </TouchableOpacity>
            <Text style={styles.name}>{title}</Text>
            <TouchableOpacity onPress={handleRightIcon}>
                <Icon name={rightIcon} size={26} color={bgButton1} />
            </TouchableOpacity>
        </View>
    )
}

export default UIHeader

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom:10

    },
    name: {
        fontSize:18,
        fontWeight: '500'
    }
})