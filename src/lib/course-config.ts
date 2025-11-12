/**
 * Centralized course configuration
 * Maps database course_type slugs to consistent display names across the entire platform
 * Use this for ALL course name references to ensure consistency in UI, payments, emails, etc.
 */

export interface CourseConfig {
  slug: string; // URL-friendly slug (same as database course_type)
  displayName: string; // Full display name
  shortName: string; // Short display name for compact spaces
  category: 'compliance' | 'data' | 'cybersecurity' | 'business' | 'marketing';
}

export const COURSE_CONFIG: Record<string, CourseConfig> = {
  'aml-kyc': {
    slug: 'aml-kyc',
    displayName: 'AML/KYC Compliance',
    shortName: 'AML/KYC',
    category: 'compliance',
  },
  'crypto-compliance': {
    slug: 'crypto-compliance',
    displayName: 'Crypto & Digital Assets',
    shortName: 'Crypto & Digital Assets',
    category: 'compliance',
  },
  'data-privacy': {
    slug: 'data-privacy',
    displayName: 'Data Privacy & GDPR',
    shortName: 'Data Privacy',
    category: 'compliance',
  },
  'data-analysis': {
    slug: 'data-analysis',
    displayName: 'Data Analysis',
    shortName: 'Data Analysis',
    category: 'data',
  },
  'cybersecurity': {
    slug: 'cybersecurity',
    displayName: 'Cybersecurity',
    shortName: 'Cybersecurity',
    category: 'cybersecurity',
  },
  'business-analysis': {
    slug: 'business-analysis',
    displayName: 'Business Analysis',
    shortName: 'Business Analysis',
    category: 'business',
  },
  'digital-marketing': {
    slug: 'digital-marketing',
    displayName: 'Digital Marketing',
    shortName: 'Digital Marketing',
    category: 'marketing',
  },
};

/**
 * Get display name for a course by slug
 * Falls back to slug if not found
 */
export function getCourseDisplayName(slug: string): string {
  return COURSE_CONFIG[slug]?.displayName || slug;
}

/**
 * Get short name for a course by slug
 * Falls back to display name if not found
 */
export function getCourseShortName(slug: string): string {
  return COURSE_CONFIG[slug]?.shortName || getCourseDisplayName(slug);
}

/**
 * Get course config by slug
 * Returns null if not found
 */
export function getCourseConfig(slug: string): CourseConfig | null {
  return COURSE_CONFIG[slug] || null;
}

/**
 * Get all courses by category
 */
export function getCoursesByCategory(category: string): CourseConfig[] {
  return Object.values(COURSE_CONFIG).filter(course => course.category === category);
}

/**
 * Get all available courses
 */
export function getAllCourses(): CourseConfig[] {
  return Object.values(COURSE_CONFIG);
}
