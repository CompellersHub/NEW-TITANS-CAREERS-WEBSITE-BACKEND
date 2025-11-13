import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SuccessStory } from "@/data/successStories";

interface StoryCardProps {
  story: SuccessStory;
  index?: number;
  onShare?: () => void;
}

export function StoryCard({ story }: StoryCardProps) {
  return (
    <Card className="p-6 h-full flex flex-col">
      <div className="flex items-start gap-4 mb-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={story.image} alt={story.name} />
          <AvatarFallback className="font-kanit">{story.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-kanit font-bold text-lg text-primary">{story.name}</h3>
          <p className="font-sans text-sm text-muted-foreground">{story.role}</p>
          <Badge variant="secondary" className="mt-1 font-sans">{story.company}</Badge>
        </div>
      </div>
      
      <p className="font-sans text-muted-foreground italic mb-4 flex-grow">
        "{story.story}"
      </p>
      
      {(story.previousRole || story.salary) && (
        <div className="pt-4 border-t border-border space-y-1 text-sm font-sans">
          {story.previousRole && (
            <p className="text-muted-foreground">
              <span className="font-medium">Previous:</span> {story.previousRole}
            </p>
          )}
          {story.salary && (
            <p className="text-muted-foreground">
              <span className="font-medium">Salary:</span> {story.salary}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
