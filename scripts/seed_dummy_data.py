import json
import os
import sys
from datetime import datetime
from uuid import uuid4

# Add the project root to the python path so we can import the schemas
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app.shared.schemas import (
    SkillLevel, Domain, PastTraining, ProfileInput, ProfileOutput,
    GapAnalysisInput, SkillGap, GapAnalysisOutput,
    FrameworkSkill, CompetencyFramework,
    RecommendationInput, RecommendedCourse, RecommendationOutput,
    IgotCourse, EnrollRequest, EnrollResponse, CompletionStatus,
    QuizQuestion, AssessmentOutput, GradingInput, QuestionFeedback, GradingOutput,
    EmployeeDashboard, DomainAggregate, AdminDashboard
)

# Set deterministic UUIDs/IDs for tests
OFFICIAL_ID = "123e4567-e89b-12d3-a456-426614174000"
COURSE_ID = "course-igot-101"
QUIZ_ID = "quiz-stats-01"

def write_json(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        json.dump(data, f, indent=2)

def seed_data():
    # 1. framework.json
    framework = CompetencyFramework(
        skills=[
            FrameworkSkill(
                skill="Python for Data Analysis",
                domain=Domain.DIGITAL_TOOLS,
                required_by_role={"Data Scientist": SkillLevel.EXPERT, "Analyst": SkillLevel.PROFICIENT}
            ),
            FrameworkSkill(
                skill="Statistical Inference",
                domain=Domain.STATISTICAL_METHODS,
                required_by_role={"Data Scientist": SkillLevel.EXPERT, "Analyst": SkillLevel.WORKING}
            )
        ]
    )
    write_json("data/dummy/framework.json", framework.model_dump(mode='json'))

    # 2. profiles.json
    profiles = [
        {
            "official_id": OFFICIAL_ID,
            **ProfileInput(
                role="Analyst",
                dept="Statistics",
                education="M.Sc. Statistics",
                experience_years=3,
                past_trainings=[PastTraining(course_name="Basic Python", completed_at=datetime.utcnow())]
            ).model_dump(mode='json')
        }
    ]
    write_json("data/dummy/profiles.json", profiles)

    # 3. courses.json
    courses = [
        IgotCourse(course_id=COURSE_ID, title="Advanced Python Analytics", provider="iGOT", duration_hours=10).model_dump(mode='json'),
        IgotCourse(course_id="course-nssta-01", title="Applied Statistics", provider="NSSTA", duration_hours=20).model_dump(mode='json')
    ]
    write_json("data/dummy/courses.json", courses)

    # 4. quizzes.json
    quizzes = [
        AssessmentOutput(
            quiz_id=QUIZ_ID,
            source_filename="sample_stats.pdf",
            questions=[
                QuizQuestion(
                    q="What is a p-value?",
                    options=["Probability of null given data", "Probability of data given null", "A test statistic", "Power of the test"],
                    correct=1,
                    explanation="A p-value is the probability of observing data as extreme as yours, assuming the null hypothesis is true."
                )
            ]
        ).model_dump(mode='json')
    ]
    write_json("data/dummy/quizzes.json", quizzes)

    # 5. employee_dashboard.json
    employee_dash = EmployeeDashboard(
        official_id=OFFICIAL_ID,
        gaps=[
            SkillGap(
                skill="Python for Data Analysis",
                domain=Domain.DIGITAL_TOOLS,
                required=SkillLevel.PROFICIENT,
                current=SkillLevel.BASIC,
                gap=2
            )
        ],
        recommended=[
            RecommendedCourse(course="Advanced Python Analytics", course_id=COURSE_ID, relevance=0.95, why="Directly addresses your gap in Python.")
        ],
        latest_grading=GradingOutput(
            quiz_id=QUIZ_ID,
            score=100.0,
            feedback=[
                QuestionFeedback(
                    q="What is a p-value?",
                    your_answer=1,
                    correct=1,
                    is_correct=True,
                    explanation="Correct!"
                )
            ]
        )
    )
    write_json("frontend/mock_data/employee_dashboard.json", employee_dash.model_dump(mode='json'))

    # 6. admin_dashboard.json
    admin_dash = AdminDashboard(
        total_officials=500,
        domain_aggregates=[
            DomainAggregate(domain=Domain.DIGITAL_TOOLS, avg_gap=1.2, officials_below_target=150),
            DomainAggregate(domain=Domain.STATISTICAL_METHODS, avg_gap=0.5, officials_below_target=50)
        ],
        top_recommended_courses=["Advanced Python Analytics", "Applied Statistics"]
    )
    write_json("frontend/mock_data/admin_dashboard.json", admin_dash.model_dump(mode='json'))

    print("Dummy data seeded successfully.")

if __name__ == "__main__":
    seed_data()
