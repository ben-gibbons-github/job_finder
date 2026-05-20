import Resume, { WeightedTerm, FacetBucket } from './Resume.js';

const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'but',
  'by',
  'for',
  'if',
  'in',
  'into',
  'is',
  'it',
  'no',
  'not',
  'of',
  'on',
  'or',
  'such',
  'that',
  'the',
  'their',
  'then',
  'there',
  'these',
  'they',
  'this',
  'to',
  'was',
  'will',
  'with',
]);

const TECH_SPELLINGS = {
  'nodejs': 'node.js',
  'node.js': 'node.js',
  'fullstack': 'full-stack',
  'full-stack': 'full-stack',
  'frontend': 'front-end',
  'front-end': 'front-end',
  'backend': 'back-end',
  'back-end': 'back-end',
  'aiml': 'ai/ml',
  'ai/ml': 'ai/ml',
  'machinelearning': 'machine learning',
  'cpp': 'c++',
  'c++': 'c++',
};

const FACET_KEYWORDS: Record<string, string[]> = {
  ai: ['ai', 'machine learning', 'deep learning', 'neural', 'nlp', 'cv', 'tensorflow', 'pytorch', 'transformers'],
  engineering: ['software', 'engineer', 'architecture', 'system', 'infrastructure', 'devops', 'backend', 'frontend'],
  climate: ['climate', 'carbon', 'renewable', 'sustainability', 'green', 'emissions', 'energy', 'net zero'],
  tech: ['technology', 'software', 'developer', 'programmer', 'coder', 'technical', 'code', 'programming'],
};

const ACTION_VERBS = new Set([
  'built',
  'scaled',
  'developed',
  'designed',
  'architected',
  'led',
  'managed',
  'improved',
  'optimized',
  'implemented',
  'created',
  'launched',
  'deployed',
  'engineered',
  'established',
  'expanded',
]);

const DOMAIN_TERMS = new Set([
  'platform',
  'data',
  'system',
  'infrastructure',
  'api',
  'service',
  'application',
  'framework',
  'library',
  'tool',
  'module',
  'component',
  'feature',
  'integration',
]);

const SKILL_ALIASES: Record<string, string> = {
  typescript: 'typescript',
  ts: 'typescript',
  react: 'react',
  reactjs: 'react',
  vue: 'vue',
  vuejs: 'vue',
  angular: 'angular',
  aws: 'aws',
  gcp: 'gcp',
  azure: 'azure',
  docker: 'docker',
  kubernetes: 'kubernetes',
  sql: 'sql',
  postgres: 'postgresql',
  postgresql: 'postgresql',
  mysql: 'mysql',
  mongodb: 'mongodb',
  nosql: 'nosql',
  python: 'python',
  java: 'java',
  golang: 'go',
  go: 'go',
  rust: 'rust',
  nodejs: 'node.js',
  'node.js': 'node.js',
  git: 'git',
  cicd: 'ci/cd',
};

function normalizeText(rawText: string): string {
  return rawText
    .replace(/\r\n/g, '\n')
    .replace(/\0/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenizeAndBigram(normalizedText: string): string[] {
  const normalized = normalizedText.toLowerCase();
  const words = normalized
    .replace(/[^\w\s\-./+]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .map((w) => {
      const lower = w.toLowerCase();
      return TECH_SPELLINGS[lower as keyof typeof TECH_SPELLINGS] || lower;
    })
    .filter((w) => !STOP_WORDS.has(w));

  const tokens: string[] = [];

  for (const word of words) {
    tokens.push(word);
  }

  for (let i = 0; i < words.length - 1; i++) {
    const bigram = `${words[i]} ${words[i + 1]}`;
    tokens.push(bigram);
  }

  for (let i = 0; i < words.length - 2; i++) {
    const trigram = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
    tokens.push(trigram);
  }

  return tokens;
}

function buildTermWeights(tokens: string[]): WeightedTerm[] {
  const termFreq = new Map<string, number>();

  for (const token of tokens) {
    termFreq.set(token, (termFreq.get(token) || 0) + 1);
  }

  const termsByFreq = Array.from(termFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 180);

  const maxFreq = termsByFreq[0]?.[1] || 1;

  const weighted: WeightedTerm[] = termsByFreq.map(([term, freq], index) => {
    const isPhrase = term.includes(' ');
    let baseWeight = freq / maxFreq;

    if (isPhrase) {
      baseWeight *= 1.2;
    }

    const rankBoost = Math.max(0.5, 1 - index / termsByFreq.length);
    const weight = Math.min(1, baseWeight * rankBoost);

    return { term, weight, isPhrase };
  });

  return weighted;
}

function buildFacetMap(tokens: string[]): FacetBucket[] {
  const tokenSet = new Set(tokens);
  const facets: FacetBucket[] = [];

  for (const [facetName, keywords] of Object.entries(FACET_KEYWORDS)) {
    const matches = keywords.filter((kw) => tokenSet.has(kw));
    if (matches.length > 0) {
      facets.push({ facet: facetName, matches });
    }
  }

  return facets.length > 0
    ? facets
    : [
        { facet: 'general', matches: [] },
        { facet: 'technical', matches: [] },
      ];
}

function buildAnchors(normalizedText: string): string[] {
  const sentences = normalizedText
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  const anchors: Array<[string, number]> = sentences.map((sentence) => {
    let score = 0;

    const lowerSentence = sentence.toLowerCase();
    for (const verb of ACTION_VERBS) {
      if (lowerSentence.includes(verb)) {
        score += 2;
      }
    }

    for (const term of DOMAIN_TERMS) {
      if (lowerSentence.includes(term)) {
        score += 1;
      }
    }

    return [sentence, score];
  });

  return anchors
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([s]) => s);
}

function buildSkillSet(tokens: string[]): string[] {
  const skills = new Set<string>();

  for (const token of tokens) {
    const lower = token.toLowerCase().replace(/[^\w]/g, '');
    const canonical = SKILL_ALIASES[lower as keyof typeof SKILL_ALIASES];
    if (canonical) {
      skills.add(canonical);
    }
  }

  return Array.from(skills).sort();
}

export function parseResume(rawText: string): Resume {
  const resume = new Resume(rawText);

  resume.normalizedText = normalizeText(rawText);
  resume.tokens = tokenizeAndBigram(resume.normalizedText);
  resume.weightedTerms = buildTermWeights(resume.tokens);
  resume.facets = buildFacetMap(resume.tokens);
  resume.anchors = buildAnchors(resume.normalizedText);
  resume.skills = buildSkillSet(resume.tokens);

  return resume;
}
