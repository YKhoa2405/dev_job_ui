import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Asset } from 'expo-asset';
import UIHeader from '../../components/UIHeader';
import { mainColor, orange, white, grey } from '../../assets/themes/Color';
import { ToastMess } from '../../components/ToastMess';
import StyleShare from '../../assets/themes/StyleShare';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, endpoints } from '../../assets/config/API';
import Button from '../../components/Button';

export default function ResumeTemplates({ navigation }) {
    const { personalInfo, experiences, projects, educations, skills } = useSelector((state) => state.resume);
    const [htmlContent, setHtmlContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState('1'); // Theo dõi template được chọn

    const templates = [
        { id: '1', name: 'Mẫu 1', source: require('../../assets/templates/cv_template1.html') },
        { id: '2', name: 'Mẫu 2', source: require('../../assets/templates/cv_template2.html') },
        { id: '3', name: 'Mẫu 3', source: require('../../assets/templates/cv_template3.html') },

    ];

    const loadTemplate = async (templateAsset, templateId) => {
        try {
            setSelectedTemplate(templateId);
            const asset = Asset.fromModule(templateAsset);
            await asset.downloadAsync();
            const fileUri = asset.localUri || asset.uri;
            let content = await FileSystem.readAsStringAsync(fileUri, { encoding: 'utf8' });
            const ResumeData = {
                fullName: personalInfo?.fullName || '',
                position: personalInfo?.position || '',
                dateOfBirth: personalInfo?.dateOfBirth || '',
                phone: personalInfo?.phone || '',
                email: personalInfo?.email || '',
                gender: personalInfo?.gender || '',
                githubLink: personalInfo?.githubLink || '',
                location: `${personalInfo?.address?.ward || ''}, ${personalInfo?.address?.district || ''}, ${personalInfo?.address?.province || ''}`,
                educations: (Array.isArray(educations[0]) ? educations[0] : educations)
                    .map(
                        (edu) => `
                        <p style="display: flex; justify-content: space-between;">
                            <strong>${edu.schoolName}</strong>
                            <strong>(${edu.startDate} - ${edu.endDate})</strong>
                        </p>
                        <p>Major: ${edu.major}</p>
                        <p>${edu.description.split('\n').map(line => line.trim()).join('<br>')}</p>
                    `
                    )
                    .join(''),
                experiences: (Array.isArray(experiences[0]) ? experiences[0] : experiences)
                    .map(
                        (ex) => `
                        <p style="display: flex; justify-content: space-between;">
                            <strong>${ex.company}</strong>
                            <strong>(${ex.startDate} - ${ex.endDate})</strong>
                        </p>
                        <p>Position: ${ex.position}</p>
                        <p>${ex.description.split('\n').map(line => line.trim()).join('<br>')}</p>
                    `
                    )
                    .join(''),
                projects: (Array.isArray(projects[0]) ? projects[0] : projects)
                    .map(
                        (pr) => `
                        <p style="display: flex; justify-content: space-between;">
                            <strong>${pr.name} (<a href="${pr.github}">${pr.github}</a>)</strong>
                            <strong>(${pr.startDate} - ${pr.endDate})</strong>
                        </p>
                        <p>${pr.description.split('\n').map(line => line.trim()).join('<br>')}</p>
                    `
                    )
                    .join(''),
                skills: (Array.isArray(skills[0]) ? skills[0] : skills)
                    .map(
                        (skill) => `
                        <li><strong>${skill.groupSkill || ''}</strong>: ${Array.isArray(skill.skillList) ? skill.skillList.join(', ') : skill.skillList || ''}</li>
                    `
                    )
                    .join('')
            };

            Object.keys(ResumeData).forEach((key) => {
                content = content.replace(new RegExp(`{{${key}}}`, 'g'), ResumeData[key] || '');
            });

            setHtmlContent(content);
        } catch (error) {
            ToastMess({ type: 'error', text1: 'Không thể tải mẫu CV.' });
        }
    };

    useEffect(() => {
        if (personalInfo && experiences && projects && educations && skills) {
            loadTemplate(templates[0].source, templates[0].id);
        }
    }, [personalInfo, experiences, projects, educations, skills]);

    const handleCreatePDF = async () => {
        try {
            setLoading(true);
            const fileName = `CV_${personalInfo?.nameCV || 'Unknown'}_${Date.now()}.pdf`.replace(/\s+/g, '_');
            const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

            const { uri } = await Print.printToFileAsync({ html: htmlContent });
            await FileSystem.moveAsync({ from: uri, to: fileUri });
            await handleUploadCV(fileUri, fileName);
            navigation.navigate('MainTab');
        } catch (error) {
            ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại.' });
        } finally {
            setLoading(false);
        }
    };

    const handleUploadCV = async (fileUri, fileName) => {
        try {
            const formData = new FormData();
            formData.append('name', fileName);
            formData.append('url', {
                uri: fileUri,
                name: fileName,
                type: 'application/pdf',
            });

            const token = await AsyncStorage.getItem('access_token');
            await authApi(token).post(endpoints['uploadCV'], formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            ToastMess({ type: 'success', text1: 'Tải lên thành công!' });
        } catch (error) {
            console.log(error.message);
        }
    };

    return (
        <View style={styles.container}>
            <UIHeader leftIcon="arrow-back" title="Chọn mẫu CV" handleLeftIcon={() => navigation.goBack()} />
            
            {/* Template Selection */}
            <View style={styles.templateContainer}>
                <FlatList
                    horizontal
                    data={templates}
                    keyExtractor={(item) => item.id}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.templateItem,
                                selectedTemplate === item.id && styles.templateItemSelected
                            ]}
                            onPress={() => loadTemplate(item.source, item.id)}
                        >
                            <Text style={[
                                styles.templateText,
                                selectedTemplate === item.id && styles.templateTextSelected
                            ]}>
                                {item.name}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* CV Preview */}
            <View style={styles.previewContainer}>
                {htmlContent ? (
                    <WebView
                        originWhitelist={['*']}
                        source={{ html: htmlContent }}
                        style={styles.webview}
                        scalesPageToFit={true}
                    />
                ) : (
                    <View style={styles.emptyPreview}>
                        <Text style={styles.emptyText}>Đang tải mẫu CV...</Text>
                    </View>
                )}
            </View>

            {/* Action Button */}
            <View style={styles.buttonContainer}>
                {loading ? (
                    <ActivityIndicator size="large" color={orange} />
                ) : (
                    <Button
                        title="Hoàn tính & Tài lên"
                        onPress={handleCreatePDF}
                        disable={loading}
                        backgroundColor={mainColor}
                        textColor={white}
                        borderColor={mainColor}
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    templateContainer: {
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    templateItem: {
        backgroundColor: white,
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 15,
        marginRight: 10,
        borderWidth: 1,
        borderColor: grey,
    },
    templateItemSelected: {
        backgroundColor: mainColor,
        borderColor: mainColor,
    },
    templateText: {
        fontSize: 14,
        color: mainColor,
    },
    templateTextSelected: {
        color: white,
        fontWeight: 'bold',
    },
    previewContainer: {
        flex: 1,
        marginHorizontal: 15,
        marginBottom:15,
        borderRadius: 10,
        overflow: 'hidden',
        elevation: 3, // Hiệu ứng bóng cho Android
        shadowColor: '#000', // Hiệu ứng bóng cho iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    webview: {
        flex: 1,
    },
    emptyPreview: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: grey,
    },
    buttonContainer: {
        paddingHorizontal: 15,
    },
});