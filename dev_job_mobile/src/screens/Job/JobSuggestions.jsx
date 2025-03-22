import React, { useState } from "react";
import { View, Image, TouchableOpacity, Text, FlatList, TouchableWithoutFeedback, TextInput } from "react-native";
import StyleShare from "../../assets/themes/StyleShare";
import UIHeader from "../../components/UIHeader";
import { Avatar, Chip } from "react-native-paper";
import Icon from 'react-native-vector-icons/Ionicons'
import { mainColor, white } from "../../assets/themes/Color";
import Dropdown from "../../components/Dropdown";
import Modal from "react-native-modal";
import Button from "../../components/Button";


export default function JobSuggestions({ navigation, route }) {
    const { title, api } = route.params;
    const [searchKeywork, setSearchKeywork] = useState('')
    const [isModalVisible, setModalVisible] = useState(false);
    const [level, setLevel] = useState(null)
    const [salary, setSalary] = useState(null)
    const [jobType, setJobType] = useState(null)
    const [jobs, setJobs] = useState([]);

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

    const jobTypeData = [
        { title: 'Office' },
        { title: 'Remote' },
        { title: 'Hybrid' },
    ]


    const renderItem = (item) => {
        <TouchableWithoutFeedback>
            <View style={StyleShare.jobItemContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Avatar.Image size={36} style={{ backgroundColor: 'white' }} />
                    <View style={{ flex: 1 }}>
                        <Text style={StyleShare.titleText16} numberOfLines={2}>{item?.name}</Text>
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
        <View style={StyleShare.container}>
            <Modal isVisible={isModalVisible} onBackdropPress={() => setModalVisible(false)}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                backdropTransitionInTiming={500}
                backdropTransitionOutTiming={500}
                style={StyleShare.modalStyle}>
                <View style={StyleShare.modalContent}>
                    <View style={[StyleShare.flexBetween, { marginVertical: 15 }]}>
                        <Text style={StyleShare.titleText20}>Bộ lọc việc làm</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)} >
                            <Icon name="close" size={26} color={'red'} />
                        </TouchableOpacity>
                    </View>


                    <Text style={StyleShare.titleText16}>Level</Text>
                    <Dropdown
                        data={levelData}
                        onSelect={(item) => {
                            setLevel(item.title)
                        }}
                        placeholder="Chọn Level"
                        buttonStyle={{
                            marginTop: 10,
                            width: '100%',
                            height: 50,
                            marginBottom: 20
                        }}
                    />

                    <Text style={StyleShare.titleText16}>Loại hình</Text>
                    <Dropdown
                        data={jobTypeData}
                        onSelect={(item) => {
                            setJobType(item.title)
                        }}
                        placeholder="Chọn loại hình"
                        buttonStyle={{
                            marginTop: 10,
                            width: '100%',
                            height: 50,
                            marginBottom: 20
                        }}
                    />
                    <Text style={StyleShare.titleText16}>Mức lương</Text>
                    <Dropdown
                        data={salaryData}
                        onSelect={(item) => {
                            setSalary(item.title)
                        }}
                        placeholder="Chọn mức lương"
                        buttonStyle={{
                            marginTop: 10,
                            width: '100%',
                            height: 50,
                            marginBottom: 20
                        }}
                    />



                    <Button
                        title={'Áp dụng'}
                        backgroundColor={mainColor}
                        textColor={white}
                    // onPress={applyFilters}
                    />
                    {/* <Button
                        title={'Đặt lại'}
                        backgroundColor={bgButton2}
                        textColor={'black'}
                        onPress={resetFilters}
                    /> */}
                </View>
            </Modal>
            <UIHeader
                leftIcon={"arrow-back"}
                title={title}
                rightIcon={"options"}
                handleRightIcon={() => setModalVisible(true)}
                handleLeftIcon={() => { navigation.goBack() }} />
            <View style={{ paddingHorizontal: 20, marginBottom: 5 }}>
                <View style={StyleShare.searchDetail}>
                    <Icon name="search" color={mainColor} size={24} style={{ marginRight: 10 }} />
                    <TextInput
                        style={StyleShare.searchInput}
                        placeholder="Tìm kiếm tin tuyển dụng..."
                        value={searchKeywork}
                        onChangeText={(text) => setSearchKeywork(text)}
                    // onSubmitEditing={() => {
                    //     fetchJobByCompany(1, 10, searchKeywork)
                    // }}
                    />
                </View>
                <View style={{ marginTop: 10 }}>
                    {/* <Text style={StyleShare.titleText16}>{totalItems} việc làm</Text> */}
                </View>
            </View>


            <FlatList
                data={jobs}
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