export interface HowToStep {
  stepNumber: number;
  title: string;
  description: string;
  proTip?: string;
}

export interface ProsAndCons {
  pros: string[];
  cons: string[];
}

export interface CaseStudy {
  businessName: string;
  industry: string;
  location: string;
  challenge: string;
  solution: string;
  timeSpentBefore: string;
  timeSpentAfter: string;
  results: Array<{ label: string; value: string }>;
}

export interface SandboxPreset {
  businessName: string;
  industry: string;
  location: string;
  sampleInput: string;
  sampleOutput: string;
  outputType: string;
}

export interface SeoFeatureItem {
  slug: string;
  aliases?: string[];
  name: string;
  metaTitle: string;
  metaDescription: string;
  targetKeywords: string[];
  badge: string;
  heroHeadline: string;
  heroSubheadline: string;
  readingTime?: string;
  publishedDate?: string;
  authorName?: string;
  authorRole?: string;
  targetTab: string; // The dashboard module if user chooses to sign in
  ctaText: string;
  ctaSubtext: string;
  iconName: string;
  editorialOverview: {
    leadParagraph: string;
    whyItMatters: string;
    coreCapabilities: string[];
    technicalArchitecture: string;
  };
  keyBenefits: Array<{ title: string; desc: string; icon: string }>;
  howToUseGuide: HowToStep[];
  prosAndCons: ProsAndCons;
  bestPractices: string[];
  commonMistakes: string[];
  caseStudy: CaseStudy;
  sandbox: {
    heading: string;
    subheading: string;
    defaultIndustry: string;
    presets: SandboxPreset[];
  };
  workflowComparison: {
    manualOldWay: string[];
    locoraAiWay: string[];
  };
  samplePreview: {
    title: string;
    description: string;
    stats: Array<{ label: string; value: string }>;
    snippetLabel: string;
    snippetContent: string;
  };
  faqs: Array<{ q: string; a: string }>;
}

export interface SeoUseCaseItem {
  slug: string;
  title: string;
  category: 'Agency Operations' | 'Local Business Growth' | 'Lead Generation & Sales';
  metaTitle: string;
  metaDescription: string;
  targetKeywords: string[];
  heroHeadline: string;
  heroSubheadline: string;
  readingTime?: string;
  publishedDate?: string;
  targetTab: string;
  ctaText: string;
  editorialOverview: {
    problemStatement: string;
    strategicValue: string;
    marketContext: string;
  };
  whoIsThisFor: Array<{ role: string; description: string }>;
  painPoints: Array<{ title: string; desc: string }>;
  solutions: Array<{ title: string; desc: string; step: string }>;
  stepByStepFramework: HowToStep[];
  prosAndCons: ProsAndCons;
  bestPractices: string[];
  caseStudy: CaseStudy;
  resultsMetric: { value: string; label: string; subtext: string };
  faqs: Array<{ q: string; a: string }>;
}

export interface SeoResourceArticle {
  slug: string;
  title: string;
  category: 'Local SEO' | 'Proposals & Sales' | 'Google Business' | 'Checklists & SOPs';
  readingTime: string;
  publishedDate: string;
  authorName?: string;
  authorRole?: string;
  metaTitle: string;
  metaDescription: string;
  targetKeywords: string[];
  targetTab: string;
  ctaText: string;
  ctaHeadline: string;
  ctaDescription: string;
  summary: string;
  prosAndCons?: ProsAndCons;
  tableOfContents: Array<{ id: string; title: string }>;
  sections: Array<{
    id: string;
    heading: string;
    content: string[];
    keyTakeaway?: string;
    checklistItems?: string[];
  }>;
  faqs: Array<{ q: string; a: string }>;
}

export interface SeoIndustryItem {
  slug: string;
  name: string;
  shortName: string;
  icon: string;
  badge: string;
  heroHeadline: string;
  heroSubheadline: string;
  targetTab: string;
  overview: string;
  howToUse: HowToStep[];
  prosAndCons: ProsAndCons;
  localSeoChecklist: string[];
  sampleDeliverables: {
    gbpBio: string;
    reviewReply: string;
    schemaType: string;
    jsonLdSnippet: string;
  };
  roiBenchmark: {
    avgTicket: number;
    closeRate: string;
    timeSavedHoursPerMonth: number;
    projectedNewMonthlyRevenue: string;
  };
  caseStudy: CaseStudy;
  faqs: Array<{ q: string; a: string }>;
}
