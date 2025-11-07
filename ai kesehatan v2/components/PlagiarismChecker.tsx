import React, { useState } from 'react';
import { checkPlagiarism } from '../services/geminiService';
import { PlagiarismSource } from '../types';
import Spinner from './common/Spinner';
import ToolContainer from './ToolContainer';

const PlagiarismChecker: React.FC = () => {
    const [inputText, setInputText] = useState('');
    const [result, setResult] = useState<{ summary: string; sources: PlagiarismSource[] } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleCheck = async () => {
        if (!inputText.trim()) return;
        setIsLoading(true);
        setResult(null);
        const checkResult = await checkPlagiarism(inputText);
        setResult(checkResult);
        setIsLoading(false);
    };

    return (
        <ToolContainer
            title="Plagiarism Checker"
            description="Periksa potensi plagiarisme pada teks Anda dengan membandingkannya dengan sumber online. Ini adalah alat bantu dan bukan pengganti dari software pengecekan plagiarisme akademis."
        >
            <div>
                <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Tempel teks Anda di sini untuk diperiksa..."
                    className="w-full h-48 p-4 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                <button
                    onClick={handleCheck}
                    disabled={isLoading || !inputText.trim()}
                    className="mt-4 w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 disabled:cursor-not-allowed transition-all duration-200 transform active:scale-95"
                >
                    {isLoading ? 'Memeriksa...' : 'Cek Plagiarisme'}
                </button>
            </div>
            <div className="mt-6 min-h-[200px]">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Spinner />
                    </div>
                ) : result && (
                    <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg animate-fade-in">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Ringkasan Hasil</h3>
                            <p className="text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 p-4 rounded-md mb-6">{result.summary}</p>

                            {result.sources.length > 0 && (
                                <>
                                    <h3 className="text-lg font-semibold mb-3">Sumber yang Mungkin Terkait</h3>
                                    <ul className="space-y-3">
                                        {result.sources.map((source, index) => (
                                            <li key={index} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600/50">
                                                <a
                                                    href={source.web.uri}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                                                >
                                                    {source.web.title || source.web.uri}
                                                </a>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-1">{source.web.uri}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                             {result.sources.length === 0 && result.summary && (
                                <p className="text-center text-slate-500 dark:text-slate-400">Tidak ditemukan sumber online yang sangat mirip.</p>
                             )}
                        </div>
                    </div>
                )}
            </div>
        </ToolContainer>
    );
};

export default PlagiarismChecker;
