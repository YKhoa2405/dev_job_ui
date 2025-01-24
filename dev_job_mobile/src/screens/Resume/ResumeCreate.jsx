import React, { useState } from 'react';
import { StyleSheet, Dimensions, View, Text, ScrollView, Alert, TextInput } from 'react-native';
import UIHeader from '../../components/UIHeader';
import StyleShare from '../../assets/themes/StyleShare';
import { mainColor, orange, white } from '../../assets/themes/Color';
import Icon from "react-native-vector-icons/Ionicons"
import { List, Divider } from 'react-native-paper';


export default function ResumeCreate({ navigation }) {
    const [expanded, setExpanded] = useState(false); // Trạng thái để kiểm tra accordion có mở hay không
    const handlePress = () => setExpanded(!expanded);

    const [loading, setLoading] = useState(true);
    const [resumeName, setResumeName] = useState('');

    const sections = [
        { id: '1', title: 'Thông tin cá nhân', key: 'personalInfo', icon: 'person-circle-outline' },
        { id: '2', title: 'Học vấn', key: 'education', icon: 'school-outline' },
        { id: '3', title: 'Kinh nghiệm làm việc', key: 'experience', icon: 'briefcase-outline' },
        { id: '4', title: 'Kỹ năng', key: 'skills', icon: 'star-outline' },
        { id: '5', title: 'Dự án', key: 'projects', icon: 'clipboard-outline' },
    ];

    return (
        <View style={StyleShare.container}>
            <UIHeader
                leftIcon={"arrow-back"}
                title={'Tạo CV lập trình viên'}
                handleLeftIcon={() => { navigation.goBack() }} />
            <ScrollView>
                <View style={{ marginHorizontal: 20 }}>
                    <Text style={StyleShare.titleText16}>Tên CV</Text>
                    <TextInput
                        placeholder="Tiêu đề tin tuyển dụng..."
                        onChangeText={setResumeName}
                        value={resumeName}
                        style={styles.introduceInput}
                    />
                </View>
                <View style={{ backgroundColor: 'white', paddingHorizontal: 5, marginBottom:15 }}>
                    <List.Accordion
                        title="Hướng dẫn"
                        titleStyle={{ fontWeight: 'bold', color: mainColor }} // Tiêu đề của mục cha với màu chính
                        expanded={expanded}
                        onPress={handlePress}
                        style={{ backgroundColor: 'white' }}
                    >
                        <List.Item description="Một số trường thông tin được qui định là trường thông tin quan trọng bắt buộc, giúp nhà tuyển dụng đánh giá ứng viên, vui lòng hoàn tất theo hướng dẫn" style={styles.item} />
                        <List.Item description="Các mục: Thông tin cá nhân, giới thiệu bản thân, kinh nghiệm làm việc, kỹ năng lập trình và học vấn là 5 mục mặc định, không được tùy chỉnh thứ tự hiển thị trên CV" style={styles.item} />
                        <List.Item description="Chọn xem trước để xem các mẫu CV của bạn, chọn mẫu và lưu CV. Bạn cũng có thể tải xuống CV dưới dạng PDF" />
                    </List.Accordion>
                </View>
                <View style={StyleShare.manageJob}>
                    <Text style={StyleShare.titleText16}>Thông tin chung</Text>
                    <View>
                        {sections.map((item) => (
                            <React.Fragment key={item.id}>
                                <List.Item
                                    title={item.title}
                                    titleStyle={{ fontWeight: 'bold' }}
                                    left={() => <Icon name={item.icon} size={24} color={mainColor} />}
                                    onPress={() => navigation.navigate('ResumeInput', { scrollTo: item.key })}
                                />
                                <Divider />
                            </React.Fragment>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    introduceInput: {
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 15,
        backgroundColor: white,
        marginVertical: 10

    },
    item: {
        paddingVertical: -20, // Điều chỉnh padding trong mỗi mục con
    },
});

