import React from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { bgButton1, orange } from '../assets/theme/color';

const ReusableModal = ({
    visible,
    onClose,
    title,
    data,
    selectedItems,
    onItemPress,
    onComplete,
    singleSelect // Thêm props để kiểm soát kiểu chọn
}) => {

    const renderItem = ({ item }) => {
        const isSelected = selectedItems.includes(item);
        return (
            <TouchableOpacity onPress={() => onItemPress(item)}>
                <Text style={[styles.modalItem, isSelected && styles.selectedItem]}>
                    {item} {isSelected ? "✓" : ""}
                </Text>
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
                        keyExtractor={(item) => item.toString()}
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
    modalItem: {
        fontSize: 16,
        paddingVertical: 10,
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

export default ReusableModal;
