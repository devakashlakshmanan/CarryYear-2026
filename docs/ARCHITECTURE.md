# CarryYear System Architecture

## Overview
CarryYear is architected as an explainable decision-intelligence platform specifically optimized for career and higher education pathways in Tamil Nadu, with extensible state-agnostic abstraction layers.

## High-Level Diagram

```
+-------------------------------------------------------------+
|                      React + TypeScript                      |
|                Vite + Tailwind CSS + Recharts               |
+------------------------------+------------------------------+
                               | REST APIs / JSON
                               v
+-------------------------------------------------------------+
|                     FastAPI Backend Layer                    |
|   +-----------------------+     +-----------------------+   |
|   | Authentication & JWT  |     | Assessment & DNA      |   |
|   +-----------------------+     +-----------------------+   |
|   | Recommendation Engine |     | What-If Simulator     |   |
|   +-----------------------+     +-----------------------+   |
|   | College & Scholarship |     | Financial Feasibility |   |
|   +-----------------------+     +-----------------------+   |
|   | Skill-Gap & Roadmap   |     | RAG + Groq AI Advisor |   |
|   +-----------------------+     +-----------------------+   |
+------------------------------+------------------------------+
                               |
               +---------------+---------------+
               |                               |
               v                               v
+-----------------------------+ +-----------------------------+
|     PostgreSQL Database     | |    FAISS + Groq Pipeline    |
|   - Student Profiles        | |   - Career Documents        |
|   - Assessment Responses    | |   - TN College Knowledge    |
|   - TN Colleges & Courses   | |   - Scholarship Schemas     |
|   - Scholarships & Exams    | |   - Sentence Transformers   |
|   - Roadmaps & Progress     | |   - Groq Llama-3.3-70b      |
+-----------------------------+ +-----------------------------+
```

## Layer Responsibilities

1. **Presentation Layer (Frontend)**:
   - React 18 with TypeScript for type safety.
   - Tailwind CSS for curated, responsive UI styling using violet/lilac/accent palette.
   - Recharts for radar chart Career DNA and financial breakdown charts.
   - Axios client with JWT interceptors.

2. **Application Layer (FastAPI Backend)**:
   - Structured route handlers (`api/routes/`).
   - Domain services (`services/`) encapsulating business logic.
   - Deterministic multi-factor scoring recommendation engine.
   - What-If simulation service for recalculating feasibility dynamically.
   - Profile-aware Groq AI service with prompt guardrails against hallucinations.

3. **Data Layer**:
   - PostgreSQL with SQLAlchemy 2.0 ORM.
   - Alembic migrations for continuous schema evolution.
   - Relational integrity with foreign keys, compound indexes, and audit timestamps.

4. **Intelligence Layer (RAG & NLP)**:
   - Sentence-transformers for dense semantic embeddings.
   - FAISS vector database for indexed retrieval of Tamil Nadu college and career facts.
   - Groq Llama 3.3 for synthesizing retrieved facts with personal student profile context.
