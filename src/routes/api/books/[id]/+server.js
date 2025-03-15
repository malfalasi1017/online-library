import { db } from '$lib/server/db';
import { book } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

// GET single book
export async function GET({ params }) {
  try {
    const bookItem = await db.query.book.findFirst({
      where: eq(book.id, parseInt(params.id))
    });
    
    if (!bookItem) {
      return json({ error: 'Book not found' }, { status: 404 });
    }
    
    return json(bookItem);
  } catch (error) {
    return json({ error: error.message }, { status: 500 });
  }
}

// PUT update book
export async function PUT({ params, request }) {
  try {
    const bookData = await request.json();
    const updated = await db.update(book)
      .set(bookData)
      .where(eq(book.id, parseInt(params.id)))
      .returning();
    
    if (!updated.length) {
      return json({ error: 'Book not found' }, { status: 404 });
    }
    
    return json(updated[0]);
  } catch (error) {
    return json({ error: error.message }, { status: 500 });
  }
}

// DELETE book
export async function DELETE({ params }) {
  try {
    const deleted = await db.delete(book)
      .where(eq(book.id, parseInt(params.id)))
      .returning();
    
    if (!deleted.length) {
      return json({ error: 'Book not found' }, { status: 404 });
    }
    
    return json({ success: true });
  } catch (error) {
    return json({ error: error.message }, { status: 500 });
  }
}