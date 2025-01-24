import React, { useState } from 'react';
import { StyleSheet, Dimensions, View, Text, ScrollView, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import { WebView } from 'react-native-webview';
import UIHeader from '../../components/UIHeader';
import StyleShare from '../../assets/themes/StyleShare';
import { grey, mainColor, orange, white } from '../../assets/themes/Color';

export default function ResumeTemlates({ route, navigation }) {
    const [loading, setLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState(require('../../assets/templates/cv_template1.html'));

    const templates = [
        { id: '1', name: 'Mẫu CV 1', source: require('../../assets/templates/cv_template1.html') },
        { id: '2', name: 'Mẫu CV 2', source: require('../../assets/templates/cv_template2.html') },
    ];

    const handleTemplateSelect = (template) => {
        setSelectedTemplate(template.source);
    };

    return (
        <View style={StyleShare.container}>
            <UIHeader
                leftIcon={"arrow-back"}
                title={'Xem trước CV'}
                handleLeftIcon={() => { navigation.goBack() }} />

            <View style={StyleShare.manageJob}>
                <Text style={StyleShare.titleText16}>Chọn mẫu CV</Text>
                <FlatList
                    data={templates}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.templateButton} onPress={() => handleTemplateSelect(item)}>
                            <Text style={styles.templateText}>{item.name}</Text>
                        </TouchableOpacity>
                    )}
                />
                <View style={styles.containerWebView}>
                    <WebView
                        source={selectedTemplate}
                        style={styles.webview}
                    />
                </View>
            </View>
            <TouchableOpacity style={[StyleShare.flexCenter, { backgroundColor: mainColor, padding: 15, marginBottom: 10, marginHorizontal: 20, borderRadius: 10 }]} onPress={() => navigation.navigate('ResumeTemlates')}>
                <Text style={[StyleShare.titleText16, { color: 'white' }]}>Chọn mẫu</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[StyleShare.flexCenter, { backgroundColor: orange, padding: 15, marginBottom: 10, marginHorizontal: 20, borderRadius: 10 }]} onPress={() => navigation.navigate('ResumeTemlates')}>
                <Text style={[StyleShare.titleText16, { color: 'white' }]}>Tải xuống/View PDF</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    containerWebView: {
        flex: 1,
        borderRadius: 10,
        backgroundColor: white,
        elevation: 5,
        marginTop: 10
    },
    webview: {
        flex: 1,
        width: '100%',
        height: Dimensions.get('window').height * 0.8,
    },
});
