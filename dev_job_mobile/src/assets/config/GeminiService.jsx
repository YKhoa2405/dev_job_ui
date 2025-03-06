import axios from 'axios';
import { api_key_gemini } from './Key';

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${api_key_gemini}`;


export const geminiService = async (prompt) => {
    try {
        const response = await axios.post(GEMINI_URL, {
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        });
        return response.data.candidates?.[0]?.content?.parts?.[0]?.text || "Không có phản hồi từ AI.";
    } catch (error) {
        console.log("Lỗi gọi API Gemini:", error.response?.data || error.message);
    }
};

