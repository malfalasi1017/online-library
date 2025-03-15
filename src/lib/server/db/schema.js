import { pgTable, serial, text, integer, varchar, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';



// Book table 
export const book = pgTable('book', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  author: text('author'),
  description: text('description'),
  published: date('published'),
  pages: integer('pages'),
});






