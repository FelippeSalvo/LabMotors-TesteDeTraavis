using LMAPI.Models;
using System.Collections.Generic;

namespace LMAPI.Repositories
{
    public interface IClienteRepository
    {
        List<Cliente> GetAll();
        Cliente? GetById(int id);
        void Add(Cliente cliente);
        bool Update(int id, Cliente cliente);
        bool Delete(int id);
    }
}
