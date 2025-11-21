using LMAPI.Models;
using LMAPI.Data;
using Supabase.Postgrest.Models;
using Supabase.Postgrest.Attributes;

namespace LMAPI.Repositories
{
    [Table("pecas")]
    public class PecaDb : BaseModel
    {
        [PrimaryKey("id")]
        public int Id { get; set; }
        
        [Column("nome")]
        public string Nome { get; set; } = string.Empty;
        
        [Column("codigo")]
        public string Codigo { get; set; } = string.Empty;
        
        [Column("quantidade")]
        public int Quantidade { get; set; }
        
        [Column("preco_unitario")]
        public decimal PrecoUnitario { get; set; }
    }

    public class PecaRepository : IPecaRepository
    {
        private readonly SupabaseService _supabase;

        public PecaRepository(SupabaseService supabase)
        {
            _supabase = supabase;
        }

        public async Task<List<Peca>> GetAllAsync()
        {
            var response = await _supabase.Client
                .From<PecaDb>()
                .Get();
            
            return response.Models.Select(ConvertToPeca).ToList();
        }

        public List<Peca> GetAll()
        {
            return GetAllAsync().GetAwaiter().GetResult();
        }

        public async Task<Peca?> GetByIdAsync(int id)
        {
            var response = await _supabase.Client
                .From<PecaDb>()
                .Where(x => x.Id == id)
                .Single();
            
            return response == null ? null : ConvertToPeca(response);
        }

        public Peca? GetById(int id)
        {
            return GetByIdAsync(id).GetAwaiter().GetResult();
        }

        public async Task AddAsync(Peca peca)
        {
            var pecaDb = ConvertToPecaDb(peca);
            await _supabase.Client
                .From<PecaDb>()
                .Insert(pecaDb);
        }

        public void Add(Peca peca)
        {
            AddAsync(peca).GetAwaiter().GetResult();
        }

        public async Task<bool> UpdateAsync(int id, Peca peca)
        {
            try
            {
                var pecaDb = ConvertToPecaDb(peca);
                pecaDb.Id = id;
                
                await _supabase.Client
                    .From<PecaDb>()
                    .Where(x => x.Id == id)
                    .Update(pecaDb);
                
                return true;
            }
            catch
            {
                return false;
            }
        }

        public bool Update(int id, Peca peca)
        {
            return UpdateAsync(id, peca).GetAwaiter().GetResult();
        }

        public async Task<bool> DeleteAsync(int id)
        {
            try
            {
                await _supabase.Client
                    .From<PecaDb>()
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

        private Peca ConvertToPeca(PecaDb db)
        {
            return new Peca
            {
                Id = db.Id,
                Nome = db.Nome,
                Codigo = db.Codigo,
                Quantidade = db.Quantidade,
                PrecoUnitario = db.PrecoUnitario
            };
        }

        private PecaDb ConvertToPecaDb(Peca peca)
        {
            return new PecaDb
            {
                Id = peca.Id,
                Nome = peca.Nome,
                Codigo = peca.Codigo,
                Quantidade = peca.Quantidade,
                PrecoUnitario = peca.PrecoUnitario
            };
        }
    }
}
