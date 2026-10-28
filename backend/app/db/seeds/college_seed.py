from sqlalchemy.orm import Session
from app.db.models.college import College, CollegeCourse
from app.db.models.career import Course
from app.services.career_service import CareerService

SEED_COLLEGES = [
    {
        "name": "College of Engineering Guindy (CEG), Anna University",
        "slug": "anna-univ-ceg",
        "district": "Chennai",
        "category": "Anna University Campus",
        "tnea_code": "0001",
        "nirf_rank": 13,
        "naac_grade": "A++",
        "tuition_fee_annual": 35000.0,
        "hostel_fee_annual": 30000.0,
        "average_placement_ctc": 1150000.0,
        "highest_placement_ctc": 4400000.0,
        "placement_percentage": 94.0,
        "top_recruiters": ["Microsoft", "Google", "Amazon", "Qualcomm", "Zoho", "TCS", "Cisco"],
        "campus_facilities": ["Centre for Artificial Intelligence", "Supercomputing Cluster", "Incubation Cell", "Digital Central Library"],
        "overview": "Established in 1794, CEG is one of Asia's oldest engineering institutions. Ranked highest among state universities in India with unparalleled industry recruitments and research laboratories.",
        "website_url": "https://ceg.annauniv.edu",
        "course_cutoffs": [
            {"short_code": "B.E. CSE", "oc": 199.5, "bc": 198.5, "mbc": 196.5, "sc": 187.0, "st": 178.0, "seats": 120},
            {"short_code": "B.Tech AI & DS", "oc": 198.5, "bc": 197.5, "mbc": 195.0, "sc": 185.0, "st": 175.0, "seats": 60},
            {"short_code": "B.E. ECE", "oc": 198.0, "bc": 197.0, "mbc": 194.5, "sc": 183.0, "st": 172.0, "seats": 120},
            {"short_code": "B.E. EEE", "oc": 196.5, "bc": 195.0, "mbc": 192.0, "sc": 179.0, "st": 168.0, "seats": 90},
            {"short_code": "B.E. Biomedical", "oc": 194.5, "bc": 192.5, "mbc": 189.0, "sc": 175.0, "st": 162.0, "seats": 60}
        ]
    },
    {
        "name": "Madras Institute of Technology (MIT), Anna University",
        "slug": "anna-univ-mit",
        "district": "Chennai",
        "category": "Anna University Campus",
        "tnea_code": "0004",
        "nirf_rank": 13,
        "naac_grade": "A++",
        "tuition_fee_annual": 35000.0,
        "hostel_fee_annual": 30000.0,
        "average_placement_ctc": 1050000.0,
        "highest_placement_ctc": 4000000.0,
        "placement_percentage": 92.0,
        "top_recruiters": ["ISRO", "DRDO", "Boeing", "Zoho", "Freshworks", "Caterpillar", "Renault Nissan"],
        "campus_facilities": ["Avionics Simulation Hangar", "Robotics Research Lab", "Automotive Propulsion Testbed"],
        "overview": "Alma mater of Dr. A.P.J. Abdul Kalam, MIT is world-renowned for pioneering aerospace, automotive, instrumentation, and electronics engineering education.",
        "website_url": "https://mitindia.edu",
        "course_cutoffs": [
            {"short_code": "B.E. CSE", "oc": 198.5, "bc": 197.5, "mbc": 195.0, "sc": 184.0, "st": 174.0, "seats": 90},
            {"short_code": "B.Tech AI & DS", "oc": 198.0, "bc": 196.5, "mbc": 194.0, "sc": 182.0, "st": 170.0, "seats": 60},
            {"short_code": "B.E. ECE", "oc": 197.0, "bc": 195.5, "mbc": 193.0, "sc": 180.0, "st": 169.0, "seats": 90},
            {"short_code": "B.E. Mech & Automation", "oc": 193.0, "bc": 190.5, "mbc": 186.0, "sc": 172.0, "st": 160.0, "seats": 60}
        ]
    },
    {
        "name": "PSG College of Technology",
        "slug": "psg-tech",
        "district": "Coimbatore",
        "category": "Govt-Aided Autonomous",
        "tnea_code": "2006",
        "nirf_rank": 63,
        "naac_grade": "A+",
        "tuition_fee_annual": 65000.0,
        "hostel_fee_annual": 55000.0,
        "average_placement_ctc": 980000.0,
        "highest_placement_ctc": 3800000.0,
        "placement_percentage": 93.0,
        "top_recruiters": ["Bosch", "Caterpillar", "TCS", "Zoho", "Texas Instruments", "Qualcomm", "Amazon"],
        "campus_facilities": ["PSG Industrial Institute", "Nanotechnology Centre", "Advanced Robotics Foundry", "Siemens CoE"],
        "overview": "Premier institution seamlessly integrating industrial production floors with engineering academics in Coimbatore's manufacturing heartland.",
        "website_url": "https://www.psgtech.edu",
        "course_cutoffs": [
            {"short_code": "B.E. CSE", "oc": 198.0, "bc": 196.5, "mbc": 194.0, "sc": 182.0, "st": 171.0, "seats": 120},
            {"short_code": "B.Tech AI & DS", "oc": 197.5, "bc": 196.0, "mbc": 193.0, "sc": 180.0, "st": 168.0, "seats": 60},
            {"short_code": "B.E. ECE", "oc": 196.5, "bc": 195.0, "mbc": 191.5, "sc": 178.0, "st": 166.0, "seats": 120},
            {"short_code": "B.E. EEE", "oc": 195.0, "bc": 193.0, "mbc": 189.5, "sc": 175.0, "st": 163.0, "seats": 90},
            {"short_code": "B.E. Biomedical", "oc": 192.5, "bc": 189.5, "mbc": 185.0, "sc": 170.0, "st": 158.0, "seats": 60}
        ]
    },
    {
        "name": "National Institute of Technology (NIT) Trichy",
        "slug": "nit-trichy",
        "district": "Tiruchirappalli",
        "category": "Institute of National Importance",
        "tnea_code": None,
        "nirf_rank": 9,
        "naac_grade": "A++",
        "tuition_fee_annual": 135000.0,
        "hostel_fee_annual": 60000.0,
        "average_placement_ctc": 1450000.0,
        "highest_placement_ctc": 5200000.0,
        "placement_percentage": 96.0,
        "top_recruiters": ["Google", "Microsoft", "Uber", "Goldman Sachs", "Morgan Stanley", "Qualcomm", "NVIDIA"],
        "campus_facilities": ["OCTAGON High Speed Computing", "CEDI Entrepreneurship Centre", "Centre of Excellence in Manufacturing"],
        "overview": "Ranked #1 among all 31 NITs in India, offering world-class infrastructure and national talent diversity in central Tamil Nadu.",
        "website_url": "https://www.nitt.edu",
        "course_cutoffs": [
            {"short_code": "B.E. CSE", "oc": 199.8, "bc": 199.0, "mbc": 197.5, "sc": 190.0, "st": 182.0, "seats": 120},
            {"short_code": "B.E. ECE", "oc": 198.5, "bc": 197.0, "mbc": 195.0, "sc": 186.0, "st": 176.0, "seats": 100},
            {"short_code": "B.E. EEE", "oc": 197.0, "bc": 195.5, "mbc": 192.5, "sc": 182.0, "st": 172.0, "seats": 90}
        ]
    },
    {
        "name": "Government College of Technology (GCT)",
        "slug": "gct-coimbatore",
        "district": "Coimbatore",
        "category": "Government Autonomous",
        "tnea_code": "2005",
        "nirf_rank": 95,
        "naac_grade": "A",
        "tuition_fee_annual": 32000.0,
        "hostel_fee_annual": 28000.0,
        "average_placement_ctc": 680000.0,
        "highest_placement_ctc": 2200000.0,
        "placement_percentage": 86.0,
        "top_recruiters": ["Zoho", "L&T", "TCS", "Cognizant", "Brakes India", "Robert Bosch"],
        "campus_facilities": ["CAD/CAM Centre", "Power Electronics Lab", "Smart Environmental Lab"],
        "overview": "Premier state government engineering college offering high-calibre technical education at nominal fees for Tamil Nadu students.",
        "website_url": "https://gct.ac.in",
        "course_cutoffs": [
            {"short_code": "B.E. CSE", "oc": 196.0, "bc": 194.5, "mbc": 191.0, "sc": 178.0, "st": 166.0, "seats": 90},
            {"short_code": "B.E. ECE", "oc": 194.5, "bc": 192.5, "mbc": 188.5, "sc": 174.0, "st": 162.0, "seats": 90},
            {"short_code": "B.E. EEE", "oc": 192.5, "bc": 189.5, "mbc": 185.0, "sc": 168.0, "st": 155.0, "seats": 90}
        ]
    },
    {
        "name": "Sri Sivasubramaniya Nadar (SSN) College of Engineering",
        "slug": "ssn-chennai",
        "district": "Chennai",
        "category": "Private Autonomous",
        "tnea_code": "1315",
        "nirf_rank": 45,
        "naac_grade": "A++",
        "tuition_fee_annual": 125000.0,
        "hostel_fee_annual": 75000.0,
        "average_placement_ctc": 920000.0,
        "highest_placement_ctc": 3600000.0,
        "placement_percentage": 94.0,
        "top_recruiters": ["Amazon", "Zoho", "PayPal", "Freshworks", "Hyundai", "Goldman Sachs"],
        "campus_facilities": ["HCL R&D Innovation Studio", "SSN Incubation Foundation", "Modern Robotics Lab"],
        "overview": "Founded by Padma Bhushan Shiv Nadar, SSN is Tamil Nadu's top-ranked private engineering college with extensive merit scholarship programs.",
        "website_url": "https://www.ssn.edu.in",
        "course_cutoffs": [
            {"short_code": "B.E. CSE", "oc": 197.5, "bc": 195.5, "mbc": 192.5, "sc": 179.0, "st": 168.0, "seats": 120},
            {"short_code": "B.Tech AI & DS", "oc": 196.0, "bc": 194.0, "mbc": 190.0, "sc": 175.0, "st": 164.0, "seats": 60},
            {"short_code": "B.E. ECE", "oc": 195.0, "bc": 193.0, "mbc": 189.0, "sc": 174.0, "st": 162.0, "seats": 120},
            {"short_code": "B.E. Biomedical", "oc": 190.0, "bc": 186.0, "mbc": 181.0, "sc": 165.0, "st": 152.0, "seats": 60}
        ]
    },
    {
        "name": "Thiagarajar College of Engineering (TCE)",
        "slug": "tce-madurai",
        "district": "Madurai",
        "category": "Govt-Aided Autonomous",
        "tnea_code": "5008",
        "nirf_rank": 85,
        "naac_grade": "A+",
        "tuition_fee_annual": 55000.0,
        "hostel_fee_annual": 45000.0,
        "average_placement_ctc": 750000.0,
        "highest_placement_ctc": 2800000.0,
        "placement_percentage": 89.0,
        "top_recruiters": ["TVS Motors", "Zoho", "Honeywell", "TCS", "Accenture", "Infosys"],
        "campus_facilities": ["Honeywell Automation Lab", "Data Analytics Center", "TVS Mobility Research Hub"],
        "overview": "Premier institution in Southern Tamil Nadu with deep corporate linkages with TVS Group and prominent core engineering placements.",
        "website_url": "https://www.tce.edu",
        "course_cutoffs": [
            {"short_code": "B.E. CSE", "oc": 195.0, "bc": 192.5, "mbc": 188.0, "sc": 172.0, "st": 160.0, "seats": 90},
            {"short_code": "B.Tech AI & DS", "oc": 194.0, "bc": 191.0, "mbc": 186.0, "sc": 170.0, "st": 158.0, "seats": 60},
            {"short_code": "B.E. ECE", "oc": 193.0, "bc": 190.0, "mbc": 185.0, "sc": 168.0, "st": 155.0, "seats": 90},
            {"short_code": "B.E. EEE", "oc": 190.5, "bc": 187.0, "mbc": 181.5, "sc": 164.0, "st": 150.0, "seats": 60}
        ]
    },
    {
        "name": "Coimbatore Institute of Technology (CIT)",
        "slug": "cit-coimbatore",
        "district": "Coimbatore",
        "category": "Govt-Aided Autonomous",
        "tnea_code": "2007",
        "nirf_rank": 98,
        "naac_grade": "A+",
        "tuition_fee_annual": 58000.0,
        "hostel_fee_annual": 50000.0,
        "average_placement_ctc": 800000.0,
        "highest_placement_ctc": 3000000.0,
        "placement_percentage": 90.0,
        "top_recruiters": ["IBM", "Bosch", "Texas Instruments", "Qualcomm", "Zoho", "Cognizant"],
        "campus_facilities": ["CIT-KUKA Robotics Lab", "IoT Research Center", "Embedded Systems Lab"],
        "overview": "Founded in 1956, CIT is an acclaimed government-aided autonomous institution celebrated for engineering research and industry-ready graduates.",
        "website_url": "https://www.cit.edu.in",
        "course_cutoffs": [
            {"short_code": "B.E. CSE", "oc": 196.5, "bc": 194.5, "mbc": 191.5, "sc": 176.0, "st": 164.0, "seats": 90},
            {"short_code": "B.Tech AI & DS", "oc": 195.5, "bc": 193.5, "mbc": 189.5, "sc": 174.0, "st": 161.0, "seats": 60},
            {"short_code": "B.E. ECE", "oc": 194.0, "bc": 191.5, "mbc": 187.0, "sc": 171.0, "st": 158.0, "seats": 90}
        ]
    },
    {
        "name": "SASTRA Deemed University",
        "slug": "sastra-thanjavur",
        "district": "Thanjavur",
        "category": "Deemed University",
        "tnea_code": None,
        "nirf_rank": 34,
        "naac_grade": "A++",
        "tuition_fee_annual": 160000.0,
        "hostel_fee_annual": 65000.0,
        "average_placement_ctc": 880000.0,
        "highest_placement_ctc": 3500000.0,
        "placement_percentage": 91.0,
        "top_recruiters": ["Tata Consultancy Services", "Amazon", "Freshworks", "Morgan Stanley", "Zoho", "Cisco"],
        "campus_facilities": ["Centre for Nanotechnology", "Hub for Biopharmaceutical Research", "Supercomputing Unit"],
        "overview": "One of India's top deemed universities situated in the cultural hub of Thanjavur, recognized for academic discipline and high placement rates.",
        "website_url": "https://www.sastra.edu",
        "course_cutoffs": [
            {"short_code": "B.Tech AI & DS", "oc": 194.0, "bc": 191.0, "mbc": 186.0, "sc": 170.0, "st": 158.0, "seats": 90},
            {"short_code": "B.E. CSE", "oc": 195.5, "bc": 193.0, "mbc": 188.5, "sc": 173.0, "st": 161.0, "seats": 180},
            {"short_code": "B.E. ECE", "oc": 192.0, "bc": 188.5, "mbc": 183.0, "sc": 166.0, "st": 152.0, "seats": 120}
        ]
    },
    {
        "name": "Government College of Engineering (GCE)",
        "slug": "gce-salem",
        "district": "Salem",
        "category": "Government Autonomous",
        "tnea_code": "2615",
        "nirf_rank": 140,
        "naac_grade": "A",
        "tuition_fee_annual": 30000.0,
        "hostel_fee_annual": 25000.0,
        "average_placement_ctc": 550000.0,
        "highest_placement_ctc": 1600000.0,
        "placement_percentage": 82.0,
        "top_recruiters": ["JSW Steel", "TCS", "Infosys", "Cognizant", "L&T Construction"],
        "campus_facilities": ["Metallurgy Lab", "Microprocessor Lab", "Renewable Energy Research Park"],
        "overview": "Premier state engineering college in western Tamil Nadu, delivering affordable engineering degrees with good campus recruitment.",
        "website_url": "https://gcesalem.edu.in",
        "course_cutoffs": [
            {"short_code": "B.E. CSE", "oc": 188.0, "bc": 184.0, "mbc": 178.0, "sc": 160.0, "st": 148.0, "seats": 60},
            {"short_code": "B.E. ECE", "oc": 185.0, "bc": 181.0, "mbc": 175.0, "sc": 158.0, "st": 145.0, "seats": 60},
            {"short_code": "B.E. EEE", "oc": 181.0, "bc": 176.0, "mbc": 170.0, "sc": 152.0, "st": 140.0, "seats": 60}
        ]
    }
]

def seed_college_database(db: Session) -> dict:
    """
    Seeds verified Tamil Nadu colleges and course cutoffs.
    Idempotent: skips if already populated.
    """
    CareerService.ensure_seeded(db)

    if db.query(College).count() > 0:
        return {
            "colleges": db.query(College).count(),
            "college_courses": db.query(CollegeCourse).count()
        }

    # Fetch existing courses keyed by short_code
    all_courses = db.query(Course).all()
    courses_by_code = {c.short_code: c for c in all_courses}

    for col_data in SEED_COLLEGES:
        c_copy = dict(col_data)
        course_cutoffs = c_copy.pop("course_cutoffs", [])

        college = College(**c_copy)
        db.add(college)
        db.flush()

        for cc in course_cutoffs:
            target_course = courses_by_code.get(cc["short_code"])
            if not target_course:
                continue

            college_course = CollegeCourse(
                college_id=college.id,
                course_id=target_course.id,
                cutoff_marks_oc=cc.get("oc", 180.0),
                cutoff_marks_bc=cc.get("bc", 175.0),
                cutoff_marks_mbc=cc.get("mbc", 170.0),
                cutoff_marks_sc=cc.get("sc", 155.0),
                cutoff_marks_st=cc.get("st", 145.0),
                intake_seats=cc.get("seats", 60)
            )
            db.add(college_course)

    db.commit()

    return {
        "colleges": db.query(College).count(),
        "college_courses": db.query(CollegeCourse).count()
    }
