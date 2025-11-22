export type WaterType = 'freshwater' | 'saltwater';

export interface LocationData {
  latitude: number;
  longitude: number;
  label?: string; // Optional manual label
}

export interface UserPreferences {
  waterType: WaterType;
  fishType: string;
}

export interface LocalSpecies {
  freshwater: string[];
  saltwater: string[];
}

// Gemini Grounding Types
export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  // Maps removed from core requirement but type kept for compatibility if needed, 
  // though we will likely receive fewer/no map chunks now.
  maps?: {
    placeId: string;
    uri: string;
    title: string;
    placeAnswerSources?: {
        reviewSnippets?: {
            content: string;
        }[];
    };
  };
}

export interface RecommendationResult {
  markdown: string;
  groundingChunks: GroundingChunk[];
}

export enum AppStep {
  LOCATION = 'LOCATION',
  PREFERENCES = 'PREFERENCES',
  LOADING = 'LOADING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR'
}