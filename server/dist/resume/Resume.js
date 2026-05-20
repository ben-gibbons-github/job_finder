export class Resume {
    /** Raw resume text as provided by user */
    rawText;
    /** Normalized text: line endings standardized, whitespace collapsed, nulls removed */
    normalizedText;
    /** Raw tokens extracted: single words, bigrams, trigrams */
    tokens;
    /** Weighted and ranked terms (top 180 by frequency with applied weights) */
    weightedTerms;
    /** Facet groupings: curated buckets like 'ai', 'engineering', 'climate', 'tech' */
    facets;
    /** Strong resume sentences (up to 10) scored by action verbs and domain terms */
    anchors;
    /** Canonical skill set derived from known aliases */
    skills;
    constructor(rawText = '') {
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
