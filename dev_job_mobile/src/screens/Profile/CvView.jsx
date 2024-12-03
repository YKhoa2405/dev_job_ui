import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import UIHeader from '../../components/UIHeader';

const CvView = ({ route, navigation }) => {
    const { cvUrl } = route.params; // Đường dẫn CV truyền qua route
    console.log(cvUrl)
    const fileUrl = "https://bucket-searchjob.s3.ap-southeast-2.amazonaws.com/1733212195743_CNPM_GK_IT2101.pdf";
    return (
        <View style={styles.container}>
            <UIHeader
                leftIcon={"arrow-back"}
                title={''}
                handleLeftIcon={() => { navigation.goBack() }} />
            <WebView
                // source={'https://bucket-searchjob.s3.ap-southeast-2.amazonaws.com/1733212195743_CNPM_GK_IT2101.pdf'}
                style={styles.webView}
                startInLoadingState={true} // Hiển thị spinner khi tải
                scalesPageToFit={true} // Tự động co giãn nội dung
                source={{ uri: fileUrl }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    webView: {
        flex: 1,
    },
});

export default CvView;
