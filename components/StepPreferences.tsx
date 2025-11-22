import React, { useState, useEffect } from 'react';
import { UserPreferences, WaterType, LocalSpecies } from '../types';
import { FishIcon, ArrowRightIcon, WaveIcon } from './Icons';

interface Props {
  localSpecies: LocalSpecies | null;
  onSubmit: (prefs: UserPreferences) => void;
}

const StepPreferences: React.FC<Props> = ({ localSpecies, onSubmit }) => {
  const [waterType, setWaterType] = useState<WaterType>('freshwater');
  const [fishType, setFishType] = useState('');
  const [isCustomFish, setIsCustomFish] = useState(false);

  // Reset fish selection when water type changes to prevent invalid combos
  useEffect(() => {
    setFishType('');
    setIsCustomFish(false);
  }, [waterType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fishType.trim()) return;
    onSubmit({ waterType, fishType });
  };

  const currentSpeciesList = localSpecies ? localSpecies[waterType] : [];

  return (
    <div className="w-full max-w-lg mx-auto p-6 animate-fade-in-up">
      <h2 className="text-3xl font-bold text-white mb-2">Target Species</h2>
      <p className="text-slate-400 mb-8">Select what you're chasing based on local popularity.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Water Type Toggle */}
        <div className="bg-slate-800/50 p-1.5 rounded-2xl flex relative border border-slate-700">
          <button
            type="button"
            onClick={() => setWaterType('freshwater')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
              waterType === 'freshwater' 
                ? 'bg-water-600 text-white shadow-lg' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <WaveIcon className="w-4 h-4" />
            Freshwater
          </button>
          <button
            type="button"
            onClick={() => setWaterType('saltwater')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
              waterType === 'saltwater' 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <WaveIcon className="w-4 h-4" />
            Saltwater
          </button>
        </div>

        {/* Fish Type Selector */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">Select Species</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FishIcon className="h-5 w-5 text-slate-500" />
            </div>
            
            {!isCustomFish ? (
              <select
                value={fishType}
                onChange={(e) => {
                  if (e.target.value === 'OTHER_CUSTOM') {
                    setIsCustomFish(true);
                    setFishType('');
                  } else {
                    setFishType(e.target.value);
                  }
                }}
                className="w-full bg-slate-800 border border-slate-700 text-white text-lg rounded-xl pl-11 pr-4 py-4 focus:ring-2 focus:ring-water-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled>Choose a fish...</option>
                {currentSpeciesList.map((fish, idx) => (
                  <option key={idx} value={fish}>{fish}</option>
                ))}
                <option value="OTHER_CUSTOM">Other (Type manually)...</option>
              </select>
            ) : (
               <input
                type="text"
                value={fishType}
                onChange={(e) => setFishType(e.target.value)}
                placeholder="Enter fish name..."
                autoFocus
                className="w-full bg-slate-800 border border-slate-700 text-white text-lg rounded-xl pl-11 pr-4 py-4 focus:ring-2 focus:ring-water-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
              />
            )}
            
            {!isCustomFish && (
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                 <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                 </svg>
              </div>
            )}
          </div>
          {isCustomFish && (
             <button 
               type="button" 
               onClick={() => { setIsCustomFish(false); setFishType(''); }}
               className="text-xs text-water-400 hover:text-water-300 underline ml-1"
             >
               Back to list
             </button>
          )}
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={!fishType.trim()}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-water-600 to-indigo-600 hover:from-water-500 hover:to-indigo-500 text-white text-lg font-bold py-4 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
          >
            <span>Analyze Conditions</span>
            <ArrowRightIcon className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default StepPreferences;