import React, { useContext, useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import styleShare from "../../assets/theme/style";
import UIHeader from "../../components/UIHeader";
import InputMain from "../../components/InputMain";
import { bgButton1, grey, orange, white } from "../../assets/theme/color";
import ButtonMain from "../../components/ButtonMain";
import { ToastMess } from "../../components/ToastMess";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi, endpoints } from "../../config/API";
import { Picker } from '@react-native-picker/picker';
import axios from "axios";
import MyContext from "../../config/MyContext";

export default function UpdateEmployer({ navigation }) {
    const [user, dispatch] = useContext(MyContext)
    const [companyName, setCompanyName] = useState(user.employer.company_name)
    const [website, setWebsite] = useState(user.employer.website)
    const [size, setSize] = useState(user.employer.size)
    const [address, setAddress] = useState(user.employer.address)
    const [description, setDescription] = useState(user.employer.description)
    const [loading, setLoading] = useState(false);

    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvinceId, setSelectedProvinceId] = useState('');
    const [selectedDistrictId, setSelectedDistrictId] = useState('');
    const [selectedWardId, setSelectedWardId] = useState('');
    const [locationDetail, setLocationDetail] = useState('');

    const validateUrl = (url) => {
        const urlPattern = new RegExp(
            '^(https?:\\/\\/)?' + // http or https
            '((([a-zA-Z0-9$-_@.&+!*"(),;]|[0-9])+)+\\.)' + // domain name
            '([a-zA-Z]{2,})' + // top-level domain (e.g., .com, .vn)
            '(\\/[a-zA-Z0-9$-_@.&+!*"(),;=]*)*' + // path (optional)
            '(\\?[a-zA-Z0-9-_@.&+!*"(),;=]*)?' // query string (optional)
        );
        return urlPattern.test(url);
    };

    useEffect(() => {
        fetchProvinces()
    })

    useEffect(() => {
        updateLocationDetail();
    }, [selectedProvinceId, selectedDistrictId, selectedWardId, address]);

    const fetchProvinces = async () => {
        try {
            const res = await axios.get('https://esgoo.net/api-tinhthanh/1/0.htm');
            setProvinces(res.data.data || []);
        } catch (error) {
            console.log('Error fetching provinces:', error);
        }
    };

    const fetchDistricts = async (provinceId) => {
        try {
            const response = await axios.get(`https://esgoo.net/api-tinhthanh/2/${provinceId}.htm`);
            if (response.data.error === 0) {
                setDistricts(response.data.data || []);
                setSelectedDistrictId(''); // Reset district and ward selections
                setWards([]);
            }
        } catch (error) {
            console.log('Error fetching districts:', error);
        }
    };

    const fetchWards = async (districtId) => {
        try {
            const response = await axios.get(`https://esgoo.net/api-tinhthanh/3/${districtId}.htm`);
            if (response.data.error === 0) {
                setWards(response.data.data || []);
            }
        } catch (error) {
            console.log('Error fetching wards:', error);
        }
    };

    const updateLocationDetail = () => {
        const province = provinces.find(p => p.id === selectedProvinceId)?.full_name || '';
        const district = districts.find(d => d.id === selectedDistrictId)?.full_name || '';
        const ward = wards.find(w => w.id === selectedWardId)?.full_name || '';
        const detail = [
            address,
            ward,
            district,
            province
        ]
            .filter(Boolean)
            .join(', ');
        setLocationDetail(detail);
        console.log(locationDetail)
    };

    const handleUpdateEmployer = async () => {
        if (!companyName || !website || !size || !address || !description) {
            ToastMess({ type: 'error', text1: 'Vui lòng không để trống các trường.' });
            return;
        }
        if (!validateUrl(website)) {
            ToastMess({ type: 'error', text1: 'Đường dẫn website công ty không hợp lệ.' });
            return;
        }

        setLoading(true)

        let form = new FormData();
        form.append('company_name', companyName);
        form.append('website', website);
        form.append('size', size);
        form.append('address', locationDetail);
        form.append('description', description);

        console.log(form)

        const token = await AsyncStorage.getItem("access-token");
        console.log(token)

        // Gửi request đến API
        try {
            const res = await authApi(token).patch(endpoints['update_employer'], form, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            console.log('Response:', res.data);
            ToastMess({ type: 'success', text1: 'Cập nhật thông tin thành công.' });
            navigation.navigate('HomeEmployers')

        } catch (error) {
            console.error('Error:', error.response ? error.response.data : error.message);
        } finally {
            setLoading(false)
        }

    }


    return (
        <View style={styleShare.container}>
            <UIHeader title={'Cập nhật thông tin công ty'}
                leftIcon={"arrow-back"}
                handleLeftIcon={() => { navigation.goBack() }} />
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styleShare.container}>
                    <View style={styles.containerMain}>
                        <Text style={styles.textInput}>Tên công ty</Text>
                        <InputMain
                            placeholder="Tên công ty"
                            onChangeText={setCompanyName}

                        />
                        <Text style={styles.textInput}>Website</Text>
                        <InputMain
                            placeholder="https://www.heyjob.vn"
                            onChangeText={setWebsite}
                            autoCapitalize="none"
                        />

                        <Text style={styles.textInput}>Quy mô công ty</Text>
                        <InputMain
                            placeholder="Số lượng nhân viên của công ty"
                            onChangeText={(text) => {
                                // Loại bỏ tất cả ký tự không phải số
                                const numericValue = text.replace(/[^0-9]/g, '');
                                setSize(numericValue);
                            }}
                            autoCapitalize="none"
                            keyboardType="numeric"
                        />

                        <Text style={styles.textInput}>Địa chỉ công ty</Text>
                        <Picker
                            selectedValue={selectedProvinceId}
                            onValueChange={(itemValue) => {
                                setSelectedProvinceId(itemValue);
                                fetchDistricts(itemValue);
                            }}
                            style={styles.inputSelect}
                        >
                            <Picker.Item label="Chọn tỉnh/thành" value="" />
                            {provinces.map((province) => (
                                <Picker.Item key={province.id} label={province.full_name} value={province.id} />
                            ))}
                        </Picker>
                        <Picker
                            selectedValue={selectedDistrictId}
                            onValueChange={(itemValue) => {
                                setSelectedDistrictId(itemValue);
                                fetchWards(itemValue);
                            }}
                            style={styles.inputSelect}
                            enabled={!!selectedProvinceId}
                        >
                            <Picker.Item label="Chọn quận/huyện" value="" />
                            {districts.map((district) => (
                                <Picker.Item key={district.id} label={district.full_name} value={district.id} />
                            ))}
                        </Picker>
                        <Picker
                            selectedValue={selectedWardId}
                            onValueChange={setSelectedWardId}
                            style={styles.inputSelect}
                            enabled={!!selectedDistrictId}
                        >
                            <Picker.Item label="Chọn phường/xã" value="" />
                            {wards.map((ward) => (
                                <Picker.Item key={ward.id} label={ward.full_name} value={ward.id} />
                            ))}
                        </Picker>
                        <View>
                            <InputMain
                                placeholder="Tên đường, số, địa chỉ cụ thể, ..."
                                onChangeText={setAddress}
                            />
                        </View>

                        <Text style={styles.textInput}>Giới thiệu về công ty</Text>
                        <TextInput
                            placeholder="Mô tả về công ty"
                            onChangeText={setDescription}
                            style={styles.introduceInput}
                            multiline={true}
                            numberOfLines={9}
                            textAlignVertical="top"
                        />
                        {loading ? (
                            <ActivityIndicator color={orange} size={'large'} />
                        ) : (
                            <ButtonMain title={'Cập nhật'} backgroundColor={bgButton1} textColor={white} onPress={() => handleUpdateEmployer()} />
                        )}
                    </View>
                </View>
            </ScrollView>

        </View>
    )
}

const styles = StyleSheet.create({
    containerMain: {
        marginHorizontal: 20
    },
    textInput: {
        fontWeight: 'bold',
        color: bgButton1,
        marginTop: 15
    },
    introduceInput: {
        borderRadius: 20,
        marginTop: 10,
        marginBottom: 30,
        padding: 10,
        backgroundColor: white
    },
    inputSelect: {
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderRadius: 10,
        backgroundColor: white,
        marginTop: 10,
        opacity: 0.8,
    },
})