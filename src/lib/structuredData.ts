export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "Titans Training Group",
  "url": "https://titanstraininggroup.com",
  "logo": "https://titanstraininggroup.com/titans-logo.jpg",
  "description": "Professional training courses and certification programs",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "US"
  },
  "sameAs": [
    "https://facebook.com/titanstraining",
    "https://twitter.com/titanstraining",
    "https://linkedin.com/company/titanstraining"
  ]
};

export function generateCourseSchema(course: {
  name: string;
  description: string;
  price?: number;
  image?: string;
  duration?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.name,
    "description": course.description,
    "provider": {
      "@type": "Organization",
      "name": "Titans Training Group",
      "sameAs": "https://titanstraininggroup.com"
    },
    ...(course.price && {
      "offers": {
        "@type": "Offer",
        "price": course.price,
        "priceCurrency": "USD"
      }
    }),
    ...(course.image && { "image": course.image }),
    ...(course.duration && { "timeRequired": course.duration })
  };
}

export function generateBlogPostSchema(post: {
  title: string;
  description: string;
  image?: string;
  author: string;
  publishedDate: string;
  modifiedDate?: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.description,
    "image": post.image,
    "author": {
      "@type": "Person",
      "name": post.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "Titans Training Group",
      "logo": {
        "@type": "ImageObject",
        "url": "https://titanstraininggroup.com/titans-logo.jpg"
      }
    },
    "datePublished": post.publishedDate,
    "dateModified": post.modifiedDate || post.publishedDate,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": post.url
    }
  };
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

export function generateReviewSchema(testimonials: Array<{
  name: string;
  rating: number;
  text: string;
  date?: string;
}>) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Titans Training Group",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": (testimonials.reduce((acc, t) => acc + t.rating, 0) / testimonials.length).toFixed(1),
      "reviewCount": testimonials.length,
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": testimonials.map(testimonial => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": testimonial.name
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": testimonial.rating,
        "bestRating": "5",
        "worstRating": "1"
      },
      "reviewBody": testimonial.text,
      ...(testimonial.date && { "datePublished": testimonial.date })
    }))
  };
}
