// Multi-platform analytics tracking utility (GA4 + Facebook Pixel)
export function trackEvent(eventName: string, properties?: Record<string, any>): void {
  // Google Analytics 4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, properties);
    console.log('GA4 Event:', eventName, properties);
  }
  
  // Facebook Pixel
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', eventName, properties);
    console.log('FB Pixel Event:', eventName, properties);
  }
  
  if (!((window as any).gtag || (window as any).fbq)) {
    console.log('Analytics event (not loaded):', eventName, properties);
  }
}

// Page View Tracking
export function trackPageView(path: string, title: string): void {
  // GA4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'page_view', {
      page_path: path,
      page_title: title,
      page_location: window.location.href
    });
    console.log('GA4 Page View:', path, title);
  }
  
  // Facebook Pixel
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'PageView');
    console.log('FB Pixel: PageView');
  }
}

// CTA Click Tracking
export function trackCTA(ctaName: string, location?: string, action?: string): void {
  trackEvent('cta_click', { 
    cta_name: ctaName, 
    page_location: location || window.location.pathname,
    action: action || 'click'
  });
  
  // Facebook Pixel - Custom Event
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('trackCustom', 'CTAClick', {
      cta_name: ctaName,
      location: location
    });
  }
}

// Form Submission Tracking
export function trackFormSubmission(formName: string, formData?: Record<string, any>): void {
  trackEvent('form_submission', {
    form_name: formName,
    page_location: window.location.pathname,
    ...formData
  });
  
  // Facebook Pixel - Lead Event
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'Lead', {
      content_name: formName,
      ...formData
    });
  }
}

// Lead Generation Tracking
export function trackLead(source: string, leadData?: Record<string, any>): void {
  trackEvent('generate_lead', {
    lead_source: source,
    page_location: window.location.pathname,
    ...leadData
  });
  
  // Facebook Pixel - Lead Event
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'Lead', {
      content_category: source,
      ...leadData
    });
  }
}

// Course View Tracking
export function trackCourseView(courseSlug: string, courseName: string): void {
  trackEvent('view_item', {
    item_id: courseSlug,
    item_name: courseName,
    item_category: 'course',
    page_location: window.location.pathname
  });
  
  // Facebook Pixel - ViewContent Event
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'ViewContent', {
      content_name: courseName,
      content_ids: [courseSlug],
      content_type: 'product'
    });
  }
}

// Course Interest Tracking
export function trackCourseInterest(courseSlug: string, courseName: string, action: string): void {
  trackEvent('course_interest', {
    item_id: courseSlug,
    item_name: courseName,
    action: action,
    page_location: window.location.pathname
  });
  
  // Facebook Pixel - Custom Event
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('trackCustom', 'CourseInterest', {
      content_name: courseName,
      action: action
    });
  }
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
  
  // Facebook Pixel - InitiateCheckout Event
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'InitiateCheckout', {
      content_name: courseName,
      content_ids: [courseSlug],
      content_type: 'product',
      value: price,
      currency: 'GBP'
    });
  }
}

// Purchase Completion Tracking
export function trackPurchase(courseSlug: string, courseName: string, price: number, transactionId?: string): void {
  const txnId = transactionId || `txn_${Date.now()}`;
  
  // GA4 Purchase Event
  trackEvent('purchase', {
    currency: 'GBP',
    value: price,
    transaction_id: txnId,
    items: [{
      item_id: courseSlug,
      item_name: courseName,
      item_category: 'course',
      price: price,
      quantity: 1
    }]
  });
  
  // Facebook Pixel - Purchase Event
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'Purchase', {
      content_name: courseName,
      content_ids: [courseSlug],
      content_type: 'product',
      value: price,
      currency: 'GBP'
    });
  }
}

// Newsletter Signup Tracking
export function trackNewsletterSignup(email: string): void {
  trackEvent('newsletter_signup', {
    method: 'website',
    page_location: window.location.pathname
  });
  
  // Facebook Pixel - Subscribe Event
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'Subscribe', {
      value: 0,
      currency: 'GBP'
    });
  }
}

// Download Tracking
export function trackDownload(fileName: string, fileType: string): void {
  trackEvent('file_download', {
    file_name: fileName,
    file_type: fileType,
    page_location: window.location.pathname
  });
  
  // Facebook Pixel - Custom Event
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('trackCustom', 'Download', {
      content_name: fileName,
      content_type: fileType
    });
  }
}

// Search Tracking
export function trackSearch(searchTerm: string, resultsCount?: number): void {
  trackEvent('search', {
    search_term: searchTerm,
    results_count: resultsCount,
    page_location: window.location.pathname
  });
  
  // Facebook Pixel - Search Event
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'Search', {
      search_string: searchTerm
    });
  }
}

// Video Play Tracking
export function trackVideoPlay(videoName: string, videoUrl: string): void {
  trackEvent('video_start', {
    video_name: videoName,
    video_url: videoUrl,
    page_location: window.location.pathname
  });
  
  // Facebook Pixel - Custom Event
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('trackCustom', 'VideoView', {
      content_name: videoName
    });
  }
}

// Chat Interaction Tracking
export function trackChatInteraction(action: string): void {
  trackEvent('chat_interaction', {
    action: action,
    page_location: window.location.pathname
  });
  
  // Facebook Pixel - Contact Event
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'Contact', {
      content_name: 'chat'
    });
  }
}

// Exit Intent Tracking
export function trackExitIntent(action: string): void {
  trackEvent('exit_intent', {
    action: action,
    page_location: window.location.pathname
  });
  
  // Facebook Pixel - Custom Event
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('trackCustom', 'ExitIntent', {
      action: action
    });
  }
}

// Add to Cart (for future use)
export function trackAddToCart(courseSlug: string, courseName: string, price: number): void {
  trackEvent('add_to_cart', {
    currency: 'GBP',
    value: price,
    items: [{
      item_id: courseSlug,
      item_name: courseName,
      price: price
    }]
  });
  
  // Facebook Pixel - AddToCart Event
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'AddToCart', {
      content_name: courseName,
      content_ids: [courseSlug],
      content_type: 'product',
      value: price,
      currency: 'GBP'
    });
  }
}
