import pytest
from unittest.mock import patch
from backend.app.shared.schemas import RecommendationInput, RecommendationOutput, RecommendedCourse, IgotCourse
from backend.app.services.recommendation.logic import recommend, build_index, semantic_search, llm_rerank, COURSES


def test_build_index_returns_index_and_courses():
    index, courses = build_index()
    assert index.ntotal == len(COURSES)
    assert len(courses) >= 10
    assert index.ntotal >= 10

def test_semantic_search_returns_top_k():
    index, courses = build_index()
    results = semantic_search('python data analysis', index, courses, top_k=3)
    assert len(results) == 3
    for course, score in results:
        assert 0.0 <= score <= 1.0
        assert isinstance(course, IgotCourse)

def test_semantic_search_top_result_is_relevant():
    index, courses = build_index()
    results = semantic_search('python programming', index, courses, top_k=5)
    top_titles = [c.title for c, _ in results]
    assert any('Python' in t or 'python' in t.lower() for t in top_titles)

def test_llm_rerank_structure(monkeypatch):
    """Mock the LLM call; verify llm_rerank returns correct shape."""
    candidates = [
        (IgotCourse(course_id='c1', title='Python for Data Analysis', provider='iGOT', duration_hours=10), 0.85),
        (IgotCourse(course_id='c2', title='Applied Statistics', provider='NSSTA', duration_hours=20), 0.70),
    ]
    mock_output = RecommendationOutput(recommended=[
        RecommendedCourse(course='Python for Data Analysis', course_id='c1', relevance=0.92,
                          why='Directly teaches Python data skills.'),
        RecommendedCourse(course='Applied Statistics', course_id='c2', relevance=0.75,
                          why='Covers statistical foundations.'),
    ])
    with patch('backend.app.services.recommendation.logic._genai_client') as mock_client:
        mock_client.chat.completions.create.return_value = mock_output
        result = llm_rerank('python programming', 2, candidates)
    assert len(result.recommended) == 2
    assert result.recommended[0].relevance == 0.92
    assert len(result.recommended[0].why) > 10

def test_recommend_returns_recommendation_output(monkeypatch):
    """Full pipeline test — mocks the LLM, tests FAISS+routing end-to-end."""
    mock_output = RecommendationOutput(recommended=[
        RecommendedCourse(course='Python for Data Analysis', course_id='course-igot-101',
                          relevance=0.91, why='Directly relevant to python gap.'),
    ])
    with patch('backend.app.services.recommendation.logic.llm_rerank', return_value=mock_output):
        result = recommend(RecommendationInput(gap_skill='python programming', gap_size=2))
    assert isinstance(result, RecommendationOutput)
    assert len(result.recommended) >= 1
