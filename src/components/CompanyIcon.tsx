import { Database, BarChart3, Shield, Lock, Network, Terminal, FileSearch, Award, CheckCircle, Briefcase, GitBranch, ShieldCheck, Key, Laptop, Target, Building2, Cloud, UserPlus, FileText, MessageSquare, Flame, AlertTriangle, UserCheck, ShieldAlert, Activity, PieChart, Sheet } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompanyIconProps {
  name: string;
  className?: string;
  showLabel?: boolean;
}

const iconMap: Record<string, { icon: React.ComponentType<{ className?: string }>, color: string, description: string }> = {
  // Compliance & Screening Tools
  'Sanction Screen': { icon: AlertTriangle, color: 'text-accent', description: 'Sanctions screening platform' },
  'PEP Screen': { icon: UserCheck, color: 'text-gold', description: 'Politically Exposed Persons screening' },
  'Financial Crime Screen': { icon: ShieldAlert, color: 'text-accent', description: 'Financial crime detection' },
  'WorldCheck': { icon: Shield, color: 'text-gold', description: 'Global sanctions & PEP screening' },
  'Dow Jones': { icon: FileSearch, color: 'text-slate-700', description: 'Risk & compliance intelligence' },
  'ComplyAdvantage': { icon: Shield, color: 'text-gold', description: 'AML screening & monitoring' },
  
  // Data & Analytics Tools
  'Excel': { icon: BarChart3, color: 'text-gold', description: 'Microsoft Excel spreadsheet software' },
  'SQL': { icon: Database, color: 'text-primary', description: 'Database query language' },
  'Power BI': { icon: BarChart3, color: 'text-amber-500', description: 'Microsoft business intelligence tool' },
  'Tableau': { icon: PieChart, color: 'text-orange-600', description: 'Data visualization platform' },
  'Google Sheets': { icon: Sheet, color: 'text-gold', description: 'Google Sheets spreadsheet' },
  'Python': { icon: Terminal, color: 'text-primary', description: 'Python programming language' },
  'R': { icon: BarChart3, color: 'text-primary', description: 'R statistical programming' },
  
  // Cybersecurity Tools
  'Wireshark': { icon: Network, color: 'text-primary', description: 'Network protocol analyzer' },
  'Kali Linux': { icon: Terminal, color: 'text-gold', description: 'Penetration testing platform' },
  'Metasploit': { icon: Terminal, color: 'text-accent', description: 'Exploitation framework' },
  'Nessus': { icon: FileSearch, color: 'text-orange-600', description: 'Vulnerability scanner' },
  'CompTIA Security+': { icon: Award, color: 'text-accent', description: 'Security certification' },
  'Security+': { icon: Award, color: 'text-accent', description: 'Security certification' },
  
  // Business Analysis Tools
  'JIRA': { icon: Target, color: 'text-primary', description: 'Atlassian project management' },
  'Confluence': { icon: GitBranch, color: 'text-primary', description: 'Team collaboration wiki' },
  'Visio': { icon: GitBranch, color: 'text-primary', description: 'Microsoft diagramming tool' },
  'MS Project': { icon: Briefcase, color: 'text-gold', description: 'Microsoft project management' },
  'Lucidchart': { icon: GitBranch, color: 'text-orange-500', description: 'Visual collaboration platform' },
  'Companies House': { icon: Building2, color: 'text-primary', description: 'UK company registry' },
  
  // Cloud & AI Tools
  'Azure': { icon: Cloud, color: 'text-primary', description: 'Microsoft Azure cloud platform' },
  'ChatGPT': { icon: MessageSquare, color: 'text-gold', description: 'AI chatbot assistant' },
  
  // TITANS Platforms
  'Titans Screen': { icon: Shield, color: 'text-orange-600', description: 'TITANS screening platform' },
  'Titans Monitor': { icon: Activity, color: 'text-orange-600', description: 'TITANS monitoring platform' },
  'Titans Onboarding': { icon: UserPlus, color: 'text-orange-600', description: 'TITANS onboarding platform' },
  'Blaze': { icon: Flame, color: 'text-orange-600', description: 'Blaze compliance platform' },
  
  // Office Suite
  'Word': { icon: FileText, color: 'text-primary', description: 'Microsoft Word' },
  'Microsoft Office': { icon: Briefcase, color: 'text-orange-700', description: 'Microsoft Office suite' },
  
  // Certifications
  'CPD Certified': { icon: Award, color: 'text-gold', description: 'Continuing Professional Development' },
  'ICO Registered': { icon: CheckCircle, color: 'text-navy', description: 'Information Commissioner\'s Office' },
  'UKRLP Listed': { icon: CheckCircle, color: 'text-navy', description: 'UK Register of Learning Providers' },
};

export const CompanyIcon = ({ name, className, showLabel = false }: CompanyIconProps) => {
  const iconData = iconMap[name];
  
  if (!iconData) {
    return (
      <div className={cn("flex items-center gap-2", className)} title={name}>
        <Laptop className="h-6 w-6 text-slate-500" />
        {showLabel && <span className="text-sm font-medium">{name}</span>}
      </div>
    );
  }
  
  const Icon = iconData.icon;
  
  return (
    <div 
      className={cn("flex items-center gap-2 group", className)} 
      title={iconData.description}
    >
      <Icon className={cn("h-6 w-6 transition-transform group-hover:scale-110", iconData.color)} />
      {showLabel && <span className="text-sm font-medium">{name}</span>}
    </div>
  );
};