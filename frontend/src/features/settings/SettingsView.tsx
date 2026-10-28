import React, { useEffect, useState } from 'react';
import { 
  Bell, 
  ShieldCheck, 
  Lock, 
  Eye, 
  Sun, 
  Save, 
  LogOut, 
  AlertCircle
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { authApi, profileApi } from '../../services/api';

export const SettingsView: React.FC = () => {
  const { user, logout } = useAuth();
  const { success, error: toastError } = useToast();

  // Notification Preferences State (persisted to backend)
  const [cutoffAlerts, setCutoffAlerts] = useState(true);
  const [scholarshipAlerts, setScholarshipAlerts] = useState(true);
  const [careerDigest, setCareerDigest] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  // Accessibility State (persisted to backend)
  const [reducedMotion, setReducedMotion] = useState(false);
  const [compactCards, setCompactCards] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Load existing preferences from backend
  useEffect(() => {
    profileApi.getProfile()
      .then((profile) => {
        if (profile?.website_preferences) {
          const wp = profile.website_preferences;
          if (wp.notifications) {
            setCutoffAlerts(wp.notifications.cutoff_alerts ?? true);
            setScholarshipAlerts(wp.notifications.scholarship_alerts ?? true);
            setCareerDigest(wp.notifications.career_digest ?? false);
          }
          if (wp.accessibility) {
            setReducedMotion(wp.accessibility.reduced_motion ?? false);
            setCompactCards(wp.accessibility.compact_cards ?? false);
          }
        }
      })
      .catch(() => {
        // Fallback to defaults if profile uninitialized
      });
  }, []);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingPrefs(true);
      await profileApi.updateProfile({
        website_preferences: {
          notifications: {
            cutoff_alerts: cutoffAlerts,
            scholarship_alerts: scholarshipAlerts,
            career_digest: careerDigest,
          },
          accessibility: {
            reduced_motion: reducedMotion,
            compact_cards: compactCards,
          },
          theme: 'light_lavender',
        }
      });
      success('Preferences Saved', 'Website and notification preferences have been saved to your account.');
    } catch (err: any) {
      toastError('Save Failed', err?.message || 'Could not update preferences');
    } finally {
      setSavingPrefs(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toastError('Missing Password', 'Please provide your current password.');
      return;
    }
    if (newPassword.length < 6) {
      toastError('Weak Password', 'New password must contain at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toastError('Mismatch', 'New password and confirmation do not match.');
      return;
    }

    try {
      setChangingPassword(true);
      await authApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      success('Password Updated', 'Your account password has been changed successfully.');
    } catch (err: any) {
      toastError('Change Failed', err?.response?.data?.detail || err?.message || 'Could not change password');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 animate-fadeIn max-w-4xl mx-auto">
      <PageHeader
        title="Application Settings & Preferences"
        subtitle="Configure appearance themes, notification preferences, privacy, accessibility, and account security."
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Settings', path: '/settings' }
        ]}
      />

      <div className="space-y-6">
        {/* Section 1: Appearance & Display */}
        <Card className="p-6 border-zinc-200/80 shadow-sm bg-white space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
              <Sun className="w-4 h-4 text-violet-700" />
              1. Theme & Appearance
            </span>
            <Badge variant="primary" className="text-[10px]">
              Active System
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border-2 border-violet-600 bg-violet-50/50 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-700 text-white flex items-center justify-center shrink-0">
                <Sun className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <span className="font-bold text-zinc-900 block">CarryYear Light Lavender (Default)</span>
                <p className="text-[11px] text-zinc-600 leading-relaxed">
                  Refined light palette featuring soft lavender backgrounds, deep violet action accents, and high-contrast slate typography.
                </p>
                <span className="inline-block text-[10px] font-semibold text-violet-800 bg-violet-100 px-2 py-0.5 rounded">
                  System Standard
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 opacity-60 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-200 text-zinc-500 flex items-center justify-center shrink-0">
                <Eye className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <span className="font-bold text-zinc-700 block">Dark Mode</span>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Night-reading mode scheduled for release following state admission portal integration.
                </p>
                <span className="inline-block text-[10px] font-medium text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Section 2: Notifications Preferences Form */}
        <form onSubmit={handleSavePreferences}>
          <Card className="p-6 border-zinc-200/80 shadow-sm bg-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-violet-700" />
                2. Notification Preferences
              </span>
              <span className="text-[11px] text-zinc-500">Stored in account profile</span>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3.5 bg-zinc-50/70 border border-zinc-200 rounded-xl cursor-pointer hover:border-violet-300 hover:bg-violet-50/20 transition-all">
                <div className="space-y-0.5">
                  <span className="font-semibold text-zinc-900 block">TNEA Cutoff & Counseling Updates</span>
                  <p className="text-[11px] text-zinc-500">
                    Receive alert digests when historical cutoff trends or counseling round dates are revised.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={cutoffAlerts}
                  onChange={(e) => setCutoffAlerts(e.target.checked)}
                  className="w-4 h-4 text-violet-700 rounded border-zinc-300 accent-violet-700 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-zinc-50/70 border border-zinc-200 rounded-xl cursor-pointer hover:border-violet-300 hover:bg-violet-50/20 transition-all">
                <div className="space-y-0.5">
                  <span className="font-semibold text-zinc-900 block">Scholarship Portal Deadline Reminders</span>
                  <p className="text-[11px] text-zinc-500">
                    Advance reminders 7 days prior to National Scholarship Portal and Tamil Nadu welfare portal deadlines.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={scholarshipAlerts}
                  onChange={(e) => setScholarshipAlerts(e.target.checked)}
                  className="w-4 h-4 text-violet-700 rounded border-zinc-300 accent-violet-700 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-zinc-50/70 border border-zinc-200 rounded-xl cursor-pointer hover:border-violet-300 hover:bg-violet-50/20 transition-all">
                <div className="space-y-0.5">
                  <span className="font-semibold text-zinc-900 block">Weekly Career & Skills Insights</span>
                  <p className="text-[11px] text-zinc-500">
                    Periodic recommendations on trending competencies aligned with your Career DNA.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={careerDigest}
                  onChange={(e) => setCareerDigest(e.target.checked)}
                  className="w-4 h-4 text-violet-700 rounded border-zinc-300 accent-violet-700 cursor-pointer"
                />
              </label>
            </div>

            {/* Honest notification status badge */}
            <div className="p-3 bg-violet-50/60 rounded-xl border border-violet-100 text-[11px] text-zinc-600 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-violet-700 shrink-0 mt-0.5" />
              <span>
                <strong>Notification Status Notice:</strong> Your preferences are saved in your student profile record. External email dispatches to <strong>{user?.email || 'your email'}</strong> will automatically activate once the outward SMTP service is connected.
              </span>
            </div>

            <div className="pt-1 flex justify-end">
              <Button
                type="submit"
                disabled={savingPrefs}
                size="sm"
                className="bg-violet-700 hover:bg-violet-800 text-white font-bold text-xs h-9 px-5 shadow-sm"
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                {savingPrefs ? 'Saving...' : 'Save Notification Preferences'}
              </Button>
            </div>
          </Card>
        </form>

        {/* Section 3: Privacy & Security (Password Change) */}
        <Card className="p-6 border-zinc-200/80 shadow-sm bg-white space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-violet-700" />
              3. Password & Security
            </span>
            <span className="text-[11px] text-zinc-500">Bcrypt Protected</span>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-3 text-xs max-w-lg">
            <div>
              <label className="font-semibold text-zinc-700 block mb-1">Current Password *</label>
              <input
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-medium outline-none focus:border-violet-600 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">New Password *</label>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-medium outline-none focus:border-violet-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-medium outline-none focus:border-violet-600 focus:bg-white"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={changingPassword}
                size="sm"
                className="bg-zinc-800 hover:bg-zinc-900 text-white font-bold text-xs h-9 px-5"
              >
                <Lock className="w-3.5 h-3.5 mr-1.5" />
                {changingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Section 4: Active Session & Account Privacy */}
        <Card className="p-6 border-zinc-200/80 shadow-sm bg-white space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-violet-700" />
              4. Active Session & Account Data Privacy
            </span>
            <Badge variant="success" className="text-[10px]">
              Active Session
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
              <span className="text-zinc-500 text-[11px] block">Authenticated User</span>
              <span className="font-bold text-zinc-900 block mt-0.5">{user?.name}</span>
              <span className="text-[10px] text-zinc-400">{user?.email}</span>
            </div>

            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
              <span className="text-zinc-500 text-[11px] block">Jurisdiction Region</span>
              <span className="font-bold text-violet-800 block mt-0.5">Tamil Nadu (India)</span>
              <span className="text-[10px] text-zinc-400">TNEA / DoTE Single-Window</span>
            </div>

            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
              <span className="text-zinc-500 text-[11px] block">Data Privacy Guarantee</span>
              <span className="font-bold text-emerald-700 block mt-0.5">Tenant-Isolated</span>
              <span className="text-[10px] text-zinc-400">Strict server-side principal control</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-zinc-100">
            <p className="text-[11px] text-zinc-500">
              Signing out terminates your current JWT session and clears authentication tokens from this device.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={logout}
              className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 text-xs h-9 px-4 shrink-0"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Sign Out
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
