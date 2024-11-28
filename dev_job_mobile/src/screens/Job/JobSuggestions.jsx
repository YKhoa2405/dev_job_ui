import React, { useState } from "react";
import { View, Image, TouchableOpacity, Text, FlatList, TouchableWithoutFeedback, TextInput } from "react-native";
import StyleShare from "../../assets/themes/StyleShare";
import UIHeader from "../../components/UIHeader";
import { Avatar, Chip } from "react-native-paper";
import Icon from 'react-native-vector-icons/Ionicons'
import { mainColor } from "../../assets/themes/Color";
import Dropdown from "../../components/Dropdown";


export default function JobSuggestions({ navigation, route }) {
    const { title, api } = route.params;
    const [searchKeywork, setSearchKeywork] = useState('')
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


    const renderItem = (item) => {
        <TouchableWithoutFeedback>
            <View style={StyleShare.jobItemContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Avatar.Image size={36} style={{ backgroundColor: 'white' }} />
                    <View>
                        <Text style={StyleShare.titleText16}>ten cong ty</Text>
                        <Text style={{ marginTop: 5 }}>ten cong ty</Text>
                    </View>
                </View>
                <View style={StyleShare.technologyContainer}>
                    <Chip style={StyleShare.chip}>Location</Chip>

                </View>
                <View style={StyleShare.flexBetween}>
                    <View style={StyleShare.flexCenter}>
                        <Icon name="time" size={22} color={'grey'} style={{ marginRight: 5 }} />

                        {/* <Text>Đã thêm: {moment(item.created_at).fromNow()}</Text> */}
                        {/* <Text>{moment(item.expiration_date).format('DD/MM/YYYY')}</Text> */}
                        <Text>10 ngày</Text>
                    </View>
                </View>
            </View>
        </TouchableWithoutFeedback>
    }

    return (
        <View style={[StyleShare.container]}>
            <View style={{ marginHorizontal: 20, marginTop: 30, }}>
                <View style={{flexDirection:'row', alignItems:'center', marginBottom:10 }}>
                    <Icon name="arrow-back" size={26} color={mainColor} style={{marginRight:10}} onPress={() => navigation.goBack()} />
                        <Text style={StyleShare.titleText16}>{title}</Text>
                </View>
                <TextInput
                    style={StyleShare.searchDetail}
                    // onSubmitEditing={handleSearch}
                    value={searchKeywork}
                    onChangeText={query => setSearchKeywork(query)}
                    placeholder="Nhập từ khóa để tìm kiếm ..." />
                <View style={[StyleShare.flexBetween, { }]}>
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
                <Text style={[StyleShare.titleText16, { marginVertical: 10 }]}>20 việc làm</Text>
                <View style={{ marginHorizontal: 20 }}>
                </View>
            </View>

            <FlatList
                // data={jobs}
                renderItem={renderItem}
                // keyExtractor={item => item.job.id.toString()}
                ListEmptyComponent={
                    <View style={{ marginTop: 50, alignItems: 'center' }}>
                        <Image source={require("../../assets/images/save.png")} style={StyleShare.imageNullData} />
                        <Text style={StyleShare.titleText20}>Chưa có việc làm phù hợp </Text>
                        <Text style={{ padding: 20, textAlign: 'center' }}>Hiện tại chưa có việc làm phù hợp, hãy quay lại sau nhé</Text>
                    </View>
                }
                contentContainerStyle={{ paddingBottom: 40 }}
            />

        </View>
    )
}