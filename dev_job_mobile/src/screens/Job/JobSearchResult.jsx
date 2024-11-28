import React, { useContext, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TouchableWithoutFeedback, Image, ActivityIndicator } from "react-native";
import Icon from "react-native-vector-icons/Ionicons"
import { mainColor, bgButton2, grey, orange, white } from "../../assets/themes/Color";
import { Searchbar, Chip, Avatar } from "react-native-paper";
import axios from "axios";
import moment from "moment";
import StyleShare from "../../assets/themes/StyleShare";
import Dropdown from "../../components/Dropdown";

export default function JobSearchResult({ navigation, route }) {
    const [level, setLevel] = useState('')
    const [salary, setSalary] = useState('')

    const levelData = [
        { title: 'Intern' },
        { title: 'Fresher' },
        { title: 'Junior' },
        { title: 'Middle' },
        { title: 'Senior' },
        { title: 'Trưởng nhóm' },
        { title: 'Trưởng phòng' },
        { title: 'Director' },
    ]

    const salaryData = [
        { title: 'Dưới 5 triệu' },
        { title: '10 - 15 triệu' },
        { title: '15 - 20 triệu' },
        { title: '20 - 25 triệu' },
        { title: '30 - 50 triệu' },
        { title: 'Trên 50 triệu' },
        { title: 'Thỏa thuận' }
    ]

    const renderSearchJobItem = ({ item }) => (
        <TouchableWithoutFeedback key={item.id} onPress={() => { navigation.navigate('JobDetail', { jobId: item.id }) }}>
            <View style={styles.jobItemContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={styles.containerAvatarJob}>
                        <Avatar.Image source={{ uri: item.employer.avatar }} size={36} style={{ backgroundColor: 'white' }} />
                    </View>
                    <View>
                        <Text style={StyleShare.titleJobAndName}>{item.title}</Text>
                        <Text style={{ marginTop: 5 }}>{item.employer.employer.company_name}</Text>
                    </View>
                </View>
                <View style={StyleShare.technologyContainer}>
                    <Chip style={StyleShare.chip}>{item.location}</Chip>
                    <Chip style={StyleShare.chip}>{`${item.salary} VND`}</Chip>
                    <Chip style={StyleShare.chip}>{item.experience}</Chip>
                    {item.technologies.map((tech, index) => (
                        <Chip key={index} style={StyleShare.chip}>
                            {tech.name}
                        </Chip>
                    ))}
                </View>
                <View style={StyleShare.flexBetween}>
                    <View style={StyleShare.flexCenter}>
                        <Icon name="time" size={22} color={'grey'} style={{ marginRight: 5 }} />

                        {/* <Text>Đã thêm: {moment(item.created_at).fromNow()}</Text> */}
                        <Text>{moment(item.expiration_date).format('DD/MM/YYYY')}</Text>
                    </View>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );


    return (
        <View style={[StyleShare.container, { marginHorizontal: 20 }]}>
            <View style={styles.containerTop}>
                <Icon name="arrow-back" size={26} color={mainColor} onPress={() => navigation.goBack()} />
                <TouchableOpacity style={[StyleShare.flexCenter, { marginLeft: 10 }]}>
                    <Icon name="location" size={20} color={orange} onPress={() => navigation.goBack()} />
                    <Text style={styles.textLocation}>Location</Text>
                    <Icon name="chevron-down-outline" size={20} color={orange} />
                </TouchableOpacity>
            </View>
            <View style={styles.containerMain}>
                <TouchableOpacity onPress={() => navigation.navigate('JobSearch')} style={StyleShare.searchDetail}>
                    <Icon name="search" color={mainColor} size={24} style={{ marginRight: 10 }} />
                    <Text>Search</Text>
                </TouchableOpacity>
                <View style={StyleShare.flexBetween}>
                    <Dropdown
                        data={levelData}
                        onSelect={(item) => {
                            setLevel(item.title)
                        }}
                        placeholder="Chọn Level"
                    />
                    <Dropdown
                          data={salaryData}
                          onSelect={(item) => {
                              setSalary(item.title)
                          }}
                        placeholder="Chọn mức lương"
                    />
                </View>
                <FlatList
                    // data={recentJobs}
                    // renderItem={renderSearchJobItem}
                    // keyExtractor={item => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                    style={styles.containerflat}
                    ListEmptyComponent={
                        <View style={{ marginTop: 50, alignItems: 'center' }}>
                            <Image source={require("../../assets/images/save.png")} style={StyleShare.imageNullData} />
                            <Text style={StyleShare.titleText20}>Không có kết qủa tìm kiếm</Text>
                            <Text style={{ padding: 20, textAlign: 'center' }}>Bạn hãy thử thay đổi từ khóa hoặc loại bỏ bớt tiêu chí lọc và thử lại </Text>
                        </View>
                    }
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    recentSearchItem: {
        paddingVertical: 15,
        flexDirection: 'row',
        alignItems: 'center'
    },
    jobTitle: {
        marginLeft: 10
    }, containerTop: {
        flexDirection: 'row',
        marginTop: 30,
        marginBottom: 10,
        alignItems: 'center'
    },
    textLocation: {
        fontWeight: '500',
        marginHorizontal: 5
    },
    optionSearch: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 5,
        marginRight: 10,
        borderRadius: 20,
        backgroundColor: white,
        justifyContent: 'flex-start',
        elevation: 3
    },
    jobItemContainer: {
        backgroundColor: white,
        borderRadius: 20,
        padding: 20,
        marginTop: 10
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
    infoJobContainer: {
        paddingTop: 20,
        paddingRight: 10,
        flexDirection: 'row',
        justifyContent: 'center'
    },
    containerflat: {
        paddingTop: 10,
        paddingBottom: 20
    },
})