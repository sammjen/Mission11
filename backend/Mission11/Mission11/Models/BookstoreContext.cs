using Microsoft.EntityFrameworkCore;

namespace Mission11.Models;

// DbContext is EF Core's gateway to the database.
// It manages the connection and lets you query/save data using C# instead of raw SQL.
public class BookstoreContext : DbContext
{
    // The options (connection string, database provider, etc.) are passed in
    // from Program.cs via dependency injection.
    public BookstoreContext(DbContextOptions<BookstoreContext> options) : base(options) { }

    // DbSet represents the Books table. Querying this property is like writing
    // SELECT * FROM Books — EF Core translates it to SQL automatically.
    public DbSet<Book> Books { get; set; }
}
