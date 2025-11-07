import React, { useState } from 'react';
import { detectAI } from '../services/geminiService';
import { AIDetectionResult } from '../types';
import Spinner from './common/Spinner';
import ToolContainer from './ToolContainer';

const AIDetector: React.FC = () => {
    const [inputText, setInputText] = useState('');
    const [result, setResult] = useState<AIDetectionResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleDetect = async () => {
        if (!inputText.trim()) return;
        setIsLoading(true);
        setResult(null);
        const detectionResult = await detectAI(inputText);
        setResult(detectionResult);
        setIsLoading(false);
    };
    
    const getBarColor = (likelihood: number) => {
        if (likelihood < 0) return 'bg-slate-400';
        if (likelihood < 40) return 'bg-green-500';
        if (likelihood < 70) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <ToolContainer
            title="AI Content Detector"
            description="Analisis teks untuk mengetahui kemungkinan apakah teks tersebut ditulis oleh AI. Tempel teks di bawah ini."
        >
            <div>
                <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Tempel teks Anda di sini untuk dianalisis..."
                    className="w-full h-48 p-4 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                <button
                    onClick={handleDetect}
                    disabled={isLoading || !inputText.trim()}
                    className="mt-4 w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 disabled:cursor-not-allowed transition-all duration-200 transform active:scale-95"
                >
                    {isLoading ? 'Menganalisis...' : 'Deteksi Konten AI'}
                </button>
            </div>
            <div className="mt-6 min-h-[150px]">
              {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Spinner />
                  </div>
              ) : result && (
                  <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg animate-fade-in">
                      <h3 className="text-lg font-semibold mb-3 text-center">Hasil Analisis</h3>
                       {result.likelihood >= 0 ? (
                          <>
                              <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-8 mb-2 overflow-hidden">
                                  <div
                                      className={`h-full rounded-full ${getBarColor(result.likelihood)} flex items-center justify-center text-white font-bold text-sm transition-all duration-1000 ease-out`}
                                      style={{ width: `${result.likelihood}%` }}
                                  >
                                      {result.likelihood.toFixed(0)}%
                                  </div>
                              </div>
                              <p className="text-center font-medium text-sm text-slate-600 dark:text-slate-300 mb-4">Kemungkinan Dibuat oleh AI</p>
                          </>
                       ) : null}
                      <p className="text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 p-4 rounded-md text-center">{result.explanation}</p>
                  </div>
              )}
            </div>
        </ToolContainer>
    );
};

export default AIDetector;
