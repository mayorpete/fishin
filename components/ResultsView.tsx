import React from 'react';
import ReactMarkdown from 'react-markdown';
import { RecommendationResult } from '../types';
import { ThermometerIcon, WindIcon, ClockIcon } from './Icons';

interface Props {
  result: RecommendationResult;
  onReset: () => void;
}

const ResultsView: React.FC<Props> = ({ result, onReset }) => {
  // Basic extraction to check if we have the expected structure
  // Note: We rely on ReactMarkdown for rendering, but we can try to parse the "Conditions" section for the dashboard
  const text = result.markdown;
  
  // Helper to extract values for the dashboard if possible (simple regex)
  const extractValue = (key: string) => {
    const regex = new RegExp(`\\*\\s*\\*\\*${key}:\\*\\*\\s*(.*)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : 'N/A';
  };

  const weather = extractValue('Weather');
  const temp = extractValue('Temp');
  const wind = extractValue('Wind');
  const time = extractValue('Time');

  // We will strip the "# Conditions" part from the markdown displayed in the main body
  // to avoid duplication, if we successfully extracted data.
  // For safety, we just display everything nicely via Markdown but style the headers.

  const searchChunks = result.groundingChunks.filter(c => c.web);

  return (
    <div className="w-full max-w-4xl mx-auto pb-12 animate-fade-in-up">
      {/* Header / Action Bar */}
      <div className="flex justify-between items-center mb-6 px-4 md:px-0">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="text-water-400">Angler</span>AI Report
        </h1>
        <button 
          onClick={onReset}
          className="text-sm text-slate-400 hover:text-white underline underline-offset-4"
        >
          New Location
        </button>
      </div>

      {/* Live Conditions Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
         <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 flex flex-col items-center text-center shadow-lg">
            <ClockIcon className="w-6 h-6 text-water-400 mb-2" />
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Time</span>
            <span className="text-white font-medium">{time !== 'N/A' ? time : '--:--'}</span>
         </div>
         <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 flex flex-col items-center text-center shadow-lg">
            <div className="w-6 h-6 text-yellow-400 mb-2 flex items-center justify-center text-lg">☀</div>
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Weather</span>
            <span className="text-white font-medium truncate w-full">{weather !== 'N/A' ? weather : 'Scanning...'}</span>
         </div>
         <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 flex flex-col items-center text-center shadow-lg">
            <ThermometerIcon className="w-6 h-6 text-red-400 mb-2" />
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Temp</span>
            <span className="text-white font-medium">{temp !== 'N/A' ? temp : '--°'}</span>
         </div>
         <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 flex flex-col items-center text-center shadow-lg">
            <WindIcon className="w-6 h-6 text-cyan-400 mb-2" />
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Wind</span>
            <span className="text-white font-medium text-sm">{wind !== 'N/A' ? wind : 'Calm'}</span>
         </div>
      </div>

      {/* Main Content - Rig Recommendations */}
      <div className="bg-transparent">
          <div className="prose prose-invert prose-blue max-w-none">
              <ReactMarkdown
                components={{
                  h1: () => null, // Hide H1 as we have our own header
                  // Custom styling for Rig Headers
                  h2: ({node, ...props}) => {
                    const id = props.children?.toString();
                    if (id && id.includes('Conditions')) return <div className="hidden" />; // Hide Conditions section in body if possible, or just style it small
                    return (
                        <div className="bg-gradient-to-r from-water-900/50 to-slate-800 border border-water-800/50 rounded-t-2xl p-4 mt-8 mb-0 flex items-center gap-3">
                             <div className="w-2 h-8 bg-water-500 rounded-full"></div>
                             <h2 className="text-xl font-bold text-white m-0 border-none" {...props} />
                        </div>
                    );
                  },
                  // Styling the lists inside the rigs
                  ul: ({node, ...props}) => <ul className="bg-slate-800/40 border-x border-b border-slate-700/50 rounded-b-2xl p-6 mt-0 mb-6 space-y-3 list-none" {...props} />,
                  li: ({node, ...props}) => (
                    <li className="flex items-start gap-2 text-slate-300" {...props}>
                       <span className="mt-1.5 w-1.5 h-1.5 bg-water-400 rounded-full flex-shrink-0"></span>
                       <span className="flex-1">{props.children}</span>
                    </li>
                  ),
                  p: ({node, ...props}) => <p className="text-slate-300 mb-4" {...props} />,
                  strong: ({node, ...props}) => <strong className="text-water-200 font-semibold" {...props} />
                }}
              >
                {result.markdown}
              </ReactMarkdown>
          </div>
      </div>
      
      {/* Sources Footer */}
      {searchChunks.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-800">
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Data Sources</h3>
          <div className="flex flex-wrap gap-2">
            {searchChunks.map((chunk, i) => (
              <a 
                key={i}
                href={chunk.web?.uri}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-slate-500 hover:text-water-400 transition-colors truncate max-w-[300px] flex items-center gap-1"
              >
                • {chunk.web?.title || 'Web Source'}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsView;