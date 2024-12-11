import React, { useState, useEffect } from "react";
import { View, Text, TouchableWithoutFeedback, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from "react-native";

import { Avatar, Chip } from "react-native-paper";
import { orange, mainColor, grey, white, textColor } from "../../assets/themes/Color";
import Icon from "react-native-vector-icons/Ionicons"
import StyleShare from "../../assets/themes/StyleShare";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slice/userSlice";
import { fetchCompanyByUser } from "../../redux/slice/companySlice";
export default function HomeCompany({ navigation }) {

    const dispatch = useDispatch()
    const user = useSelector((state) => state.user.user)

    const { companyByUser, loading } = useSelector((state) => state.company);

    useEffect(() => {
        dispatch(fetchCompanyByUser());
    }, []);

    const manageEmployers = [
        { id: 1, icon: 'megaphone-outline', title: 'Chiến dịch tuyển dụng' },
        { id: 2, icon: 'reader-outline', title: 'Quản lý tuyển dụng' },
        { id: 4, icon: 'podium-outline', title: 'Thống kê tuyển dụng' },
        { id: 5, icon: 'file-tray-stacked-outline', title: 'Dịch vụ của bạn' },
        { id: 6, icon: 'calendar-number-outline', title: 'Quản lý lịch trình' },
    ]
    const UtilitiesGrid = () => (
        <View style={styles.gridUtili}>
            <TouchableOpacity style={styles.gridItemUtili} onPress={() => navigation.navigate('JobCreate', { companyId: companyByUser._id })}>
                <Icon name={'add-circle-outline'} size={20} color={mainColor}></Icon>
                <Text style={StyleShare.lineText}>Tuyển dụng</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gridItemUtili} onPress={() => navigation.navigate('Services', { companyId: companyByUser._id })}>
                <Icon name={'cart-outline'} size={20} color={mainColor}></Icon>
                <Text style={StyleShare.lineText}>Mua dịch vụ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gridItemUtili} onPress={() => navigation.navigate('ProfileCompany')}>
                <Icon name={'person-outline'} size={20} color={mainColor}></Icon>
                <Text style={StyleShare.lineText}>Hồ sơ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gridItemUtili} onPress={() => navigation.navigate('Settings')}>
                <Icon name={'settings-outline'} size={20} color={mainColor}></Icon>
                <Text style={StyleShare.lineText}>Cài đặt</Text>
            </TouchableOpacity>
        </View>
    );


    const ManageEmployersGrid = () => (
        <View style={styles.grid}>
            {manageEmployers.map((item) => (
                <TouchableOpacity onPress={() => handleManageEmployersClick(item.id)} key={item.id}>
                    <View style={styles.gridItem}>
                        <View style={StyleShare.flexBetween}>
                            <Icon name={item.icon} size={20} color={mainColor}></Icon>
                            <Text style={StyleShare.textMainOption}>{item.info}</Text>
                        </View>
                        <View style={[StyleShare.flexBetween, { marginTop: 10 }]}>
                            <Text style={{ fontWeight: '500' }}>{item.title}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );

    const handleLogout = () => {
        dispatch(logout());
        navigation.navigate('Login')
    };

    const handleManageEmployersClick = (id) => {
        switch (id) {
            case 1:
                navigation.navigate('JobByCompany', { companyId: companyByUser._id })
                break;
            case 2:
                navigation.navigate('ResumeByCompany', { companyId: companyByUser._id })
                break;
            case 4:
                navigation.navigate('CompanyStatistical')
                break;
            case 5:
                navigation.navigate('ServicesByCompany', { companyId: companyByUser._id })
                break
            default:
                console.log('Unknown item clicked');
                break;
        }
    };

    return (
        <ScrollView style={StyleShare.container} showsVerticalScrollIndicator={false}>
            <View style={styles.containerTop}>
                <Text style={StyleShare.titleText20}>Quản lý tuyển dụng</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity style={{ marginRight: 20 }}>
                        <Icon name="notifications-outline" size={26} color={mainColor} />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Icon name="chatbubble-outline" size={26} color={mainColor} />
                    </TouchableOpacity>
                </View>

            </View>
            <View style={styles.containerMain}>
                <Text style={[StyleShare.titleText16, { marginVertical: 10 }]}>Tiện ích</Text>
                <UtilitiesGrid />
                <Text style={[StyleShare.titleText16, { marginVertical: 10, marginTop: 10 }]}>Quản lý</Text>
                <ManageEmployersGrid />
            </View>

            <View style={{ margin: 20 }}>
                <TouchableOpacity onPress={() => handleLogout()}>
                    <View style={styles.btnLogout}>
                        <Text style={{ fontWeight: '500', fontSize: 16, marginRight: 10, color: 'red' }}>Thoát quyền sử dụng</Text>
                        <Icon name="exit" size={24} color={'red'} />
                    </View>
                </TouchableOpacity>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    containerTop: {
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    containerMain: {
        marginHorizontal: 20
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    gridItem: {
        width: (Dimensions.get('window').width - 50) / 2, // 40 là tổng padding/margin
        padding: 16,
        backgroundColor: white,
        borderRadius: 8,
        marginBottom: 10,
        paddingVertical: 30,
        elevation: 2
    },
    gridUtili: {
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        flexDirection: 'row',
        backgroundColor: white,
        padding: 20,
        borderRadius: 10,
        marginBottom: 20,
        elevation: 2
    },
    gridItemUtili: {
        alignItems: 'center'
    },
    itemUploadCompany: {
        backgroundColor: white,
        padding: 20,
        borderRadius: 20,
        marginTop: 20
    },
    btnLogout: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: white,
        padding: 10,
        borderRadius: 10,
        elevation: 2
    },
    containerInfoCompany: {
        padding: 20,
        backgroundColor: 'white',
        marginVertical: 10,
        borderRadius: 10
    }
})