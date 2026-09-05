from __future__ import annotations

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class SkillLevel(int, Enum):
    """0 = no exposure, 4 = expert. Used for both required and current levels."""

    NONE = 0
    BASIC = 1
    WORKING = 2
    PROFICIENT = 3
    EXPERT = 4


class Domain(str, Enum):
    """The 4 hardcoded competency domains in data/dummy/framework.json."""

    STATISTICAL_METHODS = 'statistical_methods'
    DATA_MANAGEMENT = 'data_management'
    DOMAIN_KNOWLEDGE = 'domain_knowledge'
    DIGITAL_TOOLS = 'digital_tools'


class PastTraining(BaseModel):
    course_name: str
    completed_at: datetime | None = None


class ProfileInput(BaseModel):
    role: str
    dept: str
    education: str
    experience_years: int = Field(ge=0)
    past_trainings: list[PastTraining] = []


class ProfileOutput(BaseModel):
    official_id: str  # UUID string, generated on creation
    profile_stored: bool
    graph_node_added: bool
    initial_levels: dict[Domain, SkillLevel]  # seeded from role + past_trainings


class GapAnalysisInput(BaseModel):
    official_id: str
    role: str


class SkillGap(BaseModel):
    skill: str
    domain: Domain
    required: SkillLevel
    current: SkillLevel
    gap: int = Field(ge=0)  # required.value - current.value, floored at 0


class GapAnalysisOutput(BaseModel):
    official_id: str
    gaps: list[SkillGap]


class FrameworkSkill(BaseModel):
    skill: str
    domain: Domain
    required_by_role: dict[str, SkillLevel]  # role name -> required level


class CompetencyFramework(BaseModel):
    skills: list[FrameworkSkill]


class RecommendationInput(BaseModel):
    gap_skill: str
    gap_size: int = Field(ge=0)


class RecommendedCourse(BaseModel):
    course: str
    course_id: str
    relevance: float = Field(ge=0.0, le=1.0)  # FAISS similarity, then LLM-adjusted
    why: str  # short LLM-generated justification
    duration_hours: int


class RecommendationOutput(BaseModel):
    recommended: list[RecommendedCourse]


class IgotCourse(BaseModel):
    course_id: str
    title: str
    provider: str  # 'iGOT' | 'NSSTA'
    duration_hours: int


class EnrollRequest(BaseModel):
    official_id: str
    course_id: str


class EnrollResponse(BaseModel):
    enrollment_id: str
    status: str  # 'enrolled'


class CompletionStatus(BaseModel):
    enrollment_id: str
    completed: bool
    completed_at: datetime | None = None


class QuizQuestion(BaseModel):
    q: str
    options: list[str] = Field(min_length=4, max_length=4)
    correct: int = Field(ge=0, le=3)  # index into options
    explanation: str


class AssessmentOutput(BaseModel):
    quiz_id: str
    source_filename: str
    questions: list[QuizQuestion]


class GradingInput(BaseModel):
    quiz_id: str
    answers: dict[int, int]  # question index -> chosen option index
    official_id: str | None = None  # optional; when provided the result is persisted to grading_results


class QuestionFeedback(BaseModel):
    q: str
    your_answer: int
    correct: int
    is_correct: bool
    explanation: str


class GradingOutput(BaseModel):
    quiz_id: str
    score: float = Field(ge=0.0, le=100.0)
    feedback: list[QuestionFeedback]


class EmployeeDashboard(BaseModel):
    official_id: str
    gaps: list[SkillGap]  # from System 2
    recommended: list[RecommendedCourse]  # from System 3
    latest_grading: GradingOutput | None  # from System 6


class DomainAggregate(BaseModel):
    domain: Domain
    avg_gap: float
    officials_below_target: int


class AdminDashboard(BaseModel):
    total_officials: int
    domain_aggregates: list[DomainAggregate]
    top_recommended_courses: list[str]  # course titles, ranked by enrollment count
