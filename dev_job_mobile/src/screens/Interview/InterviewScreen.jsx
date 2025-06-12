import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import UIHeader from '../../components/UIHeader';
import { grey, mainColor, orange, textColor, white } from '../../assets/themes/Color';
import { geminiService } from '../../assets/config/GeminiService';
import StyleShare from '../../assets/themes/StyleShare';
import { ToastMess } from '../../components/ToastMess';

export default function InterviewScreen({ route, navigation }) {
  const { job, numQuestions = 3, difficulty = 'medium' } = route.params; // Default to 3 questions, medium difficulty
  const jobDetails = job.jobId;
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const generateQuestions = async () => {
      setLoading(true);
      try {
        const prompt = `
          You are an expert in interviewing. 
          Generate ${numQuestions} interview questions for the following job:
          - Title: "${jobDetails.name}"
          - Difficulty: "${difficulty}" (easy, medium, or hard)
          - Skills: "${jobDetails.skills?.join(', ') || 'Unknown'}"
          - Job Description: "${jobDetails.description || 'Unknown'}"
          - Job Requirements: "${jobDetails.requirements || 'Unknown'}"
          Return the questions in Vietnamese as a JSON array:
          ["Question 1", "Question 2", ..., "Question ${numQuestions}"]
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
        You are an expert in interviewing. 
        Job: "${jobDetails.name}", Difficulty: "${difficulty}", Skills: "${jobDetails.skills?.join(', ') || 'Unknown'}", Description: "${jobDetails.description || 'Unknown'}", Requirements: "${jobDetails.requirements || 'Unknown'}".
        Evaluate the following answers:
        ${questions.map((q, i) => `Question ${i + 1}: "${q}"\nAnswer: "${answers[i] || currentAnswer}"`).join('\n')}
        Please:
        1. Score each answer from 0 to 10.
        2. Provide specific feedback for each answer.
        3. Calculate the total average score by summing the individual scores and dividing by ${numQuestions}, on a scale of 10.
        Return the result **in Vietnamese** in JSON format:
        {
          "totalScore": number,
          "details": [
            { "score": number, "feedback": string },
            ...
          ]
        }
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

          <TextInput
            style={styles.answerInput}
            value={currentAnswer}
            onChangeText={setCurrentAnswer}
            placeholder="Nhập câu trả lời của bạn..."
            multiline
          />

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