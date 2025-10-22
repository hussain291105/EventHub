import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertEventSchema, insertTicketTypeSchema, insertBookingSchema } from "@shared/schema";
import QRCode from "qrcode";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all events
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error: any) {
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

  // Create event with ticket types
  app.post("/api/events", async (req, res) => {
    try {
      const { event: eventData, ticketTypes } = req.body;
      
      const validatedEvent = insertEventSchema.parse(eventData);
      const event = await storage.createEvent(validatedEvent);

      for (const ticketTypeData of ticketTypes) {
        const validatedTicketType = insertTicketTypeSchema.parse({
          ...ticketTypeData,
          eventId: event.id,
        });
        await storage.createTicketType(validatedTicketType);
      }

      res.json(event);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
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

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount),
        currency: "usd",
        receipt_email: customerEmail,
        metadata: {
          customerName,
          cartItems: JSON.stringify(cartItems),
        },
      });

      const qrCode = await QRCode.toDataURL(`BOOKING-${paymentIntent.id}`);

      const booking = await storage.createBooking({
        eventId: cartItems[0]?.eventId || "unknown",
        customerName,
        customerEmail,
        totalAmount: amount,
        paymentStatus: "pending",
        paymentIntentId: paymentIntent.id,
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

  // Get all bookings with event and ticket details
  app.get("/api/bookings", async (req, res) => {
    try {
      const bookings = await storage.getBookings();
      
      const bookingsWithDetails = await Promise.all(
        bookings.map(async (booking) => {
          const event = await storage.getEvent(booking.eventId);
          const items = await storage.getBookingItems(booking.id);
          
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

      res.json(bookingsWithDetails);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
