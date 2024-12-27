import { View, Text, TouchableOpacity, TextInput, StyleSheet, Image, FlatList, TouchableWithoutFeedback, ScrollView, ActivityIndicator, ImageBackground } from "react-native";
import StyleShare from "../../assets/themes/StyleShare";
import { bgButton2, mainColor, white, orange } from "../../assets/themes/Color";
import { Avatar } from "react-native-paper";
import Icon from 'react-native-vector-icons/Ionicons'
import { useSelector } from "react-redux";

export default function HomeClient({ navigation }) {
    const currentUser = useSelector((state) => state.user.user)

    return (
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
            <ImageBackground
                source={require("../../assets/images/background.png")}
                style={styles.background}
            >
                <View style={{ flex: 1, marginHorizontal: 20 }}>
                    {/* Phần chào và avatar */}
                    <View style={[StyleShare.flexBetween, { marginTop: 40 }]}>
                        <View>
                            <Text style={[StyleShare.titleText16, { color: white }]}>Xin chào, </Text>
                            
                        </View>
                        <View style={StyleShare.flexCenter}>
                            <TouchableOpacity onPress={() => navigation.navigate('Chat', { currentUserId: currentUser._id })}>
                                <Icon name="chatbubble-outline" color={white} size={24} style={{ marginRight: 10 }} />
                            </TouchableOpacity>
                            <Avatar.Image size={40}  style={{ backgroundColor: 'white' }} />
                        </View>
                    </View>

                    {/* Nút tìm kiếm và bản đồ */}
                    <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <TouchableOpacity onPress={() => navigation.navigate('JobSearchResult')} style={StyleShare.searchHome}>
                            <Icon name="search" color={mainColor} size={24} style={{ marginRight: 10 }} />
                            <Text>Tìm kiếm việc làm</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.searchMap} onPress={() => navigation.navigate('JobNearBy')}>
                            <Icon name="map" size={20} color={white} />
                        </TouchableOpacity>
                    </View>
                </View>
            </ImageBackground>

            {/* Danh sách các gợi ý và việc làm hấp dẫn */}
            <View style={{ padding: 20 }}>
                <View>
                    <View style={StyleShare.flexBetween}>
                        <Text style={StyleShare.titleText20}>Gợi ý việc làm</Text>
                        <TouchableOpacity style={StyleShare.titleText16} onPress={() => navigation.navigate("JobSuggestions", { title: "Gợi ý việc làm", api: "job_recommned" })}>
                            <Text style={StyleShare.lineText}>Xem tất cả</Text>
                        </TouchableOpacity>
                    </View>

                </View>
                <View style={{ marginTop: 40 }}>
                    <View style={StyleShare.flexBetween}>
                        <Text style={StyleShare.titleText20}>Việc làm hấp dẫn</Text>
                        <TouchableOpacity style={StyleShare.titleText16} onPress={() => navigation.navigate("JobSuggestions", { title: "Việc làm hấp dẫn", api: "job_salary" })}>
                            <Text style={StyleShare.lineText}>Xem tất cả</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

        </ScrollView>
    )
}

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
        backgroundColor: 'white', // Màu nền mặc định bên ngoài
    },

    background: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
        height: 190
    },
    searchMap: {
        padding: 12,
        borderRadius: 10,
        backgroundColor: orange,
        elevation: 2
    },
});
