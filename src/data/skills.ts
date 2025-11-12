export interface Skill {
  name: string;
  category: string;
  logo: string;
  brandColor: string;
  description: string;
}

export const skills: Skill[] = [
  // Collaboration & Project Management
  { name: 'Jira', category: 'Collaboration', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/jira.svg', brandColor: '#0052CC', description: 'Project management and agile workflows' },
  { name: 'Confluence', category: 'Collaboration', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/confluence.svg', brandColor: '#172B4D', description: 'Team collaboration and documentation' },
  { name: 'Microsoft Teams', category: 'Collaboration', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/microsoftteams.svg', brandColor: '#6264A7', description: 'Enterprise communication platform' },
  { name: 'Slack', category: 'Collaboration', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/slack.svg', brandColor: '#4A154B', description: 'Team messaging and collaboration' },
  
  // Data Analysis & BI
  { name: 'Excel', category: 'Data Analysis', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/microsoftexcel.svg', brandColor: '#217346', description: 'Spreadsheet analysis and modeling' },
  { name: 'Tableau', category: 'Data Analysis', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/tableau.svg', brandColor: '#E97627', description: 'Visual analytics and dashboards' },
  { name: 'Power BI', category: 'Data Analysis', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/powerbi.svg', brandColor: '#F2C811', description: 'Business intelligence reporting' },
  { name: 'Python', category: 'Data Analysis', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/python.svg', brandColor: '#3776AB', description: 'Programming and data science' },
  { name: 'SQL', category: 'Data Analysis', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/mysql.svg', brandColor: '#4479A1', description: 'Database querying and management' },
  { name: 'R', category: 'Data Analysis', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/r.svg', brandColor: '#276DC3', description: 'Statistical computing and graphics' },
  
  // AML/KYC Tools
  { name: 'Name Screening', category: 'AML/KYC', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/searchcode.svg', brandColor: '#00A3E0', description: 'Identity verification and screening' },
  { name: 'PEP Screening', category: 'AML/KYC', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/iconify.svg', brandColor: '#7C3AED', description: 'Politically exposed persons checks' },
  { name: 'Transaction Monitoring', category: 'AML/KYC', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/googleanalytics.svg', brandColor: '#10B981', description: 'Financial activity monitoring' },
  { name: 'Sanctions Screening', category: 'AML/KYC', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/verified.svg', brandColor: '#F59E0B', description: 'Regulatory compliance screening' },
  
  // Cloud Platforms
  { name: 'AWS', category: 'Cloud', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/amazonwebservices.svg', brandColor: '#FF9900', description: 'Amazon cloud computing services' },
  { name: 'Azure', category: 'Cloud', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/microsoftazure.svg', brandColor: '#0078D4', description: 'Microsoft cloud platform' },
  { name: 'Google Cloud', category: 'Cloud', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/googlecloud.svg', brandColor: '#4285F4', description: 'Google cloud infrastructure' },
  
  // Business Analysis
  { name: 'Visio', category: 'Business Analysis', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/microsoftvisio.svg', brandColor: '#3955A3', description: 'Process mapping and diagrams' },
  { name: 'Lucidchart', category: 'Business Analysis', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/lucidchart.svg', brandColor: '#F96B00', description: 'Visual workspace for diagrams' },
  { name: 'User Story Mapping', category: 'Business Analysis', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/trello.svg', brandColor: '#00B388', description: 'Agile requirements gathering' },
  
  // Cybersecurity
  { name: 'Vulnerability Scanning', category: 'Cybersecurity', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/virustotal.svg', brandColor: '#00C176', description: 'Security vulnerability assessment' },
  { name: 'Penetration Testing', category: 'Cybersecurity', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/shieldsdotio.svg', brandColor: '#2596CD', description: 'Ethical hacking and security testing' },
  { name: 'SIEM Tools', category: 'Cybersecurity', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/splunk.svg', brandColor: '#1679A7', description: 'Security information and event management' },
];
