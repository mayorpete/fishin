import { GoogleGenAI, Type } from "@google/genai";
import { LocationData, UserPreferences, RecommendationResult, LocalSpecies } from "../types";

// Helper to ensure API key exists
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const getLocalSpecies = async (location: LocationData): Promise<LocalSpecies> => {
  const ai = getClient();
  const prompt = `
    Identify the top 5 most popular sport fishing species for fresh water and salt water 
    near Latitude: ${location.latitude}, Longitude: ${location.longitude}.
    Return the results in a strictly formatted JSON object with keys "freshwater" and "saltwater".
    Each key should be an array of strings (species names).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            freshwater: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            saltwater: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["freshwater", "saltwater"]
        }
      }
    });
    
    const text = response.text || "{}";
    return JSON.parse(text) as LocalSpecies;
  } catch (error) {
    console.error("Error fetching species:", error);
    // Fallback if API fails
    return {
      freshwater: ["Bass", "Trout", "Catfish", "Panfish", "Pike"],
      saltwater: ["Redfish", "Snook", "Tuna", "Snapper", "Flounder"]
    };
  }
};

export const getFishingRecommendation = async (
  location: LocationData,
  prefs: UserPreferences
): Promise<RecommendationResult> => {
  const ai = getClient();
  
  // Construct a detailed prompt for the fishing expert persona
  const prompt = `
    You are an expert fishing guide with deep knowledge of advanced techniques.
    
    User Context:
    - Location: Latitude ${location.latitude}, Longitude ${location.longitude}
    - Target Water: ${prefs.waterType}
    - Target Species: ${prefs.fishType}

    Task:
    1. Use Google Search to find the current live weather, wind, time, and water conditions for this location.
    2. Based on these SPECIFIC conditions (e.g., is it overcast? is the pressure dropping? water clarity?), provide 3 distinct rig setups.
    3. CRITICAL: Think deeply about the optimal presentation. Do not just default to basic rigs. Consider advanced or niche techniques (e.g., Neko rig, Wacky rig, Drop shot, Ned rig, Tokyo rig, Carolina rig, specific fly patterns) if they are scientifically more likely to produce strikes in the current specific weather/water conditions. Explain WHY this specific rig works for these current conditions in your thinking, then output the result.
    
    Output Format (Markdown):
    
    # Conditions
    * **Time:** [Local Time]
    * **Weather:** [Brief Condition]
    * **Temp:** [Air Temp]
    * **Wind:** [Speed & Direction]
    * **Pressure:** [Barometric Pressure, e.g. 30.12 inHg]
    
    # Recommended Rigs
    
    ## 1. [Rig Name]
    * **Hook:** [Size & Type]
    * **Components:** [Weight, Leader, Line details]
    * **Bait/Lure:** [Specific color, size, type]
    * **Retrieve:** [Optimal retrieve method]
    
    ## 2. [Rig Name]
    * **Hook:** [Size & Type]
    * **Components:** [Weight, Leader, Line details]
    * **Bait/Lure:** [Specific color, size, type]
    * **Retrieve:** [Optimal retrieve method]

    ## 3. [Rig Name]
    * **Hook:** [Size & Type]
    * **Components:** [Weight, Leader, Line details]
    * **Bait/Lure:** [Specific color, size, type]
    * **Retrieve:** [Optimal retrieve method]

    Keep the descriptions concise and professional. Do not identify specific bodies of water or map locations.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        tools: [
          { googleSearch: {} }
        ],
        thinkingConfig: {
          thinkingBudget: 32768
        }
      },
    });

    const candidate = response.candidates?.[0];
    const text = candidate?.content?.parts?.map(p => p.text).join('') || "No advice generated.";
    
    // Extract grounding chunks (Search URLs)
    const groundingChunks = candidate?.groundingMetadata?.groundingChunks || [];

    return {
      markdown: text,
      groundingChunks: groundingChunks as any[] 
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};