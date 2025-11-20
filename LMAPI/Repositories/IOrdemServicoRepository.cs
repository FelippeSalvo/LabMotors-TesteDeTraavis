using LMAPI.Models;
using System.Collections.Generic;

namespace LMAPI.Repositories
{
    public interface IOrdemServicoRepository
    {
        List<OrdemServico> GetAll();
        OrdemServico? GetById(int id);
        List<OrdemServico> GetByStatus(string status);
        OrdemServico? GetByPlaca(string placa);
        void Add(OrdemServico ordemServico);
        bool UpdateStatus(int id, string status);
        bool Delete(int id);
    }
}

