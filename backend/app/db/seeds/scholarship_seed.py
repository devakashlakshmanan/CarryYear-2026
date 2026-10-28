from sqlalchemy.orm import Session
from app.db.models.scholarship_chat import Scholarship

SEED_SCHOLARSHIPS = [
    {
        "title": "Tamil Nadu First Graduate Tuition Fee Concession Scheme",
        "slug": "tn-first-graduate-scheme",
        "provider": "Government of Tamil Nadu (DOTE)",
        "scheme_type": "First Graduate",
        "amount_per_annum": 27500.0,
        "is_full_tuition_waiver": True,
        "description": "Exempts entire tuition fee in Anna University constituent and self-financing engineering colleges for students who are the first in their immediate family to earn an undergraduate degree.",
        "eligibility_community": ["OC", "BC", "BCM", "MBC", "SC", "ST", "ALL"],
        "max_family_income": None,
        "min_academic_percentage": 50.0,
        "gender_requirement": "ANY",
        "first_graduate_only": True,
        "govt_school_quota_only": False,
        "required_documents": [
            "First Graduate Certificate from Tahsildar / e-Sevai",
            "Joint Declaration by Parent & Student",
            "No Graduate in Family Certificate",
            "Class 10 & 12 Marksheets",
            "TNEA Allotment Order"
        ],
        "application_portal_url": "https://www.tneaonline.org",
        "deadline_info": "During TNEA Single Window Certificate Verification"
    },
    {
        "title": "Tamil Nadu 7.5% Government School Quota Free Professional Education",
        "slug": "tn-7point5-govt-school-quota",
        "provider": "Government of Tamil Nadu",
        "scheme_type": "State Government",
        "amount_per_annum": 120000.0,
        "is_full_tuition_waiver": True,
        "description": "Entire expenditure including tuition fees, hostel fees, mess charges, and counseling expenses borne 100% by the Tamil Nadu Government for students who studied in Govt schools from Class 6 to 12.",
        "eligibility_community": ["OC", "BC", "BCM", "MBC", "SC", "ST", "ALL"],
        "max_family_income": None,
        "min_academic_percentage": 45.0,
        "gender_requirement": "ANY",
        "first_graduate_only": False,
        "govt_school_quota_only": True,
        "required_documents": [
            "Bona Fide Certificate from Headmaster (Classes 6-12 Govt School)",
            "EMIS Identification Number",
            "Class 10 & 12 Marksheets",
            "TNEA Allotment Order"
        ],
        "application_portal_url": "https://www.tneaonline.org",
        "deadline_info": "Automatic Verification during TNEA 7.5% Counseling"
    },
    {
        "title": "Tamil Nadu Post-Matric Scholarship Scheme for SC / ST / SCA",
        "slug": "tn-post-matric-sc-st",
        "provider": "Adi Dravidar and Tribal Welfare Dept, Govt of Tamil Nadu",
        "scheme_type": "Community",
        "amount_per_annum": 70000.0,
        "is_full_tuition_waiver": True,
        "description": "Full compulsory fee reimbursement and maintenance allowance for Scheduled Caste (SC), Scheduled Caste Arunthathiyar (SCA), and Scheduled Tribe (ST) students pursuing professional higher education.",
        "eligibility_community": ["SC", "ST"],
        "max_family_income": 250000.0,
        "min_academic_percentage": 50.0,
        "gender_requirement": "ANY",
        "first_graduate_only": False,
        "govt_school_quota_only": False,
        "required_documents": [
            "Community Certificate from competent Revenue Authority",
            "Annual Family Income Certificate (< ₹2.5 LPA)",
            "Aadhaar-seeded Bank Passbook",
            "College Admission Verification"
        ],
        "application_portal_url": "https://escholarship.tn.gov.in",
        "deadline_info": "October - December Annually"
    },
    {
        "title": "Tamil Nadu BC / MBC / DNC Welfare Post-Matric Scholarship",
        "slug": "tn-bc-mbc-welfare-scholarship",
        "provider": "BC, MBC & Minorities Welfare Dept, Govt of Tamil Nadu",
        "scheme_type": "Community",
        "amount_per_annum": 25000.0,
        "is_full_tuition_waiver": False,
        "description": "Tuition and exam fee reimbursement for Backward Class (BC), Most Backward Class (MBC), and Denotified Communities (DNC) pursuing technical degrees in recognized Tamil Nadu colleges.",
        "eligibility_community": ["BC", "BCM", "MBC"],
        "max_family_income": 250000.0,
        "min_academic_percentage": 50.0,
        "gender_requirement": "ANY",
        "first_graduate_only": False,
        "govt_school_quota_only": False,
        "required_documents": [
            "BC/MBC Community Certificate",
            "Current Year Income Certificate (< ₹2.50 Lakhs)",
            "Bank Passbook copy",
            "Previous Year Marksheets"
        ],
        "application_portal_url": "https://escholarship.tn.gov.in",
        "deadline_info": "November - January Annually"
    },
    {
        "title": "Pudhumai Penn (Moovalur Ramamirtham Ammaiyar Higher Education Assurance Scheme)",
        "slug": "tn-pudhumai-penn-scheme",
        "provider": "Social Welfare & Women Empowerment Dept, Tamil Nadu",
        "scheme_type": "State Government",
        "amount_per_annum": 12000.0,
        "is_full_tuition_waiver": False,
        "description": "Provides monthly financial grant of ₹1,000 (₹12,000 annually) deposited directly into bank accounts of girl students who studied Classes 6 to 12 in Tamil Nadu government schools.",
        "eligibility_community": ["OC", "BC", "BCM", "MBC", "SC", "ST", "ALL"],
        "max_family_income": None,
        "min_academic_percentage": 40.0,
        "gender_requirement": "FEMALE",
        "first_graduate_only": False,
        "govt_school_quota_only": True,
        "required_documents": [
            "Govt School Study Certificate (Classes 6-12)",
            "Aadhaar Card",
            "Active Student Bank Account Details (DBT enabled)",
            "College Enrollment ID"
        ],
        "application_portal_url": "https://penkalvi.tn.gov.in",
        "deadline_info": "August - October Annually"
    },
    {
        "title": "AICTE Pragati Scholarship for Girls in Technical Education",
        "slug": "aicte-pragati-girls-scholarship",
        "provider": "All India Council for Technical Education (AICTE)",
        "scheme_type": "Merit",
        "amount_per_annum": 50000.0,
        "is_full_tuition_waiver": False,
        "description": "Encourages young women to pursue engineering degrees with ₹50,000 per annum towards college fee, books, stationery, computer hardware, and software packages.",
        "eligibility_community": ["OC", "BC", "BCM", "MBC", "SC", "ST", "ALL"],
        "max_family_income": 800000.0,
        "min_academic_percentage": 60.0,
        "gender_requirement": "FEMALE",
        "first_graduate_only": False,
        "govt_school_quota_only": False,
        "required_documents": [
            "Class 10 & 12 Marksheets",
            "Annual Family Income Certificate (< ₹8.0 LPA)",
            "Admission Proof into AICTE approved institution",
            "Tuition fee receipt"
        ],
        "application_portal_url": "https://scholarships.gov.in",
        "deadline_info": "September - November on National Scholarship Portal (NSP)"
    },
    {
        "title": "Chief Minister's Merit Award Scheme for SC / ST / SCA",
        "slug": "tn-cm-merit-award-sc-st",
        "provider": "Government of Tamil Nadu",
        "scheme_type": "Merit",
        "amount_per_annum": 5000.0,
        "is_full_tuition_waiver": False,
        "description": "State merit award for the top 1,000 boys and 1,000 girls among SC, ST, and SCA communities scoring highest marks in Tamil Nadu Higher Secondary (+2) examinations.",
        "eligibility_community": ["SC", "ST"],
        "max_family_income": None,
        "min_academic_percentage": 75.0,
        "gender_requirement": "ANY",
        "first_graduate_only": False,
        "govt_school_quota_only": False,
        "required_documents": [
            "Class 12 Tamil Nadu State Board Marksheet",
            "Community Certificate",
            "Bank Account Details"
        ],
        "application_portal_url": "https://escholarship.tn.gov.in",
        "deadline_info": "Automated Selection via Directorate of Government Examinations"
    }
]

def seed_scholarship_database(db: Session) -> dict:
    if db.query(Scholarship).count() > 0:
        return {"count": db.query(Scholarship).count()}

    for s_data in SEED_SCHOLARSHIPS:
        scholarship = Scholarship(**s_data)
        db.add(scholarship)
    db.commit()

    return {"count": db.query(Scholarship).count()}
