using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using echolog.server.Data;
using echolog.server.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// ──────────────────────────────────────────────────────────────
// 📦 Configuration
// ──────────────────────────────────────────────────────────────

const string dbFileName = "echolog.db";
var dbPath = Path.Combine(AppContext.BaseDirectory, dbFileName);
var connectionString = $"Data Source={dbPath}";

// 🔐 JWT Secret (TODO: move to secure config later)
var jwtKey = "de80f155e9cc532a9b5f3c61bdfa289e9505f72cb26ad15463176c4713c35b9bd523d1c8c4ad7a2d282cc72e6cfd88076c966f51a7736ead7227762659a2757fe1950ec4e40cbff361cf651732a79cffa90909493368a3bcbbb3dc5bfba182e0cf94b28ae94e823658bd5ca22d9de4e5822f8ba97d2249e46f49600310b50b7bd03360bd07fff59d9a14e28deb5e2b93a523b1902c76afb59e7d489c52020a30f005c43c769e6695f5963b34ec0882a894f709c812be84076af16ae7f713ba7def809c621b3d69562e0ba63e7e0a87353a7f89f56282eee16ed7a0ea679dff0cb9de9cb5207c2a26f6f764b7b0dde0eae24043f4a7303c01ccbbd192744dee27";
var keyBytes = Encoding.UTF8.GetBytes(jwtKey);

// ──────────────────────────────────────────────────────────────
// 🧱 Services
// ──────────────────────────────────────────────────────────────

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(connectionString));

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(keyBytes)
    };
});

builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserContextService, UserContextService>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddCors(opt =>
{
    opt.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

// ──────────────────────────────────────────────────────────────
// 📚 Swagger Setup (Dev Only)
// ──────────────────────────────────────────────────────────────

if (builder.Environment.IsDevelopment())
{
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new() { Title = "EchoLog API", Version = "v1" });

        c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.ApiKey,
            Scheme = "Bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "Enter 'Bearer' followed by your token."
        });

        c.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme {
                    Reference = new OpenApiReference {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                Array.Empty<string>()
            }
        });
    });
}

builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.ListenLocalhost(5000, listenOptions =>
    {
        listenOptions.UseHttps(); // Use dev cert
    });
});

var app = builder.Build();

// ──────────────────────────────────────────────────────────────
// 🛠 Runtime: DB Migration + Port Injection
// ──────────────────────────────────────────────────────────────

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate();

    var portSetting = db.AppSettings.FirstOrDefault(s => s.Key == "ApiPort");
    var port = portSetting?.Value ?? "5000";
    app.Urls.Add($"http://*:{port}");
}

// ──────────────────────────────────────────────────────────────
// 🚀 App Middleware
// ──────────────────────────────────────────────────────────────

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
