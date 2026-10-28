from sqlalchemy.orm import Session
from app.db.models.assessment import AssessmentQuestion

SEED_QUESTIONS = [
    # --- APTITUDE: LOGICAL REASONING ---
    {
        "category": "Logical Reasoning",
        "question_type": "aptitude",
        "question_text": "If all Algorithms are Procedures, and some Procedures are Automated, which of the following statements is DEFINITELY TRUE?",
        "options": [
            "All Algorithms are Automated",
            "Some Algorithms may be Automated",
            "No Procedures are Algorithms",
            "Every Automated system is an Algorithm"
        ],
        "correct_option_index": 1,
        "scoring_weight": 1.0,
        "interest_dimension": None,
        "explanation": "Since some procedures are automated and algorithms are a subset of procedures, it is logically possible that some algorithms are automated."
    },
    {
        "category": "Logical Reasoning",
        "question_type": "aptitude",
        "question_text": "Look at the sequence: 4, 9, 25, 49, 121, 169, ... What is the next number in this sequence?",
        "options": [
            "196",
            "225",
            "289",
            "361"
        ],
        "correct_option_index": 2,
        "scoring_weight": 1.0,
        "interest_dimension": None,
        "explanation": "These are squares of consecutive prime numbers: 2^2=4, 3^2=9, 5^2=25, 7^2=49, 11^2=121, 13^2=169. The next prime number is 17, and 17^2 = 289."
    },
    {
        "category": "Logical Reasoning",
        "question_type": "aptitude",
        "question_text": "A logic gate outputs TRUE if and only if exactly one of its two inputs is TRUE. If Input A is TRUE and Input B is FALSE, what is the output?",
        "options": [
            "FALSE",
            "TRUE",
            "Undefined",
            "Both TRUE and FALSE"
        ],
        "correct_option_index": 1,
        "scoring_weight": 1.0,
        "interest_dimension": None,
        "explanation": "This is an XOR (Exclusive OR) gate. When exactly one input is TRUE (A=TRUE, B=FALSE), the XOR output is TRUE."
    },

    # --- APTITUDE: NUMERICAL REASONING ---
    {
        "category": "Numerical Reasoning",
        "question_type": "aptitude",
        "question_text": "A student's exam score increased from 75 to 90. What is the percentage increase in the score?",
        "options": [
            "15%",
            "20%",
            "25%",
            "16.67%"
        ],
        "correct_option_index": 1,
        "scoring_weight": 1.0,
        "interest_dimension": None,
        "explanation": "Percentage increase = ((90 - 75) / 75) * 100 = (15 / 75) * 100 = 20%."
    },
    {
        "category": "Numerical Reasoning",
        "question_type": "aptitude",
        "question_text": "A server processes 1,200 requests in 4 minutes. At this steady rate, how many requests will it process in 2.5 hours?",
        "options": [
            "30,000 requests",
            "45,000 requests",
            "18,000 requests",
            "75,000 requests"
        ],
        "correct_option_index": 1,
        "scoring_weight": 1.0,
        "interest_dimension": None,
        "explanation": "Rate = 1200 / 4 = 300 requests/minute. 2.5 hours = 150 minutes. Total requests = 300 * 150 = 45,000."
    },
    {
        "category": "Numerical Reasoning",
        "question_type": "aptitude",
        "question_text": "The ratio of engineering students to medical students in a counseling cohort is 5:3. If there are 450 medical students, how many total students are in the cohort?",
        "options": [
            "750",
            "1,200",
            "1,050",
            "1,500"
        ],
        "correct_option_index": 1,
        "scoring_weight": 1.0,
        "interest_dimension": None,
        "explanation": "3 parts = 450, so 1 part = 150. Engineering students = 5 * 150 = 750. Total = 750 + 450 = 1,200 (or 8 * 150 = 1,200)."
    },

    # --- APTITUDE: ANALYTICAL REASONING ---
    {
        "category": "Analytical Reasoning",
        "question_type": "aptitude",
        "question_text": "In a pipeline optimization problem, Step X must execute before Step Y, and Step Z must execute after Step Y. Which sequence is valid?",
        "options": [
            "Z -> Y -> X",
            "X -> Z -> Y",
            "X -> Y -> Z",
            "Y -> X -> Z"
        ],
        "correct_option_index": 2,
        "scoring_weight": 1.0,
        "interest_dimension": None,
        "explanation": "X precedes Y, and Z follows Y, leading to the strictly valid topological order X -> Y -> Z."
    },
    {
        "category": "Analytical Reasoning",
        "question_type": "aptitude",
        "question_text": "Five projects A, B, C, D, and E are ranked by priority. B is ranked higher than D. A is ranked higher than B. E is ranked lowest. Which project cannot be ranked #1?",
        "options": [
            "A",
            "C",
            "B",
            "Either A or C"
        ],
        "correct_option_index": 2,
        "scoring_weight": 1.0,
        "interest_dimension": None,
        "explanation": "Since A is ranked higher than B, B has at least one project ahead of it and therefore can never be ranked #1."
    },
    {
        "category": "Analytical Reasoning",
        "question_type": "aptitude",
        "question_text": "A dataset contains 100 records. If 60 records have missing values for Column A and 50 records have missing values for Column B, what is the MINIMUM possible number of records that have missing values for BOTH columns?",
        "options": [
            "0",
            "10",
            "50",
            "60"
        ],
        "correct_option_index": 1,
        "scoring_weight": 1.0,
        "interest_dimension": None,
        "explanation": "By inclusion-exclusion: P(A ∩ B) = P(A) + P(B) - P(A ∪ B). The maximum possible union is 100 records. Minimum intersection = 60 + 50 - 100 = 10."
    },

    # --- APTITUDE: VERBAL REASONING ---
    {
        "category": "Verbal Reasoning",
        "question_type": "aptitude",
        "question_text": "Choose the pair that best expresses a relationship similar to that expressed in the original pair: ARCHITECT : BLUEPRINT",
        "options": [
            "Scientist : Experiment",
            "Software Engineer : Code Repository",
            "Teacher : Blackboard",
            "Driver : Highway"
        ],
        "correct_option_index": 1,
        "scoring_weight": 1.0,
        "interest_dimension": None,
        "explanation": "An architect designs and produces a blueprint as the core structural plan/artifact; a software engineer writes and produces a code repository as the core structural artifact."
    },
    {
        "category": "Verbal Reasoning",
        "question_type": "aptitude",
        "question_text": "Read the statement: 'Rapid urbanization in Tamil Nadu tier-2 cities has driven increased broadband demand.' Which conclusion directly follows?",
        "options": [
            "All residents in tier-2 cities are software professionals",
            "Urban development trends correlate positively with digital infrastructure needs",
            "Rural areas in Tamil Nadu do not need broadband",
            "Broadband service providers have lowered prices across all districts"
        ],
        "correct_option_index": 1,
        "scoring_weight": 1.0,
        "interest_dimension": None,
        "explanation": "The statement shows urbanization driving broadband demand, directly supporting that urban growth correlates with digital infrastructure demand."
    },
    {
        "category": "Verbal Reasoning",
        "question_type": "aptitude",
        "question_text": "Choose the word most nearly opposite in meaning to 'EPHEMERAL':",
        "options": [
            "Transient",
            "Enduring",
            "Elusive",
            "Sporadic"
        ],
        "correct_option_index": 1,
        "scoring_weight": 1.0,
        "interest_dimension": None,
        "explanation": "'Ephemeral' means lasting for a very short time; its antonym is 'Enduring' (permanent or long-lasting)."
    },

    # --- INTEREST DIMENSIONS (Likert Scale: Strongly Disagree -> Strongly Agree) ---
    {
        "category": "Technology Interest",
        "question_type": "interest",
        "question_text": "I enjoy diving into code, debugging complex algorithmic logic, or exploring cutting-edge computing tools.",
        "options": [
            "Strongly Disagree",
            "Disagree",
            "Neutral",
            "Agree",
            "Strongly Agree"
        ],
        "correct_option_index": None,
        "scoring_weight": 1.0,
        "interest_dimension": "Technology",
        "explanation": None
    },
    {
        "category": "Science Interest",
        "question_type": "interest",
        "question_text": "I am deeply curious about natural laws, conducting controlled experiments, and deciphering physics, chemistry, or bio-systems.",
        "options": [
            "Strongly Disagree",
            "Disagree",
            "Neutral",
            "Agree",
            "Strongly Agree"
        ],
        "correct_option_index": None,
        "scoring_weight": 1.0,
        "interest_dimension": "Science",
        "explanation": None
    },
    {
        "category": "Business Interest",
        "question_type": "interest",
        "question_text": "I am fascinated by startup ventures, corporate market strategies, revenue models, and financial investments.",
        "options": [
            "Strongly Disagree",
            "Disagree",
            "Neutral",
            "Agree",
            "Strongly Agree"
        ],
        "correct_option_index": None,
        "scoring_weight": 1.0,
        "interest_dimension": "Business",
        "explanation": None
    },
    {
        "category": "Healthcare Interest",
        "question_type": "interest",
        "question_text": "I find clinical diagnostics, patient care, pharmaceutical research, and community health initiatives deeply rewarding.",
        "options": [
            "Strongly Disagree",
            "Disagree",
            "Neutral",
            "Agree",
            "Strongly Agree"
        ],
        "correct_option_index": None,
        "scoring_weight": 1.0,
        "interest_dimension": "Healthcare",
        "explanation": None
    },
    {
        "category": "Design Interest",
        "question_type": "interest",
        "question_text": "I enjoy crafting digital UI layouts, color palettes, visual aesthetics, typography, and interactive user experiences.",
        "options": [
            "Strongly Disagree",
            "Disagree",
            "Neutral",
            "Agree",
            "Strongly Agree"
        ],
        "correct_option_index": None,
        "scoring_weight": 1.0,
        "interest_dimension": "Design",
        "explanation": None
    },
    {
        "category": "Social Impact Interest",
        "question_type": "interest",
        "question_text": "I want my day-to-day work to directly alleviate social disparities, improve rural education, or advance sustainability in Tamil Nadu.",
        "options": [
            "Strongly Disagree",
            "Disagree",
            "Neutral",
            "Agree",
            "Strongly Agree"
        ],
        "correct_option_index": None,
        "scoring_weight": 1.0,
        "interest_dimension": "Social Impact",
        "explanation": None
    },
    {
        "category": "Research Interest",
        "question_type": "interest",
        "question_text": "I thrive on reading scholarly publications, formulating hypotheses, and pursuing thorough, open-ended investigative studies.",
        "options": [
            "Strongly Disagree",
            "Disagree",
            "Neutral",
            "Agree",
            "Strongly Agree"
        ],
        "correct_option_index": None,
        "scoring_weight": 1.0,
        "interest_dimension": "Research",
        "explanation": None
    },
    {
        "category": "Management Interest",
        "question_type": "interest",
        "question_text": "I excel at leading group efforts, orchestrating schedules, organizing deliverables, and delegating responsibilities effectively.",
        "options": [
            "Strongly Disagree",
            "Disagree",
            "Neutral",
            "Agree",
            "Strongly Agree"
        ],
        "correct_option_index": None,
        "scoring_weight": 1.0,
        "interest_dimension": "Management",
        "explanation": None
    }
]

def seed_assessment_questions(db: Session) -> int:
    """
    Checks if assessment questions already exist.
    If not, seeds the database with the standardized Aptitude and Interest question bank.
    Returns the total count of questions available.
    """
    existing_count = db.query(AssessmentQuestion).count()
    if existing_count > 0:
        return existing_count

    questions = [AssessmentQuestion(**q) for q in SEED_QUESTIONS]
    db.add_all(questions)
    db.commit()
    return len(questions)
