import React, { useState } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons'; // Ensure you have react-native-vector-icons installed
import { bgButton1, orange } from "../assets/theme/color";

export default function InputMain({ placeholder, onChangeText, value, isPassword }) {
    const [hidePassword, setHidePassword] = useState(isPassword);

    function handlePass() {
        setHidePassword(!hidePassword);
    }

    return (
        <View style={styles.container}>
            <TextInput
                placeholder={placeholder}
                onChangeText={onChangeText}
                secureTextEntry={isPassword ? hidePassword : false}
                value={value}
                style={styles.inputPass}
                selectionColor={'black'}
                autoCapitalize="none"
            />
            {isPassword && (
                <TouchableOpacity onPress={handlePass}>
                    <Icon
                        name={hidePassword ? 'visibility-off' : 'visibility'}
                        size={24}
                        color={hidePassword ? '#888' : orange}
                    />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal:10,
        borderRadius: 18,
        borderColor: bgButton1,
        marginTop: 10,
        justifyContent: 'space-between',
        backgroundColor: 'white',
        opacity:0.8
    },
    inputPass: {
        flex: 1,
    },
});
