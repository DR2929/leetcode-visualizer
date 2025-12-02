export type UserMode = "beginner" | "intermediate" | "advanced";

export interface Step {
  step: number;
  description: string;
  variables: Record<string, any>;
  image_url?: string;
}

export interface CodeExplanation {
  line: number;
  code: string;
  explanation: string;
}

export interface Complexity {
  time: string;
  space: string;
  reasoning: string;
}

export interface ExplanationData {
  topic: string[];
  pattern: string[];
  algorithm: string;
  intuition: string;
  steps: Step[];
  code_explanation: CodeExplanation[];
  syntax_tips?: string[];
  complexity: Complexity;
  problem_title?: string;
  problem_description?: string;
  constraints?: string;
  code?: string;
}

