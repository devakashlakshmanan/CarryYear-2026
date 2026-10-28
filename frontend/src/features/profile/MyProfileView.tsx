import React, { useEffect, useState } from 'react';
import {
  GraduationCap,
  MapPin,
  Award,
  Wallet,
  Save,
  RotateCcw,
  HelpCircle
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { useToast } from '../../components/ui/Toast';
import { profileApi } from '../../services/api';
import type { StudentProfileData } from '../../types/profile';

const TN_DISTRICTS = [
  'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli',
  'Erode', 'Vellore', 'Thanjavur', 'Dindigul', 'Kanchipuram', 'Chengalpattu',
  'Tiruppur', 'Cuddalore', 'Villupuram', 'Nagapattinam', 'Namakkal', 'Karur',
  'Krishnagiri', 'Dharmapuri', 'Ramanathapuram', 'Sivaganga', 'Virudhunagar',
  'Theni', 'Thoothukudi', 'Kanniyakumari', 'Nilgiris', 'Tiruvallur', 'Tiruvannamalai'
];

const COMMUNITIES = [
  { value: 'OC', label: 'Open Competition (OC)' },
  { value: 'BC', label: 'Backward Class (BC)' },
  { value: 'BCM', label: 'Backward Class Muslim (BCM)' },
  { value: 'MBC', label: 'Most Backward Class / DNC (MBC/DNC)' },
  { value: 'SC', label: 'Scheduled Caste (SC)' },
  { value: 'SCA', label: 'Scheduled Caste Arunthathiyar (SCA)' },
  { value: 'ST', label: 'Scheduled Tribe (ST)' },
];

export const MyProfileView: React.FC = () => {
  const { success, error: toastError, info } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Profile Form State
  const [form, setForm] = useState<StudentProfileData>({
    state: 'Tamil Nadu',
    district: 'Chennai',
    city: '',
    community: 'BC',
    current_education_level: 'Class 12',
    school_or_college: '',
    board_or_university: 'Tamil Nadu State Board',
    stream: 'Computer Science & Maths',
    percentage_or_cgpa: 85.0,
    subject_marks: {
      Mathematics: 90,
      Physics: 85,
      Chemistry: 85,
      'Computer Science': 90
    },
    is_first_graduate: false,
    is_govt_school: false,
    annual_family_income: '2.5 - 5 Lakhs',
    max_education_budget: 120000,
    need_scholarship: true,
    hostel_required: false,
    preferred_locations: ['Chennai', 'Coimbatore'],
    preferred_career_areas: ['Information Technology', 'Data Science & AI'],
    target_career: 'Data Scientist',
    interests: ['Technology', 'Science'],
    skills: [{ name: 'Python', level: 75 }],
    onboarding_completed: true,
  });

  const [initialForm, setInitialForm] = useState<StudentProfileData | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profileApi.getProfile();
      if (data) {
        const merged: StudentProfileData = {
          ...data,
          state: data.state || 'Tamil Nadu',
          district: data.district || 'Chennai',
          community: data.community || 'BC',
          current_education_level: data.current_education_level || 'Class 12',
          board_or_university: data.board_or_university || 'Tamil Nadu State Board',
          stream: data.stream || 'Computer Science & Maths',
          subject_marks: data.subject_marks && Object.keys(data.subject_marks).length > 0 
            ? data.subject_marks 
            : { Mathematics: 90, Physics: 85, Chemistry: 85, 'Computer Science': 90 },
          preferred_locations: data.preferred_locations?.length ? data.preferred_locations : ['Chennai', 'Coimbatore'],
          interests: data.interests || [],
          skills: data.skills || [],
          onboarding_completed: Boolean(data.onboarding_completed),
        };
        setForm(merged);
        setInitialForm(merged);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load profile record');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubjectMarkChange = (subject: string, val: number) => {
    const clamped = Math.max(0, Math.min(100, isNaN(val) ? 0 : val));
    setForm((prev) => ({
      ...prev,
      subject_marks: {
        ...(prev.subject_marks || {}),
        [subject]: clamped
      }
    }));
  };

  // Calculate estimated TNEA Cutoff (Maths + Physics/2 + Chemistry/2)
  const calcCutoff = () => {
    const m = form.subject_marks?.Mathematics || form.subject_marks?.Maths || 0;
    const p = form.subject_marks?.Physics || 0;
    const c = form.subject_marks?.Chemistry || 0;
    return Number((m + (p / 2) + (c / 2)).toFixed(2));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (form.percentage_or_cgpa !== undefined && (form.percentage_or_cgpa < 0 || form.percentage_or_cgpa > 100)) {
      toastError('Validation Error', 'Academic percentage must be between 0 and 100.');
      return;
    }

    try {
      setSaving(true);
      const updated = await profileApi.updateProfile({
        ...form,
        percentage_or_cgpa: Number(form.percentage_or_cgpa),
        max_education_budget: Number(form.max_education_budget),
      });

      setForm((prev) => ({ ...prev, ...updated }));
      setInitialForm((prev) => ({ ...prev, ...updated } as StudentProfileData));

      success('Profile Saved', 'Your academic profile and counseling preferences were successfully updated in the database.');
    } catch (err: any) {
      toastError('Save Failed', err?.response?.data?.detail || err?.message || 'Could not save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (initialForm) {
      setForm(initialForm);
      info('Changes Reverted', 'Form restored to last saved database state.');
    }
  };

  if (loading) {
    return (
      <div className="py-16">
        <LoadingState message="Retrieving your student profile record..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12">
        <ErrorState title="Profile Error" message={error} onRetry={fetchProfile} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 animate-fadeIn max-w-5xl mx-auto">
      <PageHeader
        title="Student Profile & Academic Record"
        subtitle="Manage your community category, academic marks, Tamil Nadu counseling jurisdiction, quota claims, and education preferences."
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'My Profile', path: '/profile' }
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Top Summary Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-violet-900 to-purple-900 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white text-2xl font-bold">
              {form.user_name ? form.user_name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold">{form.user_name || 'Student Aspirant'}</h2>
                <Badge variant="primary" className="bg-white/20 text-white text-[11px] border-white/30">
                  {form.community || 'BC'} Quota
                </Badge>
              </div>
              <p className="text-xs text-violet-200 mt-0.5">{form.user_email || 'student@carryyear.in'}</p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-violet-100">
                <span>📍 {form.district}, {form.state}</span>
                <span>•</span>
                <span>🎓 {form.stream || 'Class 12'}</span>
                <span>•</span>
                <span className="font-semibold text-emerald-300">TNEA Cutoff Est: {calcCutoff()} / 200</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs h-9"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={saving}
              className="bg-white text-violet-900 hover:bg-violet-50 font-bold text-xs h-9 shadow-sm"
            >
              <Save className="w-3.5 h-3.5 mr-1" />
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </div>

        {/* Section 1: Community Category & Jurisdiction */}
        <Card className="p-6 border-zinc-200/80 shadow-sm bg-white space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-violet-700" />
              1. Community Category & Jurisdiction
            </span>
            <span className="text-[11px] text-zinc-500">Tamil Nadu State Counseling Matrix</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-zinc-700 block mb-1">
                Community Reservation Category *
              </label>
              <select
                value={form.community || 'BC'}
                onChange={(e) => setForm({ ...form, community: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-medium outline-none focus:border-violet-600 focus:bg-white"
              >
                {COMMUNITIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-zinc-500 mt-1 block">
                Declared quota applied during TNEA single-window matching.
              </span>
            </div>

            <div>
              <label className="font-semibold text-zinc-700 block mb-1">Home State</label>
              <input
                type="text"
                value={form.state}
                disabled
                className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-500 font-medium cursor-not-allowed"
              />
              <span className="text-[10px] text-zinc-400 mt-1 block">Native Tamil Nadu Jurisdiction</span>
            </div>

            <div>
              <label className="font-semibold text-zinc-700 block mb-1">District *</label>
              <select
                value={form.district || 'Chennai'}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-medium outline-none focus:border-violet-600 focus:bg-white"
              >
                {TN_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-zinc-500 mt-1 block">Used for regional college preference</span>
            </div>
          </div>

          <div className="p-3 bg-violet-50/60 rounded-xl border border-violet-100 text-[11px] text-zinc-600 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-violet-700 shrink-0 mt-0.5" />
            <span>
              <strong>Counseling Rule Notice:</strong> Community categories are applicant-declared for eligibility simulations. Official seat allotment requires verification of your permanent community certificate during TNEA document scrutiny.
            </span>
          </div>
        </Card>

        {/* Section 2: Quota & Government Schemes */}
        <Card className="p-6 border-zinc-200/80 shadow-sm bg-white space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-violet-700" />
              2. Special Quotas & Fee Waiver Eligibility Claims
            </span>
            <span className="text-[11px] text-zinc-500">Subject to Tahsildar / Headmaster certificate</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* First Graduate */}
            <div
              onClick={() => setForm({ ...form, is_first_graduate: !form.is_first_graduate })}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                form.is_first_graduate 
                  ? 'border-violet-500 bg-violet-50/60' 
                  : 'border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50'
              }`}
            >
              <input
                type="checkbox"
                checked={Boolean(form.is_first_graduate)}
                onChange={() => {}}
                className="w-4 h-4 text-violet-700 rounded border-zinc-300 mt-0.5 cursor-pointer accent-violet-700"
              />
              <div className="space-y-1">
                <span className="font-bold text-zinc-900 block text-xs">
                  Tamil Nadu First Graduate Applicant
                </span>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Claim tuition waiver (up to ₹25,000/year) if no siblings or parents in your family hold a university degree.
                </p>
                {form.is_first_graduate && (
                  <span className="inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Tuition Concession Active in Simulator
                  </span>
                )}
              </div>
            </div>

            {/* 7.5% Govt School Quota */}
            <div
              onClick={() => setForm({ ...form, is_govt_school: !form.is_govt_school })}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                form.is_govt_school 
                  ? 'border-violet-500 bg-violet-50/60' 
                  : 'border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50'
              }`}
            >
              <input
                type="checkbox"
                checked={Boolean(form.is_govt_school)}
                onChange={() => {}}
                className="w-4 h-4 text-violet-700 rounded border-zinc-300 mt-0.5 cursor-pointer accent-violet-700"
              />
              <div className="space-y-1">
                <span className="font-bold text-zinc-900 block text-xs">
                  7.5% TN Government School Preferential Quota
                </span>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Applicable for candidates who studied continuously from Class 6 to 12 in Tamil Nadu State Government schools (G.O. Ms. No. 199).
                </p>
                {form.is_govt_school && (
                  <span className="inline-block text-[10px] font-semibold text-violet-800 bg-violet-100 px-2 py-0.5 rounded border border-violet-200">
                    7.5% Preferential Reservation Active
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Section 3: Academic Details & Subject Marks */}
        <Card className="p-6 border-zinc-200/80 shadow-sm bg-white space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-violet-700" />
              3. Academic Details & TNEA Mark Cutoff Breakdown
            </span>
            <span className="text-[11px] font-bold text-violet-700">
              Cutoff: {calcCutoff()} / 200
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-zinc-700 block mb-1">School / Institution Name</label>
              <input
                type="text"
                placeholder="e.g. Kendriya Vidyalaya / Govt HSS"
                value={form.school_or_college || ''}
                onChange={(e) => setForm({ ...form, school_or_college: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-medium outline-none focus:border-violet-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="font-semibold text-zinc-700 block mb-1">Examination Board</label>
              <select
                value={form.board_or_university || 'Tamil Nadu State Board'}
                onChange={(e) => setForm({ ...form, board_or_university: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-medium outline-none focus:border-violet-600 focus:bg-white"
              >
                <option value="Tamil Nadu State Board">Tamil Nadu State Board (Samacheer)</option>
                <option value="CBSE">CBSE</option>
                <option value="ICSE / ISC">ICSE / ISC</option>
                <option value="Other Board">Other / Polytechnic</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-zinc-700 block mb-1">Overall Academic % / CGPA *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={form.percentage_or_cgpa || ''}
                onChange={(e) => setForm({ ...form, percentage_or_cgpa: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-medium outline-none focus:border-violet-600 focus:bg-white"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">Used for scholarship and baseline matching</span>
            </div>
          </div>

          {/* Subject Marks for TNEA Engineering Cutoff */}
          <div className="pt-2">
            <span className="text-xs font-semibold text-zinc-800 block mb-2">
              Key Engineering Subject Scores (out of 100):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-zinc-200 bg-zinc-50/70">
                <label className="font-semibold text-zinc-600 block mb-1">Mathematics (Full Wt)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.subject_marks?.Mathematics ?? 90}
                  onChange={(e) => handleSubjectMarkChange('Mathematics', Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-zinc-200 font-bold text-zinc-900 bg-white outline-none focus:border-violet-600"
                />
                <span className="text-[10px] text-zinc-400 mt-1 block">100 marks weight</span>
              </div>

              <div className="p-3 rounded-xl border border-zinc-200 bg-zinc-50/70">
                <label className="font-semibold text-zinc-600 block mb-1">Physics (Half Wt)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.subject_marks?.Physics ?? 85}
                  onChange={(e) => handleSubjectMarkChange('Physics', Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-zinc-200 font-bold text-zinc-900 bg-white outline-none focus:border-violet-600"
                />
                <span className="text-[10px] text-zinc-400 mt-1 block">50 marks weight</span>
              </div>

              <div className="p-3 rounded-xl border border-zinc-200 bg-zinc-50/70">
                <label className="font-semibold text-zinc-600 block mb-1">Chemistry (Half Wt)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.subject_marks?.Chemistry ?? 85}
                  onChange={(e) => handleSubjectMarkChange('Chemistry', Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-zinc-200 font-bold text-zinc-900 bg-white outline-none focus:border-violet-600"
                />
                <span className="text-[10px] text-zinc-400 mt-1 block">50 marks weight</span>
              </div>

              <div className="p-3 rounded-xl border border-zinc-200 bg-zinc-50/70">
                <label className="font-semibold text-zinc-600 block mb-1">Computer Science</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.subject_marks?.['Computer Science'] ?? 90}
                  onChange={(e) => handleSubjectMarkChange('Computer Science', Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-zinc-200 font-bold text-zinc-900 bg-white outline-none focus:border-violet-600"
                />
                <span className="text-[10px] text-zinc-400 mt-1 block">IT suitability</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Section 4: Financial Constraints & Preferences */}
        <Card className="p-6 border-zinc-200/80 shadow-sm bg-white space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-violet-700" />
              4. Financial Planning Parameters & Career Goal
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-zinc-700 block mb-1">Annual Family Income</label>
              <select
                value={form.annual_family_income || '2.5 - 5 Lakhs'}
                onChange={(e) => setForm({ ...form, annual_family_income: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-medium outline-none focus:border-violet-600 focus:bg-white"
              >
                <option value="< 2.5 Lakhs">&lt; ₹2.5 Lakhs (Full Post-Matric Waiver Eligible)</option>
                <option value="2.5 - 5 Lakhs">₹2.5 - ₹5.0 Lakhs</option>
                <option value="5 - 8 Lakhs">₹5.0 - ₹8.0 Lakhs</option>
                <option value="> 8 Lakhs">&gt; ₹8.0 Lakhs (General Category)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-zinc-700 block mb-1">Max Annual Education Budget (₹)</label>
              <input
                type="number"
                step="5000"
                min="10000"
                value={form.max_education_budget || 120000}
                onChange={(e) => setForm({ ...form, max_education_budget: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-medium outline-none focus:border-violet-600 focus:bg-white"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">Used by Financial Planner & College Matcher</span>
            </div>

            <div>
              <label className="font-semibold text-zinc-700 block mb-1">Primary Target Career</label>
              <input
                type="text"
                value={form.target_career || 'Data Scientist'}
                onChange={(e) => setForm({ ...form, target_career: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-medium outline-none focus:border-violet-600 focus:bg-white"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">Guides Roadmap and Skill Gap analysis</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
            <label className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-200 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(form.need_scholarship)}
                onChange={(e) => setForm({ ...form, need_scholarship: e.target.checked })}
                className="w-4 h-4 text-violet-700 rounded border-zinc-300 accent-violet-700 cursor-pointer"
              />
              <div>
                <span className="font-semibold text-zinc-900 block">Actively Seeking Scholarships</span>
                <span className="text-[11px] text-zinc-500">Prioritizes fee waivers and government welfare schemes</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-200 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(form.hostel_required)}
                onChange={(e) => setForm({ ...form, hostel_required: e.target.checked })}
                className="w-4 h-4 text-violet-700 rounded border-zinc-300 accent-violet-700 cursor-pointer"
              />
              <div>
                <span className="font-semibold text-zinc-900 block">Hostel Accommodation Required</span>
                <span className="text-[11px] text-zinc-500">Includes mess and accommodation in budget calculation</span>
              </div>
            </label>
          </div>
        </Card>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="text-xs h-10 px-5"
          >
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Discard Changes
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="bg-violet-700 hover:bg-violet-800 text-white font-bold text-xs h-10 px-6 shadow-sm"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {saving ? 'Saving Changes...' : 'Save Profile Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};
