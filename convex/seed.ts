/**
 * Seed script to populate initial data
 * Run with: npx convex run seed:seedData
 */

import { mutation } from "./_generated/server";

export const seedData = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if data already exists
    const existingBrokers = await ctx.db.query("brokers").take(1);
    if (existingBrokers.length > 0) {
      return { message: "Data already seeded" };
    }

    // Create broker
    const brokerId = await ctx.db.insert("brokers", {
      name: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
      whatsappNumber: "+1234567890",
      active: true,
      createdAt: Date.now(),
    });

    // Create properties
    const property1 = await ctx.db.insert("properties", {
      brokerId,
      title: "Beautiful 3BR House",
      description: "Spacious family home with modern amenities, updated kitchen, large backyard",
      address: "123 Main St, Los Angeles, CA",
      price: 450000,
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 2000,
      propertyType: "house",
      status: "available",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const property2 = await ctx.db.insert("properties", {
      brokerId,
      title: "Downtown 2BR Condo",
      description: "Modern condo in the heart of downtown, walking distance to restaurants and shops",
      address: "456 Park Ave, Los Angeles, CA",
      price: 350000,
      bedrooms: 2,
      bathrooms: 2,
      squareFeet: 1200,
      propertyType: "condo",
      status: "available",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return {
      message: "Data seeded successfully",
      brokerId,
      propertyIds: [property1, property2],
    };
  },
});

