import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Asset } from 'expo-asset';
import UIHeader from '../../components/UIHeader';
import { mainColor, orange, white } from '../../assets/themes/Color';
import { ToastMess } from '../../components/ToastMess';
import StyleShare from '../../assets/themes/StyleShare';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, endpoints } from '../../assets/config/API';

export default function ResumeTemplates({ navigation }) {
    const { personalInfo, experiences, projects, educations, skills } = useSelector((state) => state.resume);
    const [htmlContent, setHtmlContent] = useState('');
    const [loading, setLoading] = useState(false);

    const templates = [
        { id: '1', name: 'Mẫu 1', source: require('../../assets/templates/cv_template1.html') },
        { id: '2', name: 'Mẫu 2', source: require('../../assets/templates/cv_template2.html') },
    ];

    const loadTemplate = async (templateAsset) => {
        try {
            const asset = Asset.fromModule(templateAsset);
            await asset.downloadAsync();
            const fileUri = asset.localUri || asset.uri;
            // Read template file
            let content = await FileSystem.readAsStringAsync(fileUri, { encoding: 'utf8' });
            // Prepare Resume Data
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
                        <p>
                            ${ex.description
                                .split('\n') // Tách từng dòng
                                .map((line) => `${line.trim()}`) // Thêm dấu '-' đầu dòng
                                .join('<br>')} 
                        </p>
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
                        <p>
                            ${ex.description
                                .split('\n') // Tách từng dòng
                                .map((line) => `${line.trim()}`) // Thêm dấu '-' đầu dòng
                                .join('<br>')} 
                        </p>
                    `
                    )
                    .join(''),

                projects: (Array.isArray(projects[0]) ? projects[0] : projects)
                    .map(
                        (pr) => `
                        <p style="display: flex; justify-content: space-between;">
                            <strong>${pr.name} (<a>${pr.github}</a>)</strong>
                            <strong>(${pr.startDate} - ${pr.endDate})</strong>
                        </p>
                        <p>
                            ${pr.description
                                .split('\n') // Tách từng dòng
                                .map((line) => `${line.trim()}`) // Thêm dấu '-' đầu dòng
                                .join('<br>')} 
                        </p>
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
            };;

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
            loadTemplate(templates[0].source);
        }
    }, [personalInfo, experiences, projects, educations, skills]);




    const handleCreatePDF = async () => {
        try {
            setLoading(true);
            const fileName = `CV_${personalInfo?.nameCV || 'Unknown'}.pdf`.replace(/\s+/g, '_');
            const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

            // Tạo file PDF
            const { uri } = await Print.printToFileAsync({ html: htmlContent });

            // Di chuyển file vào cache để có đường dẫn rõ ràng
            await FileSystem.moveAsync({
                from: uri,
                to: fileUri,
            });

            await handleUploadCV(fileUri, fileName);
            navigation.navigate('ResumeTool');

        } catch (error) {
            ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại.' });
            console.log(error);
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
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })

            ToastMess({ type: 'success', text1: 'Tải lên thành công!' });
        } catch (error) {
            console.log(error.message);
        }
    };


    return (
        <View style={StyleShare.container}>
            <UIHeader leftIcon="arrow-back" title="Chọn mẫu CV" handleLeftIcon={navigation.goBack} />
            <FlatList
                style={{ marginHorizontal: 10 }}
                horizontal
                data={templates}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.templateItem} onPress={() => loadTemplate(item.source)}>
                        <Text>{item.name}</Text>
                    </TouchableOpacity>
                )}
            />
            <View style={styles.cvContainer}>
                <WebView originWhitelist={['*']} source={{ html: htmlContent }} style={styles.webview} />
            </View>
            {loading ? <ActivityIndicator size="large" color={orange} /> :
                <TouchableOpacity style={[StyleShare.flexCenter, { backgroundColor: mainColor, padding: 15, marginBottom: 10, marginHorizontal: 20, borderRadius: 10 }]} onPress={() => handleCreatePDF()}>
                    <Text style={[StyleShare.titleText16, { color: 'white' }]}>Hoàn thành</Text>
                </TouchableOpacity>
            }
            {/* <TouchableOpacity style={[StyleShare.flexCenter, { backgroundColor: mainColor, padding: 15, marginBottom: 10, marginHorizontal: 20, borderRadius: 10 }]} onPress={() => handleUploadCV()}>
                <Text style={[StyleShare.titleText16, { color: 'white' }]}>Tải lên CV</Text>
            </TouchableOpacity> */}
        </View>
    );
}

const styles = StyleSheet.create({
    cvContainer: { height: Dimensions.get('window').height * 0.82, margin: 10 },
    webview: { flex: 1 },
    templateItem: {
        backgroundColor: white,
        borderRadius: 10,
        marginRight: 10,
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
