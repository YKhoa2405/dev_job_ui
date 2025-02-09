import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import UIHeader from '../../components/UIHeader';
import Loading from '../../components/Loading';
import { ToastMess } from '../../components/ToastMess';

const ResumeClientView = ({ route, navigation }) => {
    const { pdfUri } = route.params;
    const googleDocsUrl = `https://docs.google.com/gview?embedded=true&url=${pdfUri}`;
    const [loading, setLoading] = useState(true);

    const handleDownloadFile = async () => {
        try {
            const fileName = pdfUri.split('/').pop();
            const fileUri = `${FileSystem.documentDirectory}${fileName}`;

            const { uri } = await FileSystem.downloadAsync(pdfUri, fileUri);

            ToastMess({ type: 'success', text1: 'Tải xuống thành công.' });

        } catch (error) {
            console.log(error);
            ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại.' });

        }
    };

    return (
        <View style={{ flex: 1 }}>
            <UIHeader
                leftIcon={"arrow-back"}
                rightIcon={"download-outline"}
                handleLeftIcon={() => navigation.goBack()}
                handleRightIcon={handleDownloadFile} // Gán sự kiện tải file
            />

            {loading && <Loading />}

            <WebView
                source={{ uri: googleDocsUrl }}
                style={{ flex: 1 }}
                onLoad={() => setLoading(false)}
                onError={() => setLoading(false)}
            />
        </View>
    );
};

export default ResumeClientView;
