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
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      quote: 'From night shifts to 9-5 office job. I never thought I could do this.',
      course: 'AML/KYC',
      time: '7 months',
      salaryIncrease: '+85%'
    },
    {
      name: 'Priya S.',
      before: 'Retail Manager',
      after: 'Data Analyst',
      salary: '£52k',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
      quote: 'Titans gave me the skills and confidence to change industries completely.',
      course: 'Data Analysis',
      time: '8 months',
      salaryIncrease: '+120%'
    },
    {
      name: 'James K.',
      before: 'Hospitality',
      after: 'Business Analyst',
      salary: '£45k',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
      quote: 'No UK experience, no problem. The support was incredible.',
      course: 'Business Analysis',
      time: '9 months',
      salaryIncrease: '+95%'
    }
  ];

  return (
    <section className="py-16 md:py-24 lg:py-32 bg-tc-navy/[0.02]">
      <div className="container max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <Badge className="bg-accent/10 text-accent border-accent/30 font-sans font-semibold">
            <Award className="w-3 h-3 mr-2" />
            REAL TRANSFORMATIONS
          </Badge>
          
          <h2 className="font-kanit text-4xl md:text-5xl font-bold text-primary">
            Their Stories Could Be <span className="text-accent">Your Story</span>
          </h2>
          
          <p className="font-sans text-xl text-muted-foreground max-w-3xl mx-auto">
            From retail, hospitality, and warehouse roles to £45k-£70k professional careers
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {stories.map((story, index) => (
            <Card 
              key={index} 
              className="group hover-lift border border-border/50 shadow-lg hover:shadow-2xl hover:border-tc-amber/30 transition-all duration-400"
            >
              <CardContent className="p-0">
                {/* Image Section */}
                <div className="relative h-64 overflow-hidden rounded-t-xl bg-gradient-to-br from-primary to-primary-glow">
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
                      <div className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center">
                        <span className="text-4xl font-kanit font-bold text-primary-foreground">
                          {story.name.charAt(0)}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Salary & Increase Badge */}
                  <div className="absolute top-4 right-4 space-y-2">
                    <div className="bg-accent text-accent-foreground px-4 py-2 rounded-full font-kanit font-bold text-lg shadow-lg">
                      {story.salary}
                    </div>
                    <div className="bg-background/95 text-foreground px-3 py-1 rounded-full font-sans font-semibold text-sm shadow-md flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-accent" />
                      {story.salaryIncrease}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {/* Stars */}
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="font-sans text-foreground/90 leading-relaxed text-base italic">
                    "{story.quote}"
                  </p>

                  {/* Transformation */}
                  <div className="space-y-2 pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <span className="font-sans text-sm text-muted-foreground">From:</span>
                      <span className="font-sans font-semibold text-foreground">{story.before}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-accent" />
                      <span className="font-sans text-sm text-muted-foreground">To:</span>
                      <span className="font-kanit font-bold text-accent text-lg">{story.after}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Badge variant="outline" className="border-border font-sans">
                        {story.course}
                      </Badge>
                      <span className="font-sans text-sm text-muted-foreground">• {story.time}</span>
                    </div>
                  </div>

                  {/* Name */}
                  <p className="font-sans font-bold text-primary pt-2">
                    - {story.name}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="font-sans text-lg text-muted-foreground mb-4">
            Join 300+ career switchers who've made the leap
          </p>
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/30 rounded-full px-6 py-3">
            <Star className="h-5 w-5 fill-accent text-accent" />
            <span className="font-sans font-bold text-primary">4.8/5 from 200+ reviews</span>
          </div>
        </div>
      </div>
    </section>
  );
}
