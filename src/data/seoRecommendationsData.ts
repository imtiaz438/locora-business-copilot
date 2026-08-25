import { SeoRecommendation } from '../types';

export const DEFAULT_SEO_RECOMMENDATIONS: SeoRecommendation[] = [
  {
    id: 'seo_rec_tbt',
    metricCode: 'TBT',
    title: 'Reduce how long the page is blocked from responding to user input',
    metricName: 'Total Blocking Time (TBT)',
    seoImpact: 'High',
    technicalDifficulty: 'Moderate',
    role: 'Frontend Developer',
    pagesAffectedCount: 1,
    benchmark: '< 200 ms',
    recommendedBy: 'Google Lighthouse',
    status: 'needs_fix',
    description:
      'Total Blocking Time (TBT) measures the total amount of time that a page is blocked from responding to user input, such as mouse clicks, screen taps, or keyboard presses. A good TBT is less than 200 milliseconds (ms).',
    howToFix:
      'Break up long JavaScript execution tasks (> 50ms), defer non-critical third-party analytics scripts, leverage web workers for computational processing, and split large JS vendor bundles using code-splitting (`React.lazy()` / dynamic imports).',
    codeSnippet: `// 1. Defer non-critical scripts
<script src="analytics.js" defer async></script>

// 2. Break up long execution tasks using requestIdleCallback / setTimeout
function scheduleNonCriticalWork(task) {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(task, { timeout: 1000 });
  } else {
    setTimeout(task, 50);
  }
}

// 3. React Code Splitting
const HeavyReportChart = React.lazy(() => import('./HeavyReportChart'));`,
    affectedPages: [
      {
        path: '/checkout',
        title: 'Checkout & Payment Portal',
        issueDetail: 'Main thread blocked for 480ms during credit card tokenization initialization and synchronous analytics parsing.',
      },
    ],
  },
  {
    id: 'seo_rec_cls',
    metricCode: 'CLS',
    title: 'Reduce page layout shifts',
    metricName: 'Cumulative Layout Shift (CLS)',
    seoImpact: 'High',
    technicalDifficulty: 'Moderate',
    role: 'Frontend Developer',
    pagesAffectedCount: 7,
    benchmark: '< 0.1 score',
    recommendedBy: 'Google Lighthouse',
    status: 'needs_fix',
    description:
      'Cumulative Layout Shift (CLS), a Google metric, measures the overall visual stability of a page. Sudden shifts in the layout of a page can negatively affect your visitors\' experience and its ranking in search results. Aim for a CLS score of less than 0.1.',
    howToFix:
      'Always specify explicit `width` and `height` attributes or aspect-ratio CSS on all image and video tags. Reserve layout space for dynamically injected top alert banners and async ad containers using CSS `min-height` skeletons.',
    codeSnippet: `/* 1. Explicit Image & Media Aspect Ratios */
img, video {
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
}

/* 2. Reserve layout placeholder for dynamic announcement banners */
.announcement-banner-placeholder {
  min-height: 48px;
  content-visibility: auto;
}

/* 3. Prevent font FOIT layout jump */
@font-face {
  font-family: 'Plus Jakarta Sans';
  font-display: swap;
}`,
    affectedPages: [
      { path: '/', title: 'Homepage', issueDetail: 'Hero banner images load without width/height, causing a 0.32 layout shift when rendering.' },
      { path: '/pricing', title: 'Pricing & Plans', issueDetail: 'Billing toggle inserts discounted badge dynamically without reserved parent min-height.' },
      { path: '/services', title: 'Services Catalog', issueDetail: 'Async service card icons push cards downward after web font hydration.' },
      { path: '/blog/local-seo-guide', title: 'Local SEO Guide Post', issueDetail: 'Embedded YouTube video iframe lacks aspect-ratio container wrapper.' },
      { path: '/about', title: 'Company & Team', issueDetail: 'Team avatar grid shifts upon SVG badge loading.' },
      { path: '/proposals', title: 'Proposal Builder', issueDetail: 'Sidebar template list pops into DOM after customer profile query resolves.' },
      { path: '/invoices', title: 'Invoice Generator', issueDetail: 'Total calculation summary box resizes dynamically upon line-item load.' },
    ],
  },
  {
    id: 'seo_rec_viewport',
    metricCode: 'VIEWPORT',
    title: 'Make sure the page width matches the viewport width',
    metricName: 'Mobile Viewport Alignment',
    seoImpact: 'Critical',
    technicalDifficulty: 'Easy',
    role: 'Frontend Developer',
    pagesAffectedCount: 2,
    benchmark: '100% viewport width match',
    recommendedBy: 'Google Lighthouse',
    status: 'needs_fix',
    description:
      'Page viewport sets the width of the page for the device where it\'s being viewed. If the width of the page is different from the width of the viewport, the page may not display correctly on mobile screens. Use percentage widths for layout elements and media queries to make sure your site is responsive.',
    howToFix:
      'Ensure `<meta name="viewport" content="width=device-width, initial-scale=1.0">` is present in the `<head>`. Replace fixed pixel widths (e.g. `width: 1200px`) with fluid responsive classes like `w-full max-w-7xl` and ensure `overflow-x: hidden` is configured on the root body.',
    codeSnippet: `<!-- 1. Ensure Standard Viewport Tag in index.html head -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">

<!-- 2. Responsive CSS Container Pattern -->
<div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 box-border">
  <!-- Content fluidly scales without causing horizontal scrollbars -->
</div>

/* 3. Global CSS Overflow Protection */
html, body {
  max-width: 100vw;
  overflow-x: hidden;
}`,
    affectedPages: [
      { path: '/landing/custom-quote', title: 'Custom Quote Landing', issueDetail: 'Outer table element has hardcoded inline width="980px" breaking mobile viewports.' },
      { path: '/embedded-widget', title: 'Embeddable Booking Widget', issueDetail: 'Fixed container boundary causes 140px horizontal page overflow on screens < 400px.' },
    ],
  },
  {
    id: 'seo_rec_tap_targets',
    metricCode: 'TAP_TARGETS',
    title: 'Make sure mobile users can easily click on each page element',
    metricName: 'Touch / Tap Target Sizing',
    seoImpact: 'High',
    technicalDifficulty: 'Easy',
    role: 'Web Designer',
    pagesAffectedCount: 1,
    benchmark: '≥ 48px × 48px per target',
    recommendedBy: 'Google Lighthouse',
    status: 'needs_fix',
    description:
      'Interactive elements, such as buttons and links, that are too small or too close together can be difficult to click on mobile devices. Elements should be at least 48 pixels by 48 pixels. Increase the element size or padding.',
    howToFix:
      'Increase padding on clickable icons, buttons, and navigation links to guarantee a minimum 48px × 48px touch target. Ensure a minimum 8px spacing clearance between adjacent interactive tap targets.',
    codeSnippet: `/* CSS Rule for Touch-Friendly Interactive Targets */
.touch-target {
  min-width: 48px;
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
}

/* Tailwind Equivalent */
<button className="min-w-[48px] min-h-[48px] p-3 flex items-center justify-center">
  <Icon className="w-5 h-5" />
</button>`,
    affectedPages: [
      { path: '/contact', title: 'Contact & Consultation', issueDetail: 'Social icon links in the mobile footer and calendar navigation arrows measure only 26px × 26px with 2px gap.' },
    ],
  },
  {
    id: 'seo_rec_lcp',
    metricCode: 'LCP',
    title: 'Improve page loading time',
    metricName: 'Largest Contentful Paint (LCP)',
    seoImpact: 'Critical',
    technicalDifficulty: 'Advanced',
    role: 'Frontend Developer',
    pagesAffectedCount: 18,
    benchmark: '≤ 2.5 seconds',
    recommendedBy: 'Google Lighthouse',
    status: 'needs_fix',
    description:
      'Largest Contentful Paint (LCP) is the largest element on the page. For the best user experience, this element should appear within 2.5 seconds of the page starting to load.',
    howToFix:
      'Convert hero images to WebP/AVIF format, add `fetchpriority="high"` and `rel="preload"` to the LCP hero asset, enable HTTP/2 and CDN edge caching with gzip/brotli compression, and remove render-blocking stylesheets.',
    codeSnippet: `<!-- 1. Preload LCP Hero Asset in HTML Head -->
<link rel="preload" fetchpriority="high" as="image" href="/hero-banner.webp" type="image/webp">

<!-- 2. High Priority Modern Image Tag -->
<img
  src="/hero-banner.webp"
  alt="Locora AI Platform"
  fetchpriority="high"
  loading="eager"
  decoding="async"
  width="1200"
  height="630"
  className="w-full h-auto"
/>

<!-- 3. Server Cache-Control Header -->
Cache-Control: public, max-age=31536000, immutable`,
    affectedPages: [
      { path: '/', title: 'Home Page', issueDetail: 'Hero visual is 2.4 MB uncompressed PNG; LCP triggers at 3.8s on 4G connections.' },
      { path: '/pricing', title: 'Pricing Page', issueDetail: 'Render-blocking Google Font stylesheet delays initial hero title render by 1.1s.' },
      { path: '/proposals', title: 'Proposals Dashboard', issueDetail: 'Heavy template illustration SVG delays LCP to 3.2s.' },
      { path: '/invoices', title: 'Invoice Hub', issueDetail: 'Uncached PDF preview script blocks rendering for 2.9s.' },
      { path: '/crm', title: 'CRM Client Manager', issueDetail: 'Synchronous client directory fetch delays primary UI paint.' },
      { path: '/local-seo', title: 'Local SEO Assistant', issueDetail: 'Static maps API script loaded synchronously in head.' },
      { path: '/marketing-planner', title: 'Marketing Planner', issueDetail: 'Large roadmap canvas bundle parsed synchronously.' },
      { path: '/documents', title: 'Document Generator', issueDetail: 'Template preview card images lack lazy loading.' },
      { path: '/settings', title: 'Settings', issueDetail: 'Multiple tab icons load without asset prefetching.' },
      { path: '/terms', title: 'Terms of Service', issueDetail: 'Font display block causes invisible text during webfont download.' },
      { path: '/privacy', title: 'Privacy Policy', issueDetail: 'Uncompressed static layout CSS payload.' },
      { path: '/login', title: 'User Sign In', issueDetail: 'Full bundle hydration required before login card appears.' },
      { path: '/signup', title: 'Account Registration', issueDetail: 'Render-blocking script tag in legacy head template.' },
      { path: '/features/proposals', title: 'Feature: AI Proposals', issueDetail: 'Product demo screenshot is 3.1 MB JPEG.' },
      { path: '/features/local-seo', title: 'Feature: Local SEO', issueDetail: 'Missing CDN caching headers; served with Cache-Control: no-cache.' },
      { path: '/features/invoices', title: 'Feature: Invoicing', issueDetail: 'Heavy chart library included in critical rendering path.' },
      { path: '/blog/local-seo-guide', title: 'Blog: SEO Guide', issueDetail: 'Featured post banner image lacks srcset responsive sizing.' },
      { path: '/contact', title: 'Contact Us', issueDetail: 'External reCAPTCHA script blocks main thread during initial paint.' },
    ],
  },
  {
    id: 'seo_rec_https',
    metricCode: 'HTTPS',
    title: 'Make sure all pages load over a secure connection',
    metricName: 'HTTPS / SSL Encryption & Mixed Content',
    seoImpact: 'Critical',
    technicalDifficulty: 'Easy',
    role: 'DevOps Engineer',
    pagesAffectedCount: 18,
    benchmark: '100% HTTPS enforcement & HSTS',
    recommendedBy: 'Google Lighthouse',
    status: 'needs_fix',
    description:
      'Pages that load over HTTPS offer a more secure browsing experience for your website visitors. They also tend to appear higher in search results than pages that don\'t load over a secure connection. HubSpot-hosted sites can edit their domain settings. Otherwise, a developer may need to help.',
    howToFix:
      'Configure 301 permanent redirects from HTTP to HTTPS at the web server/reverse proxy level. Enable Strict-Transport-Security (HSTS) response headers and eliminate mixed content (insecure `http://` image/script URLs).',
    codeSnippet: `// 1. Express / Node.js HTTPS Redirection Middleware
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(301, \`https://\${req.hostname}\${req.originalUrl}\`);
  }
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  next();
});

# 2. Nginx SSL Configuration
server {
  listen 80;
  server_name yourdomain.com www.yourdomain.com;
  return 301 https://$host$request_uri;
}`,
    affectedPages: [
      { path: '/*', title: 'All 18 Site Pages', issueDetail: 'HTTP to HTTPS 301 redirect rule needs verification across custom domain and subdomains to prevent insecure protocol indexing.' },
    ],
  },
  {
    id: 'seo_rec_font_size',
    metricCode: 'FONT_SIZE',
    title: 'Make sure all text has a legible font size',
    metricName: 'Mobile Typography Legibility',
    seoImpact: 'Medium',
    technicalDifficulty: 'Easy',
    role: 'Web Designer',
    pagesAffectedCount: 8,
    benchmark: '≥ 60% text at ≥ 12px / 16px body',
    recommendedBy: 'Google Lighthouse',
    status: 'needs_fix',
    description:
      'Make sure at least 60% of the page text uses a font size that is 12 pixels or more to make it easy to read for mobile users.',
    howToFix:
      'Set the base root font size to 16px (`1rem`). Increase micro-copy, disclaimer captions, and table metadata from sub-12px (e.g. 9px–10px) to a minimum of 12px (0.75rem) or 14px (0.875rem) with line-height of at least 1.5.',
    codeSnippet: `/* 1. Global Typography Baseline */
html {
  font-size: 16px;
}

body {
  font-size: 1rem; /* 16px standard readability */
  line-height: 1.6;
}

/* 2. Micro-copy & Legal Disclaimers (Never drop below 12px) */
.caption-text, .footnote, .legal-disclaimer {
  font-size: 0.75rem; /* 12px minimum */
  line-height: 1.5;
  color: #64748b;
}`,
    affectedPages: [
      { path: '/terms', title: 'Terms of Service', issueDetail: 'Clause legal text rendered in 9.5px font size with tight 1.1 line height.' },
      { path: '/privacy', title: 'Privacy Policy', issueDetail: 'Cookie data table footnotes rendered in 10px font size.' },
      { path: '/pricing', title: 'Pricing FAQ & Disclaimers', issueDetail: 'Currency conversion disclaimer and refund notes formatted at 10.5px.' },
      { path: '/faq', title: 'Frequently Asked Questions', issueDetail: 'Answer subtext in collapse accordions uses sub-12px styling on mobile.' },
      { path: '/blog/local-seo-guide', title: 'Blog Post Footnotes', issueDetail: 'Citation references formatted at 10px.' },
      { path: '/services/plumbing', title: 'Plumbing Service Schema', issueDetail: 'Emergency disclaimer badge text sized at 10px.' },
      { path: '/services/legal', title: 'Legal Intake Disclaimers', issueDetail: 'Statute of limitations warning note formatted at 10px.' },
      { path: '/reviews', title: 'Customer Reviews Wall', issueDetail: 'Review timestamp dates and verification tags sized at 10px.' },
    ],
  },
];
