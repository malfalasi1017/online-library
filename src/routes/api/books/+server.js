import { db } from '$lib/server/db';
import { book } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';

// Get all books
export async function GET() {
    try {
        // Remove the with: { author: true } since author is a text field, not a relation
        const books = await db.query.book.findMany();
        return json(books);
    } catch (error) {
        return json({ error: error.message }, { status: 500 });
    }
}

// Post new book
export async function POST({ request }) {
    try {
        const bookData = await request.json();
        const newBook = await db.insert(book).values(bookData).returning();
        return json(newBook[0], { status: 201 });
    } catch (error) {
        return json({ error: error.message }, { status: 500 });
    }
}

