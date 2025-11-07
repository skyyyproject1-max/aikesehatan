import React from 'react';

interface ToolContainerProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const ToolContainer: React.FC<ToolContainerProps> = ({ title, description, children }) => {
  return (
    <div className="max-w-4xl mx-auto p-1 bg-gradient-to-br from-blue-200 via-teal-200 to-blue-200 dark:from-blue-800/50 dark:via-teal-800/50 dark:to-blue-800/50 rounded-xl shadow-2xl">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-lg p-6 sm:p-8">
            <div className="mb-6 text-center">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{title}</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl mx-auto">{description}</p>
            </div>
            <div>{children}</div>
        </div>
    </div>
  );
};

export default ToolContainer;
