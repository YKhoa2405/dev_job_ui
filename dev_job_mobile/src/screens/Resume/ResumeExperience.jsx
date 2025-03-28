import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Text, TouchableOpacity } from 'react-native';
import { Checkbox } from 'react-native-paper'; // Thêm import từ react-native-paper
import StyleShare from '../../assets/themes/StyleShare';
import UIHeader from '../../components/UIHeader';
import { grey, mainColor, orange, textColor, white } from '../../assets/themes/Color';
import Icon from "react-native-vector-icons/Ionicons";
import { useDispatch } from 'react-redux';
import { addExperience } from '../../redux/slice/resumeSlice';
import { ToastMess } from '../../components/ToastMess';
import { geminiService } from '../../assets/config/GeminiService';

export default function ResumeExperience({ navigation }) {
    const [loading, setLoading] = useState(false);
    const [experiences, setExperiences] = useState([
        { id: new Date().getTime(), company: '', position: '', description: '', startDate: '', endDate: '' }
    ]);
    const [noExperience, setNoExperience] = useState(false);

    const dispatch = useDispatch();

    const handleAddExperience = () => {
        setExperiences([
            ...experiences,
            { id: new Date().getTime(), company: '', position: '', description: '', startDate: '', endDate: '' }
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

            const prompt = `Viết mô tả công việc cho vị trí ${position} tại ${company}, ngắn gọn, sử dụng gạch đầu dòng, bỏ các tiêu đề.`;
            const response = await geminiService(prompt);
            handleInputChange(index, 'description', response);
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
        }
        dispatch(addExperience(experiences));
        navigation.navigate('ResumeProject');
    };

    return (
        <View style={StyleShare.container}>
            <UIHeader
                leftIcon={"arrow-back"}
                title={'Kinh nghiệm làm việc'}
                handleLeftIcon={() => navigation.goBack()}
            />
            <ScrollView>
                {/* Sử dụng Checkbox từ react-native-paper */}
                <View style={styles.checkboxContainer}>
                    <Checkbox
                        status={noExperience ? 'checked' : 'unchecked'}
                        onPress={() => {
                            setNoExperience(!noExperience);
                            if (!noExperience) {
                                setExperiences([]);
                            } else {
                                setExperiences([{ 
                                    id: new Date().getTime(), 
                                    company: '', 
                                    position: '', 
                                    description: '', 
                                    startDate: '', 
                                    endDate: '' 
                                }]);
                            }
                        }}
                        color={mainColor}
                        uncheckedColor={mainColor}
                    />
                    <Text style={styles.checkboxLabel}>Tôi chưa có kinh nghiệm làm việc</Text>
                </View>

                {!noExperience && experiences.map((exp, index) => (
                    <View key={exp.id} style={StyleShare.manageJob}>
                        <View style={StyleShare.flexBetween}>
                            <Text style={styles.textInput}>Tên công ty <Text style={{ color: 'red' }}>*</Text></Text>
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
                                <Text style={styles.textInput}>Ngày bắt đầu <Text style={{ color: 'red' }}>*</Text></Text>
                                <TextInput
                                    style={styles.introduceInput}
                                    placeholder="dd/mm/yyyy"
                                    value={exp.startDate}
                                    onChangeText={(text) => handleInputChange(index, 'startDate', text)}
                                />
                            </View>
                            <View style={{ width: '48%' }}>
                                <Text style={styles.textInput}>Ngày kết thúc <Text style={{ color: 'red' }}>*</Text></Text>
                                <TextInput
                                    style={styles.introduceInput}
                                    placeholder="dd/mm/yyyy"
                                    value={exp.endDate}
                                    onChangeText={(text) => handleInputChange(index, 'endDate', text)}
                                />
                            </View>
                        </View>
                        <Text style={styles.textInput}>Chức vụ <Text style={{ color: 'red' }}>*</Text></Text>
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
                                    <Text style={{ color: 'grey', fontWeight: 'bold' }}>Ví dụ</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        <TextInput
                            style={[styles.introduceInput, { height: 200, textAlignVertical: 'top' }]}
                            multiline
                            numberOfLines={12}
                            value={exp.description}
                            onChangeText={(text) => {
                                if (text.trim() === "") {
                                    handleInputChange(index, 'description', "");
                                    return;
                                }
                                let formattedText = text
                                    .split('\n')
                                    .map(line => line.startsWith('- ') ? line : `- ${line}`)
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
            <TouchableOpacity 
                style={[StyleShare.flexCenter, styles.saveButton]} 
                onPress={handleSave}
            >
                <Text style={[StyleShare.titleText16, { color: 'white' }]}>Tiếp tục</Text>
            </TouchableOpacity>
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
        backgroundColor:white
    },
    checkboxLabel: {
        marginLeft: 8,
        color: textColor,
        fontSize: 16,
    }
});