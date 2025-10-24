import { useQuery } from "@tanstack/react-query";
import { Calendar, MapPin, Download, Share2, Ticket as TicketIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, isPast } from "date-fns";
import type { Booking, Event, BookingItem, TicketType } from "@shared/schema";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

interface BookingWithDetails extends Booking {
  event?: Event;
  items?: (BookingItem & { ticketType?: TicketType })[];
}

export default function MyTickets() {
  const { data: bookings = [], isLoading } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/bookings"],
  });

  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});

  useEffect(() => {
    bookings.forEach(async (booking) => {
      if (!qrCodes[booking.id]) {
        try {
          const qrDataUrl = await QRCode.toDataURL(booking.qrCode, {
            width: 200,
            margin: 2,
          });
          setQrCodes((prev) => ({ ...prev, [booking.id]: qrDataUrl }));
        } catch (error) {
          console.error("Failed to generate QR code", error);
        }
      }
    });
  }, [bookings]);

  const upcomingBookings = bookings.filter(
    (b) => b.event && !isPast(new Date(b.event.date))
  );
  const pastBookings = bookings.filter(
    (b) => b.event && isPast(new Date(b.event.date))
  );

  const handleDownload = (booking: BookingWithDetails) => {
    const qrDataUrl = qrCodes[booking.id];
    if (qrDataUrl && booking.event) {
      const link = document.createElement("a");
      link.download = `ticket-${booking.event.title.replace(/\s+/g, "-")}.png`;
      link.href = qrDataUrl;
      link.click();
    }
  };

  const BookingCard = ({ booking }: { booking: BookingWithDetails }) => {
    if (!booking.event) return null;

    return (
      <Card className="overflow-hidden" data-testid={`card-booking-${booking.id}`}>
        <div className="grid md:grid-cols-3 gap-6 p-6">
          <div className="md:col-span-2 space-y-4">
            <div className="space-y-2">
              <Badge>{booking.event.category}</Badge>
              <h3 className="text-xl font-semibold" data-testid={`text-booking-title-${booking.id}`}>
                {booking.event.title}
              </h3>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(booking.event.date), "PPP 'at' p")}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{booking.event.venue}, {booking.event.location}</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Tickets:</p>
              {booking.items?.map((item, index) => (
                <div key={index} className="text-sm text-muted-foreground">
                  {item.ticketType?.name} x {item.quantity} - ₹{((item.price * item.quantity) / 100).toFixed(2)}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(booking)}
                data-testid={`button-download-${booking.id}`}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center space-y-4">
            {qrCodes[booking.id] ? (
              <>
                <img
                  src={qrCodes[booking.id]}
                  alt="Ticket QR Code"
                  className="w-48 h-48 border-2 border-border rounded-lg p-2"
                  data-testid={`img-qr-${booking.id}`}
                />
                <p className="text-xs text-muted-foreground text-center">
                  Scan this code at the event entrance
                </p>
              </>
            ) : (
              <div className="w-48 h-48 bg-muted rounded-lg animate-pulse"></div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl font-bold mb-8">My Tickets</h1>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList>
            <TabsTrigger value="upcoming" data-testid="tab-upcoming">
              Upcoming ({upcomingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="past" data-testid="tab-past">
              Past Events ({pastBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-6">
            {upcomingBookings.length === 0 ? (
              <div className="text-center py-16">
                <TicketIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                <h3 className="text-xl font-semibold mb-2">No upcoming events</h3>
                <p className="text-muted-foreground">
                  Book tickets to see them here
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {upcomingBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            {pastBookings.length === 0 ? (
              <div className="text-center py-16">
                <TicketIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                <h3 className="text-xl font-semibold mb-2">No past events</h3>
                <p className="text-muted-foreground">
                  Your attended events will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {pastBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
