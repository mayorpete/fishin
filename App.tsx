import React, { useState, useCallback } from 'react';
import { AppStep, LocationData, UserPreferences, RecommendationResult, LocalSpecies } from './types';
import StepLocation from './components/StepLocation';
import StepPreferences from './components/StepPreferences';
import ResultsView from './components/ResultsView';
import { getFishingRecommendation, getLocalSpecies } from './services/geminiService';
import { FishIcon } from './components/Icons';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.LOCATION);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [localSpecies, setLocalSpecies] = useState<LocalSpecies | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("Thinking...");

  const handleLocationFound = useCallback(async (loc: LocationData) => {
    setLocation(loc);
    
    // Intermediate loading step to fetch fish
    setStep(AppStep.LOADING);
    setLoadingMessage("Identifying local fish species...");
    
    try {
      const species = await getLocalSpecies(loc);
      setLocalSpecies(species);
      setStep(AppStep.PREFERENCES);
    } catch (err) {
      console.error("Failed to load species", err);
      // Fallback to prefs anyway, UI will handle null species
      setStep(AppStep.PREFERENCES);
    }
  }, []);

  const handlePreferencesSubmit = useCallback(async (prefs: UserPreferences) => {
    if (!location) return;

    setStep(AppStep.LOADING);
    setLoadingMessage("Analyzing weather & water conditions...");
    
    try {
      const data = await getFishingRecommendation(location, prefs);
      setResult(data);
      setStep(AppStep.RESULTS);
    } catch (error) {
      console.error("Failed to get recommendations", error);
      setStep(AppStep.ERROR);
    }
  }, [location]);

  const handleReset = () => {
    // Full reset
    setStep(AppStep.LOCATION);
    setLocation(null);
    setResult(null);
    setLocalSpecies(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-slate-100 flex flex-col font-sans selection:bg-water-500 selection:text-white">
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-water-600/10 rounded-full blur-3xl -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl translate-y-1/3"></div>
      </div>

      <main className="flex-grow flex flex-col relative z-10 w-full">
        {step === AppStep.LOCATION && (
          <StepLocation onLocationFound={handleLocationFound} />
        )}

        {step === AppStep.PREFERENCES && (
          <div className="flex-grow flex flex-col items-center justify-center">
             <StepPreferences 
                localSpecies={localSpecies} 
                onSubmit={handlePreferencesSubmit} 
             />
          </div>
        )}

        {step === AppStep.LOADING && (
          <div className="flex-grow flex flex-col items-center justify-center text-center p-6 animate-fade-in">
             <div className="w-16 h-16 mb-6 relative">
                 <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                 <div className="absolute inset-0 border-4 border-water-500 border-t-transparent rounded-full animate-spin"></div>
             </div>
             <h2 className="text-2xl font-bold text-white mb-2">{loadingMessage}</h2>
             <p className="text-slate-400 max-w-sm flex items-center justify-center gap-2">
               <FishIcon className="w-4 h-4 animate-bounce" />
               Please wait...
             </p>
          </div>
        )}

        {step === AppStep.RESULTS && result && (
          <div className="py-8 px-4">
             <ResultsView result={result} onReset={handleReset} />
          </div>
        )}

        {step === AppStep.ERROR && (
           <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
             <div className="bg-red-500/10 p-6 rounded-2xl border border-red-500/20 max-w-md">
               <h2 className="text-xl font-bold text-red-400 mb-2">Something went wrong</h2>
               <p className="text-slate-300 mb-6">
                 We couldn't generate the fishing report. This might be due to an API connectivity issue or limits.
               </p>
               <button 
                 onClick={() => setStep(AppStep.PREFERENCES)}
                 className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg transition-colors"
               >
                 Try Again
               </button>
             </div>
           </div>
        )}
      </main>

      <footer className="py-6 text-center text-slate-600 text-xs relative z-10">
        <p>&copy; {new Date().getFullYear()} AnglerAI. Powered by Google Gemini.</p>
      </footer>
    </div>
  );
};

export default App;