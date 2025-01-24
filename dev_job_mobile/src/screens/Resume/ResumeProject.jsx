import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Text, TouchableOpacity } from 'react-native';
import StyleShare from '../../assets/themes/StyleShare';
import UIHeader from '../../components/UIHeader';
import { grey, mainColor, orange, white } from '../../assets/themes/Color';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Dropdown from '../../components/Dropdown';
import axios from 'axios';
import Modal from "react-native-modal";
import Icon from 'react-native-vector-icons/Ionicons';
import Button from '../../components/Button';
import { ToastMess } from '../../components/ToastMess';

export default function ResumeProject({ route, navigation }) {
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [selectedDateType, setSelectedDateType] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const showDatePicker = (dateType) => {
        setSelectedDateType(dateType);  // Set the type of date (start or end) to be selected
        setDatePickerVisibility(true);  // Show the date picker modal
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);  // Hide the date picker modal
    };

    const handleConfirm = (date) => {
        if (selectedDateType === 'start') {
            setStartDate(date);
            setEndDate(null)
        } else if (selectedDateType === 'end') {
            setEndDate(date);
        }
        hideDatePicker();  // Close the date picker modal
    };
    return (
        <View style={StyleShare.container}>
            <UIHeader
                leftIcon={"arrow-back"}
                title={'Thêm mới dự án đã tham gia'}
                handleLeftIcon={() => { navigation.goBack() }} />
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={StyleShare.manageJob}>
                    <Text style={styles.textInput}>Tên dự án <Text style={{ color: 'red' }}>*</Text></Text>
                    <TextInput
                        style={styles.introduceInput}
                    />

                    <View style={StyleShare.flexBetween}>
                        <View style={{ width: '48%' }}>
                            <Text style={styles.textInput}>Ngày bắt đầu <Text style={{ color: 'red' }}>*</Text></Text>
                            <TouchableOpacity
                                style={styles.introduceInput}
                                onPress={() => showDatePicker('start')}
                            >
                                <Text style={{ fontWeight: '500' }}>
                                    {startDate ? startDate.toLocaleDateString() : 'Chọn ngày bắt đầu'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* End Date */}
                        <View style={{ width: '48%' }}>
                            <Text style={styles.textInput}>Ngày kết thúc <Text style={{ color: 'red' }}>*</Text></Text>
                            <TouchableOpacity
                                style={styles.introduceInput}
                                onPress={() => showDatePicker('end')}
                            >
                                <Text style={{ fontWeight: '500' }}>
                                    {endDate ? endDate.toLocaleDateString() : 'Chọn ngày kết thúc'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <DateTimePickerModal
                            isVisible={isDatePickerVisible}
                            mode="date"
                            onConfirm={handleConfirm}
                            onCancel={hideDatePicker}
                        />
                    </View>

                    <Text style={styles.textInput}>Github <Text style={{ color: 'red' }}>*</Text></Text>
                    <TextInput
                        style={styles.introduceInput}
                        placeholder="Link project Github"
                        keyboardType="url"  // Nhập URL
                        autoCapitalize="none"

                    />

                    <Text style={styles.textInput}>Mô tả chi tiết <Text style={{ color: 'red' }}>*</Text></Text>
                    <TextInput
                        style={[styles.introduceInput, { height: 120, textAlignVertical: 'top' }]}
                        multiline
                        numberOfLines={8}
                    />


                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    textInput: {
        fontWeight: 'bold',
        color: mainColor,
        marginTop: 10,
        marginBottom: 5
    },
    introduceInput: {
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 13,
        backgroundColor: white,
        borderColor: grey,
        borderWidth: 2,
    },
});
