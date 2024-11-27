import React from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { bgButton1, orange } from '../assets/theme/color';

const ReusableModalId = ({
    visible,
    onClose,
    title,
    data, // Dữ liệu là mảng đối tượng chứa id và name
    selectedItems,
    onItemPress,
    onComplete,
    singleSelect // Thêm props để kiểm soát kiểu chọn
}) => {
    const renderItem = ({ item }) => {
        const isSelected = selectedItems.includes(item.id); // Kiểm tra id
        return (
            <TouchableOpacity onPress={() => onItemPress(item.id)}>
                <View style={styles.modalItemContainer}>
                    {/* Hiển thị id và name */}
                    <Text style={styles.modalItemText}>{item.id}. {item.name}</Text>
                    {/* Hiển thị dấu chọn nếu đã được chọn */}
                    {isSelected && <Text style={styles.selectedItem}> ✓</Text>}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>{title}</Text>
                    <FlatList
                        data={data}
                        keyExtractor={(item) => item.id.toString()} // Sử dụng id làm key
                        renderItem={renderItem}
                    />
                    <TouchableOpacity
                        style={styles.doneButton}
                        onPress={onComplete}
                    >
                        <Text style={styles.doneButtonText}>Hoàn tất</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '70%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalItemContainer: {
        flexDirection: 'row', // Hiển thị id và name theo chiều ngang
        justifyContent: 'space-between', // Cách đều giữa name và dấu chọn ✓
        paddingVertical: 10,
    },
    modalItemText: {
        fontSize: 16,
    },
    selectedItem: {
        fontWeight: 'bold',
        color: orange,

    },
    doneButton: {
        marginTop: 10,
        backgroundColor: bgButton1,
        padding: 10,
        borderRadius: 5,
    },
    doneButtonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});


export default ReusableModalId;
