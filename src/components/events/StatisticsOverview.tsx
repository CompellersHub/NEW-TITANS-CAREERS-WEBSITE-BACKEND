import { TrendingUp, Users, Award, Briefcase } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function StatisticsOverview() {
  const stats = [
    {
      icon: TrendingUp,
      value: '£40K',
      label: 'Average Salary',
      description: 'Entry-level positions',
      color: 'text-tc-amber'
    },
    {
      icon: Briefcase,
      value: '45,500+',
      label: 'Job Openings',
      description: 'Across UK markets',
      color: 'text-tc-blue'
    },
    {
      icon: Users,
      value: '2,500+',
      label: 'Students Trained',
      description: 'Since 2020',
      color: 'text-tc-navy'
    },
    {
      icon: Award,
      value: '89%',
      label: 'Success Rate',
      description: 'Job placement within 6 months',
      color: 'text-tc-amber'
    }
  ];

  return (
    <div className="mb-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-tc-navy mb-3">Why Choose TITANS?</h2>
        <p className="text-tc-grey max-w-2xl mx-auto">
          Real results from real students launching successful careers in high-demand fields
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={index}
              className="p-6 text-center hover-lift animate-fade-in bg-gradient-to-br from-white to-tc-light-grey/30"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-tc-amber/10 rounded-2xl">
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </div>
              <p className="text-3xl font-bold text-tc-navy mb-1">{stat.value}</p>
              <p className="text-base font-semibold text-tc-navy mb-1">{stat.label}</p>
              <p className="text-sm text-tc-grey">{stat.description}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
