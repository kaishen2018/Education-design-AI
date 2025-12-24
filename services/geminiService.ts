
import { GoogleGenAI, Type } from "@google/genai";
import { CurriculumDesign, PersonaArchetype } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

const CURRICULUM_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    targetGrade: { type: Type.STRING },
    narrativeRole: { type: Type.STRING },
    overview: { type: Type.STRING },
    modules: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          subject: { type: Type.STRING },
          focus: { type: Type.STRING },
          activities: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["subject", "focus", "activities"]
      }
    },
    joyMechanism: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        learningOutcome: { type: Type.STRING },
      },
      required: ["title", "description", "learningOutcome"]
    },
    finalShowcase: {
      type: Type.OBJECT,
      properties: {
        format: { type: Type.STRING },
        description: { type: Type.STRING },
      },
      required: ["format", "description"]
    },
    assessment: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          value: { type: Type.NUMBER },
          description: { type: Type.STRING },
        },
        required: ["name", "value", "description"]
      }
    }
  },
  required: ["title", "targetGrade", "narrativeRole", "overview", "modules", "joyMechanism", "finalShowcase", "assessment"]
};

export const generateCurriculum = async (prompt: string): Promise<CurriculumDesign> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Act as an expert educational designer specializing in PBL, STEAM, and Finnish Phenomenon-based Learning. 
    Design a future-oriented curriculum based on the following request. 
    Focus on cross-disciplinary integration, reducing academic burden through play, and non-score based assessment.
    
    Request: ${prompt}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: CURRICULUM_SCHEMA,
    },
  });

  const design = JSON.parse(response.text) as CurriculumDesign;

  // Generate an accompanying illustration
  try {
    const imgResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A high-quality, concept art illustration of this educational theme: ${design.title}. Style: Bright, futuristic, inspirational, child-friendly 3D render.` }]
      },
      config: {
        imageConfig: { aspectRatio: "16:9" }
      }
    });

    for (const part of imgResponse.candidates[0].content.parts) {
      if (part.inlineData) {
        design.imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }
  } catch (err) {
    console.error("Image generation failed", err);
  }

  return design;
};

const PERSONA_INSTRUCTIONS: Record<PersonaArchetype, string> = {
  Socratic: "You are a Socratic Guide. Never give direct answers. Instead, ask probing questions that lead the student to discover the answer themselves. Be patient and intellectually challenging.",
  Enthusiastic: "You are an Enthusiastic Mentor. Be incredibly positive, energetic, and full of praise! Use lots of exclamation marks, emojis, and celebrate every small idea the student has.",
  Explorer: "You are a Curious Explorer. Act as a fellow learner who is just as amazed by the world as the student. Use phrases like 'I wonder...', 'What if...', and 'Let's imagine...'. Be an equal partner in discovery."
};

export const chatWithLesson = async (history: any[], newMessage: string, lessonContext: string, persona: PersonaArchetype) => {
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are an AI learning assistant integrated into a lesson. 
      The current lesson context is: ${lessonContext}. 
      ${PERSONA_INSTRUCTIONS[persona]}
      Target audience: Elementary school students.
      Keep your responses concise, engaging, and age-appropriate.`
    },
  });

  const result = await chat.sendMessage({ message: newMessage });
  return result.text;
};
