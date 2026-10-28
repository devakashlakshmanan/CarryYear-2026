import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assessmentApi } from '../../services/api';
import type { Question, AssessmentResult } from '../../types/assessment';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { useToast } from '../../components/ui/Toast';
import {
  Brain,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Target,
  Lightbulb
} from 'lucide-react';

export function AssessmentView() {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'aptitude' | 'interest'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  
  const [result, setResult] = useState<AssessmentResult | null>(null);

  // Fetch questions and check for existing assessment on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user already has completed assessment
      const existing = await assessmentApi.getLatestAssessment();
      if (existing) {
        setResult(existing);
      }

      // Fetch questions
      const fetchedQuestions = await assessmentApi.getQuestions();
      setQuestions(fetchedQuestions);
    } catch (err: any) {
      console.error('Failed to load assessment data:', err);
      setError(err?.response?.data?.message || err.message || 'Failed to load assessment questions.');
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = questions.filter((q) => {
    if (activeTab === 'all') return true;
    return q.question_type === activeTab;
  });

  const currentQuestion: Question | undefined = filteredQuestions[currentIndex];

  const handleSelectOption = (questionId: number, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const totalQuestionsCount = questions.length;
  const progressPercent = totalQuestionsCount > 0 ? Math.round((answeredCount / totalQuestionsCount) * 100) : 0;

  const handleSubmit = async () => {
    if (answeredCount < totalQuestionsCount) {
      const confirmSubmit = window.confirm(
        `You have answered ${answeredCount} of ${totalQuestionsCount} questions. Unanswered questions will be scored as 0. Do you want to submit now?`
      );
      if (!confirmSubmit) return;
    }

    try {
      setSubmitting(true);
      const answersPayload = Object.entries(selectedAnswers).map(([qId, optIdx]) => ({
        question_id: Number(qId),
        selected_option_index: optIdx,
      }));

      const res = await assessmentApi.submitAssessment(answersPayload);
      setResult(res);
      success('Assessment completed!', 'Your Career DNA indicators have been calculated successfully.');
    } catch (err: any) {
      console.error('Submission failed:', err);
      toastError('Submission failed', err?.response?.data?.message || err.message || 'Failed to submit assessment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    const confirmRetake = window.confirm('Are you sure you want to retake the assessment? Your previous responses will be updated with your new attempt.');
    if (!confirmRetake) return;
    setResult(null);
    setSelectedAnswers({});
    setCurrentIndex(0);
    setActiveTab('all');
  };

  if (loading) {
    return <LoadingState message="Loading Tamil Nadu standardized assessment questions..." />;
  }

  if (error && questions.length === 0) {
    return (
      <ErrorState
        title="Failed to Load Assessment"
        message={error}
        onRetry={loadData}
      />
    );
  }

  // --- RESULTS VIEW ---
  if (result) {
    const aptitudeScores = result.dimension_scores.filter((s) => s.category_type === 'aptitude');
    const interestScores = result.dimension_scores.filter((s) => s.category_type === 'interest');

    return (
      <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto pb-12">
        <PageHeader
          badge={<Badge variant="primary">Assessment Completed</Badge>}
          title="Cognitive & Interest Profile"
          subtitle="Your aptitude reasoning and interest indicators have been normalized from 0 to 100 and mapped into your decision profile."
          actions={
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetake}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Retake Assessment
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/career-dna')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                View Career DNA
              </Button>
            </div>
          }
        />

        {/* Hero Score Highlight Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-900 via-indigo-900 to-purple-950 p-8 text-white shadow-xl">
          <div className="absolute right-0 top-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-violet-200">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span>Verified Assessment Completed</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Overall Aptitude: <span className="text-violet-300">{result.aptitude_average}%</span>
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed">
                {result.summary}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-xs text-zinc-400">Peak Interest Dimensions:</span>
                {result.top_interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-2.5 py-1 rounded-lg bg-violet-800/60 border border-violet-600/40 text-xs font-medium text-violet-200"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md min-w-[200px] text-center">
              <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Composite Score</span>
              <span className="text-4xl font-extrabold text-white mt-1">{result.total_score}</span>
              <span className="text-[11px] text-violet-300 mt-1">out of 100 normalized points</span>
              <div className="w-full mt-3">
                <ProgressBar value={result.total_score} size="sm" showPercentage={false} />
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Aptitude Reasoning Dimensions */}
          <Card className="p-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 text-base">Aptitude Dimensions</h3>
                  <p className="text-xs text-zinc-500">Logical, Numerical, Analytical & Verbal Reasoning</p>
                </div>
              </div>
              <Badge variant="primary" size="sm">
                Avg: {result.aptitude_average}%
              </Badge>
            </div>

            <div className="space-y-5">
              {aptitudeScores.map((item) => {
                const score = item.normalized_score;
                let rating = 'Developing';
                let ratingVariant: 'success' | 'primary' | 'warning' = 'warning';
                if (score >= 75) {
                  rating = 'Advanced';
                  ratingVariant = 'success';
                } else if (score >= 50) {
                  rating = 'Proficient';
                  ratingVariant = 'primary';
                }

                return (
                  <div key={item.dimension} className="space-y-1.5 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-zinc-800">{item.dimension}</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant={ratingVariant} size="sm">
                          {rating}
                        </Badge>
                        <span className="text-sm font-bold text-zinc-900">{score}%</span>
                      </div>
                    </div>
                    <ProgressBar value={score} size="md" showPercentage={false} />
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Interest Dimensions */}
          <Card className="p-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 text-base">Interest Dimensions</h3>
                  <p className="text-xs text-zinc-500">Domain curiosity & work affinity preferences</p>
                </div>
              </div>
              <Badge variant="secondary" size="sm">
                {interestScores.length} Dimensions
              </Badge>
            </div>

            <div className="space-y-3.5">
              {interestScores.map((item) => {
                const score = item.normalized_score;
                const isTop = result.top_interests.includes(item.dimension);

                return (
                  <div
                    key={item.dimension}
                    className={`p-3 rounded-xl border transition-all ${
                      isTop
                        ? 'bg-violet-50/60 border-violet-200 shadow-xs'
                        : 'bg-zinc-50 border-zinc-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-zinc-800">{item.dimension}</span>
                        {isTop && (
                          <span className="px-1.5 py-0.5 rounded bg-violet-600 text-white text-[10px] font-bold">
                            TOP
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-bold text-violet-700">{score}%</span>
                    </div>
                    <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isTop
                            ? 'bg-gradient-to-r from-violet-600 to-pink-500'
                            : 'bg-zinc-400'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Explainability & Guidance Banner */}
        <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start space-x-4">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs text-amber-900 leading-relaxed">
            <p className="font-semibold text-sm text-amber-950">
              Explainable Decision Engine Note
            </p>
            <p>
              These results represent standardized profile indicators computed from your reasoning responses and declared interest preferences. They are designed to match Tamil Nadu education pathways, collegiate eligibility, and career demands without relying on black-box claims.
            </p>
          </div>
        </div>

        {/* Action Bottom Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-200">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/career-dna')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Explore Your Career DNA
          </Button>
        </div>
      </div>
    );
  }

  // --- TAKING ASSESSMENT VIEW ---
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 animate-fadeIn">
      <PageHeader
        badge={<Badge variant="primary">Assessment Module</Badge>}
        title="Aptitude & Interest Evaluation"
        subtitle="Complete this structured evaluation to generate your personalized Career DNA indicators and tailored education paths in Tamil Nadu."
      />

      {/* Progress & Category Selector */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => { setActiveTab('all'); setCurrentIndex(0); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              All Questions ({questions.length})
            </button>
            <button
              onClick={() => { setActiveTab('aptitude'); setCurrentIndex(0); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'aptitude'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Aptitude Reasoning ({questions.filter((q) => q.question_type === 'aptitude').length})
            </button>
            <button
              onClick={() => { setActiveTab('interest'); setCurrentIndex(0); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'interest'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Interest Dimensions ({questions.filter((q) => q.question_type === 'interest').length})
            </button>
          </div>

          <div className="flex items-center space-x-3 text-xs text-zinc-500 font-medium">
            <span>
              <strong className="text-zinc-900">{answeredCount}</strong> of {totalQuestionsCount} answered
            </span>
            <span className="font-bold text-violet-600">{progressPercent}%</span>
          </div>
        </div>

        <div className="pt-4">
          <ProgressBar value={progressPercent} size="sm" showPercentage={false} />
        </div>

        {/* Question Jump Grid */}
        <div className="mt-4 pt-4 border-t border-zinc-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Quick Question Jump
            </span>
            <span className="text-[11px] text-zinc-400">
              Green = Answered, Gray = Pending
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1">
            {filteredQuestions.map((q, idx) => {
              const isAnswered = selectedAnswers[q.id] !== undefined;
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                    isCurrent
                      ? 'ring-2 ring-violet-600 bg-violet-600 text-white'
                      : isAnswered
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                  title={`Question ${idx + 1}: ${q.category}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Active Question Card */}
      {currentQuestion ? (
        <Card className="p-6 relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-6">
            <div className="flex items-center space-x-2">
              <Badge variant={currentQuestion.question_type === 'aptitude' ? 'primary' : 'secondary'} size="sm">
                {currentQuestion.category}
              </Badge>
              <Badge variant="outline" size="sm">
                {currentQuestion.question_type === 'aptitude' ? 'Aptitude Test' : 'Interest Inventory'}
              </Badge>
            </div>
            <span className="text-xs font-bold text-zinc-400">
              Question {currentIndex + 1} of {filteredQuestions.length}
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-zinc-900 mb-6 leading-relaxed">
            {currentQuestion.question_text}
          </h3>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {currentQuestion.options.map((optionText, optIdx) => {
              const isSelected = selectedAnswers[currentQuestion.id] === optIdx;

              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'border-violet-600 bg-violet-50/70 shadow-sm'
                      : 'border-zinc-200 bg-white hover:border-violet-300 hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                        isSelected
                          ? 'border-violet-600 bg-violet-600 text-white'
                          : 'border-zinc-300 text-zinc-500 group-hover:border-violet-400'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </div>
                    <span
                      className={`text-sm ${
                        isSelected ? 'font-semibold text-zinc-900' : 'text-zinc-700'
                      }`}
                    >
                      {optionText}
                    </span>
                  </div>

                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-violet-600 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Navigation Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-zinc-100">
            <Button
              variant="outline"
              size="sm"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Previous
            </Button>

            <div className="flex items-center space-x-3">
              {currentIndex < filteredQuestions.length - 1 ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setCurrentIndex((prev) => Math.min(filteredQuestions.length - 1, prev + 1))}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Next Question
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleSubmit}
                  isLoading={submitting}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                >
                  Submit Assessment
                </Button>
              )}
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          <p className="text-zinc-500 text-sm text-center py-8">
            No questions available for this filter.
          </p>
        </Card>
      )}

      {/* Global Submit Card at bottom if many questions answered */}
      {answeredCount > 0 && (
        <div className="p-4 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-violet-900">
            <CheckCircle2 className="w-4 h-4 text-violet-600" />
            <span>
              <strong>{answeredCount}</strong> of <strong>{totalQuestionsCount}</strong> questions answered. Ready to see your Career DNA?
            </span>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={submitting}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Submit & Calculate DNA
          </Button>
        </div>
      )}
    </div>
  );
}
