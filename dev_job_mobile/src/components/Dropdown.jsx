import React from 'react';
import { View, Text } from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';
import Icon from 'react-native-vector-icons/Ionicons'; // Đảm bảo đã cài react-native-vector-icons
import StyleShare from '../assets/themes/StyleShare';

const Dropdown = ({
    data = [],                // Dữ liệu dropdown (mảng các object {title, id})
    placeholder = 'Select an option', // Placeholder mặc định
    onSelect,                // Callback khi chọn một mục
    buttonStyle,             // Style tùy chỉnh cho nút
    defaultValue = '',       // Giá trị mặc định (chuỗi title hoặc id)
}) => {
    return (
        <SelectDropdown
            data={data}
            onSelect={(selectedItem, index) => onSelect(selectedItem, index)} // Truyền cả item và index
            defaultValue={data.find(item => item.title === defaultValue) || null} // Tìm item khớp với defaultValue
            renderButton={(selectedItem, isOpened) => {
                return (
                    <View style={[styles.dropdownButtonStyle, buttonStyle]}>
                        <Text style={styles.dropdownButtonTxtStyle}>
                            {(selectedItem && selectedItem.title) || placeholder}
                        </Text>
                        <Icon
                            name={isOpened ? 'chevron-up' : 'chevron-down'}
                            style={ styles.dropdownButtonArrowStyle}
                        />
                    </View>
                );
            }}
            renderItem={(item, index, isSelected) => {
                return (
                    <View
                        style={{
                            ...styles.dropdownItemStyle,
                            ...(isSelected && { backgroundColor: '#D2D9DF' }),
                        }}
                    >
                        <Text style={styles.dropdownItemTxtStyle}>{item.title}</Text>
                    </View>
                );
            }}
            showsVerticalScrollIndicator={false}
            dropdownStyle={styles.dropdownMenuStyle}
        />
    );
};

export default Dropdown;

const styles = StyleSheet.create({
    dropdownButtonStyle: {
        width: 175,
        height: 35,
        backgroundColor: white,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'grey',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    dropdownButtonTxtStyle: {
        flex: 1,
        fontWeight: '500',
    },
    dropdownButtonArrowStyle: {
        fontSize: 20,
    },
    dropdownMenuStyle: {
        borderRadius: 8,
    },
    dropdownItemStyle: {
        width: '100%',
        flexDirection: 'row',
        paddingHorizontal: 12,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
    },
    dropdownItemTxtStyle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
});