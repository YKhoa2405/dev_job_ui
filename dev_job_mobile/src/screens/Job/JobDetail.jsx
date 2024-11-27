import { StyleSheet, View, Image, Text, TouchableOpacity, ScrollView, TouchableWithoutFeedback, ActivityIndicator, Linking } from "react-native";
import UIHeader from "../../components/UIHeader";
import { Avatar } from "react-native-paper";
import Icon from "react-native-vector-icons/Ionicons";
import StyleShare from "../../assets/themes/StyleShare";
import { mainColor, orange, textColor, white } from "../../assets/themes/Color";
import moment from "moment/moment";

export default function JobDetail() {
    const menuItems = [
        {
          id: '1',
          icon: 'briefcase',
          title: 'Loại công việc',
          info: 'Full-time',
        },
        {
          id: '2',
          icon: 'calendar',
          title: 'Ngày bắt đầu',
          info: '01/12/2024',
        },
      ];

    const jobDetail = {
        employer: {
            id: '123',
            avatar: 'https://example.com/avatar.jpg',
            employer: {
                company_name: 'Công ty TNHH ABC',
            },
        },
        title: 'Frontend Developer',
        salary: '20,000,000 - 30,000,000 VND',
        location: 'Hà Nội, Việt Nam',
        technologies: [
            { name: 'ReactJS' },
            { name: 'JavaScript' },
            { name: 'TypeScript' },
        ],
        description: 'Phát triển và bảo trì các ứng dụng frontend cho dự án nội bộ và khách hàng.',
        requirements: 'Ít nhất 2 năm kinh nghiệm làm việc với ReactJS và các thư viện liên quan.',
        location_detail: 'Tầng 3, Tòa nhà ABC, Quận Hoàn Kiếm, Hà Nội.',
    };

    return (
        <View style={{ flex: 1 }}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
                <UIHeader leftIcon={"arrow-back"}
                    rightIcon={"ellipsis-horizontal"}
                    handleLeftIcon={() => { navigation.goBack() }} />
                <View style={styles.containerTop}>
                    <TouchableOpacity style={StyleShare.containerAvatar} onPress={() => navigation.navigate('ProfileEmployer', { employerId: jobDetail.employer.id })}>
                        <Avatar.Image source={{ uri: jobDetail.employer.avatar }} size={60} style={{ backgroundColor: 'white' }} />
                    </TouchableOpacity>
                    <Text style={StyleShare.titleText16}>{jobDetail.title}</Text>
                    <Text >{jobDetail.employer.employer.company_name}</Text>
                    <View style={styles.descOption}>
                        <View style={styles.descDetail}>
                            <Icon name="cash" size={30} color={mainColor} />
                            <Text style={styles.textDesc}>Mức lương</Text>
                            <Text style={StyleShare.titleText16}>{jobDetail.salary}</Text>
                        </View>
                        <View style={styles.descDetail}>
                            <Icon name="location-sharp" size={30} color={mainColor} />
                            <Text style={styles.textDesc}>Địa điểm</Text>
                            <Text style={StyleShare.titleText16}>{jobDetail.location}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.containerMain}>
                    <Text style={StyleShare.titleText20}>Thông tin chung</Text>
                    <View style={{ marginBottom: 20 }}>
                        {menuItems.map((item) => (
                            <View key={item.id} style={styles.infoContainer}>
                                <Icon name={item.icon} size={26} color={mainColor} />
                                <View style={styles.infoDesc}>
                                    <Text style={{ color: textColor }}>{item.title}</Text>
                                    <Text style={{ fontWeight: '500', fontSize: 16, marginTop: 3 }}>{item.info}</Text>
                                </View>
                            </View>
                        ))}
                        <View style={styles.infoContainer}>
                            <Icon name={'podium'} size={26} color={mainColor} />
                            <View style={styles.infoDesc}>
                                <Text style={{ color: textColor }}>Công nghệ</Text>
                                {jobDetail.technologies.map((tech, index) => (
                                    <Text key={index} style={{ fontWeight: '500', fontSize: 16, marginTop: 3 }}>{tech.name}</Text>
                                ))}
                            </View>
                        </View>
                    </View>
                    <View style={{ marginBottom: 20 }}>
                        <Text style={StyleShare.titleText20}>Mô tả công việc</Text>
                        <Text style={{ color: textColor, marginTop: 5 }}>{jobDetail.description}</Text>
                    </View>
                    <View style={{ marginBottom: 20 }}>
                        <Text style={StyleShare.titleText20}>Yêu cầu ứng viên</Text>
                        <Text style={{ color: textColor, marginTop: 5 }}>{jobDetail.requirements}</Text>
                    </View>
                    <View style={{ marginBottom: 20 }}>
                        <Text style={StyleShare.titleText20}>Địa chỉ làm việc</Text>
                        <Text style={{ color: textColor, marginTop: 5 }}>{jobDetail.location_detail}</Text>
                    </View>
                    <View style={{ marginBottom: 20 }}>
                        <TouchableOpacity style={StyleShare.buttonDetailApply} onPress={() => handleLocationPress()}>
                            <Text style={{ color: textColor, marginTop: 5 }}><Text style={{ fontWeight: '500', color: mainColor }}>Xem địa chỉ trên Map</Text></Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
            <View style={[StyleShare.bottomBar, StyleShare.flexCenter]}>
                <View style={StyleShare.buttonSave}>
                    <Icon name="bookmarks" color={orange} size={24} />
                </View>
                {/* {jobDetail.is_saved ? (
                ) : (
                    <TouchableOpacity style={StyleShare.buttonSave} onPress={() => handleSaveJob(jobDetail.id)}>
                        <Icon name="bookmarks-outline" color={orange} size={24} />
                    </TouchableOpacity>
                )} */}
                <TouchableOpacity style={styles.buttonApply} onPress={() => { navigation.navigate('UploadCV', { jobId: jobDetail.id }) }}>
                    <Text style={styles.buttonText}>Ứng tuyển ngay</Text>
                </TouchableOpacity>
                {/* {jobDetail.is_applied = true ? (
                ) : (
                    <TouchableOpacity style={styles.buttonApply} onPress={() => navigation.navigate('ProfileEmployer', { employerId: jobDetail.employer.id })}>
                        <Text style={styles.buttonText}>Hồ sơ công ty</Text>
                    </TouchableOpacity>
                )} */}

            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    containerTop: {
        alignItems: 'center',
        backgroundColor: white,
        borderRadius: 20,
        marginHorizontal: 20,
        marginTop: 30,
        paddingTop: 45,
        paddingHorizontal: 20,
        flexShrink: 1
    }
    , descOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',

    },
    descDetail: {
        alignItems: 'center',
        padding: 20
    }, textDesc: {
        marginTop: 10,
        marginBottom: 5
    },
    containerMain: {
        paddingHorizontal: 20,
        marginTop: 10,
        paddingTop: 10,
        backgroundColor: white
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12
    },
    infoDesc: {
        marginLeft: 20
    },
    buttonApply: {
        backgroundColor: mainColor,
        padding: 12,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
        width: '80%',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: "500",
        color: white
    },


})