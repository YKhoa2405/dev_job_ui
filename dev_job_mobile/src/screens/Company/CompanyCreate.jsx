import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, Text, TextInput, ActivityIndicator, TouchableOpacity } from "react-native";
import StyleShare from "../../assets/themes/StyleShare";
import UIHeader from "../../components/UIHeader";
import { grey, mainColor, orange, white } from "../../assets/themes/Color";
import Button from "../../components/Button";
import { authApi, endpoints } from "../../assets/config/API";
import Dropdown from "../../components/Dropdown";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ToastMess } from "../../components/ToastMess";
import * as ImagePicker from 'expo-image-picker';
import { Avatar } from "react-native-paper";
import { geminiService } from "../../assets/config/GeminiService";

export default function CompanyCreate({ navigation }) {
    const [loading, setLoading] = useState(false);
    const [loadingR, setLoadingR] = useState(false);

    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    const [selectedProvinceId, setSelectedProvinceId] = useState('');
    const [selectedDistrictId, setSelectedDistrictId] = useState('');
    const [selectedWardId, setSelectedWardId] = useState('');

    const [name, setName] = useState('');
    const [taxCode, setTaxCode] = useState(''); // Thêm state cho mã số thuế
    const [slogan, setSlogan] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [street, setStreet] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [website, setWebsite] = useState('');
    const [field, setField] = useState('');
    const [size, setSize] = useState('');
    const [about, setAbout] = useState('');

    const sizeData = [
        { title: '100 - 199' },
        { title: '200 - 299' },
        { title: '300 - 399' },
        { title: '400 - 499' },
        { title: '500+' },
        { title: '1000+' },
    ];

    useEffect(() => {
        fetchProvinces();
    }, []);

    useEffect(() => {
        updateLocationDetail();
    }, [selectedProvinceId, selectedDistrictId, selectedWardId, street]);

    const handleChooseImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Permission to access gallery is required!');
            return;
        }
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setAvatar(result.assets[0].uri);
        }
    };

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
                setSelectedDistrictId('');
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

    const updateLocationDetail = async () => {
        const province = provinces.find(p => p.id === selectedProvinceId)?.full_name || '';
        const district = districts.find(d => d.id === selectedDistrictId)?.full_name || '';
        const ward = wards.find(w => w.id === selectedWardId)?.full_name || '';

        setCity(province);

        const detail = [
            street,
            ward,
            district,
            province
        ]
            .filter(Boolean)
            .join(', ');

        setAddress(detail);
    };

    const handleCreateCompany = async () => {
        if (!name || !taxCode || !about || !size || !field || !address || !slogan || !website) {
            ToastMess({ type: 'error', text1: 'Vui lòng không để trống các trường.' });
            return;
        }

        const companyData = new FormData();
        companyData.append('name', name);
        companyData.append('taxCode', taxCode); // Thêm mã số thuế vào dữ liệu gửi lên
        companyData.append('about', about);
        companyData.append('address', address);
        companyData.append('website', website);
        companyData.append('size', size);
        companyData.append('field', field);
        companyData.append('city', city);
        companyData.append('slogan', slogan);
        companyData.append('isApproved', false);

        if (avatar) {
            const uriParts = avatar.split('.');
            const fileType = uriParts[uriParts.length - 1];

            companyData.append('avatar', {
                uri: avatar,
                name: `avatar.${fileType}`,
                type: `image/${fileType}`,
            });
        }

        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("access_token");
            await authApi(token).post(endpoints['companies'], companyData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            ToastMess({ type: 'success', text1: 'Cập nhật thông tin thành công.' });
            navigation.goBack();
        } catch (error) {
            ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại.' });
            console.log(error.response ? error.response.data : error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateAbout = async () => {
        setLoadingR(true);
        try {
            if (!name || !website) {
                ToastMess({ type: 'error', text1: 'Vui lòng nhập đầy đủ thông tin.' });
                return;
            }
            const prompt = `Tạo một mô tả ngắn gọn, chuyên nghiệp về công ty ${name}, lĩnh vực hoạt động ${field}, quy mô ${size}, và điểm nổi bật, hiển thị thành một đoạn văn bản.`;
            const response = await geminiService(prompt);
            setAbout(response);
        } catch (error) {
            ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại' });
            console.log("Lỗi:", error);
        } finally {
            setLoadingR(false);
        }
    };

    return (
        <View style={StyleShare.container}>
            <UIHeader
                leftIcon={"arrow-back"}
                handleLeftIcon={() => navigation.goBack()}
                title={'Cập nhật thông tin công ty'}
            />
            <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
                <View style={styles.containerMain}>
                    <Text style={styles.textInput}>Tên công ty</Text>
                    <TextInput
                        placeholder="Nhập tên công ty..."
                        onChangeText={setName}
                        value={name}
                        style={styles.introduceInput}
                    />

                    <Text style={styles.textInput}>Mã số thuế</Text>
                    <TextInput
                        placeholder="Nhập mã số thuế..."
                        onChangeText={setTaxCode}
                        value={taxCode}
                        style={styles.introduceInput}
                        keyboardType="numeric"
                    />

                    <Text style={styles.textInput}>Logo công ty</Text>
                    {avatar ? (
                        <TouchableOpacity onPress={handleChooseImage}>
                            <Avatar.Image source={{ uri: avatar }} size={70} />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={handleChooseImage} style={{ width: '100%', height: 50, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', marginTop: 5, borderRadius: 10, elevation: 2 }}>
                            <Text style={{ fontSize: 16 }}>Tải ảnh của bạn</Text>
                        </TouchableOpacity>
                    )}

                    <View>
                        <Text style={styles.textInput}>Địa điểm làm việc</Text>
                        <Dropdown
                            data={provinces.map(province => ({ title: province.full_name, id: province.id }))}
                            onSelect={(item) => {
                                setSelectedProvinceId(item.id);
                                setSelectedDistrictId('');
                                setSelectedWardId('');
                                fetchDistricts(item.id);
                            }}
                            placeholder="Chọn tỉnh/thành phố"
                            buttonStyle={{
                                marginTop: 10,
                                width: '100%',
                                height: 50,
                            }}
                        />
                        <Dropdown
                            data={districts.map(district => ({ title: district.full_name, id: district.id }))}
                            onSelect={(item) => {
                                setSelectedDistrictId(item.id);
                                setSelectedWardId('');
                                fetchWards(item.id);
                            }}
                            placeholder="Chọn quận/huyện"
                            disabled={!selectedProvinceId}
                            buttonStyle={{
                                marginTop: 10,
                                width: '100%',
                                height: 50,
                            }}
                        />
                        <Dropdown
                            data={wards.map(ward => ({ title: ward.full_name, id: ward.id }))}
                            onSelect={(item) => {
                                setSelectedWardId(item.id);
                            }}
                            placeholder="Chọn phường/xã"
                            disabled={!selectedDistrictId}
                            buttonStyle={{
                                marginTop: 10,
                                width: '100%',
                                height: 50,
                            }}
                        />
                        <TextInput
                            style={[styles.introduceInput, { marginTop: 10 }]}
                            placeholder="Tên đường, số công ty, vị trí cụ thể ..."
                            onChangeText={setStreet}
                            multiline={true}
                        />
                    </View>

                    <Text style={styles.textInput}>Quy mô công ty</Text>
                    <Dropdown
                        data={sizeData}
                        onSelect={(item) => setSize(item.title)}
                        placeholder="Chọn số lượng nhân viên"
                        buttonStyle={{
                            marginTop: 10,
                            width: '100%',
                            height: 50,
                        }}
                    />

                    <Text style={styles.textInput}>Slogan</Text>
                    <TextInput
                        placeholder="Nhập slogan của công ty"
                        onChangeText={setSlogan}
                        value={slogan}
                        style={styles.introduceInput}
                    />

                    <Text style={styles.textInput}>Lĩnh vực</Text>
                    <TextInput
                        placeholder="Nhập lĩnh vực hoạt động của công ty"
                        onChangeText={setField}
                        value={field}
                        style={styles.introduceInput}
                    />

                    <Text style={styles.textInput}>Website</Text>
                    <TextInput
                        placeholder="Url website công ty"
                        onChangeText={setWebsite}
                        value={website}
                        style={styles.introduceInput}
                    />

                    <View style={StyleShare.flexBetween}>
                        <Text style={styles.textInput}>Giới thiệu</Text>
                        {loadingR ? (
                            <Text style={{ color: 'grey', fontWeight: 'bold' }}>Đang tải...</Text>
                        ) : (
                            <TouchableOpacity onPress={handleGenerateAbout}>
                                <Text style={{ color: 'grey', fontWeight: 'bold' }}>Ví dụ</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <TextInput
                        style={styles.aboutInput} // Sử dụng style mới cho phần "Giới thiệu"
                        placeholder="Giới thiệu về công ty"
                        onChangeText={setAbout}
                        multiline={true}
                        numberOfLines={20} // Tăng số dòng lên 20
                        textAlignVertical="top"
                        value={about}
                    />

                    <View style={{ marginTop: 20 }}>
                        {loading ? (
                            <ActivityIndicator color={orange} size={'large'} />
                        ) : (
                            <Button
                                title={'Cập nhật'}
                                backgroundColor={mainColor}
                                textColor={white}
                                onPress={handleCreateCompany}
                            />
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    containerMain: {
        paddingHorizontal: 20,
    },
    textInput: {
        fontWeight: 'bold',
        color: mainColor,
        marginTop: 20,
        marginBottom: 5,
    },
    introduceInput: {
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 15,
        backgroundColor: white,
    },
    aboutInput: {
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 15,
        backgroundColor: white,
        height: 300, // Tăng chiều cao để chứa nhiều nội dung hơn
    },
});