import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import UIHeader from '../../components/UIHeader';
import Icon from 'react-native-vector-icons/Ionicons';
import { grey, mainColor, orange, textColor, white } from '../../assets/themes/Color';
import { geminiService } from '../../assets/config/GeminiService';
import StyleShare from '../../assets/themes/StyleShare';
import Voice from '@react-native-voice/voice';
import { ToastMess } from '../../components/ToastMess';

export default function InterviewScreen({ route, navigation }) {
    const { job, mode } = route.params; // job là application từ PrepareScreen
    const jobDetails = job.jobId;
    console.log(jobDetails);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [loading, setLoading] = useState(true);
    const [isListening, setIsListening] = useState(false);

    useEffect(() => {
        const generateQuestions = async () => {
            setLoading(true);
            try {
                const prompt = `
                    Tạo 3 câu hỏi phỏng vấn IT cho công việc:
                    - Tên: "${jobDetails.name}"
                    - Cấp độ: "${jobDetails.level}"
                    - Kỹ năng: "${jobDetails.skills?.join(', ') || 'Không xác định'}"
                    - Yêu cầu kỹ năng: "${jobDetails.requirements?.join(', ') || 'Không xác định'}"
                    Trả về JSON: ["câu hỏi 1", "câu hỏi 2", "câu hỏi 3"]
                `;
                const result = await geminiService(prompt);

                if (result && result !== "Không có phản hồi từ AI.") {
                    const cleanResult = result.replace(/```json|```/g, "").trim();
                    const parsedQuestions = JSON.parse(cleanResult);
                    if (Array.isArray(parsedQuestions)) {
                        setQuestions(parsedQuestions);
                    }
                }
            } catch (error) {
                console.log("Lỗi khi lấy câu hỏi:", error);
                ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại.' });
                setQuestions(["Câu hỏi mẫu 1", "Câu hỏi mẫu 2", "Câu hỏi mẫu 3"]);
            }
            setLoading(false);
        };
        generateQuestions();
    }, []);

    useEffect(() => {
        Voice.onSpeechStart = () => setIsListening(true);
        Voice.onSpeechEnd = () => setIsListening(false);
        Voice.onSpeechResults = (event) => {
            if (event.value && event.value.length > 0) {
                setCurrentAnswer(event.value[0]); // Lấy câu trả lời đầu tiên
            }
        };
        Voice.onSpeechError = (error) => {
            console.error("Lỗi Voice:", error);
            setIsListening(false);
            Alert.alert("Lỗi", "Không thể nhận diện giọng nói. Vui lòng thử lại.");
        };

        return () => {
            Voice.destroy().then(Voice.removeAllListeners);
        };
    }, []);

    const handleVoice = async () => {
        try {
            if (isListening) {
                await Voice.stop();
            } else {
                await Voice.start('vi-VN'); // Nhận diện tiếng Việt
            }
        } catch (error) {
            console.error('Lỗi nhận diện giọng nói:', error);
            Alert.alert("Lỗi", "Không thể kích hoạt nhận diện giọng nói.");
        }
    };

    const nextQuestion = () => {
        setAnswers([...answers, currentAnswer]);
        setCurrentAnswer('');
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            evaluateAllAnswers();
        }
    };

    const evaluateAllAnswers = async () => {
        setLoading(true);
        try {
            const prompt = `
                Bạn là chuyên gia phỏng vấn IT. Công việc: "${jobDetails.name}", Cấp độ: "${jobDetails.level}", Kỹ năng: "${jobDetails.skills?.join(', ') || 'Không xác định'}".
                Đánh giá các câu trả lời sau:
                ${questions.map((q, i) => `Câu hỏi ${i + 1}: "${q}"\nCâu trả lời: "${answers[i] || currentAnswer}"`).join('\n')}
                Hãy:
                1. Chấm điểm từng câu từ 0-10.
                2. Đưa ra feedback cụ thể.
                3. Tính điểm trung bình tổng.
                Trả về JSON: { "totalScore": number, "details": [{ "score": number, "feedback": string }, ...] }
            `;
            const result = await geminiService(prompt);

            if (result && result !== "Không có phản hồi từ AI.") {
                const cleanResult = result.replace(/```json|```/g, "").trim();
                const evaluation = JSON.parse(cleanResult);
                if (evaluation && typeof evaluation.totalScore === "number" && Array.isArray(evaluation.details)) {
                    navigation.navigate('ResultScreen', { totalScore: evaluation.totalScore, details: evaluation.details });
                }
            }
        } catch (error) {
            console.log("Lỗi khi đánh giá câu trả lời:", error);
            ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại.' });
            navigation.navigate('ResultScreen', {
                totalScore: 0,
                details: questions.map(() => ({ score: 0, feedback: "Không thể đánh giá." })),
            });
        }
        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <UIHeader
                leftIcon={"arrow-back"}
                handleLeftIcon={() => navigation.goBack()}
            />
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={orange} />
                    <Text style={styles.loadingText}>Đang xử lý...</Text>
                </View>
            ) : (
                <View style={styles.content}>
                    <Text style={StyleShare.titleText16}>Câu {currentIndex + 1}/{questions.length}</Text>
                    <Text style={styles.questionText}>{questions[currentIndex]}</Text>

                    {mode === 'text' ? (
                        <TextInput
                            style={styles.answerInput}
                            value={currentAnswer}
                            onChangeText={setCurrentAnswer}
                            placeholder="Nhập câu trả lời của bạn..."
                            multiline
                        />
                    ) : (
                        <View style={styles.voiceContainer}>
                            <Text style={styles.voiceStatus}>
                                {isListening ? "Đang nghe..." : "Nhấn mic để nói"}
                            </Text>
                            <TouchableOpacity
                                onPress={handleVoice}
                                style={[
                                    styles.voiceButton,
                                    { backgroundColor: isListening ? orange : mainColor },
                                ]}
                            >
                                <Icon name={isListening ? "stop" : "mic-outline"} size={24} color={white} />
                                <Text style={styles.voiceButtonText}>{isListening ? "Dừng" : "Nói"}</Text>
                            </TouchableOpacity>
                            {currentAnswer ? (
                                <Text style={styles.voiceResult}>Kết quả: {currentAnswer}</Text>
                            ) : null}
                        </View>
                    )}

                    <TouchableOpacity
                        style={[
                            styles.nextButton,
                            !currentAnswer.trim() && styles.nextButtonDisabled,
                        ]}
                        onPress={nextQuestion}
                        disabled={!currentAnswer.trim()}
                    >
                        <Text style={styles.nextButtonText}>
                            {currentIndex < questions.length - 1 ? 'Tiếp theo' : 'Hoàn thành'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f4f8',
    },
    content: {
        flex: 1,
        marginHorizontal: 20,
        marginTop: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f4f8',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: textColor,
    },
    questionText: {
        fontSize: 16,
        color: textColor,
        marginBottom: 20,
        lineHeight: 26,
    },
    answerInput: {
        backgroundColor: white,
        fontSize: 16,
        minHeight: 150,
        textAlignVertical: 'top',
        marginBottom: 20,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 15,
        borderWidth: 1,
        borderColor: grey,
    },
    voiceContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    voiceStatus: {
        fontSize: 16,
        color: textColor,
        marginBottom: 20,
    },
    voiceButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 50,
        marginBottom: 20,
    },
    voiceButtonText: {
        fontSize: 16,
        color: white,
        marginLeft: 10,
    },
    voiceResult: {
        fontSize: 14,
        color: textColor,
        textAlign: 'center',
        marginTop: 10,
    },
    nextButton: {
        backgroundColor: mainColor,
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20
    },
    nextButtonDisabled: {
        backgroundColor: 'grey',
        marginBottom: 20
    },
    nextButtonText: {
        fontSize: 18,
        color: white,
        fontWeight: 'bold',
    },
});