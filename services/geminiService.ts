import { GoogleGenAI, Type } from '@google/genai';

export interface ActivitySuggestion {
  title: string;
  description:string;
}

export const suggestActivity = async (): Promise<ActivitySuggestion | null> => {
  if (!process.env.API_KEY) {
    console.error('API_KEY is not set for Gemini.');
    alert("La clé API Gemini n'est pas configurée. Impossible d'obtenir des suggestions.");
    return null;
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Suggère une activité de week-end amusante et originale pour un groupe d'étudiants à Paris. Fournis un titre et une courte description.",
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "Le nom de l'activité.",
            },
            description: {
              type: Type.STRING,
              description: "Une courte description de l'activité.",
            },
          },
          required: ['title', 'description'],
        },
      },
    });

    const jsonText = response.text.trim();
    const suggestion = JSON.parse(jsonText) as ActivitySuggestion;
    return suggestion;
  } catch (error) {
    console.error('Erreur lors de la suggestion d\'activité:', error);
    alert("Une erreur est survenue lors de la communication avec l'IA. Veuillez réessayer.");
    return null;
  }
};
