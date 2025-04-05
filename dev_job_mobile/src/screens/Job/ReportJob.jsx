import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import StyleShare from '../../assets/themes/StyleShare';
import UIHeader from '../../components/UIHeader';
import { mainColor, orange, textColor, white } from '../../assets/themes/Color';
import Button from '../../components/Button';
import { ToastMess } from '../../components/ToastMess';
import { authApi, endpoints } from '../../assets/config/API';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';

const ReportJob = ({ navigation, route }) => {
    const currentUser = useSelector((state) => state.user.user);
    const { jobId, name } = route.params;
    const [selectedReason, setSelectedReason] = useState('');
    const [otherReason, setOtherReason] = useState('');
    const [fullName, setFullName] = useState(currentUser?.name || '');
    const [email, setEmail] = useState(currentUser?.email || '');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState();
    const [loading, setLoading] = useState(false);

    const reasons = [
        'Có dấu hiệu lừa đảo',
        'Lý do khác',
    ];

    const handleSubmit = async () => {
        if (!selectedReason || !fullName || !email || !phone || !address) {
            ToastMess({ type: 'error', text1: 'Vui lòng điền đầy đủ thông tin!' });
            return;
        }
        if (selectedReason === 'Lý do khác' && !otherReason.trim()) {
            ToastMess({ type: 'error', text1: 'Vui lòng nhập lý do khác!' });
            return;
        }
        setLoading(true);
        try {
            const reportData = {
                jobId,
                selectedCategory: selectedReason === 'Có dấu hiệu lừa đảo' ? 'Lừa đảo' : undefined,
                reason: selectedReason === 'Có dấu hiệu lừa đảo' ? '' : otherReason,
                fullName,
                email,
                phone,
                address,
            };

            // Gửi báo cáo đến API
            const token = await AsyncStorage.getItem("access_token");
            const response = await authApi(token).post(endpoints['reportJob'], reportData);
            console.log(response.data);
            if (response.status === 201) { 
                ToastMess({ type: 'success', text1: 'Báo cáo đã được gửi thành công!' });

                setSelectedReason('');
                setOtherReason('');
                setFullName('');
                setEmail('');
                setPhone('');
                setAddress('');
            }
        } catch (error) {
            const message = error?.response?.data?.message || error?.message;
            if (message === 'Bạn đã báo cáo tin tuyển dụng này.') {
                ToastMess({ type: 'error', text1: message });
            } else {
                ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại!' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={StyleShare.container}>
            <UIHeader
                leftIcon={"arrow-back"}
                title={'Báo cáo tin tuyển dụng'}
                handleLeftIcon={() => { navigation.goBack() }}
            />
            <ScrollView style={[StyleShare.container, {}]}>
                <View style={styles.containerMain}>
                    <Text style={StyleShare.titleText16}>Báo cáo tin tuyển dụng không chính xác</Text>
                    <Text style={styles.description}>
                        Hãy tìm hiểu kỹ về nhà tuyển dụng và công việc bạn ứng tuyển. Bạn nên cân
                        nhắc với những công việc yêu cầu nộp phí, hoặc những hợp đồng mập mờ, không rõ ràng.
                        Nếu bạn thấy rằng tin tuyển dụng này không đúng hay phần ảnh với chúng tôi.
                    </Text>
                </View>

                <View style={styles.containerMain}>
                    <Text style={StyleShare.titleText16}>Tin tuyển dụng</Text>
                    <Text style={styles.description}>{name || 'Tin tuyển dụng'}</Text>
                </View>
                <View style={styles.containerMain}>
                    <Text style={StyleShare.titleText16}>Lý do báo cáo <Text style={styles.required}>*</Text></Text>
                    {reasons.map((reason, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.radioContainer}
                            onPress={() => setSelectedReason(reason)}
                        >
                            <View style={styles.radio}>
                                {selectedReason === reason && <View style={styles.radioSelected} />}
                            </View>
                            <Text>{reason}</Text>
                        </TouchableOpacity>
                    ))}

                    {selectedReason === 'Lý do khác' && (
                        <>
                            <Text style={styles.label}>
                                Nhập lý do khác của bạn <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nhập lý do khác..."
                                multiline
                                numberOfLines={4}
                                value={otherReason}
                                onChangeText={setOtherReason}
                            />
                        </>
                    )}
                </View>

                <View style={styles.containerMain}>
                    <Text style={StyleShare.titleText16}>Thông tin của bạn</Text>
                    <Text style={styles.label}>Họ và tên <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nhập họ và tên"
                        value={fullName}
                        onChangeText={setFullName}
                    />
                    <Text style={styles.label}>Email <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nhập Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                    />
                    <Text style={styles.label}>Số điện thoại <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nhập số điện thoại"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                    />
                    <Text style={styles.label}>Địa chỉ <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nhập địa chỉ"
                        value={address}
                        onChangeText={setAddress}
                    />
                </View>

                <View style={{ marginHorizontal: 20 }}>
                    {loading ? (
                        <ActivityIndicator color={orange} size={'large'} />
                    ) : (
                        <Button
                            title={'Báo cáo'}
                            backgroundColor={mainColor}
                            textColor={white}
                            onPress={() => handleSubmit()}
                        />
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    description: {
        lineHeight: 20,
        marginTop: 10,
    },
    radioContainer: {
        marginTop: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'grey',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    radioSelected: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: orange,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 15,
        minHeight: 50,
        textAlignVertical: 'top',
    },
    label: {
        fontWeight: 'bold',
        color: mainColor,
        marginTop: 20,
        marginBottom: 10,
    },
    required: {
        color: 'red',
    },
    containerMain: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: white,
        marginBottom: 15,
    },
});

export default ReportJob;