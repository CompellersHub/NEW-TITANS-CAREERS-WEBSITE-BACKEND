export interface Week {
  week: number;
  title: string;
  objectives: string[];
  deliverable: string;
}

export interface Course {
  slug: string;
  title: string;
  tagline: string;
  badge: string;
  category: 'compliance' | 'data' | 'cybersecurity' | 'business' | 'marketing';
  price: number;
  duration: string;
  schedule: string;
  description: string;
  overview: string[];
  whoItsFor: string[];
  syllabus: Week[];
  tools: string[];
  support: string[];
  faqs: Array<{ question: string; answer: string }>;
  instructor: {
    name: string;
    bio: string;
    credentials: string;
  };
  careerOutcomes: {
    jobTitles: string[];
    salaryRange: string;
  };
  certifications: string[];
  projectCount: number;
  whatsappGroupLink?: string;
}

export const courses: Record<string, Course> = {
  'aml-kyc': {
    slug: 'aml-kyc',
    title: 'AML/KYC Masterclass',
    tagline: 'Break into UK compliance with in-demand AML skills',
    badge: 'Compliance Career',
    category: 'compliance',
    whatsappGroupLink: 'https://chat.whatsapp.com/BJnvGHfLUsxKsfAzKUrpxt',
    price: 499,
    duration: '8 weeks',
    schedule: 'Saturdays or Sundays',
    description: 'Master the essential skills to launch your compliance career in the UK. Learn Customer Due Diligence, sanctions screening, and transaction monitoring with real-world case studies.',
    overview: [
      'Master CDD vs EDD workflows and documentation',
      'Learn Sanctions & PEP screening protocols',
      'Understand Transaction Monitoring & SARs filing',
      'Navigate UK frameworks: MLR 2017, POCA, JMLSG',
      'Build a compliance portfolio with real-world case studies'
    ],
    whoItsFor: [
      'Career switchers seeking stable compliance roles',
      'Night shift workers looking for 9-5 options',
      'Anyone interested in finance/risk without degree requirements'
    ],
    syllabus: [
      {
        week: 1,
        title: 'Understanding Financial Crime and Global AML/CTF Frameworks',
        objectives: [
          'Overview of financial crime types',
          'Understand global AML/CTF frameworks (FATF, MLR 2017, POCA)',
          'Identify key regulatory bodies'
        ],
        deliverable: 'Framework comparison chart'
      },
      {
        week: 2,
        title: 'Senior Management Responsibilities and the Role of MLRO',
        objectives: [
          'Understand MLRO duties and obligations',
          'Learn senior management accountability',
          'Explore governance and oversight requirements'
        ],
        deliverable: 'MLRO responsibility matrix'
      },
      {
        week: 3,
        title: 'Optimizing AML Compliance - The Risk Based Approach in Action',
        objectives: [
          'Master the risk-based approach methodology',
          'Conduct risk assessments',
          'Learn to prioritize compliance resources effectively'
        ],
        deliverable: 'Risk assessment framework'
      },
      {
        week: 4,
        title: 'Customer Due Diligence - CDD Essentials',
        objectives: [
          'Master standard CDD procedures',
          'Understand CDD vs Simplified vs Enhanced DD',
          'Practice document verification and identity checks'
        ],
        deliverable: 'CDD case study analysis'
      },
      {
        week: 5,
        title: 'Transaction Monitoring and Suspicious Activity Reporting',
        objectives: [
          'Understand TM rules and scenarios',
          'Investigate suspicious activity patterns',
          'Learn SAR drafting and NCA submission'
        ],
        deliverable: 'TM alert investigation + SAR writing exercise'
      },
      {
        week: 6,
        title: 'Sanctions, PEP and Screening',
        objectives: [
          'Navigate OFSI, UN, and EU sanctions lists',
          'Perform effective PEP screening',
          'Handle screening alerts and false positives'
        ],
        deliverable: 'Sanctions screening report'
      },
      {
        week: 7,
        title: 'Training Culture and Record Keeping',
        objectives: [
          'Design effective AML training programs',
          'Understand record-keeping requirements (MLR 2017)',
          'Learn audit trail management'
        ],
        deliverable: 'Training plan and records management framework'
      },
      {
        week: 8,
        title: 'Enforcement Trends and Final Assessment',
        objectives: [
          'Review recent FCA/FOS enforcement actions',
          'Understand regulatory trends and expectations',
          'Complete final portfolio assessment'
        ],
        deliverable: 'Complete portfolio + final assessment'
      }
    ],
    tools: ['Transaction Monitoring', 'Name Screening', 'KYC Onboarding'],
    support: [
      'CV overhaul with compliance keywords',
      'LinkedIn profile optimization',
      '2-3 mock interviews with feedback',
      'Interview prep: STAR method for compliance scenarios',
      'Job board access and application review'
    ],
    faqs: [
      {
        question: 'Do I need prior compliance experience?',
        answer: 'No. This course is designed for complete beginners. We start from the basics and build up to job-ready skills.'
      },
      {
        question: 'What if I miss a class?',
        answer: 'All classes are recorded and you have lifetime access. Watch at your own pace and ask questions in our WhatsApp group.'
      },
      {
        question: 'How quickly can I get a job?',
        answer: 'Average time to first offer is 8-12 weeks after completing the course. We provide 12 months of career support to help you land your role.'
      },
      {
        question: 'Are payment plans available?',
        answer: 'Yes! Installment payments available via Payl8r - spread the cost over 3-12 months with flexible terms. TITANS CAREERS LIMITED is an Introducer Appointed Representative of Social Money Limited t/a Payl8r (FCA Ref: 675283). Representative APR 65.5%. Subject to creditworthiness assessment.'
      },
      {
        question: 'What qualifications or certifications will I receive?',
        answer: 'You\'ll receive an AML/KYC Portfolio showcasing your practical skills and a Professional Certificate of Completion. These demonstrate your competency to UK employers.'
      },
      {
        question: 'Do I need a degree to work in AML compliance?',
        answer: 'No degree required! AML roles value practical skills and regulatory knowledge over formal qualifications. Our portfolio approach proves you can do the job.'
      },
      {
        question: 'What software/tools will I learn?',
        answer: 'You\'ll master Transaction Monitoring systems, Name Screening tools, and KYC Onboarding platforms - the same software used by UK banks and financial institutions.'
      },
      {
        question: 'Is this course suitable for international students?',
        answer: 'Yes! The course focuses on UK frameworks (MLR 2017, FCA regulations) which are essential for AML roles in the UK. Remote learning makes it accessible globally.'
      },
      {
        question: 'What career progression opportunities exist in AML?',
        answer: 'Start as AML Analyst (£28k-£35k), progress to Senior Analyst (£40k-£55k), then MLRO or Compliance Manager (£60k-£100k+). The field offers clear advancement paths.'
      },
      {
        question: 'Can I get a refund if I\'m not satisfied?',
        answer: 'Yes! We offer a 14-day money-back guarantee. If the course isn\'t right for you within the first two weeks, you\'ll get a full refund - no questions asked.'
      }
    ],
    instructor: {
      name: 'Lumi Otolorin',
      bio: 'Dual-qualified lawyer and renowned compliance expert with over a decade of experience in anti-money laundering, counter-terrorist financing, and regulatory risk.',
      credentials: 'LLB, LLM, Multiple Advanced Certifications'
    },
    careerOutcomes: {
      jobTitles: ['AML Analyst', 'KYC Officer', 'Compliance Associate', 'Financial Crime Analyst'],
      salaryRange: '£30,000 - £90,000'
    },
    certifications: ['AML/KYC Portfolio', 'Professional Certificate of Completion'],
    projectCount: 8
  },
  'crypto-compliance': {
    slug: 'crypto-compliance',
    title: 'Crypto & Digital Assets',
    tagline: 'Master blockchain AML and become a sought-after crypto compliance expert',
    badge: 'Elite Crypto & Digital Assets',
    category: 'compliance',
    whatsappGroupLink: 'https://chat.whatsapp.com/IlypZPkdoeO01KppJuhP1C',
    price: 699,
    duration: '8 weeks',
    schedule: 'Fridays 8-10pm GMT',
    description: 'Industry-leading crypto compliance training combining blockchain fundamentals, hands-on wallet screening, DeFi risk analysis, and real-world case studies from FTX, Binance, and Tornado Cash. Learn the exact tools and frameworks used by top crypto exchanges and become job-ready in 8 weeks.',
    overview: [
      'Understand blockchain fundamentals and crypto financial crime',
      'Master crypto KYC/CDD and wallet verification techniques',
      'Learn on-chain transaction monitoring with live blockchain tools',
      'Perform crypto sanctions screening using industry-standard platforms',
      'Navigate DeFi, NFT, and smart contract compliance challenges',
      'Build a professional crypto compliance portfolio with real blockchain cases',
      'Access hands-on training with Chainalysis, Elliptic, and blockchain explorers',
      'Study real enforcement actions: FTX collapse, Binance settlements, Tornado Cash sanctions'
    ],
    whoItsFor: [
      'Compliance professionals wanting to specialize in crypto industry',
      'Career switchers interested in high-paying blockchain and Web3 roles',
      'Traditional finance professionals upskilling for crypto exchanges',
      'Anyone interested in cutting-edge crypto compliance careers (£35k-£110k)',
      'AML analysts looking to enter the fastest-growing compliance niche'
    ],
    syllabus: [
      {
        week: 1,
        title: 'Blockchain Fundamentals & Crypto Financial Crime',
        objectives: [
          'Live Demo: Navigate Etherscan, view real Bitcoin/Ethereum transactions',
          'Hands-on: Identify suspicious patterns in blockchain transactions',
          'Overview of crypto-specific financial crimes (wash trading, rug pulls, pump & dump)',
          'Introduction to blockchain technology and how transactions work',
          'Global crypto AML frameworks (FATF Travel Rule, MiCA, FCA regulations)',
          'Case Study: Analyzing the Silk Road Bitcoin seizure'
        ],
        deliverable: 'Crypto regulatory framework comparison chart + blockchain transaction analysis report'
      },
      {
        week: 2,
        title: 'VASPs & Compliance Officer Responsibilities',
        objectives: [
          'Guest Speaker: Compliance officer from UK crypto exchange',
          'Workshop: Building a VASP compliance manual',
          'VASPs (Virtual Asset Service Providers) and their obligations',
          'Compliance officer role in crypto exchanges',
          'Senior management accountability in crypto firms',
          'Case Study: Binance\'s regulatory challenges and settlements'
        ],
        deliverable: 'VASP compliance responsibility matrix + risk register'
      },
      {
        week: 3,
        title: 'Risk-Based Approach for Digital Assets',
        objectives: [
          'Interactive Tool: Use real risk assessment software',
          'Live Exercise: Score 10 different cryptocurrencies for AML risk',
          'DeFi Deep Dive: Assessing risks of Uniswap, Aave, Compound',
          'Crypto-specific risk assessment methodology',
          'Transaction pattern analysis in blockchain',
          'Risk scoring for different cryptocurrencies and tokens'
        ],
        deliverable: 'Complete crypto risk assessment framework with scoring model'
      },
      {
        week: 4,
        title: 'Crypto KYC and Customer Due Diligence',
        objectives: [
          'Practical Session: Conducting KYC on simulated crypto exchange users',
          'Wallet Verification Workshop: Using on-chain analysis to verify ownership',
          'Case Study: Source of funds investigation for high-value crypto deposits',
          'KYC procedures for crypto exchange onboarding',
          'Enhanced Due Diligence for high-risk crypto users',
          'Verifying source of funds in crypto transactions'
        ],
        deliverable: 'Crypto KYC case study analysis + enhanced due diligence report'
      },
      {
        week: 5,
        title: 'Blockchain Transaction Monitoring',
        objectives: [
          'Premium Feature: Live wallet screening using the platform\'s built-in crypto screening tool',
          'Hands-on: Investigate 5 suspicious crypto alerts and draft SARs',
          'Tool Training: Chainalysis Reactor demo (or TRM Labs/Elliptic)',
          'Pattern Recognition: Mixing services, tumblers, peel chains',
          'On-chain vs off-chain monitoring',
          'Using blockchain explorers (Etherscan, Blockchain.com)'
        ],
        deliverable: 'Complete TM alert investigation pack + 2 professionally written SARs'
      },
      {
        week: 6,
        title: 'Crypto Sanctions Screening & Tainted Funds',
        objectives: [
          'Workshop: Screen wallets against OFAC SDN list',
          'Live Demo: Tornado Cash sanctions case study',
          'Practical Exercise: Handling contaminated wallet addresses',
          'Advanced: Multi-hop tracing through mixers',
          'Sanctioned wallet addresses (OFAC SDN, Tornado Cash)',
          'Using tools like Chainalysis, Elliptic, TRM Labs'
        ],
        deliverable: 'Crypto wallet sanctions screening report + remediation plan'
      },
      {
        week: 7,
        title: 'Compliance Documentation & Travel Rule',
        objectives: [
          'Document Creation Workshop: Build complete compliance documentation suite',
          'Travel Rule Implementation: FATF guidance walkthrough',
          'Audit Trail Exercise: Creating blockchain forensics reports',
          'Record-keeping requirements for crypto transactions',
          'Creating audit trails for blockchain activity',
          'Designing crypto-specific AML training programs'
        ],
        deliverable: 'Complete crypto compliance records management framework + audit pack'
      },
      {
        week: 8,
        title: 'Advanced Crypto - DeFi, NFTs & Emerging Threats',
        objectives: [
          'Masterclass Format: Industry expert panel discussion',
          'DeFi Compliance: Hands-on with DEX transaction analysis',
          'NFT Money Laundering: Wash trading detection',
          'Smart Contract Auditing: Identify rug pull red flags',
          'Career Accelerator Session: Certifications roadmap (CAMS-Crypto, CAMS, CCAS)',
          'Hiring Manager Panel: What crypto exchanges look for',
          'Real-World Case Studies: FTX, Binance, Tornado Cash enforcement actions'
        ],
        deliverable: 'Complete crypto compliance portfolio + capstone project'
      }
    ],
    tools: [
      'Blockchain Explorers (Etherscan, Blockchain.com, BTC.com)',
      'Built-in Crypto Wallet Screening Platform',
      'On-Chain Transaction Monitoring Dashboards',
      'Chainalysis Reactor Demo (Enterprise AML Tool)',
      'Elliptic Forensics Walkthrough',
      'TRM Labs Risk Assessment Platform',
      'OFAC SDN Wallet Screening Tools',
      'DeFi Protocol Risk Analysis Framework',
      'Smart Contract Audit Checklist',
      'Travel Rule Compliance Templates'
    ],
    support: [
      'Professional CV overhaul with crypto compliance keywords and ATS optimization',
      'LinkedIn profile transformation for Web3/crypto roles with headline optimization',
      '3-5 mock interviews with crypto industry professionals',
      'Interview prep: Blockchain compliance technical scenarios and regulatory questions',
      'Exclusive job board: Crypto exchange and DeFi opportunities (Binance, Coinbase, Kraken, etc.)',
      'Direct introductions to hiring managers at partner crypto firms',
      'Certification guidance: CAMS-Crypto, CAMS, CCAS pathway',
      'WhatsApp community: 24/7 access to facilitator and crypto compliance network',
      'Quarterly alumni meetups and networking events',
      'Job application review and optimization (up to 5 applications)',
      'Salary negotiation coaching for crypto roles',
      '12-month access to all course materials and updates'
    ],
    faqs: [
      {
        question: 'Will I get hands-on experience with real blockchain tools?',
        answer: 'Absolutely! You\'ll use Etherscan, Blockchain.com explorers, our built-in wallet screening platform, and get demos of enterprise tools like Chainalysis and Elliptic. All exercises use real blockchain data (safely, without requiring you to own crypto).'
      },
      {
        question: 'Do I need to understand blockchain technology first?',
        answer: 'No! Week 1 covers blockchain fundamentals from scratch. We explain Bitcoin, Ethereum, wallets, transactions, and smart contracts in plain English before diving into compliance applications.'
      },
      {
        question: 'What makes this different from general AML training?',
        answer: 'This is crypto-native compliance training. You\'ll master on-chain analysis, wallet screening, DeFi protocols, NFT risks, and blockchain-specific regulations (FATF Travel Rule, MiCA, FCA crypto guidance). Traditional AML courses don\'t cover these specialized areas.'
      },
      {
        question: 'How fast can I get hired after completing this course?',
        answer: 'With crypto compliance demand skyrocketing, our graduates typically receive interview requests within 2-4 weeks and job offers within 8-12 weeks. Some have landed roles even before completing the programme.'
      },
      {
        question: 'Is £699 worth it? How does it compare to other courses?',
        answer: 'This is the UK\'s most comprehensive crypto compliance programme. University courses cost £3,000-10,000+ with less practical content. Online courses lack live instruction and career support. For £699, you get 16 hours of live training, premium tools access, real case studies, career coaching, and 12-month support - delivering 10x ROI within months of employment.'
      },
      {
        question: 'What if I miss a class?',
        answer: 'All classes are recorded with lifetime access. Watch at your own pace and ask questions in our WhatsApp community.'
      },
      {
        question: 'Do I need to buy crypto or use real wallets?',
        answer: 'No! We use demo environments, test networks, and simulated scenarios. You\'ll learn using safe, educational tools without risking real money.'
      },
      {
        question: 'Are payment plans available?',
        answer: 'Yes! Installment payments via Payl8r - spread the cost over 3-12 months. TITANS CAREERS LIMITED is an Introducer Appointed Representative of Social Money Limited t/a Payl8r (FCA Ref: 675283). Representative APR 65.5%. Subject to creditworthiness assessment.'
      },
      {
        question: 'Will I learn about DeFi and NFTs?',
        answer: 'Yes! Week 8 covers DeFi compliance (DEXs, liquidity pools), NFT money laundering risks, smart contract auditing, and emerging crypto threats. Plus industry expert panels.'
      },
      {
        question: 'Can I get a refund if not satisfied?',
        answer: 'Yes! 14-day money-back guarantee. If the course isn\'t right for you within the first two weeks, full refund - no questions asked.'
      }
    ],
    instructor: {
      name: 'Lumi Otolorin',
      bio: 'Dual-qualified lawyer (LLB, LLM) and compliance expert specializing in crypto regulation and blockchain AML. Lumi has advised fintech firms and crypto exchanges on FATF Travel Rule implementation, VASP licensing, and MiCA compliance. Regular speaker at blockchain compliance conferences and contributor to industry publications.',
      credentials: 'LLB, LLM, Blockchain & Crypto Compliance Specialist, CAMS Candidate'
    },
    careerOutcomes: {
      jobTitles: [
        'Crypto Compliance Analyst',
        'Blockchain AML Specialist',
        'VASP Compliance Officer',
        'DeFi Risk Analyst',
        'Digital Assets Compliance Manager'
      ],
      salaryRange: '£35,000 - £110,000'
    },
    certifications: ['Crypto Compliance Portfolio', 'Professional Certificate of Completion'],
    projectCount: 8
  },
  'data-analysis': {
    slug: 'data-analysis',
    title: 'Data Analysis Programme',
    tagline: 'Go from Excel to Data Analyst with portfolio-ready projects',
    badge: 'Tech Career',
    category: 'data',
    whatsappGroupLink: 'https://chat.whatsapp.com/LbqHFDSOHT93o2cK1B4bBy',
    price: 499,
    duration: '10 weeks',
    schedule: 'Saturdays & Sundays',
    description: 'Learn Excel, SQL, Power BI, and Tableau to become a data analyst. Build a portfolio of dashboards and analytics projects that showcase your skills to employers.',
    overview: [
      'Master Excel for data analysis and automation',
      'Write SQL queries to extract and analyze data',
      'Build interactive dashboards in Power BI',
      'Create compelling visualizations in Tableau',
      'Complete portfolio projects with real-world data'
    ],
    whoItsFor: [
      'Career switchers wanting to work with data',
      'Professionals looking to upskill in analytics',
      'Anyone interested in remote, flexible tech careers'
    ],
    syllabus: [
      {
        week: 1,
        title: 'Excel Fundamentals',
        objectives: [
          'Master data cleaning and transformation',
          'Learn advanced formulas (VLOOKUP, INDEX-MATCH)',
          'Create pivot tables and charts'
        ],
        deliverable: 'Sales analysis dashboard in Excel'
      },
      {
        week: 2,
        title: 'Excel Advanced & Automation',
        objectives: [
          'Introduction to Power Query',
          'Data modeling basics',
          'Automate tasks with macros'
        ],
        deliverable: 'Automated reporting template'
      },
      {
        week: 3,
        title: 'SQL Foundations',
        objectives: [
          'Understand database structure',
          'Write SELECT, WHERE, ORDER BY queries',
          'Use aggregate functions (SUM, COUNT, AVG)'
        ],
        deliverable: 'Customer data analysis queries'
      },
      {
        week: 4,
        title: 'SQL Intermediate',
        objectives: [
          'Master JOINs (INNER, LEFT, RIGHT)',
          'Use subqueries and CTEs',
          'Group and filter data effectively'
        ],
        deliverable: 'Multi-table sales analysis'
      },
      {
        week: 5,
        title: 'Power BI Basics',
        objectives: [
          'Import and transform data',
          'Create relationships between tables',
          'Build your first dashboard'
        ],
        deliverable: 'HR analytics dashboard'
      },
      {
        week: 6,
        title: 'Power BI Advanced',
        objectives: [
          'Write DAX measures and calculations',
          'Create interactive filters and slicers',
          'Design professional-looking reports'
        ],
        deliverable: 'Financial performance dashboard'
      },
      {
        week: 7,
        title: 'Tableau Foundations',
        objectives: [
          'Connect to data sources',
          'Create visualizations (bar, line, maps)',
          'Build interactive worksheets'
        ],
        deliverable: 'Market analysis visualization'
      },
      {
        week: 8,
        title: 'Tableau Advanced',
        objectives: [
          'Create calculated fields and parameters',
          'Build comprehensive dashboards',
          'Tell stories with data'
        ],
        deliverable: 'Executive-level dashboard'
      },
      {
        week: 9,
        title: 'Portfolio Project',
        objectives: [
          'Choose your dataset and business question',
          'Perform end-to-end analysis',
          'Present insights and recommendations'
        ],
        deliverable: 'Capstone portfolio project'
      },
      {
        week: 10,
        title: 'Career Prep & Mock Interviews',
        objectives: [
          'Showcase your portfolio on GitHub/LinkedIn',
          'Practice technical interview questions',
          'Mock interview with feedback'
        ],
        deliverable: 'Polished portfolio + interview practice'
      }
    ],
    tools: ['Excel', 'SQL', 'Power BI', 'Tableau'],
    support: [
      'CV tailored for data analyst roles',
      'LinkedIn profile with portfolio showcase',
      '2-3 mock technical interviews',
      'Portfolio review and feedback',
      'Job board access and application support'
    ],
    faqs: [
      {
        question: 'Do I need coding experience?',
        answer: 'No coding required! We teach SQL from scratch and all tools are visual drag-and-drop interfaces.'
      },
      {
        question: 'What if I miss a class?',
        answer: 'All classes are recorded with lifetime access. You can watch anytime and ask questions in our support group.'
      },
      {
        question: 'How long to get hired?',
        answer: 'Average 8-12 weeks after course completion. We provide 12 months of career support to help you succeed.'
      },
      {
        question: 'Are payment plans available?',
        answer: 'Yes! Installment payments available via Payl8r - spread the cost over 3-12 months with flexible terms. TITANS CAREERS LIMITED is an Introducer Appointed Representative of Social Money Limited t/a Payl8r (FCA Ref: 675283). Representative APR 65.5%. Subject to creditworthiness assessment.'
      },
      {
        question: 'What\'s the difference between a data analyst and data scientist?',
        answer: 'Data Analysts focus on interpreting existing data and creating reports/dashboards. Data Scientists build predictive models and require advanced statistics/programming. This course prepares you for analyst roles - a perfect entry point into data careers.'
      },
      {
        question: 'Do I need to buy software licenses?',
        answer: 'No! Excel is widely available, SQL databases are free, and both Power BI and Tableau offer free versions for learning. We\'ll guide you through all installations.'
      },
      {
        question: 'Can I take this course while working full-time?',
        answer: 'Absolutely! Classes are on weekends (Saturdays & Sundays) and all sessions are recorded. Most students complete the course while working full-time.'
      },
      {
        question: 'What kind of portfolio projects will I build?',
        answer: 'You\'ll create 10+ projects including sales dashboards, customer analytics, financial reports, and executive-level visualizations using real-world datasets. These projects showcase your skills to employers.'
      },
      {
        question: 'Is there support after the course ends?',
        answer: 'Yes! You get 12 months of career support including CV reviews, interview prep, and job application guidance. Plus lifetime access to course materials and community.'
      },
      {
        question: 'What industries hire data analysts?',
        answer: 'Every industry! Finance, healthcare, retail, tech, government, consulting - all need data analysts. The skills are transferable, giving you flexibility in your career path.'
      }
    ],
    instructor: {
      name: 'Tobi Oladipupo',
      bio: 'Skilled Data Analyst with almost a decade of experience turning data into strategic insights for organizations like WHO and eHealth.',
      credentials: 'MSc Information Management, Excel/SQL/Power BI Expert'
    },
    careerOutcomes: {
      jobTitles: ['Data Analyst', 'Business Intelligence Analyst', 'Reporting Analyst', 'Analytics Consultant'],
      salaryRange: '£28,000 - £130,000'
    },
    certifications: ['Data Analytics Portfolio', 'Professional Certificate of Completion'],
    projectCount: 10
  },
  'cybersecurity': {
    slug: 'cybersecurity',
    title: 'Cybersecurity Essentials',
    tagline: 'Launch your cybersecurity career with hands-on security training',
    badge: 'Tech Security',
    category: 'cybersecurity',
    whatsappGroupLink: 'https://chat.whatsapp.com/GiQWDogIW5p29EIdNEg7Qp',
    price: 699,
    duration: '12 weeks',
    schedule: 'Saturdays & Sundays',
    description: 'Master network security, ethical hacking, and security tools. Prepare for CompTIA Security+ certification while building a portfolio of security projects.',
    overview: [
      'Understand network security fundamentals',
      'Learn ethical hacking techniques and tools',
      'Master vulnerability assessment and penetration testing',
      'Prepare for CompTIA Security+ certification',
      'Build a cybersecurity portfolio with real-world scenarios'
    ],
    whoItsFor: [
      'Career switchers interested in cybersecurity',
      'IT professionals looking to specialize in security',
      'Anyone wanting to enter the high-demand security field'
    ],
    syllabus: [
      {
        week: 1,
        title: 'Cybersecurity Fundamentals',
        objectives: [
          'Understand CIA triad (Confidentiality, Integrity, Availability)',
          'Learn threat landscape and attack vectors',
          'Introduction to security frameworks (NIST, ISO 27001)'
        ],
        deliverable: 'Security framework comparison chart'
      },
      {
        week: 2,
        title: 'Network Security Basics',
        objectives: [
          'Understand TCP/IP and network protocols',
          'Learn firewalls, VPNs, and network segmentation',
          'Introduction to Wireshark for packet analysis'
        ],
        deliverable: 'Network traffic analysis report'
      },
      {
        week: 3,
        title: 'Vulnerability Assessment',
        objectives: [
          'Learn vulnerability scanning with Nessus',
          'Understand CVE and vulnerability databases',
          'Practice vulnerability prioritization and remediation'
        ],
        deliverable: 'Vulnerability assessment report'
      },
      {
        week: 4,
        title: 'Introduction to Penetration Testing',
        objectives: [
          'Understand penetration testing methodologies',
          'Learn reconnaissance and information gathering',
          'Introduction to Kali Linux tools'
        ],
        deliverable: 'Penetration testing plan'
      },
      {
        week: 5,
        title: 'Exploitation Techniques',
        objectives: [
          'Learn Metasploit framework basics',
          'Practice common exploitation techniques',
          'Understand post-exploitation and privilege escalation'
        ],
        deliverable: 'Exploitation lab report'
      },
      {
        week: 6,
        title: 'Web Application Security',
        objectives: [
          'Understand OWASP Top 10 vulnerabilities',
          'Learn SQL injection and XSS attacks',
          'Practice secure coding principles'
        ],
        deliverable: 'Web security assessment'
      },
      {
        week: 7,
        title: 'Security Operations & Monitoring',
        objectives: [
          'Introduction to SOC operations',
          'Learn SIEM tools and log analysis',
          'Understand incident response procedures'
        ],
        deliverable: 'Incident response plan'
      },
      {
        week: 8,
        title: 'Cryptography & Data Protection',
        objectives: [
          'Understand encryption algorithms and protocols',
          'Learn PKI and certificate management',
          'Practice data protection techniques'
        ],
        deliverable: 'Encryption implementation project'
      },
      {
        week: 9,
        title: 'CompTIA Security+ Prep',
        objectives: [
          'Review Security+ exam objectives',
          'Practice exam questions and scenarios',
          'Learn exam strategies and tips'
        ],
        deliverable: 'Practice exam completion'
      },
      {
        week: 10,
        title: 'Portfolio & Career Prep',
        objectives: [
          'Build your cybersecurity portfolio',
          'Practice technical interview questions',
          'Mock interview with feedback'
        ],
        deliverable: 'Complete portfolio + interview practice'
      }
    ],
    tools: ['Wireshark', 'Kali Linux', 'Metasploit', 'Nessus', 'CompTIA Security+'],
    support: [
      'CV tailored for cybersecurity roles',
      'LinkedIn profile optimization',
      '2-3 mock technical interviews',
      'Portfolio review and guidance',
      'Job board access and application support'
    ],
    faqs: [
      {
        question: 'Do I need IT experience?',
        answer: 'Basic IT knowledge is helpful but not required. We start from fundamentals and build up to advanced security concepts.'
      },
      {
        question: 'What if I miss a class?',
        answer: 'All classes are recorded with lifetime access. Watch anytime and ask questions in our support group.'
      },
      {
        question: 'Does this prepare me for Security+ certification?',
        answer: 'Yes! Week 9 is dedicated to Security+ exam prep. The course covers all exam objectives with hands-on practice.'
      },
      {
        question: 'How quickly can I get hired?',
        answer: 'Average 8-12 weeks after completing the course. We provide 12 months of career support to help you land your security role.'
      },
      {
        question: 'Are payment plans available?',
        answer: 'Yes! Installment payments available via Payl8r - spread the cost over 3-12 months with flexible terms. TITANS CAREERS LIMITED is an Introducer Appointed Representative of Social Money Limited t/a Payl8r (FCA Ref: 675283). Representative APR 65.5%. Subject to creditworthiness assessment.'
      },
      {
        question: 'Do I need to buy my own lab equipment?',
        answer: 'No! All labs are cloud-based and we provide access to virtual environments. You only need a computer with internet connection.'
      },
      {
        question: 'What\'s the difference between ethical hacking and penetration testing?',
        answer: 'Ethical hacking is broader - finding security vulnerabilities using hacker techniques legally. Penetration testing is a formal assessment following specific methodologies. This course covers both approaches.'
      },
      {
        question: 'Can beginners really get into cybersecurity?',
        answer: 'Yes! Many successful cybersecurity professionals started with no IT background. With dedication and the right training, entry-level security roles are very achievable.'
      },
      {
        question: 'Will I be job-ready after this course?',
        answer: 'Yes! You\'ll have hands-on experience with industry-standard tools, a portfolio of security projects, and preparation for Security+ certification - everything employers look for in entry-level candidates.'
      },
      {
        question: 'What career paths exist in cybersecurity?',
        answer: 'Many paths: Security Analyst, SOC Analyst, Penetration Tester, Security Engineer, Incident Responder, Security Consultant. Salaries range from £32k entry-level to £80k+ for senior roles.'
      }
    ],
    instructor: {
      name: 'Femi Otolorin',
      bio: 'AWS-certified Cloud Solutions and Cybersecurity professional with extensive experience in software development, digital media, and IT infrastructure.',
      credentials: 'AWS Certified, CompTIA Security+, Cybersecurity Expert'
    },
    careerOutcomes: {
      jobTitles: ['Security Analyst', 'Cybersecurity Specialist', 'Penetration Tester', 'SOC Analyst'],
      salaryRange: '£28,000 - £120,000'
    },
    certifications: ['CompTIA Security+ Ready', 'Cybersecurity Portfolio', 'Professional Certificate'],
    projectCount: 10
  },
  'business-analysis': {
    slug: 'business-analysis',
    title: 'Business Analysis Fundamentals',
    tagline: 'Bridge the gap between business and technology',
    badge: 'Business Tech',
    category: 'business',
    whatsappGroupLink: 'https://chat.whatsapp.com/JWOqfCODLD7JgO8RxtY1UH',
    price: 699,
    duration: '16 weeks',
    schedule: 'Saturdays or Sundays',
    description: 'Learn requirements gathering, stakeholder management, and business process analysis. Master tools like JIRA, Confluence, and process mapping to become a certified Business Analyst.',
    overview: [
      'Master requirements elicitation and documentation',
      'Learn stakeholder management and communication',
      'Understand Agile, SCRUM, and project methodologies',
      'Build process maps and business workflows',
      'Create a BA portfolio with real-world case studies'
    ],
    whoItsFor: [
      'Career switchers wanting to work in tech without coding',
      'Project managers looking to formalize BA skills',
      'Anyone interested in bridging business and technology'
    ],
    syllabus: [
      {
        week: 1,
        title: 'Business Analysis Foundations',
        objectives: [
          'Understand the BA role and responsibilities',
          'Learn BABOK framework and knowledge areas',
          'Introduction to requirements lifecycle'
        ],
        deliverable: 'BA role comparison analysis'
      },
      {
        week: 2,
        title: 'Requirements Elicitation',
        objectives: [
          'Master interview and workshop techniques',
          'Learn observation and document analysis',
          'Practice questioning and active listening'
        ],
        deliverable: 'Requirements elicitation plan'
      },
      {
        week: 3,
        title: 'Requirements Documentation',
        objectives: [
          'Write user stories and acceptance criteria',
          'Create use cases and process flows',
          'Learn requirements traceability matrix'
        ],
        deliverable: 'Requirements documentation package'
      },
      {
        week: 4,
        title: 'Stakeholder Management',
        objectives: [
          'Identify and analyze stakeholders',
          'Learn communication and negotiation skills',
          'Practice conflict resolution techniques'
        ],
        deliverable: 'Stakeholder analysis and engagement plan'
      },
      {
        week: 5,
        title: 'Business Process Analysis',
        objectives: [
          'Create process maps and flowcharts',
          'Learn BPMN notation and Visio',
          'Understand process improvement techniques'
        ],
        deliverable: 'Process analysis and improvement report'
      },
      {
        week: 6,
        title: 'Agile & SCRUM for BAs',
        objectives: [
          'Understand Agile principles and methodologies',
          'Learn SCRUM ceremonies and BA role',
          'Practice writing user stories in JIRA'
        ],
        deliverable: 'Agile project simulation'
      },
      {
        week: 7,
        title: 'Tools & Techniques',
        objectives: [
          'Master JIRA for requirements management',
          'Learn Confluence for documentation',
          'Practice data modeling and SQL basics'
        ],
        deliverable: 'JIRA project setup and documentation'
      },
      {
        week: 8,
        title: 'Solution Assessment and Validation',
        objectives: [
          'Learn solution evaluation techniques',
          'Practice requirements validation and testing',
          'Understand acceptance criteria verification'
        ],
        deliverable: 'Solution assessment plan'
      },
      {
        week: 9,
        title: 'Advanced Stakeholder Management',
        objectives: [
          'Master complex stakeholder engagement strategies',
          'Learn influence without authority techniques',
          'Practice facilitation and consensus building'
        ],
        deliverable: 'Advanced stakeholder engagement simulation'
      },
      {
        week: 10,
        title: 'Data Analysis for Business Analysts',
        objectives: [
          'Introduction to SQL for BAs',
          'Learn data modeling fundamentals',
          'Practice creating entity-relationship diagrams'
        ],
        deliverable: 'Data model and SQL queries project'
      },
      {
        week: 11,
        title: 'Requirements Validation & Testing',
        objectives: [
          'Understand UAT planning and execution',
          'Learn test case design and defect management',
          'Practice requirements verification techniques'
        ],
        deliverable: 'UAT plan and test case documentation'
      },
      {
        week: 12,
        title: 'Change Management & Adoption',
        objectives: [
          'Learn organizational change management principles',
          'Understand user adoption strategies',
          'Practice creating training materials and documentation'
        ],
        deliverable: 'Change management and training plan'
      },
      {
        week: 13,
        title: 'Business Case Development & ROI',
        objectives: [
          'Learn to create comprehensive business cases',
          'Understand cost-benefit analysis techniques',
          'Practice ROI calculations and financial modeling'
        ],
        deliverable: 'Complete business case with financial analysis'
      },
      {
        week: 14,
        title: 'Advanced Agile & Scaling Frameworks',
        objectives: [
          'Deep dive into SAFe and LeSS frameworks',
          'Learn Product Owner role in scaled environments',
          'Practice PI planning and release management'
        ],
        deliverable: 'Scaled Agile framework case study'
      },
      {
        week: 15,
        title: 'Capstone Project',
        objectives: [
          'Complete end-to-end BA simulation project',
          'Apply all learned techniques to real-world scenario',
          'Present findings and recommendations to stakeholders'
        ],
        deliverable: 'Comprehensive BA capstone project'
      },
      {
        week: 16,
        title: 'Portfolio Presentation & Career Launch',
        objectives: [
          'Final portfolio review and polish',
          'Practice interview techniques and STAR responses',
          'Career roadmap and certification preparation guidance'
        ],
        deliverable: 'Complete portfolio + mock interview + career plan'
      }
    ],
    tools: ['JIRA', 'Confluence', 'Visio', 'MS Project', 'Lucidchart'],
    support: [
      'CV tailored for Business Analyst roles',
      'LinkedIn profile with BA portfolio',
      '2-3 mock behavioral interviews',
      'Portfolio review and feedback',
      'Job board access and application support'
    ],
    faqs: [
      {
        question: 'Do I need coding skills?',
        answer: 'No coding required! BAs focus on communication, requirements, and process analysis. We cover basic SQL but no programming.'
      },
      {
        question: 'What if I miss a class?',
        answer: 'All classes are recorded with lifetime access. Watch anytime and ask questions in our WhatsApp support group.'
      },
      {
        question: 'Is this suitable for project managers?',
        answer: 'Absolutely! Many PMs transition to BA roles or add BA skills to their toolkit. The course complements PM experience perfectly.'
      },
      {
        question: 'How quickly can I get hired?',
        answer: 'Average 8-12 weeks after course completion. We provide 12 months of career support to help you succeed.'
      },
      {
        question: 'Are payment plans available?',
        answer: 'Yes! Installment payments available via Payl8r - spread the cost over 3-12 months with flexible terms. TITANS CAREERS LIMITED is an Introducer Appointed Representative of Social Money Limited t/a Payl8r (FCA Ref: 675283). Representative APR 65.5%. Subject to creditworthiness assessment.'
      },
      {
        question: 'What\'s the difference between a BA and a Product Owner?',
        answer: 'BAs focus on requirements, documentation, and stakeholder management across any methodology. Product Owners are specific to Agile/SCRUM and own the product backlog. Many BAs become POs - this course prepares you for both.'
      },
      {
        question: 'Do I get access to JIRA and Confluence?',
        answer: 'Yes! We provide access to JIRA and Confluence training environments where you\'ll practice real-world BA tasks like writing user stories and creating documentation.'
      },
      {
        question: 'Can I work remotely as a Business Analyst?',
        answer: 'Absolutely! BA is one of the most remote-friendly roles in tech. Many companies offer hybrid or fully remote BA positions, especially post-pandemic.'
      },
      {
        question: 'What industries need Business Analysts?',
        answer: 'Every industry! Finance, healthcare, retail, tech, government - any organization implementing technology or improving processes needs BAs. This versatility offers excellent job security.'
      },
      {
        question: 'Is CBAP certification covered in this course?',
        answer: 'This course provides foundational BA skills. CBAP requires 7,500 hours of BA experience. We prepare you for entry-level roles, and you can pursue CBAP after gaining professional experience.'
      }
    ],
    instructor: {
      name: 'Wunmi Nwogu',
      bio: 'Seasoned Business Analyst and Project Manager renowned for delivering complex, cross-industry projects with precision and impact.',
      credentials: 'CBAP, PMP, Agile Certified'
    },
    careerOutcomes: {
      jobTitles: ['Business Analyst', 'Product Owner', 'Requirements Analyst', 'Process Analyst'],
      salaryRange: '£30,000 - £100,000'
    },
    certifications: ['Business Analysis Portfolio', 'Professional Certificate of Completion'],
    projectCount: 8
  },
  'digital-marketing': {
    slug: 'digital-marketing',
    title: 'Digital Marketing Masterclass',
    tagline: 'Master SEO, PPC, social media, and analytics to launch your marketing career',
    badge: 'Marketing Career',
    category: 'marketing',
    whatsappGroupLink: 'https://chat.whatsapp.com/HyGI51eHI0928YOHvIm1r0',
    price: 699,
    duration: '8 weeks',
    schedule: 'Saturdays or Sundays',
    description: 'Learn Google Ads, Facebook Ads, SEO, content marketing, and analytics. Build a portfolio of campaigns and strategies that showcase your digital marketing expertise to employers.',
    overview: [
      'Master Google Ads and PPC campaign management',
      'Learn Facebook and Instagram advertising strategies',
      'Understand SEO fundamentals and keyword research',
      'Analyze campaign performance with Google Analytics',
      'Build a digital marketing portfolio with real campaigns'
    ],
    whoItsFor: [
      'Career switchers wanting to work in digital marketing',
      'Small business owners looking to market their business',
      'Marketing professionals wanting to upskill in digital channels'
    ],
    syllabus: [
      {
        week: 1,
        title: 'Digital Marketing Foundations',
        objectives: [
          'Understand the digital marketing landscape',
          'Learn marketing funnel and customer journey',
          'Introduction to marketing channels and platforms'
        ],
        deliverable: 'Digital marketing strategy outline'
      },
      {
        week: 2,
        title: 'SEO Fundamentals',
        objectives: [
          'Master on-page and off-page SEO',
          'Learn keyword research with tools',
          'Understand technical SEO basics'
        ],
        deliverable: 'SEO audit and optimization plan'
      },
      {
        week: 3,
        title: 'Google Ads & PPC',
        objectives: [
          'Set up Google Ads campaigns',
          'Learn bidding strategies and budgeting',
          'Master ad copywriting and optimization'
        ],
        deliverable: 'Google Ads campaign setup'
      },
      {
        week: 4,
        title: 'Social Media Marketing',
        objectives: [
          'Develop social media strategies',
          'Create engaging content for platforms',
          'Learn community management best practices'
        ],
        deliverable: 'Social media content calendar'
      },
      {
        week: 5,
        title: 'Facebook & Instagram Ads',
        objectives: [
          'Master Meta Ads Manager',
          'Learn audience targeting and segmentation',
          'Create high-converting ad creatives'
        ],
        deliverable: 'Facebook ad campaign'
      },
      {
        week: 6,
        title: 'Content Marketing & Email',
        objectives: [
          'Learn content strategy and planning',
          'Master email marketing best practices',
          'Build email campaigns and automation'
        ],
        deliverable: 'Content and email marketing plan'
      },
      {
        week: 7,
        title: 'Google Analytics & Data Analysis',
        objectives: [
          'Set up Google Analytics tracking',
          'Analyze website and campaign performance',
          'Create marketing dashboards and reports'
        ],
        deliverable: 'Analytics dashboard and report'
      },
      {
        week: 8,
        title: 'Portfolio Project & Career Prep',
        objectives: [
          'Build your digital marketing portfolio',
          'Practice marketing interview questions',
          'Present your campaign results'
        ],
        deliverable: 'Complete portfolio + mock interview'
      }
    ],
    tools: ['Google Ads', 'Facebook Ads Manager', 'Google Analytics', 'SEMrush', 'Mailchimp'],
    support: [
      'CV tailored for digital marketing roles',
      'LinkedIn profile with portfolio showcase',
      '2-3 mock interviews with feedback',
      'Portfolio review and optimization',
      'Job board access and application support'
    ],
    faqs: [
      {
        question: 'Do I need prior marketing experience?',
        answer: 'No experience required! We start from basics and build practical skills that employers value.'
      },
      {
        question: 'What if I miss a class?',
        answer: 'All classes are recorded with lifetime access. Watch anytime and ask questions in our support group.'
      },
      {
        question: 'How quickly can I get hired?',
        answer: 'Average 8-12 weeks after course completion. We provide 12 months of career support to help you land your marketing role.'
      },
      {
        question: 'Are payment plans available?',
        answer: 'Yes! Installment payments available via Payl8r - spread the cost over 3-12 months with flexible terms. TITANS CAREERS LIMITED is an Introducer Appointed Representative of Social Money Limited t/a Payl8r (FCA Ref: 675283). Representative APR 65.5%. Subject to creditworthiness assessment.'
      },
      {
        question: 'Will I get to run real campaigns?',
        answer: 'Yes! You\'ll create real campaigns with small budgets to gain hands-on experience. We guide you through setting up and optimizing actual Google and Facebook ads.'
      },
      {
        question: 'Do I need to pay for ads to practice?',
        answer: 'We provide small ad credits for practice campaigns, but you may choose to invest £50-100 of your own budget to build a more robust portfolio. It\'s optional but recommended.'
      },
      {
        question: 'What\'s the difference between digital marketing and traditional marketing?',
        answer: 'Digital marketing uses online channels (search, social, email) and provides measurable data. Traditional marketing uses offline channels (TV, print). Digital marketing is more cost-effective and trackable, making it essential for modern businesses.'
      },
      {
        question: 'Can I freelance as a digital marketer?',
        answer: 'Absolutely! Many digital marketers work as freelancers or consultants. The skills you learn are perfect for freelancing, and we cover how to pitch and manage clients.'
      },
      {
        question: 'What industries hire digital marketers?',
        answer: 'Every industry! E-commerce, SaaS, finance, healthcare, hospitality - all businesses need digital marketing. The skills are highly transferable across sectors.'
      },
      {
        question: 'Is certification included?',
        answer: 'You\'ll receive our Professional Certificate of Completion. We also prepare you for Google Ads and Google Analytics certifications, which are free to take and highly valued by employers.'
      }
    ],
    instructor: {
      name: 'Sarah Johnson',
      bio: 'Digital marketing expert with 10+ years of experience managing campaigns for brands across e-commerce, tech, and finance sectors.',
      credentials: 'Google Ads Certified, Meta Blueprint Certified, Digital Marketing Expert'
    },
    careerOutcomes: {
      jobTitles: ['Digital Marketing Executive', 'PPC Specialist', 'Social Media Manager', 'SEO Specialist'],
      salaryRange: '£25,000 - £80,000'
    },
    certifications: ['Digital Marketing Portfolio', 'Professional Certificate of Completion'],
    projectCount: 8
  },
  'data-privacy': {
    slug: 'data-privacy',
    title: 'Data Privacy & GDPR Compliance',
    tagline: 'Become a data privacy expert and protect organizations from regulatory risks',
    badge: 'Privacy Compliance',
    category: 'compliance',
    whatsappGroupLink: 'https://chat.whatsapp.com/KR1MPvX230j4QjJrGVCbh5',
    price: 499,
    duration: '8 weeks',
    schedule: 'Saturdays or Sundays',
    description: 'Master GDPR, UK DPA 2018, data protection principles, and privacy impact assessments. Build expertise in data privacy compliance and prepare for the CIPM certification.',
    overview: [
      'Master GDPR and UK Data Protection Act 2018',
      'Learn data protection principles and lawful basis',
      'Conduct Privacy Impact Assessments (PIAs)',
      'Understand data breach response and reporting',
      'Build a privacy compliance portfolio'
    ],
    whoItsFor: [
      'Compliance professionals wanting to specialize in privacy',
      'Career switchers interested in data protection',
      'Anyone looking to enter the growing privacy field'
    ],
    syllabus: [
      {
        week: 1,
        title: 'Data Privacy Fundamentals',
        objectives: [
          'Understand global privacy landscape',
          'Learn GDPR structure and key definitions',
          'Identify roles: Controller, Processor, DPO'
        ],
        deliverable: 'Privacy framework comparison chart'
      },
      {
        week: 2,
        title: 'Data Protection Principles',
        objectives: [
          'Master the 7 GDPR principles',
          'Understand lawful basis for processing',
          'Learn about special category data'
        ],
        deliverable: 'Lawful basis assessment matrix'
      },
      {
        week: 3,
        title: 'Individual Rights (DSAR)',
        objectives: [
          'Handle Data Subject Access Requests',
          'Understand right to erasure and rectification',
          'Learn about portability and objection rights'
        ],
        deliverable: 'DSAR response procedures'
      },
      {
        week: 4,
        title: 'Privacy Impact Assessments',
        objectives: [
          'Conduct Privacy Impact Assessments',
          'Identify and mitigate privacy risks',
          'Document PIA findings and recommendations'
        ],
        deliverable: 'Complete PIA case study'
      },
      {
        week: 5,
        title: 'Data Breach Management',
        objectives: [
          'Understand breach notification requirements',
          'Learn 72-hour reporting to ICO',
          'Develop breach response procedures'
        ],
        deliverable: 'Data breach response plan'
      },
      {
        week: 6,
        title: 'International Data Transfers',
        objectives: [
          'Navigate Schrems II and adequacy decisions',
          'Understand Standard Contractual Clauses',
          'Learn about Binding Corporate Rules'
        ],
        deliverable: 'International transfer assessment'
      },
      {
        week: 7,
        title: 'Privacy by Design & Documentation',
        objectives: [
          'Implement Privacy by Design principles',
          'Maintain Records of Processing Activities',
          'Create privacy policies and notices'
        ],
        deliverable: 'Privacy documentation suite'
      },
      {
        week: 8,
        title: 'ICO Enforcement & Career Prep',
        objectives: [
          'Review ICO enforcement actions and fines',
          'Understand regulatory trends',
          'Complete portfolio and mock interview'
        ],
        deliverable: 'Complete privacy portfolio'
      }
    ],
    tools: ['OneTrust', 'Privacy Management Software', 'ICO Resources', 'GDPR Templates'],
    support: [
      'CV tailored for data privacy roles',
      'LinkedIn profile optimization',
      '2-3 mock interviews with feedback',
      'CIPM certification guidance',
      'Job board access and application support'
    ],
    faqs: [
      {
        question: 'Do I need legal background?',
        answer: 'No legal background required! We explain GDPR and privacy laws in practical, accessible terms. Many privacy professionals come from non-legal backgrounds.'
      },
      {
        question: 'What if I miss a class?',
        answer: 'All classes are recorded with lifetime access. Watch anytime and ask questions in our support group.'
      },
      {
        question: 'Is this only relevant for UK/EU?',
        answer: 'While focused on GDPR and UK DPA, the principles apply globally. Many countries model their laws on GDPR, making these skills internationally valuable.'
      },
      {
        question: 'How quickly can I get hired?',
        answer: 'Average 8-12 weeks after course completion. We provide 12 months of career support to help you land your privacy role.'
      },
      {
        question: 'Are payment plans available?',
        answer: 'Yes! Installment payments available via Payl8r - spread the cost over 3-12 months with flexible terms. TITANS CAREERS LIMITED is an Introducer Appointed Representative of Social Money Limited t/a Payl8r (FCA Ref: 675283). Representative APR 65.5%. Subject to creditworthiness assessment.'
      },
      {
        question: 'What\'s the demand for data privacy roles?',
        answer: 'Extremely high! GDPR made Data Protection Officers mandatory for many organizations. Privacy professionals are in high demand across all sectors, with salaries ranging from £35k to £90k+.'
      },
      {
        question: 'Does this prepare me for CIPM certification?',
        answer: 'Yes! The course covers core CIPM content. We provide guidance on the certification exam, though the exam fee is separate and optional.'
      },
      {
        question: 'Can I work as a DPO after this course?',
        answer: 'DPO roles typically require experience, but this course prepares you for entry-level privacy positions like Privacy Analyst or Data Protection Officer Assistant, which lead to DPO roles.'
      },
      {
        question: 'What industries need privacy professionals?',
        answer: 'All industries! Tech, finance, healthcare, retail, government - any organization processing personal data needs privacy expertise. This provides excellent job security.'
      },
      {
        question: 'Is this relevant with Brexit?',
        answer: 'Absolutely! The UK adopted GDPR as UK DPA 2018 post-Brexit. UK organizations still need to comply with GDPR for EU customers. The demand for privacy professionals in the UK remains strong.'
      }
    ],
    instructor: {
      name: 'Lumi Otolorin',
      bio: 'Dual-qualified lawyer and compliance expert specializing in data protection, GDPR compliance, and regulatory risk management.',
      credentials: 'LLB, LLM, CIPM, Data Protection Specialist'
    },
    careerOutcomes: {
      jobTitles: ['Privacy Analyst', 'Data Protection Officer', 'Privacy Consultant', 'GDPR Specialist'],
      salaryRange: '£35,000 - £90,000'
    },
    certifications: ['Data Privacy Portfolio', 'Professional Certificate of Completion'],
    projectCount: 8
  }
};
