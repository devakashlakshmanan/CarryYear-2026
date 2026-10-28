# CarryYear REST API Reference

All requests and responses use JSON. Standard responses conform to the following schema:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful.",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Descriptive error message.",
  "error_code": "HTTP_400"
}
```

---

## Authentication Endpoints

### 1. Register User
- **Method:** `POST`
- **Path:** `/api/auth/register`
- **Request Body:**
```json
{
  "name": "Priya Dharshini",
  "email": "priya@example.com",
  "password": "SecurePassword123!"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful.",
  "data": {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "name": "Priya Dharshini",
      "email": "priya@example.com",
      "is_active": true,
      "is_admin": false,
      "onboarding_completed": false,
      "created_at": "2026-09-29T17:00:00Z",
      "updated_at": "2026-09-29T17:00:00Z"
    }
  }
}
```

### 2. Login User
- **Method:** `POST`
- **Path:** `/api/auth/login`
- **Request Body:**
```json
{
  "email": "priya@example.com",
  "password": "SecurePassword123!"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": { ... }
  }
}
```

### 3. Get Current User Profile
- **Method:** `GET`
- **Path:** `/api/auth/me`
- **Headers:** `Authorization: Bearer <access_token>`
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully.",
  "data": {
    "id": 1,
    "name": "Priya Dharshini",
    "email": "priya@example.com",
    "is_active": true,
    "is_admin": false,
    "onboarding_completed": false,
    "created_at": "2026-09-29T17:00:00Z",
    "updated_at": "2026-09-29T17:00:00Z"
  }
}
```

---

## Student Profile & Onboarding Endpoints

### 1. Get Student Profile
- **Method:** `GET`
- **Path:** `/api/profile`
- **Headers:** `Authorization: Bearer <access_token>`
- **Response (200 OK):** Returns current user's profile with all 7 onboarding steps.

### 2. Update Student Profile
- **Method:** `PUT`
- **Path:** `/api/profile`
- **Headers:** `Authorization: Bearer <access_token>`
- **Request Body:**
```json
{
  "age": 18,
  "gender": "Female",
  "state": "Tamil Nadu",
  "district": "Coimbatore",
  "city": "Coimbatore",
  "current_education_level": "Class 12",
  "school_or_college": "Stanes Higher Secondary School",
  "board_or_university": "Tamil Nadu State Board",
  "stream": "Computer Science & Maths",
  "percentage_or_cgpa": 94.2,
  "subject_marks": {
    "Mathematics": 98,
    "Physics": 94,
    "Chemistry": 90,
    "Computer Science": 99
  },
  "interests": ["Technology", "Artificial Intelligence", "Engineering"],
  "skills": [
    { "name": "Python", "level": 80 },
    { "name": "Problem Solving", "level": 85 }
  ],
  "preferred_locations": ["Coimbatore", "Chennai"],
  "preferred_career_areas": ["Data Science", "AI Engineering"],
  "govt_or_private": "Any",
  "higher_studies_preference": "B.Tech AI & DS",
  "study_mode": "Full-time",
  "college_type": "Government Aided",
  "annual_family_income": "2.5 - 5 Lakhs",
  "max_education_budget": 140000,
  "need_scholarship": true,
  "hostel_required": true,
  "short_term_goal": "Secure admission in top Tamil Nadu engineering college for AI/DS",
  "long_term_goal": "Lead AI engineering teams in innovative healthcare or tech startups",
  "target_career": "Data Scientist",
  "higher_study_interest": true,
  "onboarding_completed": true
}
```
- **Response (200 OK):** Returns updated `StudentProfileData` object.

---

## Assessment Endpoints

### 1. Get Assessment Questions
- **Method:** `GET`
- **Path:** `/api/assessment/questions`
- **Query Parameters:** `question_type` (optional, `"aptitude"` or `"interest"`)
- **Response (200 OK):**
```json
{
  "success": true,
  "count": 20,
  "data": [
    {
      "id": 1,
      "category": "Logical Reasoning",
      "question_type": "aptitude",
      "question_text": "If all Algorithms are Procedures...",
      "options": ["All Algorithms are Automated", "..."],
      "interest_dimension": null,
      "scoring_weight": 1.0
    }
  ]
}
```

### 2. Submit Assessment Answers
- **Method:** `POST`
- **Path:** `/api/assessment/submit`
- **Headers:** `Authorization: Bearer <access_token>`
- **Request Body:**
```json
{
  "answers": [
    { "question_id": 1, "selected_option_index": 1 },
    { "question_id": 13, "selected_option_index": 4 }
  ]
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Assessment completed and scores calculated successfully",
  "data": {
    "attempt_id": 1,
    "total_score": 82.5,
    "completed": true,
    "created_at": "2026-09-29T17:15:00Z",
    "dimension_scores": [
      { "dimension": "Logical Reasoning", "category_type": "aptitude", "normalized_score": 100.0 },
      { "dimension": "Technology", "category_type": "interest", "normalized_score": 100.0 }
    ],
    "aptitude_average": 85.0,
    "top_interests": ["Technology", "Science"],
    "summary": "You demonstrated strong aptitude in Logical Reasoning (average aptitude 85.0%) with pronounced interest indicators in Technology, Science."
  }
}
```

### 3. Get Latest Assessment Results
- **Method:** `GET`
- **Path:** `/api/assessment/latest`
- **Headers:** `Authorization: Bearer <access_token>`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "attempt_id": 1,
    "total_score": 82.5,
    "completed": true,
    "dimension_scores": [ ... ],
    "aptitude_average": 85.0,
    "top_interests": ["Technology", "Science"],
    "summary": "Your latest assessment highlights notable strength in Logical Reasoning coupled with peak engagement in Technology, Science."
  }
}
```

---

## Career DNA Endpoints

### 1. Get Student Career DNA
- **Method:** `GET`
- **Path:** `/api/career-dna`
- **Headers:** `Authorization: Bearer <access_token>`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "dominant_cluster": "Data Intelligence, Artificial Intelligence & Software Systems",
    "confidence_score": 100.0,
    "traits": [
      {
        "name": "Analytical Thinking",
        "score": 92.4,
        "rating": "Advanced",
        "description": "Capacity to dissect complex structures, evaluate quantitative evidence, and derive rigorous logical conclusions."
      },
      {
        "name": "Technology Orientation",
        "score": 94.8,
        "rating": "Advanced",
        "description": "Affinity for digital computing systems, algorithm development, modern tooling, and technical problem spaces."
      }
    ],
    "why_this_profile": "Your prominent scores in Technology Orientation (94.8%) and Analytical Thinking (92.4%)...",
    "explanatory_factors": [
      {
        "source": "Academic Performance",
        "factor": "Recorded 94.5% in Class 12, with Mathematics at 98.0%.",
        "impact": "Contributes 35% weight to Analytical Thinking...",
        "weight": "High"
      }
    ],
    "version": 1,
    "created_at": "2026-09-29T17:25:00Z",
    "updated_at": "2026-09-29T17:25:00Z"
  }
}
```

### 2. Synthesize / Regenerate Career DNA
- **Method:** `POST`
- **Path:** `/api/career-dna/generate`
- **Headers:** `Authorization: Bearer <access_token>`
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Career DNA synthesized successfully.",
  "data": { ... }
}
```

---

## Careers & Pathways Endpoints

### 1. List & Search Careers
- **Method:** `GET`
- **Path:** `/api/careers`
- **Query Parameters:** `search`, `industry`, `cluster`, `skip`, `limit`
- **Response (200 OK):**
```json
{
  "success": true,
  "count": 14,
  "data": [
    {
      "id": 1,
      "title": "Data Scientist",
      "slug": "data-scientist",
      "cluster": "Data Intelligence, Artificial Intelligence & Software Systems",
      "industry": "Information Technology & AI",
      "short_description": "Designs predictive machine learning models...",
      "typical_pathway": "Class 12 (PCM/CS) -> TNEA -> B.Tech AI & DS -> Data Scientist",
      "entry_education_level": "Bachelor's Degree",
      "salary_range_min": 650000.0,
      "salary_range_max": 1800000.0,
      "growth_rate": "Very High (32% annual expansion)",
      "tamil_nadu_demand": "High Demand across Chennai OMR IT Corridor, Coimbatore TIDEL Park",
      "work_environment": "Hybrid / Collaborative Tech Innovation Hubs",
      "key_skills": ["Python", "SQL & Relational Databases", "Machine Learning"]
    }
  ]
}
```

### 2. Get Career Details with Degree & Exam Pathways
- **Method:** `GET`
- **Path:** `/api/careers/{id_or_slug}`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Data Scientist",
    "slug": "data-scientist",
    "overview": "Data Scientists build statistical algorithms...",
    "typical_pathway": "Class 12 (PCM/CS) -> TNEA Counseling -> B.Tech AI & DS...",
    "salary_range_min": 650000.0,
    "salary_range_max": 1800000.0,
    "higher_studies_options": ["M.Tech in Data Science", "MS in Machine Learning"],
    "alternative_careers": ["Machine Learning Engineer", "Business Intelligence Architect"],
    "skills": [
      { "id": 1, "name": "Python", "category": "Programming & AI", "importance_weight": 1.5, "is_core": true }
    ],
    "courses": [
      {
        "id": 1,
        "name": "B.Tech in Artificial Intelligence & Data Science",
        "short_code": "B.Tech AI & DS",
        "degree_level": "Undergraduate",
        "duration_years": 4.0,
        "stream": "Engineering & Technology",
        "is_primary": true,
        "relevance_score": 100.0,
        "exams": [
          { "id": 1, "name": "TNEA (Tamil Nadu Engineering Admissions)", "short_code": "TNEA", "level": "State Level (Tamil Nadu)" }
        ]
      }
    ]
  }
}
```

### 3. List Taxonomy Metadata
- **`GET /api/careers/meta/skills`**: Retrieve skills taxonomy (`category` filter supported).
- **`GET /api/careers/meta/courses`**: Retrieve degrees and courses (`stream` filter supported).
- **`GET /api/careers/meta/exams`**: Retrieve entrance examinations (TNEA, JEE Main, NEET-UG, TANCET, CEETA-PG, etc.).

---

## Career Recommendation Endpoints

### 1. Generate Deterministic Career Recommendations
- **Method:** `GET`
- **Path:** `/api/recommendations`
- **Headers:** `Authorization: Bearer <access_token>`
- **Query Parameters:** `industry` (optional), `min_score` (optional, default 0.0)
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "total_evaluated": 14,
    "dominant_cluster": "Data Intelligence, Artificial Intelligence & Software Systems",
    "recommendations": [
      {
        "career_id": 1,
        "career_title": "Data Scientist",
        "slug": "data-scientist",
        "cluster": "Data Intelligence, Artificial Intelligence & Software Systems",
        "industry": "Information Technology & AI",
        "match_score": 91.2,
        "match_tier": "High Match",
        "factors": {
          "academic_fit": 96.0,
          "aptitude_fit": 94.5,
          "interest_alignment": 97.0,
          "skill_match": 85.0,
          "financial_feasibility": 98.0,
          "location_fit": 96.0
        },
        "explanation": "Matched with 91.2% confidence driven by strong academic foundation in Computer Science & Maths (95.0%), high cognitive reasoning alignment (94.5%)...",
        "matching_skills": ["Python", "SQL & Relational Databases"],
        "skill_gaps": ["Deep Learning & Neural Networks", "Cloud Architecture (AWS/GCP/Azure)"],
        "salary_range_min": 650000.0,
        "salary_range_max": 1800000.0,
        "growth_rate": "Very High (32% annual expansion)",
        "tamil_nadu_demand": "High Demand across Chennai OMR IT Corridor, Coimbatore TIDEL Park",
        "typical_pathway": "Class 12 (PCM/CS) -> TNEA Counseling -> B.Tech AI & DS -> Data Scientist",
        "primary_degree": "B.Tech in Artificial Intelligence & Data Science"
      }
    ]
  }
}
```




