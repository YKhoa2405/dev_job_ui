import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    TextInput,
    Keyboard,
    Dimensions
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { mainColor, white, grey } from "../../assets/themes/Color";
import StyleShare from "../../assets/themes/StyleShare";
import API, { endpoints } from "../../assets/config/API";

export default function JobSearch({ navigation }) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        fetchPopularSuggestions();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.length > 0) {
                fetchSuggestions();
                setShowSuggestions(true);
            } else {
                fetchPopularSuggestions();
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const fetchPopularSuggestions = async () => {
        try {
            setLoading(true);
            const response = await API.get(endpoints['popularSuggestions']);
            setSuggestions(
                response.data.data.map((keyword) => ({ text: keyword }))
            );
            setShowSuggestions(true);
        } catch (error) {
            console.log('Error fetching popular suggestions:', error);
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchSuggestions = async () => {
        if (query.trim() === '') return;

        try {
            setLoading(true);
            const response = await API.get(endpoints['suggestions'], {
                params: { query }
            });
            setSuggestions(
                response.data.data.map((suggestion) => ({ text: suggestion }))
            );
        } catch (error) {
            console.log('Error fetching suggestions:', error);
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSuggestionSelect = (suggestion) => {
        setQuery(suggestion);
        setShowSuggestions(false);
        Keyboard.dismiss();

        navigation.navigate('JobSearchResult', { searchKeywork: suggestion });
    };

    const renderSuggestionItem = ({ item }) => (
        <TouchableOpacity
            style={styles.suggestionItem}
            onPress={() => handleSuggestionSelect(item.text)}
        >
            <Text style={styles.suggestionText}>{item.text}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={[StyleShare.flexBetween, { marginTop: 30, marginBottom: 10 }]}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('MainTab')}
                >
                    <Icon
                        name="arrow-back"
                        size={26}
                        color={mainColor}
                    />
                </TouchableOpacity>

                <TextInput
                    style={styles.searchHome}
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Nhập từ khóa để tìm kiếm ..."
                    onFocus={() => setShowSuggestions(true)}
                    onSubmitEditing={() => {
                        setShowSuggestions(false);
                        navigation.navigate('JobSearchResult', { searchKeywork: query });
                    }}
                    autoFocus={true}
                />
            </View>

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
        flex: 1,
    },

    suggestionsList: {
        paddingBottom: 20,
    },
    suggestionItem: {
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
        backgroundColor: grey,
        width: '85%',
        marginLeft: 10
    },
});