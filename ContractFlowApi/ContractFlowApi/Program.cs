using ContractsMvc.Data;
using ContractsMvc.Services;
using Microsoft.EntityFrameworkCore;
using System.IO;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var connectionString = builder.Configuration.GetConnectionString("ContractsDb") ?? "Data Source=contracts.db";

builder.Services.AddDbContext<ContractsDbContext>(opt =>
{
    if (!connectionString.Contains("Data Source="))
    {
        opt.UseSqlite(connectionString);
        return;
    }

    var dataSource = connectionString.Split('=', 2)[1].Trim();
    if (!Path.IsPathFullyQualified(dataSource))
    {
        var absolutePath = Path.Combine(builder.Environment.ContentRootPath, dataSource);
        opt.UseSqlite($"Data Source={absolutePath}");
    }
    else
    {
        opt.UseSqlite(connectionString);
    }
});

builder.Services.AddScoped<ContractService>();
builder.Services.AddScoped<SupplierService>();
builder.Services.AddScoped<OrgUnitService>();
builder.Services.AddScoped<ObligationService>();
builder.Services.AddScoped<InspectionService>();
builder.Services.AddScoped<EvidenceService>();
builder.Services.AddScoped<AttachmentService>();

builder.Services.AddSingleton<AlertsHostedService>();
builder.Services.AddHostedService(sp => sp.GetRequiredService<AlertsHostedService>());

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ContractsDbContext>();
    await db.Database.EnsureCreatedAsync();
    await SeedData.InitializeAsync(db);
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.MapControllers();
app.Run();
