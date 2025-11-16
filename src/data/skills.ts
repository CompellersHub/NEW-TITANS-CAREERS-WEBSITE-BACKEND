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
  
  // AI & Productivity
  { name: 'ChatGPT', category: 'AI & Productivity', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/openai.svg', brandColor: '#10A37F', description: 'AI-powered conversational assistant' },
  { name: 'Microsoft Copilot', category: 'AI & Productivity', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/microsoftcopilot.svg', brandColor: '#0078D4', description: 'AI assistant for Microsoft 365' },
  { name: 'Notion', category: 'AI & Productivity', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/notion.svg', brandColor: '#000000', description: 'All-in-one workspace and documentation' },
  { name: 'Gemini', category: 'AI & Productivity', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/googlegemini.svg', brandColor: '#4285F4', description: 'Google AI assistant' },
  { name: 'Claude', category: 'AI & Productivity', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/anthropic.svg', brandColor: '#191919', description: 'Advanced AI assistant by Anthropic' },
  
  // Project Management
  { name: 'Asana', category: 'Project Management', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/asana.svg', brandColor: '#F06A6A', description: 'Work management and task tracking' },
  { name: 'Monday.com', category: 'Project Management', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/monday.svg', brandColor: '#FF3D57', description: 'Work operating system' },
  { name: 'ClickUp', category: 'Project Management', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/clickup.svg', brandColor: '#7B68EE', description: 'All-in-one productivity platform' },
  { name: 'Airtable', category: 'Project Management', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/airtable.svg', brandColor: '#18BFFF', description: 'Spreadsheet-database hybrid' },
  
  // Design & Collaboration
  { name: 'Figma', category: 'Design', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/figma.svg', brandColor: '#F24E1E', description: 'Collaborative design tool' },
  { name: 'Miro', category: 'Design', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/miro.svg', brandColor: '#050038', description: 'Online whiteboard for collaboration' },
  { name: 'Canva', category: 'Design', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/canva.svg', brandColor: '#00C4CC', description: 'Graphic design platform' },
  { name: 'Adobe XD', category: 'Design', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/adobexd.svg', brandColor: '#FF61F6', description: 'UI/UX design and prototyping' },
  { name: 'Sketch', category: 'Design', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/sketch.svg', brandColor: '#F7B500', description: 'Digital design toolkit' },
  
  // Development & DevOps
  { name: 'Git', category: 'Development', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/git.svg', brandColor: '#F05032', description: 'Version control system' },
  { name: 'GitHub', category: 'Development', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/github.svg', brandColor: '#181717', description: 'Code hosting and collaboration' },
  { name: 'Docker', category: 'DevOps', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/docker.svg', brandColor: '#2496ED', description: 'Container platform' },
  { name: 'VS Code', category: 'Development', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/visualstudiocode.svg', brandColor: '#007ACC', description: 'Code editor' },
  { name: 'Jenkins', category: 'DevOps', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/jenkins.svg', brandColor: '#D24939', description: 'Automation server' },
  
  // CRM & Marketing
  { name: 'Salesforce', category: 'CRM', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/salesforce.svg', brandColor: '#00A1E0', description: 'Customer relationship management' },
  { name: 'HubSpot', category: 'Marketing', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/hubspot.svg', brandColor: '#FF7A59', description: 'Inbound marketing and sales' },
  { name: 'Google Analytics', category: 'Marketing', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/googleanalytics.svg', brandColor: '#E37400', description: 'Web analytics service' },
  { name: 'Mailchimp', category: 'Marketing', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/mailchimp.svg', brandColor: '#FFE01B', description: 'Email marketing platform' },
  
  // Communication
  { name: 'Zoom', category: 'Communication', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/zoom.svg', brandColor: '#2D8CFF', description: 'Video conferencing platform' },
  { name: 'Microsoft Outlook', category: 'Communication', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/microsoftoutlook.svg', brandColor: '#0078D4', description: 'Email and calendar client' },
  { name: 'Google Meet', category: 'Communication', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/googlemeet.svg', brandColor: '#00897B', description: 'Video conferencing by Google' },
  
  // Automation
  { name: 'Zapier', category: 'Automation', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/zapier.svg', brandColor: '#FF4A00', description: 'Workflow automation platform' },
  { name: 'Power Automate', category: 'Automation', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/powerautomate.svg', brandColor: '#0066FF', description: 'Microsoft workflow automation' },
];
