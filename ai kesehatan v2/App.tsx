import React, { useState } from 'react';
import Header from './components/Header';
import ChatAssistant from './components/ChatAssistant';
import Paraphraser from './components/Paraphraser';
import AIDetector from './components/AIDetector';
import PlagiarismChecker from './components/PlagiarismChecker';
import SOAPNoteGenerator from './components/SOAPNoteGenerator';
import JournalFinder from './components/JournalFinder';
import { Tool } from './types';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<Tool>('chat');

  const renderTool = () => {
    switch (activeTool) {
      case 'chat':
        return <ChatAssistant />;
      case 'paraphrase':
        return <Paraphraser />;
      case 'detect':
        return <AIDetector />;
      case 'plagiarism':
        return <PlagiarismChecker />;
      case 'soap':
        return <SOAPNoteGenerator />;
      case 'journal':
        return <JournalFinder />;
      default:
        return <ChatAssistant />;
    }
  };

  return (
    <div className="min-h-screen font-sans text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-950">
      <Header activeTool={activeTool} setActiveTool={setActiveTool} />
      <main className="p-4 sm:p-6 lg:p-8">
        {renderTool()}
      </main>
    </div>
  );
};

export default App;
