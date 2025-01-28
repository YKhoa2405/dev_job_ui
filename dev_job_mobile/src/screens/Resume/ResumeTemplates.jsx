import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import UIHeader from '../../components/UIHeader';
import { mainColor, orange, white } from '../../assets/themes/Color';
import { ToastMess } from '../../components/ToastMess';
import StyleShare from '../../assets/themes/StyleShare';
import { useSelector } from 'react-redux';

export default function ResumeTemplates({ navigation }) {
    const { personalInfo, experiences, projects, educations, skills } = useSelector((state) => state.resume);
    const [htmlContent, setHtmlContent] = useState('');


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
            console.log(educations)
            // Prepare Resume Data
            const ResumeData = {
                fullName: personalInfo?.fullName || '',
                position: personalInfo?.position || '',
                dateOfBirth: personalInfo?.dateOfBirth || '',
                phone: personalInfo?.phone || '',
                email: personalInfo?.email || '',
                githubLink: personalInfo?.githubLink || '',
                location: `${personalInfo?.address?.ward || ''}, ${personalInfo?.address?.district || ''}, ${personalInfo?.address?.province || ''}`,
                educations: educations
                    .map(
                        (edu) => `
                        <p><strong>${edu.schoolName} (${edu.startDate} - ${edu.endDate})</strong></p>
                        <p>${edu.major}</p>
                                                <p>${edu.description}</p>
                    `
                    )
                    .join(''),
                experiences: experiences
                    .map(
                        (exp) => `
                        <p><strong>${exp.company} (${exp.startDate} - ${exp.endDate})</strong></p>
                        <p><strong>${exp.position}</strong></p>
                        <p>${exp.description}</p>
                    `
                    )
                    .join(''),
                projects: projects
                    .map(
                        (proj) => `
                        <li><strong>${proj.name}</strong> (${proj.startDate} - ${proj.endDate}) - 
                        <a href="${proj.github}" class="project-link">${proj.github}</a></li>
                    `
                    )
                    .join(''),
                skills: skills
                    .map(
                        (skill) => `
                        <li>${skill.groupSkill}: ${skill.skillList}</li>
                    `
                    )
                    .join('')
            };;

            console.log(educations)
            // Replace placeholders
            Object.keys(ResumeData).forEach((key) => {
                content = content.replace(new RegExp(`{{${key}}}`, 'g'), ResumeData[key] || '');
            });

            setHtmlContent(content);
        } catch (error) {
            console.error('Error loading template:', error);
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
            const { uri } = await Print.printToFileAsync({ html: htmlContent });
            await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
        } catch (error) {
            ToastMess({ type: 'error', text1: 'Có lỗi xảy ra khi tạo PDF.' });
        }
    };

    return (
        <View style={StyleShare.container}>
            <UIHeader leftIcon="arrow-back" title="Xem trước CV" handleLeftIcon={navigation.goBack} />
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
            <TouchableOpacity style={[StyleShare.flexCenter, { backgroundColor: mainColor, padding: 15, marginBottom: 10, marginHorizontal: 20, borderRadius: 10 }]} onPress={() => handleCreatePDF()}>
                <Text style={[StyleShare.titleText16, { color: 'white' }]}>Tải xuống/View PDF</Text>
            </TouchableOpacity>
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
