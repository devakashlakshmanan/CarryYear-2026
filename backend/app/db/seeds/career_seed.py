from sqlalchemy.orm import Session
from app.db.models.career import (
    Skill,
    EntranceExam,
    Course,
    CourseExam,
    Career,
    CareerSkill,
    CareerCourse
)

SEED_SKILLS = [
    {"name": "Python", "category": "Programming & AI", "description": "High-level programming language dominant in data science, machine learning, and backend scripting."},
    {"name": "SQL & Relational Databases", "category": "Data & Mathematics", "description": "Relational query language for structured querying, joins, index optimizations, and data warehousing."},
    {"name": "Machine Learning", "category": "Programming & AI", "description": "Supervised, unsupervised, ensemble models, loss optimizations, and predictive pipelines."},
    {"name": "Deep Learning & Neural Networks", "category": "Programming & AI", "description": "Transformers, CNNs, RNNs, PyTorch, TensorFlow, and large language model fine-tuning."},
    {"name": "Probability & Applied Statistics", "category": "Data & Mathematics", "description": "Hypothesis testing, Bayesian reasoning, distribution analysis, and inferential statistics."},
    {"name": "Data Modeling & ETL Pipelines", "category": "Data & Mathematics", "description": "Designing dimensional models, streaming pipelines, and automated workflow orchestrations."},
    {"name": "Cloud Architecture (AWS/GCP/Azure)", "category": "Engineering & Systems", "description": "Deploying scalable serverless microservices, distributed storage, and cloud infrastructure."},
    {"name": "Docker & Container Orchestration", "category": "Engineering & Systems", "description": "Containerizing applications, Dockerfiles, compose multi-container orchestration, and Kubernetes clusters."},
    {"name": "React & TypeScript", "category": "Programming & AI", "description": "Modern typed frontend application development, state management, and reusable component architectures."},
    {"name": "Embedded C / C++", "category": "Engineering & Systems", "description": "Low-level micro-controller firmware, real-time memory management, and hardware interfaces."},
    {"name": "ROS (Robot Operating System)", "category": "Engineering & Systems", "description": "Kinematics, sensor fusion, LiDAR integration, and autonomous robot navigation stacks."},
    {"name": "Biomedical Signal & Imaging Processing", "category": "Healthcare & Life Sciences", "description": "ECG, EEG, MRI image filtering, DICOM formats, and bio-sensor diagnostic algorithms."},
    {"name": "Clinical Data Informatics", "category": "Healthcare & Life Sciences", "description": "EHR interoperability, HL7 FHIR standards, epidemiological registries, and biostatistics."},
    {"name": "UI/UX & Interactive Prototyping", "category": "Design & Media", "description": "Wireframing, user empathy mapping, Figma component design systems, and usability heuristics."},
    {"name": "Product Strategy & Roadmap Planning", "category": "Business & Management", "description": "Market discovery, PRD writing, customer feedback synthesis, and agile sprint prioritization."},
    {"name": "Cybersecurity & Network Defense", "category": "Engineering & Systems", "description": "Penetration testing, encryption, zero-trust architectures, and security incident response."},
    {"name": "VLSI Design & Verilog/SystemVerilog", "category": "Engineering & Systems", "description": "ASIC/FPGA architecture, logic synthesis, RTL verification, and timing closure."},
    {"name": "Electric Vehicle & Battery Systems", "category": "Engineering & Systems", "description": "Battery management systems (BMS), motor controllers, power electronics, and regenerative braking."},
    {"name": "Business Analytics & Financial Modeling", "category": "Business & Management", "description": "Unit economics, ROI valuation, pricing optimization, and executive decision dashboards."},
    {"name": "Structural Analysis & GIS Smart Cities", "category": "Engineering & Systems", "description": "Geospatial GIS mapping, structural load computations, and urban transit planning."}
]

SEED_EXAMS = [
    {
        "name": "TNEA (Tamil Nadu Engineering Admissions)",
        "short_code": "TNEA",
        "conducting_body": "Directorate of Technical Education (DoTE) / Anna University",
        "level": "State Level (Tamil Nadu)",
        "mode": "Merit Counseling based on normalized Class 12 PCM Cutoff (Out of 200)",
        "description": "Primary single-window counseling gateway for admission into government, government-aided, and private engineering colleges across Tamil Nadu.",
        "website_url": "https://www.tneaonline.org"
    },
    {
        "name": "JEE Main (Joint Entrance Examination)",
        "short_code": "JEE Main",
        "conducting_body": "National Testing Agency (NTA)",
        "level": "National Level",
        "mode": "Computer Based Test (CBT)",
        "description": "National entrance exam for admission to NIT Trichy, IIITs, and Centrally Funded Technical Institutes, as well as qualifying for JEE Advanced.",
        "website_url": "https://jeemain.nta.nic.in"
    },
    {
        "name": "NEET-UG (National Eligibility cum Entrance Test)",
        "short_code": "NEET-UG",
        "conducting_body": "National Testing Agency (NTA) & TN Health Selection Committee",
        "level": "National / State Counseling",
        "mode": "Pen and Paper Test",
        "description": "Mandatory entrance examination for undergraduate medical (MBBS) and dental (BDS) courses in Tamil Nadu government and private medical colleges.",
        "website_url": "https://neet.nta.nic.in"
    },
    {
        "name": "TANCET (Tamil Nadu Common Entrance Test)",
        "short_code": "TANCET",
        "conducting_body": "Anna University, Chennai",
        "level": "State Level (Tamil Nadu)",
        "mode": "Offline OMR Examination",
        "description": "State-level examination for admission into Master of Computer Applications (MCA) and Master of Business Administration (MBA) in Tamil Nadu colleges.",
        "website_url": "https://tancet.annauniv.edu"
    },
    {
        "name": "CEETA-PG (Common Engineering Entrance Test and Admission - PG)",
        "short_code": "CEETA-PG",
        "conducting_body": "Anna University, Chennai",
        "level": "State Level (Tamil Nadu)",
        "mode": "Offline OMR Examination",
        "description": "State entrance examination for M.E., M.Tech, M.Arch, and M.Plan programs in Anna University departments and constituent colleges.",
        "website_url": "https://tancet.annauniv.edu"
    },
    {
        "name": "GATE (Graduate Aptitude Test in Engineering)",
        "short_code": "GATE",
        "conducting_body": "IITs / IISc Bangalore",
        "level": "National Level",
        "mode": "Computer Based Test (CBT)",
        "description": "Premier national examination for postgraduate M.Tech admissions in IITs, IISc, NIT Trichy, and PSU engineering recruitments.",
        "website_url": "https://gate.iitk.ac.in"
    },
    {
        "name": "NATA (National Aptitude Test in Architecture)",
        "short_code": "NATA",
        "conducting_body": "Council of Architecture (CoA)",
        "level": "National Level",
        "mode": "Computer Based Test & Drawing Evaluation",
        "description": "National entrance test measuring drawing, aesthetic sensitivity, and mathematical reasoning for B.Arch degree admissions in Tamil Nadu.",
        "website_url": "https://www.nata.in"
    }
]

SEED_COURSES = [
    {
        "name": "B.Tech in Artificial Intelligence & Data Science",
        "short_code": "B.Tech AI & DS",
        "degree_level": "Undergraduate",
        "duration_years": 4.0,
        "stream": "Engineering & Technology",
        "description": "Cutting-edge curriculum focusing on mathematical foundations, predictive algorithms, neural networks, computer vision, NLP, and scalable data systems.",
        "eligibility_criteria": "Passed Class 12 with Physics, Chemistry, and Mathematics (PCM). TNEA cut-off eligibility.",
        "average_annual_fee_min": 45000.0,
        "average_annual_fee_max": 180000.0,
        "exam_codes": ["TNEA", "JEE Main"]
    },
    {
        "name": "B.E. in Computer Science & Engineering",
        "short_code": "B.E. CSE",
        "degree_level": "Undergraduate",
        "duration_years": 4.0,
        "stream": "Engineering & Technology",
        "description": "Foundational computing engineering covering data structures, OS, compiler design, computer architecture, cloud systems, and cybersecurity.",
        "eligibility_criteria": "Class 12 with PCM. Admission via TNEA Counseling or JEE Main (for NIT Trichy).",
        "average_annual_fee_min": 40000.0,
        "average_annual_fee_max": 175000.0,
        "exam_codes": ["TNEA", "JEE Main"]
    },
    {
        "name": "B.E. in Electronics & Communication Engineering",
        "short_code": "B.E. ECE",
        "degree_level": "Undergraduate",
        "duration_years": 4.0,
        "stream": "Engineering & Technology",
        "description": "Bridging hardware and software with VLSI circuits, signal processing, wireless communications, embedded microcontrollers, and IoT systems.",
        "eligibility_criteria": "Class 12 with PCM. TNEA admission.",
        "average_annual_fee_min": 40000.0,
        "average_annual_fee_max": 160000.0,
        "exam_codes": ["TNEA", "JEE Main"]
    },
    {
        "name": "B.E. in Electrical & Electronics Engineering",
        "short_code": "B.E. EEE",
        "degree_level": "Undergraduate",
        "duration_years": 4.0,
        "stream": "Engineering & Technology",
        "description": "Power systems, power electronics, electric drive trains, renewable energy grids, and battery management engineering for EV sectors.",
        "eligibility_criteria": "Class 12 with PCM. TNEA single-window counseling.",
        "average_annual_fee_min": 38000.0,
        "average_annual_fee_max": 150000.0,
        "exam_codes": ["TNEA"]
    },
    {
        "name": "B.E. in Biomedical Engineering",
        "short_code": "B.E. Biomedical",
        "degree_level": "Undergraduate",
        "duration_years": 4.0,
        "stream": "Healthcare & Engineering",
        "description": "Integrates medical science with engineering principles to develop hospital diagnostic instrumentation, prosthetic devices, and medical imaging scanners.",
        "eligibility_criteria": "Class 12 with PCM or Biology. TNEA counseling.",
        "average_annual_fee_min": 45000.0,
        "average_annual_fee_max": 165000.0,
        "exam_codes": ["TNEA"]
    },
    {
        "name": "B.E. in Mechanical & Automation Engineering",
        "short_code": "B.E. Mech & Automation",
        "degree_level": "Undergraduate",
        "duration_years": 4.0,
        "stream": "Engineering & Technology",
        "description": "Thermal dynamics, CAD/CAM, industrial robotics, PLC programming, and smart automotive manufacturing systems.",
        "eligibility_criteria": "Class 12 with PCM. TNEA counseling.",
        "average_annual_fee_min": 35000.0,
        "average_annual_fee_max": 140000.0,
        "exam_codes": ["TNEA"]
    },
    {
        "name": "B.Sc in Data Science & Applications",
        "short_code": "B.Sc Data Science",
        "degree_level": "Undergraduate",
        "duration_years": 3.0,
        "stream": "Science & Computing",
        "description": "Rigorous mathematics, statistical analysis, computational programming, data wrangling, and predictive modeling for fast-track data careers.",
        "eligibility_criteria": "Class 12 with Mathematics or Business Mathematics.",
        "average_annual_fee_min": 30000.0,
        "average_annual_fee_max": 90000.0,
        "exam_codes": []
    },
    {
        "name": "B.Des in User Experience & Interaction Design",
        "short_code": "B.Des UX",
        "degree_level": "Undergraduate",
        "duration_years": 4.0,
        "stream": "Design & Media",
        "description": "Human-computer interaction (HCI), visual design principles, cognitive psychology, ergonomic testing, and responsive digital product interfaces.",
        "eligibility_criteria": "Class 12 in any stream with creative aptitude.",
        "average_annual_fee_min": 75000.0,
        "average_annual_fee_max": 250000.0,
        "exam_codes": []
    },
    {
        "name": "M.Tech in Data Science & Computational Intelligence",
        "short_code": "M.Tech Data Science",
        "degree_level": "Postgraduate",
        "duration_years": 2.0,
        "stream": "Engineering & Technology",
        "description": "Advanced research in high-performance computing, distributed ML frameworks, probabilistic graphical models, and neural architecture search.",
        "eligibility_criteria": "B.E./B.Tech in CSE/IT/ECE/AI or M.Sc in CS. CEETA-PG or GATE qualification.",
        "average_annual_fee_min": 40000.0,
        "average_annual_fee_max": 120000.0,
        "exam_codes": ["CEETA-PG", "GATE"]
    },
    {
        "name": "MBA in Business Analytics & Strategic Management",
        "short_code": "MBA Analytics",
        "degree_level": "Postgraduate",
        "duration_years": 2.0,
        "stream": "Commerce & Management",
        "description": "Combining corporate executive leadership with quantitative data analytics, business forecasting, and strategic market expansion.",
        "eligibility_criteria": "Recognized undergraduate degree. TANCET qualification.",
        "average_annual_fee_min": 60000.0,
        "average_annual_fee_max": 250000.0,
        "exam_codes": ["TANCET"]
    }
]

SEED_CAREERS = [
    {
        "title": "Data Scientist",
        "slug": "data-scientist",
        "cluster": "Data Intelligence, Artificial Intelligence & Software Systems",
        "industry": "Information Technology & AI",
        "overview": "Data Scientists build statistical algorithms, machine learning models, and automated inference pipelines that convert unstructured datasets into high-impact strategic business actions.",
        "short_description": "Designs predictive machine learning models, statistical architectures, and automated data pipelines.",
        "typical_pathway": "Class 12 (PCM/CS) -> TNEA Counseling -> B.Tech AI & DS / B.E. CSE -> Industry Internships -> Junior Data Scientist -> Senior Data Scientist",
        "entry_education_level": "Bachelor's Degree",
        "salary_range_min": 650000.0,
        "salary_range_max": 1800000.0,
        "growth_rate": "Very High (32% annual expansion)",
        "tamil_nadu_demand": "High Demand across Chennai OMR IT Corridor, Coimbatore TIDEL Park, and Madurai Hubs",
        "work_environment": "Hybrid / Collaborative Tech Innovation Hubs",
        "higher_studies_options": ["M.Tech in Data Science", "MS in Machine Learning", "Ph.D. in Computational AI"],
        "alternative_careers": ["Machine Learning Engineer", "Business Intelligence Architect", "Quantitative Analyst"],
        "skill_names": ["Python", "SQL & Relational Databases", "Machine Learning", "Deep Learning & Neural Networks", "Probability & Applied Statistics", "Data Modeling & ETL Pipelines"],
        "course_codes": ["B.Tech AI & DS", "B.E. CSE", "B.Sc Data Science", "M.Tech Data Science"]
    },
    {
        "title": "Artificial Intelligence Engineer",
        "slug": "ai-engineer",
        "cluster": "Data Intelligence, Artificial Intelligence & Software Systems",
        "industry": "Information Technology & AI",
        "overview": "AI Engineers architect production-grade neural networks, fine-tune foundation models, deploy computer vision/LLM pipelines, and optimize real-time inference on edge or cloud servers.",
        "short_description": "Builds and deploys scalable neural architectures, deep learning models, and generative AI systems.",
        "typical_pathway": "Class 12 (PCM/CS) -> TNEA / JEE Main -> B.Tech AI & DS or B.E. CSE -> M.Tech / Specialized AI Certifications -> AI Systems Engineer",
        "entry_education_level": "Bachelor's Degree",
        "salary_range_min": 750000.0,
        "salary_range_max": 2200000.0,
        "growth_rate": "Exceptional (38% annual expansion)",
        "tamil_nadu_demand": "Rapidly surging across Chennai AI Centers of Excellence and Coimbatore product firms",
        "work_environment": "R&D Labs / High Performance Computing Centers",
        "higher_studies_options": ["M.Tech in AI & Robotics", "Ph.D. in Deep Learning"],
        "alternative_careers": ["Data Scientist", "Computer Vision Specialist", "NLP Engineer"],
        "skill_names": ["Python", "Deep Learning & Neural Networks", "Machine Learning", "Cloud Architecture (AWS/GCP/Azure)", "Docker & Container Orchestration"],
        "course_codes": ["B.Tech AI & DS", "B.E. CSE", "M.Tech Data Science"]
    },
    {
        "title": "Cloud & DevOps Architect",
        "slug": "cloud-devops-architect",
        "cluster": "Data Intelligence, Artificial Intelligence & Software Systems",
        "industry": "Information Technology & AI",
        "overview": "Cloud Architects engineer robust cloud infrastructures, automated CI/CD deployment pipelines, zero-downtime microservices architectures, and serverless computing ecosystems.",
        "short_description": "Architects resilient cloud networks, containerized clusters, and continuous delivery pipelines.",
        "typical_pathway": "Class 12 (PCM/CS) -> TNEA -> B.E. CSE / B.E. ECE -> DevOps Engineer -> Cloud Solutions Architect",
        "entry_education_level": "Bachelor's Degree",
        "salary_range_min": 600000.0,
        "salary_range_max": 1900000.0,
        "growth_rate": "High (26% annual expansion)",
        "tamil_nadu_demand": "Steady high requirement in Chennai SaaS companies and Coimbatore IT infrastructure providers",
        "work_environment": "Hybrid / Global Engineering Teams",
        "higher_studies_options": ["M.Tech in Cloud Computing & Distributed Systems", "Executive MBA"],
        "alternative_careers": ["Site Reliability Engineer (SRE)", "Infrastructure Security Engineer", "System Architect"],
        "skill_names": ["Cloud Architecture (AWS/GCP/Azure)", "Docker & Container Orchestration", "Python", "SQL & Relational Databases", "Cybersecurity & Network Defense"],
        "course_codes": ["B.E. CSE", "B.E. ECE"]
    },
    {
        "title": "Full Stack Software Engineer",
        "slug": "full-stack-engineer",
        "cluster": "Data Intelligence, Artificial Intelligence & Software Systems",
        "industry": "Information Technology & AI",
        "overview": "Full Stack Engineers architect complete web applications from interactive UI component state trees to performant REST/GraphQL backend APIs, microservices, and database schemas.",
        "short_description": "Builds end-to-end web products spanning reactive frontends, resilient backend APIs, and databases.",
        "typical_pathway": "Class 12 (Any stream with Maths/CS) -> TNEA -> B.E. CSE / B.Tech IT -> Software Engineer -> Senior Full Stack Engineer",
        "entry_education_level": "Bachelor's Degree",
        "salary_range_min": 500000.0,
        "salary_range_max": 1600000.0,
        "growth_rate": "Strong (22% annual expansion)",
        "tamil_nadu_demand": "Highest volume recruiter across Chennai, Coimbatore, Trichy, and Madurai tech campuses",
        "work_environment": "Tech Hubs / Product Startups",
        "higher_studies_options": ["M.Tech in Software Engineering", "MBA in Technology Management"],
        "alternative_careers": ["Frontend Architect", "Backend Systems Engineer", "Technical Lead"],
        "skill_names": ["React & TypeScript", "Python", "SQL & Relational Databases", "Docker & Container Orchestration"],
        "course_codes": ["B.E. CSE", "B.Tech AI & DS"]
    },
    {
        "title": "Cybersecurity & Network Defense Specialist",
        "slug": "cybersecurity-specialist",
        "cluster": "Data Intelligence, Artificial Intelligence & Software Systems",
        "industry": "Information Technology & AI",
        "overview": "Protects organizational network assets, performs vulnerability threat assessments, implements cryptographic protections, and manages threat detection in Security Operations Centers (SOC).",
        "short_description": "Defends enterprise systems, cryptographic boundaries, and cloud networks against security breaches.",
        "typical_pathway": "Class 12 (PCM/CS) -> TNEA -> B.E. CSE / B.E. ECE -> Security Analyst -> Certified Ethical Hacker / CISO",
        "entry_education_level": "Bachelor's Degree",
        "salary_range_min": 550000.0,
        "salary_range_max": 1750000.0,
        "growth_rate": "Very High (30% annual expansion)",
        "tamil_nadu_demand": "High demand in Chennai FinTech banking sectors and defense corridor suppliers",
        "work_environment": "Cyber Defense Operations Centers / Corporate Security Teams",
        "higher_studies_options": ["M.Tech in Information Security & Forensics", "MS in Cybersecurity"],
        "alternative_careers": ["Penetration Tester", "Cloud Security Architect", "Cryptographic Engineer"],
        "skill_names": ["Cybersecurity & Network Defense", "Cloud Architecture (AWS/GCP/Azure)", "Python", "Docker & Container Orchestration"],
        "course_codes": ["B.E. CSE", "B.E. ECE"]
    },
    {
        "title": "Embedded Systems & IoT Engineer",
        "slug": "embedded-iot-engineer",
        "cluster": "Engineering Systems, Hardware & Robotics",
        "industry": "Manufacturing & Robotics",
        "overview": "Engineers micro-controller firmware, sensor networks, real-time operating systems (RTOS), and hardware communication protocols for industrial automation and smart automotive electronics.",
        "short_description": "Designs low-level micro-controller firmware, connected sensor devices, and IoT hardware.",
        "typical_pathway": "Class 12 (PCM) -> TNEA -> B.E. ECE / B.E. EEE -> Embedded Developer -> Lead IoT Systems Architect",
        "entry_education_level": "Bachelor's Degree",
        "salary_range_min": 480000.0,
        "salary_range_max": 1500000.0,
        "growth_rate": "High (24% annual expansion)",
        "tamil_nadu_demand": "Booming across automotive manufacturing clusters in Sriperumbudur, Oragadam, and Coimbatore",
        "work_environment": "Embedded Hardware Labs & Automotive R&D Facilities",
        "higher_studies_options": ["M.Tech in Embedded Systems Technologies", "M.Tech in VLSI & Microelectronics"],
        "alternative_careers": ["Firmware Engineer", "IoT Solutions Architect", "Hardware Test Engineer"],
        "skill_names": ["Embedded C / C++", "Electric Vehicle & Battery Systems", "Python", "VLSI Design & Verilog/SystemVerilog"],
        "course_codes": ["B.E. ECE", "B.E. EEE"]
    },
    {
        "title": "Robotics & Automation Engineer",
        "slug": "robotics-engineer",
        "cluster": "Engineering Systems, Hardware & Robotics",
        "industry": "Manufacturing & Robotics",
        "overview": "Develops autonomous robotic manipulators, automated guided vehicles (AGVs), computer-vision inspection systems, and kinematics control software for advanced industrial automation.",
        "short_description": "Builds autonomous robots, sensor integration pipelines, and smart factory robotic systems.",
        "typical_pathway": "Class 12 (PCM) -> TNEA -> B.E. Mechanical & Automation / B.E. ECE -> Robotics Specialization -> Automation Engineer",
        "entry_education_level": "Bachelor's Degree",
        "salary_range_min": 520000.0,
        "salary_range_max": 1650000.0,
        "growth_rate": "High (28% annual expansion)",
        "tamil_nadu_demand": "High demand in Coimbatore pump/foundry modernization and Chennai automotive OEM lines",
        "work_environment": "Advanced Robotics Laboratories & Manufacturing Assembly Plants",
        "higher_studies_options": ["M.Tech in Mechatronics", "MS in Robotics Engineering"],
        "alternative_careers": ["Mechatronics Engineer", "Industrial Automation Architect", "Control Systems Engineer"],
        "skill_names": ["ROS (Robot Operating System)", "Embedded C / C++", "Python", "Machine Learning"],
        "course_codes": ["B.E. Mech & Automation", "B.E. ECE"]
    },
    {
        "title": "Biomedical Instrumentation Engineer",
        "slug": "biomedical-engineer",
        "cluster": "Bio-Sciences, Healthcare & Clinical Research",
        "industry": "Healthcare & Life Sciences",
        "overview": "Designs, calibrates, and optimizes advanced clinical medical equipment including MRI/CT systems, patient telemetry monitors, ventilators, and surgical robotics in tertiary hospitals.",
        "short_description": "Designs hospital diagnostic equipment, therapeutic devices, and digital healthcare bio-sensors.",
        "typical_pathway": "Class 12 (PCM/Biology) -> TNEA -> B.E. Biomedical Engineering -> Hospital Clinical Attachment -> Biomedical Device Specialist",
        "entry_education_level": "Bachelor's Degree",
        "salary_range_min": 450000.0,
        "salary_range_max": 1400000.0,
        "growth_rate": "Moderate-High (20% annual expansion)",
        "tamil_nadu_demand": "Centred around Chennai medical tourism hospitals, MedTech parks, and medical manufacturing units",
        "work_environment": "Tertiary Care Hospitals, Diagnostic Centers & MedTech Equipment Firms",
        "higher_studies_options": ["M.Tech in Medical Electronics", "MS in Bio-engineering"],
        "alternative_careers": ["Clinical Engineering Manager", "Medical Imaging Specialist", "Rehabilitation Engineer"],
        "skill_names": ["Biomedical Signal & Imaging Processing", "Embedded C / C++", "Clinical Data Informatics"],
        "course_codes": ["B.E. Biomedical", "B.E. ECE"]
    },
    {
        "title": "Clinical Data Analyst",
        "slug": "clinical-data-analyst",
        "cluster": "Bio-Sciences, Healthcare & Clinical Research",
        "industry": "Healthcare & Life Sciences",
        "overview": "Manages electronic medical registries, validates clinical trial datasets, ensures regulatory compliance with FDA/CDSCO guidelines, and applies biostatistics to epidemiological studies.",
        "short_description": "Processes clinical trial datasets, public health registries, and biostatistical drug safety data.",
        "typical_pathway": "Class 12 (Biology/Maths) -> B.Sc / B.Tech Bio / CSE -> Clinical Research Fellowship -> Clinical Data Analyst",
        "entry_education_level": "Bachelor's Degree",
        "salary_range_min": 420000.0,
        "salary_range_max": 1350000.0,
        "growth_rate": "High (25% annual expansion)",
        "tamil_nadu_demand": "Thriving in Chennai clinical research organizations (CROs) and global healthcare analytics centers",
        "work_environment": "Pharmaceutical R&D Offices & Clinical Research Organizations",
        "higher_studies_options": ["M.Sc in Biostatistics", "Master of Public Health (MPH)"],
        "alternative_careers": ["Biostatistician", "Health Informatics Officer", "Epidemiological Modeler"],
        "skill_names": ["Clinical Data Informatics", "SQL & Relational Databases", "Probability & Applied Statistics", "Python"],
        "course_codes": ["B.Sc Data Science", "B.E. Biomedical"]
    },
    {
        "title": "Product Manager",
        "slug": "product-manager",
        "cluster": "Management, Corporate Strategy & FinTech",
        "industry": "FinTech & Business",
        "overview": "Orchestrates cross-functional teams of software engineers, UX designers, and marketers to conceptualize, validate, build, and scale digital products that solve high-value customer problems.",
        "short_description": "Defines product roadmaps, features, customer value propositions, and metrics for tech ventures.",
        "typical_pathway": "Class 12 -> B.Tech / B.E. -> Associate PM / Software Engineer -> MBA -> Product Manager",
        "entry_education_level": "Bachelor's Degree + Experience / MBA",
        "salary_range_min": 850000.0,
        "salary_range_max": 2500000.0,
        "growth_rate": "High (25% annual expansion)",
        "tamil_nadu_demand": "Strong concentration in Chennai SaaS unicorns (Zoho, Freshworks) and Bangalore/Coimbatore corridors",
        "work_environment": "Dynamic Product Studios & Corporate Headquarters",
        "higher_studies_options": ["MBA in Product Strategy & Entrepreneurship"],
        "alternative_careers": ["Product Operations Lead", "Strategy Consultant", "Technical Program Manager"],
        "skill_names": ["Product Strategy & Roadmap Planning", "Business Analytics & Financial Modeling", "UI/UX & Interactive Prototyping", "Data Modeling & ETL Pipelines"],
        "course_codes": ["B.E. CSE", "B.Tech AI & DS", "MBA Analytics"]
    },
    {
        "title": "UI/UX Interaction Designer",
        "slug": "ui-ux-designer",
        "cluster": "Creative Design, Human-Computer Interaction & Media",
        "industry": "Information Technology & AI",
        "overview": "Conducts user research, crafts intuitive wireframes, builds interactive design systems in Figma, and designs seamless digital workflows that make complex enterprise software delightful.",
        "short_description": "Crafts digital user interfaces, interaction architectures, and ergonomic design systems.",
        "typical_pathway": "Class 12 (Any stream) -> B.Des / B.E. CSE with Design Portfolio -> Junior UX Designer -> Lead Product Designer",
        "entry_education_level": "Bachelor's Degree",
        "salary_range_min": 450000.0,
        "salary_range_max": 1500000.0,
        "growth_rate": "High (23% annual expansion)",
        "tamil_nadu_demand": "High demand in product design agencies, SaaS businesses, and consumer mobile startups across Tamil Nadu",
        "work_environment": "Design Studios & Creative Tech Hubs",
        "higher_studies_options": ["Master of Design (M.Des)", "MS in Human-Computer Interaction"],
        "alternative_careers": ["Product Designer", "User Researcher", "Visual Design Lead"],
        "skill_names": ["UI/UX & Interactive Prototyping", "React & TypeScript", "Product Strategy & Roadmap Planning"],
        "course_codes": ["B.Des UX", "B.E. CSE"]
    },
    {
        "title": "Business Analytics & Strategy Consultant",
        "slug": "business-analytics-consultant",
        "cluster": "Management, Corporate Strategy & FinTech",
        "industry": "FinTech & Business",
        "overview": "Synthesizes complex operational data into executive dashboards, financial forecasts, and optimization strategies to guide C-level decision-making and revenue growth.",
        "short_description": "Transforms financial and operational data into strategic corporate growth initiatives.",
        "typical_pathway": "Class 12 -> B.Tech / B.Sc / B.Com -> MBA Analytics / TANCET -> Strategy Analyst -> Management Consultant",
        "entry_education_level": "Bachelor's Degree / MBA",
        "salary_range_min": 600000.0,
        "salary_range_max": 1850000.0,
        "growth_rate": "High (24% annual expansion)",
        "tamil_nadu_demand": "Prominent in Chennai financial hubs, management consulting firms, and global capability centers (GCCs)",
        "work_environment": "Consulting Offices & Corporate Headquarters",
        "higher_studies_options": ["MBA in Strategy & Finance", "Executive Management Fellowships"],
        "alternative_careers": ["Financial Analyst", "Operations Research Analyst", "Corporate Strategy Manager"],
        "skill_names": ["Business Analytics & Financial Modeling", "SQL & Relational Databases", "Probability & Applied Statistics", "Python"],
        "course_codes": ["B.Sc Data Science", "MBA Analytics", "B.Tech AI & DS"]
    },
    {
        "title": "Electric Vehicle & Battery Systems Engineer",
        "slug": "ev-systems-engineer",
        "cluster": "Engineering Systems, Hardware & Robotics",
        "industry": "Manufacturing & Robotics",
        "overview": "Designs battery pack thermal management architectures, motor drive controllers, regenerative braking algorithms, and high-voltage charging networks for clean mobility.",
        "short_description": "Engineers battery packs, power electronics, and motor controllers for electric vehicles.",
        "typical_pathway": "Class 12 (PCM) -> TNEA -> B.E. EEE / B.E. Mechanical -> EV Specialization -> Battery Systems Engineer",
        "entry_education_level": "Bachelor's Degree",
        "salary_range_min": 500000.0,
        "salary_range_max": 1600000.0,
        "growth_rate": "Very High (35% annual expansion)",
        "tamil_nadu_demand": "Tamil Nadu is India's premier EV hub (Ola Electric, TVS, Ather in Hosur/Chennai corridors)",
        "work_environment": "Automotive Test Tracks, Clean Tech Laboratories & Gigafactories",
        "higher_studies_options": ["M.Tech in E-Mobility & Power Electronics", "MS in Automotive Engineering"],
        "alternative_careers": ["BMS Hardware Architect", "Power Electronics Engineer", "Thermal Simulation Specialist"],
        "skill_names": ["Electric Vehicle & Battery Systems", "Embedded C / C++", "Probability & Applied Statistics"],
        "course_codes": ["B.E. EEE", "B.E. Mech & Automation"]
    },
    {
        "title": "VLSI & Chip Design Engineer",
        "slug": "vlsi-chip-design-engineer",
        "cluster": "Engineering Systems, Hardware & Robotics",
        "industry": "Manufacturing & Robotics",
        "overview": "Architects micro-scale integrated circuits (ICs), develops Verilog RTL descriptions, performs physical synthesis, and verifies semiconductor timing closures for next-gen silicon chips.",
        "short_description": "Designs semiconductor integrated circuits, RTL logic architectures, and microchip hardware.",
        "typical_pathway": "Class 12 (PCM) -> TNEA / JEE -> B.E. ECE / B.E. EEE -> M.Tech VLSI via GATE/CEETA-PG -> ASIC Design Engineer",
        "entry_education_level": "Bachelor's / Master's Degree",
        "salary_range_min": 700000.0,
        "salary_range_max": 2400000.0,
        "growth_rate": "Very High (31% annual expansion)",
        "tamil_nadu_demand": "High demand in Chennai semiconductor design centers and semiconductor R&D ventures",
        "work_environment": "Silicon Semiconductor Laboratories & Cleanroom Centers",
        "higher_studies_options": ["M.Tech in VLSI Design & Microelectronics", "Ph.D. in Semiconductor Physics"],
        "alternative_careers": ["FPGA Design Engineer", "Physical Design Specialist", "Verification Engineer"],
        "skill_names": ["VLSI Design & Verilog/SystemVerilog", "Embedded C / C++", "Probability & Applied Statistics"],
        "course_codes": ["B.E. ECE", "B.E. EEE"]
    }
]

def seed_career_database(db: Session) -> dict:
    """
    Seeds skills, entrance exams, courses, and careers along with all
    inter-connecting relationship associations (career_skills, course_exams, career_courses).
    Idempotent: skips if already populated.
    """
    if db.query(Career).count() > 0:
        return {
            "skills": db.query(Skill).count(),
            "exams": db.query(EntranceExam).count(),
            "courses": db.query(Course).count(),
            "careers": db.query(Career).count()
        }

    # 1. Seed Skills
    skill_objs = {}
    for s_data in SEED_SKILLS:
        skill = Skill(**s_data)
        db.add(skill)
        db.flush()
        skill_objs[skill.name] = skill

    # 2. Seed Entrance Exams
    exam_objs = {}
    for e_data in SEED_EXAMS:
        exam = EntranceExam(**e_data)
        db.add(exam)
        db.flush()
        exam_objs[exam.short_code] = exam

    # 3. Seed Courses and link CourseExams
    course_objs = {}
    for c_data in SEED_COURSES:
        c_copy = dict(c_data)
        exam_codes = c_copy.pop("exam_codes", [])
        course = Course(**c_copy)
        db.add(course)
        db.flush()
        course_objs[course.short_code] = course

        for code in exam_codes:
            exam = exam_objs.get(code)
            if exam:
                ce = CourseExam(course_id=course.id, exam_id=exam.id, is_mandatory=True)
                db.add(ce)

    # 4. Seed Careers, link CareerSkills and CareerCourses
    career_count = 0
    for car_data in SEED_CAREERS:
        car_copy = dict(car_data)
        skill_names = car_copy.pop("skill_names", [])
        course_codes = car_copy.pop("course_codes", [])

        career = Career(**car_copy)
        db.add(career)
        db.flush()
        career_count += 1

        # Link Career Skills
        for s_name in skill_names:
            skill = skill_objs.get(s_name)
            if skill:
                cs = CareerSkill(career_id=career.id, skill_id=skill.id, importance_weight=1.5, is_core=True)
                db.add(cs)

        # Link Career Courses
        for c_idx, c_code in enumerate(course_codes):
            course = course_objs.get(c_code)
            if course:
                cc = CareerCourse(
                    career_id=career.id,
                    course_id=course.id,
                    is_primary=(c_idx == 0),
                    relevance_score=100.0 - (c_idx * 10.0)
                )
                db.add(cc)

    db.commit()

    return {
        "skills": len(skill_objs),
        "exams": len(exam_objs),
        "courses": len(course_objs),
        "careers": career_count
    }
