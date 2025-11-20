using Microsoft.AspNetCore.Mvc;
using LMAPI.Models;
using LMAPI.Repositories;

namespace LMAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdemServicoController : ControllerBase
    {
        private readonly IOrdemServicoRepository _repository;

        public OrdemServicoController(IOrdemServicoRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var ordens = _repository.GetAll();
            return Ok(ordens);
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var ordem = _repository.GetById(id);
            return ordem == null ? NotFound() : Ok(ordem);
        }

        [HttpGet("status/{status}")]
        public IActionResult GetByStatus(string status)
        {
            var ordens = _repository.GetByStatus(status);
            return Ok(ordens);
        }

        [HttpGet("placa/{placa}")]
        public IActionResult GetByPlaca(string placa)
        {
            var ordem = _repository.GetByPlaca(placa);
            return ordem == null ? NotFound() : Ok(ordem);
        }

        [HttpPut("{id}/status")]
        public IActionResult UpdateStatus(int id, [FromBody] UpdateStatusRequest request)
        {
            var updated = _repository.UpdateStatus(id, request.Status);
            return updated ? Ok(new { message = "Status atualizado com sucesso" }) : NotFound();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var deleted = _repository.Delete(id);
            return deleted ? NoContent() : NotFound();
        }
    }

    public class UpdateStatusRequest
    {
        public string Status { get; set; } = string.Empty;
    }
}

