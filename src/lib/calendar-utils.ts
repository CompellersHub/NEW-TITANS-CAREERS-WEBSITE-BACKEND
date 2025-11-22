/**
 * Calendar integration utilities for cohort events
 */

interface CalendarEvent {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  timezone: string;
}

/**
 * Format date for Google Calendar (YYYYMMDDTHHmmss)
 */
function formatGoogleCalendarDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

/**
 * Generate Google Calendar link
 */
export function generateGoogleCalendarLink(event: CalendarEvent): string {
  const startDate = formatGoogleCalendarDate(event.startDate);
  const endDate = formatGoogleCalendarDate(event.endDate);
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startDate}/${endDate}`,
    details: event.description,
    location: event.location,
    ctz: event.timezone,
  });

  return `https://www.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate .ics file content for download
 */
export function generateICalendar(event: CalendarEvent): string {
  const formatICSDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Titans Careers//Course Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART:${formatICSDate(event.startDate)}`,
    `DTEND:${formatICSDate(event.endDate)}`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
    `LOCATION:${event.location}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return icsContent;
}

/**
 * Trigger download of .ics file
 */
export function downloadICalendar(event: CalendarEvent, filename: string = 'event.ics'): void {
  const icsContent = generateICalendar(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

/**
 * Get course color (handle gradients)
 */
export function getCourseColor(color: string): { background: string; text: string; border: string } {
  // All colors should have white text for consistency
  return {
    background: color,
    text: '#FFFFFF',
    border: color,
  };
}

/**
 * Get cohort urgency level and styling based on proximity to start date
 */
export function getCohortUrgency(startDate: Date | string) {
  const now = new Date();
  const start = new Date(startDate);
  const daysUntil = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntil <= 14) {
    return {
      level: 'urgent' as const,
      daysUntil,
      message: 'Starting Soon!',
      badgeColor: 'hsl(220 13% 53%)', // Medium grey
      badgeBg: 'hsl(0 0% 96%)', // Light grey
      headerBg: 'linear-gradient(135deg, hsl(220 10% 75%) 0%, hsl(220 10% 65%) 100%)', // Light grey gradient
      borderColor: 'hsl(220 10% 70%)',
      glowEffect: false,
      ctaBg: 'hsl(220 10% 70%)',
      ctaText: 'Enroll Now - Limited Spots!'
    };
  } else if (daysUntil <= 28) {
    return {
      level: 'soon' as const,
      daysUntil,
      message: 'Enrolling Now',
      badgeColor: 'hsl(213 69% 13%)', // Navy
      badgeBg: 'hsl(0 0% 96%)', // Light grey
      headerBg: 'hsl(213 69% 13%)', // Standard navy
      borderColor: 'hsl(213 69% 13%)',
      glowEffect: false,
      ctaBg: 'hsl(43 100% 50%)',
      ctaText: 'Start Course'
    };
  } else {
    return {
      level: 'future' as const,
      daysUntil,
      message: 'Upcoming',
      badgeColor: 'hsl(220 13% 53%)', // Gray
      badgeBg: 'hsl(0 0% 96%)', // Light gray
      headerBg: 'hsl(220 9% 46%)', // Dark gray
      borderColor: 'hsl(0 0% 82%)',
      glowEffect: false,
      ctaBg: 'hsl(43 100% 50%)',
      ctaText: 'View Details'
    };
  }
}
