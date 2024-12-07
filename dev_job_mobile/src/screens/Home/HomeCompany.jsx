import React, { useState, useEffect } from "react";
import { View, Text, TouchableWithoutFeedback, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from "react-native";

import { Avatar, Chip } from "react-native-paper";
import { orange, mainColor, grey, white, textColor } from "../../assets/themes/Color";
import Icon from "react-native-vector-icons/Ionicons"
import StyleShare from "../../assets/themes/StyleShare";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slice/userSlice";
export default function HomeCompany({ navigation }) {

    const dispatch = useDispatch()
    const user = useSelector((state) => state.user.user)
    const [loading, setLoading] = useState(false)

    const manageEmployers = [
        { id: 1, icon: 'megaphone-outline', title: 'Chiến dịch tuyển dụng' },
        { id: 2, icon: 'reader-outline', title: 'CV tiếp nhận' },
        { id: 4, icon: 'podium-outline', title: 'Thống kê tuyển dụng' },
        { id: 3, icon: 'exit-outline', title: 'Hồ sơ ứng tuyển mới' },
        { id: 5, icon: 'card-outline', title: 'Dịch vụ của bạn' },
        { id: 6, icon: 'card-outline', title: 'Quản lý lịch trình' },
    ]
    const UtilitiesGrid = () => (
        <View style={styles.gridUtili}>
            <TouchableOpacity style={styles.gridItemUtili} onPress={() => navigation.navigate('JobCreate')}>
                <Icon name={'add-circle-outline'} size={20} color={mainColor}></Icon>
                <Text style={StyleShare.lineText}>Tuyển dụng</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gridItemUtili} onPress={() => navigation.navigate('Services')}>
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
                <TouchableWithoutFeedback onPress={() => handleManageEmployersClick(item.id)} key={item.id}>
                    <View style={styles.gridItem}>
                        <View style={StyleShare.flexBetween}>
                            <Icon name={item.icon} size={20} color={mainColor}></Icon>
                            <Text style={StyleShare.textMainOption}>{item.info}</Text>
                        </View>
                        <View style={[StyleShare.flexBetween, { marginTop: 10 }]}>
                            <Text style={{ fontWeight: '500' }}>{item.title}</Text>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            ))}
        </View>
    );

    const handleLogout = () => {
        dispatch(logout());
        navigation.navigate('AuthStack')
    };

    const handleManageEmployersClick = (id) => {
        switch (id) {
            case 1:
                navigation.navigate('JobByCompany')
                break;
            case 2:
                navigation.navigate('Services')
                break;
            case 3:
                navigation.navigate('CVApplyNew')
                break;
            case 4:
                navigation.navigate('Statistical')
                break;
            case 5:
                navigation.navigate('ServicesByCompany')
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
                {/* <Text style={[StyleShare.titleText16, { marginTop: 10 }]}>Thông tin công ty</Text> */}
                {/* <View style={styles.containerInfoCompany}>
                    <View>
                        <Text style={StyleShare.titleText16}>{user.employer.company_name}</Text>
                        <View style={[StyleShare.flexBetween, { marginTop: 10 }]}>
                            <View style={[StyleShare.flexCenter, { flex: 1 }]}>
                                <Icon name="people-outline" size={18} />
                                <Text style={{ marginLeft: 5, fontSize: 12, fontWeight: '500' }}>{user.employer.followers_count} người theo dõi</Text>
                            </View>
                            <View style={[StyleShare.flexCenter, { flex: 1 }]}>
                                <Icon name="business-outline" size={18} />
                                <Text style={{ marginLeft: 5, fontSize: 12, fontWeight: '500' }}>{user.employer.size} nhân viên</Text>
                            </View>
                        </View>
                    </View>
                    <View>
                            <Text style={[StyleShare.titleText16, { marginTop: 10 }]}>Giới thiệu công ty</Text>
                            <Text style={{ color: textColor, marginTop: 5 }}>{user.employer.description}</Text>
                            <Text style={[StyleShare.titleText16, { marginTop: 10 }]}>Website</Text>
                            <TouchableOpacity onPress={() => handleOpenWebsite(user.employer.website)}>
                                <Text style={{ color: orange, marginTop: 5 }}>{user.employer.website}</Text>
                            </TouchableOpacity>
                            <Text style={[StyleShare.titleText16, { marginTop: 10 }]}>Email</Text>
                            <TouchableOpacity onPress={() => handleOpenEmail(user.email)}>
                                <Text style={{ color: orange, marginTop: 5 }}>{user.email}</Text>
                            </TouchableOpacity>
                            <Text style={[StyleShare.titleText16, { marginTop: 10 }]}>Địa chỉ công ty</Text>
                            <Text style={{ color: textColor, marginTop: 5 }}>{user.employer.address}</Text>
                        </View>
                </View> */}
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