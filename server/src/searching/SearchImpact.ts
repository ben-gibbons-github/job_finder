import type { ScrapedJob } from '../scraping/ScrapedJob.js'

type CategoryName =
	| 'communitySupport'
	| 'socialJustice'
	| 'education'
	| 'mentalHealth'
	| 'medicalLifeSaving'
	| 'greenTechCarbonReduction'
	| 'disabilityAccessibility'
	| 'childProtection'

interface KeywordEntry {
	phrase: string
	weight: number
}

interface ImpactCategory {
	weight: number
	saturationWeight: number
	keywords: KeywordEntry[]
}

const IMPACT_CATEGORIES: Record<CategoryName, ImpactCategory> = {
	communitySupport: {
		weight: 1.0,
		saturationWeight: 4.5,
		keywords: [
			{ phrase: 'community', weight: 1.0 },
			{ phrase: 'community resilience', weight: 1.8 },
			{ phrase: 'resilient communities', weight: 1.8 },
			{ phrase: 'community support', weight: 1.6 },
			{ phrase: 'social support', weight: 1.4 },
			{ phrase: 'social impact', weight: 1.4 },
			{ phrase: 'public service', weight: 1.5 },
			{ phrase: 'public transit', weight: 1.3 },
			{ phrase: 'public transportation', weight: 1.3 },
			{ phrase: 'nonprofit', weight: 1.6 },
			{ phrase: 'non-profit', weight: 1.6 },
			{ phrase: 'public benefit corporation', weight: 1.8 },
			{ phrase: 'benefit corporation', weight: 1.6 },
			{ phrase: 'charity', weight: 1.3 },
			{ phrase: 'mutual aid', weight: 1.7 },
			{ phrase: 'food bank', weight: 1.8 },
			{ phrase: 'shelter', weight: 1.2 },
			{ phrase: 'housing support', weight: 1.8 },
			{ phrase: 'affordable housing', weight: 1.9 },
			{ phrase: 'affordable mobility', weight: 1.5 },
			{ phrase: 'energy access', weight: 1.8 },
			{ phrase: 'access to care', weight: 1.7 },
			{ phrase: 'homelessness', weight: 1.7 },
			{ phrase: 'crisis response', weight: 1.5 },
			{ phrase: 'humanitarian', weight: 1.6 },
			{ phrase: 'volunteer', weight: 1.0 },
			{ phrase: 'outreach', weight: 1.1 },
			{ phrase: 'equity', weight: 1.2 },
			{ phrase: 'inclusion', weight: 1.1 },
			{ phrase: 'underserved', weight: 1.6 },
			{ phrase: 'vulnerable populations', weight: 1.9 },
			{ phrase: 'civic', weight: 1.0 },
			{ phrase: 'public benefit', weight: 1.6 },
			{ phrase: 'social justice', weight: 1.7 },
			{ phrase: 'community health worker', weight: 2.0 },
		],
	},
	socialJustice: {
		weight: 1.08,
		saturationWeight: 4.3,
		keywords: [
			{ phrase: 'civil rights', weight: 2.0 },
			{ phrase: 'human rights', weight: 1.9 },
			{ phrase: 'racial justice', weight: 2.0 },
			{ phrase: 'economic justice', weight: 1.8 },
			{ phrase: 'restorative justice', weight: 1.9 },
			{ phrase: 'criminal justice reform', weight: 2.0 },
			{ phrase: 'legal aid', weight: 1.8 },
			{ phrase: 'public defender', weight: 1.9 },
			{ phrase: 'voting rights', weight: 1.9 },
			{ phrase: 'worker rights', weight: 1.8 },
			{ phrase: 'labor rights', weight: 1.8 },
			{ phrase: 'tenant rights', weight: 1.8 },
			{ phrase: 'anti discrimination', weight: 1.9 },
			{ phrase: 'anti-discrimination', weight: 1.9 },
			{ phrase: 'justice impacted', weight: 1.8 },
			{ phrase: 'equitable access', weight: 1.7 },
			{ phrase: 'social justice', weight: 2.0 },
		],
	},
	education: {
		weight: 0.95,
		saturationWeight: 4.2,
		keywords: [
			{ phrase: 'education', weight: 1.2 },
			{ phrase: 'research education', weight: 1.7 },
			{ phrase: 'teaching', weight: 1.3 },
			{ phrase: 'teacher', weight: 1.3 },
			{ phrase: 'tutor', weight: 1.3 },
			{ phrase: 'tutoring', weight: 1.3 },
			{ phrase: 'curriculum', weight: 1.6 },
			{ phrase: 'classroom', weight: 1.4 },
			{ phrase: 'school', weight: 1.1 },
			{ phrase: 'college access', weight: 1.8 },
			{ phrase: 'student success', weight: 1.7 },
			{ phrase: 'edtech', weight: 1.4 },
			{ phrase: 'learning', weight: 1.0 },
			{ phrase: 'instructional', weight: 1.4 },
			{ phrase: 'pedagogy', weight: 1.8 },
			{ phrase: 'literacy', weight: 1.7 },
			{ phrase: 'adult education', weight: 1.7 },
			{ phrase: 'special education', weight: 1.9 },
			{ phrase: 'early childhood', weight: 1.8 },
			{ phrase: 'mentorship', weight: 1.4 },
			{ phrase: 'mentor', weight: 1.3 },
			{ phrase: 'training program', weight: 1.3 },
			{ phrase: 'postdoctoral', weight: 1.5 },
			{ phrase: 'postdoc', weight: 1.5 },
			{ phrase: 'national laboratory', weight: 1.6 },
			{ phrase: 'research scientist', weight: 1.5 },
			{ phrase: 'scientific research', weight: 1.5 },
			{ phrase: 'climate research', weight: 1.8 },
			{ phrase: 'energy research', weight: 1.8 },
			{ phrase: 'educational equity', weight: 1.9 },
			{ phrase: 'educational equity', weight: 1.9 },
			{ phrase: 'teacher support', weight: 1.7 },
			{ phrase: 'k-12', weight: 1.6 },
			{ phrase: 'higher education', weight: 1.5 },
			{ phrase: 'workforce development', weight: 1.8 },
		],
	},
	mentalHealth: {
		weight: 1.0,
		saturationWeight: 3.6,
		keywords: [
			{ phrase: 'mental health', weight: 2.0 },
			{ phrase: 'behavioral health', weight: 1.9 },
			{ phrase: 'counseling', weight: 1.6 },
			{ phrase: 'therapy', weight: 1.7 },
			{ phrase: 'therapist', weight: 1.7 },
			{ phrase: 'psychiatry', weight: 1.8 },
			{ phrase: 'psychology', weight: 1.5 },
			{ phrase: 'depression', weight: 1.9 },
			{ phrase: 'anxiety', weight: 1.7 },
			{ phrase: 'suicide prevention', weight: 2.0 },
			{ phrase: 'substance use', weight: 1.5 },
			{ phrase: 'addiction recovery', weight: 1.8 },
			{ phrase: 'trauma-informed', weight: 1.9 },
			{ phrase: 'crisis hotline', weight: 1.9 },
			{ phrase: 'emotional wellbeing', weight: 1.5 },
			{ phrase: 'peer support', weight: 1.4 },
			{ phrase: 'mindfulness', weight: 1.3 },
			{ phrase: 'wellness program', weight: 1.2 },
			{ phrase: 'mental wellness', weight: 1.6 },
			{ phrase: 'resilience', weight: 1.1 },
		],
	},
	medicalLifeSaving: {
		weight: 1.1,
		saturationWeight: 4.6,
		keywords: [
			{ phrase: 'healthcare', weight: 1.3 },
			{ phrase: 'safer healthier', weight: 1.5 },
			{ phrase: 'healthier environments', weight: 1.6 },
			{ phrase: 'clinical', weight: 1.2 },
			{ phrase: 'patient care', weight: 1.7 },
			{ phrase: 'hospital', weight: 1.1 },
			{ phrase: 'public health', weight: 1.8 },
			{ phrase: 'health monitoring', weight: 1.4 },
			{ phrase: 'medical monitoring', weight: 1.4 },
			{ phrase: 'preventive care', weight: 1.7 },
			{ phrase: 'emergency medicine', weight: 2.0 },
			{ phrase: 'first responder', weight: 1.8 },
			{ phrase: 'ambulance', weight: 1.5 },
			{ phrase: 'critical care', weight: 1.9 },
			{ phrase: 'life-saving', weight: 2.0 },
			{ phrase: 'lifesaving', weight: 2.0 },
			{ phrase: 'diagnostics', weight: 1.5 },
			{ phrase: 'medical device', weight: 1.9 },
			{ phrase: 'medtech', weight: 1.6 },
			{ phrase: 'drug discovery', weight: 1.8 },
			{ phrase: 'vaccine', weight: 1.8 },
			{ phrase: 'disease prevention', weight: 1.9 },
			{ phrase: 'epidemiology', weight: 1.9 },
			{ phrase: 'maternal health', weight: 1.8 },
			{ phrase: 'telemedicine', weight: 1.5 },
			{ phrase: 'care coordination', weight: 1.4 },
			{ phrase: 'community clinic', weight: 1.8 },
			{ phrase: 'health equity', weight: 1.9 },
		],
	},
	greenTechCarbonReduction: {
		weight: 1.1,
		saturationWeight: 4.6,
		keywords: [
			{ phrase: 'climate', weight: 1.2 },
			{ phrase: 'combat climate change', weight: 2.1 },
			{ phrase: 'climate action', weight: 1.9 },
			{ phrase: 'climate solutions', weight: 1.9 },
			{ phrase: 'climate adaptation', weight: 1.9 },
			{ phrase: 'climate analytics', weight: 1.8 },
			{ phrase: 'climate data', weight: 1.8 },
			{ phrase: 'climate-friendly', weight: 1.7 },
			{ phrase: 'climate tech', weight: 1.9 },
			{ phrase: 'clean tech', weight: 1.8 },
			{ phrase: 'clean energy', weight: 1.9 },
			{ phrase: 'clean electricity', weight: 1.8 },
			{ phrase: 'energy transition', weight: 2.0 },
			{ phrase: 'energy supplier', weight: 1.2 },
			{ phrase: 'energy storage', weight: 2.0 },
			{ phrase: 'energy storage systems', weight: 2.0 },
			{ phrase: 'grid-scale storage', weight: 2.0 },
			{ phrase: 'battery-powered', weight: 1.5 },
			{ phrase: 'battery-powered sustainable future', weight: 1.8 },
			{ phrase: 'long-duration storage', weight: 1.9 },
			{ phrase: 'thermal storage', weight: 1.7 },
			{ phrase: 'thermal battery', weight: 1.8 },
			{ phrase: 'virtual batteries', weight: 1.8 },
			{ phrase: 'distributed battery', weight: 1.7 },
			{ phrase: 'distributed energy', weight: 1.8 },
			{ phrase: 'distributed energy resources', weight: 1.9 },
			{ phrase: 'der', weight: 1.1 },
			{ phrase: 'virtual power plant', weight: 1.9 },
			{ phrase: 'microgrid', weight: 1.9 },
			{ phrase: 'smart grid', weight: 1.9 },
			{ phrase: 'grid reliability', weight: 1.8 },
			{ phrase: 'grid stability', weight: 1.8 },
			{ phrase: 'grid modernization', weight: 1.9 },
			{ phrase: 'electrical grid', weight: 1.5 },
			{ phrase: 'power grid', weight: 1.6 },
			{ phrase: 'grid infrastructure', weight: 1.8 },
			{ phrase: 'renewable-powered', weight: 1.8 },
			{ phrase: 'renewable energy', weight: 2.0 },
			{ phrase: 'renewable generation', weight: 1.8 },
			{ phrase: 'renewable power', weight: 1.8 },
			{ phrase: 'wind power', weight: 1.6 },
			{ phrase: 'geothermal', weight: 1.7 },
			{ phrase: 'hydropower', weight: 1.7 },
			{ phrase: 'district heating', weight: 1.5 },
			{ phrase: 'home electrification', weight: 1.9 },
			{ phrase: 'electrification contractor', weight: 1.6 },
			{ phrase: 'heat pump', weight: 1.6 },
			{ phrase: 'building efficiency', weight: 1.8 },
			{ phrase: 'buildings retrofit', weight: 1.8 },
			{ phrase: 'built environment', weight: 1.5 },
			{ phrase: 'green building', weight: 1.7 },
			{ phrase: 'leed', weight: 1.5 },
			{ phrase: 'solar', weight: 1.4 },
			{ phrase: 'wind energy', weight: 1.7 },
			{ phrase: 'battery storage', weight: 1.8 },
			{ phrase: 'electrification', weight: 1.8 },
			{ phrase: 'fleet electrification', weight: 1.9 },
			{ phrase: 'electric vehicle', weight: 1.8 },
			{ phrase: 'electric vehicles', weight: 1.8 },
			{ phrase: 'ev charging', weight: 1.9 },
			{ phrase: 'charging infrastructure', weight: 1.9 },
			{ phrase: 'e-mobility', weight: 1.8 },
			{ phrase: 'sustainable mobility', weight: 1.8 },
			{ phrase: 'zero-emission', weight: 1.9 },
			{ phrase: 'zero emission', weight: 1.9 },
			{ phrase: 'low-carbon future', weight: 1.8 },
			{ phrase: 'low carbon future', weight: 1.8 },
			{ phrase: 'low-carbon', weight: 1.6 },
			{ phrase: 'decarbonize', weight: 1.9 },
			{ phrase: 'decarbonization', weight: 2.0 },
			{ phrase: 'decarbonisation', weight: 2.0 },
			{ phrase: 'industrial decarbonization', weight: 2.0 },
			{ phrase: 'industrial efficiency', weight: 1.6 },
			{ phrase: 'heavy industry', weight: 1.3 },
			{ phrase: 'carbon reduction', weight: 2.0 },
			{ phrase: 'carbon capture', weight: 2.0 },
			{ phrase: 'carbon removal', weight: 2.1 },
			{ phrase: 'carbon removal tech', weight: 2.1 },
			{ phrase: 'long-term storage', weight: 1.8 },
			{ phrase: 'carbon sequestration', weight: 1.8 },
			{ phrase: 'soil carbon', weight: 1.8 },
			{ phrase: 'carbon smart', weight: 1.8 },
			{ phrase: 'carbon markets', weight: 1.8 },
			{ phrase: 'carbon credits', weight: 1.8 },
			{ phrase: 'carbon accounting', weight: 1.8 },
			{ phrase: 'carbon emission analysis', weight: 1.8 },
			{ phrase: 'carbon emissions', weight: 1.7 },
			{ phrase: 'greenhouse gas', weight: 1.8 },
			{ phrase: 'ghg', weight: 1.5 },
			{ phrase: 'methane', weight: 1.8 },
			{ phrase: 'methane reduction', weight: 1.9 },
			{ phrase: 'fugitive emissions', weight: 1.8 },
			{ phrase: 'atmospheric monitoring', weight: 1.8 },
			{ phrase: 'emissions verification', weight: 1.8 },
			{ phrase: 'emissions monitoring', weight: 1.8 },
			{ phrase: 'net zero', weight: 2.0 },
			{ phrase: 'greenhouse gas', weight: 1.8 },
			{ phrase: 'net-negative', weight: 2.0 },
			{ phrase: 'net negative', weight: 2.0 },
			{ phrase: 'emissions', weight: 1.5 },
			{ phrase: 'energy efficiency', weight: 1.8 },
			{ phrase: 'sustainability', weight: 1.4 },
			{ phrase: 'sustainable', weight: 1.2 },
			{ phrase: 'environmental justice', weight: 1.9 },
			{ phrase: 'sustainable future', weight: 1.5 },
			{ phrase: 'greener future', weight: 1.5 },
			{ phrase: 'cleaner future', weight: 1.5 },
			{ phrase: 'environmental monitoring', weight: 1.7 },
			{ phrase: 'real-time monitoring', weight: 1.6 },
			{ phrase: 'remote sensing', weight: 1.8 },
			{ phrase: 'satellite data', weight: 1.8 },
			{ phrase: 'satellite monitoring', weight: 1.8 },
			{ phrase: 'earth observation', weight: 1.8 },
			{ phrase: 'earth-sensing', weight: 1.8 },
			{ phrase: 'wildfire risk', weight: 1.6 },
			{ phrase: 'stormwater', weight: 1.5 },
			{ phrase: 'watershed', weight: 1.6 },
			{ phrase: 'water conservation', weight: 1.7 },
			{ phrase: 'water reuse', weight: 1.7 },
			{ phrase: 'water solutions', weight: 1.5 },
			{ phrase: 'coastal', weight: 1.3 },
			{ phrase: 'ocean sinks', weight: 1.7 },
			{ phrase: 'coastal ocean sinks', weight: 1.9 },
			{ phrase: 'ecosystem restoration', weight: 1.8 },
			{ phrase: 'wetlands', weight: 1.6 },
			{ phrase: 'biodiversity', weight: 1.7 },
			{ phrase: 'regenerative agriculture', weight: 1.8 },
			{ phrase: 'sustainable agriculture', weight: 1.8 },
			{ phrase: 'soil health', weight: 1.8 },
			{ phrase: 'farmers', weight: 1.2 },
			{ phrase: 'agricultural emissions', weight: 1.8 },
			{ phrase: 'food agriculture land use', weight: 1.9 },
			{ phrase: 'sustainable materials', weight: 1.7 },
			{ phrase: 'carbon fiber recycling', weight: 1.9 },
			{ phrase: 'recycled batteries', weight: 1.8 },
			{ phrase: 'closed-loop', weight: 1.5 },
			{ phrase: 'circular economy', weight: 1.8 },
			{ phrase: 'waste reduction', weight: 1.6 },
			{ phrase: 'reforestation', weight: 1.9 },
			{ phrase: 'electric mobility', weight: 1.8 },
			{ phrase: 'sustainable finance', weight: 1.7 },
			{ phrase: 'green finance', weight: 1.7 },
			{ phrase: 'climate finance', weight: 1.8 },
			{ phrase: 'esg', weight: 1.3 },
			{ phrase: 'sustainability plans', weight: 1.5 },
			{ phrase: 'measurable climate actions', weight: 1.8 },
			{ phrase: 'transition planning', weight: 1.6 },
			{ phrase: 'regenerative infrastructure', weight: 1.8 },
			{ phrase: 'sustainable infrastructure', weight: 1.8 },
			{ phrase: 'trusted climate data', weight: 1.8 },
		],
	},
	disabilityAccessibility: {
		weight: 1.0,
		saturationWeight: 3.8,
		keywords: [
			{ phrase: 'accessibility', weight: 1.9 },
			{ phrase: 'accessible', weight: 1.4 },
			{ phrase: 'disabled', weight: 1.6 },
			{ phrase: 'disability', weight: 1.8 },
			{ phrase: 'assistive technology', weight: 2.0 },
			{ phrase: 'inclusive design', weight: 1.9 },
			{ phrase: 'universal design', weight: 1.9 },
			{ phrase: 'a11y', weight: 1.8 },
			{ phrase: 'screen reader', weight: 1.9 },
			{ phrase: 'wcag', weight: 1.9 },
			{ phrase: 'ada compliance', weight: 1.9 },
			{ phrase: 'mobility aid', weight: 1.7 },
			{ phrase: 'hearing support', weight: 1.7 },
			{ phrase: 'vision support', weight: 1.7 },
			{ phrase: 'neurodiversity', weight: 1.8 },
			{ phrase: 'accommodation', weight: 1.5 },
			{ phrase: 'assistive ai', weight: 1.7 },
			{ phrase: 'inclusive technology', weight: 1.7 },
			{ phrase: 'digital accessibility', weight: 1.9 },
			{ phrase: 'accessible design', weight: 1.8 },
			{ phrase: 'adaptive equipment', weight: 1.8 },
			{ phrase: 'independent living', weight: 1.8 },
			{ phrase: 'special needs', weight: 1.7 },
			{ phrase: 'rehabilitation', weight: 1.6 },
		],
	},
	childProtection: {
		weight: 1.16,
		saturationWeight: 4.0,
		keywords: [
			{ phrase: 'child safety', weight: 2.1 },
			{ phrase: 'protect kids', weight: 2.1 },
			{ phrase: 'protect children', weight: 2.1 },
			{ phrase: 'child welfare', weight: 2.0 },
			{ phrase: 'child protection', weight: 2.0 },
			{ phrase: 'youth services', weight: 1.7 },
			{ phrase: 'youth mental health', weight: 1.9 },
			{ phrase: 'pediatric', weight: 1.8 },
			{ phrase: 'pediatrics', weight: 1.8 },
			{ phrase: 'newborn care', weight: 1.9 },
			{ phrase: 'maternal and child health', weight: 2.0 },
			{ phrase: 'child abuse prevention', weight: 2.1 },
			{ phrase: 'foster care', weight: 1.9 },
			{ phrase: 'family services', weight: 1.7 },
			{ phrase: 'child development', weight: 1.7 },
			{ phrase: 'safe schools', weight: 1.8 },
			{ phrase: 'school counseling', weight: 1.7 },
			{ phrase: 'early intervention', weight: 1.7 },
		],
	},
}

const FIELD_WEIGHTS = {
	name: 1.75,
	tags: 1.6,
	type: 1.25,
	aiSummary: 1.2,
	description: 1.0,
	companyName: 0.7,
	location: 0.5,
	aiRedFlagSummary: 0.35,
} as const

// Global tuning constants for impact scoring.
const SCORE_WEIGHTS = {
	// Match weighting
	exactFieldMatchMultiplier: 1.0,
	tokenFallbackMultiplier: 0.62,
	partialPhraseMultiplier: 0.42,
	multiWordPhraseBonus: 1.08,
	singleWordPhrasePenalty: 0.94,
	minTokenLengthForFallback: 4,

	// Category scoring
	categorySaturationSoftener: 1.0,
	categoryActivationThreshold: 0.1,
	categoryHighConfidenceThreshold: 0.45,
	categoryHighConfidenceBonus: 0.03,
	categoryBlendPower: 1.05,

	// Cross-category behavior
	diversityPerCategoryBonus: 0.03,
	diversityMaxBonus: 0.16,
	crossDomainBoostThreshold: 3,
	crossDomainBoost: 0.04,

	// Action language signals
	actionHitNormalizer: 6,
	actionBonusScale: 0.09,
	actionHardCap: 0.12,

	// Red flag / quality penalties
	redFlagPenaltyScale: 0.12,
	redFlagPenaltyCap: 0.18,
	vagueRolePenalty: 0.02,
	commercialOnlyPenaltyScale: 0.06,
	commercialOnlyPenaltyCap: 0.24,
	moneyOnlyPenaltyScale: 0.1,
	moneyOnlyPenaltyCap: 0.3,
	environmentHarmPenaltyScale: 0.16,
	environmentHarmPenaltyCap: 0.42,
	defensePenaltyScale: 0.18,
	defensePenaltyCap: 0.46,

	// Hard caps for explicitly harmful domains.
	defenseHardScoreCap: 0.2,
	environmentHarmHardScoreCap: 0.24,
	moneyOnlyHardScoreCap: 0.22,

	// Evidence guardrails
	minCategoryCountForUncappedScore: 2,
	lowEvidenceScoreCap: 0.34,

	// Existing model blending
	existingImpactBlendWeight: 0,
	keywordImpactBlendWeight: 1,

	// Final calibration
	finalExponent: 0.95,
	finalFloor: 0,
	finalCeiling: 1,
} as const

const IMPACT_ACTION_TERMS = [
	'save lives',
	'reduce mortality',
	'prevent overdose',
	'prevent suicide',
	'protect children',
	'protect kids',
	'improve learning outcomes',
	'increase graduation',
	'reduce injustice',
	'increase access',
	'serve communities',
	'expand access',
	'deliver care',
	'scale impact',
	'disease prevention',
	'reduce emissions',
	'carbon reduction',
	'decarbonization',
	'restore ecosystems',
]

const RED_FLAG_TERMS = [
	'not mission-driven',
	'for-profit only',
	'growth at all costs',
	'hyper-growth sales',
	'casino',
	'gambling',
	'predatory lending',
]

const VAGUE_ROLE_TERMS = ['generalist', 'miscellaneous', 'other duties as assigned']

const COMMERCIAL_ONLY_TERMS = [
	'accept payments',
	'payment processing',
	'payment infrastructure',
	'increase revenue',
	'growth at all costs',
	'developer productivity',
	'internal tooling',
	'operational excellence',
	'maximize profit',
	'increase the gdp of the internet',
	'financial infrastructure platform',
	'enterprise sales',
]

const MONEY_ONLY_TERMS = [
	'shareholder value',
	'maximize shareholder value',
	'quarterly earnings',
	'revenue growth at all costs',
	'profit maximization',
	'increase arpu',
	'monetization strategy',
	'ad conversion optimization',
	'upsell',
	'cross-sell',
	'sales pipeline acceleration',
]

const ENVIRONMENT_HARM_TERMS = [
	'coal mining',
	'coal extraction',
	'oil and gas expansion',
	'petroleum extraction',
	'tar sands',
	'fracking',
	'pipeline expansion',
	'deforestation',
	'clear-cutting',
	'mountaintop removal',
	'deep sea drilling',
	'petrochemical expansion',
	'high-emission fuels',
	'fossil fuel growth',
	'emissions trading only',
]

const DEFENSE_SURVEILLANCE_MILITARY_TERMS = [
	'defense contractor',
	'military intelligence',
	'warfighter',
	'weapons systems',
	'missile guidance',
	'target acquisition',
	'battlefield',
	'lethal autonomy',
	'counterinsurgency',
	'signals intelligence',
	'geospatial intelligence',
	'mass surveillance',
	'facial recognition surveillance',
	'lawful intercept',
	'drone strike',
	'weapon platform',
]

const STRONG_MISSION_SIGNAL_TERMS = [
	'climate action',
	'decarbonization',
	'carbon reduction',
	'carbon removal',
	'renewable energy',
	'public health',
	'mental health',
	'accessibility',
	'assistive technology',
	'disability',
	'community support',
	'social impact',
	'life-saving',
	'disease prevention',
	'educational equity',
	'civil rights',
	'social justice',
	'child safety',
	'child welfare',
	'protect children',
	'protect kids',
	'youth mental health',
	'save lives',
]

function clamp01(value: number): number {
	return Math.max(0, Math.min(1, value))
}

function normalizeImpactNumber(value: unknown): number {
	if (typeof value !== 'number' || !Number.isFinite(value)) {
		return 0
	}
	if (value > 1 && value <= 100) {
		return clamp01(value / 100)
	}
	return clamp01(value)
}

function normalizeText(value: unknown): string {
	return String(value ?? '')
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
}

function tokenize(text: string): string[] {
	if (!text) {
		return []
	}
	return text
		.split(/\s+/)
		.map((token) => token.trim())
		.filter((token) => token.length >= 2)
}

function toSearchableText(job: ScrapedJob): string {
	return [
		job.name,
		job.company_name,
		job.location,
		job.description,
		job.type,
		job.ai_summary,
		job.ai_red_flag_summary,
		job.tags.join(' '),
	].map((part) => normalizeText(part)).join(' ').trim()
}

function escapeRegex(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function containsKeyword(searchableText: string, keyword: string): boolean {
	const normalizedKeyword = keyword.toLowerCase().trim()
	if (normalizedKeyword.length === 0) {
		return false
	}

	const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegex(normalizedKeyword)}([^a-z0-9]|$)`)
	return pattern.test(searchableText)
}

function buildFieldCorpus(job: ScrapedJob): Array<{ text: string; weight: number }> {
	return [
		{ text: normalizeText(job.name), weight: FIELD_WEIGHTS.name },
		{ text: normalizeText(job.tags.join(' ')), weight: FIELD_WEIGHTS.tags },
		{ text: normalizeText(job.type), weight: FIELD_WEIGHTS.type },
		{ text: normalizeText(job.ai_summary), weight: FIELD_WEIGHTS.aiSummary },
		{ text: normalizeText(job.description), weight: FIELD_WEIGHTS.description },
		{ text: normalizeText(job.company_name), weight: FIELD_WEIGHTS.companyName },
		{ text: normalizeText(job.location), weight: FIELD_WEIGHTS.location },
		{ text: normalizeText(job.ai_red_flag_summary), weight: FIELD_WEIGHTS.aiRedFlagSummary },
	]
}

function textContainsAny(text: string, phrases: string[]): number {
	let hits = 0
	for (const phrase of phrases) {
		if (containsKeyword(text, phrase)) {
			hits += 1
		}
	}
	return hits
}

/**
 * Calculates a mission-impact score for a job by scanning text for impact-oriented keywords.
 *
 * The score is composed from six categories:
 * - community support
 * - social justice
 * - teaching / education
 * - mental health
 * - medical / life saving
 * - green tech / carbon reduction
 * - assisting disabled people / accessibility
 * - child protection
 *
 * Each category uses saturation so repeated matches do not inflate the score indefinitely.
 * This function recomputes impact from job text each time and stores it on `job.impact_number`.
 * Existing `impact_number` values are treated as informational only (for debug logs) and do not bypass scoring.
 *
 * @param job - The job to score
 * @returns Impact score between 0 and 1
 */
export function calculateImpactScore(job: ScrapedJob, shouldLog = false): number {
	const aiImpactSummary = String(job.ai_impact_summary ?? '').trim()
	const aiImpactScore = normalizeImpactNumber(job.ai_impact_score)
	if (aiImpactSummary.length > 0) {
		if (shouldLog) {
			console.log('Using AI impact score for job:', job.name, 'value:', aiImpactScore)
		}
		job.impact_number = aiImpactScore
		return aiImpactScore
	}

	const existingImpact = normalizeImpactNumber(job.impact_number)
	if (shouldLog && existingImpact > 0) {
		console.log('Ignoring existing impact_number and recomputing from text for job:', job.name, 'value:', existingImpact)
	}

	const searchableText = toSearchableText(job)
	if (!searchableText) {
		const fallbackScore = existingImpact
		if (shouldLog) {
			console.log('Impact scoring fallback (empty searchable text) for job:', job.name, 'value:', fallbackScore)
		}
		job.impact_number = fallbackScore
		return fallbackScore
	}

	const fieldCorpus = buildFieldCorpus(job)
	const searchableTokens = new Set(tokenize(searchableText))

	let weightedCategoryScoreSum = 0
	let totalCategoryWeight = 0
	let matchedCategoryCount = 0
	const categoryScores: Partial<Record<CategoryName, number>> = {}

	for (const [categoryName, category] of Object.entries(IMPACT_CATEGORIES) as Array<[CategoryName, ImpactCategory]>) {
		let matchedWeight = 0

		for (const keyword of category.keywords) {
			const phraseTokens = tokenize(keyword.phrase)
			const phraseTokenCount = phraseTokens.length
			const phraseStructureMultiplier = phraseTokenCount > 1
				? SCORE_WEIGHTS.multiWordPhraseBonus
				: SCORE_WEIGHTS.singleWordPhrasePenalty

			let fieldMatchWeight = 0
			for (const field of fieldCorpus) {
				if (containsKeyword(field.text, keyword.phrase)) {
					fieldMatchWeight = Math.max(fieldMatchWeight, field.weight)
				}
			}

			if (fieldMatchWeight > 0) {
				matchedWeight +=
					keyword.weight *
					fieldMatchWeight *
					SCORE_WEIGHTS.exactFieldMatchMultiplier *
					phraseStructureMultiplier
				continue
			}

			// Token-level fallback for mild morphology differences.
			const keywordTokensForFallback = phraseTokens.filter(
				(token) => token.length >= SCORE_WEIGHTS.minTokenLengthForFallback,
			)
			const partiallyMatchedTokens = keywordTokensForFallback.filter((token) =>
				Array.from(searchableTokens).some((candidate) =>
					candidate.length >= SCORE_WEIGHTS.minTokenLengthForFallback &&
					(candidate.includes(token) || token.includes(candidate))
				),
			).length

			if (
				keywordTokensForFallback.length > 1 &&
				keywordTokensForFallback.every((token) =>
					Array.from(searchableTokens).some(
						(candidate) =>
							candidate.length >= SCORE_WEIGHTS.minTokenLengthForFallback &&
							(candidate.startsWith(token) || token.startsWith(candidate)),
					),
				)
			) {
				matchedWeight +=
					keyword.weight *
					SCORE_WEIGHTS.tokenFallbackMultiplier *
					phraseStructureMultiplier
			} else if (
				keywordTokensForFallback.length > 1 &&
				partiallyMatchedTokens >= Math.ceil(keywordTokensForFallback.length * 0.7)
			) {
				matchedWeight += keyword.weight * SCORE_WEIGHTS.partialPhraseMultiplier
			}
		}

		const softenedSaturation = category.saturationWeight * SCORE_WEIGHTS.categorySaturationSoftener
		let categoryScore = clamp01(matchedWeight / (matchedWeight + softenedSaturation))
		if (categoryScore >= SCORE_WEIGHTS.categoryHighConfidenceThreshold) {
			categoryScore = clamp01(categoryScore + SCORE_WEIGHTS.categoryHighConfidenceBonus)
		}
		categoryScores[categoryName] = categoryScore
		if (categoryScore > SCORE_WEIGHTS.categoryActivationThreshold) {
			matchedCategoryCount += 1
		}
		weightedCategoryScoreSum += categoryScore * category.weight
		totalCategoryWeight += category.weight
	}

	const rawCategoryBlendScore = totalCategoryWeight > 0
		? weightedCategoryScoreSum / totalCategoryWeight
		: 0
	const categoryBlendScore = clamp01(Math.pow(rawCategoryBlendScore, SCORE_WEIGHTS.categoryBlendPower))

	const actionHits = textContainsAny(searchableText, IMPACT_ACTION_TERMS)
	const actionBonus = Math.min(
		SCORE_WEIGHTS.actionHardCap,
		clamp01(actionHits / SCORE_WEIGHTS.actionHitNormalizer) * SCORE_WEIGHTS.actionBonusScale,
	)
	const diversityBonus = Math.min(
		SCORE_WEIGHTS.diversityMaxBonus,
		Math.max(0, matchedCategoryCount - 1) * SCORE_WEIGHTS.diversityPerCategoryBonus,
	)
	const crossDomainBonus = matchedCategoryCount >= SCORE_WEIGHTS.crossDomainBoostThreshold
		? SCORE_WEIGHTS.crossDomainBoost
		: 0

	const redFlagHits = textContainsAny(searchableText, RED_FLAG_TERMS)
	const redFlagPenalty = Math.min(
		SCORE_WEIGHTS.redFlagPenaltyCap,
		redFlagHits * SCORE_WEIGHTS.redFlagPenaltyScale,
	)
	const vagueRoleHits = textContainsAny(searchableText, VAGUE_ROLE_TERMS)
	const vagueRolePenalty = vagueRoleHits > 0 ? SCORE_WEIGHTS.vagueRolePenalty : 0
	const commercialOnlyHits = textContainsAny(searchableText, COMMERCIAL_ONLY_TERMS)
	const commercialOnlyPenalty = Math.min(
		SCORE_WEIGHTS.commercialOnlyPenaltyCap,
		commercialOnlyHits * SCORE_WEIGHTS.commercialOnlyPenaltyScale,
	)
	const moneyOnlyHits = textContainsAny(searchableText, MONEY_ONLY_TERMS)
	const moneyOnlyPenalty = Math.min(
		SCORE_WEIGHTS.moneyOnlyPenaltyCap,
		moneyOnlyHits * SCORE_WEIGHTS.moneyOnlyPenaltyScale,
	)
	const environmentHarmHits = textContainsAny(searchableText, ENVIRONMENT_HARM_TERMS)
	const environmentHarmPenalty = Math.min(
		SCORE_WEIGHTS.environmentHarmPenaltyCap,
		environmentHarmHits * SCORE_WEIGHTS.environmentHarmPenaltyScale,
	)
	const defenseSurveillanceHits = textContainsAny(searchableText, DEFENSE_SURVEILLANCE_MILITARY_TERMS)
	const defensePenalty = Math.min(
		SCORE_WEIGHTS.defensePenaltyCap,
		defenseSurveillanceHits * SCORE_WEIGHTS.defensePenaltyScale,
	)
	const strongMissionSignalHits = textContainsAny(searchableText, STRONG_MISSION_SIGNAL_TERMS)

	const preBlendKeywordScore = clamp01(
		categoryBlendScore +
			actionBonus +
			diversityBonus +
			crossDomainBonus -
			redFlagPenalty -
			vagueRolePenalty -
			commercialOnlyPenalty -
			moneyOnlyPenalty -
			environmentHarmPenalty -
			defensePenalty,
	)
	let evidenceAdjustedKeywordScore =
		matchedCategoryCount < SCORE_WEIGHTS.minCategoryCountForUncappedScore && strongMissionSignalHits === 0
			? Math.min(preBlendKeywordScore, SCORE_WEIGHTS.lowEvidenceScoreCap)
			: preBlendKeywordScore

	// Explicitly downscore clearly harmful domains unless there is exceptionally strong mission evidence.
	if (defenseSurveillanceHits > 0 && strongMissionSignalHits === 0) {
		evidenceAdjustedKeywordScore = Math.min(
			evidenceAdjustedKeywordScore,
			SCORE_WEIGHTS.defenseHardScoreCap,
		)
	}

	if (environmentHarmHits > 0 && (categoryScores.greenTechCarbonReduction ?? 0) < 0.2) {
		evidenceAdjustedKeywordScore = Math.min(
			evidenceAdjustedKeywordScore,
			SCORE_WEIGHTS.environmentHarmHardScoreCap,
		)
	}

	if (moneyOnlyHits >= 2 && matchedCategoryCount < 2 && strongMissionSignalHits === 0) {
		evidenceAdjustedKeywordScore = Math.min(
			evidenceAdjustedKeywordScore,
			SCORE_WEIGHTS.moneyOnlyHardScoreCap,
		)
	}
	const keywordImpactScore = clamp01(
		evidenceAdjustedKeywordScore * SCORE_WEIGHTS.keywordImpactBlendWeight +
		existingImpact * SCORE_WEIGHTS.existingImpactBlendWeight,
	)
	const calibratedImpactScore = clamp01(Math.pow(keywordImpactScore, SCORE_WEIGHTS.finalExponent))
	const boundedImpactScore = Math.max(
		SCORE_WEIGHTS.finalFloor,
		Math.min(SCORE_WEIGHTS.finalCeiling, calibratedImpactScore),
	)

	if (shouldLog) {
		console.log('[ImpactScore debug]', {
			job: job.name,
			categoryScores,
			matchedCategoryCount,
			actionHits,
			redFlagHits,
			vagueRoleHits,
			commercialOnlyHits,
			moneyOnlyHits,
			environmentHarmHits,
			defenseSurveillanceHits,
			strongMissionSignalHits,
			weightedCategoryScoreSum,
			totalCategoryWeight,
			rawCategoryBlendScore,
			categoryBlendScore,
			actionBonus,
			diversityBonus,
			crossDomainBonus,
			redFlagPenalty,
			vagueRolePenalty,
			commercialOnlyPenalty,
			moneyOnlyPenalty,
			environmentHarmPenalty,
			defensePenalty,
			preBlendKeywordScore,
			evidenceAdjustedKeywordScore,
			keywordImpactScore,
			calibratedImpactScore,
			boundedImpactScore,
		})
	}
	job.impact_number = boundedImpactScore
	return job.impact_number
}
