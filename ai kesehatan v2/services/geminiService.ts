import { GoogleGenAI, Chat, Type, GenerateContentResponse } from "@google/genai";
import { AIDetectionResult, PlagiarismSource, CriticalityLevel } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const chatModel = 'gemini-2.5-flash';
const toolsModel = 'gemini-2.5-flash';

let chatInstance: Chat | null = null;

const getChatInstance = (): Chat => {
    if (!chatInstance) {
        chatInstance = ai.chats.create({
            model: chatModel,
            config: {
                systemInstruction: `You are a world-class AI assistant for healthcare students, professionals, and academics in Indonesia and globally. Your name is "Asisten AI Kesehatan".
                You are an expert in all healthcare fields: nutrition, medical analysis, medical records, electromedicine, environmental health, public health, medicine, nursing, etc.
                Your primary goals are:
                1.  **Academic and Clinical Excellence:** Help with thesis writing, finding and analyzing academic journals, explaining complex topics, creating health system frameworks, and formulating anamnesis questions. This includes analyzing images provided by the user.
                2.  **Formal Language:** For all academic or professional requests, you MUST use formal Bahasa Indonesia that adheres to KBBI standards.
                3.  **Citations and References:** When providing information that requires sources (especially for academic work), you MUST cite them and include references with author and publication year.
                4.  **Critical Thinking (Default Behavior):** For complex requests like 'buatkan skripsi' or 'analisis jurnal', DO NOT answer directly. First, ask clarifying questions to understand the user's specific needs, scope, and context. Act like a helpful advisor or mentor.
                5.  **General Helpfulness:** Answer a wide range of questions, including casual ('receh') ones, in a helpful and engaging manner.
                6.  **Language:** Respond primarily in Bahasa Indonesia, unless the user queries in another language. Maintain a professional yet approachable tone.
                7.  **Mandatory Disclaimer:** For any medical or diagnostic-related queries, ALWAYS include this disclaimer: "PENTING: Informasi ini tidak menggantikan nasihat medis profesional. Selalu konsultasikan dengan tenaga kesehatan yang berkualifikasi."`,
            },
        });
    }
    return chatInstance;
};

interface ChatOptions {
    criticality: CriticalityLevel;
    dateRange?: { start?: string; end?: string };
}

export const chat = async (
    message: string,
    image: { data: string, mimeType: string } | null,
    options: ChatOptions
): Promise<string> => {
    try {
        const chat = getChatInstance();
        
        let constructedMessage = message;
        
        // Prepend instructions based on criticality
        if (options.criticality === 'direct') {
            constructedMessage = `[Instruksi: Jawab pertanyaan ini secara langsung tanpa bertanya kembali]\n\n${message}`;
        } else if (options.criticality === 'critical') {
            constructedMessage = `[Instruksi: Analisis permintaan ini secara mendalam. Ajukan pertanyaan kritis yang mendalam untuk memperjelas, menantang asumsi, dan memastikan tujuannya terdefinisi dengan baik sebelum memberikan jawaban. Bertindaklah seperti seorang dosen pembimbing yang ahli.]\n\n${message}`;
        }
        // 'clarifying' is the default behavior from system instruction, so no prefix needed.

        // Append date range instruction
        if (options.dateRange?.start && options.dateRange?.end) {
            constructedMessage += `\n\n[Instruksi Tambahan: Gunakan hanya referensi yang diterbitkan antara tahun ${options.dateRange.start} dan ${options.dateRange.end}.]`;
        }

        const messageParts: (string | { inlineData: { data: string; mimeType: string; } })[] = [constructedMessage];

        if (image) {
            messageParts.push({
                inlineData: {
                    data: image.data,
                    mimeType: image.mimeType,
                },
            });
        }

        const response: GenerateContentResponse = await chat.sendMessage({ message: messageParts });
        return response.text;
    } catch (error) {
        console.error("Error in chat service:", error);
        return "Maaf, terjadi kesalahan saat berkomunikasi dengan AI. Silakan coba lagi.";
    }
};

export const paraphraseText = async (text: string): Promise<string> => {
    try {
        const prompt = `Parafrase teks berikut untuk penggunaan akademis dan profesional. Pertahankan makna asli tetapi gunakan kata-kata dan struktur kalimat yang berbeda. Pastikan hasilnya terdengar alami dan profesional sesuai kaidah KBBI.

Teks asli: "${text}"

Hasil Parafrase:`;
        const response = await ai.models.generateContent({
            model: toolsModel,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error in paraphrase service:", error);
        return "Maaf, terjadi kesalahan saat memparafrasekan teks.";
    }
};

export const detectAI = async (text: string): Promise<AIDetectionResult> => {
    try {
        const prompt = `Analisis teks berikut dan berikan skor kemungkinan (dari 0 hingga 100) apakah teks tersebut dibuat oleh AI. Jelaskan alasan Anda berdasarkan faktor-faktor seperti perplexity, burstiness, dan pola penulisan umum AI.

Teks: "${text}"`;

        const response = await ai.models.generateContent({
            model: toolsModel,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        likelihood: {
                            type: Type.NUMBER,
                            description: "Skor dari 0 hingga 100 yang menunjukkan kemungkinan teks dibuat oleh AI.",
                        },
                        explanation: {
                            type: Type.STRING,
                            description: "Penjelasan singkat tentang alasan di balik skor yang diberikan.",
                        },
                    },
                    required: ["likelihood", "explanation"],
                },
            },
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as AIDetectionResult;
    } catch (error) {
        console.error("Error in AI detection service:", error);
        return {
            likelihood: -1,
            explanation: "Maaf, terjadi kesalahan saat mendeteksi konten AI. Respons dari model mungkin tidak dalam format JSON yang valid.",
        };
    }
};

export const checkPlagiarism = async (text: string): Promise<{ summary: string, sources: PlagiarismSource[] }> => {
    try {
        const prompt = `Analisis teks berikut untuk potensi plagiarisme dengan menemukan konten serupa di web. Berikan ringkasan singkat dari temuan Anda dan daftar sumber apa pun yang memiliki tingkat kesamaan yang tinggi.

Teks: "${text}"`;

        const response = await ai.models.generateContent({
            model: toolsModel,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        
        const summary = response.text;
        const sources = (response.candidates?.[0]?.groundingMetadata?.groundingChunks as PlagiarismSource[]) || [];

        return { summary, sources };
    } catch (error) {
        console.error("Error in plagiarism checking service:", error);
        return {
            summary: "Maaf, terjadi kesalahan saat memeriksa plagiarisme.",
            sources: [],
        };
    }
};

export const generateSOAPNote = async (s: string, o: string, a: string, p: string): Promise<string> => {
    try {
        const prompt = `Buatkan catatan perkembangan pasien terintegrasi (CPPT) dalam format SOAP yang profesional dan ringkas berdasarkan data berikut. Gunakan terminologi medis yang tepat dan bahasa Indonesia yang baik.

S (Subjective):
${s}

O (Objective):
${o}

A (Assessment):
${a}

P (Plan):
${p}

Hasil SOAP Note:`;
        const response = await ai.models.generateContent({
            model: toolsModel,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error in SOAP note generation service:", error);
        return "Maaf, terjadi kesalahan saat membuat catatan SOAP.";
    }
};

export const findJournals = async (topic: string): Promise<{ summary: string, sources: PlagiarismSource[] }> => {
    try {
        const prompt = `Lakukan pencarian mendalam untuk menemukan jurnal ilmiah dan artikel akademis yang relevan dengan topik berikut: "${topic}". Prioritaskan sumber dari database terkemuka seperti PubMed, Google Scholar, dan lainnya. Berikan ringkasan singkat dari lanskap penelitian saat ini tentang topik tersebut dan daftar sumber yang paling relevan yang Anda temukan.`;

        const response = await ai.models.generateContent({
            model: toolsModel,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        
        const summary = response.text;
        const sources = (response.candidates?.[0]?.groundingMetadata?.groundingChunks as PlagiarismSource[]) || [];

        return { summary, sources };
    } catch (error) {
        console.error("Error in journal finding service:", error);
        return {
            summary: "Maaf, terjadi kesalahan saat mencari jurnal. Silakan coba lagi.",
            sources: [],
        };
    }
};

export const analyzeJournalText = async (text: string): Promise<string> => {
    try {
        const prompt = `Anda adalah seorang asisten peneliti ahli. Analisis teks jurnal ilmiah berikut. Berikan ringkasan terstruktur yang mencakup:
1.  **Latar Belakang/Tujuan:** Apa masalah yang diteliti dan apa tujuan penelitian ini?
2.  **Metodologi:** Bagaimana penelitian ini dilakukan? (misalnya, desain studi, partisipan, intervensi, pengukuran).
3.  **Temuan Utama:** Apa hasil paling penting dari penelitian ini?
4.  **Kesimpulan:** Apa kesimpulan utama yang ditarik oleh penulis?
5.  **Poin Kritis (jika memungkinkan):** Apa potensi kekuatan atau kelemahan dari studi ini?

Pastikan respons Anda jelas, ringkas, dan menggunakan Bahasa Indonesia formal (KBBI).

Teks Jurnal:
---
${text}
---
`;
        const response = await ai.models.generateContent({
            model: toolsModel,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error in journal analysis service:", error);
        return "Maaf, terjadi kesalahan saat menganalisis teks jurnal.";
    }
};