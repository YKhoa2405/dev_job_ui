import React, { useContext } from "react";
import { View, Text, TouchableWithoutFeedback, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from "react-native";
import styleShare from "../../assets/theme/style";
import { Avatar, Chip } from "react-native-paper";
import { orange, bgButton1, grey, white, textColor } from "../../assets/theme/color";
import Icon from "react-native-vector-icons/Ionicons"
import MyContext from "../../config/MyContext";

export default function HomeEmployers({ navigation }) {
    const [user, dispatch] = useContext(MyContext)
    const isEmployerComplete = user.employer.company_name !== null &&
        user.employer.company_name !== ""

    const isEmployerDocument = user.employer.business_document !== null

    const manageEmployers = [
        { id: 1, icon: 'megaphone-outline', title: 'Chiến dịch tuyển dụng' },
        { id: 2, icon: 'reader-outline', title: 'CV tiếp nhận' },
        { id: 4, icon: 'podium-outline', title: 'Thống kê tuyển dụng' },
        { id: 3, icon: 'exit-outline', title: 'CV ứng tuyển mới' },
        { id: 5, icon: 'card-outline', title: 'Dịch vụ đã áp dụng' },

    ]
    const UtilitiesGrid = () => (
        <View style={styles.gridUtili}>
            <TouchableOpacity style={styles.gridItemUtili} onPress={() => navigation.navigate('AddPost')}>
                <Icon name={'add-circle-outline'} size={20} color={bgButton1}></Icon>
                <Text style={styleShare.lineText}>Đăng bài</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gridItemUtili} onPress={() => navigation.navigate('Shopping')}>
                <Icon name={'cart-outline'} size={20} color={bgButton1}></Icon>
                <Text style={styleShare.lineText}>Mua dịch vụ</Text>
            </TouchableOpacity>
        </View>
    );

    const ManageEmployersGrid = () => (
        <View style={styles.grid}>
            {manageEmployers.map((item) => (
                <TouchableWithoutFeedback onPress={() => handleManageEmployersClick(item.id)} key={item.id}>
                    <View style={styles.gridItem}>
                        <View style={styleShare.flexBetween}>
                            <Icon name={item.icon} size={20} color={bgButton1}></Icon>
                            <Text style={styleShare.textMainOption}>{item.info}</Text>
                        </View>
                        <View style={[styleShare.flexBetween, { marginTop: 10 }]}>
                            <Text style={{ fontWeight: '500' }}>{item.title}</Text>
                        </View>
                    </View>
                </TouchableWithoutFeedback>

            ))}
        </View>
    );

    const handleLogout = async () => {
        navigation.navigate('Login')
        dispatch({
            'type': 'logout'
        })
    }

    const handleManageEmployersClick = (id) => {
        switch (id) {
            case 1:
                navigation.navigate('ListJobEmployer')
                break;
            case 2:
                navigation.navigate('CVApply')
                break;
            case 3:
                navigation.navigate('CVApplyNew')
                break;
            case 4:
                navigation.navigate('Statistical')
                break;
            case 5:
                navigation.navigate('ServiceList')
                break
            default:
                console.log('Unknown item clicked');
                break;
        }
    };

    return (
        <ScrollView style={styleShare.container} showsVerticalScrollIndicator={false}>
            <View style={styles.containerTop}>
                <View>
                    <Text style={styleShare.textMainOption}>Xin chào, {user.username}</Text>
                    {user.employer.approval_status === true ? (
                        <Chip style={{ marginTop: 5, backgroundColor: 'green', width: 130 }}><Text style={{ color: 'white' }}>Đã xác nhận</Text></Chip>
                    ) : (
                        <Chip style={{ marginTop: 5, backgroundColor: 'red', width: 130 }}><Text style={{ color: 'white' }}>Chưa xác nhận</Text></Chip>
                    )}
                </View>
                <Avatar.Image source={{ uri: user.avatar }} size={50} style={{ backgroundColor: 'white' }} />
            </View>
            {user.employer.approval_status === true ? (
                <View style={styles.containerMain}>
                    <Text style={[styleShare.titleJobAndName, { marginVertical: 10 }]}>Tiện ích</Text>
                    <UtilitiesGrid />
                    <Text style={[styleShare.titleJobAndName, { marginVertical: 10, marginTop: 10 }]}>Quản lý chiến dịch tuyển dụng</Text>
                    <ManageEmployersGrid />
                    <Text style={[styleShare.titleJobAndName, { marginTop: 10 }]}>Thông tin công ty</Text>
                    <View style={styles.containerInfoCompany}>
                        <View>
                            <Text style={styleShare.titleJobAndName}>{user.employer.company_name}</Text>
                            <View style={[styleShare.flexBetween, { marginTop: 10 }]}>
                                <View style={[styleShare.flexCenter, { flex: 1 }]}>
                                    <Icon name="people-outline" size={18} />
                                    <Text style={{ marginLeft: 5, fontSize: 12, fontWeight: '500' }}>{user.employer.followers_count} người theo dõi</Text>
                                </View>
                                <View style={[styleShare.flexCenter, { flex: 1 }]}>
                                    <Icon name="business-outline" size={18} />
                                    <Text style={{ marginLeft: 5, fontSize: 12, fontWeight: '500' }}>{user.employer.size} nhân viên</Text>
                                </View>
                            </View>
                        </View>
                        <View>
                            <Text style={[styleShare.titleJobAndName, { marginTop: 10 }]}>Giới thiệu công ty</Text>
                            <Text style={{ color: textColor, marginTop: 5 }}>{user.employer.description}</Text>
                            <Text style={[styleShare.titleJobAndName, { marginTop: 10 }]}>Website</Text>
                            <TouchableOpacity onPress={() => handleOpenWebsite(user.employer.website)}>
                                <Text style={{ color: orange, marginTop: 5 }}>{user.employer.website}</Text>
                            </TouchableOpacity>
                            <Text style={[styleShare.titleJobAndName, { marginTop: 10 }]}>Email</Text>
                            <TouchableOpacity onPress={() => handleOpenEmail(user.email)}>
                                <Text style={{ color: orange, marginTop: 5 }}>{user.email}</Text>
                            </TouchableOpacity>
                            <Text style={[styleShare.titleJobAndName, { marginTop: 10 }]}>Địa chỉ công ty</Text>
                            <Text style={{ color: textColor, marginTop: 5 }}>{user.employer.address}</Text>
                        </View>
                    </View>
                </View>

            ) : (
                <View style={styles.containerMain}>
                    <TouchableOpacity
                        style={styles.itemUploadCompany}
                        onPress={() => navigation.navigate('UpdateEmployer')}
                        disabled={isEmployerComplete} // Khi hoàn thành, nút sẽ không nhấn được
                    >
                        <View style={styleShare.flexBetween}>
                            <Text style={styleShare.titleJobAndName}>
                                {isEmployerComplete ? "Cập nhật thông tin về công ty" : "Cập nhật thông tin về công ty"}
                            </Text>
                            <Icon
                                name={isEmployerComplete ? "checkmark-circle-sharp" : "arrow-forward-circle"}
                                size={30}
                                color={orange}
                            />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.itemUploadCompany}
                        onPress={() => navigation.navigate('UploadBusinessDocument')}
                        disabled={isEmployerDocument}>
                        <View style={styleShare.flexBetween}>
                            <Text style={styleShare.titleJobAndName}>
                                {isEmployerDocument ? "Tải lên các giấy tờ cần thiết" : "Tải lên các giấy tờ cần thiết"}
                            </Text>
                            <Icon
                                name={isEmployerDocument ? "checkmark-circle-sharp" : "arrow-forward-circle"}
                                size={30}
                                color={orange}
                            />
                        </View>
                    </TouchableOpacity>

                    <View style={{ marginTop: 20, padding: 20 }}>
                        <Text style={styleShare.titleJobAndName}>Sau khi hoàn thành các yêu cầu, quản trị viên sẽ duyệt tài khoản trở thành nhà tuyển dụng </Text>
                    </View>
                </View>
            )}
            <View style={{ margin: 20 }}>
                <TouchableOpacity onPress={() => handleLogout()}>
                    <View style={styles.btnLogout}>
                        <Text style={{ fontWeight: '500', fontSize: 16, marginRight: 10, color: 'red' }}>Đăng xuất</Text>
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
        paddingBottom: 20,
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
        paddingVertical: 30
    },
    gridUtili: {
        flexWrap: 'wrap',
        justifyContent: 'space-center',
        flexDirection: 'row',
        backgroundColor: white,
        padding: 20,
        borderRadius: 20,
        marginBottom: 20
    }
    , gridItemUtili: {
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
    },
    containerInfoCompany: {
        padding: 20,
        backgroundColor: 'white',
        marginVertical: 10,
        borderRadius: 10
    }
})