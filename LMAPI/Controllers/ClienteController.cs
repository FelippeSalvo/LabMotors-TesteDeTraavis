using Microsoft.AspNetCore.Mvc;
using LMAPI.Models;
using LMAPI.Repositories;

namespace LMAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClienteController : ControllerBase
    {
        private readonly IClienteRepository _repository;

        public ClienteController(IClienteRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public IActionResult GetAll() => Ok(_repository.GetAll());

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var cliente = _repository.GetById(id);
            return cliente == null ? NotFound() : Ok(cliente);
        }

        [HttpPost]
        public IActionResult Create(Cliente cliente)
        {
            _repository.Add(cliente);
            return CreatedAtAction(nameof(GetById), new { id = cliente.Id }, cliente);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, Cliente cliente)
        {
            var updated = _repository.Update(id, cliente);
            return updated ? NoContent() : NotFound();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var deleted = _repository.Delete(id);
            return deleted ? NoContent() : NotFound();
        }
    }
}
