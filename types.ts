
export interface CurriculumModule {
  subject: string;
  focus: string;
  activities: string[];
}

export interface GrowthMetric {
  name: string;
  value: number; // 0-100
  description: string;
}

export interface CurriculumDesign {
  title: string;
  targetGrade: string;
  narrativeRole: string;
  overview: string;
  modules: CurriculumModule[];
  joyMechanism: {
    title: string;
    description: string;
    learningOutcome: string;
  };
  finalShowcase: {
    format: string;
    description: string;
  };
  assessment: GrowthMetric[];
  imageUrl?: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export type PersonaArchetype = 'Socratic' | 'Enthusiastic' | 'Explorer';

export interface PersonaConfig {
  id: PersonaArchetype;
  name: string;
  icon: string;
  description: string;
  instruction: string;
}
