import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";
import type { Event } from "@shared/schema";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Link href={`/event/${event.id}`}>
      <a data-testid={`link-event-${event.id}`}>
        <Card className="overflow-hidden transition-all hover:shadow-xl hover:scale-[1.02] cursor-pointer group">
          <div className="relative aspect-video overflow-hidden">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              data-testid={`img-event-${event.id}`}
            />
            <Badge className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm text-foreground border-border">
              {event.category}
            </Badge>
          </div>
          
          <div className="p-4 space-y-3">
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors" data-testid={`text-event-title-${event.id}`}>
              {event.title}
            </h3>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span data-testid={`text-event-date-${event.id}`}>{format(new Date(event.date), "PPP 'at' p")}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="line-clamp-1" data-testid={`text-event-location-${event.id}`}>{event.venue}, {event.location}</span>
              </div>
            </div>
          </div>
        </Card>
      </a>
    </Link>
  );
}
