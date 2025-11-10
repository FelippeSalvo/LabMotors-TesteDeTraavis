using Microsoft.AspNetCore.Mvc;
using LMAPI.Models;
using LMAPI.Repositories;

namespace LMAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PecaController : ControllerBase
    {
        private readonly IPecaRepository _repository;

        public PecaController(IPecaRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public IActionResult GetAll() => Ok(_repository.GetAll());

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var peca = _repository.GetById(id);
            return peca == null ? NotFound() : Ok(peca);
        }

        [HttpPost]
        public IActionResult Create(Peca peca)
        {
            _repository.Add(peca);
            return CreatedAtAction(nameof(GetById), new { id = peca.Id }, peca);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, Peca peca)
        {
            var updated = _repository.Update(id, peca);
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
