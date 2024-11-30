import { View, Text, TouchableOpacity, TextInput, StyleSheet, Image, FlatList, TouchableWithoutFeedback, ScrollView, ActivityIndicator } from "react-native";
import StyleShare from "../../assets/themes/StyleShare";
import { bgButton2, mainColor, white, orange } from "../../assets/themes/Color";
import { Avatar } from "react-native-paper";
import Icon from 'react-native-vector-icons/Ionicons'
import { useSelector } from 'react-redux';


export default function HomeClient({navigation}) {
    
    return(
        <View style={StyleShare.container}>
            <View style={[StyleShare.flexBetween, { marginHorizontal: 20, marginTop: 30 }]}>
                <View>
                    <Text style={StyleShare.titleText16}>Xin chào,</Text>
                </View>
                <Avatar.Image  size={36} style={{ backgroundColor: 'white' }} />
            </View>
            <View style={{ marginHorizontal: 20, marginVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <TouchableOpacity onPress={() => navigation.navigate('JobSearchResult')} style={StyleShare.searchHome}>
                    <Icon name="search" color={mainColor} size={24} style={{ marginRight: 10 }} />
                    <Text>Tìm kiếm việc làm</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.searchMap} onPress={() => navigation.navigate('JobNearBy')}>
                    <Icon name="map" size={20} color={orange} />
                </TouchableOpacity>
            </View>
            <ScrollView style={styles.headerMain} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
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
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({

    headerMain: {
        padding: 20,
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
    infoJobContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10
    },

    searchMap: {
        padding: 12,
        borderRadius: 10,
        backgroundColor: 'white',
        elevation: 2
    }

})