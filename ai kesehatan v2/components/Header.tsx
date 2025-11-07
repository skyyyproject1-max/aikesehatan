import React from 'react';
import { APP_TITLE, ICONS } from '../constants';
import { Tool } from '../types';

interface HeaderProps {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTool, setActiveTool }) => {
  const navItems: { id: Tool; label: string; icon: React.ReactNode }[] = [
    { id: 'chat', label: 'Chat Assistant', icon: ICONS.chat },
    { id: 'soap', label: 'SOAP Note', icon: ICONS.soap },
    { id: 'journal', label: 'Journal Finder', icon: ICONS.journal },
    { id: 'paraphrase', label: 'Paraphrase', icon: ICONS.paraphrase },
    { id: 'detect', label: 'AI Detector', icon: ICONS.detect },
    { id: 'plagiarism', label: 'Plagiarism Check', icon: ICONS.plagiarism },
  ];

  return (
    <header className="bg-gradient-to-r from-blue-600 to-teal-500 dark:from-blue-800 dark:to-teal-700 shadow-lg sticky top-0 z-10 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between py-4">
          <h1 className="text-3xl font-bold tracking-tight mb-4 sm:mb-0">
            {APP_TITLE}
          </h1>
          <nav className="flex flex-wrap justify-center gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTool(item.id)}
                className={`flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-700 focus:ring-white ${
                  activeTool === item.id
                    ? 'bg-white/20 backdrop-blur-sm shadow-md'
                    : 'bg-transparent hover:bg-white/10'
                }`}
                aria-current={activeTool === item.id ? 'page' : undefined}
              >
                {item.icon}
                <span className="hidden md:inline">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
