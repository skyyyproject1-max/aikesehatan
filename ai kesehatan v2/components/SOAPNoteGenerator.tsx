import React, { useState } from 'react';
import { generateSOAPNote } from '../services/geminiService';
import Spinner from './common/Spinner';
import ToolContainer from './ToolContainer';
import { ICONS } from '../constants';

const SOAPNoteGenerator: React.FC = () => {
    const [s, setS] = useState('');
    const [o, setO] = useState('');
    const [a, setA] = useState('');
    const [p, setP] = useState('');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        if (!s.trim() && !o.trim() && !a.trim() && !p.trim()) return;
        setIsLoading(true);
        setResult('');
        const note = await generateSOAPNote(s, o, a, p);
        setResult(note);
        setIsLoading(false);
    };

    const handleCopy = () => {
        if (!result) return;
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const InputField = ({ label, value, onChange, placeholder }) => (
        <div>
            <label className="block text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">{label}</label>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full h-28 p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                rows={3}
            />
        </div>
    );

    return (
        <ToolContainer
            title="SOAP Note Generator"
            description="Masukkan data pasien pada setiap bagian untuk membuat Catatan Perkembangan Pasien Terintegrasi (CPPT) secara otomatis."
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <InputField label="S (Subjective)" value={s} onChange={setS} placeholder="Keluhan utama, riwayat penyakit..." />
                    <InputField label="O (Objective)" value={o} onChange={setO} placeholder="Tanda-tanda vital, hasil pemeriksaan fisik..." />
                    <InputField label="A (Assessment)" value={a} onChange={setA} placeholder="Diagnosis kerja, diagnosis banding..." />
                    <InputField label="P (Plan)" value={p} onChange={setP} placeholder="Rencana terapi, edukasi, rujukan..." />
                </div>
                <div className="relative">
                     <h3 className="block text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">Hasil Catatan SOAP</h3>
                    <div className="relative w-full h-[31rem] p-4 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/50 overflow-y-auto">
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg">
                                <Spinner />
                            </div>
                        )}
                        <p className="whitespace-pre-wrap text-sm">{result}</p>
                    </div>
                     {result && !isLoading && (
                        <button 
                            onClick={handleCopy}
                            className="absolute top-10 right-3 p-2 text-slate-500 bg-slate-200 dark:bg-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-500 rounded-full transition"
                            aria-label="Copy note"
                        >
                            {copied ? ICONS.check : ICONS.copy}
                        </button>
                    )}
                </div>
            </div>
            <div className="mt-8">
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 disabled:cursor-not-allowed transition-all duration-200 transform active:scale-95"
                >
                    {isLoading ? 'Membuat Catatan...' : 'Buat Catatan SOAP'}
                </button>
            </div>
        </ToolContainer>
    );
};

export default SOAPNoteGenerator;
