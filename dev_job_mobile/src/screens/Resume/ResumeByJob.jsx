import React, { useEffect, useState } from "react"
import { View, Text, TouchableOpacity, TouchableWithoutFeedback, Image, TextInput, ScrollView, StyleSheet, ActivityIndicator } from "react-native"
import StyleShare from "../../assets/themes/StyleShare"
import UIHeader from "../../components/UIHeader"
import { bgButton2, grey, mainColor, white, orange } from "../../assets/themes/Color"
import Icon from 'react-native-vector-icons/Ionicons'
import { useDispatch, useSelector } from "react-redux"
import { fetchListCvByUser } from "../../redux/slice/cvSLice"
import moment from "moment"
import Loading from "../../components/Loading"
import * as DocumentPicker from 'expo-document-picker';
import { ToastMess } from "../../components/ToastMess";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi, endpoints } from "../../assets/config/API";

export default function ResumeByJob({ navigation, route }) {
    const { jobId } = route.params;
    console.log(jobId)
    return (
        <View>
            <UIHeader
                leftIcon={"arrow-back"}
                title={'Chi tiết tin tuyển dụng'}
                handleLeftIcon={() => { navigation.goBack() }} />
        </View>
    )
}

const styles = StyleSheet.create({
})