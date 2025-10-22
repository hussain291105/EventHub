import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Events table
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  date: timestamp("date").notNull(),
  venue: text("venue").notNull(),
  location: text("location").notNull(),
  imageUrl: text("image_url").notNull(),
  organizerId: text("organizer_id").notNull(),
});

export const insertEventSchema = createInsertSchema(events).omit({ id: true });
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

// Ticket types table
export const ticketTypes = pgTable("ticket_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: text("event_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  totalQuantity: integer("total_quantity").notNull(),
  availableQuantity: integer("available_quantity").notNull(),
});

export const insertTicketTypeSchema = createInsertSchema(ticketTypes).omit({ id: true });
export type InsertTicketType = z.infer<typeof insertTicketTypeSchema>;
export type TicketType = typeof ticketTypes.$inferSelect;

// Seats table
export const seats = pgTable("seats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: text("event_id").notNull(),
  section: text("section").notNull(),
  row: text("row").notNull(),
  number: text("number").notNull(),
  ticketTypeId: text("ticket_type_id").notNull(),
  isAvailable: boolean("is_available").notNull().default(true),
});

export const insertSeatSchema = createInsertSchema(seats).omit({ id: true });
export type InsertSeat = z.infer<typeof insertSeatSchema>;
export type Seat = typeof seats.$inferSelect;

// Bookings table
export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: text("event_id").notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  totalAmount: integer("total_amount").notNull(),
  paymentStatus: text("payment_status").notNull(),
  paymentIntentId: text("payment_intent_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  qrCode: text("qr_code").notNull(),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, createdAt: true });
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

// Booking items (tickets) table
export const bookingItems = pgTable("booking_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: text("booking_id").notNull(),
  ticketTypeId: text("ticket_type_id").notNull(),
  seatId: text("seat_id"),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(),
});

export const insertBookingItemSchema = createInsertSchema(bookingItems).omit({ id: true });
export type InsertBookingItem = z.infer<typeof insertBookingItemSchema>;
export type BookingItem = typeof bookingItems.$inferSelect;
