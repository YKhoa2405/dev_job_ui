import React, { useContext, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TouchableWithoutFeedback, TextInput } from "react-native";
import styleShare from "../../assets/theme/style";
import Icon from "react-native-vector-icons/Ionicons"
import { bgButton1, bgButton2, grey, white } from "../../assets/theme/color";
import { Searchbar } from "react-native-paper";
import MyContext from "../../config/MyContext";
import { addDoc, collection, deleteDoc, getDocs, query, where } from "firebase/firestore";
import { storeDb } from "../../config/Firebase";
import { ToastMess } from "../../components/ToastMess";

export default function JobSearch({ navigation }) {
    const [user, dispatch] = useContext(MyContext)
    const [searchQuery, setSearchQuery] = useState('');
    const [recentJobs, setRecentJobs] = useState([]);
    useEffect(() => {
        getSearchRecent();
    }, [user.id]);
    const saveSearchRecent = async (keyword) => {
        const userId = user.id;

        await addDoc(collection(storeDb, 'search_recents'), {
            userId,
            keyword,
        });
    };
    const getSearchRecent = async () => {
        const q = query(collection(storeDb, 'search_recents'), where('userId', '==', user.id));
        const querySnapshot = await getDocs(q);
        const jobs = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
        setRecentJobs(jobs.reverse());
        console.log(jobs)
    };
    const deleteAllRecentSearches = async () => {
        const q = query(collection(storeDb, 'search_recents'), where('userId', '==', user.id));
        const querySnapshot = await getDocs(q);

        const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

        setRecentJobs([]);
        ToastMess({ type: 'success', text1: 'Xóa lịch sử tìm kiếm thành công.' });

    };

    const handleSearch = async () => {
        if (searchQuery.trim()) {
            navigation.navigate('JobSearchDetail', { searchContent: searchQuery });
            await saveSearchRecent(searchQuery);

        }
    };

    // const filteredJobs = recentJobs.filter(job =>
    //     job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    //     job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    //     job.company.toLowerCase().includes(searchQuery.toLowerCase())
    // );
    return (
        <View style={[styleShare.container, { marginHorizontal: 20 }]}>
            <View style={[styleShare.flexBetween, { marginTop: 30, marginBottom: 10 }]}>
                <Icon name="arrow-back" size={26} color={bgButton1} onPress={() => navigation.goBack()} />
                {/* <Searchbar style={styleShare.searchComponent}
                    placeholder="Địa điểm - Công ty - Ngành nghề"
                    value={searchQuery}
                    onChangeText={query => setSearchQuery(query)}
                    onSubmitEditing={handleSearch} /> */}

                <TextInput
                    style={styleShare.searchHome}
                    onSubmitEditing={handleSearch}
                    value={searchQuery}
                    onChangeText={query => setSearchQuery(query)}
                    placeholder="Nhập từ khóa để tìm kiếm ..." />
            </View>

            {searchQuery === '' ? (
                <>
                    <View style={styleShare.flexBetween}>
                        <Text style={styleShare.titleJobAndName}>Tìm kiếm gần đây</Text>
                        <TouchableOpacity onPress={() => deleteAllRecentSearches()}>
                            <Text style={{ fontWeight: '500', color: 'red' }}>Xóa tất cả</Text>
                        </TouchableOpacity>
                    </View>
                    <View>
                        <FlatList
                            data={recentJobs}
                            keyExtractor={item => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableWithoutFeedback key={item.id} onPress={() => navigation.navigate('JobSearchDetail', { searchContent: item.keyword })}>
                                    <View style={styles.recentSearchItem}>
                                        <Icon name="search-outline" size={22} color={bgButton1} />
                                        <Text style={styles.jobTitle}>{item.keyword}</Text>
                                    </View>
                                </TouchableWithoutFeedback>
                            )}
                        />
                    </View>
                </>
            ) : (
                <View>
                    <Text style={[styleShare.titleJobAndName, { marginBottom: 10 }]}>Gợi ý tìm kiếm</Text>
                    {/* <FlatList
                        data={filteredJobs}
                        keyExtractor={item => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableWithoutFeedback key={item.id} onPress={() => navigation.navigate('JobSearchDetail', { searchContent: item.title })}>
                                <View style={{ paddingTop: 15 }}>
                                    <Text style={{ paddingBottom: 15 }}>{item.title}</Text>
                                    <View style={styleShare.line}></View>
                                </View>
                            </TouchableWithoutFeedback>

                        )}
                    /> */}
                </View>
            )}

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
    },

})