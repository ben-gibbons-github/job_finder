

export interface WeightedTerm {
  term: string;
  weight: number;
  isPhrase: boolean;
}

export interface FacetBucket {
  facet: string;
  matches: string[];
}

export class Resume {
  /** Raw resume text as provided by user */
  rawText: string;

  /** Normalized text: line endings standardized, whitespace collapsed, nulls removed */
  normalizedText: string;

  /** Raw tokens extracted: single words, bigrams, trigrams */
  tokens: string[];

  /** Weighted and ranked terms (top 180 by frequency with applied weights) */
  weightedTerms: WeightedTerm[];

  /** Facet groupings: curated buckets like 'ai', 'engineering', 'climate', 'tech' */
  facets: FacetBucket[];

  /** Strong resume sentences (up to 10) scored by action verbs and domain terms */
  anchors: string[];

  /** Canonical skill set derived from known aliases */
  skills: string[];

  constructor(rawText: string = '') {
    this.rawText = rawText;
    this.normalizedText = '';
    this.tokens = [];
    this.weightedTerms = [];
    this.facets = [];
    this.anchors = [];
    this.skills = [];
  }
}

export default Resume;