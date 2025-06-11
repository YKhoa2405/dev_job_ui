import React, { useState } from 'react';
import { View, Text, Pressable, TouchableOpacity, StyleSheet } from 'react-native';
import UIHeader from '../../components/UIHeader';
import StyleShare from '../../assets/themes/StyleShare';
import Icon from 'react-native-vector-icons/Ionicons';
import Modal from 'react-native-modal';
import DropDownPicker from 'react-native-dropdown-picker';
import { grey, mainColor, textColor, white } from '../../assets/themes/Color';
import { ToastMess } from '../../components/ToastMess';

export default function PrepareScreen({ route, navigation }) {
    const { job } = route.params;

    // State for todos
    const [todos, setTodos] = useState({
        chooseMode: false,
        prepareDevice: false,
        selectQuestions: false,
    });

    // State for mode selection
    const [mode, setMode] = useState('text');
    const [isModeModalVisible, setModeModalVisible] = useState(false);

    // State for policy modal
    const [isPolicyModalVisible, setPolicyModalVisible] = useState(true);
    const [policyAccepted, setPolicyAccepted] = useState(false);

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

    // Toggle todo checkbox
    const toggleTodo = (key) => {
        setTodos((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    // Handle policy acceptance
    const handleAcceptPolicy = () => {
        setPolicyAccepted(true);
        setPolicyModalVisible(false);
    };

    // Handle start button
    const handleStart = () => {
        if (!numQuestions || !difficulty) {
            ToastMess({ type: 'error', text1: 'Vui lòng chọn chọn số lượng câu hỏi và độ khó.' });
            return;
        };
        if (policyAccepted && Object.values(todos).every((v) => v)) {
            navigation.navigate('InterviewScreen', {
                job,
                mode,
                numQuestions,
                difficulty,
            });
        }
    };

    return (
        <View style={styles.container}>
            <UIHeader
                leftIcon={'arrow-back'}
                title={'Phỏng vấn ảo'}
                handleLeftIcon={() => navigation.navigate('JobApplied')}
            />
            <View style={StyleShare.jobItemContainer}>
                <View style={styles.jobDetails}>
                    <Text style={StyleShare.titleText16}>{job.jobId.name}</Text>
                    <Text style={styles.jobLabel}>Công ty: {job.companyId?.name || 'Không xác định'}</Text>
                    <Text style={styles.jobLabel}>
                        Cấp độ: {job?.jobId?.level.join(', ')}
                    </Text>
                    <Text style={styles.jobLabel}>Kĩ năng: {job?.jobId?.skills.join(', ')}</Text>
                </View>
            </View>

            <View style={styles.content}>
                {/* Step 1: Choose Mode */}
                <View style={StyleShare.jobItemContainer}>
                    <Pressable onPress={() => toggleTodo('chooseMode')} style={styles.checkboxContainer}>
                        <View style={[styles.checkbox, todos.chooseMode && styles.checkboxChecked]}>
                            {todos.chooseMode && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                        <Text style={styles.label}>1. Chọn hình thức trả lời</Text>
                    </Pressable>
                    {todos.chooseMode && (
                        <TouchableOpacity style={styles.selectBox} onPress={() => setModeModalVisible(true)}>
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
                        <View style={styles.dropdownContainer}>
                            <DropDownPicker
                                open={openQuestions}
                                value={numQuestions}
                                items={questionItems}
                                setOpen={setOpenQuestions}
                                setValue={setNumQuestions}
                                setItems={setQuestionItems}
                                placeholder="Chọn số lượng câu hỏi"
                                containerStyle={styles.dropdownWrapper}
                                style={styles.dropdown}
                                dropDownContainerStyle={StyleShare.dropDownContainerStyle}
                                zIndex={3000}
                                zIndexInverse={1000}
                            />
                            <DropDownPicker
                                open={openDifficulty}
                                value={difficulty}
                                items={difficultyItems}
                                setOpen={setOpenDifficulty}
                                setValue={setDifficulty}
                                setItems={setDifficultyItems}
                                placeholder="Chọn độ khó"
                                style={styles.dropdown}
                                dropDownContainerStyle={StyleShare.dropDownContainerStyle}
                                zIndex={2000}
                                zIndexInverse={2000}
                            />
                        </View>
                    )}
                </View>
            </View>

            {/* Policy Modal */}
            <Modal
                isVisible={isPolicyModalVisible}
                onBackdropPress={() => { }} // Prevent closing by tapping outside
                animationIn="slideInUp"
                animationOut="slideOutDown"
                backdropTransitionInTiming={500}
                backdropTransitionOutTiming={500}
                style={StyleShare.modalStyle}
            >
                <View style={styles.modalContent}>
                    <Text style={StyleShare.titleText20}>Chính sách phỏng vấn ảo</Text>
                    <Text style={styles.policyModalText}>
                        Phỏng vấn ảo chỉ mang tính chất luyện tập để giúp bạn cải thiện kỹ năng phỏng vấn. Kết quả của phỏng vấn ảo không đại diện cho kết quả phỏng vấn thực tế với nhà tuyển dụng. Vui lòng xác nhận để tiếp tục.
                    </Text>
                    <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptPolicy}>
                        <Text style={styles.acceptButtonText}>Đồng ý</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            {/* Mode Selection Modal */}
            <Modal
                isVisible={isModeModalVisible}
                onBackdropPress={() => setModeModalVisible(false)}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                backdropTransitionInTiming={500}
                backdropTransitionOutTiming={500}
                style={StyleShare.modalStyle}
            >
                <View style={styles.modalContent}>
                    <View style={[StyleShare.flexBetween, { marginVertical: 15 }]}>
                        <Text style={StyleShare.titleText20}>Chọn hình thức trả lời</Text>
                        <TouchableOpacity onPress={() => setModeModalVisible(false)}>
                            <Icon name="close" size={26} color={'red'} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        style={styles.option}
                        onPress={() => {
                            setMode('text');
                            setModeModalVisible(false);
                        }}
                    >
                        <Icon name="text-outline" size={20} color={textColor} />
                        <Text style={styles.optionText}>Text</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.option}
                        onPress={() => {
                            setMode('voice');
                            setModeModalVisible(false);
                        }}
                    >
                        <Icon name="mic-outline" size={20} color={textColor} />
                        <Text style={styles.optionText}>Voice</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            {/* Start Button */}
            <View style={styles.startButtonContainer}>
                <TouchableOpacity
                    style={[
                        styles.startButton,
                        (!policyAccepted || !Object.values(todos).every((v) => v)) && styles.startButtonDisabled,
                    ]}
                    onPress={handleStart}
                    disabled={!policyAccepted || !Object.values(todos).every((v) => v)}
                >
                    <Text style={styles.startButtonText}>Bắt đầu</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: white,
    },
    content: {
        flex: 1,
        marginHorizontal: 20,
        marginTop: 20,
    },
    jobDetails: {
        paddingVertical: 10,
    },
    jobLabel: {
        fontSize: 14,
        color: textColor,
        marginTop: 5,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
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
    label: {
        fontSize: 16,
        color: textColor,
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
    dropdownContainer: {
        marginTop: 12,
    },
    dropdownWrapper: {
        marginBottom: 12,
    },
    dropdown: {
        borderWidth: 1,
        borderColor: mainColor,
        borderRadius: 8,
        backgroundColor: grey,
    },
    modalContent: {
        backgroundColor: white,
        padding: 20,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    policyModalText: {
        fontSize: 16,
        color: textColor,
        marginVertical: 15,
        lineHeight: 22,
    },
    acceptButton: {
        padding: 12,
        backgroundColor: mainColor,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    acceptButtonText: {
        fontSize: 16,
        color: white,
        fontWeight: 'bold',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: grey,
    },
    optionText: {
        marginLeft: 15,
        color: textColor,
        fontSize: 16,
    },
    startButtonContainer: {
        position: 'absolute',
        bottom: 10,
        left: 0,
        right: 0,
    },
    startButton: {
        margin: 20,
        padding: 16,
        backgroundColor: mainColor,
        borderRadius: 10,
        alignItems: 'center',
    },
    startButtonDisabled: {
        backgroundColor: grey,
    },
    startButtonText: {
        fontSize: 18,
        color: white,
        fontWeight: 'bold',
    },
});