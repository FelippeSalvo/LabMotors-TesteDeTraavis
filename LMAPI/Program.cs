using LMAPI.Services;
using LMAPI.Repositories;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Repos de paus do bresaks sdo travis
builder.Services.AddSingleton<IClienteRepository, ClienteRepository>();
builder.Services.AddSingleton<IPecaRepository, PecaRepository>();
builder.Services.AddSingleton<IServicoRepository, ServicoRepository>();
builder.Services.AddSingleton<IOrdemServicoRepository>(sp => 
    new OrdemServicoRepository(sp.GetRequiredService<IServicoRepository>()));

// Serviços
// pra q tantos codigos, se a vida n é programada
// e as melhores coisas n tem logika
//4 da manha ja KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK
builder.Services.AddSingleton<EstoqueService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseCors("AllowAll");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapControllers();

app.Run();
