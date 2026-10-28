import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  GraduationCap,
  Heart,
  Wrench,
  Sliders,
  Wallet,
  Target,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Loader2,
  Plus,
  Trash2
} from 'lucide-react';
import { profileApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { ProgressBar } from '../../components/ui/ProgressBar';
import type { StudentProfileData } from '../../types/profile';

const TN_DISTRICTS = [
  'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri',
  'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram', 'Kanyakumari', 'Karur',
  'Krishnagiri', 'Madurai', 'Mayiladuthurai', 'Nagapattinam', 'Namakkal',
  'Nilgiris', 'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem',
  'Sivaganga', 'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli',
  'Tirunelveli', 'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai',
  'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar'
];

const INTEREST_OPTIONS = [
  'Technology', 'Healthcare', 'Finance', 'Design', 'Business', 'Science',
  'Engineering', 'Law', 'Media & Arts', 'Education', 'Government', 'Research',
  'Agriculture', 'Environment', 'Cybersecurity', 'Artificial Intelligence'
];

const PRESET_SKILLS = [
  'Python', 'Java', 'C / C++', 'JavaScript', 'SQL', 'Data Analysis',
  'Problem Solving', 'Communication', 'Mathematics', 'Critical Thinking',
  'Machine Learning', 'Web Development', 'Public Speaking', 'Leadership'
];

export const OnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState<StudentProfileData>({
    state: 'Tamil Nadu',
    district: 'Chennai',
    city: '',
    age: 18,
    gender: 'Prefer not to say',
    current_education_level: 'Class 12',
    school_or_college: '',
    board_or_university: 'Tamil Nadu State Board',
    stream: 'Computer Science & Maths',
    percentage_or_cgpa: 85,
    subject_marks: { 'Mathematics': 90, 'Physics': 85, 'Chemistry': 82, 'Computer Science': 92 },
    interests: ['Technology', 'Engineering'],
    skills: [{ name: 'Python', level: 70 }, { name: 'Problem Solving', level: 75 }],
    preferred_locations: ['Chennai', 'Coimbatore'],
    preferred_career_areas: ['Data Science', 'Software Engineering'],
    govt_or_private: 'Any',
    higher_studies_preference: 'B.Tech / B.E.',
    study_mode: 'Full-time',
    college_type: 'Any',
    annual_family_income: '2.5 - 5 Lakhs',
    max_education_budget: 150000,
    need_scholarship: false,
    hostel_required: false,
    preferred_fee_range: '< 1.5 Lakhs',
    short_term_goal: '',
    long_term_goal: '',
    target_career: 'Data Scientist',
    higher_study_interest: false,
    onboarding_completed: false,
  });

  // Custom inputs state
  const [customSubjectName, setCustomSubjectName] = useState('');
  const [customSubjectMark, setCustomSubjectMark] = useState<number>(80);
  const [customSkillName, setCustomSkillName] = useState('');

  // Load existing profile from backend
  useEffect(() => {
    profileApi.getProfile()
      .then((profile) => {
        if (profile) {
          setFormData((prev) => ({
            ...prev,
            ...profile,
            interests: profile.interests?.length ? profile.interests : prev.interests,
            skills: profile.skills?.length ? profile.skills : prev.skills,
            subject_marks: Object.keys(profile.subject_marks || {}).length ? profile.subject_marks : prev.subject_marks,
          }));
        }
      })
      .catch(() => {
        // use defaults
      })
      .finally(() => setInitialLoading(false));
  }, []);

  const handleNext = async () => {
    // Save intermediate step
    try {
      await profileApi.updateProfile(formData);
      if (currentStep < 7) {
        setCurrentStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        handleFinalSubmit();
      }
    } catch (err: any) {
      toastError('Save Error', err.message || 'Failed to save progress.');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      const finalData: Partial<StudentProfileData> = {
        ...formData,
        onboarding_completed: true,
      };
      await profileApi.updateProfile(finalData);
      await refreshUser();
      success('Onboarding Completed!', 'Your Career DNA and personalized recommendations have been initialized.');
      navigate('/career-dna');
    } catch (err: any) {
      toastError('Submission Error', err.message || 'Failed to complete onboarding.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setFormData({
      state: 'Tamil Nadu',
      district: 'Coimbatore',
      city: 'Coimbatore',
      age: 18,
      gender: 'Male',
      current_education_level: 'Class 12',
      school_or_college: 'PSG Sarvajana Higher Secondary School',
      board_or_university: 'Tamil Nadu State Board',
      stream: 'Computer Science & Maths',
      percentage_or_cgpa: 91.5,
      subject_marks: { 'Mathematics': 96, 'Physics': 90, 'Chemistry': 84, 'Computer Science': 98 },
      interests: ['Technology', 'Artificial Intelligence', 'Research', 'Engineering'],
      skills: [
        { name: 'Python', level: 75 },
        { name: 'Problem Solving', level: 85 },
        { name: 'SQL', level: 60 },
        { name: 'Communication', level: 70 },
      ],
      preferred_locations: ['Coimbatore', 'Chennai', 'Tiruchirappalli'],
      preferred_career_areas: ['Data Science', 'AI & Machine Learning'],
      govt_or_private: 'Government Aided',
      higher_studies_preference: 'B.Tech / B.E.',
      study_mode: 'Full-time',
      college_type: 'Government Aided',
      annual_family_income: '2.5 - 5 Lakhs',
      max_education_budget: 120000,
      need_scholarship: true,
      hostel_required: true,
      preferred_fee_range: '< 1.5 Lakhs',
      short_term_goal: 'Secure admission in top Tamil Nadu engineering college for AI/DS',
      long_term_goal: 'Work as an AI Research Scientist and build accessible intelligence solutions',
      target_career: 'Data Scientist',
      higher_study_interest: true,
      onboarding_completed: false,
    });
    success('Sample Data Loaded', 'Tamil Nadu demonstration student profile filled in.');
  };

  // Helper toggle functions
  const toggleInterest = (interest: string) => {
    setFormData((prev) => {
      const exists = prev.interests.includes(interest);
      const updated = exists ? prev.interests.filter((i) => i !== interest) : [...prev.interests, interest];
      return { ...prev, interests: updated };
    });
  };

  const toggleLocation = (loc: string) => {
    setFormData((prev) => {
      const exists = prev.preferred_locations.includes(loc);
      const updated = exists ? prev.preferred_locations.filter((l) => l !== loc) : [...prev.preferred_locations, loc];
      return { ...prev, preferred_locations: updated };
    });
  };

  const addSubjectMark = () => {
    if (!customSubjectName.trim()) return;
    setFormData((prev) => ({
      ...prev,
      subject_marks: {
        ...(prev.subject_marks || {}),
        [customSubjectName.trim()]: customSubjectMark,
      },
    }));
    setCustomSubjectName('');
  };

  const removeSubjectMark = (subjectKey: string) => {
    setFormData((prev) => {
      const next = { ...(prev.subject_marks || {}) };
      delete next[subjectKey];
      return { ...prev, subject_marks: next };
    });
  };

  const addSkill = (skillName: string, level = 50) => {
    if (!skillName.trim()) return;
    setFormData((prev) => {
      const exists = prev.skills.some((s) => s.name.toLowerCase() === skillName.toLowerCase());
      if (exists) return prev;
      return { ...prev, skills: [...prev.skills, { name: skillName.trim(), level }] };
    });
    setCustomSkillName('');
  };

  const updateSkillLevel = (name: string, level: number) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.map((s) => (s.name === name ? { ...s, level } : s)),
    }));
  };

  const removeSkill = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s.name !== name),
    }));
  };

  if (initialLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
        <span className="text-xs font-semibold text-zinc-500">Loading your profile record...</span>
      </div>
    );
  }

  const stepsMeta = [
    { num: 1, title: 'Basic Information', icon: User, desc: 'Location, age & current level' },
    { num: 2, title: 'Academic Profile', icon: GraduationCap, desc: 'School, board & marks' },
    { num: 3, title: 'Interests', icon: Heart, desc: 'Domains and passions' },
    { num: 4, title: 'Skills & Aptitudes', icon: Wrench, desc: 'Technical & soft skill ratings' },
    { num: 5, title: 'Preferences', icon: Sliders, desc: 'Location, mode & college type' },
    { num: 6, title: 'Financial Profile', icon: Wallet, desc: 'Income, budget & scholarships' },
    { num: 7, title: 'Goals & Ambitions', icon: Target, desc: 'Target career & timeline' },
  ];

  return (
    <div className="max-w-3xl mx-auto py-6 font-sans">
      {/* Wizard Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              <span>Step {currentStep} of 7 • Student Onboarding</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              {stepsMeta[currentStep - 1].title}
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              {stepsMeta[currentStep - 1].desc}
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleFillDemo}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-pink-500" />}
            className="hidden sm:inline-flex"
          >
            Fill TN Sample Data
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mt-5">
          <ProgressBar
            value={(currentStep / 7) * 100}
            color="violet"
            size="sm"
            label={`Progress (${currentStep}/7)`}
          />
        </div>
      </div>

      {/* Main Card with Step Content */}
      <Card className="p-6 sm:p-8">
        {/* STEP 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                disabled
                value={user?.name || ''}
                helperText="Synced from account"
              />

              <Input
                label="Age"
                type="number"
                min={13}
                max={50}
                value={formData.age || ''}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || undefined })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Gender"
                value={formData.gender || ''}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                options={[
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' },
                  { value: 'Other', label: 'Other' },
                  { value: 'Prefer not to say', label: 'Prefer not to say' },
                ]}
              />

              <Select
                label="Current Education Level"
                value={formData.current_education_level || ''}
                onChange={(e) => setFormData({ ...formData, current_education_level: e.target.value })}
                options={[
                  { value: 'Class 10', label: 'Class 10 (SSLC)' },
                  { value: 'Class 11', label: 'Class 11 (HSC +1)' },
                  { value: 'Class 12', label: 'Class 12 (HSC +2)' },
                  { value: 'Diploma', label: 'Polytechnic Diploma' },
                  { value: 'Undergraduate', label: 'Undergraduate (B.Tech / B.Sc / B.A / B.Com)' },
                  { value: 'Postgraduate', label: 'Postgraduate (M.Tech / M.Sc / MBA / M.A)' },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="State"
                value={formData.state}
                disabled
                helperText="Tamil Nadu geographical focus"
              />

              <Select
                label="District (Tamil Nadu)"
                value={formData.district || ''}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                options={TN_DISTRICTS.map((d) => ({ value: d, label: d }))}
              />

              <Input
                label="City / Town"
                placeholder="e.g. Pollachi / Tambaram"
                value={formData.city || ''}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* STEP 2: Academic Profile */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="School or College Name"
                placeholder="e.g. St. Joseph's Higher Secondary School"
                value={formData.school_or_college || ''}
                onChange={(e) => setFormData({ ...formData, school_or_college: e.target.value })}
              />

              <Select
                label="Board or University"
                value={formData.board_or_university || ''}
                onChange={(e) => setFormData({ ...formData, board_or_university: e.target.value })}
                options={[
                  { value: 'Tamil Nadu State Board', label: 'Tamil Nadu State Board (Samacheer Kalvi)' },
                  { value: 'CBSE', label: 'CBSE (Central Board)' },
                  { value: 'ICSE/ISC', label: 'ICSE / ISC' },
                  { value: 'Anna University', label: 'Anna University Affiliated' },
                  { value: 'University of Madras', label: 'University of Madras' },
                  { value: 'Bharathiar University', label: 'Bharathiar University' },
                  { value: 'Other', label: 'Other Recognized Board / University' },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Academic Stream"
                value={formData.stream || ''}
                onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                options={[
                  { value: 'Computer Science & Maths', label: 'Computer Science & Maths' },
                  { value: 'Bio-Maths', label: 'Bio-Maths' },
                  { value: 'Pure Science (Bio-Physics-Chem)', label: 'Pure Science' },
                  { value: 'Commerce with Business Maths', label: 'Commerce with Business Maths' },
                  { value: 'Commerce with Computer Applications', label: 'Commerce with Computer Applications' },
                  { value: 'Arts & Humanities', label: 'Arts & Humanities' },
                  { value: 'Engineering / Technology', label: 'Engineering / Technology' },
                ]}
              />

              <Input
                label="Overall Percentage / CGPA"
                type="number"
                step="0.1"
                min={0}
                max={100}
                placeholder="e.g. 91.5"
                value={formData.percentage_or_cgpa || ''}
                onChange={(e) => setFormData({ ...formData, percentage_or_cgpa: parseFloat(e.target.value) || undefined })}
              />
            </div>

            {/* Subject Marks Breakdown */}
            <div className="pt-2 border-t border-zinc-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2">
                Subject-wise Performance
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                {Object.entries(formData.subject_marks || {}).map(([subject, mark]) => (
                  <div key={subject} className="flex items-center justify-between p-2.5 rounded-xl bg-violet-50/70 border border-violet-100 text-xs">
                    <div>
                      <span className="font-semibold text-zinc-900 block truncate">{subject}</span>
                      <span className="text-violet-700 font-bold">{mark}/100</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSubjectMark(subject)}
                      className="p-1 text-zinc-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Subject name (e.g. Maths)"
                  value={customSubjectName}
                  onChange={(e) => setCustomSubjectName(e.target.value)}
                  className="flex-1 py-2 px-3 text-xs bg-zinc-50 border border-zinc-200 rounded-xl"
                />
                <input
                  type="number"
                  placeholder="Marks (0-100)"
                  min={0}
                  max={100}
                  value={customSubjectMark}
                  onChange={(e) => setCustomSubjectMark(parseInt(e.target.value) || 0)}
                  className="w-24 py-2 px-3 text-xs bg-zinc-50 border border-zinc-200 rounded-xl"
                />
                <Button size="sm" variant="secondary" onClick={addSubjectMark} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                  Add
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Interests */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <p className="text-xs text-zinc-600">
              Select all domains that genuinely excite or interest you. These form a key pillar in your Career DNA compatibility score.
            </p>

            <div className="flex flex-wrap gap-2.5 pt-2">
              {INTEREST_OPTIONS.map((interest) => {
                const isSelected = formData.interests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                      isSelected
                        ? 'bg-violet-600 text-white border-violet-600 shadow-sm shadow-violet-500/20'
                        : 'bg-white text-zinc-700 border-zinc-200 hover:border-violet-300 hover:bg-violet-50/50'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5" />}
                    <span>{interest}</span>
                  </button>
                );
              })}
            </div>
            <div className="pt-2 text-xs text-zinc-500">
              Selected: <span className="font-bold text-violet-700">{formData.interests.length} interests</span>
            </div>
          </div>
        )}

        {/* STEP 4: Skills */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <p className="text-xs text-zinc-600">
              Rate your current comfort and proficiency in the following skills (1 to 100).
            </p>

            {/* Presets to quickly add */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Quick Add Skills</span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_SKILLS.map((skill) => {
                  const alreadyAdded = formData.skills.some((s) => s.name.toLowerCase() === skill.toLowerCase());
                  return (
                    <button
                      key={skill}
                      type="button"
                      disabled={alreadyAdded}
                      onClick={() => addSkill(skill, 60)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                        alreadyAdded
                          ? 'bg-zinc-100 text-zinc-400 border-zinc-200 cursor-default'
                          : 'bg-white text-zinc-700 border-zinc-200 hover:border-violet-300 hover:bg-violet-50'
                      }`}
                    >
                      + {skill}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Skills List with Sliders */}
            <div className="space-y-4 pt-2">
              {formData.skills.map((skill) => (
                <div key={skill.name} className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-800">{skill.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-violet-700">{skill.level}%</span>
                      <button
                        type="button"
                        onClick={() => removeSkill(skill.name)}
                        className="text-zinc-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={skill.level}
                    onChange={(e) => updateSkillLevel(skill.name, parseInt(e.target.value))}
                    className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                  />
                </div>
              ))}
            </div>

            {/* Custom Skill Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Custom skill name..."
                value={customSkillName}
                onChange={(e) => setCustomSkillName(e.target.value)}
                className="flex-1 py-2 px-3 text-xs bg-zinc-50 border border-zinc-200 rounded-xl"
              />
              <Button size="sm" variant="secondary" onClick={() => addSkill(customSkillName, 60)} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                Add Custom Skill
              </Button>
            </div>
          </div>
        )}

        {/* STEP 5: Preferences */}
        {currentStep === 5 && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2">
                Preferred Study Locations in Tamil Nadu
              </label>
              <div className="flex flex-wrap gap-2">
                {['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Vellore'].map((loc) => {
                  const isSel = formData.preferred_locations.includes(loc);
                  return (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => toggleLocation(loc)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                        isSel ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-zinc-700 border-zinc-200'
                      }`}
                    >
                      {loc}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Institution Management Type"
                value={formData.college_type || 'Any'}
                onChange={(e) => setFormData({ ...formData, college_type: e.target.value })}
                options={[
                  { value: 'Any', label: 'Any (Govt, Aided & Private)' },
                  { value: 'Government', label: 'Government Only' },
                  { value: 'Government Aided', label: 'Government Aided' },
                  { value: 'Private Autonomous', label: 'Private Autonomous' },
                ]}
              />

              <Select
                label="Career Sector Preference"
                value={formData.govt_or_private || 'Any'}
                onChange={(e) => setFormData({ ...formData, govt_or_private: e.target.value })}
                options={[
                  { value: 'Any', label: 'Any Sector (Public or Private)' },
                  { value: 'Government', label: 'Government / Public Sector (PSU, TNPSC)' },
                  { value: 'Private', label: 'Private Tech / Corporate Sector' },
                  { value: 'Startup / Entrepreneurship', label: 'Startups & Entrepreneurship' },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Study Mode"
                value={formData.study_mode || 'Full-time'}
                onChange={(e) => setFormData({ ...formData, study_mode: e.target.value })}
                options={[
                  { value: 'Full-time', label: 'Regular Full-time Classroom' },
                  { value: 'Online/Hybrid', label: 'Online / Hybrid' },
                ]}
              />

              <Input
                label="Higher Studies Aspirations"
                placeholder="e.g. M.Tech in AI or MS Abroad"
                value={formData.higher_studies_preference || ''}
                onChange={(e) => setFormData({ ...formData, higher_studies_preference: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* STEP 6: Financial Profile */}
        {currentStep === 6 && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Annual Family Income Range"
                value={formData.annual_family_income || ''}
                onChange={(e) => setFormData({ ...formData, annual_family_income: e.target.value })}
                options={[
                  { value: '< 1.5 Lakhs', label: 'Less than ₹1.5 Lakhs / year' },
                  { value: '1.5 - 2.5 Lakhs', label: '₹1.5 - ₹2.5 Lakhs / year' },
                  { value: '2.5 - 5 Lakhs', label: '₹2.5 - ₹5.0 Lakhs / year' },
                  { value: '5 - 10 Lakhs', label: '₹5.0 - ₹10.0 Lakhs / year' },
                  { value: '> 10 Lakhs', label: 'Above ₹10.0 Lakhs / year' },
                ]}
              />

              <Input
                label="Maximum Annual Education Budget (₹ INR)"
                type="number"
                step="10000"
                placeholder="e.g. 150000"
                value={formData.max_education_budget || ''}
                onChange={(e) => setFormData({ ...formData, max_education_budget: parseFloat(e.target.value) || 0 })}
                helperText="Estimated affordable fees + hostel per year"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-zinc-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-zinc-900 block">Need Scholarship Support?</span>
                  <span className="text-[11px] text-zinc-500">Filter regional and merit scholarships</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.need_scholarship || false}
                  onChange={(e) => setFormData({ ...formData, need_scholarship: e.target.checked })}
                  className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500"
                />
              </div>

              <div className="p-4 rounded-xl border border-zinc-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-zinc-900 block">Hostel Accommodation Needed?</span>
                  <span className="text-[11px] text-zinc-500">Calculate hostel expenses in financial feasibility</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.hostel_required || false}
                  onChange={(e) => setFormData({ ...formData, hostel_required: e.target.checked })}
                  className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: Goals & Target Career */}
        {currentStep === 7 && (
          <div className="space-y-5">
            <Input
              label="Target Career Goal (Optional or Dream Career)"
              placeholder="e.g. Data Scientist / Software Engineer / Aerospace Specialist"
              value={formData.target_career || ''}
              onChange={(e) => setFormData({ ...formData, target_career: e.target.value })}
              helperText="The recommendation engine will benchmark your skill gaps against this"
            />

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Short-Term Goal (Next 1–2 Years)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Gain admission in a top engineering/arts college in Tamil Nadu with scholarship support..."
                value={formData.short_term_goal || ''}
                onChange={(e) => setFormData({ ...formData, short_term_goal: e.target.value })}
                className="w-full py-2.5 px-3.5 bg-zinc-50/60 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Long-Term Goal (Next 5–10 Years)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Lead machine learning projects, build sustainable software products, or pursue research..."
                value={formData.long_term_goal || ''}
                onChange={(e) => setFormData({ ...formData, long_term_goal: e.target.value })}
                className="w-full py-2.5 px-3.5 bg-zinc-50/60 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-600 transition-all"
              />
            </div>

            <div className="p-4 rounded-xl bg-violet-50 border border-violet-100 flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-violet-900">
                <span className="font-bold block">Ready to Generate Career DNA & Matches</span>
                Clicking complete will compute your multi-dimensional profile indicators and explainable career fits.
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="mt-8 pt-6 border-t border-zinc-100 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleBack}
            disabled={currentStep === 1}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleNext}
            isLoading={loading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {currentStep === 7 ? 'Complete Onboarding' : 'Save & Continue'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
