import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Compass, Lock, Mail, ArrowRight, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      await login({ email: email.trim(), password });
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('ananya@testauth.com');
    setPassword('StrongPassword123!');
  };

  return (
    <div className="min-h-screen bg-[#FAF9FF] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Logo */}
        <Link to="/" className="inline-flex items-center space-x-2.5 mb-4 group">
          <div className="w-11 h-11 rounded-2xl bg-violet-600 flex items-center justify-center text-white shadow-md shadow-violet-500/25 group-hover:scale-105 transition-transform">
            <Compass className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-violet-700 to-purple-600 bg-clip-text text-transparent">
            CarryYear
          </span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
          Welcome back to CarryYear
        </h2>
        <p className="mt-2 text-sm text-zinc-600">
          Access your personalized career and higher education intelligence
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-zinc-200/80 shadow-soft">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200/70 text-red-700 text-sm flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-zinc-50/50 border border-zinc-200 rounded-xl text-sm placeholder-zinc-400 text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700">
                  Password
                </label>
                <span className="text-xs text-violet-600 hover:text-violet-700 cursor-pointer">
                  Forgot password?
                </span>
              </div>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-zinc-50/50 border border-zinc-200 rounded-xl text-sm placeholder-zinc-400 text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-medium text-sm transition-all shadow-md shadow-violet-500/25 flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick Demo Student Fill */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleDemoFill}
                className="w-full py-2 px-3 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-medium border border-violet-200/80 transition-all flex items-center justify-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                <span>Fill Demo Student Credentials</span>
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-zinc-600 border-t border-zinc-100 pt-5">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-violet-600 hover:text-violet-700 underline">
              Create an account
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-zinc-400">
            CarryYear • Tamil Nadu Career & Education Intelligence
          </p>
        </div>
      </div>
    </div>
  );
};
