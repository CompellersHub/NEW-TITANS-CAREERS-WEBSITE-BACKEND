export interface Testimonial {
  id: number;
  name: string;
  role: string;
  previousRole: string;
  track: 'aml-kyc' | 'data';
  timeToOffer?: string;
  location?: string;
  salaryBand?: string;
  story: string;
  image: string;
  mentor?: 'Lumi' | 'Tobi';
  company?: string;
}

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Success Story',
    role: 'Junior AML Analyst',
    previousRole: 'Care Worker (Night Shifts)',
    track: 'aml-kyc',
    company: 'UK Bank',
    story: "Night shifts in care left me exhausted and unsure of my next step. The Titans AML/KYC course taught me how to separate CDD from EDD, document decisions, and write SARs with evidence. Lumi reviewed my CV line by line and drilled STAR answers until I sounded natural. I built a mock onboarding pack that showed risk, controls, and rationale. I now work as a Junior AML Analyst at a UK bank. I finally feel in control of my career.",
    image: '/placeholder.svg',
    mentor: 'Lumi'
  },
  {
    id: 2,
    name: 'Success Story',
    role: 'Data Analyst',
    previousRole: 'Warehouse Worker',
    track: 'data',
    company: 'Motor Finance Company',
    story: "I spent years lifting boxes and memorizing aisle maps. With Tobi's guidance I learned Excel, SQL joins, and Power BI storytelling. My capstone analyzed arrears by cohort and added a call list that collections agents could use immediately. During interviews I used a two minute demo script and focused on actions, not jargon. I now work as a Data Analyst in motor finance, improving dealer performance reports. The portfolio gave me proof and the confidence to speak clearly.",
    image: '/placeholder.svg',
    mentor: 'Tobi'
  },
  {
    id: 3,
    name: 'UK Migration Success',
    role: 'KYC Analyst',
    previousRole: 'Security Guard',
    track: 'aml-kyc',
    company: 'Global Law Firm',
    story: "I moved to the UK with security experience and a desire for a white collar role. Titans explained KYB for partnerships, LLPs, and trusts, plus UBO mapping with clear diagrams. Lumi taught me to write short defensible rationales and to keep an audit trail that another analyst could follow. I built a checklist that matched the firm's policy. I joined a global law firm as a KYC Analyst. The structured thinking I learned shows up in every file.",
    image: '/placeholder.svg',
    mentor: 'Lumi'
  },
  {
    id: 4,
    name: 'Success Story',
    role: 'NHS Business Intelligence Assistant',
    previousRole: 'GP Practice Admin',
    track: 'data',
    company: 'NHS',
    story: "Working admin at a GP practice showed me how slow manual spreadsheets could be. Tobi taught me SQL basics, cleaning pipelines, and simple visual design that avoids clutter. My capstone tracked referral waiting times and flagged data quality issues with notes that teams could resolve. I practiced a confident walk through of the dashboard and landed an NHS BI Assistant role. Now I help clinicians and managers see the right numbers at the right time.",
    image: '/placeholder.svg',
    mentor: 'Tobi'
  },
  {
    id: 5,
    name: 'Success Story',
    role: 'Transaction Monitoring Analyst',
    previousRole: 'Office Cleaner (Night Shifts)',
    track: 'aml-kyc',
    company: 'Digital Bank',
    story: "I cleaned offices at night and studied during the day. The transaction monitoring module made alert triage feel logical. I learned thresholds, typologies, and how to document every decision. Lumi critiqued my narratives until they were precise and consistent. I built a mock SAR and an escalation tree that matched policy. I was hired as a Transaction Monitoring Analyst at a digital bank. My team lead praised my clarity and my habit of linking evidence to risk.",
    image: '/placeholder.svg',
    mentor: 'Lumi'
  },
  {
    id: 6,
    name: 'Success Story',
    role: 'Junior Power BI Developer',
    previousRole: 'Cab Driver',
    track: 'data',
    company: 'Retail Group',
    story: "Driving a cab taught me to listen. Tobi used that strength in portfolio reviews. He helped me build a sales by region dashboard with DAX measures for like for like growth, plus a single actions slide. The interview panel cared about outcomes, not buzzwords. I was hired as a Junior Power BI Developer for a retail group. Instalment payments kept learning within reach. Weekly Q and A sessions helped me keep momentum despite long shifts.",
    image: '/placeholder.svg',
    mentor: 'Tobi'
  },
  {
    id: 7,
    name: 'UK Migration Success',
    role: 'Sanctions Screening Analyst',
    previousRole: 'Care Worker',
    track: 'aml-kyc',
    company: 'Shell Supplier (Oil & Gas)',
    story: "After moving to the UK I worked in care while studying sanctions and PEP screening. Lumi taught me hit triage and how to reduce false positives by using identifiers and context. I practiced clean case notes and a simple decision table. I joined an oil and gas supplier that supports Shell's vendor network. My interviewers liked my examples that showed judgment and audit readiness. The methods from class are now my daily toolkit for resolving alerts.",
    image: '/placeholder.svg',
    mentor: 'Lumi'
  },
  {
    id: 8,
    name: 'Success Story',
    role: 'Fraud Operations Data Analyst',
    previousRole: 'Warehouse Supervisor',
    track: 'data',
    company: 'Fintech',
    story: "I managed shifts and rosters but loved numbers. With Tobi I learned window functions, reproducible SQL, and Power BI layouts that highlight decisions. My capstone identified payment outliers and created a dashboard for rule tuning. During interviews I explained what to change on Monday morning. I joined a fintech as a Fraud Operations Data Analyst. I work with investigators to reduce losses and speed reviews. The portfolio made me credible and the scripts kept me calm.",
    image: '/placeholder.svg',
    mentor: 'Tobi'
  },
  {
    id: 9,
    name: 'Success Story',
    role: 'KYC Analyst',
    previousRole: 'Receptionist',
    track: 'aml-kyc',
    company: 'Global Bank',
    story: "I moved from reception to risk by building a small but strong KYB portfolio. Titans taught risk scoring, beneficial ownership, and how to reference policy without overloading a file. Lumi refined my CV and STAR stories, then made me rehearse handover notes an auditor would understand. I joined a global bank as a KYC Analyst. My manager said my rationales were concise and consistent. The discipline of writing for someone else's eyes changed everything.",
    image: '/placeholder.svg',
    mentor: 'Lumi'
  },
  {
    id: 10,
    name: 'Success Story',
    role: 'Financial Crime Analyst (SAR Quality)',
    previousRole: 'Security Guard',
    track: 'aml-kyc',
    company: 'High Street Bank',
    story: "Standing at a lobby turnstile I doubted compliance would ever be open to me. Titans clarified suspicion indicators and the tone required in SARs. Lumi insisted on a structure that never fails. Who, what, why, risk, and action. I created a small SAR library with anonymized examples and peer feedback. I joined a high street bank as a Financial Crime Analyst focused on SAR quality. My reviews are clear and timely because I follow the method.",
    image: '/placeholder.svg',
    mentor: 'Lumi'
  },
  {
    id: 11,
    name: 'Success Story',
    role: 'NHS Data Quality Officer',
    previousRole: 'Cleaner',
    track: 'data',
    company: 'NHS',
    story: "Juggling cleaning and study was hard. Tobi taught data validation, joins, and how to log assumptions and issues as part of the workflow. My capstone improved completeness checks on referrals and produced a simple report that teams could act on. I now work as an NHS Data Quality Officer. The habit of documenting caveats and next steps keeps meetings focused. The portfolio plus a confident two minute demo convinced the panel that I could contribute immediately.",
    image: '/placeholder.svg',
    mentor: 'Tobi'
  },
  {
    id: 12,
    name: 'UK Migration Success',
    role: 'AML Analyst',
    previousRole: 'Cab Driver (Nigeria)',
    track: 'aml-kyc',
    company: 'Challenger Bank',
    story: "I migrated from Lagos and drove minicabs to pay the bills. Titans explained the difference between CDD and EDD, how to escalate PEPs, and how to evidence a decision. Lumi challenged me to submit a tidy case pack with sources and screenshots. I brought that pack to interviews and answered clearly using STAR. I am now an AML Analyst at a challenger bank in the UK. I still use Lumi's QA checklist every week to stay consistent.",
    image: '/placeholder.svg',
    mentor: 'Lumi'
  },
  {
    id: 13,
    name: 'Success Story',
    role: 'Collections Data Analyst',
    previousRole: 'Warehouse Picker',
    track: 'data',
    company: 'Motor Finance Company',
    story: "As a picker I valued accuracy. Tobi taught SQL CTEs and time intelligence in Power BI. My capstone predicted late payment risk with a simple segmentation that collections agents could use without training. I joined a motor finance company as a Collections Data Analyst. I build dashboards that help agents prioritize outreach and track outcomes. The replay hub meant I never fell behind even when overtime ran long. Clear documentation became my trusted habit.",
    image: '/placeholder.svg',
    mentor: 'Tobi'
  },
  {
    id: 14,
    name: 'Success Story',
    role: 'EDD Investigator',
    previousRole: 'Admin Assistant',
    track: 'aml-kyc',
    company: 'Global Bank',
    story: "I was an admin assistant chasing signatures and calendars. Titans opened the investigative side of compliance. The EDD module covered adverse media, open source research, and building a defensible narrative. Lumi tightened my logic, removed filler, and taught me to conclude with confidence. I joined a global bank as an EDD Investigator. I handle high risk clients and write findings that are easy to review. The course replaced guesswork with structure and calm.",
    image: '/placeholder.svg',
    mentor: 'Lumi'
  },
  {
    id: 15,
    name: 'Success Story',
    role: 'Data Analyst',
    previousRole: 'Building Security',
    track: 'data',
    company: 'Local Authority',
    story: "Working building security gave me patience and attention to detail. I learned SQL at night and built small prototypes. Tobi emphasized simple data models, clean visuals, and a short walkthrough. My capstone was a service usage dashboard for a fictional council, with filters that matched real questions. I joined a local authority as a Data Analyst. I now deliver weekly KPI packs that leaders actually read. The focus on actions turned me from nervous to useful.",
    image: '/placeholder.svg',
    mentor: 'Tobi'
  },
  {
    id: 16,
    name: 'Success Story',
    role: 'Onboarding Analyst',
    previousRole: 'Care Worker',
    track: 'aml-kyc',
    company: 'Top 50 UK Law Firm',
    story: "Titans drilled ID and verification, proof of address nuance, and source of funds and wealth. Lumi reviewed my checklist and interview answers until they were crisp. I joined a top 50 UK law firm as an Onboarding Analyst. The panel liked that I spoke in plain English and could reference policy sections when needed. The job ready checklist kept me honest. CV done, two mocks, capstone submitted, and five good applications every week.",
    image: '/placeholder.svg',
    mentor: 'Lumi'
  },
  {
    id: 17,
    name: 'Success Story',
    role: 'Data Technician',
    previousRole: 'Cleaner',
    track: 'data',
    company: 'Energy Services',
    story: "I started as a cleaner for an energy contractor. With Tobi I learned Excel Power Query, basic SQL, and deployment steps for Power BI. My capstone focused on anomaly detection for meter readings and produced a small guide for analysts. I am now a Data Technician supporting the analytics team. The insistence on versioned files and a tidy README stopped me from wasting time. Clear process, clear outputs, and predictable results.",
    image: '/placeholder.svg',
    mentor: 'Tobi'
  },
  {
    id: 18,
    name: 'UK Migration Success',
    role: 'KYC Analyst',
    previousRole: 'Warehouse Worker',
    track: 'aml-kyc',
    company: 'Oil & Gas Services (Shell Supplier)',
    story: "I moved to the UK and worked warehouse shifts while I studied. Titans taught KYB for complex corporate structures, UBO logic, and sanctions exposure analysis. Lumi helped me present a high risk onboarding case with a short decision table, a policy reference, and clean evidence. I joined an oil and gas services company that supplies Shell as a KYC Analyst. The interview portfolio sealed it. Preparation beat nerves and showed them I could deliver.",
    image: '/placeholder.svg',
    mentor: 'Lumi'
  },
  {
    id: 19,
    name: 'Success Story',
    role: 'Junior Data Analyst',
    previousRole: 'Cab Driver',
    track: 'data',
    company: 'Professional Services Firm',
    story: "Between rides I practiced SQL on Titans datasets. Tobi pushed me to trim visuals, label clearly, and add a short actions slide. My capstone tracked marketing lead quality and conversion. I joined a professional services firm as a Junior Data Analyst. I deliver weekly performance packs and short insight notes. The structure let me speak with confidence and avoid jargon. I now feel like a problem solver, not just a dashboard builder.",
    image: '/placeholder.svg',
    mentor: 'Tobi'
  },
  {
    id: 20,
    name: 'Success Story',
    role: 'AML Quality Assurance Analyst',
    previousRole: 'Receptionist',
    track: 'aml-kyc',
    company: 'Motor Finance Company',
    story: "I greeted clients and booked rooms, then studied AML. Titans taught evidence standards, calibration, and how to give constructive feedback that helps analysts. Lumi trained me to write brief comments that link issues to policy and risk. I now work in AML Quality Assurance at a motor finance company. I score case files and coach juniors to improve clarity. The focus on consistent rationales turned review meetings into learning, not blame.",
    image: '/placeholder.svg',
    mentor: 'Lumi'
  }
];
