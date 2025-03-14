import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import UIHeader from '../../components/UIHeader';
import Icon from 'react-native-vector-icons/Ionicons';
import { grey, mainColor, orange, textColor, white } from '../../assets/themes/Color';
import StyleShare from '../../assets/themes/StyleShare';
import Button from '../../components/Button';

export default function ResultScreen({ route, navigation }) {
    const { totalScore, details, job } = route.params;

    const handleRetry = () => {
        navigation.navigate('PrepareScreen', { job: job });
        // navigation.navigate('JobApplied')
    };

    return (
        <View style={{ flex: 1 }}>
            <UIHeader
                title={'Kết quả phỏng vấn'}
            />
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                {/* Điểm tổng */}
                <View style={[StyleShare.jobItemContainer, { alignItems: 'center' }]}>
                    <Text style={[StyleShare.titleText20, { color: textColor }]}>Điểm trung bình</Text>
                    <Text style={StyleShare.titleText30}>{totalScore.toFixed(1)}/10</Text>
                </View>

                {details.map((item, index) => (
                    <View key={index} style={StyleShare.jobItemContainer}>
                        <Text style={StyleShare.titleText16}>Câu {index + 1}</Text>
                        <Text style={styles.scoreText}>Điểm: {item.score}/10</Text>
                        <Text style={styles.feedbackText}>Nhận xét: {item.feedback}</Text>
                    </View>
                ))}

                {/* Nút Thử lại */}
                <View style={{ marginHorizontal: 20, marginTop: 30 }}>

                    <Button
                        title={'Thử lại'}
                        onPress={handleRetry}
                        backgroundColor={mainColor}
                        textColor={white} />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    scoreText: {
        fontSize: 14,
        color: orange,
        marginBottom: 5,
    },
    feedbackText: {
        fontSize: 14,
        color: textColor,
        lineHeight: 20,
    },
});