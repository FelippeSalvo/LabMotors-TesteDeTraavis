using LMAPI.Models;
using System.Collections.Generic;

namespace LMAPI.Repositories
{
    public interface IPecaRepository
    {
        List<Peca> GetAll();
        Peca? GetById(int id);
        void Add(Peca peca);
        bool Update(int id, Peca peca);
        bool Delete(int id);
    }
}
