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
                    <View style={[StyleShare.dropdownButtonStyle, buttonStyle]}>
                        <Text style={StyleShare.dropdownButtonTxtStyle}>
                            {(selectedItem && selectedItem.title) || placeholder}
                        </Text>
                        <Icon
                            name={isOpened ? 'chevron-up' : 'chevron-down'}
                            style={StyleShare.dropdownButtonArrowStyle}
                        />
                    </View>
                );
            }}
            renderItem={(item, index, isSelected) => {
                return (
                    <View
                        style={{
                            ...StyleShare.dropdownItemStyle,
                            ...(isSelected && { backgroundColor: '#D2D9DF' }),
                        }}
                    >
                        <Text style={StyleShare.dropdownItemTxtStyle}>{item.title}</Text>
                    </View>
                );
            }}
            showsVerticalScrollIndicator={false}
            dropdownStyle={StyleShare.dropdownMenuStyle}
        />
    );
};

export default Dropdown;