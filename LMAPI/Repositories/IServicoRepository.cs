using LMAPI.Models;
using System.Collections.Generic;

namespace LMAPI.Repositories
{
    public interface IServicoRepository
    {
        List<Servico> GetAll();
        Servico? GetById(int id);
        void Add(Servico servico);
        bool Update(int id, Servico servico);
        bool Delete(int id);
    }
}
