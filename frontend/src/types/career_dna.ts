export interface TraitIndicator {
  name: string;
  score: number;
  rating: 'Advanced' | 'Proficient' | 'Developing';
  description: string;
}

export interface ExplanatoryFactor {
  source: string;
  factor: string;
  impact: string;
  weight: 'High' | 'Moderate' | 'Secondary';
}

export interface CareerDNAData {
  id: number;
  user_id: number;
  dominant_cluster: string;
  confidence_score: number;
  traits: TraitIndicator[];
  why_this_profile: string;
  explanatory_factors: ExplanatoryFactor[];
  version: number;
  created_at: string;
  updated_at: string;
}
