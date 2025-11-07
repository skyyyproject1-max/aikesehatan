import React, { useState } from 'react';
import { paraphraseText } from '../services/geminiService';
import Spinner from './common/Spinner';
import ToolContainer from './ToolContainer';

const Paraphraser: React.FC = () => {
    const [inputText, setInputText] = useState('');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleParaphrase = async () => {
        if (!inputText.trim()) return;
        setIsLoading(true);
        setResult('');
        const paraphrased = await paraphraseText(inputText);
        setResult(paraphrased);
        setIsLoading(false);
    };

    return (
        <ToolContainer
            title="AI Paraphraser"
            description="Tulis ulang teks Anda untuk menghindari plagiarisme dan meningkatkan kejelasan. Tempel teks Anda di bawah ini."
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Tempel teks Anda di sini..."
                        className="w-full h-72 p-4 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                </div>
                <div className="relative">
                    <div className="w-full h-72 p-4 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/50 overflow-y-auto">
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg">
                                <Spinner />
                            </div>
                        )}
                        <p className="whitespace-pre-wrap">{result}</p>
                    </div>
                </div>
            </div>
             <div className="mt-6">
                <button
                    onClick={handleParaphrase}
                    disabled={isLoading || !inputText.trim()}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 disabled:cursor-not-allowed transition-all duration-200 transform active:scale-95"
                >
                    {isLoading ? 'Memproses...' : 'Parafrasekan Teks'}
                </button>
            </div>
        </ToolContainer>
    );
};

export default Paraphraser;
