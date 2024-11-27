import { StyleSheet, View, Text, TextInput, TouchableWithoutFeedback, Image, ScrollView, FlatList } from "react-native";
import UIHeader from "../../components/UIHeader";
import StyleShare from "../../assets/themes/StyleShare";
import { bgButton2, mainColor, white, orange } from "../../assets/themes/Color";
import Dropdown from "../../components/Dropdown";
import Icon from 'react-native-vector-icons/Ionicons'
import { Avatar, Chip } from "react-native-paper";
import { useEffect, useState } from "react";
import axios from "axios";


export default function Companies() {
    const [provinceData, setProvinceData] = useState([]);
    const [selectProvince, setSelectProvince] = useState('')
    const [searchKeywork, setSearchKeywork] = useState('')




    useEffect(() => {
        fetchProvinces();
    }, []);
    const fetchProvinces = async () => {
        try {
            const res = await axios.get('https://esgoo.net/api-tinhthanh/1/0.htm');
            const data = res.data.data || [];
            const formattedData = data.map((item) => ({
                title: item.full_name,
            }));
            setProvinceData(formattedData); // Lưu vào state
        } catch (error) {
            console.log('Error fetching provinces:', error);
        }
    };

    const renderItem = ({ item }) => {
        return (
            <TouchableWithoutFeedback>
                <View style={styles.jobItemContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={styles.containerAvatarJob}>
                            <Avatar.Image source={{ uri: item.job.employer.avatar }} size={36} style={{ backgroundColor: 'white' }} />
                        </View>
                        <View>
                            <Text style={StyleShare.titleJobAndName}>{item.job.title}</Text>
                            <Text style={{ marginTop: 5 }}>{item.job.employer.employer.company_name}</Text>
                        </View>
                    </View>
                    <View style={StyleShare.technologyContainer}>
                        <Chip style={StyleShare.chip}>{item.job.location}</Chip>
                        <Chip style={StyleShare.chip}>{`${item.job.salary} VND`}</Chip>
                        <Chip style={StyleShare.chip}>{item.job.experience}</Chip>
                        {item.job.technologies.map((tech, index) => (
                            <Chip key={index} style={StyleShare.chip}>
                                {tech.name}
                            </Chip>
                        ))}
                    </View>
                    <View style={StyleShare.flexBetween}>
                        <View style={StyleShare.flexCenter}>
                            <Icon name="time" size={22} color={'grey'} style={{ marginRight: 5 }} />

                            {/* <Text>Đã thêm: {moment(item.created_at).fromNow()}</Text> */}
                            <Text>{moment(item.job.expiration_date).format('DD/MM/YYYY')}</Text>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        )
    };

    return (
        <View style={StyleShare.container}>
            <UIHeader title={'Công ty'} />
            <View style={{ paddingHorizontal: 20 }}>
                <View style={StyleShare.searchDetail}>
                    <Icon name="search" color={mainColor} size={24} style={{ marginRight: 10 }} />
                    <TextInput
                        style={StyleShare.searchInput}
                        placeholder="Nhập tên công ty..."
                        value={searchKeywork}
                        onChangeText={(text) => setSearchKeywork(text)}
                        onSubmitEditing={() => navigation.navigate('JobSearch', { query: searchContent })}
                    />
                </View>
                <View>
                    <Dropdown
                        data={provinceData}
                        onSelect={(item) => {
                            setSelectProvince(item.title)
                        }}
                        placeholder="Chọn thành phố"
                    />
                </View>
            </View>

            <FlatList
                // data={jobs}
                renderItem={renderItem}
                // keyExtractor={item => item.job.id.toString()}
                ListEmptyComponent={
                    <View style={{ marginTop: 50, alignItems: 'center' }}>
                        <Image source={require("../../assets/images/save.png")} style={StyleShare.imageNullData} />
                        <Text style={StyleShare.titleText20}>Bạn chưa có bài tuyển dụng nào</Text>
                        <Text style={{ padding: 20, textAlign: 'center' }}>Bạn không có bất kỳ bài tuyển dụng nào, hãy đăng bài tuyển dụng để tìm kiếm ứng viên tiềm năng</Text>
                    </View>
                }
                contentContainerStyle={{ paddingBottom: 40 }}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    itemContainer: {
        backgroundColor: white,
        borderRadius: 10,
        padding: 20,
        backgroundColor: white,
        marginTop: 15,
        marginHorizontal: 20
    }


})