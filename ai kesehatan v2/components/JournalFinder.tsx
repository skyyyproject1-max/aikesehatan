import React, { useState } from 'react';
import { findJournals, analyzeJournalText } from '../services/geminiService';
import { PlagiarismSource } from '../types';
import Spinner from './common/Spinner';
import ToolContainer from './ToolContainer';

type ActiveTab = 'find' | 'analyze';

const JournalFinder: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('find');

    // State for "Find Journal"
    const [findQuery, setFindQuery] = useState('');
    const [findResult, setFindResult] = useState<{ summary: string; sources: PlagiarismSource[] } | null>(null);
    const [isFinding, setIsFinding] = useState(false);

    // State for "Analyze Journal"
    const [analyzeText, setAnalyzeText] = useState('');
    const [analyzeResult, setAnalyzeResult] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleFind = async () => {
        if (!findQuery.trim()) return;
        setIsFinding(true);
        setFindResult(null);
        const result = await findJournals(findQuery);
        setFindResult(result);
        setIsFinding(false);
    };

    const handleAnalyze = async () => {
        if (!analyzeText.trim()) return;
        setIsAnalyzing(true);
        setAnalyzeResult('');
        const result = await analyzeJournalText(analyzeText);
        setAnalyzeResult(result);
        setIsAnalyzing(false);
    };

    return (
        <ToolContainer
            title="Pencari & Analis Jurnal"
            description="Temukan jurnal ilmiah berdasarkan topik atau analisis teks jurnal yang sudah Anda miliki."
        >
            <div className="mb-6 flex justify-center border-b border-slate-300 dark:border-slate-600">
                <button
                    onClick={() => setActiveTab('find')}
                    className={`px-6 py-3 text-sm font-semibold transition-colors w-1/2 ${activeTab === 'find' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    Cari Jurnal
                </button>
                <button
                    onClick={() => setActiveTab('analyze')}
                    className={`px-6 py-3 text-sm font-semibold transition-colors w-1/2 ${activeTab === 'analyze' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    Analisis Teks Jurnal
                </button>
            </div>

            {activeTab === 'find' && (
                <div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={findQuery}
                            onChange={(e) => setFindQuery(e.target.value)}
                            placeholder="Masukkan topik penelitian, contoh: 'efektivitas vaksin A'"
                            className="flex-1 w-full px-4 py-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={handleFind}
                            disabled={isFinding || !findQuery.trim()}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 disabled:cursor-not-allowed"
                        >
                            {isFinding ? <Spinner/> : 'Cari'}
                        </button>
                    </div>
                    <div className="mt-6 min-h-[200px]">
                        {isFinding ? (
                            <div className="flex items-center justify-center h-full pt-10"><Spinner /></div>
                        ) : findResult && (
                            <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg animate-fade-in">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Ringkasan AI</h3>
                                    <p className="text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 p-4 rounded-md mb-6 whitespace-pre-wrap">{findResult.summary}</p>
                                    {findResult.sources.length > 0 && (
                                        <>
                                            <h3 className="text-lg font-semibold mb-3">Sumber Jurnal yang Ditemukan</h3>
                                            <ul className="space-y-3">
                                                {findResult.sources.map((source, index) => (
                                                    <li key={index} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600/50">
                                                        <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                                                            {source.web.title || source.web.uri}
                                                        </a>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-1">{source.web.uri}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'analyze' && (
                <div>
                     <textarea
                        value={analyzeText}
                        onChange={(e) => setAnalyzeText(e.target.value)}
                        placeholder="Tempelkan abstrak atau seluruh teks jurnal di sini untuk dianalisis oleh AI..."
                        className="w-full h-48 p-4 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !analyzeText.trim()}
                        className="mt-4 w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 disabled:cursor-not-allowed"
                    >
                        {isAnalyzing ? 'Menganalisis...' : 'Analisis Teks'}
                    </button>
                     <div className="mt-6 min-h-[200px]">
                        {isAnalyzing ? (
                            <div className="flex items-center justify-center h-full pt-10"><Spinner /></div>
                        ) : analyzeResult && (
                             <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg animate-fade-in">
                                <h3 className="text-lg font-semibold mb-2">Hasil Analisis</h3>
                                <p className="text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 p-4 rounded-md whitespace-pre-wrap">{analyzeResult}</p>
                             </div>
                        )}
                    </div>
                </div>
            )}
        </ToolContainer>
    );
};

export default JournalFinder;
