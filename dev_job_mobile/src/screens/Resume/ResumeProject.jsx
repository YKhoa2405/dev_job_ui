import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Text, TouchableOpacity } from 'react-native';
import StyleShare from '../../assets/themes/StyleShare';
import UIHeader from '../../components/UIHeader';
import { grey, mainColor, orange, white } from '../../assets/themes/Color';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Icon from "react-native-vector-icons/Ionicons";
import { useDispatch } from 'react-redux';
import { addProject } from '../../redux/slice/resumeSlice';
import { ToastMess } from '../../components/ToastMess';

export default function ResumeProject({ navigation }) {
    const dispatch = useDispatch();
    const [projects, setProjects] = useState([
        { id: new Date().getTime(), name: '', startDate: '', endDate: '', github: '', description: '' }
    ]);

    const handleAddProject = () => {
        setProjects([...projects, { id: new Date().getTime(), name: '', startDate: null, endDate: null, github: '', description: '' }]);
    };

    const handleDeleteProject = (id) => {
        setProjects(projects.filter((project) => project.id !== id));
    };

    const handleInputChange = (index, field, value) => {
        const updatedProjects = [...projects];
        updatedProjects[index][field] = value;
        setProjects(updatedProjects);
    };

    const handleSave = () => {
        // for (const project of projects) {
        //     if (!project.name || !project.description || !project.startDate || !project.endDate || !project.github) {
        //         ToastMess({ type: 'error', text1: 'Vui lòng nhập đầy đủ thông tin.' });
        //         return;
        //     }
        // }

        dispatch(addProject(projects));
        navigation.navigate('ResumeTemplates');
    };


    return (
        <View style={StyleShare.container}>
            <UIHeader
                leftIcon={"arrow-back"}
                title={'Dự án đã tham gia'}
                handleLeftIcon={() => navigation.goBack()}
            />
            <ScrollView>
                {projects.map((project, index) => (
                    <View key={project.id} style={StyleShare.manageJob}>
                        <View style={StyleShare.flexBetween}>
                            <Text style={styles.textInput}>Tên dự án <Text style={{ color: 'red' }}>*</Text></Text>
                            {index > 0 && (
                                <TouchableOpacity onPress={() => handleDeleteProject(project.id)} >
                                    <Icon name="close" size={22} color={'red'} />
                                </TouchableOpacity>
                            )}
                        </View>
                        <TextInput
                            style={styles.introduceInput}
                            value={project.name}
                            onChangeText={(text) => handleInputChange(index, 'name', text)}
                        />

                        <View style={StyleShare.flexBetween}>
                            <View style={{ width: '48%' }}>
                                <Text style={styles.textInput}>Ngày bắt đầu <Text style={{ color: 'red' }}>*</Text></Text>
                                <TextInput
                                    style={styles.introduceInput}
                                    placeholder="dd/mm/yyyy"
                                    value={project.startDate}
                                    onChangeText={(text) => handleInputChange(index, 'startDate', text)}
                                />
                            </View>

                            <View style={{ width: '48%' }}>
                                <Text style={styles.textInput}>Ngày kết thúc <Text style={{ color: 'red' }}>*</Text></Text>
                                <TextInput
                                    style={styles.introduceInput}
                                    placeholder="dd/mm/yyyy"
                                    value={project.endDate}
                                    onChangeText={(text) => handleInputChange(index, 'endDate', text)}
                                />
                            </View>
                        </View>

                        <Text style={styles.textInput}>Github <Text style={{ color: 'red' }}>*</Text></Text>
                        <TextInput
                            style={styles.introduceInput}
                            value={project.github}
                            keyboardType="url"
                            autoCapitalize="none"
                            onChangeText={(text) => handleInputChange(index, 'github', text)}
                        />

                        <Text style={styles.textInput}>Mô tả chi tiết <Text style={{ color: 'red' }}>*</Text></Text>

                        <TextInput
                            style={[styles.introduceInput, { height: 120, textAlignVertical: 'top' }]}
                            value={project.description}
                            multiline
                            numberOfLines={8}
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

                <TouchableOpacity style={[StyleShare.flexCenter, styles.saveButton, { backgroundColor: orange }]} onPress={handleAddProject}>
                    <Text style={[StyleShare.titleText16, { color: white }]}>Thêm mới dự án </Text>
                </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity style={[StyleShare.flexCenter, styles.saveButton]} onPress={handleSave}>
                <Text style={[StyleShare.titleText16, { color: white }]}>Lưu</Text>
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
        alignItems: 'center',
        elevation: 2
    }
});
