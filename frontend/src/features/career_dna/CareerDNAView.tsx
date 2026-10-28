import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { careerDnaApi } from '../../services/api';
import type { CareerDNAData } from '../../types/career_dna';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { useToast } from '../../components/ui/Toast';
import {
  Dna,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Brain,
  Lightbulb,
  ShieldCheck,
  Compass,
  FileCheck
} from 'lucide-react';

export function CareerDNAView() {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dna, setDna] = useState<CareerDNAData | null>(null);

  useEffect(() => {
    loadCareerDNA();
  }, []);

  const loadCareerDNA = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await careerDnaApi.getCareerDNA();
      setDna(res);
    } catch (err: any) {
      console.error('Failed to load Career DNA:', err);
      setError(err?.response?.data?.message || err.message || 'Failed to load Career DNA.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const res = await careerDnaApi.generateCareerDNA();
      setDna(res);
      success('Career DNA Updated', 'Multi-dimensional decision indicators recalculated successfully.');
    } catch (err: any) {
      console.error('Failed to generate Career DNA:', err);
      toastError('Update Failed', err?.response?.data?.message || err.message || 'Failed to generate Career DNA.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <LoadingState message="Synthesizing multi-dimensional Career DNA indicators..." />;
  }

  if (error && !dna) {
    return (
      <ErrorState
        title="Career DNA Unavailable"
        message={error}
        onRetry={loadCareerDNA}
      />
    );
  }

  // If no DNA generated yet, display a welcoming onboarding CTA
  if (!dna) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center mx-auto shadow-md">
          <Dna className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900">Your Career DNA Awaits</h2>
        <p className="text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
          Career DNA combines your academic performance, cognitive reasoning assessment, expressed interests, skills, and regional constraints into an explainable indicator profile.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/assessment')}
            leftIcon={<Brain className="w-4 h-4" />}
          >
            Take Assessment First
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleGenerate}
            isLoading={generating}
            rightIcon={<Sparkles className="w-4 h-4" />}
          >
            Generate Career DNA Now
          </Button>
        </div>
      </div>
    );
  }

  // Coordinates for the 8-axis Radar Chart (SVG rendering)
  const traits = dna.traits || [];
  const centerX = 200;
  const centerY = 200;
  const maxRadius = 140;

  const points = traits.map((trait, index) => {
    const angle = (Math.PI * 2 / traits.length) * index - Math.PI / 2;
    const r = (trait.score / 100) * maxRadius;
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    return { x, y, trait, angle };
  });

  const polygonPath = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto pb-16">
      <PageHeader
        badge={<Badge variant="primary">Multi-dimensional Indicators</Badge>}
        title="Student Career DNA"
        subtitle="Transparent profile indicators generated from your academic records, cognitive reasoning assessment, expressed interests, and regional feasibility preferences."
        actions={
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerate}
              isLoading={generating}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Recalculate DNA
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/recommendations')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              View Recommended Careers
            </Button>
          </div>
        }
      />

      {/* Hero Cluster & Confidence Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-950 via-indigo-900 to-purple-900 p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-80 h-80 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-violet-200">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>Dominant Career Cluster Identification</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {dna.dominant_cluster}
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Synthesized from {dna.traits.length} distinct multi-dimensional indicator vectors across cognitive, academic, and interest matrices.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md min-w-[210px] text-center">
            <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Profile Confidence</span>
            <span className="text-4xl font-extrabold text-white mt-1">{dna.confidence_score}%</span>
            <div className="flex items-center space-x-1.5 mt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-emerald-300 font-semibold">High Data Integrity</span>
            </div>
          </div>
        </div>
      </div>

      {/* Radar Chart & Trait Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Visual Radar SVG Card */}
        <Card className="p-6 lg:col-span-6 flex flex-col items-center justify-center">
          <div className="flex items-center justify-between w-full pb-4 border-b border-zinc-100 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 text-sm">Career DNA Radar</h3>
                <p className="text-[11px] text-zinc-500">8-axis cognitive & interest polygon</p>
              </div>
            </div>
            <Badge variant="secondary" size="sm">
              Vector v{dna.version}
            </Badge>
          </div>

          <div className="w-full max-w-[420px] aspect-square relative flex items-center justify-center">
            <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible">
              {/* Concentric reference rings */}
              {[0.25, 0.5, 0.75, 1.0].map((level, i) => (
                <circle
                  key={i}
                  cx={centerX}
                  cy={centerY}
                  r={maxRadius * level}
                  fill="none"
                  stroke="#E4E4E7"
                  strokeWidth="1"
                  strokeDasharray={level === 1.0 ? 'none' : '3,3'}
                />
              ))}

              {/* Axis lines */}
              {traits.map((_, index) => {
                const angle = (Math.PI * 2 / traits.length) * index - Math.PI / 2;
                const ax = centerX + maxRadius * Math.cos(angle);
                const ay = centerY + maxRadius * Math.sin(angle);
                return (
                  <line
                    key={index}
                    x1={centerX}
                    y1={centerY}
                    x2={ax}
                    y2={ay}
                    stroke="#E4E4E7"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Filled Polygon */}
              <polygon
                points={polygonPath}
                fill="rgba(124, 58, 237, 0.22)"
                stroke="#7C3AED"
                strokeWidth="2.5"
                className="transition-all duration-700 ease-out"
              />

              {/* Data points & Labels */}
              {points.map((p, i) => {
                const labelRadius = maxRadius + 22;
                const lx = centerX + labelRadius * Math.cos(p.angle);
                const ly = centerY + labelRadius * Math.sin(p.angle);

                return (
                  <g key={i}>
                    {/* Glowing point marker */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="4.5"
                      fill="#7C3AED"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      className="cursor-pointer hover:r-6 transition-all"
                    />

                    {/* Axis Label */}
                    <text
                      x={lx}
                      y={ly}
                      fontSize="9"
                      fontWeight="600"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#3F3F46"
                      className="select-none"
                    >
                      {p.trait.name.split(' ')[0]} ({p.trait.score}%)
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <p className="text-[11px] text-zinc-400 text-center mt-3">
            Concentric rings indicate 25%, 50%, 75%, and 100% normalized trait intensity.
          </p>
        </Card>

        {/* Horizontal Trait Meters */}
        <Card className="p-6 lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <h3 className="font-bold text-zinc-900 text-sm">Trait Dimensions & Ratings</h3>
            <span className="text-xs text-zinc-400 font-semibold">Normalized Scale (0–100)</span>
          </div>

          <div className="space-y-3.5 max-h-[440px] overflow-y-auto pr-1">
            {dna.traits.map((trait) => {
              let variant: 'success' | 'primary' | 'warning' = 'warning';
              if (trait.rating === 'Advanced') variant = 'success';
              else if (trait.rating === 'Proficient') variant = 'primary';

              return (
                <div key={trait.name} className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900">{trait.name}</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant={variant} size="sm">
                        {trait.rating}
                      </Badge>
                      <span className="text-xs font-extrabold text-violet-700">{trait.score}%</span>
                    </div>
                  </div>
                  <ProgressBar value={trait.score} size="sm" showPercentage={false} />
                  <p className="text-[11px] text-zinc-500 leading-snug pt-0.5">
                    {trait.description}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* "Why this profile?" Explainable Narrative */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200/80 shadow-soft">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-base text-zinc-900">Why this profile?</h3>
              <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 text-[10px] font-bold">
                Explainable Rationale
              </span>
            </div>
            <p className="text-sm text-zinc-700 leading-relaxed font-normal">
              {dna.why_this_profile}
            </p>
          </div>
        </div>
      </div>

      {/* Transparent Contributing Decision Factors */}
      <Card className="p-6">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 text-base">Contributing Decision Factors</h3>
              <p className="text-xs text-zinc-500">Every Career DNA indicator maps directly back to tangible profile and assessment inputs</p>
            </div>
          </div>
          <Badge variant="primary" size="sm">
            {dna.explanatory_factors.length} Validated Sources
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dna.explanatory_factors.map((factor, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-zinc-200/80 bg-white hover:border-violet-200 hover:shadow-xs transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-violet-700 uppercase tracking-wider">
                  {factor.source}
                </span>
                <Badge
                  variant={factor.weight === 'High' ? 'primary' : 'secondary'}
                  size="sm"
                >
                  {factor.weight} Impact
                </Badge>
              </div>
              <p className="text-xs font-semibold text-zinc-900">
                {factor.factor}
              </p>
              <p className="text-xs text-zinc-500 leading-relaxed">
                {factor.impact}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Regulatory / Scientific Disclaimer */}
      <div className="p-4 rounded-xl bg-zinc-100/80 border border-zinc-200/60 text-center">
        <p className="text-xs text-zinc-500">
          <strong className="text-zinc-700">Notice:</strong> Profile indicators generated from your assessment and profile data. These decision models are designed for Tamil Nadu educational and career pathway guidance and are not presented as clinical psychological measurements.
        </p>
      </div>

      {/* Bottom Action Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-zinc-200">
        <Button variant="ghost" size="sm" onClick={() => navigate('/assessment')}>
          Back to Assessment
        </Button>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/onboarding')}
          >
            Edit Profile Data
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/recommendations')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Explore Career Recommendations
          </Button>
        </div>
      </div>
    </div>
  );
}
