using LMAPI.Models;
using LMAPI.Data;

namespace LMAPI.Repositories
{
    public class ClienteRepository : IClienteRepository
    {
        private readonly JsonContext<Cliente> _context;
        private readonly string _filePath = "Data/clientes.json";

        public ClienteRepository()
        {
            _context = new JsonContext<Cliente>(_filePath);
        }

        public List<Cliente> GetAll() => _context.Load();

        public Cliente? GetById(int id) => _context.Load().FirstOrDefault(c => c.Id == id);

        public void Add(Cliente cliente)
        {
            var clientes = _context.Load();
            cliente.Id = clientes.Count == 0 ? 1 : clientes.Max(c => c.Id) + 1;
            clientes.Add(cliente);
            _context.Save(clientes);
        }

        public bool Update(int id, Cliente cliente)
        {
            var clientes = _context.Load();
            var existing = clientes.FirstOrDefault(c => c.Id == id);
            if (existing == null) return false;

            existing.Nome = cliente.Nome;
            existing.Telefone = cliente.Telefone;
            existing.Email = cliente.Email;
            existing.Endereco = cliente.Endereco;
            existing.Senha = cliente.Senha;
            existing.Admin = cliente.Admin;

            _context.Save(clientes);
            return true;
        }

        public bool Delete(int id)
        {
            var clientes = _context.Load();
            var cliente = clientes.FirstOrDefault(c => c.Id == id);
            if (cliente == null) return false;

            clientes.Remove(cliente);
            _context.Save(clientes);
            return true;
        }
    }
}
