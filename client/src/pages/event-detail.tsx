import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Calendar, MapPin, Users, ArrowLeft, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SeatSelector } from "@/components/seat-selector";
import { format } from "date-fns";
import type { Event, TicketType, Seat } from "@shared/schema";
import type { CartItem } from "@/components/shopping-cart";

interface EventDetailProps {
  onAddToCart: (item: CartItem) => void;
}

export default function EventDetail({ onAddToCart }: EventDetailProps) {
  const [, params] = useRoute("/event/:id");
  const [, setLocation] = useLocation();
  const eventId = params?.id;
  
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const { data: event, isLoading: eventLoading } = useQuery<Event>({
    queryKey: ["/api/events", eventId],
    enabled: !!eventId,
  });

  const { data: ticketTypes = [], isLoading: ticketsLoading } = useQuery<TicketType[]>({
    queryKey: ["/api/events", eventId, "ticket-types"],
    enabled: !!eventId,
  });

  const { data: seats = [] } = useQuery<Seat[]>({
    queryKey: ["/api/events", eventId, "seats"],
    enabled: !!eventId,
  });

  const handleQuantityChange = (ticketTypeId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[ticketTypeId] || 0;
      const newValue = Math.max(0, Math.min(10, current + delta));
      return { ...prev, [ticketTypeId]: newValue };
    });
  };

  const handleSeatToggle = (seatId: string) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    );
  };

  const handleAddToCart = () => {
    if (!event) return;

    Object.entries(quantities).forEach(([ticketTypeId, quantity]) => {
      if (quantity > 0) {
        const ticketType = ticketTypes.find((t) => t.id === ticketTypeId);
        if (ticketType) {
          onAddToCart({
            eventId: event.id,
            eventTitle: event.title,
            eventDate: format(new Date(event.date), "PPP"),
            eventVenue: event.venue,
            ticketTypeId: ticketType.id,
            ticketTypeName: ticketType.name,
            price: ticketType.price,
            quantity,
          });
        }
      }
    });

    selectedSeats.forEach((seatId) => {
      const seat = seats.find((s) => s.id === seatId);
      if (seat) {
        const ticketType = ticketTypes.find((t) => t.id === seat.ticketTypeId);
        if (ticketType) {
          onAddToCart({
            eventId: event.id,
            eventTitle: event.title,
            eventDate: format(new Date(event.date), "PPP"),
            eventVenue: event.venue,
            ticketTypeId: ticketType.id,
            ticketTypeName: ticketType.name,
            seatId: seat.id,
            seatLabel: `${seat.section} - Row ${seat.row} - Seat ${seat.number}`,
            price: ticketType.price,
            quantity: 1,
          });
        }
      }
    });

    setQuantities({});
    setSelectedSeats([]);
  };

  if (eventLoading || ticketsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-semibold mb-4">Event not found</h2>
        <Button onClick={() => setLocation("/")} data-testid="button-back-home">
          Back to Events
        </Button>
      </div>
    );
  }

  const totalItems = Object.values(quantities).reduce((sum, q) => sum + q, 0) + selectedSeats.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-96 overflow-hidden">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <Button
              variant="ghost"
              onClick={() => setLocation("/")}
              className="mb-4"
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Button>
            <Badge className="mb-4">{event.category}</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              {event.title}
            </h1>
            <div className="flex flex-wrap gap-4 text-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>{format(new Date(event.date), "PPP 'at' p")}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>{event.venue}, {event.location}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="details" data-testid="tab-details">Details</TabsTrigger>
                <TabsTrigger value="tickets" data-testid="tab-tickets">Tickets</TabsTrigger>
                {seats.length > 0 && (
                  <TabsTrigger value="seats" data-testid="tab-seats">Select Seats</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="details" className="mt-6 space-y-6">
                <Card className="p-6">
                  <h2 className="text-2xl font-semibold mb-4">About this event</h2>
                  <p className="text-muted-foreground leading-relaxed">{event.description}</p>
                </Card>

                <Card className="p-6">
                  <h2 className="text-2xl font-semibold mb-4">Venue Information</h2>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 mt-0.5 text-primary" />
                      <div>
                        <p className="font-medium">{event.venue}</p>
                        <p className="text-sm text-muted-foreground">{event.location}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="tickets" className="mt-6">
                <div className="space-y-4">
                  {ticketTypes.map((ticketType) => (
                    <Card key={ticketType.id} className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{ticketType.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {ticketType.description}
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            {ticketType.availableQuantity} of {ticketType.totalQuantity} available
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">₹{(ticketType.price / 100).toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleQuantityChange(ticketType.id, -1)}
                            disabled={!quantities[ticketType.id]}
                            data-testid={`button-decrease-${ticketType.id}`}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center font-medium" data-testid={`text-quantity-${ticketType.id}`}>
                            {quantities[ticketType.id] || 0}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleQuantityChange(ticketType.id, 1)}
                            disabled={ticketType.availableQuantity === 0}
                            data-testid={`button-increase-${ticketType.id}`}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {seats.length > 0 && (
                <TabsContent value="seats" className="mt-6">
                  <SeatSelector
                    seats={seats}
                    ticketTypes={ticketTypes}
                    selectedSeats={selectedSeats}
                    onSeatToggle={handleSeatToggle}
                  />
                </TabsContent>
              )}
            </Tabs>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
              <Separator className="mb-4" />
              
              <div className="space-y-4">
                {Object.entries(quantities).map(([ticketTypeId, quantity]) => {
                  if (quantity === 0) return null;
                  const ticketType = ticketTypes.find((t) => t.id === ticketTypeId);
                  if (!ticketType) return null;
                  
                  return (
                    <div key={ticketTypeId} className="flex justify-between text-sm">
                      <span>{ticketType.name} x {quantity}</span>
                      <span className="font-medium">
                        ₹{((ticketType.price * quantity) / 100).toFixed(2)}
                      </span>
                    </div>
                  );
                })}

                {selectedSeats.map((seatId) => {
                  const seat = seats.find((s) => s.id === seatId);
                  if (!seat) return null;
                  const ticketType = ticketTypes.find((t) => t.id === seat.ticketTypeId);
                  if (!ticketType) return null;

                  return (
                    <div key={seatId} className="flex justify-between text-sm">
                      <span className="line-clamp-1">
                        {seat.section} - Row {seat.row} - Seat {seat.number}
                      </span>
                      <span className="font-medium">
                        ₹{(ticketType.price / 100).toFixed(2)}
                      </span>
                    </div>
                  );
                })}

                {totalItems === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No tickets selected
                  </p>
                )}
              </div>

              {totalItems > 0 && (
                <>
                  <Separator className="my-4" />
                  <div className="flex justify-between font-semibold text-lg mb-4">
                    <span>Total</span>
                    <span data-testid="text-order-total">
                      ₹{(
                        (Object.entries(quantities).reduce((sum, [id, q]) => {
                          const tt = ticketTypes.find((t) => t.id === id);
                          return sum + (tt ? tt.price * q : 0);
                        }, 0) +
                        selectedSeats.reduce((sum, seatId) => {
                          const seat = seats.find((s) => s.id === seatId);
                          const tt = seat ? ticketTypes.find((t) => t.id === seat.ticketTypeId) : null;
                          return sum + (tt ? tt.price : 0);
                        }, 0)) / 100
                      ).toFixed(2)}
                    </span>
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleAddToCart}
                    data-testid="button-add-to-cart"
                  >
                    Add to Cart
                  </Button>
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
