import React, { useState, useRef, useEffect } from 'react';
import { chat } from '../services/geminiService';
import { Message, CriticalityLevel } from '../types';
import { ICONS } from '../constants';

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
    const [copied, setCopied] = useState(false);
    const isUser = message.sender === 'user';

    const handleCopy = () => {
        navigator.clipboard.writeText(message.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={`flex items-start gap-3 my-4 ${isUser ? 'justify-end' : ''}`}>
            {!isUser && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md">
                    AI
                </div>
            )}
            <div className={`relative max-w-2xl p-4 rounded-xl shadow-sm ${isUser ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white dark:bg-slate-700 rounded-bl-none'}`}>
                 {message.image && (
                    <img src={message.image} alt="User attachment" className="mb-2 rounded-lg max-w-full h-auto" style={{maxHeight: '300px'}} />
                )}
                <p className="whitespace-pre-wrap">{message.text}</p>
                {!isUser && (
                    <button 
                        onClick={handleCopy}
                        className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                        aria-label="Copy message"
                    >
                        {copied ? ICONS.check : ICONS.copy}
                    </button>
                )}
            </div>
            {isUser && (
                <div className="w-10 h-10 rounded-full bg-slate-500 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md">
                    You
                </div>
            )}
        </div>
    );
};

const AISettings: React.FC<{
    criticality: CriticalityLevel;
    setCriticality: (level: CriticalityLevel) => void;
    dateRange: { start: string, end: string };
    setDateRange: (range: { start: string, end: string }) => void;
}> = ({ criticality, setCriticality, dateRange, setDateRange }) => {
    const criticalityOptions = [
        { id: 'clarifying', label: 'Tanya Dulu' },
        { id: 'direct', label: 'Langsung Jawab' },
        { id: 'critical', label: 'Kritis' },
    ];

    return (
        <div className="p-4 bg-slate-200 dark:bg-slate-700/50 rounded-t-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tingkat Kekritisan AI</label>
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-full p-1">
                        {criticalityOptions.map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => setCriticality(opt.id as CriticalityLevel)}
                                className={`w-full py-1.5 text-sm font-semibold rounded-full transition-colors ${criticality === opt.id ? 'bg-blue-600 text-white shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                            >{opt.label}</button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Rentang Tahun Referensi</label>
                    <div className="flex items-center gap-2">
                        <input type="number" placeholder="Mulai" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} className="w-full px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-800 border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <span className="text-slate-500">-</span>
                        <input type="number" placeholder="Selesai" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} className="w-full px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-800 border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const ChatAssistant: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'ai', text: 'Halo! Saya Asisten AI Kesehatan. Ada yang bisa saya bantu? Gunakan pengaturan di atas untuk menyesuaikan respons saya atau lampirkan gambar jika perlu.' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [criticality, setCriticality] = useState<CriticalityLevel>('clarifying');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [image, setImage] = useState<{ data: string, mimeType: string, url: string } | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isLoading]);

    const fileToBase64 = (file: File): Promise<{data: string, mimeType: string, url: string}> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                const base64Data = result.split(',')[1];
                resolve({ data: base64Data, mimeType: file.type, url: result });
            };
            reader.onerror = error => reject(error);
        });
    };
    
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const imageData = await fileToBase64(file);
                setImage(imageData);
            } catch (error) {
                console.error("Error converting file to base64:", error);
            }
        }
        // Reset file input value to allow selecting the same file again
        event.target.value = '';
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!input.trim() && !image) || isLoading) return;

        const userMessage: Message = { sender: 'user', text: input, image: image?.url };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const aiResponseText = await chat(input, image ? {data: image.data, mimeType: image.mimeType} : null, { criticality, dateRange });
        setImage(null);
        const aiMessage: Message = { sender: 'ai', text: aiResponseText };

        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-160px)] max-w-5xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <AISettings criticality={criticality} setCriticality={setCriticality} dateRange={dateRange} setDateRange={setDateRange} />
            <div className="flex-1 p-6 overflow-y-auto bg-slate-50 dark:bg-slate-900/50">
                {messages.map((msg, index) => (
                    <MessageBubble key={index} message={msg} />
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3 my-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md">AI</div>
                        <div className="max-w-xl p-4 rounded-xl bg-white dark:bg-slate-700 rounded-bl-none">
                           <div className="flex items-center space-x-2">
                               <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
                               <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                               <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                           </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                {image && (
                    <div className="relative inline-block mb-2">
                        <img src={image.url} alt="Preview" className="h-20 w-20 object-cover rounded-lg" />
                        <button 
                            onClick={() => setImage(null)}
                            className="absolute -top-2 -right-2 bg-slate-600 text-white rounded-full p-0.5 hover:bg-slate-800"
                            aria-label="Remove image"
                        >
                            {ICONS.close}
                        </button>
                    </div>
                )}
                <form onSubmit={handleSendMessage} className="flex items-center gap-2 sm:gap-4">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    <input type="file" ref={cameraInputRef} onChange={handleFileChange} accept="image/*" capture="environment" className="hidden" />
                     <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 focus:outline-none transition-colors"
                        aria-label="Attach file"
                        disabled={isLoading}
                    >
                        {ICONS.attach}
                    </button>
                    <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="p-3 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 focus:outline-none transition-colors"
                        aria-label="Use camera"
                        disabled={isLoading}
                    >
                        {ICONS.camera}
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ketik pertanyaan atau tempel teks jurnal..."
                        className="flex-1 w-full px-5 py-3 bg-slate-100 dark:bg-slate-700 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || (!input.trim() && !image)}
                        className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800 transition-transform duration-200 active:scale-95"
                        aria-label="Send message"
                    >
                        {ICONS.send}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatAssistant;