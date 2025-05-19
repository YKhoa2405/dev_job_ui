import { StyleSheet, View, Text, Image, TouchableOpacity, TouchableWithoutFeedback, ActivityIndicator, Linking, FlatList, ScrollView } from "react-native";
import StyleShare from "../../assets/themes/StyleShare";
import { mainColor, bgButton2, grey, orange, textColor, white } from "../../assets/themes/Color";
import { Avatar } from "react-native-paper";
import UIHeader from "../../components/UIHeader";
import Icon from "react-native-vector-icons/Ionicons";
import { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import { useDispatch, useSelector } from "react-redux";
import { fetchCompanyByUser } from "../../redux/slice/companySlice";
import moment from "moment";


export default function ProfileCompany({ navigation }) {
    const dispatch = useDispatch()

    const { companyByUser, loading } = useSelector((state) => state.company);

    useEffect(() => {
        dispatch(fetchCompanyByUser());
    }, []);

    const handleLocationPress = async () => {
        const address = companyByUser?.address;
        const encodedAddress = encodeURIComponent(address);
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
        const supported = await Linking.canOpenURL(mapUrl);

        if (supported) {
            await Linking.openURL(mapUrl);
        } else {
            ToastMess({ type: 'error', text1: 'Không thể mở bản đồ.' });
        }
    };
    return (
        <View style={StyleShare.container}>
            <UIHeader leftIcon={"arrow-back"}
                title={'Thông tin công ty'}
                handleLeftIcon={() => { navigation.goBack() }} />
            {loading ? <>
                <Loading /></> : <>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 20 }}>
                    <View style={styles.containerTop}>
                        <View style={StyleShare.containerAvatar}>
                            <Avatar.Image source={{ uri: companyByUser?.avatar }} size={60} style={{ backgroundColor: 'white' }} />
                        </View>
                        <Text style={StyleShare.titleText16}>{companyByUser?.name}</Text>
                        <Text style={{ marginTop: 5, textAlign: 'center' }}>{companyByUser?.slogan}</Text>

                        <View style={[StyleShare.flexBetween, { marginTop: 10 }]}>
                            <View style={[StyleShare.flexCenter, { flex: 1 }]}>
                                <Icon name="people-outline" size={18} />
                                <Text style={{ marginLeft: 5, fontSize: 12, fontWeight: '500' }}>{companyByUser?.followers} người theo dõi</Text>
                            </View>
                            <View style={[StyleShare.flexCenter, { flex: 1 }]}>
                                <Icon name="business-outline" size={18} />
                                <Text style={{ marginLeft: 5, fontSize: 12, fontWeight: '500' }}>{companyByUser?.size} nhân viên</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.containerMain}>
                        <View style={StyleShare.flexBetween}>
                            <TouchableOpacity onPress={() => handleLocationPress()}>
                                <View style={[StyleShare.buttonDetailApply, { backgroundColor: white }]}>
                                    <Icon name="map-outline" size={22} />
                                    <Text style={{ marginLeft: 5 }}>Xem bản đồ</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => navigation.navigate("EditCompany")}>
                                <View style={[StyleShare.buttonDetailApply, { backgroundColor: white }]}>
                                    <Icon name="pencil-outline" size={22} />
                                    <Text style={{ marginLeft: 5 }}>Chỉnh sửa thông tin</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{ marginTop: 10 }}>
                            <Text style={[StyleShare.titleText16, { marginTop: 10 }]}>Giới thiệu công ty</Text>
                            <Text style={{ color: textColor, marginTop: 5 }}>{companyByUser?.about}</Text>
                            <Text style={[StyleShare.titleText16, { marginTop: 10 }]}>Lĩnh vực hoạt động</Text>
                            <Text style={{ color: textColor, marginTop: 5 }}>{companyByUser?.field}</Text>
                            <Text style={[StyleShare.titleText16, { marginTop: 10 }]}>Website</Text>
                            <TouchableOpacity onPress={() => handleOpenWebsite(companyByUser?.website)}>
                                <Text style={{ color: orange, marginTop: 5 }}>{companyByUser?.website}</Text>
                            </TouchableOpacity>
                            <Text style={[StyleShare.titleText16, { marginTop: 10 }]}>Mã số thuế</Text>
                            <Text style={{ color: textColor, marginTop: 5 }}>{companyByUser?.taxCode}</Text>
                            <Text style={[StyleShare.titleText16, { marginTop: 10 }]}>Giấy phép kinh doanh</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    if (companyByUser?.businessLicenseUrl) {
                                        Linking.openURL(companyByUser.businessLicenseUrl);
                                    }
                                }}
                            >
                                <Text style={{ color: orange, marginTop: 5, }}>
                                    {companyByUser?.businessLicenseUrl ? 'Xem giấy phép' : 'Chưa có'}
                                </Text>
                            </TouchableOpacity>
                            <Text style={[StyleShare.titleText16, { marginTop: 10 }]}>Địa chỉ công ty</Text>
                            <Text style={{ color: textColor, marginTop: 5 }}>{companyByUser?.address}</Text>
                            <Text style={[StyleShare.titleText16, { marginTop: 10 }]}>Ngày tạo tài khoản</Text>
                            <Text style={{ color: textColor, marginTop: 5 }}>{moment(companyByUser?.createdAt).format("DD/MM/YYYY")}</Text>
                            <Text style={[StyleShare.titleText16, { marginTop: 10 }]}>Ngày cập nhật</Text>
                            <Text style={{ color: textColor, marginTop: 5 }}>{moment(companyByUser?.updatedAt).format("DD/MM/YYYY")}</Text>
                            <Text style={[StyleShare.titleText16, { marginTop: 10 }]}>Cập nhật bởi</Text>
                            <Text style={{ color: textColor, marginTop: 5 }}>{companyByUser?.updateBy?.email}</Text>

                        </View>
                    </View>

                </ScrollView>
            </>}
        </View>
    )
}

const styles = StyleSheet.create({
    containerTop: {
        alignItems: 'center',
        backgroundColor: white,
        marginTop: 25,
        paddingTop: 45,
        paddingBottom: 15,
        paddingHorizontal: 20
    },
    containerMain: {
        flex: 1,
        paddingHorizontal: 20
    },
    containerAvatarJob: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: bgButton2,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15
    },
    avatarJob: {
        width: 30,
        height: 30
    },
    btnSave: {
        position: 'absolute',
        top: 20,
        right: 20,
        opacity: 0.8,
        zIndex: 999
    },
    jobItemContainer: {
        backgroundColor: white,
        borderRadius: 20,
        padding: 20,
        backgroundColor: white,
        marginTop: 10,
        marginHorizontal: 20
    },

})