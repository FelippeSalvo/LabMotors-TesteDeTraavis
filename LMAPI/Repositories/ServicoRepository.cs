using LMAPI.Models;
using LMAPI.Data;
using Supabase.Postgrest.Models;
using Supabase.Postgrest.Attributes;
using System.Text.Json;

namespace LMAPI.Repositories
{
    [Table("servicos")]
    public class ServicoDb : BaseModel
    {
        [PrimaryKey("id")]
        public int Id { get; set; }
        
        [Column("descricao")]
        public string? Descricao { get; set; }
        
        [Column("cliente_id")]
        public int? ClienteId { get; set; }
        
        [Column("valor_total")]
        public decimal ValorTotal { get; set; }
        
        [Column("cliente")]
        public string? Cliente { get; set; }
        
        [Column("tipo_servico")]
        public string? TipoServico { get; set; }
        
        [Column("moto")]
        public string? Moto { get; set; }
        
        [Column("placa")]
        public string? Placa { get; set; }
        
        [Column("telefone")]
        public string? Telefone { get; set; }
        
        [Column("data")]
        public DateTime? Data { get; set; }
        
        [Column("horario")]
        public string? Horario { get; set; }
        
        [Column("observacoes")]
        public string? Observacoes { get; set; }
    }

    [Table("pecas_usadas")]
    public class PecaUsadaDb : BaseModel
    {
        [PrimaryKey("id")]
        public int Id { get; set; }
        
        [Column("servico_id")]
        public int ServicoId { get; set; }
        
        [Column("peca_id")]
        public int PecaId { get; set; }
        
        [Column("quantidade")]
        public int Quantidade { get; set; }
    }

    public class ServicoRepository : IServicoRepository
    {
        private readonly SupabaseService _supabase;

        public ServicoRepository(SupabaseService supabase)
        {
            _supabase = supabase;
        }

        public async Task<List<Servico>> GetAllAsync()
        {
            var response = await _supabase.Client
                .From<ServicoDb>()
                .Get();
            
            var servicos = new List<Servico>();
            
            foreach (var servicoDb in response.Models)
            {
                var servico = ConvertToServico(servicoDb);
                servico.PecasUsadas = await LoadPecasUsadasAsync(servico.Id);
                servicos.Add(servico);
            }
            
            return servicos;
        }

        public List<Servico> GetAll()
        {
            return GetAllAsync().GetAwaiter().GetResult();
        }

        public async Task<Servico?> GetByIdAsync(int id)
        {
            var response = await _supabase.Client
                .From<ServicoDb>()
                .Where(x => x.Id == id)
                .Single();
            
            if (response == null) return null;
            
            var servico = ConvertToServico(response);
            servico.PecasUsadas = await LoadPecasUsadasAsync(id);
            return servico;
        }

        public Servico? GetById(int id)
        {
            return GetByIdAsync(id).GetAwaiter().GetResult();
        }

        public async Task AddAsync(Servico servico)
        {
            var servicoDb = ConvertToServicoDb(servico);
            var response = await _supabase.Client
                .From<ServicoDb>()
                .Insert(servicoDb);
            
            var inserted = response.Models.FirstOrDefault();
            if (inserted != null)
            {
                servico.Id = inserted.Id;
                
                // Salvar peças usadas
                if (servico.PecasUsadas != null && servico.PecasUsadas.Count > 0)
                {
                    await SavePecasUsadasAsync(servico.Id, servico.PecasUsadas);
                }
            }
        }

        public void Add(Servico servico)
        {
            AddAsync(servico).GetAwaiter().GetResult();
        }

        public async Task<bool> UpdateAsync(int id, Servico servico)
        {
            try
            {
                var servicoDb = ConvertToServicoDb(servico);
                servicoDb.Id = id;
                
                await _supabase.Client
                    .From<ServicoDb>()
                    .Where(x => x.Id == id)
                    .Update(servicoDb);
                
                // Atualizar peças usadas
                await DeletePecasUsadasAsync(id);
                if (servico.PecasUsadas != null && servico.PecasUsadas.Count > 0)
                {
                    await SavePecasUsadasAsync(id, servico.PecasUsadas);
                }
                
                return true;
            }
            catch
            {
                return false;
            }
        }

        public bool Update(int id, Servico servico)
        {
            return UpdateAsync(id, servico).GetAwaiter().GetResult();
        }

        public async Task<bool> DeleteAsync(int id)
        {
            try
            {
                // Deletar peças usadas primeiro (cascade no banco também faz isso)
                await DeletePecasUsadasAsync(id);
                
                await _supabase.Client
                    .From<ServicoDb>()
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

        private async Task<List<PecaUsada>> LoadPecasUsadasAsync(int servicoId)
        {
            var response = await _supabase.Client
                .From<PecaUsadaDb>()
                .Where(x => x.ServicoId == servicoId)
                .Get();
            
            return response.Models.Select(pu => new PecaUsada
            {
                PecaId = pu.PecaId,
                Quantidade = pu.Quantidade
            }).ToList();
        }

        private async Task SavePecasUsadasAsync(int servicoId, List<PecaUsada> pecasUsadas)
        {
            var pecasUsadasDb = pecasUsadas.Select(pu => new PecaUsadaDb
            {
                ServicoId = servicoId,
                PecaId = pu.PecaId,
                Quantidade = pu.Quantidade
            }).ToList();
            
            await _supabase.Client
                .From<PecaUsadaDb>()
                .Insert(pecasUsadasDb);
        }

        private async Task DeletePecasUsadasAsync(int servicoId)
        {
            await _supabase.Client
                .From<PecaUsadaDb>()
                .Where(x => x.ServicoId == servicoId)
                .Delete();
        }

        private Servico ConvertToServico(ServicoDb db)
        {
            return new Servico
            {
                Id = db.Id,
                Descricao = db.Descricao ?? string.Empty,
                ClienteId = db.ClienteId ?? 0,
                ValorTotal = db.ValorTotal,
                Cliente = db.Cliente,
                TipoServico = db.TipoServico,
                Moto = db.Moto,
                Placa = db.Placa,
                Telefone = db.Telefone,
                Data = db.Data,
                Horario = db.Horario,
                Observacoes = db.Observacoes,
                PecasUsadas = new List<PecaUsada>()
            };
        }

        private ServicoDb ConvertToServicoDb(Servico servico)
        {
            return new ServicoDb
            {
                Id = servico.Id,
                Descricao = servico.Descricao,
                ClienteId = servico.ClienteId == 0 ? null : servico.ClienteId,
                ValorTotal = servico.ValorTotal,
                Cliente = servico.Cliente,
                TipoServico = servico.TipoServico,
                Moto = servico.Moto,
                Placa = servico.Placa,
                Telefone = servico.Telefone,
                Data = servico.Data,
                Horario = servico.Horario,
                Observacoes = servico.Observacoes
            };
        }
    }
}
