import React from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import { WebView } from 'react-native-webview';
import UIHeader from '../../components/UIHeader';
import Pdf from 'react-native-pdf';

const CvView = ({ route, navigation }) => {
    // const { cvUrl } = route.params; // Đường dẫn CV truyền qua route
    // console.log(cvUrl)
    const fileUrl = "https://bucket-searchjob.s3.ap-southeast-2.amazonaws.com/1733212195743_CNPM_GK_IT2101.pdf";
    return (
        <View style={styles.container}>
            <UIHeader
                leftIcon={"arrow-back"}
                title={''}
                handleLeftIcon={() => { navigation.goBack() }} />
            <Pdf
                source={fileUrl}
                style={styles.pdf} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    pdf: {
        flex: 1,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    }
});

export default CvView;
