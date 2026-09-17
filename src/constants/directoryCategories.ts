/**
 * Standard business categories taxonomy for Locora AI Directory & Search
 * Includes all standard industry verticals plus fallback "Other"
 */
export const STANDARD_DIRECTORY_CATEGORIES = [
  'Dentist / Dental Clinic',
  'Software & AI Marketing',
  'Plumbing Services',
  'HVAC & Air Conditioning',
  'Roofing & Gutters',
  'Electrician Services',
  'Legal Services & Lawyers',
  'Medical Clinic / Doctors',
  'Real Estate & Property',
  'Accounting & Financial Services',
  'Auto Repair & Mechanics',
  'Home Remodeling & Contractors',
  'Landscaping & Tree Service',
  'Cleaning & Janitorial Services',
  'Pest Control',
  'Veterinary & Pet Care',
  'Fitness, Gym & Personal Training',
  'Beauty, Salon & Spa',
  'Restaurant & Catering',
  'Photography & Videography',
  'Marketing & Web Development',
  'Locksmith Services',
  'Painting & Drywall',
  'Flooring & Carpet Installation',
  'Moving & Storage',
  'Other / Uncategorized',
] as const;

export type DirectoryCategory = (typeof STANDARD_DIRECTORY_CATEGORIES)[number];
