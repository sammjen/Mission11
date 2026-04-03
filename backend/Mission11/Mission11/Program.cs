using Microsoft.EntityFrameworkCore;
using Mission11.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register BookstoreContext with the SQLite provider.
// The connection string ("Data Source=Bookstore.sqlite") is read from appsettings.json.
builder.Services.AddDbContext<BookstoreContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("BookstoreConnection")));

// Configure CORS (Cross-Origin Resource Sharing).
// Browsers block requests between different ports by default. Since the React app
// runs on port 5173 and the API runs on port 7023, we must explicitly allow it.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("https://localhost:5173", "http://localhost:5173", "https://mango-beach-02c27d91e.6.azurestaticapps.net")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Apply the CORS policy we defined above — must come before UseAuthorization.
app.UseCors("AllowReactApp");

app.UseAuthorization();

app.MapControllers();

app.Run();
