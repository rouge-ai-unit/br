import {
  pgTable,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const Companies = pgTable("companyDetails", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyName: varchar("name").notNull(),
  companyWebsite: varchar("companyWebsite"),
  companyLinkedin: varchar("companyLinkedin"),
  region: varchar("region").notNull(),
  industryFocus: varchar("industryFocus").notNull(),
  offerings: varchar("offerings").notNull(),
  marketingPosition: varchar("marketingPosition").notNull(),
  potentialPainPoints: varchar("potentialPainPoints").notNull(),
  contactName: varchar("contactName").notNull(),
  contactPosition: varchar("contactPosition").notNull(),
  linkedin: varchar("linkedin").notNull(),
  contactEmail: varchar("contactEmail").notNull(),
});

export const companyNames = pgTable("companyNames", {
  companyName: varchar("companyName").notNull(),
});

