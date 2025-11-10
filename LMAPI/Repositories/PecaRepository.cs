using LMAPI.Models;
using LMAPI.Data;

namespace LMAPI.Repositories
{
    public class PecaRepository : IPecaRepository
    {
        private readonly JsonContext<Peca> _context;
        private readonly string _filePath = "Data/pecas.json";

        public PecaRepository()
        {
            _context = new JsonContext<Peca>(_filePath);
        }

        public List<Peca> GetAll() => _context.Load();

        public Peca? GetById(int id) => _context.Load().FirstOrDefault(p => p.Id == id);

        public void Add(Peca peca)
        {
            var pecas = _context.Load();
            peca.Id = pecas.Count == 0 ? 1 : pecas.Max(p => p.Id) + 1;
            pecas.Add(peca);
            _context.Save(pecas);
        }

        public bool Update(int id, Peca peca)
        {
            var pecas = _context.Load();
            var existing = pecas.FirstOrDefault(p => p.Id == id);
            if (existing == null) return false;

            existing.Nome = peca.Nome;
            existing.Codigo = peca.Codigo;
            existing.PrecoUnitario = peca.PrecoUnitario;
            existing.Quantidade = peca.Quantidade;

            _context.Save(pecas);
            return true;
        }

        public bool Delete(int id)
        {
            var pecas = _context.Load();
            var peca = pecas.FirstOrDefault(p => p.Id == id);
            if (peca == null) return false;

            pecas.Remove(peca);
            _context.Save(pecas);
            return true;
        }
    }
}
