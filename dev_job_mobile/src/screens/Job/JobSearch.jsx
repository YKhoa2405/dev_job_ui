import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    TextInput,
    Keyboard,
    Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { mainColor, white, grey } from "../../assets/themes/Color";
import StyleShare from "../../assets/themes/StyleShare";
import API, { authApi, endpoints } from "../../assets/config/API";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ToastMess } from "../../components/ToastMess";

export default function JobSearch({ navigation }) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showHistory, setShowHistory] = useState(true);

    useEffect(() => {
        fetchPopularSuggestions();
        fetchSearchHistory();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.length > 0) {
                fetchSuggestions();
                setShowSuggestions(true);
                setShowHistory(false);
            } else {
                fetchPopularSuggestions();
                setShowSuggestions(true);
                setShowHistory(true);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const fetchPopularSuggestions = async () => {
        try {
            setLoading(true);
            const response = await API.get(endpoints["popularSuggestions"]);
            setSuggestions(response.data.data.map((keyword) => ({ text: keyword })));
        } catch (error) {
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchSuggestions = async () => {
        if (query.trim() === "") return;

        try {
            setLoading(true);
            const response = await API.get(endpoints["suggestions"], {
                params: { query },
            });
            setSuggestions(response.data.data.map((suggestion) => ({ text: suggestion })));
        } catch (error) {
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchSearchHistory = async () => {
        try {
            const token = await AsyncStorage.getItem("access_token");
            if (!token) {
                setHistory([]);
                return;
            }
            const response = await authApi(token).get(endpoints["searchHistory"], {
                params: { limit: 10 },
            });
            setHistory(response.data.data); // Cập nhật để lấy đúng data từ response
        } catch (error) {
            setHistory([]);
        }
    };

    // Lưu lịch sử tìm kiếm
    const saveSearchHistory = async (searchQuery) => {
        const token = await AsyncStorage.getItem("access_token");
        if (!token) {
            ToastMess({ type: "error", text1: "Vui lòng đăng nhập để lưu lịch sử tìm kiếm." });
            return;
        }
        await authApi(token).post(endpoints["searchHistory"], {
            query: searchQuery,
        });
    };

    // Xóa toàn bộ lịch sử tìm kiếm
    const handleDeleteAllHistory = async () => {
        try {
            const token = await AsyncStorage.getItem("access_token");
            if (!token) {
                ToastMess({ type: "error", text1: "Vui lòng đăng nhập để xóa lịch sử." });
                return;
            }
            await authApi(token).delete(endpoints["deleteSearchHistory"]);
            setHistory([]);
        } catch (error) {
            ToastMess({ type: "error", text1: "Có lỗi xảy ra, vui lòng thử lại." });
        }
    };

    const handleSuggestionSelect = (suggestion) => {
        setQuery(suggestion);
        setShowSuggestions(false);
        setShowHistory(false);
        Keyboard.dismiss();
        saveSearchHistory(suggestion); // Lưu lịch sử khi chọn gợi ý
        navigation.navigate("JobSearchResult", { searchKeywork: suggestion });
    };

    const handleSearchSubmit = () => {
        if (query.trim() === "") return;
        setShowSuggestions(false);
        setShowHistory(false);
        Keyboard.dismiss();
        saveSearchHistory(query); // Lưu lịch sử khi nhấn Enter
        navigation.navigate("JobSearchResult", { searchKeywork: query });
    };

    const renderSuggestionItem = ({ item }) => (
        <TouchableOpacity
            style={styles.suggestionItem}
            onPress={() => handleSuggestionSelect(item.text)}
        >
            <Text style={styles.suggestionText}>{item.text}</Text>
        </TouchableOpacity>
    );

    const renderHistoryItem = ({ item }) => (
        <TouchableOpacity
            style={styles.suggestionItem}
            onPress={() => handleSuggestionSelect(item.query)}
        >
            <Icon name="time-outline" size={20} color={mainColor} style={{ marginRight: 10 }} />
            <Text style={styles.suggestionText}>{item.query}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={[StyleShare.flexBetween, { marginTop: 30, marginBottom: 10 }]}>
                <TouchableOpacity
                    onPress={() => navigation.navigate("MainTab", { screen: "HomeClient" })}
                >
                    <Icon name="arrow-back" size={26} color={mainColor} />
                </TouchableOpacity>

                <TextInput
                    style={styles.searchHome}
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Nhập từ khóa để tìm kiếm ..."
                    onFocus={() => {
                        setShowSuggestions(true);
                        setShowHistory(true);
                    }}
                    onSubmitEditing={handleSearchSubmit}
                    autoFocus={true}
                />
            </View>

            {showHistory && history.length > 0 && !query && (
                <View style={styles.suggestionsFullContainer}>
                    <View style={[ { paddingVertical: 15, flexDirection: "row", justifyContent: "space-between" }]}>
                        <Text style={StyleShare.titleText20}>Lịch sử tìm kiếm</Text>
                        <TouchableOpacity onPress={handleDeleteAllHistory}>
                            <Text style={{ color: 'red', fontSize: 16, fontWeight: 'bold' }}>Xóa tất cả</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={history}
                        keyExtractor={(item) => item._id}
                        renderItem={renderHistoryItem}
                        contentContainerStyle={styles.suggestionsList}
                        keyboardShouldPersistTaps="handled"
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>Không có lịch sử tìm kiếm</Text>
                            </View>
                        }
                    />
                </View>
            )}

            {showSuggestions && suggestions.length > 0 && (
                <View style={styles.suggestionsFullContainer}>
                    <Text style={[StyleShare.titleText20, { paddingVertical: 15 }]}>
                        {query ? "Gợi ý" : "Từ khóa phổ biến"}
                    </Text>
                    <FlatList
                        data={suggestions}
                        keyExtractor={(item, index) => item.text || index.toString()}
                        renderItem={renderSuggestionItem}
                        contentContainerStyle={styles.suggestionsList}
                        keyboardShouldPersistTaps="handled"
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>Không có gợi ý</Text>
                            </View>
                        }
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: white,
    },
    suggestionsFullContainer: {
        // Remove flex: 1 to allow dynamic height
        // Add optional maxHeight to limit height for large lists
        maxHeight: Dimensions.get('window').height * 0.5, // Adjust this value as needed
    },
    suggestionsList: {
        paddingBottom: 20,
    },
    suggestionItem: {
        flexDirection: "row",
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: grey,
    },
    suggestionText: {
        fontSize: 16,
        flex: 1,
    },
    searchHome: {
        flex: 1,
        padding: 12,
        borderRadius: 10,
        backgroundColor: white,
        width: "85%",
        marginLeft: 10,
        borderWidth: 1,
        borderColor: mainColor,
    },
    emptyContainer: {
        padding: 20,
        alignItems: "center",
    },
    emptyText: {
        fontSize: 16,
        color: grey,
    },
});