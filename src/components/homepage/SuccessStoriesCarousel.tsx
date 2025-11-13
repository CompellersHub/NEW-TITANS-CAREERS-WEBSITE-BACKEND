import { useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import AutoPlay from 'embla-carousel-autoplay';
import { successStories } from '@/data/successStories';
import { StoryCard } from '@/components/success/StoryCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export function SuccessStoriesCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      align: 'start',
      slidesToScroll: 1,
      breakpoints: {
        '(min-width: 768px)': { slidesToScroll: 2 },
        '(min-width: 1024px)': { slidesToScroll: 3 }
      }
    },
    [AutoPlay({ delay: 5000, stopOnInteraction: false })]
  );

  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit();
    }
  }, [emblaApi]);

  const handleShare = (story: typeof successStories[0]) => {
    const salaryText = story.salary ? ` at ${story.salary}` : '';
    const text = `Just read about ${story.name}'s career switch from ${story.previousRole} to ${story.role}${salaryText}. Inspiring! 🚀`;
    const url = `${window.location.origin}/success-stories`;
    
    if (navigator.share) {
      navigator.share({ title: `${story.name}'s Success Story`, text, url })
        .then(() => {
          toast({ title: "Story shared!", description: "Thank you for spreading inspiration." });
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text} ${url}`);
      toast({ title: "Link copied!", description: "Share this inspiring story with others." });
    }
  };

  return (
    <div className="w-full">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6">
          {successStories.slice(0, 10).map((story, index) => (
            <div 
              key={story.id} 
              className="flex-[0_0_100%] min-w-0 md:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
            >
              <StoryCard 
                story={story}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="text-center mt-8">
        <Link to="/success-stories">
          <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-sans font-semibold">
            View All Success Stories
          </Button>
        </Link>
      </div>
    </div>
  );
}
