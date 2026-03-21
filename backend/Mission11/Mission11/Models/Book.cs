namespace Mission11.Models;

// This class represents a single row in the Books table.
// EF Core uses these properties to map database columns to C# fields.
public class Book
{
    public int BookID { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string Publisher { get; set; } = string.Empty;
    public string ISBN { get; set; } = string.Empty;
    public string Classification { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int PageCount { get; set; }
    public decimal Price { get; set; }
}
