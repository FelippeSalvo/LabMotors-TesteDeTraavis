using LMAPI.Models;
using LMAPI.Data;
using Supabase.Postgrest.Models;
using Supabase.Postgrest.Attributes;
using System.Linq;
using System;

namespace LMAPI.Repositories
{
    [Table("ordens_servico")]
    public class OrdemServicoDb : BaseModel
    {
        [PrimaryKey("id")]
        public int Id { get; set; }
        
        [Column("servico_id")]
        public int ServicoId { get; set; }
        
        [Column("data_emissao")]
        public DateTime DataEmissao { get; set; }
        
        [Column("status")]
        public string Status { get; set; } = "Aguardando";
    }

    public class OrdemServicoRepository : IOrdemServicoRepository
    {
        private readonly SupabaseService _supabase;
        private readonly IServicoRepository _servicoRepo;

        public OrdemServicoRepository(SupabaseService supabase, IServicoRepository servicoRepo)
        {
            _supabase = supabase;
            _servicoRepo = servicoRepo;
        }

        public async Task<List<OrdemServico>> GetAllAsync()
        {
            var response = await _supabase.Client
                .From<OrdemServicoDb>()
                .Get();
            
            var ordens = new List<OrdemServico>();
            
            foreach (var ordemDb in response.Models)
            {
                var ordem = ConvertToOrdemServico(ordemDb);
                ordem.Servico = _servicoRepo.GetById(ordem.ServicoId);
                ordens.Add(ordem);
            }
            
            return ordens;
        }

        public List<OrdemServico> GetAll()
        {
            return GetAllAsync().GetAwaiter().GetResult();
        }

        public async Task<OrdemServico?> GetByIdAsync(int id)
        {
            var response = await _supabase.Client
                .From<OrdemServicoDb>()
                .Where(x => x.Id == id)
                .Single();
            
            if (response == null) return null;
            
            var ordem = ConvertToOrdemServico(response);
            ordem.Servico = _servicoRepo.GetById(ordem.ServicoId);
            return ordem;
        }

        public OrdemServico? GetById(int id)
        {
            return GetByIdAsync(id).GetAwaiter().GetResult();
        }

        public async Task<List<OrdemServico>> GetByStatusAsync(string status)
        {
            var response = await _supabase.Client
                .From<OrdemServicoDb>()
                .Where(x => x.Status == status)
                .Get();
            
            var ordens = new List<OrdemServico>();
            
            foreach (var ordemDb in response.Models)
            {
                var ordem = ConvertToOrdemServico(ordemDb);
                ordem.Servico = _servicoRepo.GetById(ordem.ServicoId);
                ordens.Add(ordem);
            }
            
            return ordens;
        }

        public List<OrdemServico> GetByStatus(string status)
        {
            return GetByStatusAsync(status).GetAwaiter().GetResult();
        }

        public async Task<OrdemServico?> GetByPlacaAsync(string placa)
        {
            var servicos = _servicoRepo.GetAll();
            var servico = servicos.FirstOrDefault(s => 
                !string.IsNullOrEmpty(s.Placa) && s.Placa.Equals(placa, StringComparison.OrdinalIgnoreCase));
            
            if (servico == null) return null;

            var response = await _supabase.Client
                .From<OrdemServicoDb>()
                .Where(x => x.ServicoId == servico.Id)
                .Single();
            
            if (response == null) return null;
            
            var ordem = ConvertToOrdemServico(response);
            ordem.Servico = servico;
            return ordem;
        }

        public OrdemServico? GetByPlaca(string placa)
        {
            return GetByPlacaAsync(placa).GetAwaiter().GetResult();
        }

        public async Task AddAsync(OrdemServico ordemServico)
        {
            var ordemDb = ConvertToOrdemServicoDb(ordemServico);
            var response = await _supabase.Client
                .From<OrdemServicoDb>()
                .Insert(ordemDb);
            
            var inserted = response.Models.FirstOrDefault();
            if (inserted != null)
            {
                ordemServico.Id = inserted.Id;
            }
        }

        public void Add(OrdemServico ordemServico)
        {
            AddAsync(ordemServico).GetAwaiter().GetResult();
        }

        public async Task<bool> UpdateStatusAsync(int id, string status)
        {
            try
            {
                // Buscar a ordem atual
                var ordemAtual = await _supabase.Client
                    .From<OrdemServicoDb>()
                    .Where(x => x.Id == id)
                    .Single();
                
                if (ordemAtual == null) return false;
                
                ordemAtual.Status = status;
                
                await _supabase.Client
                    .From<OrdemServicoDb>()
                    .Where(x => x.Id == id)
                    .Update(ordemAtual);
                
                return true;
            }
            catch
            {
                return false;
            }
        }

        public bool UpdateStatus(int id, string status)
        {
            return UpdateStatusAsync(id, status).GetAwaiter().GetResult();
        }

        public async Task<bool> DeleteAsync(int id)
        {
            try
            {
                // Buscar a ordem para pegar o ServicoId
                var ordem = await GetByIdAsync(id);
                if (ordem == null) return false;

                // Remover também o serviço associado (para sumir da agenda)
                if (ordem.ServicoId != 0)
                {
                    _servicoRepo.Delete(ordem.ServicoId);
                }

                await _supabase.Client
                    .From<OrdemServicoDb>()
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

        private OrdemServico ConvertToOrdemServico(OrdemServicoDb db)
        {
            return new OrdemServico
            {
                Id = db.Id,
                ServicoId = db.ServicoId,
                DataEmissao = db.DataEmissao,
                Status = db.Status
            };
        }

        private OrdemServicoDb ConvertToOrdemServicoDb(OrdemServico ordem)
        {
            return new OrdemServicoDb
            {
                Id = ordem.Id,
                ServicoId = ordem.ServicoId,
                DataEmissao = ordem.DataEmissao,
                Status = ordem.Status
            };
        }
    }
}


