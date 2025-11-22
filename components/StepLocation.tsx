import React, { useState } from 'react';
import { LocationData } from '../types';
import { LocationIcon, SpinnerIcon } from './Icons';

interface Props {
  onLocationFound: (loc: LocationData) => void;
}

const StepLocation: React.FC<Props> = ({ onLocationFound }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetLocation = () => {
    setLoading(true);
    setError(null);
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLoading(false);
        onLocationFound({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (err) => {
        setLoading(false);
        setError("Unable to retrieve your location. Please check permissions.");
      }
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center animate-fade-in-up">
      <div className="bg-water-900/50 p-6 rounded-full mb-8 border border-water-700 shadow-[0_0_30px_rgba(14,165,233,0.3)]">
        <LocationIcon className="w-16 h-16 text-water-400" />
      </div>
      
      <h2 className="text-3xl font-bold text-white mb-4">Where are you fishing?</h2>
      <p className="text-slate-400 mb-8 max-w-md">
        To provide accurate weather conditions and map data, we need to know your current location.
      </p>

      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-lg mb-6 w-full max-w-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleGetLocation}
        disabled={loading}
        className="group relative flex items-center justify-center gap-3 bg-water-600 hover:bg-water-500 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-water-500/25 disabled:opacity-70 disabled:cursor-not-allowed w-full max-w-xs"
      >
        {loading ? <SpinnerIcon className="w-6 h-6" /> : <LocationIcon className="w-6 h-6" />}
        <span>{loading ? 'Locating...' : 'Use Current Location'}</span>
      </button>
      
      <p className="mt-6 text-xs text-slate-500">
        Google Maps and Search data will be used to enhance results.
      </p>
    </div>
  );
};

export default StepLocation;
