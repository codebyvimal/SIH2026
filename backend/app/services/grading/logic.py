import json
from pathlib import Path

from backend.app.shared.schemas import (
    AssessmentOutput,
    GradingInput,
    GradingOutput,
    QuestionFeedback,
)

QUIZZES_FILE = Path("data/dummy/quizzes.json")


def _load_quizzes() -> dict[str, AssessmentOutput]:
    with open(QUIZZES_FILE, "r") as f:
        data = json.load(f)
    return {quiz["quiz_id"]: AssessmentOutput(**quiz) for quiz in data}


def grade_quiz(input_data: GradingInput) -> GradingOutput:
    quizzes = _load_quizzes()
    quiz = quizzes.get(input_data.quiz_id)
    if not quiz:
        raise ValueError("Quiz not found")

    feedback_list = []
    correct_count = 0
    total_questions = len(quiz.questions)

    if total_questions == 0:
        return GradingOutput(quiz_id=input_data.quiz_id, score=0.0, feedback=[])

    for i, question in enumerate(quiz.questions):
        # Answers is a dict of int -> int, but when parsed from JSON, the keys might be ints.
        # Wait, Pydantic should convert string dict keys to ints if the type is dict[int, int].
        user_answer = input_data.answers.get(i)

        is_correct = False
        if user_answer is not None and user_answer == question.correct:
            is_correct = True
            correct_count += 1

        feedback = QuestionFeedback(
            q=question.q,
            your_answer=user_answer
            if user_answer is not None
            else -1,  # Using -1 if unanswered
            correct=question.correct,
            is_correct=is_correct,
            explanation=question.explanation,
        )
        feedback_list.append(feedback)

    # Check for invalid question indices in the input
    for q_idx in input_data.answers:
        if q_idx < 0 or q_idx >= total_questions:
            raise KeyError(f"Invalid question index: {q_idx}")

    score = (correct_count / total_questions) * 100.0

    return GradingOutput(
        quiz_id=input_data.quiz_id, score=score, feedback=feedback_list
    )
