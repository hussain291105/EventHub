import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus, Calendar, DollarSign, Users, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import type { Event, TicketType, InsertEvent, InsertTicketType } from "@shared/schema";
import concertImage from "@assets/generated_images/Concert_festival_crowd_image_7174c499.png";
import sportsImage from "@assets/generated_images/Sports_stadium_venue_image_ab925d88.png";
import theaterImage from "@assets/generated_images/Theater_venue_image_7743119b.png";
import conferenceImage from "@assets/generated_images/Conference_event_image_f757b42c.png";

const categoryImages: Record<string, string> = {
  Music: concertImage,
  Sports: sportsImage,
  Theater: theaterImage,
  Conference: conferenceImage,
  Comedy: theaterImage,
  Arts: theaterImage,
};

export default function Organizer() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [eventForm, setEventForm] = useState<Partial<InsertEvent>>({
    category: "Music",
  });
  const [ticketTypesForm, setTicketTypesForm] = useState<Partial<InsertTicketType>[]>([
    { name: "General Admission", description: "Standard entry", price: 5000, totalQuantity: 100 },
  ]);

  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: { event: InsertEvent; ticketTypes: Omit<InsertTicketType, "eventId">[] }) => {
      const response = await apiRequest("POST", "/api/events", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Success",
        description: "Event created successfully",
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error('Event creation error:', error);
      let errorMessage = "Failed to create event";
      
      if (error?.data) {
        if (error.data.errors) {
          errorMessage = `Validation failed: ${error.data.errors.map((e: any) => e.message).join(', ')}`;
        } else if (error.data.message) {
          errorMessage = error.data.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      await apiRequest("DELETE", `/api/events/${eventId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
    },
  });

  const resetForm = () => {
    setEventForm({ category: "Music" });
    setTicketTypesForm([
      { name: "General Admission", description: "Standard entry", price: 5000, totalQuantity: 100 },
    ]);
  };

  const handleAddTicketType = () => {
    setTicketTypesForm([
      ...ticketTypesForm,
      { name: "", description: "", price: 0, totalQuantity: 0 },
    ]);
  };

  const handleRemoveTicketType = (index: number) => {
    setTicketTypesForm(ticketTypesForm.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    // Basic validation
    if (!eventForm.title || !eventForm.description || !eventForm.venue || !eventForm.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields: title, description, venue, location",
        variant: "destructive",
      });
      return;
    }

    const validTicketTypes = ticketTypesForm.filter(
      (tt) => tt.name && tt.description && tt.price && tt.totalQuantity
    );

    if (validTicketTypes.length === 0) {
      toast({
        title: "Missing Ticket Types",
        description: "Please add at least one complete ticket type",
        variant: "destructive",
      });
      return;
    }

    const imageUrl = categoryImages[eventForm.category || "Music"] || concertImage;

    // Prepare event data for mock storage
    const eventData = {
      title: eventForm.title,
      description: eventForm.description,
      category: eventForm.category || "Music",
      date: eventForm.date || new Date(),
      venue: eventForm.venue,
      location: eventForm.location,
      imageUrl,
      organizerId: "organizer-1",
    };

    const ticketTypesData = validTicketTypes.map((tt) => ({
      name: tt.name!,
      description: tt.description!,
      price: tt.price!,
      totalQuantity: tt.totalQuantity!,
      availableQuantity: tt.totalQuantity!,
    }));

    console.log('Submitting event:', { event: eventData, ticketTypes: ticketTypesData });

    createEventMutation.mutate({
      event: eventData,
      ticketTypes: ticketTypesData,
    });
  };

  const myEvents = events.filter((e) => e.organizerId === "organizer-1");

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Organizer Dashboard</h1>
            <p className="text-muted-foreground">Manage your events and ticket sales</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-event">
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new event
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={eventForm.title || ""}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    placeholder="Summer Music Festival 2024"
                    data-testid="input-event-title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={eventForm.description || ""}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    placeholder="Describe your event..."
                    rows={4}
                    data-testid="input-event-description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={eventForm.category}
                      onValueChange={(value) => setEventForm({ ...eventForm, category: value })}
                    >
                      <SelectTrigger id="category" data-testid="select-event-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Music">Music</SelectItem>
                        <SelectItem value="Sports">Sports</SelectItem>
                        <SelectItem value="Theater">Theater</SelectItem>
                        <SelectItem value="Conference">Conference</SelectItem>
                        <SelectItem value="Comedy">Comedy</SelectItem>
                        <SelectItem value="Arts">Arts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Date & Time *</Label>
                    <Input
                      id="date"
                      type="datetime-local"
                      value={eventForm.date ? new Date(eventForm.date).toISOString().slice(0, 16) : ""}
                      onChange={(e) => {
                        const dateValue = e.target.value ? new Date(e.target.value) : undefined;
                        setEventForm({ ...eventForm, date: dateValue });
                      }}
                      data-testid="input-event-date"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="venue">Venue *</Label>
                    <Input
                      id="venue"
                      value={eventForm.venue || ""}
                      onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                      placeholder="Please enter the venue......"
                      data-testid="input-event-venue"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={eventForm.location || ""}
                      onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                      placeholder="New York, NY"
                      data-testid="input-event-location"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Ticket Types *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddTicketType}
                      data-testid="button-add-ticket-type"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Ticket Type
                    </Button>
                  </div>

                  {ticketTypesForm.map((tt, index) => (
                    <Card key={index} className="p-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">Ticket Type {index + 1}</h4>
                          {ticketTypesForm.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveTicketType(index)}
                              data-testid={`button-remove-ticket-type-${index}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Name *</Label>
                            <Input
                              value={tt.name || ""}
                              onChange={(e) => {
                                const updated = [...ticketTypesForm];
                                updated[index] = { ...updated[index], name: e.target.value };
                                setTicketTypesForm(updated);
                              }}
                              placeholder="VIP, General, etc."
                              data-testid={`input-ticket-name-${index}`}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Price *</Label>
                            <Input
                              type="number"
                              value={tt.price ? tt.price / 100 : ""}
                              onChange={(e) => {
                                const updated = [...ticketTypesForm];
                                updated[index] = { ...updated[index], price: Math.round(parseFloat(e.target.value) * 100) };
                                setTicketTypesForm(updated);
                              }}
                              placeholder="50.00"
                              step="0.01"
                              data-testid={`input-ticket-price-${index}`}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Description *</Label>
                            <Input
                              value={tt.description || ""}
                              onChange={(e) => {
                                const updated = [...ticketTypesForm];
                                updated[index] = { ...updated[index], description: e.target.value };
                                setTicketTypesForm(updated);
                              }}
                              placeholder="Brief description"
                              data-testid={`input-ticket-description-${index}`}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Quantity *</Label>
                            <Input
                              type="number"
                              value={tt.totalQuantity || ""}
                              onChange={(e) => {
                                const updated = [...ticketTypesForm];
                                updated[index] = { ...updated[index], totalQuantity: parseInt(e.target.value) };
                                setTicketTypesForm(updated);
                              }}
                              placeholder="100"
                              data-testid={`input-ticket-quantity-${index}`}
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createEventMutation.isPending}
                  data-testid="button-submit-event"
                >
                  {createEventMutation.isPending ? "Creating..." : "Create Event"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-3xl font-bold mt-2">{myEvents.length}</p>
              </div>
              <Calendar className="h-12 w-12 text-primary opacity-20" />
            </div>
          </Card>
        </div>

        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">My Events</h2>
            {myEvents.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                <h3 className="text-xl font-semibold mb-2">No events yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first event to get started
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myEvents.map((event) => (
                    <TableRow key={event.id} data-testid={`row-event-${event.id}`}>
                      <TableCell className="font-medium">{event.title}</TableCell>
                      <TableCell>{format(new Date(event.date), "PPP")}</TableCell>
                      <TableCell>{event.location}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{event.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteEventMutation.mutate(event.id)}
                          data-testid={`button-delete-${event.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
