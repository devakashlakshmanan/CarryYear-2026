# CarryYear Database Architecture

## Overview
CarryYear utilizes PostgreSQL in production and Docker containers, with full support for SQLAlchemy 2.0 ORM and Alembic schema migrations.

## Entity Relationship Overview (Initial Core Models)

```
+------------------------------------+
|               users                |
+------------------------------------+
| id: Integer [PK]                   |
| name: String(120)                  |
| email: String(255) [Unique, Index] |
| password_hash: String(255)         |
| is_active: Boolean                 |
| is_admin: Boolean                  |
| created_at: DateTime               |
| updated_at: DateTime               |
+-----------------+------------------+
                  |
                  | 1 : 1 (Cascade Delete)
                  v
+------------------------------------+
|          student_profiles          |
+------------------------------------+
| id: Integer [PK]                   |
| user_id: Integer [FK, Unique, Idx] |
| age: Integer                       |
| gender: String(50)                 |
| state: String(100) (Tamil Nadu)    |
| district: String(100) [Index]      |
| city: String(100)                  |
| current_education_level: String    |
| school_or_college: String(255)     |
| board_or_university: String(255)   |
| stream: String(100)                |
| percentage_or_cgpa: Float          |
| subject_marks: JSON                |
| interests: JSON                    |
| skills: JSON                       |
| preferred_locations: JSON          |
| preferred_career_areas: JSON       |
| govt_or_private: String(50)        |
| higher_studies_preference: String  |
| study_mode: String(50)             |
| college_type: String(100)          |
| annual_family_income: String(100)  |
| max_education_budget: Float        |
| need_scholarship: Boolean          |
| hostel_required: Boolean           |
| preferred_fee_range: String(100)   |
| short_term_goal: Text              |
| long_term_goal: Text               |
| target_career: String(150)         |
| higher_study_interest: Boolean     |
| onboarding_completed: Boolean      |
| created_at: DateTime               |
| updated_at: DateTime               |
+------------------------------------+
```

## Migration Commands
```bash
# Generate a new migration
alembic revision --autogenerate -m "describe changes"

# Apply pending migrations
alembic upgrade head

# Rollback last migration
alembic downgrade -1
```

## Indexes & Constraints
- `users.email`: Unique index for fast O(1) authentication lookups.
- `student_profiles.user_id`: Unique foreign key with `ON DELETE CASCADE`.
- `student_profiles.district`: B-Tree index for regional filtering in Tamil Nadu college and scholarship matching.
