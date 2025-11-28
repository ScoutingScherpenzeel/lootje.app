import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  text,
  AnyPgColumn,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth-schema";

/**
 * A group of participants for one “lootjes trekken” round.
 */
export const groups = pgTable("groups", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Name of the group, shown to organizer and participants
  name: varchar("name", { length: 255 }).notNull(),

  // Link to user
  ownerId: text("owner_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  // Whether drawing is already done (you can also just check drawnAt)
  isDrawn: boolean("is_drawn").notNull().default(false),

  // When the draw actually happened
  drawnAt: timestamp("drawn_at", { withTimezone: true }).defaultNow(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const groupsRelations = relations(groups, ({ one, many }) => ({
  participants: many(participants),
  owner: one(user, {
    fields: [groups.ownerId],
    references: [user.id],
  }),
}));

/**
 * A participant in a group.
 * Only a name is required.
 * Each participant gets a secret URL token to see their drawn person.
 */
export const participants = pgTable("participants", {
  id: uuid("id").primaryKey().defaultRandom(),

  groupId: uuid("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),

  // Display name, entered by organizer
  name: varchar("name", { length: 255 }).notNull(),

  // Secret token used in the participant URL
  viewToken: varchar("view_token", { length: 32 }).notNull().unique(),

  viewedAt: timestamp("viewed_at", { withTimezone: true }),

  /**
   * The participant this person has drawn.
   * Filled after the organizer triggers the draw.
   * Nullable until the draw is performed.
   */
  assignedParticipantId: uuid("assigned_participant_id").references(
    (): AnyPgColumn => participants.id,
    {
      onDelete: "set null",
    },
  ),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Define relations after participants is declared
export const participantsRelations = relations(
  participants,
  ({ one, many }) => ({
    group: one(groups, {
      fields: [participants.groupId],
      references: [groups.id],
    }),
    assignedParticipant: one(participants, {
      fields: [participants.assignedParticipantId],
      references: [participants.id],
    }),
    // Reverse relation: all people who drew this participant
    drawnBy: many(participants, {
      relationName: "assignedParticipant",
    }),
  }),
);
