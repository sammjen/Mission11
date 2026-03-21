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

    // GET /api/books?page=1&pageSize=5&sortAscending=true
    // All three parameters are optional — the defaults are used if not provided.
    [HttpGet]
    public async Task<IActionResult> GetBooks(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 5,
        [FromQuery] bool sortAscending = true)
    {
        // Start with the full Books table as a queryable (no DB call yet).
        var query = _context.Books.AsQueryable();

        // Apply sort order based on the sortAscending parameter.
        query = sortAscending
            ? query.OrderBy(b => b.Title)
            : query.OrderByDescending(b => b.Title);

        // Get the total number of books (used by the frontend to calculate page count).
        var totalCount = await query.CountAsync();

        // Skip past previous pages, then take only the current page's worth of books.
        // e.g. page 2 with pageSize 5: skip 5, take 5.
        var books = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        // Return both the books and the total count as a JSON object.
        return Ok(new { books, totalCount });
    }
}
