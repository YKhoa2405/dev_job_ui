import React, { useState } from 'react';
import { View, Text, Pressable, TouchableOpacity, StyleSheet } from 'react-native';
import UIHeader from '../../components/UIHeader';
import StyleShare from '../../assets/themes/StyleShare';
import Icon from 'react-native-vector-icons/Ionicons';
import Modal from 'react-native-modal';
import DropDownPicker from 'react-native-dropdown-picker';
import { grey, mainColor, textColor, white } from '../../assets/themes/Color';

export default function PrepareScreen({ route, navigation }) {
    const { job } = route.params;

    const [todos, setTodos] = useState({
        chooseMode: false,
        prepareDevice: false,
        selectQuestions: false, // New todo for selecting questions and difficulty
    });

    const [mode, setMode] = useState('text');
    const [isModalVisible, setModalVisible] = useState(false);

    // State for dropdowns
    const [openQuestions, setOpenQuestions] = useState(false);
    const [numQuestions, setNumQuestions] = useState(null);
    const [questionItems, setQuestionItems] = useState([
        { label: '3 câu hỏi', value: 3 },
        { label: '5 câu hỏi', value: 5 },
        { label: '10 câu hỏi', value: 10 },
    ]);

    const [openDifficulty, setOpenDifficulty] = useState(false);
    const [difficulty, setDifficulty] = useState(null);
    const [difficultyItems, setDifficultyItems] = useState([
        { label: 'Dễ', value: 'easy' },
        { label: 'Trung bình', value: 'medium' },
        { label: 'Khó', value: 'hard' },
    ]);

    const toggleTodo = (key) => {
        setTodos((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleStart = () => {
        if (Object.values(todos).every((v) => v)) {
            navigation.navigate('InterviewScreen', {
                job,
                mode,
                numQuestions,
                difficulty,
            });
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <UIHeader
                leftIcon={'arrow-back'}
                title={'Phỏng vấn ảo'}
                handleLeftIcon={() => navigation.navigate('JobApplied')}
            />
            <View style={StyleShare.jobItemContainer}>
                <View style={styles.jobDetails}>
                    <Text style={StyleShare.titleText16}>{job.jobId.name}</Text>
                    <Text style={styles.jobLabel}>Công ty: {job.companyId?.name || 'Không xác định'}</Text>
                    <Text style={styles.jobLabel}>Cấp độ: {job.jobId.level}</Text>
                    <Text style={styles.jobLabel}>Mức lương: {job.jobId.salary}</Text>
                </View>
            </View>
            <View style={{ marginTop: 20 }}>
                {/* Step 1: Choose Mode */}
                <View style={StyleShare.jobItemContainer}>
                    <Pressable onPress={() => toggleTodo('chooseMode')} style={styles.checkboxContainer}>
                        <View style={[styles.checkbox, todos.chooseMode && styles.checkboxChecked]}>
                            {todos.chooseMode && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                        <Text style={styles.label}>1. Chọn hình thức trả lời</Text>
                    </Pressable>
                    {todos.chooseMode && (
                        <TouchableOpacity style={styles.selectBox} onPress={() => setModalVisible(true)}>
                            <Text style={styles.selectText}>{mode === 'text' ? 'Text' : 'Voice'}</Text>
                        </TouchableOpacity>
                    )}
                </View>
                {/* Step 2: Prepare Device */}
                <View style={StyleShare.jobItemContainer}>
                    <Pressable onPress={() => toggleTodo('prepareDevice')} style={styles.checkboxContainer}>
                        <View style={[styles.checkbox, todos.prepareDevice && styles.checkboxChecked]}>
                            {todos.prepareDevice && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                        <Text style={styles.label}>2. Chuẩn bị thiết bị (nếu dùng Voice)</Text>
                    </Pressable>
                </View>

                {/* Step 3: Select Number of Questions and Difficulty */}
                <View style={StyleShare.jobItemContainer}>
                    <Pressable onPress={() => toggleTodo('selectQuestions')} style={styles.checkboxContainer}>
                        <View style={[styles.checkbox, todos.selectQuestions && styles.checkboxChecked]}>
                            {todos.selectQuestions && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                        <Text style={styles.label}>3. Chọn số lượng câu hỏi và độ khó</Text>
                    </Pressable>
                    {todos.selectQuestions && (
                        <View style={{ marginTop: 12 }}>
                            {/* Number of Questions Dropdown */}
                            <DropDownPicker
                                open={openQuestions}
                                value={numQuestions}
                                items={questionItems}
                                setOpen={setOpenQuestions}
                                setValue={setNumQuestions}
                                setItems={setQuestionItems}
                                placeholder="Chọn số lượng câu hỏi"
                                containerStyle={{ marginBottom: 12 }}
                                style={styles.dropdown}
                                dropDownContainerStyle={StyleShare.dropDownContainerStyle}
                                zIndex={3000}
                                zIndexInverse={1000}
                            />
                            {/* Difficulty Dropdown */}
                            <DropDownPicker
                                open={openDifficulty}
                                value={difficulty}
                                items={difficultyItems}
                                setOpen={setOpenDifficulty}
                                setValue={setDifficulty}
                                setItems={setDifficultyItems}
                                placeholder="Chọn độ khó"
                                style={styles.dropdown}
                                dropDownContainerStyle={styles.dropdownContainer}
                                zIndex={2000}
                                zIndexInverse={2000}
                            />
                        </View>
                    )}
                </View>

                {/* Mode Selection Modal */}
                <Modal
                    isVisible={isModalVisible}
                    onBackdropPress={() => setModalVisible(false)}
                    animationIn="slideInUp"
                    animationOut="slideOutDown"
                    backdropTransitionInTiming={500}
                    backdropTransitionOutTiming={500}
                    style={StyleShare.modalStyle}
                >
                    <View style={styles.modalContent}>
                        <View style={[StyleShare.flexBetween, { marginVertical: 15 }]}>
                            <Text style={StyleShare.titleText20}>Chọn hình thức trả lời</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Icon name="close" size={26} color={'red'} />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            style={[styles.option]}
                            onPress={() => {
                                setMode('text');
                                setModalVisible(false);
                            }}
                        >
                            <Icon name="text-outline" size={20} color={textColor} />
                            <Text style={{ marginLeft: 15, color: textColor, fontSize: 16 }}>Text</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.option]}
                            onPress={() => {
                                setMode('voice');
                                setModalVisible(false);
                            }}
                        >
                            <Icon name="mic-outline" size={20} color={textColor} />
                            <Text style={{ marginLeft: 15, color: textColor, fontSize: 16 }}>Voice</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
            </View>
            <View style={{position: 'absolute', bottom: 10, left:0, right: 0}}>
                <TouchableOpacity
                    style={[
                        styles.startButton,
                        !Object.values(todos).every((v) => v) && styles.startButtonDisabled,
                    ]}
                    onPress={handleStart}
                    disabled={!Object.values(todos).every((v) => v)}
                >
                    <Text style={styles.startButtonText}>Bắt đầu</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        marginHorizontal: 20,
        marginTop: 20,
    },
    jobLabel: {
        fontSize: 14,
        color: textColor,
        marginTop: 5,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: mainColor,
        borderRadius: 6,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#28a745',
        borderColor: '#28a745',
    },
    checkmark: {
        color: white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    selectBox: {
        marginTop: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: mainColor,
        borderRadius: 8,
        backgroundColor: grey,
    },
    selectText: {
        fontSize: 16,
        color: textColor,
        textAlign: 'center',
    },
    startButton: {
        margin: 20,
        padding: 16,
        backgroundColor: mainColor,
        borderRadius: 10,
        alignItems: 'center',
    },
    startButtonDisabled: {
        backgroundColor: 'grey',
    },
    startButtonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: grey,
    },
    modalContent: {
        backgroundColor: white,
        padding: 20,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    dropdown: {
        borderWidth: 1,
        borderColor: mainColor,
        borderRadius: 8,
        backgroundColor: grey,
    },
    dropdownContainer: {
        borderWidth: 1,
        borderColor: mainColor,
        borderRadius: 8,
    },
});