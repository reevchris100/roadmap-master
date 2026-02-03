
import { GoogleGenAI, Type } from "@google/genai";
import type { Roadmap } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const roadmapSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "A concise and engaging title for the roadmap. Maximum 50 characters.",
    },
    description: {
      type: Type.STRING,
      description: "A brief, one-paragraph summary of what this roadmap covers.",
    },
    milestones: {
      type: Type.ARRAY,
      description: "A list of milestones to complete the roadmap. Should be between 3 and 7 milestones.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: "The title of the milestone.",
          },
          description: {
            type: Type.STRING,
            description: "A short description of what this milestone entails.",
          },
          resources: {
            type: Type.ARRAY,
            description: "A list of 2-3 learning resources for this milestone.",
            items: {
              type: Type.OBJECT,
              properties: {
                title: {
                  type: Type.STRING,
                  description: "The title of the resource.",
                },
                url: {
                  type: Type.STRING,
                  description: "A placeholder URL for the resource, e.g., 'https://example.com/resource'.",
                },
                type: {
                  type: Type.STRING,
                  enum: ['VIDEO', 'ARTICLE'],
                  description: "The type of the resource.",
                },
              },
              required: ["title", "url", "type"]
            },
          },
        },
        required: ["title", "description", "resources"]
      },
    },
  },
  required: ["title", "description", "milestones"],
};

export const generateRoadmapWithAI = async (topic: string): Promise<Partial<Roadmap> | null> => {
  if (!process.env.API_KEY) {
    throw new Error("API key is not configured. Please set the API_KEY environment variable.");
  }
  
  try {
    const prompt = `Create a detailed learning or project roadmap for the topic: "${topic}". The roadmap should be structured with a clear title, a short description, and a series of milestones. Each milestone must include a title, a description, and a few recommended resources (videos or articles) with placeholder URLs.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: roadmapSchema,
      },
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text) as Partial<Roadmap>;
    }
    return null;
  } catch (error) {
    console.error("Error generating roadmap with AI:", error);
    throw new Error("Failed to generate roadmap. Please try again.");
  }
};
