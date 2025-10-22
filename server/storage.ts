import {
  type Event,
  type InsertEvent,
  type TicketType,
  type InsertTicketType,
  type Seat,
  type InsertSeat,
  type Booking,
  type InsertBooking,
  type BookingItem,
  type InsertBookingItem,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Events
  getEvents(): Promise<Event[]>;
  getEvent(id: string): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  deleteEvent(id: string): Promise<void>;

  // Ticket Types
  getTicketTypesByEvent(eventId: string): Promise<TicketType[]>;
  getTicketType(id: string): Promise<TicketType | undefined>;
  createTicketType(ticketType: InsertTicketType): Promise<TicketType>;
  updateTicketTypeAvailability(id: string, availableQuantity: number): Promise<void>;

  // Seats
  getSeatsByEvent(eventId: string): Promise<Seat[]>;
  getSeat(id: string): Promise<Seat | undefined>;
  createSeat(seat: InsertSeat): Promise<Seat>;
  updateSeatAvailability(id: string, isAvailable: boolean): Promise<void>;

  // Bookings
  getBookings(): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingPaymentStatus(id: string, status: string, paymentIntentId?: string): Promise<void>;

  // Booking Items
  getBookingItems(bookingId: string): Promise<BookingItem[]>;
  createBookingItem(item: InsertBookingItem): Promise<BookingItem>;
}

export class MemStorage implements IStorage {
  private events: Map<string, Event>;
  private ticketTypes: Map<string, TicketType>;
  private seats: Map<string, Seat>;
  private bookings: Map<string, Booking>;
  private bookingItems: Map<string, BookingItem>;

  constructor() {
    this.events = new Map();
    this.ticketTypes = new Map();
    this.seats = new Map();
    this.bookings = new Map();
    this.bookingItems = new Map();
  }

  // Events
  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async getEvent(id: string): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = randomUUID();
    const event: Event = { ...insertEvent, id };
    this.events.set(id, event);
    return event;
  }

  async deleteEvent(id: string): Promise<void> {
    this.events.delete(id);
    Array.from(this.ticketTypes.values())
      .filter((tt) => tt.eventId === id)
      .forEach((tt) => this.ticketTypes.delete(tt.id));
    Array.from(this.seats.values())
      .filter((s) => s.eventId === id)
      .forEach((s) => this.seats.delete(s.id));
  }

  // Ticket Types
  async getTicketTypesByEvent(eventId: string): Promise<TicketType[]> {
    return Array.from(this.ticketTypes.values()).filter((tt) => tt.eventId === eventId);
  }

  async getTicketType(id: string): Promise<TicketType | undefined> {
    return this.ticketTypes.get(id);
  }

  async createTicketType(insertTicketType: InsertTicketType): Promise<TicketType> {
    const id = randomUUID();
    const ticketType: TicketType = { ...insertTicketType, id };
    this.ticketTypes.set(id, ticketType);
    return ticketType;
  }

  async updateTicketTypeAvailability(id: string, availableQuantity: number): Promise<void> {
    const ticketType = this.ticketTypes.get(id);
    if (ticketType) {
      this.ticketTypes.set(id, { ...ticketType, availableQuantity });
    }
  }

  // Seats
  async getSeatsByEvent(eventId: string): Promise<Seat[]> {
    return Array.from(this.seats.values()).filter((s) => s.eventId === eventId);
  }

  async getSeat(id: string): Promise<Seat | undefined> {
    return this.seats.get(id);
  }

  async createSeat(insertSeat: InsertSeat): Promise<Seat> {
    const id = randomUUID();
    const seat: Seat = { ...insertSeat, id };
    this.seats.set(id, seat);
    return seat;
  }

  async updateSeatAvailability(id: string, isAvailable: boolean): Promise<void> {
    const seat = this.seats.get(id);
    if (seat) {
      this.seats.set(id, { ...seat, isAvailable });
    }
  }

  // Bookings
  async getBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = randomUUID();
    const booking: Booking = {
      ...insertBooking,
      id,
      createdAt: new Date(),
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async updateBookingPaymentStatus(
    id: string,
    status: string,
    paymentIntentId?: string
  ): Promise<void> {
    const booking = this.bookings.get(id);
    if (booking) {
      this.bookings.set(id, {
        ...booking,
        paymentStatus: status,
        paymentIntentId,
      });
    }
  }

  // Booking Items
  async getBookingItems(bookingId: string): Promise<BookingItem[]> {
    return Array.from(this.bookingItems.values()).filter((bi) => bi.bookingId === bookingId);
  }

  async createBookingItem(insertBookingItem: InsertBookingItem): Promise<BookingItem> {
    const id = randomUUID();
    const bookingItem: BookingItem = { ...insertBookingItem, id };
    this.bookingItems.set(id, bookingItem);
    return bookingItem;
  }
}

export const storage = new MemStorage();
