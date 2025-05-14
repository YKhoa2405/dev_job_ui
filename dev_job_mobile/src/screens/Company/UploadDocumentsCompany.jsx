import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import StyleShare from "../../assets/themes/StyleShare";
import UIHeader from "../../components/UIHeader";
import { mainColor, white, grey, orange, textColor } from "../../assets/themes/Color";
import Button from "../../components/Button";
import * as DocumentPicker from 'expo-document-picker';
import { ToastMess } from "../../components/ToastMess";
import Icon from "react-native-vector-icons/Ionicons";


export default function UploadDocumentsCompany({ navigation, route }) {
    const [legalDocuments, setLegalDocuments] = useState(route.params?.initialDocuments || []);
    const [loadingUpload, setLoadingUpload] = useState(false);

    const handleChooseDocument = async () => {
        try {
            // Chọn tài liệu với DocumentPicker
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
                multiple: false,
            });

            // Kiểm tra kết quả chọn file
            if (!result.canceled && result.assets && result.assets.length > 0) {
                const document = result.assets[0];

                const newDocument = {
                    name: document.name || `Tài liệu ${legalDocuments.length + 1}`,
                    uri: document.uri,
                    mimeType: document.mimeType || 'application/octet-stream',
                };

                setLegalDocuments([...legalDocuments, newDocument]);

                const formData = new FormData();
                formData.append('name', newDocument.name);
                formData.append('url', {
                    uri: newDocument.uri,
                    name: newDocument.name,
                    type: newDocument.mimeType,
                });

            } else {
                ToastMess({ type: 'info', text1: 'Đã hủy chọn tài liệu.' });
            }
        } catch (error) {
            ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại.' });
            console.log('Error picking document:', error);
        }
    };

    const handleRemoveDocument = (index) => {
        const updatedDocuments = legalDocuments.filter((_, i) => i !== index);
        setLegalDocuments(updatedDocuments);
    };

    const handleConfirm = () => {
        navigation.navigate('CompanyCreate', { legalDocuments });
    };

    const renderDocumentItem = (item, index) => (
        <View style={styles.documentItem} key={index.toString()}>
            <Text style={styles.documentName} numberOfLines={1}>
                {item.name || `Tài liệu ${index + 1}`}
            </Text>
            <TouchableOpacity onPress={() => handleRemoveDocument(index)} disabled={loadingUpload}>
                <Icon name="trash-outline" size={20} color={loadingUpload ? grey : "red"} />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={StyleShare.container}>
            <UIHeader
                leftIcon={"arrow-back"}
                handleLeftIcon={() => navigation.goBack()}
                title={'Tải lên Hồ sơ pháp lý / Giấy phép'}
            />
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.containerMain}>
                    <Text style={styles.sectionTitle}>
                        Tải lên các tài liệu pháp lý hoặc giấy phép (PDF, Word)
                    </Text>
                    <TouchableOpacity
                        onPress={handleChooseDocument}
                        style={[styles.uploadButton, loadingUpload && styles.uploadButtonDisabled]}
                        disabled={loadingUpload}
                    >
                        <Icon
                            name="cloud-upload-outline"
                            size={24}
                            color={mainColor}
                        />
                    </TouchableOpacity>

                    {legalDocuments.length > 0 ? (
                        <>
                            <Text style={styles.subTitle}>Danh sách tài liệu đã tải lên</Text>
                            <View style={styles.documentList}>
                                {legalDocuments.map((item, index) => renderDocumentItem(item, index))}
                            </View>
                        </>
                    ) : (
                        <Text style={styles.noDocumentsText}>Chưa có tài liệu nào được tải lên.</Text>
                    )}

                    <View style={styles.buttonContainer}>
                        <Button
                            title="Xác nhận"
                            backgroundColor={mainColor}
                            textColor={white}
                            onPress={handleConfirm}
                            disabled={loadingUpload}
                        />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    containerMain: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        color: mainColor,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    subTitle: {
        fontSize: 14,
        color: mainColor,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: 50,
        backgroundColor: white,
        borderRadius: 10,
        elevation: 2,
        borderWidth: 1,
        borderColor: mainColor,
    },
    uploadButtonDisabled: {
        backgroundColor: grey,
        borderColor: grey,
        elevation: 0,
    },
    documentList: {
        marginTop: 10,
    },
    documentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: white,
        borderRadius: 8,
        marginVertical: 5,
        elevation: 1,
    },
    documentName: {
        fontSize: 14,
        flex: 1,
        marginRight: 10,
        color: textColor,
    },
    noDocumentsText: {
        fontSize: 14,
        color: textColor,
        textAlign: 'center',
        marginTop: 20,
    },
    buttonContainer: {
        marginTop: 30,
        marginBottom: 20,
    },
});