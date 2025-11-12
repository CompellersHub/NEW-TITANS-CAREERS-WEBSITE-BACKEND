import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, Award } from 'lucide-react';

export function SuccessStoriesSection() {
  const stories = [
    {
      name: 'Michael A.',
      before: 'Warehouse Worker',
      after: 'AML Analyst',
      salary: '£48k',
      image: '/images/success-story-1.jpg',
      quote: 'From night shifts to 9-5 office job. I never thought I could do this.',
      course: 'AML/KYC',
      time: '7 months'
    },
    {
      name: 'Priya S.',
      before: 'Retail Manager',
      after: 'Data Analyst',
      salary: '£52k',
      image: '/images/success-story-2.jpg',
      quote: 'Titans gave me the skills and confidence to change industries completely.',
      course: 'Data Analysis',
      time: '8 months'
    },
    {
      name: 'James K.',
      before: 'Hospitality',
      after: 'Business Analyst',
      salary: '£45k',
      image: null,
      quote: 'No UK experience, no problem. The support was incredible.',
      course: 'Business Analysis',
      time: '9 months'
    }
  ];

  return (
    <section className="section-py bg-gradient-to-b from-white to-secondary/30">
      <div className="container max-w-7xl">
        <div className="text-center mb-16 space-y-4">
          <Badge className="bg-tc-amber/10 text-tc-navy border-tc-amber/30 font-semibold">
            <Award className="w-3 h-3 mr-2" />
            REAL TRANSFORMATIONS
          </Badge>
          
          <h2 className="text-4xl md:text-5xl font-bold text-tc-navy">
            Their Stories Could Be <span className="text-tc-amber">Your Story</span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From retail, hospitality, and warehouse roles to £45k-£70k professional careers
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {stories.map((story, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-tc-amber/50"
            >
              <CardContent className="p-0">
                {/* Image Section */}
                <div className="relative h-64 overflow-hidden rounded-t-xl bg-gradient-to-br from-tc-navy to-tc-blue">
                  {story.image ? (
                    <img 
                      src={story.image} 
                      alt={`${story.name} - Career transformation story`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="w-24 h-24 rounded-full bg-tc-amber/20 flex items-center justify-center">
                        <span className="text-4xl font-bold text-white">
                          {story.name.charAt(0)}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Salary Badge */}
                  <div className="absolute top-4 right-4 bg-tc-amber text-tc-navy px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                    {story.salary}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {/* Stars */}
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-tc-amber text-tc-amber" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-tc-navy/90 leading-relaxed text-base italic">
                    "{story.quote}"
                  </p>

                  {/* Transformation */}
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">From:</span>
                      <span className="font-semibold text-tc-navy">{story.before}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-tc-amber" />
                      <span className="text-sm text-muted-foreground">To:</span>
                      <span className="font-bold text-tc-amber text-lg">{story.after}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Badge variant="outline" className="border-tc-navy/20">
                        {story.course}
                      </Badge>
                      <span className="text-sm text-muted-foreground">• {story.time}</span>
                    </div>
                  </div>

                  {/* Name */}
                  <p className="font-bold text-tc-navy pt-2">
                    - {story.name}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-lg text-muted-foreground mb-4">
            Join 300+ career switchers who've made the leap
          </p>
          <div className="inline-flex items-center gap-2 bg-tc-amber/10 border border-tc-amber/30 rounded-full px-6 py-3">
            <Star className="h-5 w-5 fill-tc-amber text-tc-amber" />
            <span className="font-bold text-tc-navy">4.8/5 from 200+ reviews</span>
          </div>
        </div>
      </div>
    </section>
  );
}
