<script>
  import { onMount } from 'svelte';
  
  // Books collection
  let books = $state([]);
  
  // Form state
  let title = $state('');
  let author = $state('');
  let description = $state('');
  let published = $state('');
  let pages = $state('');
  
  // UI state
  let editingId = $state(null);
  let isLoading = $state(false);
  let errorMessage = $state('');
  
  // Load books on mount
  onMount(async () => {
    await fetchBooks();
  });
  
  // Fetch all books
  async function fetchBooks() {
    try {
      isLoading = true;
      const response = await fetch('/api/books');
      if (!response.ok) throw new Error('Failed to fetch books');
      books = await response.json();
    } catch (error) {
      errorMessage = error.message;
    } finally {
      isLoading = false;
    }
  }
  
  // Add or update a book
  async function saveBook() {
    try {
      isLoading = true;
      errorMessage = '';
      
      const bookData = {
        title,
        author, 
        description, 
        published: published ? new Date(published).toISOString().split('T')[0] : null,
        pages: pages ? parseInt(pages) : null
      };
      
      let response;
      
      if (editingId) {
        // Update existing book
        response = await fetch(`/api/books/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookData)
        });
      } else {
        // Add new book
        response = await fetch('/api/books', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookData)
        });
      }
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save book');
      }
      
      // Refresh the book list
      await fetchBooks();
      resetForm();
      
    } catch (error) {
      errorMessage = error.message;
    } finally {
      isLoading = false;
    }
  }
  
  // Delete a book
  async function deleteBook(id) {
    if (!confirm('Are you sure you want to delete this book?')) return;
    
    try {
      isLoading = true;
      errorMessage = '';
      
      const response = await fetch(`/api/books/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete book');
      }
      
      // Refresh the book list
      await fetchBooks();
      
    } catch (error) {
      errorMessage = error.message;
    } finally {
      isLoading = false;
    }
  }
  
  // Edit a book - populate the form
  function editBook(book) {
    editingId = book.id;
    title = book.title;
    author = book.author || '';
    description = book.description || '';
    published = book.published || '';
    pages = book.pages?.toString() || '';
    
    // Scroll to form
    document.getElementById('bookForm').scrollIntoView({ behavior: 'smooth' });
  }
  
  // Reset form
  function resetForm() {
    editingId = null;
    title = '';
    author = '';
    description = '';
    published = '';
    pages = '';
  }
  
  // Form submit handler with preventDefault
  function handleSubmit(e) {
    e.preventDefault();
    saveBook();
  }
</script>

<div class="container mx-auto p-4 max-w-4xl">
  <header class="mb-8 text-center">
    <h1 class="text-3xl font-bold text-blue-700">Library Book Manager</h1>
    <p class="text-gray-600">Add, edit, and manage your book collection</p>
  </header>
  
  <!-- Error message -->
  {#if errorMessage}
    <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
      <p>{errorMessage}</p>
      <button class="underline ml-2" onclick={() => errorMessage = ''}>Dismiss</button>
    </div>
  {/if}
  
  <!-- Book form -->
  <div id="bookForm" class="bg-gray-50 p-6 rounded-lg shadow-md mb-8">
    <h2 class="text-xl font-bold mb-4">{editingId ? 'Edit' : 'Add'} Book</h2>
    <form onsubmit={handleSubmit} class="space-y-4">
      <div>
        <label for="title" class="block text-gray-700">Title *</label>
        <input 
          id="title" 
          type="text" 
          bind:value={title}
          required
          class="w-full p-2 border rounded"
        />
      </div>
      
      <div>
        <label for="author" class="block text-gray-700">Author</label>
        <input 
          id="author" 
          type="text" 
          bind:value={author}
          class="w-full p-2 border rounded"
        />
      </div>
      
      <div>
        <label for="description" class="block text-gray-700">Description</label>
        <textarea 
          id="description" 
          bind:value={description}
          class="w-full p-2 border rounded"
          rows="3"
        ></textarea>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="published" class="block text-gray-700">Published Date</label>
          <input 
            id="published" 
            type="date" 
            bind:value={published}
            class="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label for="pages" class="block text-gray-700">Pages</label>
          <input 
            id="pages" 
            type="number"
            min="1" 
            bind:value={pages}
            class="w-full p-2 border rounded"
          />
        </div>
      </div>
      
      <div class="flex justify-between">
        <div class="space-x-2">
          <button 
            type="submit" 
            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" 
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : editingId ? 'Update Book' : 'Add Book'}
          </button>
          
          {#if editingId}
            <button 
              type="button" 
              class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600" 
              onclick={resetForm}
            >
              Cancel
            </button>
          {/if}
        </div>
      </div>
    </form>
  </div>
  
  <!-- Books list -->
  <div>
    <h2 class="text-xl font-bold mb-4">Books List {#if isLoading && !editingId}(Loading...){/if}</h2>
    
    {#if books.length === 0 && !isLoading}
      <p class="text-center py-8 text-gray-500">No books found. Add your first book above!</p>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-100">
              <th class="p-3 text-left">Title</th>
              <th class="p-3 text-left">Author</th>
              <th class="p-3 text-left">Pages</th>
              <th class="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            {#each books as book (book.id)}
              <tr class="hover:bg-gray-50">
                <td class="p-3">
                  <div class="font-medium">{book.title}</div>
                  {#if book.published}
                    <div class="text-xs text-gray-500">{new Date(book.published).toLocaleDateString()}</div>
                  {/if}
                </td>
                <td class="p-3">{book.author || '-'}</td>
                <td class="p-3">{book.pages || '-'}</td>
                <td class="p-3 space-x-2">
                  <button 
                    class="text-blue-600 hover:underline" 
                    onclick={() => editBook(book)}
                  >
                    Edit
                  </button>
                  <button 
                    class="text-red-600 hover:underline" 
                    onclick={() => deleteBook(book.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>