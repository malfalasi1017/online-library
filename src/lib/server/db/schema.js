import { pgTable, serial, text, integer, varchar, timestamp, boolean, date, pgEnum, uniqueIndex, foreignKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// User table - simplified
export const user = pgTable('user', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

// Author table - simplified
export const author = pgTable('author', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  bio: text('bio')
});

// Book table - with direct author reference
export const book = pgTable('book', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  authorId: integer('author_id').references(() => author.id),
  description: text('description'),
  coverImageUrl: varchar('cover_image_url', { length: 255 }),
  availableCopies: integer('available_copies').default(1)
});

// Loan table - simplified
export const loan = pgTable('loan', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => user.id),
  bookId: integer('book_id').notNull().references(() => book.id),
  borrowDate: timestamp('borrow_date').defaultNow().notNull(),
  returnDate: timestamp('return_date'),
  isReturned: boolean('is_returned').default(false)
});

// Define relations
export const userRelations = relations(user, ({ many }) => ({
  loans: many(loan)
}));

export const bookRelations = relations(book, ({ one, many }) => ({
  author: one(author, {
    fields: [book.authorId],
    references: [author.id]
  }),
  loans: many(loan)
}));

export const authorRelations = relations(author, ({ many }) => ({
  books: many(book)
}));
