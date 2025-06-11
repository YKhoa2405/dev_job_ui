import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import UIHeader from '../../components/UIHeader';
import Icon from 'react-native-vector-icons/Ionicons';
import { grey, mainColor, orange, textColor, white } from '../../assets/themes/Color';
import { geminiService } from '../../assets/config/GeminiService';
import StyleShare from '../../assets/themes/StyleShare';
import { ToastMess } from '../../components/ToastMess';
import { Audio } from 'expo-av';

export default function InterviewScreen({ route, navigation }) {
  const { job, mode, numQuestions = 3, difficulty = 'medium' } = route.params; // Default to 3 questions, medium difficulty
  const jobDetails = job.jobId;
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  useEffect(() => {
    const generateQuestions = async () => {
      setLoading(true);
      try {
        const prompt = `
          Bạn là chuyên gia phỏng vấn IT.
          Tạo ${numQuestions} câu hỏi phỏng vấn IT cho công việc:
          - Tên: "${jobDetails.name}"
          - Độ khó: "${difficulty}" (dễ, trung bình, hoặc khó)
          - Kỹ năng: "${jobDetails.skills?.join(', ') || 'Không xác định'}"
          Trả về JSON: ["câu hỏi 1", "câu hỏi 2", ..., "câu hỏi ${numQuestions}"]
        `;
        const result = await geminiService(prompt);

        if (result && result !== 'Không có phản hồi từ AI.') {
          const cleanResult = result.replace(/```json|```/g, '').trim();
          const parsedQuestions = JSON.parse(cleanResult);
          if (Array.isArray(parsedQuestions) && parsedQuestions.length === numQuestions) {
            setQuestions(parsedQuestions);
          } else {
            throw new Error('Số lượng câu hỏi không khớp');
          }
        } else {
          throw new Error('Không nhận được phản hồi hợp lệ');
        }
      } catch (error) {
        console.error('Lỗi tạo câu hỏi:', error);
        ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại.' });
        // Fallback: Generate dummy questions matching numQuestions
        setQuestions(
          Array.from({ length: numQuestions }, (_, i) => `Câu hỏi mẫu ${i + 1} (${difficulty})`)
        );
      }
      setLoading(false);
    };
    generateQuestions();
  }, [jobDetails, numQuestions, difficulty]);

  async function startRecording() {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        ToastMess({ type: 'error', text1: 'Vui lòng cung cấp quyền ghi âm.' });
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recordingOptions = {
        android: {
          extension: '.wav',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_WAV,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_PCM_16BIT,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      };

      const { recording } = await Audio.Recording.createAsync(recordingOptions);
      setRecording(recording);
      console.log('Đã bắt đầu ghi âm');
    } catch (err) {
      console.error('Lỗi khi ghi âm:', err);
      ToastMess({ type: 'error', text1: 'Lỗi khi bắt đầu ghi âm.' });
    }
  }

  async function stopRecording() {
    try {
      if (!recording) return;

      setRecording(null);
      setIsTranscribing(true);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log('File âm thanh:', uri);

      await transcribeAudio(uri);
    } catch (err) {
      console.error('Lỗi khi dừng ghi âm:', err);
      ToastMess({ type: 'error', text1: 'Lỗi khi dừng ghi âm.' });
    } finally {
      setIsTranscribing(false);
    }
  }

  async function transcribeAudio(uri) {
    try {
      // Azure Speech Service credentials
      const speechKey = "1ahvACXLLoMmE3Umxiq9wDfneS93QCnObP09K3ebGh7wk3IjpH5QJQQJ99BCAC3pKaRXJ3w3AAAYACOGkqDO"; // Thay bằng khóa Azure Speech
      const speechRegion = "eastasia"; // Thay bằng khu vực (ví dụ: eastus)
      const speechEndpoint = `https://${speechRegion}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=vi-VN`;

      // Read the audio file as a blob
      const response = await fetch(uri);
      const audioBlob = await response.blob();

      // Prepare the request to Azure Speech-to-Text REST API
      const headers = {
        'Ocp-Apim-Subscription-Key': speechKey,
        'Content-Type': 'audio/wav',
        'Accept': 'application/json',
      };

      // Call Azure Speech-to-Text API
      const apiResponse = await fetch(speechEndpoint, {
        method: 'POST',
        headers: headers,
        body: audioBlob,
      });

      const result = await apiResponse.json();

      if (apiResponse.ok && result.RecognitionStatus === 'Success') {
        const transcribedText = result.DisplayText;
        setCurrentAnswer(transcribedText);
      } else {
        setCurrentAnswer('Không nhận diện được nội dung.');
        ToastMess({ type: 'error', text1: 'Không nhận diện được giọng nói.' });
      }
    } catch (err) {
      console.error('Lỗi chuyển giọng nói:', err);
      setCurrentAnswer('Có lỗi khi chuyển giọng nói.');
      ToastMess({ type: 'error', text1: 'Lỗi khi chuyển giọng nói.' });
    }
  }

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
        Bạn là chuyên gia phỏng vấn IT. Công việc: "${jobDetails.name}", Độ khó: "${difficulty}", Kỹ năng: "${jobDetails.skills?.join(', ') || 'Không xác định'}".
        Đánh giá các câu trả lời sau:
        ${questions.map((q, i) => `Câu hỏi ${i + 1}: "${q}"\nCâu trả lời: "${answers[i] || currentAnswer}"`).join('\n')}
        Hãy:
        1. Chấm điểm từng câu từ 0-10.
        2. Đưa ra feedback cụ thể.
        3. Tính điểm trung bình tổng, cộng lại chia ${numQuestions} trên thang điểm 10.
        Trả về JSON: { "totalScore": number, "details": [{ "score": number, "feedback": string }, ...] }
      `;
      const result = await geminiService(prompt);

      if (result && result !== 'Không có phản hồi từ AI.') {
        const cleanResult = result.replace(/```json|```/g, '').trim();
        const evaluation = JSON.parse(cleanResult);
        if (evaluation && typeof evaluation.totalScore === 'number' && Array.isArray(evaluation.details)) {
          navigation.navigate('ResultScreen', {
            totalScore: evaluation.totalScore,
            details: evaluation.details,
            job,
          });
        } else {
          throw new Error('Đánh giá không hợp lệ');
        }
      } else {
        throw new Error('Không nhận được phản hồi hợp lệ');
      }
    } catch (error) {
      console.error('Lỗi đánh giá:', error);
      ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại.' });
      navigation.navigate('ResultScreen', {
        totalScore: 0,
        details: questions.map(() => ({ score: 0, feedback: 'Không thể đánh giá.' })),
        job,
      });
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <UIHeader leftIcon={'arrow-back'} handleLeftIcon={() => navigation.goBack()} />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={orange} />
          <Text style={styles.loadingText}>Đang xử lý...</Text>
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={StyleShare.titleText16}>
            Câu {currentIndex + 1}/{questions.length}
          </Text>
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
                {recording ? 'Đang nghe...' : isTranscribing ? 'Đang xử lý...' : 'Nhấn mic để nói'}
              </Text>
              <TouchableOpacity
                onPress={recording ? stopRecording : startRecording}
                style={[styles.voiceButton, { backgroundColor: recording ? orange : mainColor }]}
                disabled={isTranscribing}
              >
                <Icon name={recording ? 'stop' : 'mic-outline'} size={24} color={white} />
                <Text style={styles.voiceButtonText}>{recording ? 'Dừng' : 'Nói'}</Text>
              </TouchableOpacity>
              {currentAnswer ? (
                <Text style={styles.voiceResult}>Kết quả: {currentAnswer}</Text>
              ) : null}
            </View>
          )}

          <TouchableOpacity
            style={[styles.nextButton, !currentAnswer.trim() && styles.nextButtonDisabled]}
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
    marginBottom: 20,
  },
  nextButtonDisabled: {
    backgroundColor: 'grey',
  },
  nextButtonText: {
    fontSize: 18,
    color: white,
    fontWeight: 'bold',
  },
});