using LMAPI.Models;
using LMAPI.Data;

namespace LMAPI.Repositories
{
    public class ServicoRepository : IServicoRepository
    {
        private readonly JsonContext<Servico> _context;
        private readonly string _filePath = "Data/servicos.json";

        public ServicoRepository()
        {
            _context = new JsonContext<Servico>(_filePath);
        }

        public List<Servico> GetAll() => _context.Load();

        public Servico? GetById(int id) => _context.Load().FirstOrDefault(s => s.Id == id);

        public void Add(Servico servico)
        {
            var servicos = _context.Load();
            servico.Id = servicos.Count == 0 ? 1 : servicos.Max(s => s.Id) + 1;
            servicos.Add(servico);
            _context.Save(servicos);
        }

        public bool Update(int id, Servico servico)
        {
            var servicos = _context.Load();
            var existing = servicos.FirstOrDefault(s => s.Id == id);
            if (existing == null) return false;

            existing.Descricao = servico.Descricao;
            existing.ClienteId = servico.ClienteId;
            existing.ValorTotal = servico.ValorTotal;
            existing.PecasUsadas = servico.PecasUsadas;

            _context.Save(servicos);
            return true;
        }

        public bool Delete(int id)
        {
            var servicos = _context.Load();
            var servico = servicos.FirstOrDefault(s => s.Id == id);
            if (servico == null) return false;

            servicos.Remove(servico);
            _context.Save(servicos);
            return true;
        }
    }
}
