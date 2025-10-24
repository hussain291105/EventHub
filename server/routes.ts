import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import QRCode from "qrcode";

// Simple interfaces for mock storage
interface SimpleEvent {
  title: string;
  description: string;
  category: string;
  date: Date;
  venue: string;
  location: string;
  imageUrl: string;
  organizerId: string;
}

interface SimpleTicketType {
  eventId: string;
  name: string;
  description: string;
  price: number;
  totalQuantity: number;
  availableQuantity: number;
}

const ENABLE_MOCK_PAYMENTS = process.env.ENABLE_MOCK_PAYMENTS === 'true';

let stripe: Stripe | null = null;

if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
  try {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-09-30.clover",
    });
    console.log('Stripe initialized successfully');
  } catch (error) {
    console.warn('Failed to initialize Stripe:', error);
    if (!ENABLE_MOCK_PAYMENTS) {
      throw new Error('Stripe configuration failed and mock payments are disabled');
    }
  }
} else {
  console.warn('Stripe secret key not configured properly');
  if (!ENABLE_MOCK_PAYMENTS) {
    throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all events
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getEvents();
      console.log(`Returning ${events.length} events`);
      res.json(events);
    } catch (error: any) {
      console.error('Error fetching events:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get single event
  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create event with ticket types (simplified mock version)
  app.post("/api/events", async (req, res) => {
    try {
      console.log('Event creation request body:', JSON.stringify(req.body, null, 2));
      
      const { event: eventData, ticketTypes } = req.body;
      
      // Basic validation
      if (!eventData || !eventData.title || !eventData.description || !eventData.venue || !eventData.location) {
        return res.status(400).json({ message: "Missing required event fields: title, description, venue, location" });
      }
      
      if (!ticketTypes || !Array.isArray(ticketTypes) || ticketTypes.length === 0) {
        return res.status(400).json({ message: "At least one ticket type is required" });
      }
      
      // Create event with mock data approach - no strict validation
      const eventToCreate: SimpleEvent = {
        title: eventData.title,
        description: eventData.description,
        category: eventData.category || "Music",
        date: eventData.date ? (typeof eventData.date === 'string' ? new Date(eventData.date) : eventData.date) : new Date(),
        venue: eventData.venue,
        location: eventData.location,
        imageUrl: eventData.imageUrl || "/assets/generated_images/Concert_festival_crowd_image_7174c499.png",
        organizerId: eventData.organizerId || "organizer-1"
      };
      
      console.log('Creating event:', eventToCreate);
      const event = await storage.createEvent(eventToCreate as any);
      console.log('Event created successfully:', event.id);

      // Create ticket types
      for (const ticketTypeData of ticketTypes) {
        if (ticketTypeData.name && ticketTypeData.description && ticketTypeData.price && ticketTypeData.totalQuantity) {
          const ticketType: SimpleTicketType = {
            eventId: event.id,
            name: ticketTypeData.name,
            description: ticketTypeData.description,
            price: ticketTypeData.price,
            totalQuantity: ticketTypeData.totalQuantity,
            availableQuantity: ticketTypeData.availableQuantity || ticketTypeData.totalQuantity
          };
          
          await storage.createTicketType(ticketType as any);
          console.log('Ticket type created:', ticketType.name);
        }
      }

      res.json(event);
    } catch (error: any) {
      console.error('Event creation error:', error);
      res.status(500).json({ message: "Failed to create event: " + error.message });
    }
  });

  // Delete event
  app.delete("/api/events/:id", async (req, res) => {
    try {
      await storage.deleteEvent(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get ticket types for an event
  app.get("/api/events/:id/ticket-types", async (req, res) => {
    try {
      const ticketTypes = await storage.getTicketTypesByEvent(req.params.id);
      res.json(ticketTypes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get seats for an event
  app.get("/api/events/:id/seats", async (req, res) => {
    try {
      const seats = await storage.getSeatsByEvent(req.params.id);
      res.json(seats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create payment intent
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, customerEmail, customerName, cartItems } = req.body;

      // Validate required fields
      if (!amount || !customerEmail || !customerName || !cartItems || cartItems.length === 0) {
        return res.status(400).json({ 
          message: "Missing required fields: amount, customerEmail, customerName, or cartItems" 
        });
      }

      // Validate amount
      if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ 
          message: "Invalid amount. Amount must be a positive number." 
        });
      }

      let paymentIntent: any;
      let paymentIntentId: string;

      // Always use mock payments when ENABLE_MOCK_PAYMENTS is true
      if (ENABLE_MOCK_PAYMENTS) {
        // Mock payment for development
        paymentIntentId = `pi_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        paymentIntent = {
          id: paymentIntentId,
          client_secret: `${paymentIntentId}_secret_mock`,
          amount: Math.round(amount),
          currency: "inr",
          status: "requires_payment_method",
        };
        console.log('Created mock payment intent:', paymentIntentId);
      } else if (stripe) {
        // Use real Stripe only if mock payments are disabled
        paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount),
          currency: "inr",
          receipt_email: customerEmail,
          metadata: {
            customerName,
            cartItems: JSON.stringify(cartItems),
          },
        });
        paymentIntentId = paymentIntent.id;
      } else {
        throw new Error('No payment method available. Enable mock payments or configure Stripe.');
      }

      const qrCode = await QRCode.toDataURL(`BOOKING-${paymentIntentId}`);

      const booking = await storage.createBooking({
        eventId: cartItems[0]?.eventId || "unknown",
        customerName,
        customerEmail,
        totalAmount: amount,
        paymentStatus: "pending",
        paymentIntentId: paymentIntentId,
        qrCode,
      });

      for (const item of cartItems) {
        await storage.createBookingItem({
          bookingId: booking.id,
          ticketTypeId: item.ticketTypeId,
          seatId: item.seatId,
          quantity: item.quantity,
          price: item.price,
        });

        const ticketType = await storage.getTicketType(item.ticketTypeId);
        if (ticketType) {
          await storage.updateTicketTypeAvailability(
            item.ticketTypeId,
            ticketType.availableQuantity - item.quantity
          );
        }

        if (item.seatId) {
          await storage.updateSeatAvailability(item.seatId, false);
        }
      }

      res.json({ clientSecret: paymentIntent.client_secret, bookingId: booking.id });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Mock payment confirmation endpoint for development
  app.post("/api/confirm-mock-payment", async (req, res) => {
    try {
      const { paymentIntentId, paymentMethod, paymentDetails } = req.body;
      
      if (!ENABLE_MOCK_PAYMENTS) {
        return res.status(400).json({ message: "Mock payments are disabled" });
      }

      if (!paymentIntentId || !paymentIntentId.startsWith('pi_mock_')) {
        return res.status(400).json({ message: "Invalid mock payment intent ID" });
      }

      // Find booking by payment intent ID
      const bookings = await storage.getBookings();
      const booking = bookings.find(b => b.paymentIntentId === paymentIntentId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update booking status to completed
      await storage.updateBookingPaymentStatus(booking.id, "succeeded", paymentIntentId);

      console.log(`Mock payment processed successfully:`, {
        paymentIntentId,
        paymentMethod,
        bookingId: booking.id,
        amount: booking.totalAmount,
        paymentDetails: paymentMethod === 'card' ? 
          `Card ending in ${paymentDetails.last4}` : 
          `Bank: ${paymentDetails.bankName}`
      });

      res.json({ 
        success: true, 
        message: "Mock payment confirmed successfully",
        bookingId: booking.id,
        paymentMethod,
        transactionId: `txn_mock_${Date.now()}`,
        paymentDetails: paymentMethod === 'card' ? {
          type: 'card',
          last4: paymentDetails.last4,
          cardholderName: paymentDetails.cardholderName
        } : {
          type: 'bank',
          bankName: paymentDetails.bankName,
          accountLast4: paymentDetails.accountNumber
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error confirming mock payment: " + error.message });
    }
  });

  // Get all bookings with event and ticket details
  app.get("/api/bookings", async (req, res) => {
    try {
      const bookings = await storage.getBookings();
      console.log(`Found ${bookings.length} bookings:`, bookings.map(b => ({ id: b.id, status: b.paymentStatus, eventId: b.eventId })));
      
      // Only return successful bookings for the tickets page
      const successfulBookings = bookings.filter(booking => booking.paymentStatus === 'succeeded');
      console.log(`Filtered to ${successfulBookings.length} successful bookings`);
      
      const bookingsWithDetails = await Promise.all(
        successfulBookings.map(async (booking) => {
          const event = await storage.getEvent(booking.eventId);
          const items = await storage.getBookingItems(booking.id);
          
          if (!event) {
            console.warn(`Event not found for booking ${booking.id}, eventId: ${booking.eventId}`);
            return null;
          }
          
          const itemsWithTicketTypes = await Promise.all(
            items.map(async (item) => {
              const ticketType = await storage.getTicketType(item.ticketTypeId);
              return { ...item, ticketType };
            })
          );

          return {
            ...booking,
            event,
            items: itemsWithTicketTypes,
          };
        })
      );

      // Filter out null results
      const validBookings = bookingsWithDetails.filter(booking => booking !== null);
      console.log(`Returning ${validBookings.length} valid bookings with details`);

      res.json(validBookings);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Debug endpoint to check all bookings (development only)
  app.get("/api/debug/bookings", async (req, res) => {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(404).json({ message: "Not found" });
    }
    
    try {
      const bookings = await storage.getBookings();
      const events = await storage.getEvents();
      
      res.json({
        bookings,
        events: events.map(e => ({ id: e.id, title: e.title })),
        totalBookings: bookings.length,
        successfulBookings: bookings.filter(b => b.paymentStatus === 'succeeded').length
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
