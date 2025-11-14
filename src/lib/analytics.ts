// Google Analytics 4 tracking utility
export function trackEvent(eventName: string, properties?: Record<string, any>): void {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, properties);
    console.log('GA4 Event:', eventName, properties);
  } else {
    console.log('Analytics event (GA4 not loaded):', eventName, properties);
  }
}

// Page View Tracking
export function trackPageView(path: string, title: string): void {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'page_view', {
      page_path: path,
      page_title: title,
      page_location: window.location.href
    });
    console.log('GA4 Page View:', path, title);
  }
}

// CTA Click Tracking
export function trackCTA(ctaName: string, location?: string, action?: string): void {
  trackEvent('cta_click', { 
    cta_name: ctaName, 
    page_location: location || window.location.pathname,
    action: action || 'click'
  });
}

// Form Submission Tracking
export function trackFormSubmission(formName: string, formData?: Record<string, any>): void {
  trackEvent('form_submission', {
    form_name: formName,
    page_location: window.location.pathname,
    ...formData
  });
}

// Lead Generation Tracking
export function trackLead(source: string, leadData?: Record<string, any>): void {
  trackEvent('generate_lead', {
    lead_source: source,
    page_location: window.location.pathname,
    ...leadData
  });
}

// Course View Tracking
export function trackCourseView(courseSlug: string, courseName: string): void {
  trackEvent('view_item', {
    item_id: courseSlug,
    item_name: courseName,
    item_category: 'course',
    page_location: window.location.pathname
  });
}

// Course Interest Tracking
export function trackCourseInterest(courseSlug: string, courseName: string, action: string): void {
  trackEvent('course_interest', {
    item_id: courseSlug,
    item_name: courseName,
    action: action,
    page_location: window.location.pathname
  });
}

// Purchase/Checkout Tracking
export function trackBeginCheckout(courseSlug: string, courseName: string, price: number): void {
  trackEvent('begin_checkout', {
    currency: 'GBP',
    value: price,
    items: [{
      item_id: courseSlug,
      item_name: courseName,
      item_category: 'course',
      price: price,
      quantity: 1
    }]
  });
}

// Purchase Completion Tracking
export function trackPurchase(courseSlug: string, courseName: string, price: number, transactionId?: string): void {
  trackEvent('purchase', {
    currency: 'GBP',
    value: price,
    transaction_id: transactionId || `txn_${Date.now()}`,
    items: [{
      item_id: courseSlug,
      item_name: courseName,
      item_category: 'course',
      price: price,
      quantity: 1
    }]
  });
}

// Newsletter Signup Tracking
export function trackNewsletterSignup(email: string): void {
  trackEvent('newsletter_signup', {
    method: 'website',
    page_location: window.location.pathname
  });
}

// Download Tracking
export function trackDownload(fileName: string, fileType: string): void {
  trackEvent('file_download', {
    file_name: fileName,
    file_type: fileType,
    page_location: window.location.pathname
  });
}

// Search Tracking
export function trackSearch(searchTerm: string, resultsCount?: number): void {
  trackEvent('search', {
    search_term: searchTerm,
    results_count: resultsCount,
    page_location: window.location.pathname
  });
}

// Video Play Tracking
export function trackVideoPlay(videoName: string, videoUrl: string): void {
  trackEvent('video_start', {
    video_name: videoName,
    video_url: videoUrl,
    page_location: window.location.pathname
  });
}

// Chat Interaction Tracking
export function trackChatInteraction(action: string): void {
  trackEvent('chat_interaction', {
    action: action,
    page_location: window.location.pathname
  });
}

// Exit Intent Tracking
export function trackExitIntent(action: string): void {
  trackEvent('exit_intent', {
    action: action,
    page_location: window.location.pathname
  });
}
