export interface Event {
  id: string;
  title: string;
  type: 'webinar' | 'open_day' | 'info_session' | 'workshop' | 'q&a';
  course: 'aml_kyc' | 'data_analysis' | 'business_analysis' | 'cybersecurity' | 'all';
  date: string; // ISO date
  time: string;
  duration: string; // e.g., "1 hour", "2 hours"
  durationMinutes: number; // for countdown calculations
  location: 'virtual' | 'london' | 'birmingham' | 'manchester';
  description: string;
  speakers?: {
    name: string;
    role: string;
    image?: string;
  }[];
  capacity?: number;
  registrationLink: string;
  status: 'upcoming' | 'full' | 'past';
  recordingLink?: string;
  learningObjectives?: string[];
  toolsCovered?: string[];
  prerequisites?: string;
  careerRelevance?: string;
  weekNumber?: number;
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
  heroImage?: string;
  // Course outcomes data
  averageSalary?: string;
  jobOpenings?: string;
  timeToJob?: string;
  successRate?: string;
  skillsAcquired?: string[];
}

// Helper function to generate recurring weekly events
function generateWeeklyEvents(): Event[] {
  const events: Event[] = [];
  let eventId = 1;

  // Define course schedules with metadata
  const schedules = [
    {
      course: 'data_analysis' as const,
      dayOfWeek: 3, // Wednesday
      startDate: new Date('2024-12-04'),
      speaker: { name: 'Dr. Michael Chen', role: 'Lead Data Analysis Instructor at TITANS' },
      heroImage: '/src/assets/courses/data-analysis-hero.jpg',
      difficultyLevel: 'beginner' as const,
      learningObjectives: [
        'Master SQL queries and database management',
        'Create interactive dashboards in Tableau',
        'Perform statistical analysis with Python',
        'Visualize data insights effectively'
      ],
      toolsCovered: ['SQL', 'Excel', 'Tableau', 'Python', 'Power BI'],
      prerequisites: 'None - suitable for complete beginners',
      careerRelevance: 'Data analysts are in high demand across finance, healthcare, tech, and retail sectors. This course prepares you for roles like Junior Data Analyst, Business Intelligence Analyst, and Data Visualization Specialist.',
      averageSalary: '£40,000',
      jobOpenings: '12,000+',
      timeToJob: '3-4 months',
      successRate: '87%',
      skillsAcquired: ['Excel', 'SQL', 'Tableau', 'Data Visualization', 'Python Basics']
    },
    {
      course: 'aml_kyc' as const,
      dayOfWeek: 5, // Friday
      startDate: new Date('2024-12-06'),
      speaker: { name: 'Sarah Johnson', role: 'Senior AML Compliance Expert at HSBC' },
      heroImage: '/src/assets/courses/aml-kyc-hero.jpg',
      difficultyLevel: 'intermediate' as const,
      learningObjectives: [
        'Understand UK AML regulations and compliance frameworks',
        'Conduct effective customer due diligence (CDD)',
        'Identify and report suspicious activities',
        'Implement KYC procedures in financial institutions'
      ],
      toolsCovered: ['Compliance Software', 'Risk Assessment Tools', 'Transaction Monitoring Systems', 'Regulatory Reporting'],
      prerequisites: 'Basic understanding of financial services helpful but not required',
      careerRelevance: 'AML/KYC professionals are critical in banks, fintech, insurance, and cryptocurrency companies. Roles include AML Analyst, Compliance Officer, and Financial Crime Investigator with salaries starting from £40k.',
      averageSalary: '£38,000',
      jobOpenings: '8,500+',
      timeToJob: '2-3 months',
      successRate: '92%',
      skillsAcquired: ['KYC Compliance', 'Transaction Monitoring', 'Due Diligence', 'SAR Filing', 'Regulatory Knowledge']
    },
    {
      course: 'cybersecurity' as const,
      dayOfWeek: 0, // Sunday
      startDate: new Date('2024-12-07'),
      speaker: { name: 'Alex Thompson', role: 'Cybersecurity Lead at Deloitte' },
      heroImage: '/src/assets/courses/cybersecurity-hero.jpg',
      difficultyLevel: 'intermediate' as const,
      learningObjectives: [
        'Configure network security and firewalls',
        'Conduct vulnerability assessments and penetration testing',
        'Implement security information and event management (SIEM)',
        'Respond to security incidents effectively'
      ],
      toolsCovered: ['Firewalls', 'SIEM Tools', 'Penetration Testing Frameworks', 'Network Monitoring', 'Security Protocols'],
      prerequisites: 'Basic IT knowledge and familiarity with networking concepts',
      careerRelevance: 'Cybersecurity specialists are among the most sought-after professionals globally. Career paths include Security Analyst, Penetration Tester, and Security Consultant with competitive salaries starting from £45k.',
      averageSalary: '£42,000',
      jobOpenings: '15,000+',
      timeToJob: '3-5 months',
      successRate: '85%',
      skillsAcquired: ['Network Security', 'Threat Detection', 'Penetration Testing', 'SIEM Tools', 'Security Frameworks']
    },
    {
      course: 'business_analysis' as const,
      dayOfWeek: 0, // Sunday
      startDate: new Date('2024-12-14'),
      speaker: { name: 'James Martinez', role: 'Senior Business Analyst at Accenture' },
      heroImage: '/src/assets/courses/business-analysis-hero.jpg',
      difficultyLevel: 'beginner' as const,
      learningObjectives: [
        'Gather and document business requirements',
        'Create process flow diagrams using BPMN',
        'Facilitate stakeholder workshops effectively',
        'Apply Agile methodologies in business analysis'
      ],
      toolsCovered: ['JIRA', 'Confluence', 'Visio', 'Excel', 'BPMN Tools', 'User Story Mapping'],
      prerequisites: 'None - ideal for career changers and graduates',
      careerRelevance: 'Business Analysts bridge the gap between business needs and IT solutions. High demand across all industries for roles like Junior BA, Systems Analyst, and Product Owner with salaries from £38k.',
      averageSalary: '£45,000',
      jobOpenings: '10,000+',
      timeToJob: '2-4 months',
      successRate: '90%',
      skillsAcquired: ['Requirements Analysis', 'Process Mapping', 'Stakeholder Management', 'Agile', 'Documentation']
    }
  ];

  const courseLabels = {
    data_analysis: 'Data Analysis',
    aml_kyc: 'AML & KYC Compliance',
    cybersecurity: 'Cybersecurity',
    business_analysis: 'Business Analysis'
  };

  // Generate 8 weeks of events for each course
  schedules.forEach(schedule => {
    for (let week = 0; week < 8; week++) {
      const eventDate = new Date(schedule.startDate);
      eventDate.setDate(eventDate.getDate() + (week * 7));

      // Determine if this is an odd or even week (for alternating event types)
      const isOddWeek = week % 2 === 0;
      
      const eventType = isOddWeek ? 'q&a' : 'workshop';
      const eventTitle = isOddWeek
        ? `${courseLabels[schedule.course]}: Free Q&A Session`
        : `${courseLabels[schedule.course]}: Interactive Workshop`;
      
      const eventDescription = isOddWeek
        ? `Join us for an open Q&A session! Ask anything about ${courseLabels[schedule.course].toLowerCase()}, career paths, industry insights, and real-world applications. Perfect for those exploring the field.`
        : `Hands-on workshop with practical exercises! Learn key ${courseLabels[schedule.course].toLowerCase()} techniques through interactive demos and real-world scenarios. Bring your questions!`;

      events.push({
        id: String(eventId++),
        title: eventTitle,
        type: eventType,
        course: schedule.course,
        date: eventDate.toISOString().split('T')[0],
        time: '19:00 GMT',
        duration: '60 minutes',
        durationMinutes: 60,
        location: 'virtual',
        description: eventDescription,
        speakers: [schedule.speaker],
        registrationLink: '/contact',
        status: eventDate > new Date() ? 'upcoming' : 'past',
        learningObjectives: schedule.learningObjectives,
        toolsCovered: schedule.toolsCovered,
        prerequisites: schedule.prerequisites,
        careerRelevance: schedule.careerRelevance,
        weekNumber: week + 1,
        difficultyLevel: schedule.difficultyLevel,
        heroImage: schedule.heroImage,
        averageSalary: schedule.averageSalary,
        jobOpenings: schedule.jobOpenings,
        timeToJob: schedule.timeToJob,
        successRate: schedule.successRate,
        skillsAcquired: schedule.skillsAcquired
      });
    }
  });

  // Sort events by date
  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return events;
}

export const events: Event[] = generateWeeklyEvents();
