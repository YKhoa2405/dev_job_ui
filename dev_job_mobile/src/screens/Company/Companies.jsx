import { StyleSheet, View, Text, TextInput, TouchableWithoutFeedback, Image, FlatList, Alert } from "react-native";
import UIHeader from "../../components/UIHeader";
import StyleShare from "../../assets/themes/StyleShare";
import { mainColor, white } from "../../assets/themes/Color";
import Dropdown from "../../components/Dropdown";
import Icon from 'react-native-vector-icons/Ionicons';
import { Avatar, Chip } from "react-native-paper";
import { useEffect, useState } from "react";
import axios from "axios";
import API, { endpoints } from "../../assets/config/API";
import Loading from "../../components/Loading";

export default function Companies({ navigation }) {
    const [provinceData, setProvinceData] = useState([]);
    const [selectProvince, setSelectProvince] = useState('');
    const [searchKeywork, setSearchKeywork] = useState('');
    const [companyData, setCompanyData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [limit] = useState(10); // Không cần setLimit nếu cố định
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        fetchProvinces();
    }, []);

    useEffect(() => {
        fetchListCompany(currentPage, limit, searchKeywork); // Thêm currentPage và searchKeywork vào dependency
    }, [selectProvince, currentPage, searchKeywork]);

    const fetchProvinces = async () => {
        try {
            const res = await axios.get('https://esgoo.net/api-tinhthanh/1/0.htm');
            const data = res.data.data || [];
            const formattedData = data.map((item) => ({
                title: item.full_name,
            }));
            setProvinceData(formattedData);
        } catch (error) {
            console.log('Error fetching provinces:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách tỉnh/thành phố.');
        }
    };

    const fetchListCompany = async (page = 1, limit = 10, name = "") => {
        const searchQuery = name.trim() ? `/${name.trim()}/i` : '';
        try {
            if (page === 1) {
                setLoading(true);
                setCompanyData([]); // Xóa dữ liệu cũ khi tải trang 1
            } else {
                setLoadingMore(true);
            }

            const res = await API.get(endpoints['companies'], {
                params: {
                    page: page,
                    limit: limit,
                    city: selectProvince,
                    name: searchQuery,
                },
            });
            const data = res.data.data;
            console.log('API response:', data); // Log để kiểm tra dữ liệu
            setCompanyData((prev) => (page === 1 ? data.result : [...prev, ...data.result]));
            setCurrentPage(data.meta.currentPage);
            setTotalPages(data.meta.totalPages);
            setTotalItems(data.meta.totalItems);
        } catch (error) {
            console.log('Error fetching companies:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách công ty. Vui lòng thử lại.');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        if (!loadingMore && currentPage < totalPages) {
            console.log('Loading more, currentPage:', currentPage); // Log để kiểm tra
            setCurrentPage((prev) => prev + 1);
        }
    };

    const handleSearch = () => {
        setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
        // fetchListCompany được gọi tự động qua useEffect nhờ searchKeywork
    };

    const renderItem = ({ item }) => {
        return (
            <TouchableWithoutFeedback onPress={() => navigation.navigate('CompanyDetail', { _id: item._id })}>
                <View style={StyleShare.jobItemContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Avatar.Image
                            source={{ uri: item?.avatar || 'https://via.placeholder.com/50' }}
                            size={50}
                            style={{ marginRight: 10 }}
                        />
                        <View style={{ flex: 1 }}>
                            <Text style={StyleShare.titleText16} numberOfLines={2}>{item?.name}</Text>
                            <Text style={{ marginTop: 5 }}>{item?.field || 'Chưa có thông tin'}</Text>
                        </View>
                    </View>
                    <View style={StyleShare.technologyContainer}>
                        <Chip style={StyleShare.chip}>{item.city}</Chip>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    };

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <Loading />
            </View>
        );
    };

    if (loading) return <Loading />;

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
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>
                <View style={StyleShare.flexBetween}>
                    <View style={{ flex: 1 }}>
                        <Text style={StyleShare.titleText16}>{totalItems} công ty</Text>
                    </View>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        <Dropdown
                            data={provinceData}
                            onSelect={(item) => {
                                setSelectProvince(item.title);
                                setCurrentPage(1);
                            }}
                            placeholder="Chọn thành phố"
                            value={selectProvince}
                        />
                    </View>
                </View>
            </View>
            <FlatList
                data={companyData}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item._id}
                ListEmptyComponent={
                    <View style={{ marginTop: 50, alignItems: 'center' }}>
                        <Image source={require("../../assets/images/save.png")} style={StyleShare.imageNullData} />
                        <Text style={StyleShare.titleText20}>Không có công ty nào</Text>
                        <Text style={{ padding: 20, textAlign: 'center' }}>
                            Không tìm thấy công ty nào, hãy thử thay đổi tiêu chí lọc.
                        </Text>
                    </View>
                }
                contentContainerStyle={{ paddingBottom: 40 }}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.1} // Giảm để gọi sớm hơn
                ListFooterComponent={renderFooter}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    // Style của bạn không thay đổi, chỉ cần đảm bảo StyleShare.jobItemContainer hợp lệ
});