import { storage } from "./storage";
import type { InsertEvent, InsertTicketType } from "@shared/schema";

const ORGANIZER_ID = "organizer-1";

const seedEvents: Array<{
  event: InsertEvent;
  ticketTypes: Omit<InsertTicketType, "eventId">[];
}> = [
  {
    event: {
      title: "Summer Music Festival 2024",
      description: "Experience the biggest music festival of the year featuring top artists from around the world. Three days of non-stop music, food, and entertainment in a stunning outdoor venue.",
      category: "Music",
      date: new Date("2024-07-15T18:00:00"),
      venue: "Central Park Amphitheater",
      location: "New York, NY",
      imageUrl: "/assets/generated_images/Concert_festival_crowd_image_7174c499.png",
      organizerId: ORGANIZER_ID,
    },
    ticketTypes: [
      {
        name: "General Admission",
        description: "Standard entry with access to all stages",
        price: 12000,
        totalQuantity: 500,
        availableQuantity: 500,
      },
      {
        name: "VIP Pass",
        description: "Premium access with exclusive lounge and backstage tours",
        price: 35000,
        totalQuantity: 100,
        availableQuantity: 100,
      },
      {
        name: "Early Bird",
        description: "Discounted early bird tickets",
        price: 9500,
        totalQuantity: 200,
        availableQuantity: 200,
      },
    ],
  },
  {
    event: {
      title: "NBA Finals Game 5",
      description: "Watch the championship series live! Don't miss the action as the top teams compete for the title in this thrilling game.",
      category: "Sports",
      date: new Date("2024-06-20T19:30:00"),
      venue: "Madison Square Garden",
      location: "New York, NY",
      imageUrl: "/assets/generated_images/Sports_stadium_venue_image_ab925d88.png",
      organizerId: ORGANIZER_ID,
    },
    ticketTypes: [
      {
        name: "Upper Bowl",
        description: "Seats in the upper level",
        price: 15000,
        totalQuantity: 300,
        availableQuantity: 300,
      },
      {
        name: "Lower Bowl",
        description: "Seats in the lower level",
        price: 30000,
        totalQuantity: 150,
        availableQuantity: 150,
      },
      {
        name: "Courtside",
        description: "Premium courtside seats",
        price: 75000,
        totalQuantity: 50,
        availableQuantity: 50,
      },
    ],
  },
  {
    event: {
      title: "Hamilton - Broadway Musical",
      description: "The story of America's Founding Father Alexander Hamilton, an immigrant from the West Indies who became George Washington's right-hand man during the Revolutionary War.",
      category: "Theater",
      date: new Date("2024-06-01T20:00:00"),
      venue: "Richard Rodgers Theatre",
      location: "New York, NY",
      imageUrl: "/assets/generated_images/Theater_venue_image_7743119b.png",
      organizerId: ORGANIZER_ID,
    },
    ticketTypes: [
      {
        name: "Orchestra",
        description: "Best seats in the house",
        price: 25000,
        totalQuantity: 100,
        availableQuantity: 100,
      },
      {
        name: "Mezzanine",
        description: "Elevated view seats",
        price: 18000,
        totalQuantity: 150,
        availableQuantity: 150,
      },
      {
        name: "Balcony",
        description: "Upper level seats",
        price: 12000,
        totalQuantity: 200,
        availableQuantity: 200,
      },
    ],
  },
  {
    event: {
      title: "Tech Innovation Summit 2024",
      description: "Join industry leaders and innovators for a day of inspiring talks, networking, and workshops on the latest in AI, blockchain, and emerging technologies.",
      category: "Conference",
      date: new Date("2024-08-10T09:00:00"),
      venue: "Javits Center",
      location: "New York, NY",
      imageUrl: "/assets/generated_images/Conference_event_image_f757b42c.png",
      organizerId: ORGANIZER_ID,
    },
    ticketTypes: [
      {
        name: "Standard Pass",
        description: "Access to all keynotes and expo hall",
        price: 29900,
        totalQuantity: 400,
        availableQuantity: 400,
      },
      {
        name: "Premium Pass",
        description: "Includes workshops and networking dinner",
        price: 49900,
        totalQuantity: 150,
        availableQuantity: 150,
      },
    ],
  },
  {
    event: {
      title: "Comedy Night with Dave Chappelle",
      description: "An evening of stand-up comedy featuring the legendary Dave Chappelle. Get ready for a night of laughter you won't forget!",
      category: "Comedy",
      date: new Date("2024-07-05T20:00:00"),
      venue: "Comedy Cellar",
      location: "New York, NY",
      imageUrl: "/assets/generated_images/Theater_venue_image_7743119b.png",
      organizerId: ORGANIZER_ID,
    },
    ticketTypes: [
      {
        name: "General Seating",
        description: "First come, first served seating",
        price: 8500,
        totalQuantity: 200,
        availableQuantity: 200,
      },
      {
        name: "Reserved Table",
        description: "Reserved table for 4 people",
        price: 15000,
        totalQuantity: 40,
        availableQuantity: 40,
      },
    ],
  },
  {
    event: {
      title: "Modern Art Exhibition Opening",
      description: "Exclusive opening night of contemporary art featuring works from renowned artists. Includes wine reception and artist meet-and-greet.",
      category: "Arts",
      date: new Date("2024-06-25T18:00:00"),
      venue: "MoMA",
      location: "New York, NY",
      imageUrl: "/assets/generated_images/Theater_venue_image_7743119b.png",
      organizerId: ORGANIZER_ID,
    },
    ticketTypes: [
      {
        name: "General Admission",
        description: "Exhibition access and wine reception",
        price: 5000,
        totalQuantity: 300,
        availableQuantity: 300,
      },
      {
        name: "VIP Experience",
        description: "Includes artist meet-and-greet and private tour",
        price: 15000,
        totalQuantity: 50,
        availableQuantity: 50,
      },
    ],
  },
];

export async function seedDatabase() {
  const existingEvents = await storage.getEvents();
  
  if (existingEvents.length > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }

  console.log("Seeding database with initial events...");

  for (const { event, ticketTypes } of seedEvents) {
    const createdEvent = await storage.createEvent(event);
    
    for (const ticketType of ticketTypes) {
      await storage.createTicketType({
        ...ticketType,
        eventId: createdEvent.id,
      });
    }
  }

  console.log("Database seeded successfully!");
}
