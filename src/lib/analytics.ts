// Simple analytics tracking utility
export function trackEvent(eventName: string, properties?: Record<string, any>): void {
  // Placeholder for analytics tracking
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, properties);
  }
  console.log('Analytics event:', eventName, properties);
}

export function trackCTA(ctaName: string, location?: string, action?: string): void {
  trackEvent('cta_click', { cta_name: ctaName, location, action });
}
