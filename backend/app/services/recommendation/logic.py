"""Recommendation logic: FAISS semantic search + Gemini LLM re-rank."""
from __future__ import annotations

import json
import pathlib

import faiss
import instructor
import google.generativeai as genai
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

from backend.app.shared.schemas import (
    IgotCourse,
    RecommendedCourse,
    RecommendationInput,
    RecommendationOutput,
)

_COURSES_PATH = pathlib.Path('data/dummy/courses.json')
_EMBED_MODEL_NAME = 'all-MiniLM-L6-v2'
_TOP_K = 5

# Module-level singletons — built once at startup
COURSES: list[IgotCourse] = [
    IgotCourse(**c) for c in json.loads(_COURSES_PATH.read_text())
]
_embed_model: SentenceTransformer = SentenceTransformer(_EMBED_MODEL_NAME)
_faiss_index: faiss.IndexFlatL2 | None = None

_genai_client = instructor.from_gemini(
    client=genai.GenerativeModel('gemini-2.5-flash'),
    mode=instructor.Mode.GEMINI_JSON,
)


class _LLMReRankOutput(BaseModel):
    recommended: list[RecommendedCourse]


def _get_index() -> faiss.IndexFlatL2:
    global _faiss_index
    if _faiss_index is None:
        embeddings = _embed_model.encode(
            [c.title for c in COURSES], convert_to_numpy=True
        ).astype('float32')
        idx = faiss.IndexFlatL2(embeddings.shape[1])
        idx.add(embeddings)
        _faiss_index = idx
    return _faiss_index


def build_index() -> tuple[faiss.IndexFlatL2, list[IgotCourse]]:
    """Public helper used in tests."""
    return _get_index(), COURSES


def semantic_search(
    query: str,
    index: faiss.IndexFlatL2,
    courses: list[IgotCourse],
    top_k: int = _TOP_K,
) -> list[tuple[IgotCourse, float]]:
    """Return top-k courses with relevance scores in [0, 1]."""
    q_vec = _embed_model.encode([query], convert_to_numpy=True).astype('float32')
    distances, indices = index.search(q_vec, top_k)
    return [
        (courses[idx], float(1.0 / (1.0 + dist)))
        for dist, idx in zip(distances[0], indices[0])
    ]


def llm_rerank(
    gap_skill: str,
    gap_size: int,
    candidates: list[tuple[IgotCourse, float]],
) -> RecommendationOutput:
    """Call Gemini via Instructor to re-rank candidates and produce why justifications."""
    candidate_text = '\n'.join(
        f'- [{c.course_id}] "{c.title}" ({c.provider}, {c.duration_hours}h) — FAISS score: {score:.3f}'
        for c, score in candidates
    )
    prompt = (
        f'A government official has a skill gap in "{gap_skill}" (gap size: {gap_size}/4).\n'
        f'Rank these courses from most to least relevant and write a one-sentence justification:\n\n'
        f'{candidate_text}\n\n'
        f'Return relevance score (0.0–1.0) and a concise "why" for each course.'
    )
    result = _genai_client.chat.completions.create(
        messages=[{'role': 'user', 'content': prompt}],
        response_model=_LLMReRankOutput,
    )
    return RecommendationOutput(recommended=result.recommended)


def recommend(req: RecommendationInput) -> RecommendationOutput:
    """Full pipeline: FAISS search → LLM re-rank → RecommendationOutput."""
    index = _get_index()
    candidates = semantic_search(req.gap_skill, index, COURSES, top_k=_TOP_K)
    return llm_rerank(req.gap_skill, req.gap_size, candidates)
