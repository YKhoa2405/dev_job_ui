import React from 'react';
import { View, Text } from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';
import Icon from 'react-native-vector-icons/Ionicons'; // Đảm bảo bạn sử dụng đúng thư viện Icon
import StyleShare from '../assets/themes/StyleShare';

const Dropdown = ({
    data,
    placeholder = 'Select your mood',
    onSelect,
    buttonStyle, // Add buttonStyle prop
}) => {
    return (
        <SelectDropdown
            data={data}
            onSelect={onSelect}
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
;
