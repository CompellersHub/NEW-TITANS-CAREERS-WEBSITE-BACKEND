// Simple analytics tracking utility
export function trackEvent(eventName: string, properties?: Record<string, any>): void {
  // Google Analytics 4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, properties);
  }
  
  // Facebook Pixel
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', eventName, properties);
  }
  
  console.log('Analytics event:', eventName, properties);
}

export function trackCTA(ctaName: string, location?: string, action?: string): void {
  trackEvent('cta_click', { cta_name: ctaName, location, action });
}

export function trackPageView(path: string, title: string): void {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: path,
      page_title: title,
    });
  }
}

export function trackConversion(conversionName: string, value?: number, currency?: string): void {
  trackEvent('conversion', { 
    conversion_name: conversionName, 
    value, 
    currency: currency || 'GBP'
  });
}
