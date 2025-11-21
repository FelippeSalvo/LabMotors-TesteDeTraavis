using LMAPI.Models;
using LMAPI.Data;
using Supabase.Postgrest.Models;
using Supabase.Postgrest.Attributes;
using Supabase.Postgrest;
using System;

namespace LMAPI.Repositories
{
    [Table("clientes")]
    public class ClienteDb : BaseModel
    {
        [PrimaryKey("id")]
        public int Id { get; set; }
        
        [Column("nome")]
        public string Nome { get; set; } = string.Empty;
        
        [Column("telefone")]
        public string Telefone { get; set; } = string.Empty;
        
        [Column("email")]
        public string Email { get; set; } = string.Empty;
        
        [Column("endereco")]
        public string? Endereco { get; set; }
        
        [Column("senha")]
        public string Senha { get; set; } = string.Empty;
        
        [Column("admin")]
        public bool Admin { get; set; } = false;
    }

    public class ClienteRepository : IClienteRepository
    {
        private readonly SupabaseService _supabase;

        public ClienteRepository(SupabaseService supabase)
        {
            _supabase = supabase;
        }

        public async Task<List<Cliente>> GetAllAsync()
        {
            try
            {
                var response = await _supabase.Client
                    .From<ClienteDb>()
                    .Get();
                
                return response.Models.Select(ConvertToCliente).ToList();
            }
            catch (Exception ex)
            {
                // Log do erro (em produção, usar ILogger)
                Console.WriteLine($"Erro ao buscar clientes: {ex.Message}");
                throw;
            }
        }

        public List<Cliente> GetAll()
        {
            try
            {
                return GetAllAsync().GetAwaiter().GetResult();
            }
            catch
            {
                return new List<Cliente>();
            }
        }

        public async Task<Cliente?> GetByIdAsync(int id)
        {
            try
            {
                var response = await _supabase.Client
                    .From<ClienteDb>()
                    .Where(x => x.Id == id)
                    .Single();
                
                return response == null ? null : ConvertToCliente(response);
            }
            catch
            {
                return null;
            }
        }

        public Cliente? GetById(int id)
        {
            try
            {
                return GetByIdAsync(id).GetAwaiter().GetResult();
            }
            catch
            {
                return null;
            }
        }

        public async Task AddAsync(Cliente cliente)
        {
            try
            {
                var clienteDb = ConvertToClienteDb(cliente);
                var response = await _supabase.Client
                    .From<ClienteDb>()
                    .Insert(clienteDb);
                
                var inserted = response.Models.FirstOrDefault();
                if (inserted != null)
                {
                    cliente.Id = inserted.Id;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao adicionar cliente: {ex.Message}");
                throw;
            }
        }

        public void Add(Cliente cliente)
        {
            try
            {
                AddAsync(cliente).GetAwaiter().GetResult();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao adicionar cliente (sync): {ex.Message}");
                throw;
            }
        }

        public async Task<bool> UpdateAsync(int id, Cliente cliente)
        {
            try
            {
                var clienteDb = ConvertToClienteDb(cliente);
                clienteDb.Id = id;
                
                await _supabase.Client
                    .From<ClienteDb>()
                    .Where(x => x.Id == id)
                    .Update(clienteDb);
                
                return true;
            }
            catch
            {
                return false;
            }
        }

        public bool Update(int id, Cliente cliente)
        {
            return UpdateAsync(id, cliente).GetAwaiter().GetResult();
        }

        public async Task<bool> DeleteAsync(int id)
        {
            try
            {
                await _supabase.Client
                    .From<ClienteDb>()
                    .Where(x => x.Id == id)
                    .Delete();
                
                return true;
            }
            catch
            {
                return false;
            }
        }

        public bool Delete(int id)
        {
            return DeleteAsync(id).GetAwaiter().GetResult();
        }

        private Cliente ConvertToCliente(ClienteDb db)
        {
            return new Cliente
            {
                Id = db.Id,
                Nome = db.Nome,
                Telefone = db.Telefone,
                Email = db.Email,
                Endereco = db.Endereco ?? string.Empty,
                Senha = db.Senha,
                Admin = db.Admin
            };
        }

        private ClienteDb ConvertToClienteDb(Cliente cliente)
        {
            return new ClienteDb
            {
                Id = cliente.Id,
                Nome = cliente.Nome,
                Telefone = cliente.Telefone,
                Email = cliente.Email,
                Endereco = cliente.Endereco,
                Senha = cliente.Senha,
                Admin = cliente.Admin
            };
        }
    }
}
