export type Tool = 'chat' | 'paraphrase' | 'detect' | 'plagiarism' | 'soap' | 'journal';

export type CriticalityLevel = 'direct' | 'clarifying' | 'critical';

export interface Message {
  sender: 'user' | 'ai';
  text: string;
  image?: string; // Base64 data URL
}

export interface AIDetectionResult {
  likelihood: number;
  explanation: string;
}

export interface PlagiarismSource {
  web: {
    uri: string;
    title: string;
  }
}