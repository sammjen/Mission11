using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mission11.Models;

namespace Mission11.Controllers;

// [ApiController] enables automatic model validation and JSON responses.
// [Route] sets the base URL for this controller to /api/books.
[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    // The context is injected automatically by ASP.NET Core (dependency injection).
    // This gives us access to the database without creating it manually.
    private readonly BookstoreContext _context;

    public BooksController(BookstoreContext context)
    {
        _context = context;
    }

    // GET /api/books?page=1&pageSize=5&sortAscending=true&category=Biography
    // All parameters are optional — the defaults are used if not provided.
    [HttpGet]
    public async Task<IActionResult> GetBooks(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 5,
        [FromQuery] bool sortAscending = true,
        [FromQuery] string? category = null)
    {
        // Start with the full Books table as a queryable (no DB call yet).
        var query = _context.Books.AsQueryable();

        // If a category was specified, filter to only books in that category.
        if (!string.IsNullOrEmpty(category))
        {
            query = query.Where(b => b.Category == category);
        }

        // Apply sort order based on the sortAscending parameter.
        query = sortAscending
            ? query.OrderBy(b => b.Title)
            : query.OrderByDescending(b => b.Title);

        // Get the total number of books matching the filter (used to calculate page count).
        var totalCount = await query.CountAsync();

        // Skip past previous pages, then take only the current page's worth of books.
        var books = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        // Return both the books and the total count as a JSON object.
        return Ok(new { books, totalCount });
    }

    // GET /api/books/categories — returns the distinct list of categories for the filter UI.
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _context.Books
            .Select(b => b.Category)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();

        return Ok(categories);
    }

    // POST /api/books — adds a new book to the database.
    [HttpPost]
    public async Task<IActionResult> AddBook([FromBody] Book book)
    {
        _context.Books.Add(book);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetBooks), new { id = book.BookID }, book);
    }

    // PUT /api/books/{id} — updates an existing book by ID.
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBook(int id, [FromBody] Book book)
    {
        if (id != book.BookID)
            return BadRequest();

        _context.Entry(book).State = Microsoft.EntityFrameworkCore.EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE /api/books/{id} — deletes a book by ID.
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBook(int id)
    {
        var book = await _context.Books.FindAsync(id);
        if (book == null)
            return NotFound();

        _context.Books.Remove(book);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
