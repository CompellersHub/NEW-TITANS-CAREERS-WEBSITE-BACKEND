import { BarChart3, Briefcase, Bitcoin, Bug, ShieldCheck, TrendingUp, Shield } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * Centralized course configuration
 * Maps database course_type slugs to consistent display names across the entire platform
 * Use this for ALL course name references to ensure consistency in UI, payments, emails, etc.
 */

export interface CourseConfig {
  slug: string;
  displayName: string;
  shortName: string;
  category: 'compliance' | 'data' | 'cybersecurity' | 'business' | 'marketing';
  color: string; // Brand color for the course
  duration: number; // Duration in weeks
  dayOfWeek: 'Saturday' | 'Sunday';
  baseStartDate: string; // ISO date string for first cohort
  icon: LucideIcon; // Course icon
}

export const COURSE_CONFIG: Record<string, CourseConfig> = {
  'aml-kyc': {
    slug: 'aml-kyc',
    displayName: 'AML/KYC Compliance',
    shortName: 'AML/KYC',
    category: 'compliance',
    color: '#0B1F3B', // Titans Navy
    duration: 8,
    dayOfWeek: 'Sunday',
    baseStartDate: '2025-11-16',
    icon: Shield,
  },
  'data-analysis': {
    slug: 'data-analysis',
    displayName: 'Data Analysis',
    shortName: 'Data Analysis',
    category: 'data',
    color: '#0B1F3B', // Titans Navy
    duration: 10,
    dayOfWeek: 'Saturday',
    baseStartDate: '2025-11-29',
    icon: BarChart3,
  },
  'business-analysis': {
    slug: 'business-analysis',
    displayName: 'Business Analysis',
    shortName: 'Business Analysis',
    category: 'business',
    color: '#0B1F3B', // Titans Navy
    duration: 16,
    dayOfWeek: 'Saturday',
    baseStartDate: '2026-02-07',
    icon: Briefcase,
  },
  'cybersecurity': {
    slug: 'cybersecurity',
    displayName: 'Cybersecurity',
    shortName: 'Cybersecurity',
    category: 'cybersecurity',
    color: '#0B1F3B', // Titans Navy
    duration: 12,
    dayOfWeek: 'Sunday',
    baseStartDate: '2025-12-07',
    icon: Bug,
  },
  'data-privacy': {
    slug: 'data-privacy',
    displayName: 'Data Privacy & GDPR',
    shortName: 'Data Privacy',
    category: 'compliance',
    color: '#0B1F3B', // Titans Navy
    duration: 8,
    dayOfWeek: 'Saturday',
    baseStartDate: '2026-01-03',
    icon: ShieldCheck,
  },
  'crypto-compliance': {
    slug: 'crypto-compliance',
    displayName: 'Crypto & Digital Assets',
    shortName: 'Crypto & Digital Assets',
    category: 'compliance',
    color: '#0B1F3B', // Titans Navy
    duration: 8,
    dayOfWeek: 'Sunday',
    baseStartDate: '2026-01-04',
    icon: Bitcoin,
  },
  'digital-marketing': {
    slug: 'digital-marketing',
    displayName: 'Digital Marketing',
    shortName: 'Digital Marketing',
    category: 'marketing',
    color: '#0B1F3B', // Titans Navy
    duration: 8,
    dayOfWeek: 'Saturday',
    baseStartDate: '2026-01-10',
    icon: TrendingUp,
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
