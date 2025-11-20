using LMAPI.Models;
using LMAPI.Data;
using System.Linq;
using System;

namespace LMAPI.Repositories
{
    public class OrdemServicoRepository : IOrdemServicoRepository
    {
        private readonly JsonContext<OrdemServico> _context;
        private readonly IServicoRepository _servicoRepo;
        private readonly string _filePath = "Data/ordensServico.json";

        public OrdemServicoRepository(IServicoRepository servicoRepo)
        {
            _context = new JsonContext<OrdemServico>(_filePath);
            _servicoRepo = servicoRepo;
        }

        public List<OrdemServico> GetAll()
        {
            var ordens = _context.Load();
            // Carregar dados do Servico relacionado
            foreach (var ordem in ordens)
            {
                ordem.Servico = _servicoRepo.GetById(ordem.ServicoId);
            }
            return ordens;
        }

        public OrdemServico? GetById(int id)
        {
            var ordem = _context.Load().FirstOrDefault(o => o.Id == id);
            if (ordem != null)
            {
                ordem.Servico = _servicoRepo.GetById(ordem.ServicoId);
            }
            return ordem;
        }

        public List<OrdemServico> GetByStatus(string status)
        {
            var ordens = _context.Load().Where(o => o.Status == status).ToList();
            foreach (var ordem in ordens)
            {
                ordem.Servico = _servicoRepo.GetById(ordem.ServicoId);
            }
            return ordens;
        }

        public OrdemServico? GetByPlaca(string placa)
        {
            var servicos = _servicoRepo.GetAll();
            var servico = servicos.FirstOrDefault(s => 
                !string.IsNullOrEmpty(s.Placa) && s.Placa.Equals(placa, StringComparison.OrdinalIgnoreCase));
            
            if (servico == null) return null;

            var ordem = _context.Load().FirstOrDefault(o => o.ServicoId == servico.Id);
            if (ordem != null)
            {
                ordem.Servico = servico;
            }
            return ordem;
        }

        public void Add(OrdemServico ordemServico)
        {
            var ordens = _context.Load();
            ordemServico.Id = ordens.Count == 0 ? 1 : ordens.Max(o => o.Id) + 1;
            ordens.Add(ordemServico);
            _context.Save(ordens);
        }

        public bool UpdateStatus(int id, string status)
        {
            var ordens = _context.Load();
            var existing = ordens.FirstOrDefault(o => o.Id == id);
            if (existing == null) return false;

            existing.Status = status;
            _context.Save(ordens);
            return true;
        }

        public bool Delete(int id)
        {
            var ordens = _context.Load();
            var ordem = ordens.FirstOrDefault(o => o.Id == id);
            if (ordem == null) return false;

            // Remover também o serviço associado (para sumir da agenda)
            if (ordem.ServicoId != 0)
            {
                _servicoRepo.Delete(ordem.ServicoId);
            }

            ordens.Remove(ordem);
            _context.Save(ordens);
            return true;
        }
    }
}

