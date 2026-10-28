# CarryYear - Tamil Nadu Personalized Career & Education Decision Intelligence Platform

CarryYear is a unified, explainable decision-intelligence platform that connects:
**Student Profile → Assessment → Career DNA → Career Recommendations → Education Pathways → College Matching → Scholarship Matching → Financial Feasibility → What-If Simulation → Skill-Gap Analysis → Learning Roadmap → RAG + Groq AI Career Advisor → Continuous Career Profile Evolution.**

Designed with an initial geographical focus on **Tamil Nadu, India**, and architected for scalable nationwide expansion across Indian states.

---

## 🚀 Technology Stack

### Frontend
- **React.js 18+** with **TypeScript**
- **Vite** build tooling
- **Tailwind CSS** with CarryYear Design System (Violet / Lilac / Magenta palette)
- **React Router** for declarative navigation
- **Axios** with centralized interceptors
- **Recharts** for radar charts, cost breakdowns, and skill analytics
- **Lucide React** modern icon system

### Backend
- **Python 3.14 / 3.11+**
- **FastAPI** asynchronous web framework
- **Pydantic v2** validation and settings management
- **SQLAlchemy 2.0** ORM
- **Alembic** schema migrations
- **PostgreSQL** (Docker & Production), with local SQLite development fallback
- **PyJWT & Passlib / Bcrypt** for secure JWT authentication

### AI / NLP / RAG
- **Groq API** (`llama-3.3-70b-versatile` / configurable model)
- **LangChain** prompt & context composition
- **Sentence Transformers** (`all-MiniLM-L6-v2`)
- **FAISS** vector store for semantic similarity search over Tamil Nadu education & career knowledge

### Containerization & Deployment
- **Docker & Docker Compose** (PostgreSQL, FastAPI Backend, React Frontend)
- Render-ready architecture

---

## 📁 Repository Structure

```
carryyear-platform/
├── backend/                  # FastAPI Application
│   ├── alembic/              # Database migration scripts
│   ├── app/
│   │   ├── api/              # API route controllers
│   │   ├── core/             # Configuration & security settings
│   │   ├── db/               # SQLAlchemy engine, models & session
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Domain business logic & matching engines
│   │   ├── repositories/     # Data access layer
│   │   └── utils/            # Helper utilities
│   ├── tests/                # Pytest automated test suite
│   ├── Dockerfile            # Production backend Docker container
│   └── requirements.txt      # Python dependencies
├── frontend/                 # React + TypeScript + Vite Application
│   ├── src/
│   │   ├── components/       # Reusable UI component library
│   │   ├── features/         # Domain modules (assessment, career, colleges, etc.)
│   │   ├── layouts/          # Dashboard & Public layouts
│   │   ├── services/         # Axios API clients
│   │   ├── types/            # TypeScript interfaces
│   │   └── index.css         # CarryYear design system & Tailwind directives
│   ├── Dockerfile            # Multi-stage production frontend Docker container
│   ├── tailwind.config.js    # Design tokens & color system
│   └── package.json          # Node dependencies
├── database/                 # SQL schemas & database seed assets
├── knowledge/                # Structured markdown/JSON knowledge base for RAG
├── docs/                     # Architecture, API & Database documentation
├── docker-compose.yml        # Multi-container orchestration
├── .env.example              # Environment variables template
└── README.md                 # Project guide
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+) & npm
- Python (v3.11+)
- Docker & Docker Compose (optional for containerized setup)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
cp ../.env.example .env
pytest -v
uvicorn app.main:app --reload --port 8000
```
Backend API will be accessible at: `http://localhost:8000`  
Interactive Swagger Docs at: `http://localhost:8000/api/docs`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend Web Application will be accessible at: `http://localhost:5173`

### 3. Docker Deployment
```bash
docker-compose up --build
```
- PostgreSQL: `localhost:5432`
- Backend API: `localhost:8000`
- Frontend: `localhost:5173`

---

## 🛡️ Data Honesty & Explainability Principles
- **No Overclaiming**: Compatibility scores are labeled **Profile Match**, not scientific guarantees or crystal-ball future predictions.
- **Explainable Recommendations**: Every career recommendation details *why* it matched (academic fit, aptitude, interests, skills, budget).
- **Verified Data Sourcing**: Static or demonstration data is transparently flagged when live real-time institutional feeds are not available.
