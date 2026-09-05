export enum SkillLevel {
  NONE = 0,
  BASIC = 1,
  WORKING = 2,
  PROFICIENT = 3,
  EXPERT = 4
}

export enum Domain {
  STATISTICAL_METHODS = 'statistical_methods',
  DATA_MANAGEMENT = 'data_management',
  DOMAIN_KNOWLEDGE = 'domain_knowledge',
  DIGITAL_TOOLS = 'digital_tools'
}

export interface PastTraining {
  course_name: string;
  completed_at?: string | null;
}

export interface ProfileInput {
  role: string;
  dept: string;
  education: string;
  experience_years: number;
  past_trainings: PastTraining[];
}

export interface ProfileOutput {
  official_id: string;
  profile_stored: boolean;
  graph_node_added: boolean;
  initial_levels: Record<Domain, SkillLevel>;
}

export interface GapAnalysisInput {
  official_id: string;
  role: string;
}

export interface SkillGap {
  skill: string;
  domain: Domain;
  required: SkillLevel;
  current: SkillLevel;
  gap: number;
}

export interface GapAnalysisOutput {
  official_id: string;
  gaps: SkillGap[];
}

export interface FrameworkSkill {
  skill: string;
  domain: Domain;
  required_by_role: Record<string, SkillLevel>;
}

export interface CompetencyFramework {
  skills: FrameworkSkill[];
}

export interface RecommendationInput {
  gap_skill: string;
  gap_size: number;
}

export interface RecommendedCourse {
  course: string;
  course_id: string;
  relevance: number;
  why: string;
  duration_hours: number;
}

export interface RecommendationOutput {
  recommended: RecommendedCourse[];
}

export interface IgotCourse {
  course_id: string;
  title: string;
  provider: string;
  duration_hours: number;
}

export interface EnrollRequest {
  official_id: string;
  course_id: string;
}

export interface EnrollResponse {
  enrollment_id: string;
  status: string;
}

export interface CompletionStatus {
  enrollment_id: string;
  completed: boolean;
  completed_at?: string | null;
}

export interface QuizQuestion {
  q: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface AssessmentOutput {
  quiz_id: string;
  source_filename: string;
  questions: QuizQuestion[];
}

export interface GradingInput {
  quiz_id: string;
  answers: Record<number, number>;
}

export interface QuestionFeedback {
  q: string;
  your_answer: number;
  correct: number;
  is_correct: boolean;
  explanation: string;
}

export interface GradingOutput {
  quiz_id: string;
  score: number;
  feedback: QuestionFeedback[];
}

export interface EmployeeDashboard {
  official_id: string;
  gaps: SkillGap[];
  recommended: RecommendedCourse[];
  latest_grading?: GradingOutput | null;
}

export interface DomainAggregate {
  domain: Domain;
  avg_gap: number;
  officials_below_target: number;
}

export interface AdminDashboard {
  total_officials: number;
  domain_aggregates: DomainAggregate[];
  top_recommended_courses: string[];
}
