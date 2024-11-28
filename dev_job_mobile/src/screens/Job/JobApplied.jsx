import React from "react";
import { View, Image, TouchableOpacity, Text, FlatList, TouchableWithoutFeedback } from "react-native";
import StyleShare from "../../assets/themes/StyleShare";
import UIHeader from "../../components/UIHeader";
import { Avatar, Chip } from "react-native-paper";
import Icon from 'react-native-vector-icons/Ionicons'


export default function JobApplied ({ navigation }) {
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
        <View style={StyleShare.container}>
            <UIHeader
                leftIcon={"arrow-back"}
                title={'Việc làm đã ứng tuyển'}
                rightIcon={'flash-off-outline'}
                // handleRightIcon={}
                handleLeftIcon={() => { navigation.goBack() }} />
            <View style={{ marginHorizontal: 20, marginTop: 5 }}>
                <Text style={StyleShare.titleText16}>20 việc làm</Text>
            </View>
            <FlatList
                // data={jobs}
                renderItem={renderItem}
                // keyExtractor={item => item.job.id.toString()}
                ListEmptyComponent={
                    <View style={{ marginTop: 50, alignItems: 'center' }}>
                        <Image source={require("../../assets/images/save.png")} style={StyleShare.imageNullData} />
                        <Text style={StyleShare.titleText20}>Bạn chưa ứng tuyển việc làm </Text>
                        <Text style={{ padding: 20, textAlign: 'center' }}>Bạn chưa có bất kỳ đơn ứng tuyển nào, hãy ứng tuyển để nhận đươc việc làm mong muốn</Text>
                    </View>
                }
                contentContainerStyle={{ paddingBottom: 40 }}
            />

        </View>
    )
}