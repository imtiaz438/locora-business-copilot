import { ClientBusiness, PriorityAction } from '../types';

// PRODUCTION MODE: Clean initial business state - never fake reviews, fake ratings, or fake metrics
export const INITIAL_BUSINESSES: ClientBusiness[] = [];

// Clean initial onboarding/priority actions - real configuration steps, never fabricated issues
export const INITIAL_PRIORITY_ACTIONS: PriorityAction[] = [
  {
    id: 'act_connect_gbp',
    urgency: 'high',
    urgencyLabel: 'INTEGRATION',
    title: 'Connect Google Business Profile',
    problem: 'Google Business Profile is not yet connected to Locora.',
    whyItMatters: 'Connecting your verified Google listing enables automated review tracking, reputation monitoring, and local 3-pack visibility analysis.',
    evidence: 'GBP status: Not Connected.',
    expectedImpact: 'Enables live review synchronization, rating metrics, and AI-assisted review replies.',
    actionType: 'respond_reviews',
    actionLabel: 'Connect Google',
    recommendationTitle: 'Link Google Business Profile',
    itemsToCreate: [
      'Google Maps listing link',
      'Verified review stream',
      'Operating hours synchronization',
      'Local rating metrics',
    ],
    isFixed: false,
  },
  {
    id: 'act_live_crawl',
    urgency: 'high',
    urgencyLabel: 'AUDIT PENDING',
    title: 'Run Technical SEO Website Crawl',
    problem: 'No website crawl telemetry has been recorded yet.',
    whyItMatters: 'Inspecting server response latency, SSL certificates, heading structure, and LocalBusiness JSON-LD schema is required to benchmark search readiness.',
    evidence: '0 crawls recorded for this domain.',
    expectedImpact: 'Discovers crawl errors, missing meta tags, and structured schema opportunities.',
    actionType: 'schema_fix',
    actionLabel: 'Run Website Audit',
    recommendationTitle: 'Run Technical SEO Audit',
    itemsToCreate: [
      'On-page SEO score',
      'Performance and latency check',
      'LocalBusiness Schema validation',
      'Meta title and description inspection',
    ],
    isFixed: false,
  },
  {
    id: 'act_configure_profile',
    urgency: 'opportunity',
    urgencyLabel: 'PROFILE SETUP',
    title: 'Complete Local Business Profile & Services',
    problem: 'Business profile services and target locations are awaiting configuration.',
    whyItMatters: 'Clear service categories and geo-target locations power tailored keyword discovery, competitor benchmarking, and AI visibility checks.',
    evidence: 'Profile setup pending in Business Settings.',
    expectedImpact: 'Enables precise local rank tracking and competitor intelligence.',
    actionType: 'create_page',
    actionLabel: 'Complete Profile',
    recommendationTitle: 'Configure Business Profile',
    itemsToCreate: [
      'Primary category & industry',
      'Core services list',
      'Target service areas',
      'Primary competitor URLs',
    ],
    isFixed: false,
  },
];
