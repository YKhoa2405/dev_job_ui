import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Text, TouchableOpacity } from 'react-native';
import { Checkbox } from 'react-native-paper';
import DateTimePickerModal from 'react-native-modal-datetime-picker'; // Import DateTimePickerModal
import StyleShare from '../../assets/themes/StyleShare';
import UIHeader from '../../components/UIHeader';
import { grey, mainColor, orange, textColor, white } from '../../assets/themes/Color';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';
import { addExperience } from '../../redux/slice/resumeSlice';
import { ToastMess } from '../../components/ToastMess';
import { geminiService } from '../../assets/config/GeminiService';

// Utility function to format date to dd/mm/yyyy
const formatDate = (date) => {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

// Utility function to validate experience dates (endDate must be after startDate)
const isValidExperienceDates = (startDate, endDate) => {
    return startDate < endDate;
};

export default function ResumeExperience({ navigation }) {
    const [loading, setLoading] = useState(false);
    const [experiences, setExperiences] = useState([
        { id: new Date().getTime(), company: '', position: '', description: '', startDate: '', endDate: '' },
    ]);
    const [noExperience, setNoExperience] = useState(false);
    const [datePickerVisible, setDatePickerVisible] = useState({}); // State for date picker visibility

    const dispatch = useDispatch();

    // Show date picker for a specific experience and field
    const showDatePicker = (index, field) => {
        setDatePickerVisible((prev) => ({ ...prev, [`${index}_${field}`]: true }));
    };

    // Hide date picker for a specific experience and field
    const hideDatePicker = (index, field) => {
        setDatePickerVisible((prev) => ({ ...prev, [`${index}_${field}`]: false }));
    };

    // Handle date selection
    const handleDateConfirm = (index, field, date) => {
        const updated = [...experiences];
        updated[index][field] = formatDate(date);
        setExperiences(updated);
        setDatePickerVisible((prev) => ({ ...prev, [`${index}_${field}`]: false }));
    };

    const handleAddExperience = () => {
        setExperiences([
            ...experiences,
            { id: new Date().getTime(), company: '', position: '', description: '', startDate: '', endDate: '' },
        ]);
    };

    const handleDeleteExperience = (id) => {
        setExperiences(experiences.filter((exp) => exp.id !== id));
    };

    const handleInputChange = (index, field, value) => {
        const updated = [...experiences];
        updated[index][field] = value;
        setExperiences(updated);
    };

    const handleGenerateExample = async (index) => {
        setLoading(true);
        try {
            const position = experiences[index].position.trim();
            const company = experiences[index].company.trim();

            if (!position || !company) {
                ToastMess({ type: 'error', text1: 'Vui lòng nhập đầy đủ thông tin!' });
                return;
            }

            const prompt = `
                You are a professional HR writer.
                Write a concise **Vietnamese** job description for the position "${position}" at the company "${company}".
                Use bullet points only.
                Do not include any titles or headings.
                Return only the bullet points in Vietnamese.
                `;

            const response = await geminiService(prompt);
            handleInputChange(index, 'description', response);
        } catch (error) {
            console.error('Error generating example:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = () => {
        if (noExperience) {
            dispatch(addExperience([]));
            navigation.navigate('ResumeProject');
            return;
        }

        for (const exp of experiences) {
            if (!exp.company || !exp.position || !exp.startDate || !exp.endDate) {
                ToastMess({ type: 'error', text1: 'Vui lòng nhập đầy đủ thông tin.' });
                return;
            }

            // Validate endDate > startDate
            const startDate = new Date(exp.startDate.split('/').reverse().join('-'));
            const endDate = new Date(exp.endDate.split('/').reverse().join('-'));
            if (!isValidExperienceDates(startDate, endDate)) {
                ToastMess({ type: 'error', text1: 'Ngày kết thúc phải sau ngày bắt đầu.' });
                return;
            }
        }

        dispatch(addExperience(experiences));
        navigation.navigate('ResumeProject');
    };

    return (
        <View style={StyleShare.container}>
            <UIHeader
                leftIcon={'arrow-back'}
                title={'Kinh nghiệm làm việc'}
                handleLeftIcon={() => navigation.goBack()}
            />
            <ScrollView>
                {/* Checkbox for no experience */}
                <View style={styles.checkboxContainer}>
                    <Checkbox
                        status={noExperience ? 'checked' : 'unchecked'}
                        onPress={() => {
                            setNoExperience(!noExperience);
                            if (!noExperience) {
                                setExperiences([]);
                            } else {
                                setExperiences([
                                    {
                                        id: new Date().getTime(),
                                        company: '',
                                        position: '',
                                        description: '',
                                        startDate: '',
                                        endDate: '',
                                    },
                                ]);
                            }
                        }}
                        color={mainColor}
                        uncheckedColor={mainColor}
                    />
                    <Text style={styles.checkboxLabel}>Tôi chưa có kinh nghiệm làm việc</Text>
                </View>

                {!noExperience &&
                    experiences.map((exp, index) => (
                        <View key={exp.id} style={StyleShare.manageJob}>
                            {/* Date Picker Modals for each experience */}
                            <DateTimePickerModal
                                isVisible={datePickerVisible[`${index}_startDate`] || false}
                                mode="date"
                                onConfirm={(date) => handleDateConfirm(index, 'startDate', date)}
                                onCancel={() => hideDatePicker(index, 'startDate')}
                            />
                            <DateTimePickerModal
                                isVisible={datePickerVisible[`${index}_endDate`] || false}
                                mode="date"
                                onConfirm={(date) => handleDateConfirm(index, 'endDate', date)}
                                onCancel={() => hideDatePicker(index, 'endDate')}
                            />

                            <View style={StyleShare.flexBetween}>
                                <Text style={styles.textInput}>
                                    Tên công ty <Text style={{ color: 'red' }}>*</Text>
                                </Text>
                                {index > 0 && (
                                    <TouchableOpacity onPress={() => handleDeleteExperience(exp.id)}>
                                        <Icon name="close" size={22} color={'red'} />
                                    </TouchableOpacity>
                                )}
                            </View>
                            <TextInput
                                style={styles.introduceInput}
                                value={exp.company}
                                onChangeText={(text) => handleInputChange(index, 'company', text)}
                            />
                            <View style={StyleShare.flexBetween}>
                                <View style={{ width: '48%' }}>
                                    <Text style={styles.textInput}>
                                        Ngày bắt đầu <Text style={{ color: 'red' }}>*</Text>
                                    </Text>
                                    <TouchableOpacity onPress={() => showDatePicker(index, 'startDate')}>
                                        <TextInput
                                            style={styles.introduceInput}
                                            placeholder="dd/mm/yyyy"
                                            value={exp.startDate}
                                            editable={false} // Prevent manual input
                                        />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ width: '48%' }}>
                                    <Text style={styles.textInput}>
                                        Ngày kết thúc <Text style={{ color: 'red' }}>*</Text>
                                    </Text>
                                    <TouchableOpacity onPress={() => showDatePicker(index, 'endDate')}>
                                        <TextInput
                                            style={styles.introduceInput}
                                            placeholder="dd/mm/yyyy"
                                            value={exp.endDate}
                                            editable={false} // Prevent manual input
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <Text style={styles.textInput}>
                                Chức vụ <Text style={{ color: 'red' }}>*</Text>
                            </Text>
                            <TextInput
                                style={styles.introduceInput}
                                value={exp.position}
                                onChangeText={(text) => handleInputChange(index, 'position', text)}
                            />
                            <View style={StyleShare.flexBetween}>
                                <Text style={styles.textInput}>Mô tả chi tiết cho chức vụ này</Text>
                                {loading ? (
                                    <Text style={{ color: 'grey', fontWeight: 'bold' }}>Đang tải...</Text>
                                ) : (
                                    <TouchableOpacity onPress={() => handleGenerateExample(index)}>
                                        <Text style={{ color: 'grey', fontWeight: 'bold' }}>Gợi ý với AI</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                            <TextInput
                                style={[styles.introduceInput, { height: 200, textAlignVertical: 'top' }]}
                                multiline
                                numberOfLines={12}
                                value={exp.description}
                                onChangeText={(text) => {
                                    if (text.trim() === '') {
                                        handleInputChange(index, 'description', '');
                                        return;
                                    }
                                    let formattedText = text
                                        .split('\n')
                                        .map((line) => (line.startsWith('- ') ? line : `- ${line}`))
                                        .join('\n');
                                    handleInputChange(index, 'description', formattedText);
                                }}
                            />
                        </View>
                    ))}

                {!noExperience && (
                    <TouchableOpacity
                        style={[StyleShare.flexCenter, styles.saveButton, { backgroundColor: orange }]}
                        onPress={handleAddExperience}
                    >
                        <Text style={[StyleShare.titleText16, { color: 'white' }]}>Thêm mới kinh nghiệm</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
            <TouchableOpacity style={[StyleShare.flexCenter, styles.saveButton]} onPress={handleSave}>
                <Text style={[StyleShare.titleText16, { color: 'white' }]}>Tiếp tục</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    textInput: {
        fontWeight: 'bold',
        color: mainColor,
        marginTop: 10,
        marginBottom: 5,
    },
    introduceInput: {
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 13,
        backgroundColor: white,
        borderColor: grey,
        borderWidth: 2,
    },
    saveButton: {
        backgroundColor: mainColor,
        padding: 15,
        marginBottom: 10,
        marginHorizontal: 20,
        borderRadius: 10,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 10,
        backgroundColor: white,
    },
    checkboxLabel: {
        marginLeft: 8,
        color: textColor,
        fontSize: 16,
    },
});