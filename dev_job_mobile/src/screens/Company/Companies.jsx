import { StyleSheet, View, Text, TextInput, TouchableWithoutFeedback, Image, FlatList } from "react-native";
import UIHeader from "../../components/UIHeader";
import StyleShare from "../../assets/themes/StyleShare";
import { mainColor, white } from "../../assets/themes/Color";
import Dropdown from "../../components/Dropdown";
import Icon from 'react-native-vector-icons/Ionicons'
import { Avatar, Chip } from "react-native-paper";
import { useEffect, useState } from "react";
import axios from "axios";
import API, { endpoints } from "../../assets/config/API";
import Loading from "../../components/Loading";


export default function Companies({ navigation }) {
    const [provinceData, setProvinceData] = useState([]);
    const [selectProvince, setSelectProvince] = useState('')
    const [searchKeywork, setSearchKeywork] = useState('')

    const [companyData, setCompanyData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [limit, setLimit] = useState(10);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        fetchProvinces();
    }, []);

    useEffect(() => {
        fetchListCompany(currentPage, limit);
    }, [currentPage, limit, selectProvince]);

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

    const fetchListCompany = async (currentPage = 1, limit = 10, name = "") => {
        const searchQuery = name ? `/${name}/i` : '';
        try {
            setLoading(true)
            const res = await API.get(endpoints['companies'], {
                params: {
                    page: currentPage,
                    limit: limit,
                    city: selectProvince,
                    name: searchQuery
                },
            });
            const data = res.data.data;
            console.log(data.result)
            setCompanyData(data.result); // Update company data
            setCurrentPage(data.meta.currentPage); // Update the current page from API response
            setTotalPages(data.meta.totalPages); // Update the total pages from API response
            setTotalItems(data.meta.totalItems); // Update the total pages from API response

        } catch (error) {
            console.log('Error fetching companies:', error);
        } finally { setLoading(false) }
    };



    const renderItem = ({ item }) => {
        return (
            <TouchableWithoutFeedback onPress={() => navigation.navigate('CompanyDetail', { _id: item._id })}>
                <View style={styles.itemContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Avatar.Image source={{ uri: item?.avatar }} size={50} style={{ backgroundColor: 'white', marginRight: 10 }} />
                        <View style={{flex:1}}>
                            <Text style={StyleShare.titleText16} numberOfLines={2}>{item?.name}</Text>
                            <Text style={{ marginTop: 5 }}>{item.field}</Text>
                        </View>
                    </View>
                    <View style={StyleShare.technologyContainer}>
                        <Chip style={StyleShare.chip}>{item.city}</Chip>

                    </View>
                </View>
            </TouchableWithoutFeedback>
        )
    };

    if (loading) { <Loading /> };
    return (
        <View style={StyleShare.container}>
            <UIHeader title={'Công ty'} />
            <View style={{ paddingHorizontal: 20, marginBottom: 5 }}>
                <View style={StyleShare.searchDetail}>
                    <Icon name="search" color={mainColor} size={24} style={{ marginRight: 10 }} />
                    <TextInput
                        style={StyleShare.searchInput}
                        placeholder="Nhập tên công ty..."
                        value={searchKeywork}
                        onChangeText={(text) => setSearchKeywork(text)}
                        onSubmitEditing={() => {
                            fetchListCompany(1, 10, searchKeywork)
                        }}
                    />
                </View>
                <View>
                    <Dropdown
                        data={provinceData}
                        onSelect={(item) => {
                            setSelectProvince(item.title)
                        }}
                        placeholder="Chọn thành phố"
                        value={selectProvince}
                    />
                </View>
            </View>
            {loading ? <>
                <Loading />
            </> : <>
                <FlatList
                    data={companyData}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={companyData._id}
                    ListEmptyComponent={
                        <View style={{ marginTop: 50, alignItems: 'center' }}>
                            <Image source={require("../../assets/images/save.png")} style={StyleShare.imageNullData} />
                            <Text style={StyleShare.titleText20}>Bạn chưa có bài tuyển dụng nào</Text>
                            <Text style={{ padding: 20, textAlign: 'center' }}>Bạn không có bất kỳ bài tuyển dụng nào, hãy đăng bài tuyển dụng để tìm kiếm ứng viên tiềm năng</Text>
                        </View>
                    }
                    contentContainerStyle={{ paddingBottom: 40 }}
                />
            </>}
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
        marginHorizontal: 20,
        flex: 1,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
    }
})